import json
import os
import tempfile
from typing import List, Optional

import numpy as np
from PIL import Image
from fastapi import UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi import APIRouter

from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.engine.src.extractor.extractor_model import ExtractorModel
from web.backend.utils import tiff2base64, generate_projections, pass2cache, redis_client

router = APIRouter()


@router.post("/api/load_image/")
async def load_image(
        files: List[UploadFile] = File(),
        image_type: str = Form(...),
        voxel_xy: Optional[float] = Form(None),
        voxel_z: Optional[float] = Form(None),
        save_image: bool = Form(False),
        is_projections: bool = Form(False)
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
        response_content = {'image_show': images_show, 'image_data': json.dumps(np.array(image_data).tolist())}
        if save_image:
            response_content['image_save'] = images_save
        if is_projections:
            projections = generate_projections(image_data)
            response_content['projections'] = projections
        pass2cache(image_type, response_content)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        temp_dir.cleanup()


async def get_image(image_type: str):
    try:
        cache_data = redis_client.hgetall(f"{image_type}")
        if cache_data:
            return cache_data
        else:
            return None
    except Exception as e:
        raise Exception(f"Cache not found: {e}")


@router.get("/api/get_image/")
async def get_image_request(image_type: str = Form(...)):
    try:
        cache_data = await get_image(image_type=image_type)
        if cache_data:
            return JSONResponse(content=cache_data)
        else:
            raise HTTPException(status_code=404, detail="Cache not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def init_bead_extractor():
    try:
        beads_cache = await get_image("beads_image")
        if beads_cache is not None:
            beads_image = Image.fromarray(np.array(json.loads(beads_cache['image_data']), dtype='uint8'))
            bead_extractor = ExtractorModel(beads_image)
            return bead_extractor
        else:
            return None
    except Exception as e:
        raise Exception(f"Error in initialization of BeadExtractor: {e}")


@router.post("/api/autosegment_beads/")
async def autosegment_bead(max_area: int = Form(...)):
    try:
        bead_extractor = init_bead_extractor()
        bead_extractor.maxArea = max_area
        bead_extractor.AutoSegmentBeads()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# @router.post("/api/extract_beads/")
# async def extract_beads(new_coords, box_size):
#     try:
#         beads_image = redis_client.hgetall("beads_image")['image_data']
#         old_coords = redis_client.hgetall("bead_coords")['image_data']
#         bead_extractor = ExtractorModel(beads_image)
#         if bead_extractor.beadCoords is not None and len(bead_extractor.beadCoords) > 0:
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/average_beads/")
async def average_bead():
    try:
        beads_image = redis_client.hgetall("beads_image")['image_data']
        extracted_beads = redis_client.hgetall("extracted_beads")
        bead_extractor = ExtractorModel(beads_image)
        bead_extractor.extractedBeads = extracted_beads
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/calculate_psf/")
async def calculate_psf():
    pass


@router.post("/api/rl_decon_image/")
async def rl_decon_image():
    pass

@router.post("/api/preprocess_image/")
async def preprocess_image():
    pass


@router.post("/api/cnn_decon_image/")
async def cnn_decon_image():
    pass