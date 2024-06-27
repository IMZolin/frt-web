import React from 'react';
import { DropzoneAreaBase } from 'material-ui-dropzone';
import useAxiosStore from '../../app/store/axiosStore';

const TmpModelDropzone = ({ files, addFiles, state }) => {
  const axiosStore = useAxiosStore();

  const handleAddFiles = async (newFiles) => {
    const updatedFiles = newFiles.map((file) => {
      file.id = Math.floor(Math.random() * 10000);
      return file;
    });
    const allFiles = [...files, ...updatedFiles];
    addFiles(allFiles);
    state.setIsLoad(true); 
    console.log(allFiles);
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
        acceptedFiles={['.keras', '.hdf5', '.h5']}
        maxFileSize={Infinity}
        filesLimit={Infinity}
      />
    </>
  );
};

export default TmpModelDropzone;
