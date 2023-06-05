import TifViewer from "../TifViewer";
import "./tif_compare.css";

const TifCompare = ({ img_1, img_2, scale }) => {
  const containerHeight = `calc(${130 + 50 * scale}px)`;
  console.log(img_1.data);
  return (
    <div className="tif-container" style={{ height: containerHeight }}>
      <div className="viewer-label" >Before:</div>
      <TifViewer img={img_1} scale={scale}/>
      <TifViewer img={img_2} scale={scale}/>
    </div>
  );
};

export default TifCompare;
