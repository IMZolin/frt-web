import os
import tempfile
from typing import List, Optional

from fastapi import UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi import APIRouter

from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.utils import tiff2base64

router = APIRouter()


@router.post("/api/load_image/")
async def load_image(
        files: List[UploadFile] = File(),
        image_type: str = Form(...),
        voxel_xy: Optional[float] = Form(None),
        voxel_z: Optional[float] = Form(None),
        save_image: bool = Form(False)
):
    temp_dir = tempfile.TemporaryDirectory()
    try:
        file_paths = []
        for file in files:
            temp_file = os.path.join(temp_dir.name, file.filename)
            with open(temp_file, "wb") as f:
                f.write(await file.read())
            file_paths.append(temp_file)
        if not file_paths:
            raise HTTPException(status_code=422, detail="No file uploaded")
        if not image_type:
            raise HTTPException(status_code=422, detail="Image type not provided")
        if voxel_xy is not None and voxel_z is not None:
            image_data = ImageRaw(fpath=file_paths, voxelSizeIn=[voxel_z, voxel_xy, voxel_xy])
        else:
            image_data = ImageRaw(fpath=file_paths)
        image_tiff = image_data.SaveAsTiff()
        images_show, images_save = tiff2base64(image=image_tiff, is_save=save_image)
        response_content = {'message': f'Image {image_type} loaded successfully', 'image_show': images_show}
        if save_image:
            response_content['image_save'] = images_save
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
