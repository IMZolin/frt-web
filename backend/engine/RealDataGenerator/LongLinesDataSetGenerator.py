import os
import numpy as np
import time
from PIL import Image, ImageFilter

from copy import deepcopy
from random import uniform, randint
from math import sqrt

# Class which provides reading and augmentation of real data
class LongLinesDataSetGenerator:
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
        return blured, circle, np.array([center_layer, center_row, center_col])

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

    def DrawLineWithMask(self, canvas, brush_mask, brush_center, coords_start, coords_end, intensity_pair = (0.7, 1.)):
        # generate coords
        COORDS_CNT = 125
        brushes_coords = list()
        for i in range(coords_start.shape[0]):
            brushes_coords.append(np.linspace(coords_start[i], coords_end[i], COORDS_CNT))
        intensities = np.linspace(intensity_pair[0], intensity_pair[1], COORDS_CNT)
        int_eps = 0.05

        last_coord = [-1, -1, -1]
        for brushes_coord in range(COORDS_CNT):
            coord = [int(brushes_coords[j][brushes_coord]) for j in range(coords_start.shape[0])]
            # TODO : Make code less shitcode!
            if coord[0] != last_coord[0] or coord[1] != last_coord[1] or coord[2] != last_coord[2]:
                current_int = uniform(intensities[brushes_coord] - int_eps, intensities[brushes_coord] + int_eps)
                canvas = self.DrawMaskInPos(canvas, brush_mask * current_int, coord, brush_center)
                last_coord = coord

        return canvas

    def ConcatenateLayers(self, canvas, layers):
        # обходим каждый слой
        for layer in layers:

            # и сохраняем максимум в канвасе
            for k in range(layer.shape[0]):
                for i in range(layer.shape[1]):
                    for j in range(layer.shape[2]):
                        canvas[k][i][j] = max(canvas[k][i][j], layer[k][i][j])

        return canvas


    # NEWEST IMPLEMENTATION
    def DrawLines(self, series, blured_mask, lines_per_image, 
                  x_line_rad, y_line_rad, z_line_rad, x_bord, y_bord, z_bord, 
                  rad_x, rad_y, rad_z, intensity_interval = (0.65, 1.), LOWER_COEF = 1.):
        # 1 - генерируем холсты
        blured_canvas = np.zeros(blured_mask.shape)
        clear_canvas = np.zeros(blured_mask.shape)

        # 2 - рисуем на слоях линии и объединяем потом в холст
        blured_lines_layers = []
        clear_lines_layers = []
        last_int = intensity_interval[0]
        for i in range(lines_per_image):
            # выбираем интенсивность и генерируем маски кистей
            cur_intensivity = uniform(last_int, intensity_interval[1])
            last_int = cur_intensivity
            blur_mask = blured_mask * cur_intensivity
            blur_mask, clear_mask, int_center = self.GeneratePair(blur_mask, rad_x, rad_y, rad_z, LOWER_COEF)

            # генерируем координаты начала и конца
            cs = np.ndarray([len(blured_mask.shape)])
            for i in range(len(blured_mask.shape)):
                cs[i] = randint(blured_mask.shape[i] // 2 - blured_mask.shape[i] // 5, blured_mask.shape[i] // 2 + blured_mask.shape[i] // 5)
            phi = uniform(-np.pi, np.pi)
            omega = uniform(0, np.pi / 2.) if blured_canvas.shape[0] > 1 else 0
            tau_vec = np.array([np.sin(omega), np.cos(phi) * np.cos(omega), np.sin(phi) * np.cos(omega)])
            
            t_neg, t_pos = [], []
            for i in range(len(blured_mask.shape)):
                if (i == 0 and blured_mask.shape[0] != 1) or i != 0:
                    t1, t2 = -cs[i] / tau_vec[i], (blured_mask.shape[i] - cs[i]) / tau_vec[i]
                    t_neg.append(t1 if t1 <= 0 else t2)
                    t_pos.append(t2 if t1 <= 0 else t1)
            t1, t2 = np.amin(t_pos), np.amax(t_neg)
            coords = np.array([cs + tau_vec * t1, cs + tau_vec * t2])
            
            # рандомим интенсивность прямой
            INT_MIN, INT_MAX = 0.85, 1.
            int_start, int_end = uniform(INT_MIN, INT_MAX), uniform(INT_MIN, INT_MAX)
            if int_start > int_end:
                int_start, int_end = int_start / int_start, int_end / int_start
            else:
                int_start, int_end = int_start / int_end, int_end / int_end

            # увеличиваем маски согласно толщине линии
            z_brush_rad = randint(z_bord, z_line_rad) if blured_mask.shape[0] != 1 else 1
            x_brush_rad = randint(x_bord, x_line_rad)
            y_brush_rad = randint(y_bord, y_line_rad)

            new_blur_mask = np.zeros(shape=blur_mask.shape)
            new_clear_mask = np.zeros(shape=clear_mask.shape)
            for layer in range(new_blur_mask.shape[0]):
                for row in range(new_blur_mask.shape[1]):
                    for col in range(new_blur_mask.shape[2]):
                        if (layer - int_center[0]) ** 2 / (z_brush_rad * z_brush_rad) + (row - int_center[1]) ** 2  / (x_brush_rad * x_brush_rad) + (col - int_center[2]) ** 2  / (y_brush_rad * y_brush_rad) <= 1:
                            coord = np.array([layer, row, col])
                            new_blur_mask = self.DrawMaskInPos(new_blur_mask, blur_mask, coord, int_center)
                            new_clear_mask = self.DrawMaskInPos(new_clear_mask, clear_mask, coord, int_center)

            # нормализируем маски "кистей"
            new_blur_mask = new_blur_mask / np.sum(new_blur_mask)
            new_clear_mask = new_clear_mask / np.sum(new_clear_mask)

            # рисуем линию на новом слое с учетом толщины линии
            blured_layer = np.zeros(shape=blured_canvas.shape)
            clear_layer = np.zeros(shape=clear_canvas.shape)
            blured_layer = self.DrawLineWithMask(blured_layer, new_blur_mask, int_center, coords[0], coords[1], (int_start, int_end))
            clear_layer = self.DrawLineWithMask(clear_layer, new_clear_mask, int_center, coords[0], coords[1], (int_start, int_end))

            # добавляем нарисованные линии в очередь слоев
            blured_lines_layers.append(blured_layer)
            clear_lines_layers.append(clear_layer)

        # конкатенируем все слои с линиями в холсты
        blured_canvas = self.ConcatenateLayers(blured_canvas, blured_lines_layers)
        clear_canvas = self.ConcatenateLayers(clear_canvas, clear_lines_layers)
       
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

        # максимизируем и сохраняем набор пар
        micro_dataset = list()
        intensities = np.linspace(0.35, 1, series)
        maximization_coef = np.min([255. / np.amax(clear_canvas), 255. / np.amax(blured_canvas)]) 

        for ints in intensities:
            blured_data = blured_canvas * maximization_coef * ints
            clear_data = clear_canvas * maximization_coef * ints
            micro_dataset.append((blured_data, clear_data))

        return micro_dataset


    # Функция генерации модели
    def GenerateLinesModel(self, blured, series = 1, lines_per_image = 1, 
                           x_line_rad=2, y_line_rad=2, z_line_rad=2, x_bord = 0, y_bord = 0, z_bord = 0, 
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
            start_time = time.time()
            micro_data = self.DrawLines(series, blur_mask, lines_per_image, x_line_rad, y_line_rad, z_line_rad, x_bord, y_bord, z_bord, rad_x, rad_y, rad_z, LOWER_COEF=LOWER_COEF)
            dataset = dataset + micro_data

            # print info
            print("[{}/{}] ETA: near {}".format(i, len(blured), (time.time() - start_time) * (len(blured) - i)))
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
