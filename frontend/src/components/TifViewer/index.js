import React from "react";
import { TIFFViewer } from "react-tiff";
import "./tif_viewer.css";

const TifViewer = ({ img, scale, brightness, imageProjection }) => {
  console.log(imageProjection);
  const isExistsXYZ = imageProjection !== null;

  const handleButtonClick = (e) => {
    e.preventDefault();
  };

  if (!img) {
    return null;
  }

  return (
    <div className="tif-viewer-container">
      <div className="tif-viewer">
        <TIFFViewer
          key={img.id}
          tiff={img.data}
          paginate="bottom"
          buttonColor="#337fd6"
          onClick={handleButtonClick}
          style={{ transform: `scale(${scale})`, objectFit: 'contain', filter: `brightness(${brightness})` }}
        />
        {isExistsXYZ ? (
          <TIFFViewer
            key={imageProjection.id}
            tiff={imageProjection.data}
            paginate="bottom"
            buttonColor="#337fd6"
            onClick={handleButtonClick}
            style={{ objectFit: 'contain',marginLeft: '120px' }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default TifViewer;