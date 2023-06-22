import os.path
from os import path
from tkinter import *
from tkinter.filedialog import askopenfilename, askopenfilenames
from tkinter.messagebox import askokcancel, showerror, showinfo
from tkinter.ttk import Combobox, Separator

import matplotlib.cm as cm
import numpy as np
import tensorflow as tf
from matplotlib import pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from mpl_toolkits.axes_grid1 import AxesGrid
from PIL import Image, ImageFilter
from PySimpleGUI.PySimpleGUI import Exit

import engine.file_input as fio
import engine.img_transform as imtrans
from engine.DeblurPredictor import DeblurPredictor

from engine.help_instuctions.LoadHelpWindow import LoadHelpWindow


# Method which provides image bluring
def BlurGaussian(array, gaussianBlurRad: int):
    for layer in range(array.shape[0]):
        layerArray = array[layer, :, :]
        image = Image.fromarray(layerArray)
        image = image.filter(ImageFilter.GaussianBlur(radius=gaussianBlurRad))
        image = image.filter(ImageFilter.MedianFilter(size=3))
        array[layer, :, :] = np.array(image, dtype="uint8")[:, :]
    return array


def MaximizeIntensities(array):
    if array.dtype.kind == "U":
        array = array.astype(float)  # Convert string array to float array
    array = (array / np.amax(array) * 255).astype("uint8")
    return array


