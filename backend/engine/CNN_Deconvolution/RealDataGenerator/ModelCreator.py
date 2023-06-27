import numpy as np
import h5py
from PIL import Image

# Class which provides generating *.hdf5 files with data-sets
class ModelCreator:
    # constructor
    def __init__(self):
        return


    # Method which providing generating *.hdf5 files with data-sets
    # Input:  dataSetName - name of file
    #         dataSet - data-set (NORMALIZATED!)
    # Output: *generating file*
    def CreateModel(self, dataSetName, dataSet):
        # find power of dataset
        power = len(dataSet)

        if power > 0:
            with h5py.File(dataSetName, 'w') as f:
                f['dataset_power'] = power

                for i, (blured, clear) in enumerate(dataSet):
                    f.create_dataset('blured{}'.format(i), data=blured)
                    f.create_dataset('clear{}'.format(i), data=clear)
        return

    def CreateModelFromTwoLists(self, dataSetName, blured_list, clear_list):
        # find power of dataset
        power = len(blured_list)

        if power > 0:
            with h5py.File(dataSetName, 'w') as f:
                f['dataset_power'] = power

                for i in range(power):
                    f.create_dataset('blured{}'.format(i), data=blured_list[i])
                    f.create_dataset('clear{}'.format(i), data=clear_list[i])
        return

    def SaveOneImgStack(self, tiffDraw, path):
        imlist = []
        for tmp in tiffDraw:
            imlist.append(Image.fromarray(tmp.astype('uint8')))
        imlist[0].save(path, save_all=True, append_images=imlist[1:])
        return

    # Функция сохранения изображений в тиффы
    def SaveModelAsTiffs(self, blured, clear, path_blured, path_clear):
        for i in range(len(blured)):
            blured_path = path_blured + "/blured_{}.tiff".format(i+1)
            cleared_path = path_clear + "/clear_{}.tiff".format(i+1)

            if len(blured[i].shape) == 3:
                Image.fromarray((blured[i].reshape(blured[i].shape[0], blured[i].shape[1]) * 255).astype('uint8')).save(blured_path)
                Image.fromarray((clear[i].reshape(clear[i].shape[0], clear[i].shape[1]) * 255).astype('uint8')).save(cleared_path)
            elif len(blured[i].shape) == 4:
                self.SaveOneImgStack((blured[i].reshape(blured[i].shape[0], blured[i].shape[1], blured[i].shape[2]) * 255).astype('uint8'), blured_path)
                self.SaveOneImgStack((clear[i].reshape(clear[i].shape[0], clear[i].shape[1], clear[i].shape[2]) * 255).astype('uint8'), cleared_path)
        return


    # Method which provides reading models
    def ReadModel(self, modelName : str):
        dataSet = list()
        try:
            with h5py.File(modelName, 'r') as f:
                power = f['dataset_power'][()]

                for i in range(power):
                    blured = f['blured{}'.format(i)][:]
                    clear = f['clear{}'.format(i)][:]
                    dataSet.append((blured.reshape(40, 64, 64, 1), clear.reshape(40, 64, 64, 1)))
        except IOError:
            print("Bad model name (or path)!")
        return np.array(dataSet)

    def PackIntoBatches(self, dataset, batch_size):
        batch_clear = list()
        batch_blured = list()

        dataSet = list()

        for i, (blured, clear) in enumerate(dataset):
            blured = blured.reshape(1, 36, 36, 36)
            clear = clear.reshape(1, 36, 36, 36)
            batch_blured.append(blured)
            batch_clear.append(clear)
            if (i % batch_size == batch_size - 1):
                dataSet.append((np.array(batch_blured), np.array(batch_clear)))
                batch_blured = list()
                batch_clear = list()

        return np.array(dataSet)
