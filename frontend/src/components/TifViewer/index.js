import { TIFFViewer } from "react-tiff";
import "./tif_viewer.css";

const TifViewer = ({ img, scale, brightness }) => {
  const handleButtonClick = (e) => {
    e.preventDefault();
  };

  const containerHeight2 = `calc(${80 + 50 * scale}px)`;
  const margin = `${scale * 25}px`;
  console.log(img.data);
  return (
    <div className="tif-viewer-container" style={{ marginLeft: `+${8 * scale}px`, height: containerHeight2}}>
      <div className="tif-viewer" style={{ height: 100 , paddingTop: "-50px", width: `calc(50% + ${15 * scale}px)`, marginRight: margin }}>
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