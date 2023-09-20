import React from 'react';
import TifViewer from '../TifViewer';
import './tif_compare.css';

const TifCompare = ({ img_1, img_2, scale, state, isSameLength }) => {
  const shouldApplyStylesForImg1 = state.resolution[1] > 360;
  const shouldApplyStylesForImg2 = state.resolution2[1] > 360;
  const layerChanged = isSameLength ? state.layer : state.layer2;
  return (
    <div className="tif-container">
      <div className="images-container">
        {img_1.length !== 0 ? (
          <div className="img-container">
            <div className={`${shouldApplyStylesForImg1 ? 'img-container-box' : ''}`}>
              <TifViewer
                img={img_1[state.layer]}
                scale={scale}
                className="tif-single"
                brightness={state.levelBrightness}
              />
            </div>
            {isSameLength ? null : (
              <div>
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
          <div className="img-container" style={{marginTop: '30px', marginRight: '400px'}}>
            <div className={`${shouldApplyStylesForImg2 ? 'img-container-box' : ''}`}>
              <TifViewer
                img={img_2[layerChanged]}
                scale={scale}
                className="tif-single"
                brightness={state.levelBrightness}
              />
            </div>
            {isSameLength ? null : (
              <div style={{marginTop: '30px'}}>
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