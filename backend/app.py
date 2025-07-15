from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModel, AutoProcessor
import torch
from PIL import Image
import io
import cv2
import numpy as np
import os
from insightface.app import FaceAnalysis
from insightface.utils import face_align
import requests
from datetime import datetime
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, AutoencoderKL, UNet2DConditionModel, DDIMScheduler
from transformers import CLIPSegformerProcessor, CLIPSegformerForImageSegmentation, CLIPTextModel, CLIPTokenizer
import base64

app = Flask(__name__)
CORS(app)

# Initialize face analysis
face_analyzer = FaceAnalysis(name='buffalo_l')
face_analyzer.prepare(ctx_id=0, det_size=(640, 640))

# Load model and processor
model = AutoModel.from_pretrained("jadechoghari/vfusion3d", trust_remote_code=True)
processor = AutoProcessor.from_pretrained("jadechoghari/vfusion3d")

# Put model on GPU if available
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

# Load face detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Load the models
alias_model = torch.load('checkpoints/alias_final.pth')
gmm_model = torch.load('checkpoints/gmm_final.pth')
seg_model = torch.load('checkpoints/seg_final.pth')

# Set models to evaluation mode
alias_model.eval()
gmm_model.eval()
seg_model.eval()

# Load AI models
def load_models():
    # Load Segmentation model for garment parsing
    segmenter_processor = CLIPSegformerProcessor.from_pretrained("CIDAS/clipseg-rd64-refined")
    segmenter = CLIPSegformerForImageSegmentation.from_pretrained("CIDAS/clipseg-rd64-refined")
    
    # Load ControlNet for pose-guided generation
    controlnet = ControlNetModel.from_pretrained("lllyasviel/control_v11p_sd15_openpose")
    pipe = StableDiffusionControlNetPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        controlnet=controlnet,
        torch_dtype=torch.float16
    )
    
    # Load models for TryOnDiffusion
    vae = AutoencoderKL.from_pretrained("stabilityai/sd-vae-ft-mse").to(device)
    tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-large-patch14")
    text_encoder = CLIPTextModel.from_pretrained("openai/clip-vit-large-patch14").to(device)
    unet = UNet2DConditionModel.from_pretrained("CompVis/stable-diffusion-v1-4", subfolder="unet").to(device)
    scheduler = DDIMScheduler(beta_start=0.00085, beta_end=0.012)
    
    if torch.cuda.is_available():
        pipe = pipe.to("cuda")
        segmenter = segmenter.to("cuda")
        vae = vae.to("cuda")
        text_encoder = text_encoder.to("cuda")
        unet = unet.to("cuda")
    
    return pipe, segmenter, segmenter_processor, vae, tokenizer, text_encoder, unet, scheduler

pipe, segmenter, segmenter_processor, vae, tokenizer, text_encoder, unet, scheduler = load_models()

@app.route('/api/face-swap', methods=['POST'])
def face_swap():
    try:
        # Get images from request
        user_image = request.files['userImage']
        model_image = request.files['modelImage']
        
        # Read images
        user_img_bytes = user_image.read()
        model_img_bytes = model_image.read()
        
        # Convert to numpy arrays
        user_np = np.frombuffer(user_img_bytes, np.uint8)
        model_np = np.frombuffer(model_img_bytes, np.uint8)
        
        user_img = cv2.imdecode(user_np, cv2.IMREAD_COLOR)
        model_img = cv2.imdecode(model_np, cv2.IMREAD_COLOR)
        
        # Analyze faces
        user_faces = face_analyzer.get(user_img)
        model_faces = face_analyzer.get(model_img)
        
        if not user_faces or not model_faces:
            return jsonify({
                'success': False,
                'error': 'No faces detected in one or both images'
            }), 400
        
        # Get first face from each image
        user_face = user_faces[0]
        model_face = model_faces[0]
        
        # Perform face swap
        swapped_img = face_analyzer.swap(user_img, model_img, user_face, model_face)
        
        # Convert result to base64
        _, buffer = cv2.imencode('.jpg', swapped_img)
        img_str = base64.b64encode(buffer).decode()
        
        return jsonify({
            'success': True,
            'swappedImage': f'data:image/jpeg;base64,{img_str}'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate-3d', methods=['POST'])
def generate_3d():
    try:
        # Get images from request
        if 'person_image' not in request.files or 'garment_image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Missing required images'
            }), 400

        person_image = request.files['person_image']
        garment_image = request.files['garment_image']

        # Process images
        person_img = Image.open(person_image).convert('RGB').resize((512, 512))
        garment_img = Image.open(garment_image).convert('RGB').resize((512, 512))

        # Convert to tensors
        person_tensor = preprocess_image(person_img)
        garment_tensor = preprocess_image(garment_img)

        # Generate try-on
        with torch.no_grad():
            # Encode images
            person_latent = vae.encode(person_tensor).latent_dist.sample() * 0.18215
            garment_latent = vae.encode(garment_tensor).latent_dist.sample() * 0.18215

            # Prepare text embedding
            prompt = "person wearing the garment, highly detailed, photorealistic"
            text_input = tokenizer([prompt], padding="max_length", return_tensors="pt").to(device)
            text_embeddings = text_encoder(text_input.input_ids)[0]

            # Run diffusion
            latents = torch.randn_like(person_latent)
            for t in scheduler.timesteps:
                noise_pred = unet(
                    latents,
                    t,
                    encoder_hidden_states=text_embeddings,
                    cross_attention_kwargs={"garment": garment_latent}
                ).sample
                latents = scheduler.step(noise_pred, t, latents).prev_sample

            # Decode result
            result = vae.decode(latents / 0.18215).sample
            result_image = postprocess_image(result)

        # Convert to base64
        buffered = io.BytesIO()
        result_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        return jsonify({
            'success': True,
            'model': f'data:image/png;base64,{img_str}'
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def preprocess_image(image):
    image = torch.from_numpy(np.array(image)).float() / 127.5 - 1
    return image.permute(2, 0, 1).unsqueeze(0).to(device)

def postprocess_image(tensor):
    tensor = (tensor + 1) * 127.5
    tensor = tensor.clamp(0, 255).detach().cpu().numpy()
    tensor = tensor.transpose(0, 2, 3, 1)[0]
    return Image.fromarray(tensor.astype(np.uint8))

@app.route('/api/detect-face', methods=['POST'])
def detect_face():
    try:
        # Get image from request
        image_file = request.files['image']
        image_bytes = image_file.read()
        
        # Convert to OpenCV format
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        return jsonify({
            'success': True,
            'faceDetected': len(faces) > 0,
            'faceCount': len(faces)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True) 