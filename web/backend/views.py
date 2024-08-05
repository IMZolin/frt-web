import json
import tempfile
from typing import List, Optional

import numpy as np
from fastapi import UploadFile, File, Form, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi import APIRouter

from web.backend.engine.src.cnn.cnn_deconv_model import CNNDeconvModel
from web.backend.engine.src.common.DenoiseImage_class import ImageDenoiser
from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.engine.src.deconvolutor.decon_image_model import DeconImageModel
from web.backend.engine.src.deconvolutor.decon_psf_model import DeconPsfModel
from web.backend.engine_supporter import init_bead_extractor, rl_deconvolution
from web.backend.file_manager.file_handler import save_files
from web.backend.middlewares import valid_method_name, valid_positive_nums
from web.backend.utils import get_cache_data, get_source_img, set_response, save_result, handle_image, pass2cache, \
    clear_cloud

router = APIRouter()


@router.post("/api/load_image/")
async def load_image(
        files: List[UploadFile] = File(),
        image_type: str = Form(...),
        voxel_xy: Optional[float] = Form(None),
        voxel_z: Optional[float] = Form(None),
        get_projections: bool = Form(False)
):
    temp_dir = tempfile.TemporaryDirectory()
    try:
        file_paths = await save_files(files, temp_dir.name)
        if not file_paths:
            raise HTTPException(status_code=422, detail="No file uploaded")
        if not image_type:
            raise HTTPException(status_code=422, detail="Image type not provided")
        if voxel_xy is not None and voxel_z is not None:
            image_data = ImageRaw(fpath=file_paths, voxelSizeIn=[voxel_z, voxel_xy, voxel_xy])
        else:
            image_data = ImageRaw(fpath=file_paths)
        response_content = await set_response(image=image_data, get_projections=get_projections)
        await save_result(image=image_data, image_type=image_type)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        temp_dir.cleanup()


@router.get("/api/get_image/")
async def get_image(image_type: str = Query(...), get_projections: bool = Query(...), get_compressed: Optional[bool] = Query(True)):
    try:
        image_raw = await handle_image(image_type=image_type)
        if not isinstance(image_raw, str):
            response_content = await set_response(image=image_raw, get_projections=get_projections,
                                                  get_compressed=get_compressed)
            if response_content:
                return JSONResponse(content=response_content)
        else:
            raise HTTPException(status_code=404, detail="Cache not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/get_voxel/")
async def get_voxel():
    try:
        psf_cache = await get_cache_data(data_type='psf')
        if psf_cache is None:
            raise HTTPException(status_code=404, detail="The PSF not found in the cache. Maybe the time is up. "
                                                        "Download it again.")
        return JSONResponse(content={'voxel': json.loads(psf_cache["voxel"])})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/autosegment_beads/")
async def autosegment_bead(max_area: int = Form(...)):
    try:
        beads_img = await handle_image(image_type='beads_img')
        bead_extractor = await init_bead_extractor(beads_img)
        bead_extractor.maxArea = max_area
        bead_extractor.AutoSegmentBeads()
        bead_coords = [coord.tolist() if isinstance(coord, np.ndarray) else coord for coord in
                       bead_extractor.beadCoords]
        bead_coords_str = json.dumps(bead_coords)
        pass2cache('bead_coords', bead_coords_str, is_dict_data=False)
        return JSONResponse(content={'bead_coords': bead_coords_str})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/average_beads/")
async def average_beads(denoise_type: str = Form(...), new_coords: Optional[str] = Form(None)):
    try:
        await valid_method_name(method=denoise_type, method_list=["Gaussian", "Median", "Wiener", "Totaial Vartion",
                                                                  "Non-Local Means", "Bilateral",
                                                                  "Wavelet", "none"], method_type="denoise")
        beads_img = await handle_image(image_type='beads_img')
        bead_extractor = await init_bead_extractor(beads_img=beads_img, coords=json.loads(new_coords))
        for center in bead_extractor.beadCoords:
            bead_extractor.MarkedBeadExtract(center)
        bead_extractor.BeadsArithmeticMean()
        bead_extractor.BlurAveragedBead(denoise_type)
        avg_bead = bead_extractor.averageBead
        await save_result(image=avg_bead, image_type='avg_bead')
        response_content = await set_response(image=avg_bead, get_projections=True)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/calculate_psf/")
