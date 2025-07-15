import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useSpeechRecognition } from 'react-speech-recognition';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Box, Button, Typography, Paper, IconButton, CircularProgress, Grid } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { processVoiceInput, analyzeFit } from '../../services/aiService';
import { loadBodyPixModel, segmentBody, overlayClothing } from '../../services/bodySegmentationService';
import ClothingSelector from './ClothingSelector';
import AvatarViewer from './AvatarViewer';

const VirtualTryOn = () => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fitAnalysis, setFitAnalysis] = useState(null);
  const [virtualTryOnResult, setVirtualTryOnResult] = useState(null);
  const [selectedClothing, setSelectedClothing] = useState(null);
  const webcamRef = useRef(null);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    // Load the BodyPix model when the component mounts
    loadBodyPixModel().catch(console.error);
  }, []);

  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: "user"
  };

  const handleStartListening = () => {
    setIsListening(true);
    resetTranscript();
  };

  const handleStopListening = async () => {
    setIsListening(false);
    setIsProcessing(true);
    
    try {
      const aiResponse = await processVoiceInput(transcript);
      setMessages(prev => [...prev, 
        { type: 'user', text: transcript }, 
        { type: 'ai', text: aiResponse }
      ]);
      speak({ text: aiResponse });
    } catch (error) {
      console.error('Error processing voice input:', error);
      setMessages(prev => [...prev, 
        { type: 'user', text: transcript }, 
        { type: 'ai', text: "I apologize, but I'm having trouble processing your request right now." }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const captureImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelectedImage(imageSrc);
    setIsProcessing(true);

    try {
      // Create an image element from the screenshot
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Perform body segmentation
      const segmentation = await segmentBody(img);
      
      // If we have a selected clothing item, perform virtual try-on
      if (selectedClothing) {
        const clothingImg = new Image();
        clothingImg.src = selectedClothing;
        await new Promise((resolve) => {
          clothingImg.onload = resolve;
        });

        const resultCanvas = await overlayClothing(img, clothingImg, segmentation);
        setVirtualTryOnResult(resultCanvas.toDataURL());
      }

      // Analyze fit
      const fitResult = await analyzeFit(imageSrc);
      setFitAnalysis(fitResult);
      
      setMessages(prev => [...prev, {
        type: 'ai',
        text: `Based on your measurements, I recommend size ${fitResult.recommendedSize}. Your measurements are: Chest: ${fitResult.measurements.chest}, Waist: ${fitResult.measurements.waist}, Hips: ${fitResult.measurements.hips}`
      }]);
    } catch (error) {
      console.error('Error processing image:', error);
      setMessages(prev => [...prev, {
        type: 'ai',
        text: "I apologize, but I'm having trouble analyzing your measurements right now."
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClothingSelect = (clothingImage) => {
    setSelectedClothing(clothingImage);
  };

  if (!browserSupportsSpeechRecognition) {
    return <Typography>Your browser doesn't support speech recognition.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Virtual Try-On Experience
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Camera View
            </Typography>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<PhotoCameraIcon />}
                onClick={captureImage}
                disabled={isProcessing}
              >
                {isProcessing ? <CircularProgress size={24} /> : 'Capture Photo'}
              </Button>
            </Box>
            {fitAnalysis && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="subtitle1">Recommended Size: {fitAnalysis.recommendedSize}</Typography>
                <Typography variant="body2">Confidence: {(fitAnalysis.confidence * 100).toFixed(1)}%</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Assistant
            </Typography>
            <Box sx={{ height: 400, overflowY: 'auto', mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: message.type === 'user' ? 'primary.light' : 'secondary.light',
                    borderRadius: 2,
                    maxWidth: '80%',
                    ml: message.type === 'user' ? 'auto' : 0,
                  }}
                >
                  <Typography>{message.text}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                color={isListening ? 'error' : 'primary'}
                onClick={isListening ? handleStopListening : handleStartListening}
                sx={{ width: 60, height: 60 }}
                disabled={isProcessing}
              >
                {isProcessing ? <CircularProgress size={24} /> : isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Box>
            {isListening && (
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                Listening... {transcript}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <ClothingSelector onSelectClothing={handleClothingSelect} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <AvatarViewer selectedClothing={selectedClothing} />
          </Paper>
        </Grid>

        {virtualTryOnResult && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Virtual Try-On Result
              </Typography>
              <img 
                src={virtualTryOnResult} 
                alt="Virtual Try-On Result" 
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default VirtualTryOn; 