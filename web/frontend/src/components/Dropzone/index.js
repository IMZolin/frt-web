import React, { useEffect, useState } from 'react';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import useAxiosStore from '../../app/store/axiosStore';
import { base64ToTiff } from '../../shared/hooks/showImages';
import './dropzone.css';
import SurveyBanner from "../SurveyBanner";


const Dropzone = ({ files = [], addFiles, setFiles, isProjections, addProjections, imageType, state, darkMode }) => {
    const axiosStore = useAxiosStore();
    const [uploading, setUploading] = useState(false);
    const [bannerStatus, setBannerStatus] = useState(null);
    const [bannerMessage, setBannerMessage] = useState('');
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
            const fileObjects = allFiles.map((file) => file.file);
            const response = await axiosStore.postData({
                files: fileObjects,
                image_type: imageType,
                is_projections: isProjections,
                voxel_xy: state.voxelXY,
                voxel_z: state.voxelZ
              });
            console.log(response);

            if (response.image_show !== null) {
                setBannerStatus('success');
                setBannerMessage('Files uploaded successfully');

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
            } else {
                setBannerStatus('error');
                setBannerMessage(`Error: ${response.message}`);
            }
        } catch (error) {
            console.error('Error posting data:', error);
            setBannerStatus('error');
            setBannerMessage(`Error posting data: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFile = (deletedFile) => {
        const updatedFiles = files.filter((file) => file.id !== deletedFile.id);
        addFiles(updatedFiles);
        state.setIsLoad(updatedFiles.length > 0);
    };

    const closeBanner = () => {
        setBannerStatus(null);
        setBannerMessage('');
    };

    return (
        <>
            {bannerStatus && <SurveyBanner status={bannerStatus} message={bannerMessage} onClose={closeBanner} />}

            <DropzoneAreaBase
                fileObjects={files}
                showPreviewsInDropzone={true}
                useChipsForPreview
                onAdd={handleAddFiles}
                onDelete={handleDeleteFile}
                acceptedFiles={['.tif', '.tiff']}
                maxFileSize={Infinity}
                filesLimit={Infinity}
                Icon={null}
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
                dropzoneClass="custom-dropzone"
                dropzoneParagraphClass="custom-dropzone"
                showAlerts={false}
                sx={{
                    backgroundColor: 'transparent',
                    border: `2px solid ${customButtonColor}`,
                    '& .MuiDropzoneArea-root': {
                        borderColor: customButtonColor,
                    }
                }}
            />
        </>
    );
};

export default Dropzone;
