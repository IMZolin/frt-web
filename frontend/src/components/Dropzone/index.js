import React, { useState } from 'react';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import useAxiosStore from '../../app/store/axiosStore';

const Dropzone = ({ files, addFiles, imageType, state }) => {
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

      if (imageType.includes('beads_image')) {
        requestData.voxelX = state.voxelX;
        requestData.voxelY = state.voxelY;
        requestData.voxelZ = state.voxelZ;
      }

      const response = await axiosStore.postData(requestData);
      console.log('Response:', response);
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
