import {base64ToTiff} from "../../shared/hooks/showImages";
import useAxiosStore from "./axiosStore";


// eslint-disable-next-line react-hooks/rules-of-hooks
const axiosStore = useAxiosStore();

const setData = async (response, image_type, setImage, setImageSave, setImageProjections, setIsLoad) => {
  console.log('Response:', response);
  if (response.image_show && response.image_save && response.projections) {
    const file = base64ToTiff(response.image_save, 'image/tiff', `psf.tif`);
    const imageShow = response.image_show.map((base64Data, index) => {
      return base64ToTiff(base64Data, 'image/tiff', `psf_${index}.tiff`);
    });
    const imageProjections = response.projections.map((base64Data, index) => {
      return base64ToTiff(base64Data, 'image/tiff', `psf_xyz_${index}.tiff`);
    });
    setImage(imageShow);
    setImageSave([file]);
    if (setImageProjections !== null){
      setImageProjections(imageProjections);
    }
    if (setIsLoad !== null){
      setIsLoad(true);
    }
  } else {
    console.log(`No ${image_type} found in the response.`);
    window.alert(`No ${image_type} found in the response.`);
  }
}

const handleGetData = async (imageType, setImage, setImageSave, setImageProjections, setIsLoad) => {
    try {
      const response = await axiosStore.getData(imageType);
      await setData(
          response,
          imageType,
          setImage,
          setImageSave,
          setImageProjections,
          setIsLoad
      )
    } catch (error) {
      console.error(`Error fetching ${imageType}:`, error);
      window.alert(`Error fetching ${imageType}: ${error}`);
    }
  };

const handleGetVoxel = async (setVoxelXY, setVoxelZ) => {
  try {
    const response = await axiosStore.getVoxel();
    console.log('Response:', response);

    if (response.voxel) {
      setVoxelZ(response.voxel[0]);
      setVoxelXY(response.voxel[1]);
    } else {
      console.log('No voxel data found in the response.');
      window.alert('No voxel data found in the response.');
    }
  } catch (error) {
    console.error('Error fetching voxel:', error);
    window.alert('Error fetching voxel:', error);
  }
};

const handleRLDeconvolve = async (setResult, setResultSave, iterations, regularization, deconMethod) => {
    console.log("Im trying make deconvolve");
    window.alert("Im trying make deconvolve");
    try {
      const requestData = {
        iterations: iterations,
        regularization: regularization,
        decon_method: deconMethod
      };
      const response = await axiosStore.rlDeconImage(requestData);
      const imageType = 'rl_decon_result';
      await setData(
          response,
          imageType,
          setResult,
          setResultSave,
          null,
          null
      )
    } catch (error) {
      console.error('Error in RL deconvolution:', error);
      window.alert('Error in RL deconvolution: ' + error);
    }
  };

const handleCNNDeconvolve = async (setResult, setResultSave) => {
    console.log("Im trying make deconvolve");
    window.alert("Im trying make deconvolve");
    try {
      const response = await axiosStore.cnnDeconImage();
      const imageType = 'cnn_decon_result';
      await setData(
          response,
          imageType,
          setResult,
          setResultSave,
          null,
          null
      )
    } catch (error) {
      console.error('Error in CNN deconvolution:', error);
      window.alert('Error in CNN deconvolution: ' + error);
    }
  };


export { handleGetData, handleGetVoxel, handleRLDeconvolve, handleCNNDeconvolve };