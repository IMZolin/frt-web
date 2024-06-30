import json
import os
import tempfile
from typing import List, Optional

import numpy as np
from fastapi import UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi import APIRouter

from web.backend.engine.src.cnn.cnn_deconv_model import CNNDeconvModel
from web.backend.engine.src.common.DenoiseImage_class import ImageDenoiser
from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.engine.src.deconvolutor.decon_image_model import DeconImageModel
from web.backend.engine.src.deconvolutor.decon_psf_model import DeconPsfModel
from web.backend.utils import save_result, get_data, init_bead_extractor, rl_deconvolution, get_source_img, pass2cache

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
        response_content = await save_result(image=image_data, image_type=image_type,
                                             convert_type='both' if save_image else 'compress',
                                             is_projections=is_projections)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        temp_dir.cleanup()


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


@router.get("/api/autosegment_beads/")
async def autosegment_beads(max_area: int = Form(...)):
    try:
        bead_extractor = await init_bead_extractor()
        if bead_extractor is None:
            raise HTTPException(status_code=400, detail="Bead extractor initialization failed")
        bead_extractor.maxArea = max_area
        bead_extractor.AutoSegmentBeads()
        print(len(bead_extractor.beadCoords), type(bead_extractor.beadCoords))
        response_content = {'bead_coords', bead_extractor.beadCoords}
        pass2cache("bead_extractor", response_content)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/average_beads/")
async def average_beads(denoise_type: str = Form(...)):
    try:

        if denoise_type is None or denoise_type not in ["Gaussian", "Median", "Wiener", "Totaial Vartion",
                                                        "Non-Local Means", "Bilateral", "Wavelet", "none"]:
            raise HTTPException(status_code=404, detail="Incorrect denoise type not found in the cache.")
        bead_extractor = await init_bead_extractor()
        if bead_extractor is None:
            raise HTTPException(status_code=400, detail="Bead extractor initialization failed")
        if bead_extractor.beadCoords is None or len(bead_extractor.beadCoords) == 0:
            raise HTTPException(status_code=404, detail="The bead coordinates not found in the cache. Maybe the "
                                                        "time is up. Try it again or segment beads.")
        for coord in bead_extractor.beadCoords:
            bead_extractor.MarkedBeadExtract(coord)
        bead_extractor.BeadsArithmeticMean()
        bead_extractor.BlurAveragedBead(denoise_type)
        avg_bead = bead_extractor.averageBead
        response_content = await save_result(image=avg_bead, image_type='avg_bead', convert_type='both',
                                             is_projections=True)
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
        if bead_size < 0 or iterations <= 0 or regularization < 0:
            raise HTTPException(status_code=422, detail="Incorrect PSF calculation params")
        if decon_method is None or decon_method not in ["RL", "RLTMR", "RLTVR"]:
            raise HTTPException(status_code=404, detail="Incorrect decon type not found in the cache.")
        psf_calculator = DeconPsfModel()
        avg_bead_cache = await get_data('avg_bead')
        if avg_bead_cache is None:
            raise HTTPException(status_code=404, detail="The averaged bead was not found in the cache. Maybe the time "
                                                        "is up. Upload it again.")
        psf_calculator.SetPSFImage(array=np.array(json.loads(avg_bead_cache["image_intensities"])),
                                   voxel=json.loads(avg_bead_cache["voxel"]))
        psf_calculator.beadDiameter = bead_size
        if zoom_factor is not None:
            psf_calculator.zoomFactor = zoom_factor
        psf = await rl_deconvolution(model=psf_calculator, iterations=iterations, regularization=regularization,
                                     decon_method=decon_method)
        response_content = await save_result(image=psf, image_type='psf', convert_type='both', is_projections=False)
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
        if iterations <= 0 or regularization < 0:
            raise HTTPException(status_code=422, detail="Incorrect RL deconvolution params")
        if decon_method is None or decon_method not in ["RL", "RLTMR", "RLTVR"]:
            raise HTTPException(status_code=404, detail="Incorrect decon type not found in the cache.")
        source_cache = await get_source_img()
        if source_cache is None:
            raise HTTPException(status_code=404, detail="The source image not found in the cache. Maybe the time is "
                                                        "up. Upload it again.")
        rl_deconvolver = DeconImageModel()
        psf_cache = await get_data('psf')
        if psf_cache is None:
            raise HTTPException(status_code=404, detail="The PSF not found in the cache. Maybe the time is up. "
                                                        "Download it again.")
        rl_deconvolver.SetDeconPsf(array=np.array(json.loads(psf_cache["image_intensities"])),
                                   voxel=json.loads(psf_cache["voxel"]))
        rl_deconvolver.SetDeconImage(array=np.array(json.loads(source_cache["image_intensities"])),
                                     voxel=json.loads(source_cache["voxel"]))
        rl_img = await rl_deconvolution(model=rl_deconvolver, iterations=iterations, regularization=regularization,
                                        decon_method=decon_method)
        response_content = await save_result(image=rl_img, image_type='rl_decon_img', convert_type='both',
                                             is_projections=False)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/preprocess_image/")
async def preprocess_image(denoise_type: str = Form(...)):
    try:
        if denoise_type not in ["Gaussian", "Median", "Wiener", "Totaial Vartion", "Non-Local Means", "Bilateral", "Wavelet", "none"]:
            raise HTTPException(status_code=404, detail="Incorrect denoise type not found in the cache.")
        noisy_cache = await get_data('source_img')
        if noisy_cache is None:
            raise HTTPException(status_code=404, detail="The source image not found in the cache. Maybe the time is "
                                                        "up. Upload it again.")
        noisy_image = np.array(json.loads(noisy_cache["image_intensities"]))
        noisy_image = noisy_image.astype(np.uint8)
        denoiser = ImageDenoiser()
        denoised_image = denoiser.denoise(noisy_image)
        response_content = await save_result(image=denoised_image, image_type='denoised_img', convert_type='both',
                                             is_projections=False)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/cnn_decon_image/")
async def cnn_decon_image():
    try:
        source_cache = await get_source_img()
        if source_cache is None:
            raise HTTPException(status_code=404, detail="The source image not found in the cache. Maybe the time is "
                                                        "up. Upload it again.")
        cnn_deconvolver = CNNDeconvModel()
        cnn_deconvolver.SetDeconImage(array=np.array(json.loads(source_cache["image_intensities"])),
                                      voxel=json.loads(source_cache["voxel"]))
        cnn_deconvolver.DeconvolveImage()
        decon_img = cnn_deconvolver.deconResult
        response_content = await save_result(image=decon_img, image_type='cnn_decon_img', convert_type='both',
                                             is_projections=False)
        return JSONResponse(content=response_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
