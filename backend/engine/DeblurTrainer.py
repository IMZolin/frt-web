import tensorflow as tf
from tensorflow import keras
from keras.utils.layer_utils import count_params
import os
from os import path
import matplotlib.pyplot as plt
import numpy as np
import yaml

from file_input import *
from DeblurCNNModel2D import *
from DeblurCNNModelMini3D import *

def SplitOnTrainAndVal(blured_list, clear_list, train_val_coef=0.8):
    # total count of each list
    total_elements = len(blured_list)
    train_elements = int(total_elements * train_val_coef)
    val_elements = total_elements - train_elements

    # make randomize indexes
    list1 = [True] * train_elements
    list2 = [False] * val_elements
    listcomb = list1 + list2
    listcomb = np.random.choice(listcomb, total_elements, replace=False)
    train_indices = np.argwhere(listcomb == True)
    valid_indices = np.argwhere(listcomb == False)

    # make split
    blured_train_list = [blured_list[i[0]] for i in train_indices]
    blured_val_list = [blured_list[i[0]] for i in valid_indices]
        
    clear_train_list = [clear_list[i[0]] for i in train_indices]
    clear_val_list = [clear_list[i[0]] for i in valid_indices]
        
    return blured_train_list, blured_val_list, clear_train_list, clear_val_list


# Class, which provides training model
class DeblurTrainer:
    # constructor
    def __init__(self, _blured_images, _clear_images, 
                 _mode, _layers, _rows, _cols, 
                 _learningRate, _epoches, 
                 _isNeedToSaveDebluredDataset, _debluredPath):
        # CONSTANTS
        self.MODEL_NAME_2d = "2d_gaus_blur.h5"
        self.MODEL_NAME_3d = "3d_gaus_blur.h5"
        
        
        self.blured = _blured_images
        self.clear = _clear_images
        
        self.mode = _mode
        self.layers = _layers
        self.rows = _rows
        self.cols = _cols
        
        self.learningRate = _learningRate
        self.epoches = _epoches
        
        self.isNeedToSaveDebluredDataset = _isNeedToSaveDebluredDataset
        self.debluredImagesDatasetPath = _debluredPath
        return

    # Method which provides network model initialization
    def initTrainableModel(self):
        if self.mode == "2d learning":
            model = DeblurCNNModel2D.ModelBuilder((self.rows, self.cols, 1), self.learningRate)
        else:
            #model = PSFCNNModel3D.ModelBuilder(self.shape, self.learningRate)
            model = DeblurCNNModelMini3D.ModelBuilder((self.layers, self.rows, self.cols, 1), self.learningRate)
        return model

    # Method, which provides reshaping of inputed array to prediction
    def reshapeInput(self, input):
        if self.mode == "2d learning":
            input = input.reshape(1, self.rows, self.cols, 1)
        else:
            input = input.reshape(1, self.layers, self.rows, self.cols, 1)
        return input

    # Method which provides saving images of outputed data
    def deblurTrainingDataset(self):
        # Init model
        model = self.initTrainableModel()
        model.load_weights(self.saveWeightsPath)

        for i in range(len(self.blured)):
            bluredInto = self.reshapeInput(self.blured[i])
            clearResult = model.predict(bluredInto)
            clearResult = clearResult / np.amax(clearResult) * 255.
            clearResult = clearResult.reshape(self.layers, self.rows, self.cols)
            SaveTiffStack(clearResult, self.debluredImagesDatasetPath, "predicted_{}".format(i + 1))
        return
    
    def GenerateModelPath(self):
        dirId = -1
        while True:
            dirId += 1
            print(dirId)
            txt_folder = str(os.getcwd()) + "\\" + self.mode + "_" + str(dirId)
            if not path.isdir(txt_folder):
                os.mkdir(txt_folder)
                break
        return txt_folder
    
    # Method which provides plotting training history
    def plotHist(self, history):
        loss = history.history['loss']
        valLoss = history.history['val_loss']
        epochs = range(len(loss))

        plt.figure()

        plt.semilogy(epochs, loss, 'b', label = 'Training loss')
        plt.semilogy(epochs, valLoss, 'r', label = 'Validation loss')
        plt.title('Training and validation loss')
        plt.legend()
        plt.savefig(self.dirPath + "/history.png")
        #plt.show()
        return

    # Method which provides Resnet CNN training
    def train(self):
        try:
            # Init model
            model = self.initTrainableModel()
            
            # Init train test images
            bluredTrainList, bluredValList, clearTrainList, clearValList = SplitOnTrainAndVal(self.blured, self.clear)

            # train model
            self.batchSize = 32 if self.mode == "2d learning" else 2
            hist = model.fit(x = np.array(bluredTrainList), y = np.array(clearTrainList), validation_data=(np.array(bluredValList), np.array(clearValList)), epochs = self.epoches, batch_size=self.batchSize, use_multiprocessing=True)
            self.dirPath = self.GenerateModelPath()
            self.saveWeightsPath = self.dirPath + "/" + (self.MODEL_NAME_2d if self.mode == "2d learning" else self.MODEL_NAME_3d)
            model.save_weights(self.saveWeightsPath)

            # plot hist graph
            self.plotHist(hist)

            # outpur deblured images from dataset
            if self.isNeedToSaveDebluredDataset:
                self.deblurTrainingDataset()
        
        except Exception as e:
            print(e)
        return



