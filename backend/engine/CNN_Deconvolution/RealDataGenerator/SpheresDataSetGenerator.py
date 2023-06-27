import os
import numpy as np
from PIL import Image, ImageFilter

from random import uniform, randint
from math import sqrt

from CNN_Deconvolution.RealDataGenerator.DataSet2DModifier import DataSet2DModifier

MAX_INTS_COEF = 1.5

# Class which provides geerating spheres dataset
class SpheresDataSetGenerator:
    # constructor
    def __init__(self, modifier : DataSet2DModifier):
        self.modifier = modifier
        return

    # Method which provides finding max intensitive of *.tiff data
    def FindMaxIntensity(self, blured_image):
        max_layer, max_row, max_col = 0, 0, 0
        max_intensity = blured_image[0][0][0]

        for layer in range(blured_image.shape[0]):
            for row in range(blured_image.shape[1]):
                for col in range(blured_image.shape[2]):
                    if max_intensity < blured_image[layer][row][col]:
                        max_intensity = blured_image[layer][row][col]
                        max_layer = layer
                        max_row = row
                        max_col = col
        return max_layer, max_row, max_col, max_intensity

    # Функция генерации соответствующих "чистых" сфер
    def GeneratePair(self, blured, rad_x, rad_y, rad_z):
        circle = np.zeros(shape=blured.shape)
        center_layer, center_row, center_col, max_intensity = self.FindMaxIntensity(blured)
        
        for layer in range(blured.shape[0]):
            for row in range(blured.shape[1]):
                for col in range(blured.shape[2]):
                    if (layer - center_layer) ** 2 / (rad_z * rad_z) + (row - center_row) ** 2  / (rad_x * rad_x) + (col - center_col) ** 2  / (rad_y * rad_y) <= 1:
                        circle[layer][row][col] = (31 + 224 * (1 - ((layer - center_layer) ** 2 / (rad_z * rad_z) + (row - center_row) ** 2  / (rad_x * rad_x) + (col - center_col) ** 2  / (rad_y * rad_y))))
        return blured, circle

    # Function which provides generating spheres dataset
    def GenerateCirclesModel(self, blured, inflate_cnt,
                             bead_size, voxel_x_size, voxel_y_size, voxel_z_size):
        # 1 - определение точных параметров элипсоида
        rad_x = bead_size / voxel_x_size / 2
        rad_y = bead_size / voxel_y_size / 2
        rad_z = bead_size / voxel_z_size / 2 + 1

        # 2 - модификация сфер и генерация
        #blured = self.modifier.MakeRandomizeShifts(blured, 1, inflate_cnt, (-8, 8), (-4, 4), (0.8, 3.))
        blured = self.modifier.MakeRandomizeShifts(blured, 1, inflate_cnt, (0, 0), (0, 0), (1., 1.))
        
        # 3 - генерация правильных сфер и поиск наилучшего коэфа отношения сумм интенсивностей
        dataset = list()
        new_blured, new_clear = [], []
        lower_coefs = []
        for blur in blured:
            new_blur, clear = self.GeneratePair(blur, rad_x, rad_y, rad_z)
            new_blured.append(new_blur)
            new_clear.append(clear)
            lower_coefs.append(np.amax(clear) / np.sum(clear) * np.sum(new_blur) / np.amax(new_blur) / MAX_INTS_COEF)
        
        # корректируем все изображения согласно новому коэффу отношения сумм интенсивностей
        LOWER_COEF = min(lower_coefs) / 1.1
        
        for i in range(len(new_blured)):
            blur = new_blured[i]
            clear = new_clear[i]
            
            clear = clear / np.sum(clear) * np.sum(blur) / LOWER_COEF
            assert np.amax(clear) >= 1.5 * np.amax(blur)
            
            if np.amax(clear) > 255.:
                lower_coef = 255. / np.amax(clear)
                clear = clear * lower_coef
                blur = blur * lower_coef
            
            dataset.append((blur, clear))
        return dataset, LOWER_COEF

    def SaveTiff(self, tiffDraw, fileName):
        imlist = []
        for tmp in tiffDraw:
            imlist.append(Image.fromarray(tmp.astype('uint8')))
        imlist[0].save(fileName, save_all=True, append_images=imlist[1:])
        return

    # Функция сохранения изображений в тиффы
    def SaveModelAsTiffs(self, dataset, path_blured, path_clear, rad=3.):
        for i, (blured, clear) in enumerate(dataset):
            blured_path = path_blured + "/blured{}_{}.tiff".format(int(rad), i+1)
            cleared_path = path_clear + "/clear{}_{}.tiff".format(int(rad), i+1)

            self.SaveTiff(blured, blured_path)
            self.SaveTiff(clear, cleared_path)
        return

    # Функция сохранения изображений в два листа с массивами (для последующей упаковки в *.hdf5)
    def TransformDataSetAtLists(self, dataset):
        blured_list = list()
        clear_list = list()

        for i, (blured, clear) in enumerate(dataset):
            layers = blured.shape[0]
            width = blured.shape[1]
            height = blured.shape[2]

            if layers == 1:
                blured_list.append(blured.reshape(width, height, 1) / 255.)
                clear_list.append(clear.reshape(width, height, 1) / 255.)
            else:
                blured_list.append(blured.reshape(layers, width, height, 1) / 255.)
                clear_list.append(clear.reshape(layers, width, height, 1) / 255.)
        return blured_list, clear_list
