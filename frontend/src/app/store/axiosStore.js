import { create } from 'zustand';
import axios from 'axios';

const useAxiosStore = create((set, get) => {
  const BASE_URL = 'http://localhost:8000';
  
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
  });

  return {
    axiosInstance,

    fetchData: async () => {
      try {
        const response = await axiosInstance.get('/api/data');
        return response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    },
    
    postData: async (data) => {
      try {
        const response = await axiosInstance.post('/api/load_image/', data);
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