async def calculate_psf(
        bead_size: float = Form(...),
        iterations: int = Form(...),
        regularization: float = Form(...),
        zoom_factor: Optional[float] = Form(),
        decon_method: str = Form(...)
):
    try:
        await valid_positive_nums(num_list=[bead_size, iterations, regularization], type_params="PSF calculation")
        await valid_method_name(method=decon_method, method_list=["RL", "RLTMR", "RLTVR"], method_type="decon")
        avg_bead_raw = await handle_image(image_type='avg_bead')
        psf_calculator = DeconPsfModel()
        psf_calculator.PSFImage = avg_bead_raw
        psf_calculator.beadDiameter = bead_size
        if zoom_factor is not None:
            psf_calculator.zoomFactor = zoom_factor
        psf = await rl_deconvolution(model=psf_calculator, iterations=iterations, regularization=regularization,
                                     decon_method=decon_method)
        await clear_cloud(image_type='beads_img')
        response_content = await set_response(image=psf, get_projections=True)
        await save_result(image=psf, image_type='psf')
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/rl_decon_image/")
async def rl_decon_image(
        iterations: int = Form(...),
        regularization: float = Form(...),
        decon_method: str = Form(...)
):
    try:
        await valid_positive_nums(num_list=[iterations, regularization], type_params="RL deconvolution")
        await valid_method_name(method=decon_method, method_list=["RL", "RLTMR", "RLTVR"], method_type="decon")
        source_img = await get_source_img()
        psf_raw = await handle_image(image_type='psf')
        rl_deconvolver = DeconImageModel()
        rl_deconvolver.SetDeconPsf(array=psf_raw.GetIntensities(), voxel=psf_raw.GetVoxel())
        rl_deconvolver.SetDeconImage(array=source_img.GetIntensities(), voxel=source_img.GetVoxel())
        rl_img = await rl_deconvolution(model=rl_deconvolver, iterations=iterations, regularization=regularization,
                                        decon_method=decon_method)
        response_content = await set_response(image=rl_img, get_projections=False)
        await save_result(image=rl_img, image_type='rl_decon_img')
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/preprocess_image/")
async def preprocess_image(denoise_type: str = Form(...)):
    try:
        await valid_method_name(method=denoise_type, method_list=["Gaussian", "Median", "Wiener", "Totaial Vartion",
                                                                  "Non-Local Means", "Bilateral",
                                "Wavelet", "none"], method_type="denoise")
        noisy_img = await handle_image(image_type='source_img')
        denoiser = ImageDenoiser()
        denoiser.setDenoiseMethod(denoise_type)
        denoised_img = denoiser.denoise(noisy_img.GetIntensities())
        if denoised_img is None:
            raise HTTPException(status_code=400, detail="Denoising failed")
        denoised_img = ImageRaw(intensitiesIn=denoised_img, voxelSizeIn=noisy_img.GetVoxel())
        response_content = await set_response(image=denoised_img, get_projections=False)
        await save_result(image=denoised_img, image_type='denoised_img')
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/cnn_decon_image/")
async def cnn_decon_image():
    try:
        source_img = await get_source_img()
        cnn_deconvolver = CNNDeconvModel()
        cnn_deconvolver.SetDeconImage(array=source_img.GetIntensities(), voxel=source_img.GetVoxel())
        cnn_deconvolver.DeconvolveImage()
        decon_img = cnn_deconvolver.deconResult
        print(decon_img)
        # print(cnn_deconvolver._deconResult)
        if decon_img is None:
            raise Exception("Deconvolved image is None")
        response_content = await set_response(image=decon_img, get_projections=False)
        await save_result(image=decon_img, image_type='cnn_decon_img')
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
