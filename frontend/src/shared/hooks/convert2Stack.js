import { Tiff } from 'tiff.js';

export const convert3DTifToTiffStack = async (inputFile, outputPrefix) => {
  try {
    // Read the 3D image from the input .tif file
    const response = await fetch(inputFile);
    const arrayBuffer = await response.arrayBuffer();
    const tiff = new Tiff({ buffer: arrayBuffer });

    const stack = [];
    const count = tiff.countDirectory();

    // Save each slice of the stack as a separate .tiff file
    for (let i = 0; i < count; i++) {
      tiff.setDirectory(i);
      const canvas = tiff.toCanvas();
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      stack.push(imageData);
    }

    // Convert the stack to separate .tiff files
    for (let i = 0; i < stack.length; i++) {
      const outputFileName = `${outputPrefix}_${i + 1}.tiff`;
      const outputTiff = new Tiff({ width: canvas.width, height: canvas.height, array: stack[i] });
      const outputBuffer = outputTiff.toBuffer();
      // Save or process the outputBuffer as desired
    }

    console.log('Conversion successful!');
    return stack.length; // Return the length of the converted stack
  } catch (error) {
    console.error('Error during conversion:', error);
    return 0; // Return 0 if there is an error
  }
};

// Usage example
const inputFile = 'input.tif';
const outputPrefix = 'output';
const numImages = await convert3DTifToTiffStack(inputFile, outputPrefix);
if (numImages > 1) {
  console.log(numImages); // Display the length of the converted images
}