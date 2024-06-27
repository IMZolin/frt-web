import React, { useState } from 'react';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import useAxiosStore from '../../app/store/axiosStore';
import { base64ToTiff } from '../../shared/hooks/showImages';
import './dropzone.css';

const Dropzone = ({ files, addFiles, imageType, state, saveImage = false }) => {
  const axiosStore = useAxiosStore();
  const [uploading, setUploading] = useState(false);

  const handleAddFiles = async (newFiles) => {
    const updatedFiles = newFiles.map((file) => {
      file.id = Math.floor(Math.random() * 10000);
      return file;
    });
    const allFiles = [...files, ...updatedFiles];
    addFiles(allFiles);
    state.setIsLoad(true);
    setUploading(true);

    try {
      let formData = new FormData();
      const fileObjects = allFiles.map((file) => file.file);

      fileObjects.forEach((file) => {
        formData.append('files', file);
      });

      formData.append('image_type', imageType);
      formData.append('save_image', saveImage);

      if (imageType.includes('beads_image') || imageType.includes('source_img') || imageType.includes('averaged_bead') || imageType.includes('extracted_psf')) {
        formData.append('voxel_xy', state.voxelXY);
        formData.append('voxel_z', state.voxelZ);
      }

      const response = await axiosStore.postData(formData);
      console.log('Response:', response);
      window.alert('Files uploaded successfully');

      if (response.image_show) {
        const newData = response.image_show.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `${response.image_type}_${index}.tiff`);
        });


        if (imageType.includes('beads_image')) {
          console.log('Beads Image');
          state.setBeads(newData);
          addFiles(allFiles);
        }
        if (imageType.includes('averaged_bead')) {
          console.log('Average bead');

          const file = base64ToTiff(response.image_save, 'image/tiff', `${response.image_type}.tiff`);
          state.setAverageBead(newData);
          state.setAverageBeadSave([file]);
          addFiles(allFiles);
          const newProjection = response.img_projection.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `${response.image_type}_${index}.tiff`);
          });
          state.setAverageBeadProjection(newProjection);
        }
        if (imageType.includes('extracted_psf')) {
          console.log('Extracted psf');
          const file = base64ToTiff(response.image_save, 'image/tiff', `${response.image_type}.tiff`);
          state.setExtractedPSF(newData);
          state.setExtractedPSFSave([file]);
          addFiles(allFiles);
          const newProjection = response.img_projection.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `${response.image_type}_${index}.tiff`);
          });
          state.setExtractedPSFProjection(newProjection);
        }
        if (imageType.includes('source_img')) {
          console.log('Source image');
          state.setSourceImage(newData);
          addFiles(allFiles);
        }
      }
    } catch (error) {
      console.error('Error posting data:', error);
      window.alert('Error posting data:', error);
    } finally {
      setUploading(false);
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
        Icon={''}
        dropzoneText={
          <Box className='custom-dropzone' px={16} py={6} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gridGap={4} sx={{ backgroundColor: 'transparent' }}>
            {uploading && (
              <Box className='custom-dropzone-loader' display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                <CircularProgress size="2rem" />
              </Box>
            )}
            <Typography variant="subtitle1">Drop your file here</Typography>
            <Typography>or</Typography>
            <Box mt={1}>
              <Button color="primary" variant="outlined" style={{ width: 125 }}>
                Select File
              </Button>
            </Box>
            <Box mt={1}>
              <Typography>
                Accepted file types: <strong>.tif, .tiff</strong>
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography>
                Maximum file size: <strong>1Gb</strong>
              </Typography>
            </Box>
          </Box>
        }
        sx={{ backgroundColor: 'transparent' }}
      />
    </>
  );
};

export default Dropzone;
