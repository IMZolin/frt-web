from random import randint, uniform
import numpy as np
from PIL import Image

# Class which provides dataset modifing
class DataSet2DModifier:
    def __init__(self):
        return

    def MakeRotates(self, data_arr, rotates_cnt):
        cur_image_rotates = list()
        degrees_rotate = int(360 / rotates_cnt)

        # rotates on each degree
        for i in range(rotates_cnt):
            cur_degree = degrees_rotate * i

            # rotate per layer and concatenate into one image back
            rotated_image = list()
            for layer in data_arr:
                layerImg = Image.fromarray(layer.astype('uint8'))
                rotated = np.array(layerImg.rotate(cur_degree))
                rotated_image.append(rotated)
            cur_image_rotates.append(np.array(rotated_image))

        return cur_image_rotates

    def MakeShifts(self, origin_data, shifts_x, shifts_y, shifts_z):
        layers = origin_data.shape[0]
        rows = origin_data.shape[1]
        cols = origin_data.shape[2]
        new_data = np.zeros(shape=origin_data.shape)

        for layer in range(layers):
            for row in range(rows):
                for col in range(cols):
                    new_data[layer][row][col] = origin_data[(layer + shifts_z) % layers][(row + shifts_x) % rows][(col + shifts_y) % cols]
        return new_data

    def MakeRandomizeShifts(self, origin_dataset, rotates_per_image = 8, shifts_per_image=4, shifts_interval=(-5, 5), z_shifts_int=(0, 0), intensity_int = (0.75, 1.)):
        new_dataset = list()

        # make new data
        for data in origin_dataset:
            # make rotates
            cur_image_rotates = self.MakeRotates(data, rotates_per_image) if rotates_per_image != 1 else [data]

            # make shifts
            for i in range(shifts_per_image):
                x_shifts = randint(shifts_interval[0], shifts_interval[1])
                y_shifts = randint(shifts_interval[0], shifts_interval[1])
                z_shifts = randint(z_shifts_int[0], z_shifts_int[1])

                for each_rotate in cur_image_rotates:
                    if np.amax(each_rotate) * intensity_int[1] > 255.:
                        intensity_mul = uniform(intensity_int[0], 255. / np.amax(each_rotate))
                    else:
                        intensity_mul = uniform(intensity_int[0], intensity_int[1])

                    new_img = self.MakeShifts(each_rotate, x_shifts, y_shifts, z_shifts) * intensity_mul
                    new_dataset.append(new_img)

        # return new dataset
        return new_dataset

    def FilterImages(self, origin_dataset, low_intesity_thresold = 15):
        new_dataset = list()

        for data in origin_dataset:
            new_img = np.zeros(data.shape)

            for layer in range(data.shape[0]):
                for row in range(data.shape[1]):
                    for col in range(data.shape[2]):
                        new_img[layer][row][col] = 0 if data[layer][row][col] < low_intesity_thresold else data[layer][row][col]
            new_dataset.append(new_img)
        return new_dataset
