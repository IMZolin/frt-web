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
from web.backend.engine.src.deconvolutor.decon_psf_model import DeconPsfModel
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
        images_show, images_save = await tiff2base64(image=image_tiff,
                                                     convert_type='both' if save_image else 'compress')
        response_content = {'image_show': images_show}
        if save_image:
            response_content['image_save'] = images_save
        if is_projections:
            projections = generate_projections(image_data)
            response_content['projections'] = projections
        response_content['image_intensities'] = image_data.GetIntensities().tolist()
        response_content['voxel'] = image_data.GetVoxel()
        pass2cache(image_type, response_content)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        temp_dir.cleanup()


async def get_data(data_type: str):
    try:
        cache_data = redis_client.hgetall(f"{data_type}")
        if cache_data:
            return cache_data
        else:
            return None
    except Exception as e:
        raise Exception(f"Cache not found: {e}")


@router.get("/api/get_image/")
async def get_image_request(image_type: str = Form(...)):
    try:
        cache_data = await get_data(data_type=image_type)
        if cache_data:
            return JSONResponse(content=cache_data)
        else:
            raise HTTPException(status_code=404, detail="Cache not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


async def init_bead_extractor():
    try:
        beads_cache = await get_data('beads_image')
        if beads_cache is not None:
            bead_extractor = ExtractorModel()
            print(json.loads(beads_cache["voxel"]))
            bead_extractor.SetMainImage(array=np.array(json.loads(beads_cache["image_intensities"])),
                                        voxel=json.loads(beads_cache["voxel"]))
            if bead_extractor is None:
                raise Exception("Bead extractor initialization failed")
            bead_coords = await get_data('bead_coords')
            if bead_coords is not None and len(bead_coords) > 0:
                bead_extractor.beadCoords = bead_coords
            else:
                bead_extractor.beadCoords = []
            return bead_extractor
        else:
            return None
    except Exception as e:
        raise Exception(f"Error in initialization of BeadExtractor: {e}")


@router.get("/api/autosegment_beads/")
async def autosegment_beads(max_area: int = Form(...)):
    try:
        bead_extractor = await init_bead_extractor()
        bead_extractor.maxArea = max_area
        bead_extractor.AutoSegmentBeads()
        print(len(bead_extractor.beadCoords), type(bead_extractor.beadCoords))
        return JSONResponse(content={'bead_coords', bead_extractor.beadCoords})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# @router.post("/api/extract_beads/")
# async def extract_beads(marked_coords: list = Form(...), delete_coords: list = Form(...), box_size: int = Form(...)):
#     try:
#         bead_extractor = await setter_extractor()
#         if bead_extractor is None:
#             raise HTTPException(status_code=400, detail="Bead extractor initialization failed")
#         if bead_extractor.beadCoords is not None and len(bead_extractor.beadCoords) > 0:
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/average_beads/")
async def average_bead(denoise_type: str = Form(...)):
    try:
        bead_extractor = await init_bead_extractor()
        if bead_extractor is None:
            raise HTTPException(status_code=400, detail="Bead extractor initialization failed")
        if bead_extractor.beadCoords is not None and len(bead_extractor.beadCoords) > 0:
            for coord in bead_extractor.beadCoords:
                bead_extractor.MarkedBeadExtract(coord)
            bead_extractor.BeadsArithmeticMean()
            bead_extractor.BlurAveragedBead(denoise_type)
            avg_bead = bead_extractor.averageBead
            image_tiff = avg_bead.SaveAsTiff()
            images_show, images_save = await tiff2base64(image=image_tiff, convert_type='both')
            response_content = {'image_show': images_show, 'image_save': images_save,
                                'projections': generate_projections(avg_bead),
                                'image_intensities': avg_bead.GetIntensities().tolist(), 'voxel': avg_bead.GetVoxel()}
            pass2cache('avg_bead', response_content)
            return JSONResponse(content=response_content)
        else:
            raise HTTPException(status_code=400, detail="Bead coordinates not defined")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/calculate_psf/")
async def calculate_psf(
        bead_size: int = Form(...),
        iterations: int = Form(...),
        regularization: float = Form(...),
        zoom_factor: Optional[float] = Form(),
        decon_method: str = Form(...)
):
    psf_calculator = DeconPsfModel()
    avg_bead_cache = await get_data('avg_bead')
    psf_calculator.SetPSFImage(array=np.array(json.loads(avg_bead_cache["image_intensities"])), voxel=json.loads(avg_bead_cache["voxel"]))
    psf_calculator.beadDiameter = int(bead_size)
    psf_calculator.iterationNumber = int(iterations)
    psf_calculator.regularizationParameter = float(regularization)
    if zoom_factor is not None:
        psf_calculator.zoomFactor = float(zoom_factor)
    psf_calculator.CalculatePSF(deconMethodIn=decon_method, progBarIn=None)


@router.post("/api/rl_decon_image/")
async def rl_decon_image():
    pass


@router.post("/api/preprocess_image/")
async def preprocess_image():
    pass


@router.post("/api/cnn_decon_image/")
async def cnn_decon_image():
    pass
