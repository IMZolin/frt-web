import React from 'react';
import TifViewer from '../TifViewer';
import './tif_compare.css';

const TifCompare = ({ img_1, img_2, img_1_projection, img_2_projection, scale, state, isSameLength, type}) => {
  const shouldApplyStylesForImg1 = state.resolution[1] > 360;
  const shouldApplyStylesForImg2 = state.resolution2[1] > 360;
  const layerChanged = isSameLength ? state.layer : state.layer2;
  const img1Scale = type === 'deconvolution' || type === 'deconvolution-2' ? 0.35 * scale : scale;
  const isImg1Projection = img_1_projection !== null;
  const isImg2Projection = img_2_projection !== null;
  const img1Scale2 = type === 'deconvolution-2' || type === 'deconvolution' && img_2_projection === null ? 0.35 * scale : scale;
  console.log(img_1, img_1[state.layer]);
  return (
    <div className="tif-container" style={{marginBottom: `${type==='deconvolution' ? '' : '-100px'}`, marginLeft: `${type==='deconvolution' ? '320px' : '160px'}`}}>
      <div className="images-container">
        {img_1.length !== 0 ? (
          <div className="img-container" style={{marginTop: `${isImg1Projection ? '-60px' : (type==='beads' ? (isImg2Projection ? '260px': '140px') : (type==='deconvolution' ? (isImg2Projection ? '180px': '100px') : '200px')) }`}}>
            <div className={`${shouldApplyStylesForImg1 ? 'img-container-box' : ''}`} style={{marginBottom: '-180px'}}>
              <TifViewer
                img={img_1[state.layer]}
                scale={img1Scale}
                className="tif-single"
                brightness={state.levelBrightness}
                imageProjection={isImg1Projection ? img_1_projection : null}
              />
            </div>
            {isSameLength ? null : (
              <div style={{marginTop: `${type==='deconvolution' ? '270px' : (type==='beads' ? '100px' : '-80px')}`, marginBottom: '30px'}}>
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
          <div className="img-container" style={{marginTop: `${type==='beads'? '-20px' : (isImg2Projection ? '-60px' : (type==='deconvolution' ? '100px' : '200px'))}`, marginRight: `${isSameLength ? (type==='deconvolution'? '420px' : '250px') : '140px'}`}}>
            <div className={`${shouldApplyStylesForImg2 ? 'img-container-box' : ''}`}>
              <TifViewer
                img={img_2[layerChanged]}
                scale={img1Scale2}
                className="tif-single"
                brightness={state.levelBrightness}
                imageProjection={isImg2Projection ? img_2_projection : null}
              />
            </div>
            {isSameLength ? null : (
              <div style={{marginTop: '-40px', marginBottom: '20px'}}>
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
