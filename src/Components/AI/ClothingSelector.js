import React from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Button } from '@mui/material';

const sampleClothing = [
  {
    id: 1,
    name: 'Classic White T-Shirt',
    image: 'https://example.com/white-tshirt.jpg',
    category: 'T-Shirts'
  },
  {
    id: 2,
    name: 'Blue Denim Jacket',
    image: 'https://example.com/denim-jacket.jpg',
    category: 'Jackets'
  },
  {
    id: 3,
    name: 'Black Hoodie',
    image: 'https://example.com/black-hoodie.jpg',
    category: 'Hoodies'
  },
  // Add more clothing items as needed
];

const ClothingSelector = ({ onSelectClothing }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select Clothing to Try On
      </Typography>
      <Grid container spacing={2}>
        {sampleClothing.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => onSelectClothing(item.image)}
            >
              <CardMedia
                component="img"
                height="200"
                image={item.image}
                alt={item.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="subtitle1" component="div">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.category}
                </Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClothing(item.image);
                  }}
                >
                  Try On
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClothingSelector; 