import os
import numpy as np
import time
from PIL import Image, ImageFilter

from random import uniform, randint
from math import sqrt

# Class which provides reading and augmentation of real data
class MultiSpheresDataSetGenerator:
    def __init__(self):
        return

    # Функция поиска центра для сферы
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
    def GeneratePair(self, blured, rad_x, rad_y, rad_z, lower_coef):
        circle = np.zeros(shape=blured.shape)
        center_layer, center_row, center_col, max_intensity = self.FindMaxIntensity(blured)
        
        for layer in range(blured.shape[0]):
            for row in range(blured.shape[1]):
                for col in range(blured.shape[2]):
                    if (layer - center_layer) ** 2 / (rad_z * rad_z) + (row - center_row) ** 2  / (rad_x * rad_x) + (col - center_col) ** 2  / (rad_y * rad_y) <= 1:
                        circle[layer][row][col] = (31 + 224 * (1 - ((layer - center_layer) ** 2 / (rad_z * rad_z) + (row - center_row) ** 2  / (rad_x * rad_x) + (col - center_col) ** 2  / (rad_y * rad_y))))

        circle = circle / np.sum(circle) * np.sum(blured) / lower_coef
        assert np.amax(circle) >= 1.5 * np.amax(blured)
        if np.amax(circle) > 255.:
            lower_coef = 255. / np.amax(circle)
            circle = circle * lower_coef
            blured = blured * lower_coef
        return blured, circle

    # Функции генерации модели с прямыми
    # Идея генерации следующая: берется снимок сферы, строится по ней центрированная сфера.
    # Затем, считая снимок сферы и чистую сферу как "кисть", ими рисуется соответсвующие фигуры: самая простая фигура - отрезок.
    
    # Функции генерации размытой и четкой прямой на холсте
    def DrawMaskInPos(self, canvas, brush_mask, coord, brush_center):
        brush_start = [int(coord[i] - brush_center[i]) for i in range(len(brush_mask.shape))]
        
        l_low, l_high = max(0, -brush_start[0]), min(canvas.shape[0], canvas.shape[0] - brush_start[0])
        r_low, r_high = max(0, -brush_start[1]), min(canvas.shape[1], canvas.shape[1] - brush_start[1])
        c_low, c_high = max(0, -brush_start[2]), min(canvas.shape[2], canvas.shape[2] - brush_start[2])

        l_low_shifted, l_high_shifted = brush_start[0] + l_low, brush_start[0] + l_high
        r_low_shifted, r_high_shifted = brush_start[1] + r_low, brush_start[1] + r_high
        c_low_shifted, c_high_shifted = brush_start[2] + c_low, brush_start[2] + c_high
        
        canvas[l_low_shifted : l_high_shifted, r_low_shifted : r_high_shifted, c_low_shifted : c_high_shifted] += brush_mask[l_low:l_high, r_low:r_high, c_low:c_high]

        return canvas

    def DrawSpheresWithMask(self, canvas, brush_mask, brushes_coords, intensities=(0.85, 1.)):
        for brushes_coord in brushes_coords:
            intensity = uniform(intensities[0], intensities[1])
            canvas = self.DrawMaskInPos(canvas, brush_mask * intensity, brushes_coord, np.array(brush_mask.shape) // 2)
        return canvas

    # NEWEST IMPLEMENTATION
    def DrawSpheres(self, blured_mask, spheres_per_image, rad_x, rad_y, rad_z, LOWER_COEF):
        # 1 - генерируем холсты
        blured_canvas = np.zeros(blured_mask.shape)
        clear_canvas = np.zeros(blured_mask.shape)

        # 2 - генерируем массив цетров сфер
        centers = []
        blur_mask, clear_mask = self.GeneratePair(blured_mask, rad_x, rad_y, rad_z, LOWER_COEF)
        for i in range(spheres_per_image):
            # генерируем координаты центра, пока полученный центр не будет удовлетворять нас
            coord = np.ndarray([len(blured_mask.shape)])
            while True:
                for i in range(len(coord)):
                    # если 2d (т.е. первый шейп, ответственный за кол-во слоев == 1
                    if i == 0 and blur_mask.shape[i] == 1:
                        coord[i] = 0
                    else:
                        coord[i] = randint(int((rad_z if i == 0 else rad_x) + 1), int(blured_mask.shape[i] - (rad_z if i == 0 else rad_x) - 1))

                # проверка на корректность координат
                if len(centers) == 0:
                    break
                else:
                    isAlright = True
                    # если какие то центры очень близко оказались друг к другу -> выходим
                    for center in centers:
                        if (center[0] - coord[0]) ** 2 + (center[1] - coord[1]) ** 2 + (center[2] - coord[2]) ** 2 <= (max([rad_x, rad_y, rad_z]) * 1.7) ** 2:
                            isAlright = False
                    if isAlright:
                        break
            centers.append(coord)

        # 3 - рисуем на холстах
        tmp_blur_mask = blur_mask / np.sum(blur_mask)
        tmp_clear_mask = clear_mask / np.sum(clear_mask)
        blured_canvas = self.DrawSpheresWithMask(blured_canvas, tmp_blur_mask, centers)
        clear_canvas = self.DrawSpheresWithMask(clear_canvas, tmp_clear_mask, centers)

        # РАЗНЫЕ ТИПЫ БАЛАНСИРОВКИ
        # 1. Балансируем интенсивности всех изображений, ориентируясь на балансировку пары "нечеткая/четкая сфера
        #blured_canvas = blured_canvas / np.amax(blured_canvas) * np.amax(blur_mask)
        #clear_canvas = clear_canvas / np.sum(clear_canvas) * np.sum(blured_canvas) / LOWER_COEF
        
        # 2. Логика такая: после нормировк кистей, сумма всех интенсивностей в размытом и четком холсте должна быть +- одинакова (хотя это и не так). Поскольку мы считаем что одинакова, то умножение на один какой то коэф не будет менять общую сумму интенсивностей
        #koef = np.amax(blur_mask) / np.amax(blured_canvas)
        #blured_canvas = blured_canvas * koef
        #clear_canvas = clear_canvas * koef / LOWER_COEF

        #if np.amax(blured_canvas) > np.amax(clear_canvas):
        #    clear_canvas = clear_canvas / np.amax(clear_canvas) * np.amax(blured_canvas)

        # 3. Выравниваем интенсивности так, как вот сделалось у кистей
        blured_canvas = blured_canvas / np.amax(blured_canvas) * np.amax(blured_mask)
        clear_canvas = clear_canvas / np.amax(clear_canvas) * np.amax(clear_mask)

        upper_int = np.min([255. / np.amax(blured_canvas), 255. / np.amax(clear_canvas), uniform(2, 5)])
        blured_canvas = blured_canvas * upper_int
        clear_canvas = clear_canvas * upper_int

        return [(blured_canvas, clear_canvas)]

    # Функция генерации модели
    def GenerateSpheresModel(self, blured, series = 4, spheres_per_image = 1, 
                             bead_size = 0.2, voxel_x_size = 0.011, voxel_y_size = 0.011, voxel_z_size = 0.1, 
                             LOWER_COEF = 1.
                             ):
        # 1 - определение параметров чистых прямых
        rad_x = bead_size / voxel_x_size / 2
        rad_y = bead_size / voxel_y_size / 2
        rad_z = bead_size / voxel_z_size / 2 + 1

        # 2 - генерация прямых
        dataset = list()
        i = 1
        for blur_mask in blured:
            for s in range(series):
                start_time = time.time()
                micro_data = self.DrawSpheres(blur_mask, spheres_per_image, rad_x, rad_y, rad_z, LOWER_COEF)
                dataset = dataset + micro_data

                # print info
                print("[{}/{}] ETA: near {}".format(i, len(blured) * series, (time.time() - start_time) * (len(blured) * series - i)))
                i = i + 1
        return dataset

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

