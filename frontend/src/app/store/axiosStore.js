import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;

const useAxiosStore = create((set, get) => {
  const BASE_URL = 'http://localhost:8000';
  
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
  });

  return {
    axiosInstance,

    postData: async (data) => {
      try {
        const response = await axiosInstance.post('/api/load_image/', data, {
          headers: {
            'content-type': 'multipart/form-data'
          }
        });
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
