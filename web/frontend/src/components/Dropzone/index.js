import React, { useState, useEffect } from 'react';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import useAxiosStore from '../../app/store/axiosStore';
import { base64ToTiff } from '../../shared/hooks/showImages';
import './dropzone.css';
import SurveyBanner from "../SurveyBanner";

const Dropzone = ({
  files = [],
  addFiles,
  setFiles,
  nameImage,
  getProjections,
  addProjections,
  imageType,
  makePreload,
  state
}) => {
  const axiosStore = useAxiosStore();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (makePreload) {
      const handleGetImage = async () => {
        try {
          const response = await axiosStore.getData({
            image_type: imageType,
            get_projections: getProjections,
            is_compress: true
          });
          console.log('Response:', response);

          if (response.image_show !== null) {
            state.setBanner({ status: 'success', message: `${nameImage} preloaded successfully` });
            const newData = response.image_show.map((base64Data, index) => {
              return base64ToTiff(base64Data, 'image/tiff', `${imageType}_${index}.tiff`);
            });
            setFiles(newData);
            if (getProjections && response.projections !== null) {
              const projection = response.projections.map((base64Data, index) => {
                return base64ToTiff(base64Data, 'image/tiff', `${imageType}_xyz_${index}.tiff`);
              });
              addProjections(projection);
            }
            state.setIsLoad(true);
          } else {
            console.log(`No ${nameImage} data found in the response.`);
            state.setBanner({ status: 'info', message: `Cache not found (${nameImage}): ${response.message}` });
          }
        } catch (error) {
          console.error(`Error fetching ${nameImage}:`, error);
          state.setBanner({ status: 'info', message: `Cache not found (${nameImage}): ${error}` });
        }
      };
      handleGetImage();
    }
  }, [makePreload]);

  const handleAddFiles = async (newFiles) => {
    files = [];
    const updatedFiles = newFiles.map((file) => {
      file.id = Math.floor(Math.random() * 10000);
      return file;
    });
    const allFiles = [...files, ...updatedFiles];
    addFiles(allFiles);
    state.setIsLoad(true);
    setUploading(true);

    try {
      const fileObjects = allFiles.map((file) => file.file);
      const response = await axiosStore.postData({
        files: fileObjects,
        image_type: imageType,
        get_projections: getProjections,
        voxel_xy: state.voxelXY,
        voxel_z: state.voxelZ
      });

      if (response.image_show !== null) {
        state.setBanner({ status: 'success', message: `${nameImage} uploaded successfully` });

        const newData = response.image_show.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `${response.image_type}_${index}.tiff`);
        });
        setFiles(newData);
        if (getProjections && response.projections !== null) {
          const projection = response.projections.map((base64Data, index) => {
            return base64ToTiff(base64Data, 'image/tiff', `${response.image_type}_${index}.tiff`);
          });
          addProjections(projection);
        }
      } else {
        state.setBanner({ status: 'error', message: `Error: ${response.message}` });
      }
    } catch (error) {
      console.error('Error posting data:', error);
      state.setBanner({ status: 'error', message: `Error posting data: ${error.message}` });
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
      {state.banner.status &&
        <SurveyBanner status={state.banner.status} message={state.banner.message} onClose={state.closeBanner} />}

      <DropzoneAreaBase
        fileObjects={files}
        showPreviewsInDropzone={true}
        useChipsForPreview
        onAdd={handleAddFiles}
        onDelete={handleDeleteFile}
        acceptedFiles={['.tif', '.tiff']}
        maxFileSize={Infinity}
        filesLimit={Infinity}
        Icon={'null'}
        dropzoneText={
          <Box
            className='custom-dropzone'
            px={16}
            py={6}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gridGap={4}
          >
            {uploading && (
              <Box className='custom-dropzone-loader' display="flex" flexDirection="column"
                   justifyContent="center" alignItems="center">
                <CircularProgress size="2rem"/>
              </Box>
            )}
            {!uploading && (
              <>
                <Typography className="custom-dropzone-text" variant="h3" color="inherit" textAlign="center">
                  Drag and Drop to Add File
                </Typography>
                <Typography className="custom-dropzone-text" variant="h5" color="inherit">
                  Or
                </Typography>
                <Button className="custom-dropzone-button" color="inherit" variant="outlined">
                  Browse Files
                </Button>
              </>
            )}
          </Box>
        }
      />
    </>
  );
};

export default Dropzone;
