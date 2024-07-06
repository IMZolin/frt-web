import React, {useEffect, useState} from 'react';
import {DropzoneAreaBase} from 'material-ui-dropzone';
import {Box, Button, CircularProgress, Typography} from '@mui/material';
import useAxiosStore from '../../app/store/axiosStore';
import {base64ToTiff} from '../../shared/hooks/showImages';
import './dropzone.css';

const Dropzone = ({files = [], addFiles, setFiles, addProjections, imageType, state, darkMode}) => {
    const axiosStore = useAxiosStore();
    const [uploading, setUploading] = useState(false);
    const [customButtonColor, setCustomButtonColor] = useState(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
    useEffect(() => {
        if (darkMode) {
            setCustomButtonColor(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark'));
        } else {
            setCustomButtonColor(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
        }
    }, [darkMode]);

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
            const isProjections = addProjections !== null;
            const fileObjects = allFiles.map((file) => file.file);
            const requestData = {
                files: fileObjects,
                image_type: imageType,
                isProjections: isProjections,
            };
            if (imageType !== 'avg_bead' || imageType !== 'psf') {
                requestData.voxelXY = state.voxelXY;
                requestData.voxelZ = state.voxelZ;
            }
            const response = await axiosStore.postData(requestData);
            console.log('Response:', response);
            window.alert('Files uploaded successfully');

            if (response.image_show !== null) {
                const newData = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `${response.image_type}_${index}.tiff`);
                });
                setFiles(newData);

                if (isProjections) {
                    const projection = response.projections.map((base64Data, index) => {
                        return base64ToTiff(base64Data, 'image/tiff', `${response.image_type}_${index}.tiff`);
                    });
                    addProjections(projection);
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
                    <Box className='custom-dropzone' px={16} py={6} display="flex" flexDirection="column"
                         justifyContent="center" alignItems="center" gridGap={4}>
                        {uploading && (
                            <Box className='custom-dropzone-loader' display="flex" flexDirection="column"
                                 justifyContent="center" alignItems="center">
                                <CircularProgress size="2rem"/>
                            </Box>
                        )}
                        <Typography variant="subtitle1">Drop your file here</Typography>
                        <Typography>or</Typography>
                        <Box mt={1}>
                            <Button
                                variant="contained"
                                style={{
                                    backgroundColor: customButtonColor,
                                    padding: "12px 12px",
                                    fontSize: "14px",
                                    width: 125
                                }}
                            >
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
                sx={{backgroundColor: 'transparent'}}
            />
        </>
    );
};

export default Dropzone;
