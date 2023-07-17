import { TIFFViewer } from "react-tiff";
import "./tif_viewer.css";

const TifViewer = ({ img, scale, brightness }) => {
  const handleButtonClick = (e) => {
    e.preventDefault();
  };

  console.log(img.data);
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
    </div>
  );
};

export default TifViewer;