import os
from os import path
from tkinter import *
from tkinter.filedialog import askopenfilenames
from tkinter.messagebox import askokcancel, showerror, showinfo
from tkinter.ttk import Combobox, Separator

import matplotlib.cm as cm
import numpy as np
import tensorflow as tf
from matplotlib import pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from mpl_toolkits.axes_grid1 import AxesGrid
from PIL import Image, ImageTk, ImageFilter
from PySimpleGUI.PySimpleGUI import Exit

import file_input as fio
import img_transform as imtrans
from CNN_Deconvolution.DeblurTrainer import DeblurTrainer

from help_instuctions.LoadHelpWindow import LoadHelpWindow
from CNN_Deconvolution.GenerateDataset import generate_set_2d, generate_set_3d
from CNN_Deconvolution.RealDataGenerator.ModelCreator import ModelCreator

"""
TODO:
- implement cnn learning
"""


class CNNLearningGUI(Toplevel):
    def __init__(self, parent):
        super().__init__(parent)
        # CONSTANTS BLOCK
        self.CNN_STACK_2D_DECONV = "2d learning"
        self.CNN_3D_DECONV = "3d learning"

        self.title("PSF-Extractor: neural deconvolution learning window")
        self.resizable(False, False)
        Label(self, text="").grid(row=0, column=0)  # blanc insert

        # Images settings block
        Label(self, text="Resolution XY Z (nm/pxl):").grid(row=1, column=1)
        self.beadImXYResWgt = Entry(self, width=15, bg="white", fg="black")
        Label(self, text="").grid(row=1, column=2)  # blanc insert
        self.beadImXYResWgt.grid(row=1, column=3, sticky="w")
        self.beadImXYResWgt.insert(0, "22")
        Label(self, text="").grid(row=1, column=4)  # blanc insert
        self.beadImZResWgt = Entry(self, width=15, bg="white", fg="black")
        self.beadImZResWgt.grid(row=1, column=5, sticky="w")
        self.beadImZResWgt.insert(0, "100")
        Label(self, text="").grid(row=1, column=6)  # blanc insert
        
        Label(self, text="Bead diameter (nm/pxl):").grid(row=2, column=1)
        self.beadSize = Entry(self, width=15, bg="white", fg="black")
        self.beadSize.grid(row=2, column=5, sticky="w")
        self.beadSize.insert(0, "200")
        
        
        # Which images load        
        Label(self, text="").grid(row=2, column=0)  # blanc insert
        Label(self, text="Training type:").grid(row=3, column=1)
        Label(self, text="").grid(row=3, column=2)  # blanc insert
        
        self.allCnnStrategies = [self.CNN_STACK_2D_DECONV, self.CNN_3D_DECONV]
        self.allCnnStrategiesCb = Combobox(self, values=self.allCnnStrategies)
        self.allCnnStrategiesCb.current(len(self.allCnnStrategies) - 1)
        self.allCnnStrategiesCb.grid(row=3, column=5)
        
        # Folder with images block
        Label(self, text="").grid(row=4, column=0)  # blanc insert
        Label(self, text="Images directory:").grid(row=5, column=1)
        Button(self, text="Load image paths", command=self.LoadImagesPaths).grid(
            row=5, column=5
        )
        Label(self, text="").grid(row=6, column=0)  # blanc insert

        Separator(self, orient="horizontal").grid(
            row=7, column=1, ipadx=200, pady=10, columnspan=5
        )
        
        # Dataset preprocessing block
        Label(self, text="Generate dataset").grid(row=9, column=1)
        
        self.isNeedGausBlur = IntVar()
        self.isNeedGausBlurCB = Checkbutton(
            self, text="Make Gaus blur", variable=self.isNeedGausBlur
        )
        self.isNeedGausBlurCB.grid(row=10, column=1)
        self.gausRadiusSB = Spinbox(
            self, width=18, bg="white", fg="black", from_=1, to=4
        )
        self.gausRadiusSB.grid(row=10, column=5)
        
        Label(self, text="").grid(row=11, column=0)  # blanc insert
        
        self.isNeedToSaveDataset = IntVar()
        self.isNeedToSaveDatasetCB = Checkbutton(
            self, text="Save dataset images", variable=self.isNeedToSaveDataset
        )
        self.isNeedToSaveDatasetCB.grid(row=12, column=1)
        
        Button(self, text="Generate dataset", command=self.GenerateDataset).grid(
            row=12, column=5
        )
        
        Label(self, text="").grid(row=13, column=0)  # blanc insert        
        Separator(self, orient="horizontal").grid(
            row=14, column=1, ipadx=200, pady=10, columnspan=5
        )

        # Training block
        Label(self, text="").grid(row=15, column=0)  # blanc insert        
        Label(self, text="Training").grid(row=16, column=1)
        
        Label(self, text="Device:").grid(row=17, column=1)
        self.allDevicesList, self.allDevicesNamesList = self.InitAllDevicesInTF()
        self.allDevicesCb = Combobox(self, values=self.allDevicesNamesList)
        self.allDevicesCb.current(len(self.allDevicesNamesList) - 1)
        self.allDevicesCb.grid(row=17, column=5)
        
        Label(self, text="Learning rate:").grid(row=18, column=1)
        self.learningRateWgt = Entry(self, width=15, bg="white", fg="black")
        self.learningRateWgt.grid(row=18, column=5, sticky="w")
        self.learningRateWgt.insert(0, "0.00030")
        
        Label(self, text="Epoches:").grid(row=19, column=1)
        self.epochesSB = Spinbox(
            self, width=18, bg="white", fg="black", from_=2, to=1000
        )
        self.epochesSB.grid(row=19, column=5)
        
        self.isNeedDeblurDataset = IntVar()
        self.isNeedDeblurDatasetCB = Checkbutton(
            self, text="Make deblur dataset", variable=self.isNeedDeblurDataset
        )
        self.isNeedDeblurDatasetCB.grid(row=20, column=1)
        
        Label(self, text="").grid(row=21, column=0)  # blanc insert        
        Button(self, text="Start training", command=self.StartLearning).grid(row=22, column=5)
        Label(self, text="").grid(row=23, column=0)  # blanc insert    
        
        # add menu
        m = Menu(self)
        self.config(menu=m)

        # add buttons
        m.add_command(label="Help", command=self.LoadHelp)    
        return

    def InitAllDevicesInTF(self):
        devices_l = tf.config.list_logical_devices()
        devices_names = [device_l.name for device_l in devices_l]

        devices = tf.config.list_physical_devices()
        device_readable_names = []
        for device in devices:
            if device.device_type == "CPU":
                device_readable_names.append("CPU")
            else:
                details = tf.config.experimental.get_device_details(device)
                device_readable_names.append(details.get("device_name"))
        return devices_names, device_readable_names

    def LoadHelp(self):
        help = LoadHelpWindow(self, "./help_instuctions/src/learning_instruction.png")
        return

    # Methods which provides loading images
    def isTiffCorrect(self, width, height, nlayers, oldW, oldH, oldL):
        currentMode = self.allCnnStrategies[self.allCnnStrategiesCb.current()]
        
        if currentMode == self.CNN_STACK_2D_DECONV and nlayers != 1:
            return False
        elif nlayers != oldL and oldL != -1:
            return False
        elif width != oldW and oldW != -1:
            return False
        elif height != oldH and oldH != -1:
            return False
        else:
            return True
    
    def LoadAllTiffs(self, tiffsPaths : list):
        tiffsImages = list()
        oldW, oldH, oldL = -1, -1, -1
        for path in tiffsPaths:
            try:
                image = Image.open(path)
                ncols, nrows = image.size
                nlayers = image.n_frames
                
                if self.isTiffCorrect(ncols, nrows, nlayers, oldW, oldH, oldL):
                    oldW, oldH, oldL = ncols, nrows, nlayers
                    imgArray = np.ndarray([nlayers,nrows,ncols])
                    for i in range(nlayers):
                        image.seek(i)
                        imgArray[i,:,:] = np.array(image)
                    tiffsImages.append(imgArray)
                else:
                    return list(), False
            except FileNotFoundError:
                print("ReadTiffStackFile: Error. File not found!")
                return list(), False
        
        return tiffsImages, True
    
    def LoadImagesPaths(self):
        try:
            # ask for opening files
            paths = askopenfilenames(title = 'Load Beads Photo', filetypes=[("Tiff files", ".tiff .tif")])
            
            if len(paths) == 0:
                showerror(
                    "LoadImagesPaths: Error",
                    "There is no *.tiff or *.tif files!",
                )
                return
            
            # load all blured images
            tmp_images, isSuccsesfull = self.LoadAllTiffs(paths)
            if not isSuccsesfull:
                showerror(
                    "LoadImagesPaths: Error",
                    "Some files has different sizes or they have many layers while 2d learning choosen!",
                )
                return
            else:
                self.images = tmp_images
                showinfo(
                   "LoadImagesPaths: Completed",
                    "Founded {} different *.tif and *.tiffs files".format(len(self.images)) 
                )
        except Exception as e:
            print(e)
            showerror(
                "LoadBeadImageFile: Error",
                "Bad file name or unsupported (yet) image format",
            )
            return

    # Method which provides dataset generating
    def MakeTiffsPreProc(self, tiffs, rad = 1):
        newTiffs = list()
        for tiff in tiffs:
            new_tiff_stack = np.ndarray(shape=tiff.shape)
            for i in range(tiff.shape[0]):
                layer = tiff[i, :, :]
                layer = layer.astype('uint8')
                layer_img = Image.fromarray(layer).filter(ImageFilter.GaussianBlur(radius = rad))
                new_tiff_stack[i, :, :] = np.array(layer_img)
            newTiffs.append(new_tiff_stack)
        return newTiffs
    
    def GenerateDataset(self):
        if not hasattr(self, "images") or len(self.images) == 0:
            showerror("Error", "Load some images first!")
            return

        # make preprocessing
        isNeedGausBlur = self.isNeedGausBlur.get()
        if isNeedGausBlur:
            rad = self.gausRadiusSB.get()
            self.prepaired_images = self.MakeTiffsPreProc(self.images, int(rad))
        else:
            self.prepaired_images = self.images

        learn_type = self.allCnnStrategies[self.allCnnStrategiesCb.current()]
        bead_size = float(self.beadSize.get())
        isNeedToSave = self.isNeedToSaveDataset.get()
        rad_x = rad_y = float(self.beadImXYResWgt.get())
        rad_z = float(self.beadImZResWgt.get())
        if learn_type == self.CNN_STACK_2D_DECONV:
            self.blured, self.clear = generate_set_2d(self.prepaired_images, bead_size, rad_x, rad_y, rad_z)
        else:
            self.blured, self.clear = generate_set_3d(self.prepaired_images, bead_size, rad_x, rad_y, rad_z)
        
        if isNeedToSave:
            modelCreator = ModelCreator()
            modelCreator.SaveModelAsTiffs(self.blured, self.clear, "./dataset_images/blured", "./dataset_images/clear")
    
        showinfo(
                   "GenerateDataSet: Completed",
                    "Dataset with size {} generated".format(len(self.blured)) 
                )
        return

    # Learning method
    def StartLearning(self):
        if not hasattr(self, "blured") or not hasattr(self, "clear"):
            showerror("Error", "Generate dataset first!")
            return
        try:
            deblurStrategy = self.allCnnStrategies[self.allCnnStrategiesCb.current()]
            rows, cols, layers = self.blured[0].shape
            isNeedDeblurDataset = self.isNeedDeblurDataset.get()
            lr = float(self.learningRateWgt.get())
            epoches = int(self.epochesSB.get())
            deblurPath = "./dataset_images/predicted"
            
            trainer = DeblurTrainer(self.blured, self.clear, 
                                    deblurStrategy, layers, rows, cols,
                                    lr, epoches, isNeedDeblurDataset, deblurPath)
            trainer.train()
        
        except Exception as e:
            print(e)
            showerror("Deblur-Error", str(e))
            return
        
if __name__ == "__main__":
    rootWin = CNNLearningGUI()
    rootWin.mainloop()
