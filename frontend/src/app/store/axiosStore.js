import create from 'zustand'
import axios from 'axios';

const useAxiosStore = create((set, get) => ({
    axiosInstance: axios.create({
      baseURL: 'http://qfbi.ddns.net:8080/api/v1',
    }),

    setAxiosToken: (newToken) => {
      const instance = get().axiosInstance
        if (newToken != null){
          instance.defaults.headers.common['Authorization'] = "Bearer " + newToken
        }
        else{
          instance.defaults.headers.common['Authorization'] = undefined;
        }
        set({axiosInstance: instance})
    },

    isAuthorized: () => {
      const instance = get().axiosInstance
        console.log(instance.defaults.headers.common)
        return instance.defaults.headers.common['Authorization'] !== undefined
    },

    isRegistered: () => {
      const instance = get().axiosInstance
        console.log(instance.defaults.headers.common)
        return instance.defaults.headers.common['Registration'] !== undefined
    }
  }))

export default useAxiosStore;