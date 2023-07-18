import { useState } from "react";


export const defaultValues = {
    files: [],
    isLoad: false,
    beads: [],
    extractBeads: [],
    averageBead: [],
    psfFiles: [],
    voxelX: 0.089,
    voxelY: 0.089,
    voxelZ: 0.2,
    levelBrightness: 5,
    layer: 0,
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
    deconvMethod: 'RL'
};

export const useStateValues = () => {
    //General states
    const [files, addFiles] = useState(defaultValues.files);
    const [isLoad, setIsLoad] = useState(defaultValues.isLoad);
    const [layer, setLayer] = useState(defaultValues.layer);
    const [scale, setScale] = useState(defaultValues.scale);
    const [filename, setFilename] = useState(defaultValues.filename);
    const [activeStep, setActiveStep] = useState(defaultValues.activeStep);
    //Bead extraction
    const [beads, setBeads] = useState(defaultValues.beads);
    const [voxelX, setVoxelX] = useState(defaultValues.voxelX);
    const [voxelY, setVoxelY] = useState(defaultValues.voxelY);
    const [voxelZ, setVoxelZ] = useState(defaultValues.voxelZ);
    const [levelBrightness, setLevelBrightness] = useState(defaultValues.levelBrightness);
    const [selectSize, setSelectSize] = useState(defaultValues.selectSize);
    const [extractBeads, setExtractBeads] = useState(defaultValues.extractBeads);
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

    const handleSliderChange = (e) => {
        const value = e.target.value;
        const maxScale = 10;
        const newScale = value > maxScale ? maxScale : value;
        setScale(newScale);
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
        handleSliderChange,
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
        setExtractBeads
    };
};
