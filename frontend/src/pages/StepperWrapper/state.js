import { useState, useEffect } from "react";

export const defaultValues = {
    files: [],
    averageBeadSave: [],
    extractedPSFSave: [],
    isLoad: false,
    beads: [],
    beadsSave: [],
    extractBeads: [],
    centerExtractBeads: [],
    averageBead: [],
    averageBeadProjection: [],
    extractedPSF: [],
    extractedPSFProjection: [],
    beadSize: 0.2,
    psfFiles: [],
    voxelX: 0.089,
    voxelY: 0.089,
    voxelZ: 0.2,
    resolution: [],
    levelBrightness: 1,
    layer: 0,
    layer2: 0,
    layer3: 0,
    isDeleted: false,
    isRightClick: false,
    selectSize: 36, //px size
    tiffType: '8 bit',
    blurType: 'gauss',
    resolutionXY: 0.022,
    resolutionZ: 0.100,
    scale: 5,
    iter: 50,
    activeStep: 0,
    filename: "",
    maximizeIntensity: true,
    makeGaussianBlur: true,
    gaussianBlurCount: 3,
    regularization: 0.0001,
    deconvMethod: "Richardson-Lucy",
    cnnDeconvModel:"model-1.h5",
    marginTop: 0,

    sourceImage: [],
    sourceImageProjection: [],
    preprocImage: [],
    preprocImageProjection: [],
    preprocImageSave: [],
    resultImage: [],
    resultImageProjection: [],
    resultImageSave: [],
    resolution2: [],
    sourceImageSave: [],
    model: [],
    scaleCompare: 5
};

