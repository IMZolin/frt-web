import copy
import tkinter as tk
import tkinter.ttk as ttk

import numpy as np

from BigImageManager import BigImageManager
from DeblurCNNModel2D import DeblurCNNModel2D
from DeblurCNNModelMini3D import DeblurCNNModelMini3D


# Class, which provides predicting of output data
class DeblurPredictor:
    # constructor
    def __init__(self):
        # CONSTANTS
        self.CHUNK_SIZE = 64
        self.OFFSET_SIZE = 32

        self.CNN_MODEL_PATH_3D = "./CNN_Deconvolution/models/3d_gaus_blur.h5"
        self.CNN_MODEL_PATH_2D = "./CNN_Deconvolution/models/2d_gaus_blur.h5"

        self.isInited = False
        self.currentType = None
        return

    # Method which provides neural network model initialization to predict
    def initPredictModel(self, layers, rows, cols, type):
        self.currentType = type
        if type == "3d deconvolution":
            _layers = layers
            _rows = self.CHUNK_SIZE + 2 * self.OFFSET_SIZE  # rows
            _cols = self.CHUNK_SIZE + 2 * self.OFFSET_SIZE  # cols

            self.model = DeblurCNNModelMini3D.ModelBuilder(
                input_shape=(_layers, _rows, _cols, 1)
            )
            self.model.load_weights(self.CNN_MODEL_PATH_3D)
            self.isInited = True
        elif type == "2d stack deconvolution":
            self.model = DeblurCNNModel2D.ModelBuilder(input_shape=(rows, cols, 1))
            self.model.load_weights(self.CNN_MODEL_PATH_2D)
            self.isInited = True
        else:
            raise Exception("Unknown deconvolution type")
        return

    # Msethod which provides post-processing
    def makePostprocessing(self, result, layers, rows, cols):
        # for k in range(layers):
        #    for i in range(rows):
        #        for j in range(cols):
        #            result[k][i][j] = min(1, max(0, result[k][i][j]))
        result = result / np.amax(result)
        return result

    # Method which provides 2d prediction on each layer
    def make2dStackPrediction(self, imgToPredict, window):
        layers = imgToPredict.shape[0]
        rows = imgToPredict.shape[1]
        cols = imgToPredict.shape[2]

        # split on layers
        imgLayers = [imgToPredict[i] for i in range(layers)]

        # make graphic indication progressbar
        pb = ttk.Progressbar(
            window,
            orient="horizontal",
            mode="determinate",
            maximum=len(imgLayers),
            value=0,
        )
        pb.grid(row=10, column=2)

        # deconvolve layers
        resLayers = []
        for layer in imgLayers:
            resLayers.append(
                self.model.predict(layer.reshape(1, rows, cols, 1)).reshape(rows, cols)
            )
            pb["value"] = len(resLayers)
            window.update()

        # concatenate layers
        predictedImage = np.zeros(shape=(layers, rows, cols), dtype=np.float32)
        for i in range(len(resLayers)):
            predictedImage[i, :, :] = resLayers[i][:, :]
        return predictedImage, pb

    # Method which provides 3d prediction in whole image
    def make3dPrediction(self, imgToPredict, window):
        # make chunks
        chunksMaker = BigImageManager(imgToPredict, self.CHUNK_SIZE, self.OFFSET_SIZE)
        chunks = chunksMaker.SeparateInChunks()

        # make graphic indication progressbar
        pb = ttk.Progressbar(
            window,
            orient="horizontal",
            mode="determinate",
            maximum=len(chunks),
            value=0,
        )
        pb.grid(row=10, column=2)

        results = []
        for chunk in chunks:
            chunkToPredict = chunk

            chunkToPredict.chunkData = chunk.chunkData.reshape(
                1, chunk.dataLayers, chunk.dataRows, chunk.dataCols, 1
            )

            chunkToPredict.chunkData = self.model.predict(chunkToPredict.chunkData)

            chunkToPredict.chunkData = chunkToPredict.chunkData.reshape(
                chunk.dataLayers, chunk.dataRows, chunk.dataCols
            )

            results.append(chunkToPredict)
            pb["value"] = len(results)
            window.update()

        # Init back to save
        result = chunksMaker.ConcatenateChunksIntoImage(results)
        return result, pb

    # Method which provides image's prediction
    def makePrediction(self, img, window):
        if not self.isInited:
            raise Exception("Model isnt inited!")

        # prepaire to predict
        img = img.astype("float32") / 255
        imgToPredict = img.copy()

        if self.currentType == "3d deconvolution":
            result, pb = self.make3dPrediction(imgToPredict, window)
        elif self.currentType == "2d stack deconvolution":
            result, pb = self.make2dStackPrediction(imgToPredict, window)

        result = self.makePostprocessing(
            result, result.shape[0], result.shape[1], result.shape[2]
        )
        result = (result * 255).astype("uint8")

        # destroy progress bar
        pb.grid_remove()
        return result
