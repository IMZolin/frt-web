import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;

const useAxiosStore = create((set, get) => {
  const isLocalhost = window.location.hostname === 'localhost';
  const BASE_URL = isLocalhost ? 'http://localhost:8000' : 'http://192.168.1.43:8000';


  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
      'Content-Type': 'multipart/form-data'
    }
  });

  return {
    axiosInstance,

    postData: async (params) => {
      const { files, image_type, voxelXY, voxelZ, saveImage, isProjections} = params;

      let formData = new FormData();
      console.log(params);
      files.forEach((fileItem) => {
        formData.append('files', fileItem);
      });

      formData.append('image_type', image_type);
      formData.append('save_image', saveImage);
      formData.append('is_projections', isProjections);
      if (voxelXY !== null && voxelZ !== null) {
        formData.append('voxel_xy', parseFloat(voxelXY));
        formData.append('voxel_z', parseFloat(voxelZ));
      }
      try {
        const response = await axiosInstance.post('/api/load_image/', formData);
        return response.data;
      } catch (error) {
        console.error('Error posting data:', error);
        throw error;
      }
    },

    getData: async (image_type) => {
      try{
        let formData = new FormData();
        formData.append('image_type', image_type);
        const response = await axiosInstance.get('/api/get_image/', formData);
        return response.data;
      } catch(error){
        throw error;
      }
    },

    getAutosegmentBeads: async (max_area) => {
      try{
        let formData = new FormData();
        formData.append('max_area', max_area);
        const response = await axiosInstance.get('/api/autosegment_beads/', formData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    calcAverageBead: async (denoise_type) => {
      try {
        let formData = new FormData();
        formData.append('denoise_type', denoise_type);
        const response = await axiosInstance.post('/api/average_beads/', formData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    postBeadExtract: async (params) => {
      try {
        const response = await axiosInstance.post('/api/bead_extractor/extract/', params);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    postBeadMark: async (params) => {
      try {
        const response = await axiosInstance.post('/api/bead_extractor/mark/', params);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    postPSFExtract: async (params) => {
      try {
        const response = await axiosInstance.post('/api/psf_extractor/extract/', params);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    getPSF: async () => {
      try {
        const response = await axiosInstance.get('/api/deconvolution/psf/');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    getVoxel: async () => {
      try {
        const response = await axiosInstance.get('/api/deconvolution/voxel/');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    postDeconvolution: async (params) => {
      try {
        const response = await axiosInstance.post('/api/deconvolution/run/', params);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    postPreprocessing: async (params) => {
      try {
        const response = await axiosInstance.post('api/cnn_deconv/preprocessing/', params);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    postCNNDeconvolution: async (params) => {
      try {
        const response = await axiosInstance.post('api/cnn_deconv/deconv/', params);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    setAxiosToken: (newToken) => {
      const instance = get().axiosInstance;
      if (newToken != null) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } else {
        delete instance.defaults.headers.common['Authorization'];
      }
      set({ axiosInstance: instance });
    },

    isAuthorized: () => {
      const instance = get().axiosInstance;
      console.log(instance.defaults.headers.common);
      return instance.defaults.headers.common['Authorization'] !== undefined;
    },

    isRegistered: () => {
      const instance = get().axiosInstance;
      console.log(instance.defaults.headers.common);
      return instance.defaults.headers.common['Registration'] !== undefined;
    },
  };
});

export default useAxiosStore;
