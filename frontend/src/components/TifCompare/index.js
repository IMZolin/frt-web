import React from 'react';
import TifViewer from '../TifViewer';
import './tif_compare.css';

const TifCompare = ({ img_1, img_2, scale, state, isSameLength, type}) => {
  const shouldApplyStylesForImg1 = type==='deconvolution' ? state.resolution[1] > 50 : state.resolution[1] > 360;
  const shouldApplyStylesForImg2 = type==='deconvolution' ? state.resolution[1] > 50 : state.resolution[1] > 360;
  const layerChanged = isSameLength ? state.layer : state.layer2;
  return (
    <div className="tif-container" style={{marginBottom: '-100px', marginLeft: `${type==='beads' ? '250px' : '350px'}`, marginTop: `${type==='beads' ? '-70px' : ''}`}}>
      <div className="images-container">
        {img_1.length !== 0 ? (
          <div className="img-container" style={{marginTop:`${type==='deconvolution' ? '-100px' : '30px'}`, marginRight:`${type==='deconvolution' ? '200px' : ''}`}}>
            <div className={`${shouldApplyStylesForImg1 ? 'img-container-box' : ''}`} style={{marginBottom: `${type==='beads' ? '-180px' : '130px'}`}}>
              <TifViewer
                img={img_1[state.layer]}
                scale={scale}
                className="tif-single"
                brightness={state.levelBrightness}
              />
            </div>
            {isSameLength ? null : (
              <div style={{marginTop: '-100px', marginBottom: '30px', zIndex: 3}}>
                <label className="viewer-label" htmlFor="layer-slider">
                  Layer:
                </label>
                <input
                  id="layer-slider"
                  type="range"
                  min="0"
                  max={img_1.length - 1}
                  step="1"
                  value={state.layer}
                  onChange={(e) =>
                    state.handleLayerChange(e, img_1.length - 1)
                  }
                />
              </div>
            )}
          </div>
        ) : null}
        {img_2.length !== 0 ? (
          <div className="img-container" style={{marginTop: '30px', marginRight: `${isSameLength ? '510px' : '450px'}`}}>
            <div className={`${shouldApplyStylesForImg2 ? 'img-container-box' : ''}`}>
              <TifViewer
                img={img_2[layerChanged]}
                scale={scale}
                className="tif-single"
                brightness={state.levelBrightness}
              />
            </div>
            {isSameLength ? null : (
              <div style={{marginTop: '40px', marginBottom: '20px'}}>
                <label className="viewer-label" htmlFor="layer-slider">
                  Layer:
                </label>
                <input
                  id="layer-slider"
                  type="range"
                  min="0"
                  max={img_2.length - 1}
                  step="1"
                  value={state.layer2}
                  onChange={(e) =>
                    state.handleLayer2Change(e, img_2.length - 1)
                  }
                />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default TifCompare;