import React, { useEffect } from 'react';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import useAxiosStore from '../../app/store/axiosStore';
import { base64ToTiff } from '../../shared/hooks/showImages';

const Dropzone = ({ files, addFiles, filesDownload, addFilesDownload, imageType, state }) => {
  const axiosStore = useAxiosStore();

  const handleAddFiles = async (newFiles) => {
    const updatedFiles = newFiles.map((file) => {
      file.id = Math.floor(Math.random() * 10000);
      return file;
    });
    const allFiles = [...files, ...updatedFiles];
    addFiles(allFiles);
    state.setIsLoad(true); 

    try {
      let formData = new FormData();
      const fileObjects = allFiles.map((file) => file.file);

      fileObjects.forEach((file) => {
        formData.append('file', file);
      });
      
      const requestData = {
        file: fileObjects,
        image_type: imageType,
        voxelX: null,
        voxelY: null,
        voxelZ: null,
      };

      // TODO : Maybe delete these conditions? We use voxel info with any loaded images 'cauze of we need this info to create 'ImageRaw' instance...  
      if (imageType.includes('beads_image') || 
          imageType.includes('averaged_bead') || 
          imageType.includes('extracted_PSF') ||
          imageType.includes('source_img')) {
        requestData.voxelX = state.voxelX;
        requestData.voxelY = state.voxelY;
        requestData.voxelZ = state.voxelZ;
      }

      const response = await axiosStore.postData(requestData);
      console.log('Response:', response);
      if (response.muli_layer_show && response.muli_layer_save){
        const file = base64ToTiff(response.muli_layer_save, 'image/tiff', `extracted_psf.tiff`);
        const newExtractPSF = response.muli_layer_show.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `extracted_psf_${index}.tiff`);
        });
        state.setExtractedPSF(newExtractPSF);
        state.setExtractedPSFSave([file]);
        addFiles(allFiles);
        addFilesDownload(allFiles);
      }
      if (response && response.resolution && Array.isArray(response.resolution)) {
        state.setResolution(response.resolution); 
      } else {
        console.log('Invalid resolution data in the response:', response);
      }
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  const handleDeleteFile = (deletedFile) => {
    const updatedFiles = files.filter((file) => file.id !== deletedFile.id);
    addFiles(updatedFiles);
    state.setIsLoad(updatedFiles.length > 0); 
  };

  return (
    <>
      <DropzoneAreaBase
        fileObjects={files}
        showPreviewsInDropzone={true}
        useChipsForPreview
        onAdd={handleAddFiles}
        onDelete={handleDeleteFile}
        acceptedFiles={['.tif', '.tiff']}
        maxFileSize={Infinity}
        filesLimit={Infinity}
      />
    </>
  );
};

export default Dropzone;
