import ndarray from 'ndarray';
import ops from 'ndarray-ops';

const useBeadMark = (state) => {
  return async (imageData, x, y, selectSize) => {
    const LocateFrameMaxIntensity3D = (xi, yi) => {
      const d = Math.floor(selectSize / 2);
      const bound1 = Math.max(yi - d, 0);
      const bound2 = Math.min(yi + d, state.beadsDimensions[1]);
      const bound3 = Math.max(xi - d, 0);
      const bound4 = Math.min(xi + d, state.beadsDimensions[2]);
      const imageArray = ndarray(new Float32Array(imageData), state.beadsDimensions);
      const sample = imageArray
        .hi(bound2, bound4, state.beadsDimensions[2])
        .lo(bound1, bound3, 0);
      const blurredSample = ndarray(new Float32Array(sample.size), sample.shape);
      const coords = ops.argmax(blurredSample);
      return [coords[2] + bound3 + d, coords[1] + bound1 + d];
    };

    try {
      const [xCenter, yCenter] = LocateFrameMaxIntensity3D(x, y);
      return { x: Math.floor(xCenter), y:Math.floor(yCenter) };
    } catch (error) {
      console.error('Error locating bead:', error);
      return null;
    }
  };
};

export default useBeadMark;
