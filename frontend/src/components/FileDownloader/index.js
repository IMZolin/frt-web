import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button, TextField } from '@mui/material';

const FileDownloader = ({ fileList, folderName }) => {
  const handleDownload = () => {
    const zip = new JSZip();

    // Add each file to the zip folder
    fileList.forEach((file, index) => {
      const fileName = `file_${index + 1}.tiff`; // You can customize the naming convention here
      zip.file(fileName, file);
    });

    // Generate and save the zip file
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `${folderName}.zip`);
    });
  };

  return (
    <div>
      <Button onClick={handleDownload} variant="outlined" color="secondary" className="btn-run">Download Files</Button>
    </div>
  );
};

export default FileDownloader;