export const useStateValues = () => {
    //General states
    const [files, addFiles] = useState(defaultValues.files);
    const [isLoad, setIsLoad] = useState(defaultValues.isLoad);
    const [layer, setLayer] = useState(defaultValues.layer);
    const [layer2, setLayer2] = useState(defaultValues.layer2);
    const [layer3, setLayer3] = useState(defaultValues.layer3);
    const [scale, setScale] = useState(defaultValues.scale);
    const [scaleCompare, setScaleCompare] = useState(defaultValues.scaleCompare);
    const [filename, setFilename] = useState(defaultValues.filename);
    const [activeStep, setActiveStep] = useState(defaultValues.activeStep);
    const [resolution, setResolution] = useState(defaultValues.resolution);
    const [resolution2, setResolution2] = useState(defaultValues.resolution2);
    const [marginTop, setMarginTop] = useState(defaultValues.marginTop);
    //Bead extraction
    const [beads, setBeads] = useState(defaultValues.beads);
    const [beadsSave, setBeadsSave] = useState(defaultValues.beadsSave);
    const [voxelX, setVoxelX] = useState(defaultValues.voxelX);
    const [voxelY, setVoxelY] = useState(defaultValues.voxelY);
    const [voxelZ, setVoxelZ] = useState(defaultValues.voxelZ);
    const [levelBrightness, setLevelBrightness] = useState(defaultValues.levelBrightness);
    const [selectSize, setSelectSize] = useState(defaultValues.selectSize);
    const [isDeleted, setIsDeleted] = useState(defaultValues.isDeleted);
    const [isRightClick, setIsRightClick] = useState(defaultValues.isRightClick);
    const [extractBeads, setExtractBeads] = useState(defaultValues.extractBeads);
    const [centerExtractBeads, setCenterExtractBeads] = useState(defaultValues.centerExtractBeads);
    const [averageBead, setAverageBead] = useState(defaultValues.averageBead);
    const [averageBeadProjection, setAverageBeadProjection] = useState(defaultValues.averageBeadProjection);
    const [averageBeadSave, setAverageBeadSave] = useState(defaultValues.averageBead);
    const [extractedPSF, setExtractedPSF] = useState(defaultValues.extractedPSF);
    const [extractedPSFProjection, setExtractedPSFProjection] = useState(defaultValues.extractedPSFProjection);
    const [extractedPSFSave, setExtractedPSFSave] = useState(defaultValues.extractedPSFSave);
    const [tiffType, setTiffType] = useState(defaultValues.tiffType);
    const [blurType, setBlurType] = useState(defaultValues.blurType);

    const [resolutionXY, setResolutionXY] = useState(defaultValues.resolutionXY);
    const [resolutionZ, setResolutionZ] = useState(defaultValues.resolutionZ);

    //PSF
    const [beadSize, setBeadSize] = useState(defaultValues.beadSize);
    const [psfFiles, addPsfFiles] = useState(defaultValues.psfFiles);
    const [iter, setIter] = useState(defaultValues.iter);
    const [regularization, setRegularization] = useState(defaultValues.regularization);
    const [deconvMethod, setDeconvMethod] = useState(defaultValues.deconvMethod);

    //Deconvolution
    const [sourceImage, setSourceImage] = useState(defaultValues.sourceImage);
    const [sourceImageProjection, setSourceImageProjection] = useState(defaultValues.sourceImageProjection);
    const [sourceImageSave, setSourceImageSave] = useState(defaultValues.sourceImageSave);
    const [resultImage, setResultImage] = useState(defaultValues.resultImage);
    const [resultImageProjection, setResultImageProjection] = useState(defaultValues.resultImageProjection);
    const [resultImageSave, setResultImageSave] = useState(defaultValues.resultImageSave);
    
    //Neural network
    const [preprocImage, setPreprocImage] = useState(defaultValues.preprocImage);
    const [preprocImageProjection, setPreprocImageProjection] = useState(defaultValues.preprocImageProjection);
    const [preprocImageSave, setPreprocImageSave] = useState(defaultValues.preprocImageSave);
    const [maximizeIntensity, setMaximizeIntensity] = useState(defaultValues.maximizeIntensity);
    const [makeGaussianBlur, setMakeGaussianBlur] = useState(defaultValues.makeGaussianBlur);
    const [gaussianBlurCount, setGaussianBlurCount] = useState(defaultValues.gaussianBlurCount);
    // TODO : Need to delete it later!
    const [model, setModel] = useState(defaultValues.model);

    const tiffTypes = ["8 bit", "16 bit", "32 bit"]

    const blurTypes = ["gauss", "none", "median"]

    const deconvMethods = {
        "Richardson-Lucy":"RL",
        "Richardson-Lucy TM":"RLTMR",
        "Richardson-Lucy TV":"RLTVR"
      };

    const cnnDeconvModels = {
        "model-1.h5":"m1"
    };
    const [cnnDeconvModel, setCnnDeconvMethod] = useState(defaultValues.cnnDeconvModel);

    const handleNextStep = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handlePrevStep = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleButtonClick = (e) => {
        e.preventDefault();
    };

    const handleSliderBrightnessChange = (e) => {
        const value = e.target.value;
        const maxBrightness = 10;
        const newBrightness = value > maxBrightness ? maxBrightness : value;
        setLevelBrightness(newBrightness);
    };

    const handleGaussianBlurToggle = (e) => {
        const checked = e.target.checked;
        setMakeGaussianBlur(checked);
    };

    const handleDeconvMethodChange = (selectedMethod) => {
        console.log(selectedMethod);
        setDeconvMethod(selectedMethod);
    };

    const handleCnnDeconvMethodChange = (selectedMethod) => {
        setCnnDeconvMethod(selectedMethod);
    };

    const handleBlurTypeChange = (selectedType) => {
        setBlurType(selectedType);
        console.log(selectedType);
    };

    const handleTiffTypeChange = (selectedType) => {
        setTiffType(selectedType);
    };

    const handleLayerChange = (e, maxLayer) => {
        const value = e.target.value;
        const newLayer = value > maxLayer ? maxLayer : value;
        setLayer(newLayer);
    };

    const handleLayer2Change = (e, maxLayer) => {
        const value = e.target.value;
        const newLayer = value > maxLayer ? maxLayer : value;
        setLayer2(newLayer);
    };
    
    const handleLayer3Change = (e, maxLayer) => {
        const value = e.target.value;
        const newLayer = value > maxLayer ? maxLayer : value;
        setLayer3(newLayer);
    };

    const drawSquare = (x, y, size, canvasRef) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    };

    const handleAllDrawClick = async (canvasRef, x, y, markBead) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const centerCoords = await markBead(x, y, selectSize);
        drawSquare(centerCoords.x, centerCoords.y, selectSize, canvasRef);
    };

    useEffect(() => {
        console.log(centerExtractBeads, resolution);
    }, [centerExtractBeads, resolution]);

    const handleUndoMark = (e, canvasRef) => {
        e.preventDefault();
        if (centerExtractBeads.length > 0) {
          setCenterExtractBeads((prevCenterExtractBeads) =>
            prevCenterExtractBeads.slice(0, prevCenterExtractBeads.length - 1)
          );
          setIsDeleted(true);  
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            centerExtractBeads.slice(0, -1).forEach((bead) => {
              drawSquare(bead.x, bead.y, selectSize, canvasRef);
            });
          }
        }
      };
    
    const handleClearMarks = (e, canvasRef) => {
        e.preventDefault();
        setCenterExtractBeads([]);
        const canvas = canvasRef.current;
        if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setIsDeleted(true); 
    };

    const handleScaleChange = (e, maxScale) => {
        const value = e.target.value;
        const newScale = value > maxScale ? maxScale : value;
        setScale(newScale);
    
        const marginTopIncrement = 3; 
        const newMarginTop = Math.floor((value - 0.5) / 0.1) * marginTopIncrement;
        setMarginTop(newMarginTop);
      };
    
    return {
        files,
        addFiles,
        isLoad,
        setIsLoad,
        beads,
        setBeads,
        voxelX,
        setVoxelX,
        voxelY,
        setVoxelY,
        voxelZ,
        setVoxelZ,
        levelBrightness,
        layer,
        setLayer,
        setLevelBrightness,
        selectSize,
        setSelectSize,
        isDeleted,
        setIsDeleted,
        resolutionXY,
        setResolutionXY,
        resolutionZ,
        setResolutionZ,
        beadSize,
        setBeadSize,
        scale,
        setScale,
        iter,
        setIter,
        activeStep,
        setActiveStep,
        filename,
        setFilename,
        maximizeIntensity,
        setMaximizeIntensity,
        makeGaussianBlur,
        setMakeGaussianBlur,
        gaussianBlurCount,
        setGaussianBlurCount,
        handleNextStep,
        handlePrevStep,
        handleButtonClick,
        handleGaussianBlurToggle,
        tiffType,
        setTiffType,
        tiffTypes,
        handleTiffTypeChange,
        regularization,
        setRegularization,
        deconvMethod,
        setDeconvMethod,
        handleDeconvMethodChange,
        deconvMethods, 
        blurType,
        setBlurType,
        blurTypes,
        handleBlurTypeChange,
        handleSliderBrightnessChange,
        psfFiles,
        addPsfFiles,
        averageBead,
        setAverageBead,
        extractedPSF,
        setExtractedPSF,
        extractBeads,
        setExtractBeads,
        isRightClick,
        setIsRightClick,
        handleLayerChange,
        centerExtractBeads,
        setCenterExtractBeads,
        drawSquare,
        handleUndoMark,
        handleClearMarks,
        resolution,
        setResolution,
        marginTop,
        setMarginTop,
        handleScaleChange,
        layer2,
        setLayer2,
        handleLayer2Change,
        averageBeadSave,
        setAverageBeadSave,
        extractedPSFSave,
        setExtractedPSFSave,
        sourceImage,
        resultImage,
        resultImageSave,
        setSourceImage,
        setResultImage,
        setResultImageSave,
        resolution2,
        setResolution2,
        sourceImageSave,
        setSourceImageSave,
        scaleCompare,
        setScaleCompare,
        handleAllDrawClick,
        preprocImageSave,
        setPreprocImageSave,
        preprocImage,
        setPreprocImage,
        model,
        setModel,
        averageBeadProjection,
        setAverageBeadProjection,
        extractedPSFProjection,
        setExtractedPSFProjection,
        resultImageProjection,
        setResultImageProjection,
        sourceImageProjection,
        setSourceImageProjection,
        preprocImageProjection,
        setPreprocImageProjection,
        cnnDeconvModels,
        cnnDeconvModel,
        setCnnDeconvMethod,
        handleCnnDeconvMethodChange,
        layer3,
        setLayer3,
        handleLayer3Change,
        beadsSave,
        setBeadsSave,
        cnnDeconvModels,
        cnnDeconvModel,
        setCnnDeconvMethod,
        handleCnnDeconvMethodChange
    };
};
