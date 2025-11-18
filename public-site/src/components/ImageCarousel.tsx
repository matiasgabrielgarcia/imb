import React from 'react';
import Slider from 'react-slick';
import { Box } from '@mui/material';

interface ImageCarouselProps {
  propertyId: number;
  height?: number;
}

// Placeholder images from Unsplash
const placeholderImages = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
];

const ImageCarousel: React.FC<ImageCarouselProps> = ({ propertyId, height = 200 }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,  // Disabled autoplay
    arrows: true,     // Show prev/next arrows
    pauseOnHover: true,
  };

  // Use property ID to consistently select images
  const startIndex = propertyId % placeholderImages.length;
  const images = [
    placeholderImages[startIndex],
    placeholderImages[(startIndex + 1) % placeholderImages.length],
    placeholderImages[(startIndex + 2) % placeholderImages.length],
  ];

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: height, 
        overflow: 'hidden',
        '& .slick-slider': {
          height: '100%',
        },
        '& .slick-list, & .slick-track': {
          height: '100%',
        },
        // Style the arrows to make them more visible
        '& .slick-prev, & .slick-next': {
          zIndex: 1,
          width: '40px',
          height: '40px',
          '&:before': {
            fontSize: '40px',
            opacity: 0.75,
          },
          '&:hover:before': {
            opacity: 1,
          },
        },
        '& .slick-prev': {
          left: '10px',
        },
        '& .slick-next': {
          right: '10px',
        },
      }}
    >
      <Slider {...settings}>
        {images.map((image, index) => (
          <Box key={index}>
            <Box
              component="img"
              src={image}
              alt={`Property ${propertyId} - Image ${index + 1}`}
              sx={{
                width: '100%',
                height: height,
                objectFit: 'cover',
              }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default ImageCarousel;

