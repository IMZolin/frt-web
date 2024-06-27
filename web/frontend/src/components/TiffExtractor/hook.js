import useAxiosStore from '../../app/store/axiosStore';

const useBeadMark = () => {
  const axiosStore = useAxiosStore();

  const markBead = async (x, y, selectSize) => {
    try {
      const response = await axiosStore.postBeadMark({
        x: x,
        y: y,
        select_size: selectSize,
      });

      if (response.center_coords) {
        const [xCenter, yCenter] = response.center_coords;
        return { x: xCenter, y: yCenter };
      }

      return null;
    } catch (error) {
      console.error('Error marking bead:', error);
      return null;
    }
  };

  return markBead;
};

export default useBeadMark;
