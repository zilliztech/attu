import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import icons from '../icons/Icons';

const MediaPreview = (props: { value: string }) => {
  const { value } = props;
  const [showImage, setShowImage] = useState(false);
  const [image, setImage] = useState('');
  const [showImageStyle, setShowImageStyle] = useState({});
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (isImageSource(value)) {
      setImage(value);

      // Create an Image object to get natural dimensions
      const img = new Image();
      img.src = value;
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
    }
  }, [value]);

  const handleMouseOver = (e: React.MouseEvent) => {
    // Use dynamic image dimensions instead of fixed values
    const maxDimension = 200;
    const aspectRatio = imageDimensions.width / imageDimensions.height;

    let imageWidth, imageHeight;

    if (
      imageDimensions.width > maxDimension ||
      imageDimensions.height > maxDimension
    ) {
      if (aspectRatio > 1) {
        // Landscape orientation
        imageWidth = maxDimension;
        imageHeight = maxDimension / aspectRatio;
      } else {
        // Portrait or square orientation
        imageHeight = maxDimension;
        imageWidth = maxDimension * aspectRatio;
      }
    } else {
      // Use original dimensions if they're within the limit
      imageWidth = imageDimensions.width;
      imageHeight = imageDimensions.height;
    }

    const offset = 10; // Small offset to position the image beside the cursor

    // Calculate preliminary position
    let left = e.clientX + offset - imageWidth / 2;
    let top = e.clientY - imageHeight - 20;

    // Ensure the image stays within viewport boundaries
    if (left + imageWidth > window.innerWidth) {
      left = e.clientX - imageWidth - offset;
    }
    if (left < 0) {
      left = offset;
    }
    if (top + imageHeight > window.innerHeight) {
      top = window.innerHeight - imageHeight - offset;
    }
    if (top < 0) {
      top = offset;
    }

    if (image) {
      setShowImage(true);
      setShowImageStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 1000,
        pointerEvents: 'none',
      });
    }
  };

  const handleMouseOut = () => {
    setShowImage(false);
  };

  const isImg = isImageSource(value);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseMove={handleMouseOver}
        onMouseOut={handleMouseOut}
        style={isImg ? { cursor: 'pointer' } : {}}
      >
        {isImg ? (
          <>
            <icons.img />
            <Typography variant="mono" component="p" title={String(value)}>
              <a href={value} target="_blank">
                {value}
              </a>
            </Typography>
          </>
        ) : (
          <Typography variant="mono" component="p" title={String(value)}>
            {value}
          </Typography>
        )}
      </div>
      {showImage && (
        <div style={showImageStyle}>
          <img
            src={image}
            alt="preview"
            style={{
              width: imageDimensions.width > 200 ? 200 : imageDimensions.width,
              borderRadius: '4px',
            }}
          />
        </div>
      )}
    </div>
  );
};

// Helper function to detect if the value is a URL or Base64-encoded image
function isImageSource(value: string): boolean {
  const urlPattern = /\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i;
  const base64Pattern =
    /^data:image\/(png|jpeg|jpg|gif|bmp|webp|svg\+xml);base64,/i;
  return urlPattern.test(value) || base64Pattern.test(value);
}

export default MediaPreview;
