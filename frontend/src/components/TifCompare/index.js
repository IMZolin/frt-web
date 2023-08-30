import React from 'react';
import TifViewer from '../TifViewer';
import './tif_compare.css';

const TifCompare = ({ img_1, img_2, scale, state }) => {
const shouldApplyStylesForImg1 = state.resolution[1] > 360;
const shouldApplyStylesForImg2 = state.resolution2[1] > 360;
  return (
    <div className="tif-container">
      <div className="images-container">
        {img_1 ? (
          <div className="img-container">
            <div className={`${shouldApplyStylesForImg1 ? 'img-container-box' : ''}`}>
              <TifViewer
                img={img_1[state.layer]}
                scale={scale}
                className="tif-single"
                brightness={state.brightness}
              />
            </div>
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
        ) : null}
        {img_2 || img_2.length === 0 ? (
          <div className="img-container">
          <div className={`${shouldApplyStylesForImg2 ? 'img-container-box' : ''}`}>
            <TifViewer
              img={img_2[state.layer2]}
              scale={scale}
              className="tif-single"
              brightness={state.brightness}
            />
          </div>
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
        ) : null}
      </div>
    </div>
  );
};

export default TifCompare;
