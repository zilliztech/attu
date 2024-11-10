import React, { useState, useEffect } from 'react';
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
    const imageWidth =
      imageDimensions.width > 200 ? 200 : imageDimensions.width;
    const imageHeight =
      imageDimensions.height > 200
        ? imageDimensions.height * (200 / imageDimensions.width)
        : imageDimensions.height;
    const offset = 10; // Small offset to position the image beside the cursor

    console.log('imageHeight', imageHeight);

    // Calculate preliminary position
    let left = e.clientX + offset - imageWidth / 2;
    let top = e.clientY - imageHeight - 20;

    console.log(top);

    // Ensure the image stays within viewport boundaries
    if (left + imageWidth > window.innerWidth) {
      left = e.clientX - imageWidth - offset; // Move to the left side of the cursor if it exceeds the right boundary
    }
    if (left < 0) {
      left = offset; // Move right if it goes off the left edge
    }
    if (top + imageHeight > window.innerHeight) {
      top = window.innerHeight - imageHeight - offset; // Adjust to stay within the bottom boundary
    }
    if (top < 0) {
      top = offset; // Adjust to stay within the top boundary
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
        style={{ cursor: 'pointer' }}
      >
        {isImg && <icons.img />} {value}
      </div>
      {showImage && (
        <div style={showImageStyle}>
          <img
            src={image}
            alt="preview"
            style={{ width: 'auto', maxWidth: '200px', borderRadius: '4px' }}
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
