import React from "react";
import { TIFFViewer } from "react-tiff";
import "./tif_viewer.css";

const TifViewer = ({ img, scale, brightness, imageProjection }) => {
  const handleButtonClick = (e) => {
    e.preventDefault();
  };

  const imageStyle = (width, height) => {
    if (width > 400 || height > 400) {
      return { overflow: 'auto', maxWidth: '400px', maxHeight: '400px' };
    }
    return { transform: `scale(${scale})`, objectFit: 'contain', filter: `brightness(${brightness})` };
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
            style={imageStyle(img.width, img.height)}
          />
        ) : null}
        {imageProjection ? (
          <TIFFViewer
            key={imageProjection.id}
            tiff={imageProjection.data}
            paginate="bottom"
            buttonColor="#337fd6"
            onClick={handleButtonClick}
            style={{ ...imageStyle(imageProjection.width, imageProjection.height), marginLeft: '120px', transform: `scale(0.7)` }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default TifViewer;
