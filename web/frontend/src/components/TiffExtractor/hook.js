import {gaussianFilter, unravelIndex} from 'ndarray-ops';
import ndarray from 'ndarray';

const useBeadMark = (state) => {
  return async (x, y, selectSize) => {
    const LocateFrameMaxIntensity3D = (xi, yi) => {
      const d = Math.floor(selectSize / 2);
      const bound1 = Math.max(yi - d, 0);
      const bound2 = Math.min(yi + d, state.imageHeight);
      const bound3 = Math.max(xi - d, 0);
      const bound4 = Math.min(xi + d, state.imageWidth);

      const sample = state.imageData.slice(bound1, bound2).map(row => row.slice(bound3, bound4));
      const blurredSample = gaussianFilter(ndarray(sample), 1);

      const coords = unravelIndex(blurredSample.argmax(), blurredSample.shape);
      return [coords[1] + bound3, coords[0] + bound1];
    };

    try {
      const [xCenter, yCenter] = LocateFrameMaxIntensity3D(x, y);
      return {x: xCenter, y: yCenter};
    } catch (error) {
      console.error('Error locating bead:', error);
      return null;
    }
  };
};

export default useBeadMark;
