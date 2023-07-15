import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;

const useAxiosStore = create((set, get) => {
  const BASE_URL = 'http://localhost:8000';
  
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
      const { file, image_type, voxelX, voxelY, voxelZ } = params;
    
      let formData = new FormData();
    
      file.forEach((fileItem) => {
        formData.append('file', fileItem);
      });
      formData.append('image_type', image_type);
    
      if (voxelX && voxelY && voxelZ) {
        formData.append('voxelX', voxelX);
        formData.append('voxelY', voxelY);
        formData.append('voxelZ', voxelZ);
      }
    
      try {
        const response = await axiosInstance.post('/api/load_image/', formData);
        return response.data;
      } catch (error) {
        console.error('Error posting data:', error);
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
