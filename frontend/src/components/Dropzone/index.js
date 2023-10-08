import React, { useEffect } from 'react';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import useAxiosStore from '../../app/store/axiosStore';
import { base64ToTiff } from '../../shared/hooks/showImages';

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
      if (imageType.includes('beads_image') || imageType.includes('source_img')|| imageType.includes('averaged_bead') || imageType.includes('extracted_psf')) {
        requestData.voxelX = state.voxelX;
        requestData.voxelY = state.voxelY;
        requestData.voxelZ = state.voxelZ;
      }

      const response = await axiosStore.postData(requestData);
      console.log('Response:', response);
      window.alert('Files uploaded successfully');
      if (response.multi_layer_show && response.multi_layer_save){
        console.log("Multi Layer");
        const file = base64ToTiff(response.multi_layer_save, 'image/tiff', `${response.image_type}.tiff`);
        const newData = response.multi_layer_show.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `${response.image_type}_${index}.tiff`);
        });
        if (imageType.includes('beads_image')){
          console.log('Beads Image');
          state.setBeads(newData);
          state.setBeadsSave([file]);
          addFiles(allFiles);
          const newProjection = response.img_projection.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `beads_xyz_${index}.tiff`);
          });
          state.setAverageBeadProjection(newProjection);
        }
        if (imageType.includes('averaged_bead')){
          console.log('Average bead');
          state.setAverageBead(newData);
          state.setAverageBeadSave([file]);
          addFiles(allFiles);
          const newProjection = response.img_projection.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `avg_bead_xyz_${index}.tiff`);
          });
          state.setAverageBeadProjection(newProjection);
        }
        if (imageType.includes('extracted_psf')){
          console.log('Extracted psf');
          state.setExtractedPSF(newData);
          state.setExtractedPSFSave([file]);
          addFiles(allFiles);
          const newProjection = response.img_projection.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `psf_xyz_${index}.tiff`);
          });
          state.setExtractedPSFProjection(newProjection);
        }
        if (imageType.includes('source_img')){
          console.log('Source image');
          state.setSourceImage(newData);
          console.log(state.sourceImage);
          state.setSourceImageSave([file]);
          addFiles(allFiles);
          const newProjection = response.img_projection.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `source_image_xyz_${index}.tiff`);
          });
          state.setSourceImageProjection(newProjection);
        }
      }
      if (response && response.resolution && Array.isArray(response.resolution)) {
        state.setResolution(response.resolution); 
      } else {
        console.log('Invalid resolution data in the response:', response);
        window.alert('Invalid resolution data in the response:', response);
      }
    } catch (error) {
      console.error('Error posting data:', error);
      window.alert('Error posting data:', error);
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
