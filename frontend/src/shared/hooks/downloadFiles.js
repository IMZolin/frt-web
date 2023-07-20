import JSZip from 'jszip';

export const downloadFiles = (fileList, fileName, parameter) => {
  if (parameter === 'single') {
    if (Array.isArray(fileList)) {
      console.log('single file download');
      const combinedFile = new Blob(fileList, { type: 'image/tiff' });
      const url = URL.createObjectURL(combinedFile);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${fileName}.tiff`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } else {
      console.log('single file download 2');
      // Single file download
      const url = URL.createObjectURL(fileList);

      // Create an anchor element and trigger the download
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${fileName}.tiff`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  } else if (parameter === 'folder') {
    console.log('folder download');
    // Create a zip file to contain the list of files
    const zip = new JSZip();
    fileList.forEach((file, index) => {
      zip.file(`${fileName}_${index + 1}.tiff`, file);
    });

    // Generate the zip file
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const url = URL.createObjectURL(content);

      // Create an anchor element and trigger the download
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${fileName}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    });
  } else {
    console.error('Invalid parameter. Please use "single" or "folder".');
  }
};