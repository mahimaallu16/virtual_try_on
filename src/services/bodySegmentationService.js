import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';

let net = null;

export const loadBodyPixModel = async () => {
  try {
    if (!net) {
      net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      });
    }
    return net;
  } catch (error) {
    console.error('Error loading BodyPix model:', error);
    throw error;
  }
};

export const segmentBody = async (imageElement) => {
  try {
    if (!net) {
      await loadBodyPixModel();
    }

    const segmentation = await net.segmentPerson(imageElement, {
      flipHorizontal: false,
      internalResolution: 'medium',
      segmentationThreshold: 0.7
    });

    return segmentation;
  } catch (error) {
    console.error('Error segmenting body:', error);
    throw error;
  }
};

export const createBodyMask = (segmentation, imageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  const ctx = canvas.getContext('2d');

  const imageData = ctx.createImageData(segmentation.width, segmentation.height);
  const data = imageData.data;

  for (let i = 0; i < segmentation.data.length; i++) {
    const j = i * 4;
    if (segmentation.data[i] === 1) {
      data[j] = 255;   // R
      data[j + 1] = 255; // G
      data[j + 2] = 255; // B
      data[j + 3] = 255; // A
    } else {
      data[j] = 0;     // R
      data[j + 1] = 0;   // G
      data[j + 2] = 0;   // B
      data[j + 3] = 0;   // A
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

export const overlayClothing = async (userImage, clothingImage, segmentation) => {
  const canvas = document.createElement('canvas');
  canvas.width = userImage.width;
  canvas.height = userImage.height;
  const ctx = canvas.getContext('2d');

  // Draw the user image
  ctx.drawImage(userImage, 0, 0);

  // Create a temporary canvas for the clothing image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = userImage.width;
  tempCanvas.height = userImage.height;
  const tempCtx = tempCanvas.getContext('2d');

  // Draw the clothing image
  tempCtx.drawImage(clothingImage, 0, 0, userImage.width, userImage.height);

  // Get the clothing image data
  const clothingData = tempCtx.getImageData(0, 0, userImage.width, userImage.height);
  const userData = ctx.getImageData(0, 0, userImage.width, userImage.height);

  // Overlay the clothing only where the body is detected
  for (let i = 0; i < segmentation.data.length; i++) {
    const j = i * 4;
    if (segmentation.data[i] === 1) {
      userData.data[j] = clothingData.data[j];
      userData.data[j + 1] = clothingData.data[j + 1];
      userData.data[j + 2] = clothingData.data[j + 2];
      userData.data[j + 3] = clothingData.data[j + 3];
    }
  }

  ctx.putImageData(userData, 0, 0);
  return canvas;
}; 