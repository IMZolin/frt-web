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



  