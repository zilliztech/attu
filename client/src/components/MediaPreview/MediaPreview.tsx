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
  const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(
    new Map()
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isImageSource(value)) {
      setImage(value);
      setImageError(false); // Reset error state
      loadImageWithCache(value);
    }
  }, [value]);

  // Cleanup cache when component unmounts or cache gets too large
  useEffect(() => {
    const cleanupCache = () => {
      if (imageCache.size > 50) {
        // Limit cache to 50 images
        const entries = Array.from(imageCache.entries());
        const newCache = new Map(entries.slice(-30)); // Keep last 30 images
        setImageCache(newCache);
      }
    };

    cleanupCache();
  }, [imageCache.size]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setImageCache(new Map());
    };
  }, []);

  const loadImageWithCache = (imageSrc: string) => {
    console.log('Loading image:', imageSrc); // Debug log

    // Check if image is already cached
    if (imageCache.has(imageSrc)) {
      const cachedImg = imageCache.get(imageSrc)!;
      setImageDimensions({
        width: cachedImg.naturalWidth,
        height: cachedImg.naturalHeight,
      });
      console.log(
        'Image loaded from cache:',
        cachedImg.naturalWidth,
        'x',
        cachedImg.naturalHeight
      );
      return;
    }

    // Create an Image object to get natural dimensions with caching
    const img = new Image();

    // Don't set crossOrigin for external images to avoid CORS issues
    // The browser will handle CORS automatically if the server allows it

    img.onload = () => {
      console.log(
        'Image loaded successfully:',
        img.naturalWidth,
        'x',
        img.naturalHeight
      );
      // Cache the loaded image
      setImageCache(prev => new Map(prev).set(imageSrc, img));

      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      console.warn('Failed to load image:', imageSrc);
      setImageError(true);
      // Set default dimensions if image fails to load
      setImageDimensions({
        width: 200,
        height: 200,
      });
    };

    // Set src after setting up event handlers
    img.src = imageSrc;
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    // Use dynamic image dimensions if available, otherwise use defaults
    const maxDimension = 200;
    let imageWidth = maxDimension;
    let imageHeight = maxDimension;

    if (imageDimensions.width > 0 && imageDimensions.height > 0) {
      const aspectRatio = imageDimensions.width / imageDimensions.height;

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
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        minWidth: '50px',
        minHeight: '50px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <icons.img />
            <Typography variant="mono" component="p" title={String(value)}>
              <a href={value} target="_blank" rel="noopener noreferrer">
                {value}
              </a>
            </Typography>
          </div>
        ) : (
          <Typography variant="mono" component="p" title={String(value)}>
            {value}
          </Typography>
        )}
      </div>
      {showImage && image && (
        <div style={showImageStyle}>
          {imageError ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: '#666',
                fontSize: '12px',
                minWidth: '150px',
                minHeight: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div>
                <div>⚠️ 图片无法加载</div>
                <div style={{ marginTop: '8px', fontSize: '11px' }}>
                  可能是跨域限制
                </div>
                <div style={{ marginTop: '4px', fontSize: '11px' }}>
                  点击链接查看原图
                </div>
              </div>
            </div>
          ) : (
            <img
              src={image}
              alt="preview"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                width: 'auto',
                height: 'auto',
                display: 'block',
                borderRadius: '2px',
                minWidth: '50px',
                minHeight: '50px',
              }}
              onLoad={e => {
                console.log(
                  'Preview image loaded:',
                  e.currentTarget.naturalWidth,
                  'x',
                  e.currentTarget.naturalHeight
                );
              }}
              onError={e => {
                console.warn('Failed to display image:', image);
                setImageError(true);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to detect if the value is a URL or Base64-encoded image
function isImageSource(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const urlPattern = /\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i;
  const base64Pattern =
    /^data:image\/(png|jpeg|jpg|gif|bmp|webp|svg\+xml);base64,/i;
  return urlPattern.test(value) || base64Pattern.test(value);
}

export default MediaPreview;
