export function downloadFiles(fileList, filename) {
  // Function to download each file in the fileList
  function downloadFile(data, file_name) {
    const blob = dataURLtoBlob(data);
    if (!blob) {
      console.error('Failed to convert base64 data to blob.');
      return;
    }

    // Create a temporary anchor element to trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = file_name;
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
  }

  // Helper function to convert base64 data to a Blob
  function dataURLtoBlob(dataURL) {
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
    return new Blob([u8arr], { type: mime });
  }

  // Create the folder with the specified 'filename' if it doesn't exist
  if (!fileList || fileList.length === 0) {
    console.error('No files to download.');
    return;
  }

  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    console.error('Invalid folder name provided.');
    return;
  }

  // Start downloading each file in the fileList
  const downloadPromises = fileList.map(({ data, id }) => {
    if (data && typeof data === 'string') { // Check if 'data' exists and is a valid string
      const file_name = `${filename}_${id}.tiff`;
      return downloadFile(data, file_name);
    } else {
      console.error(`Invalid data provided for file with id ${id}. Skipping download.`);
      return null; // Returning null for failed downloads, or you can resolve with a specific error value
    }
  });

  Promise.all(downloadPromises)
    .then(() => {
      console.log('All files downloaded successfully.');
    })
    .catch(error => {
      console.error('An error occurred during file download:', error);
    });
}
