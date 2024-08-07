import base64
import io
import json
from typing import List, Tuple, Union

from web.backend.engine.src.common.AuxTkPlot_class import AuxCanvasPlot
from web.backend.engine.src.common.ImageRaw_class import ImageRaw
from web.backend.engine.src.deconvolutor.decon_image_model import DeconImageModel
from web.backend.engine.src.deconvolutor.decon_psf_model import DeconPsfModel
from web.backend.engine.src.extractor.extractor_model import ExtractorModel
from web.backend.file_manager.redis_manager import get_cache_data


async def get_bead_coords():
    try:
        bead_coords = await get_cache_data('bead_coords', is_dict_data=False)
        if bead_coords is not None and len(bead_coords) > 0:
            return json.loads(bead_coords)
        else:
            return []
    except Exception as e:
        raise Exception(f"Error in get_bead_coords: {e}")


async def init_bead_extractor(beads_img: ImageRaw, coords: List[Tuple[int, int]] = None) -> ExtractorModel:
    bead_extractor = ExtractorModel()
    bead_extractor.mainImage = beads_img
    bead_coords = await get_bead_coords()
    bead_extractor.beadCoords = bead_coords if coords is None else coords
    return bead_extractor


async def rl_deconvolution(model: Union[DeconPsfModel, DeconImageModel], iterations: int,
                           regularization: float, decon_method: str) -> ImageRaw:
    try:
        model.iterationNumber = int(iterations)
        model.regularizationParameter = float(regularization)
        if isinstance(model, DeconPsfModel):
            model.CalculatePSF(deconMethodIn=decon_method)
            res = model.resultImage
        else:
            model.DeconvolveImage(deconMethodIn=decon_method)
            res = model.deconResult.mainImageRaw
        return res
    except Exception as e:
        raise Exception(f"Error in rl_deconvolution: {e}")


def generate_projections(image_raw):
    try:
        img_buf = io.BytesIO()
        projections = AuxCanvasPlot.FigurePILImagekFrom3DArray(image_raw.GetIntensities())
        if projections is None:
            return None
        projections.save(img_buf, format='TIFF')
        img_buf.seek(0)
        base64_string = base64.b64encode(img_buf.getvalue()).decode('utf-8')
        return [base64_string]
    except Exception as e:
        raise Exception(f"Error in generate_projections: {e}")