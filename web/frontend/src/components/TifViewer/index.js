import React from "react";
import { TIFFViewer } from "react-tiff";
import "./tif_viewer.css";

const TifViewer = ({ img, scale, brightness, imageProjection, imageName=null }) => {

  const handleButtonClick = (e) => {
    e.preventDefault();
  };

  return (
    <div className="tif-viewer-container">
        {imageName}
      <div className="tif-viewer">
        {img ? (
          <TIFFViewer
            key={img.id}
            tiff={img.data}
            paginate="bottom"
            buttonColor="#337fd6"
            onClick={handleButtonClick}
            style={{
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
