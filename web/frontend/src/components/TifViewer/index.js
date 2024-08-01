import React, { useState, useEffect } from "react";
import { TIFFViewer } from "react-tiff";
import "./tif_viewer.css";

const TifViewer = ({ img, scale, brightness, imageProjection }) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  if (img) {
      const image = new Image();
      image.onload = () => {
        setImageDimensions({ width: image.width, height: image.height });
        console.log("width: ", image.width);
      };
      image.src = URL.createObjectURL(new Blob([img.data], { type: 'image/tiff' }));
    }

  const handleButtonClick = (e) => {
    e.preventDefault();
  };

  const imageStyle = (width, height) => {
    if (width > 200 || height > 200) {
      return { overflow: 'auto', maxWidth: '200px', maxHeight: '200px' };
    }
    return {};
  };
  if (!img && !imageProjection) {
    return null;
  }

  return (
    <div className="tif-viewer-container">
      <div className="tif-viewer">
        {img ? (
          <TIFFViewer
            key={img.id}
            tiff={img.data}
            paginate="bottom"
            buttonColor="#337fd6"
            onClick={handleButtonClick}
            style={{
              ...imageStyle(imageDimensions.width, imageDimensions.height),
              transform: `scale(${scale})`,
              filter: `brightness(${brightness})`,
              objectFit: 'contain',
              overflow: 'auto',
              maxWidth: '150px',
              maxHeight: '150px'
            }}
          />
        ) : null}
        {imageProjection ? (
          <TIFFViewer
            key={imageProjection.id}
            tiff={imageProjection.data}
            paginate="bottom"
            buttonColor="#337fd6"
            onClick={handleButtonClick}
            style={{ marginLeft: '40px', transform: `scale(0.45)` }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default TifViewer;
