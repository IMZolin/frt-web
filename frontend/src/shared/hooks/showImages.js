import { TIFFViewer } from "react-tiff";
export function toggle(JSX, state){
    return (
      <div>
        {state? JSX: null}
      </div>);
  }

export function toggle_between_jsx(JSX_1,JSX_2, state){
    return (
        <div>
            {state? JSX_1: JSX_2}
        </div>);
}

export function show_images(img_1,img_2){
    return (
      <div>
        <div>
          Before:
          <TIFFViewer key={img_1.id} tiff={img_1.data} />
        </div>
        <div>
          After:
          <TIFFViewer key={img_2.id} tiff={img_2.data} />
        </div>
      </div>
    );
  }

  export function base64ToTiff(base64Data, contentType, name) {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType }, {path: `${name}`})
    const file = new File([blob], `${name}`, { type: 'image/tiff' });
    const id = Math.floor(Math.random() * 10000);
    return {data: `data:image/tiff;base64,${base64Data}`, file: file, id: id};
  }

  export const getImageResolutionFromSize = (fileSizeInBytes, colorDepth, numChannels) => {
    const bitsPerPixel = colorDepth * numChannels;
    const totalPixels = fileSizeInBytes * 8 / bitsPerPixel;
    const resolution = Math.sqrt(totalPixels);
    const width = Math.round(resolution);
    const height = Math.round(resolution);
  
    return { width, height };
  };
  
  // // Example usage
  // const fileSizeInBytes = 1024 * 1024; // 1 MB
  // const colorDepth = 8; // 8-bit (grayscale)
  // const numChannels = 1; // Grayscale image has 1 channel
  
  // const resolution = getImageResolutionFromSize(fileSizeInBytes, colorDepth, numChannels);
  // console.log(resolution); // Output: { width: 1024, height: 1024 }
  