class CNNDeconvGUI():
    def __init__(self, parent):
        super().__init__(parent)
        # CONSTANTS BLOCK
        self.CNN_STACK_2D_DECONV = "2d stack deconvolution"
        self.CNN_3D_DECONV = "3d deconvolution"

        # init block
        self.deblurPredictor = DeblurPredictor()
        self.imgBeadRawLoad = FALSE

        self.title("PSF-Extractor: neural deconvolution window")
        self.resizable(False, False)
        Label(self, text="").grid(row=0, column=0)  # blanc insert

        # Graphics settings block
        Label(self, text="Resolution XY Z (nm/pxl):").grid(row=1, column=1)
        self.beadImXYResWgt = Entry(self, width=15, bg="white", fg="black")
        self.beadImXYResWgt.grid(row=1, column=2, sticky="w")
        self.beadImXYResWgt.insert(0, "22")
        self.beadImZResWgt = Entry(self, width=15, bg="white", fg="black")
        self.beadImZResWgt.grid(row=1, column=3, sticky="w")
        self.beadImZResWgt.insert(0, "100")

        # Load image block
        Label(self, text="Load image").grid(row=2, column=1)
        Button(self, text="Load image", command=self.LoadImageFile).grid(
            row=2, column=3
        )

        Separator(self, orient="horizontal").grid(
            row=3, column=1, ipadx=200, pady=10, columnspan=3
        )

        # Image preprocessing block
        Label(self, text="Preprocess image").grid(row=4, column=1)
        self.isNeedMaximize = IntVar()
        self.isNeedGausBlur = IntVar()
        self.isNeedMaximizeCB = Checkbutton(
            self, text="Maximize intensity", variable=self.isNeedMaximize
        )
        self.isNeedGausBlurCB = Checkbutton(
            self, text="Make Gaus blur", variable=self.isNeedGausBlur
        )
        self.isNeedMaximizeCB.grid(row=5, column=1)
        self.isNeedGausBlurCB.grid(row=6, column=1)
        self.gausRadiusSB = Spinbox(
            self, width=18, bg="white", fg="black", from_=1, to=4
        )
        self.gausRadiusSB.grid(row=6, column=2)
        Button(
            self, text="Make preprocessing", command=self.MakeImagePreprocessing
        ).grid(row=6, column=3)

        Separator(self, orient="horizontal").grid(
            row=7, column=1, ipadx=200, pady=10, columnspan=3
        )

        # Post-processing block
        Label(self, text="Debluring").grid(row=8, column=1)
        Label(self, text="Debluring strategy:").grid(row=9, column=1)
        self.allCnnStrategies = [self.CNN_STACK_2D_DECONV, self.CNN_3D_DECONV]
        self.allCnnStrategiesCb = Combobox(self, values=self.allCnnStrategies)
        self.allCnnStrategiesCb.current(len(self.allCnnStrategies) - 1)
        self.allCnnStrategiesCb.grid(row=9, column=3)

        self.allDevicesList, self.allDevicesNamesList = self.InitAllDevicesInTF()
        self.allDevicesCb = Combobox(self, values=self.allDevicesNamesList)
        self.allDevicesCb.current(len(self.allDevicesNamesList) - 1)
        self.allDevicesCb.grid(row=10, column=1)

        Button(self, text="Make deblur", command=self.Deblur).grid(row=10, column=3)

        Separator(self, orient="horizontal").grid(
            row=11, column=1, ipadx=200, pady=10, columnspan=3
        )

        # Save result block
        Label(self, text="Save results").grid(row=12, column=1)
        Label(self, text="File name:").grid(row=13, column=1)
        self.resultNameW = Entry(self, width=25, bg="white", fg="black")
        self.resultNameW.grid(row=13, column=2, sticky="w")
        Button(self, text="Save result", command=self.SaveResult).grid(row=13, column=3)

        # Graphics
        Label(self, text="").grid(row=1, column=4)  # blanc insert

        self.beforeImg = Canvas(self, width=400, height=400, bg="white")
        self.beforeImg.grid(row=1, column=5, rowspan=13, sticky=(N, E, S, W))
        self.afterImg = Canvas(self, width=400, height=400, bg="white")
        self.afterImg.grid(row=1, column=6, rowspan=13, sticky=(N, E, S, W))

        Label(self, text="").grid(row=14, column=6)  # blanc insert
        
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
        help = LoadHelpWindow(self, "./help_instuctions/src/cnn_deconvolution.png")
        return

    # Methods, which provides graphics plotting
    def getRowPlane(self, img, row):
        layers, rows, cols = img.shape[0], img.shape[1], img.shape[2]
        plane = np.ndarray([layers, cols])
        plane[:, :] = img[:, row, :]
        return plane

    def getColPlane(self, img, column):
        layers, rows, cols = img.shape[0], img.shape[1], img.shape[2]
        plane = np.ndarray([layers, rows])
        plane[:, :] = img[:, :, column]
        return plane

    def getLayerPlane(self, img, layer):
        layers, rows, cols = img.shape[0], img.shape[1], img.shape[2]
        plane = np.ndarray([rows, cols])
        plane[:, :] = img[layer, :, :]
        return plane

    def GenerateFigure(
        self, img, subtitle, coords=[0, 0, 0], scale_borders=[-1000, 1000]
    ):
        planeRow, planeCol, planeLayer = (
            self.getRowPlane(img, coords[1]),
            self.getColPlane(img, coords[2]),
            self.getLayerPlane(img, coords[0]),
        )

        # select borders on colorbar
        if scale_borders[0] == -1000:
            scale_borders[0] = min(
                np.amin(planeRow), np.amin(planeLayer), np.amin(planeCol)
            )

        if scale_borders[1] == 1000:
            scale_borders[1] = max(
                np.amax(planeRow), np.amax(planeLayer), np.amax(planeCol)
            )

        # figure sizes
        plt_width = 4
        plt_height = 4

        # images resolution for autoscaling
        zResolution = 1
        xyResolution = 1

        try:
            zResolution = float(self.beadImZResWgt.get())
            xyResolution = float(self.beadImXYResWgt.get())

            if zResolution <= 0 or xyResolution <= 0:
                raise Exception("Negative resolution")
            # print(zResolution, xyResolution)
        except Exception as e:
            showerror(
                "Scaling error",
                "The entered resolution values are incorrect; graphs will be displayed without scaling!",
            )

        fig = plt.figure(figsize=(plt_width, plt_height))
        fig.suptitle(subtitle)

        grid = AxesGrid(
            fig,
            111,
            nrows_ncols=(2, 2),
            axes_pad=0.05,
            cbar_mode="single",
            cbar_location="right",
            cbar_pad=0.1,
        )

        aspect_value_xz = (img.shape[0] * zResolution) / (img.shape[2] * xyResolution)
        aspect_value_yz = (img.shape[1] * xyResolution) / (img.shape[0] * zResolution)
        # print(aspect_value_xz, aspect_value_yz)
        grid[0].set_axis_off()

        grid[1].set_axis_off()
        grid[1].set_label("X-Z projection")
        im = grid[1].imshow(
            planeRow,
            cmap=cm.jet,
            vmin=scale_borders[0],
            vmax=scale_borders[1],
            aspect=(aspect_value_xz),
        )

        grid[2].set_axis_off()
        grid[2].set_label("Y-Z projection")
        planeCol = planeCol.transpose()
        im = grid[2].imshow(
            planeCol,
            cmap=cm.jet,
            vmin=scale_borders[0],
            vmax=scale_borders[1],
            aspect=aspect_value_yz,
        )

        grid[3].set_axis_off()
        grid[3].set_label("X-Y projection")
        im = grid[3].imshow(
            planeLayer, cmap=cm.jet, vmin=scale_borders[0], vmax=scale_borders[1]
        )

        cbar = grid.cbar_axes[0].colorbar(im)
        return fig, grid

    def clearCanvas(self, canvas):
        for item in canvas.get_tk_widget().find_all():
            canvas.get_tk_widget().delete(item)
        return

    # Method which provides image loading in memory
    def LoadImageFile(self):
        """Loading raw bead photo from file at self.beadImgPath"""
        try:
            imgPath = askopenfilename(title="Load image")
            if imgPath == "":
                return

            print("Open path: ", imgPath)
            self.imgRaw = fio.ReadTiffStackFileTFF(imgPath)
            self.imgPreproc = self.imgRaw.copy()

            result = np.where(self.imgPreproc == np.amax(self.imgPreproc))
            self.layerPlot, self.rowPlot, self.colPlot = (
                result[0][0],
                result[1][0],
                result[2][0],
            )
            fig, axs = self.GenerateFigure(
                self.imgPreproc,
                "Before",
                [self.layerPlot, self.rowPlot, self.colPlot],
                [0, 255],
            )

            # Clear last blur blured
            if hasattr(self, "figIMG_canvas_agg"):
                self.clearCanvas(self.figIMG_canvas_agg)

            if hasattr(self, "figIMG_canvas_agg_deblur"):
                self.clearCanvas(self.figIMG_canvas_agg_deblur)

            # Instead of plt.show creating Tkwidget from figure
            self.figIMG_canvas_agg = FigureCanvasTkAgg(fig, self.beforeImg)
            self.figIMG_canvas_agg.get_tk_widget().grid(
                row=1, column=5, rowspan=13, sticky=(N, E, S, W)
            )

        except Exception as e:
            print(e)
            showerror(
                "LoadBeadImageFile: Error",
                "Bad file name or unsupported (yet) image format",
            )
            return

    # Method which provides image preprocessing and plotting
    def MakeImagePreprocessing(self):
        if not hasattr(self, "imgRaw"):
            showerror("Error", "Load image first!")
            return

        isNeedMaximize = self.isNeedMaximize.get()
        isNeedGausBlur = self.isNeedGausBlur.get()

        self.imgPreproc = self.imgRaw.copy()
        if isNeedMaximize:
            self.imgPreproc = MaximizeIntensities(self.imgPreproc)
        if isNeedGausBlur:
            rad = self.gausRadiusSB.get()
            self.imgPreproc = BlurGaussian(self.imgPreproc, int(rad))

        result = np.where(self.imgPreproc == np.amax(self.imgPreproc))
        self.layerPlot, self.rowPlot, self.colPlot = (
            result[0][0],
            result[1][0],
            result[2][0],
        )
        fig, axs = self.GenerateFigure(
            self.imgPreproc,
            "Before",
            [self.layerPlot, self.rowPlot, self.colPlot],
            [0, 255],
        )

        # Clear last blur blured
        if hasattr(self, "figIMG_canvas_agg"):
            self.clearCanvas(self.figIMG_canvas_agg)

        # Instead of plt.show creating Tkwidget from figure
        self.figIMG_canvas_agg = FigureCanvasTkAgg(fig, self.beforeImg)
        self.figIMG_canvas_agg.get_tk_widget().grid(
            row=1, column=5, rowspan=13, sticky=(N, E, S, W)
        )
        return

    # Deblur method
    def Deblur(self):
        if not hasattr(self, "imgPreproc"):
            showerror("Error", "Load image first!")
            return

        try:
            deblurStrategy = self.allCnnStrategies[self.allCnnStrategiesCb.current()]
            self.deblurPredictor.initPredictModel(
                self.imgPreproc.shape[0],
                self.imgPreproc.shape[1],
                self.imgPreproc.shape[2],
                deblurStrategy,
            )
        except Exception as e:
            print(e)
            showerror("Deblur-Error", str(e))
            return

        try:
            device = self.allDevicesList[self.allDevicesCb.current()]
            with tf.device(device):
                self.debluredImg = self.deblurPredictor.makePrediction(
                    self.imgPreproc, self
                )

                fig, axs = self.GenerateFigure(
                    self.debluredImg,
                    "Deblured",
                    [self.layerPlot, self.rowPlot, self.colPlot],
                    [0, 255],
                )

                # Clear last blur blured
                if hasattr(self, "figIMG_canvas_agg_deblur"):
                    self.clearCanvas(self.figIMG_canvas_agg_deblur)

                # Instead of plt.show creating Tkwidget from figure
                self.figIMG_canvas_agg_deblur = FigureCanvasTkAgg(fig, self.afterImg)
                self.figIMG_canvas_agg_deblur.get_tk_widget().grid(
                    row=1, column=6, rowspan=13, sticky=(N, E, S, W)
                )
        except Exception as e:
            print(e)
            showerror("LoadCNNModelFile: Error", "Smthing goes wrong!")
            return

    def SaveResult(self):
        """Loading raw bead photo from file at self.beadImgPath"""
        if not hasattr(self, "debluredImg"):
            showerror("Error", "Make prediction first!")
            return
        try:
            nameToSave = self.resultNameW.get()
            print("Save file '{}'".format(nameToSave))

            dirId = -1
            while True:
                dirId += 1
                print(dirId)
                txt_folder = str(os.getcwd()) + "\\" + "PSF_folder_" + str(dirId)
                if not path.isdir(txt_folder):
                    print("creating dir")
                    os.mkdir(txt_folder)
                    break
            fio.SaveTiffStackTFF(self.debluredImg, txt_folder, nameToSave)

        except Exception as e:
            print(e)
            showerror("SaveResult: Error", "Bad file name.")
            return


if __name__ == "__main__":
    rootWin = CNNDeconvGUI()
    rootWin.mainloop()
