import {create} from 'zustand';
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
            const {files, image_type, voxel_xy, voxel_z, get_projections} = params;

            let formData = new FormData();
            console.log(params);
            files.forEach((fileItem) => {
                formData.append('files', fileItem);
            });

            formData.append('image_type', image_type);
            formData.append('get_projections', get_projections);
            if (voxel_xy !== null && voxel_z !== null) {
                formData.append('voxel_xy', parseFloat(voxel_xy));
                formData.append('voxel_z', parseFloat(voxel_z));
            }
            try {
                const response = await axiosInstance.post('/api/load_image/', formData);
                return response.data;
            } catch (error) {
                console.error('Error posting data:', error);
                throw error;
            }
        },

        getData: async (params) => {
            try {
                const { image_type, get_projections, get_compressed } = params;
                const response = await axiosInstance.get('/api/get_image/', {
                    params: {
                        image_type,
                        get_projections,
                        get_compressed
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching data:', error);
                throw error;
            }
        },


        postAutosegmentBeads: async (params) => {
            try {
                const { max_area } = params;
                let formData = new FormData();
                formData.append('max_area', max_area);
                const response = await axiosInstance.post('/api/autosegment_beads/', formData);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        calcAverageBead: async (params) => {
            try {
                const { denoise_type, new_coords } = params;
                let formData = new FormData();
                formData.append('denoise_type', denoise_type);
                formData.append('new_coords', new_coords);
                const response = await axiosInstance.post('/api/average_beads/', formData);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        calcPSF: async (params) => {
            try {
                const {bead_size, iterations, regularization, zoom_factor, decon_method} = params;
                let formData = new FormData();
                formData.append('bead_size', bead_size);
                formData.append('iterations', iterations);
                formData.append('regularization', regularization);
                formData.append('zoom_factor', zoom_factor);
                formData.append('decon_method', decon_method);
                const response = await axiosInstance.post('/api/calculate_psf/', formData);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        rlDeconImage: async (params) => {
            try {
                const {iterations, regularization, decon_method} = params;
                let formData = new FormData();
                formData.append('iterations', iterations);
                formData.append('regularization', regularization);
                formData.append('decon_method', decon_method);
                const response = await axiosInstance.post('/api/rl_decon_image/', formData);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        preprocessImage: async (denoise_type) => {
            try {
                let formData = new FormData();
                formData.append('denoise_type', denoise_type);
                const response = await axiosInstance.post('/api/preprocess_image/', formData);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        cnnDeconImage: async () => {
            try {
                const response = await axiosInstance.post('/api/cnn_decon_image/');
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        getVoxel: async () => {
            try {
                const response = await axiosInstance.get('/api/get_voxel/');
                return response.data;
            } catch (error) {
                throw error;
            }
        },
    };
});

export default useAxiosStore;
