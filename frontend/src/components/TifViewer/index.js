import React from "react";
import { TIFFViewer } from "react-tiff";
import "./tif_viewer.css";

const TifViewer = ({ img, scale, brightness, imageProjection }) => {
  const isTiffImage = (image) => {
    if (image && typeof image.props === "object" && typeof image.props.src === "string") {
      console.log(image.props.src);
      const fileExtension = image.props.src.split('.').pop().toLowerCase();
      return fileExtension === 'tiff' || fileExtension === 'tif';
    }
    return false;
  };

  const isProjectionTiff = imageProjection !== null && isTiffImage(imageProjection);
  const isExistsXYZ = imageProjection !== null;
  const isOneXYZ = imageProjection !== null && imageProjection.length === 1;

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
      </div>
      <div className="tif-viewer">
        {isProjectionTiff ? (
          <TIFFViewer
            key={imageProjection.id}
            tiff={imageProjection.data}
            paginate="bottom"
            buttonColor="#337fd6"
            onClick={handleButtonClick}
            style={{ transform: `rotate(90deg)`, objectFit: 'contain', filter: `brightness(${brightness})` }}
          />
        ) : isOneXYZ ? (
          <img src={imageProjection[0]} alt="XYZ Image" />
        ) : null}
      </div>
    </div>
  );
};

export default TifViewer;