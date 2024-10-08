import JSZip from "jszip";
import { saveAs } from 'file-saver';

// Function to download each file in the fileList
export function downloadFile(data, file_name) {
    const blob = dataURLtoBlob(data);
    if (!blob) {
        console.error('Failed to convert base64 data to blob.');
        return;
    }

    return blob;
}

// Helper function to convert base64 data to a Blob
export function dataURLtoBlob(dataURL) {
    if (!dataURL) {
        console.error('Data URL is undefined.');
        return null;
    }

    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
}

export const handleDownloadFile = (fileList, folderName) => {
    if (!fileList || fileList.length === 0) {
      console.error('No files to download.');
      return;
    }

    if (!folderName || typeof folderName !== 'string' || folderName.trim() === '') {
      console.error('Invalid folder name provided.');
      return;
    }

    const zip = new JSZip();
    fileList.forEach(({ data, id }) => {
      console.log(typeof data, data)
      if (data && typeof data === 'string') {
        const file_name = `${folderName}_${id}.tiff`;
        const blob = downloadFile(data, file_name);
        if (blob) {
          // Add the file to the directory
          zip.file(file_name, blob);
        } else {
          console.error(`Invalid data provided for file with id ${id}. Skipping download.`);
        }
      } else {
        console.error(`Invalid data provided for file with id ${id}. Skipping download.`);
      }
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
        // eslint-disable-next-line no-undef
      saveAs(content, `${folderName}.zip`);
    });
  };

