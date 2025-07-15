import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Box, Typography, Slider, IconButton } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';

const AvatarModel = ({ modelUrl, rotation, clothingUrl }) => {
  const group = useRef();
  const { scene } = useGLTF(modelUrl);
  const { scene: clothingScene } = useGLTF(clothingUrl || modelUrl); // Use modelUrl as fallback

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} />
      {clothingUrl && <primitive object={clothingScene} scale={1} />}
    </group>
  );
};

const AvatarViewer = ({ selectedClothing }) => {
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const defaultModelUrl = '/models/default-avatar.glb'; // You'll need to provide this model

  const handleRotationChange = (event, newValue) => {
    setRotation(newValue);
  };

  const handleAutoRotateToggle = () => {
    setAutoRotate(!autoRotate);
  };

  return (
    <Box sx={{ height: '500px', position: 'relative' }}>
      <Typography variant="h6" gutterBottom>
        3D Avatar Viewer
      </Typography>
      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <AvatarModel 
          modelUrl={defaultModelUrl} 
          rotation={rotation} 
          clothingUrl={selectedClothing}
        />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          autoRotate={autoRotate}
          autoRotateSpeed={1}
        />
        <Environment preset="studio" />
      </Canvas>
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: '80%',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        p: 2,
        borderRadius: 2
      }}>
        <IconButton onClick={handleAutoRotateToggle}>
          {autoRotate ? <RotateRightIcon /> : <RotateLeftIcon />}
        </IconButton>
        <Slider
          value={rotation}
          onChange={handleRotationChange}
          min={0}
          max={Math.PI * 2}
          step={0.01}
          aria-label="Rotation"
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );
};

export default AvatarViewer; 