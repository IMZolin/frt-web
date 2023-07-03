import React from 'react';
import { DropzoneAreaBase } from 'material-ui-dropzone';

const Dropzone = ({ files, addFiles }) => {
  const handleAddFiles = (newFiles) => {
    const updatedFiles = newFiles.map((file) => {
      file.id = Math.floor(Math.random() * 10000);
      return file;
    });
    addFiles((prevFiles) => [...prevFiles, ...updatedFiles]);
    
  };

  const handleDeleteFile = (deletedFile) => {
    addFiles((prevFiles) => prevFiles.filter((file) => file.id !== deletedFile.id));
  };

  return (
    <DropzoneAreaBase
      fileObjects={files}
      showPreviewsInDropzone={true}
      useChipsForPreview
      onAdd={handleAddFiles}
      onDelete={handleDeleteFile}
      acceptedFiles={['.tif', '.tiff']}
    />
  );
};

export default Dropzone;
