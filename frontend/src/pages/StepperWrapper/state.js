import { useState, useEffect } from "react";


export const defaultValues = {
    files: [],
    isLoad: false,
    beads: [],
    extractBeads: [],
    centerExtractBeads: [],
    averageBead: [],
    psfFiles: [],
    voxelX: 0.089,
    voxelY: 0.089,
    voxelZ: 0.2,
    resolution: [],
    levelBrightness: 5,
    layer: 0,
    isDeleted: false,
    isRightClick: false,
    selectSize: 36, //px size
    tiffType: '8 bit',
    blurType: 'gauss',
    resolutionXY: 22,
    resolutionZ: 100,
    scale: 1,
    iter: 50,
    activeStep: 0,
    filename: "",
    iterPSF: 50,
    statePSF: 'dropzone',
    maximizeIntensity: false,
    makeGaussianBlur: false,
    gaussianBlurCount: 3,
    regularization: 0.0001,
    deconvMethod: 'RL',
    marginTop: 0
};

export const useStateValues = () => {
    //General states
    const [files, addFiles] = useState(defaultValues.files);
    const [isLoad, setIsLoad] = useState(defaultValues.isLoad);
    const [layer, setLayer] = useState(defaultValues.layer);
    const [scale, setScale] = useState(defaultValues.scale);
    const [filename, setFilename] = useState(defaultValues.filename);
    const [activeStep, setActiveStep] = useState(defaultValues.activeStep);
    const [resolution, setResolution] = useState(defaultValues.resolution);
    const [marginTop, setMarginTop] = useState(defaultValues.marginTop);
    //Bead extraction
    const [beads, setBeads] = useState(defaultValues.beads);
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
    const [tiffType, setTiffType] = useState(defaultValues.tiffType);
    const [blurType, setBlurType] = useState(defaultValues.blurType);

    const [resolutionXY, setResolutionXY] = useState(defaultValues.resolutionXY);
    const [resolutionZ, setResolutionZ] = useState(defaultValues.resolutionZ);
    //PSF
    const [psfFiles, addPsfFiles] = useState(defaultValues.psfFiles);
    const [iter, setIter] = useState(defaultValues.iter);
    const [regularization, setRegularization] = useState(defaultValues.regularization);
    const [deconvMethod, setDeconvMethod] = useState(defaultValues.deconvMethod);

    //Deconvolution
    const [iterPSF, setIterPSF] = useState(defaultValues.iterPSF);
    const [statePSF, setStatePSF] = useState(defaultValues.statePSF);


    //Neural network
    const [maximizeIntensity, setMaximizeIntensity] = useState(false);
    const [makeGaussianBlur, setMakeGaussianBlur] = useState(false);
    const [gaussianBlurCount, setGaussianBlurCount] = useState(3);

    const tiffTypes = ["8 bit", "16 bit", "32 bit"]

    const blurTypes = ["gauss", "none", "median"]

    const deconvMethods = {
        RL: "Richardson-Lucy",
        RLTM: "Richardson-Lucy TM",
        RLTV: "Richardson-Lucy TV",
      };

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

    const handlePSFChange = (e) => {
        setStatePSF(e.target.checked ? 'stepper-psf' : 'dropzone');
    }

    const handleDeconvMethodChange = (selectedMethod) => {
        setDeconvMethod(selectedMethod);
        console.log(selectedMethod);
    };

    const handleBlurTypeChange = (selectedType) => {
        setBlurType(selectedType);
        console.log(selectedType);
    };

    const handleTiffTypeChange = (selectedType) => {
        setTiffType(selectedType);
        console.log(selectedType);
    };

    const handleLayerChange = (layer) => {
        setLayer(layer);
      };
    
    const drawSquare = (x, y, size, canvasRef) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.zIndex = 4;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    };


    const handleDrawClick = (e, canvasRef) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        console.log(rect, e.clientX)
        setCenterExtractBeads((prevCenterExtractBeads) => [
            ...prevCenterExtractBeads,
            { x: x, y: y },
          ]); 
        drawSquare(x, y, selectSize, canvasRef);
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
        scale,
        setScale,
        iter,
        setIter,
        activeStep,
        setActiveStep,
        filename,
        setFilename,
        iterPSF,
        setIterPSF,
        statePSF,
        setStatePSF,
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
        handlePSFChange,
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
        extractBeads,
        setExtractBeads,
        isRightClick,
        setIsRightClick,
        handleLayerChange,
        centerExtractBeads,
        setCenterExtractBeads,
        handleDrawClick,
        drawSquare,
        handleUndoMark,
        handleClearMarks,
        resolution,
        setResolution,
        marginTop,
        setMarginTop,
        handleScaleChange
    };
};
