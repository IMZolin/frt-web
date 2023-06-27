import itertools
import os.path
from os import path
from tkinter import *
from tkinter.filedialog import askopenfilename, askopenfilenames
from tkinter.messagebox import showerror, showinfo

import matplotlib.cm as cm
import numpy as np
from matplotlib import pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from PIL import Image, ImageTk
from PySimpleGUI.PySimpleGUI import Exit

import deconvolution as decon
import file_input as fio
import img_transform as imtrans

"""
TODO: 
- [x] implement bead images draw in tkinter with matplotlib subplot
- fix centering
- add bead extraction
- add full interpolation over Z(depth)-axis in extract beads module
- fix some obsolete interface buttons
"""


class PSFExtractorGUI(Toplevel):
    def __init__(self, parent):
        super().__init__(parent)
        self.imgBeadRawLoad = FALSE

        self.title("Simple experimental PSF extractor")
        self.resizable(False, False)
        Label(self, text="").grid(row=0, column=0)  # blanc insert
        Label(self, text="Load avaraged bead image").grid(row=1, column=1)

        self.beadImgPathW = Entry(self, width=25, bg="white", fg="black")
        self.beadImgPathW.grid(row=2, column=1, sticky="w")
        Button(self, text="Select Bead Image", command=self.SelectBeadImage).grid(
            row=2, column=2
        )
        Button(self, text="Load image file", command=self.LoadBeadImageFile).grid(
            row=2, column=3
        )

        Button(self, text="Launch bead extractor").grid(row=3, column=1)
        Button(self, text="Show loaded bead image").grid(row=3, column=2)
        Button(
            self, text="Center image intensity", command=self.CenteringImageInt
        ).grid(row=3, column=3)

        Label(self, text="Bead size(nm):").grid(row=4, column=1)
        self.beadSizeWgt = Entry(self, width=15, bg="white", fg="black")
        self.beadSizeWgt.grid(row=4, column=2, sticky="w")

        Label(self, text="Resolution XY Z (nm/pixel):").grid(row=5, column=1)
        self.beadImXYResWgt = Entry(self, width=15, bg="white", fg="black")
        self.beadImXYResWgt.grid(row=5, column=2, sticky="w")
        # Label(text="Resolution Z(nm/pixel)").grid(row = 5,column = 1)
        self.beadImZResWgt = Entry(self, width=15, bg="white", fg="black")
        self.beadImZResWgt.grid(row=5, column=3, sticky="w")

        Label(self, text="Iteration number:").grid(row=6, column=1)
        self.iterNumWgt = Entry(self, width=15, bg="white", fg="black")
        self.iterNumWgt.grid(row=6, column=2, sticky="w")

        Button(self, text="Calculate PSF", command=self.CalculatePSF).grid(
            row=7, column=1
        )

        Label(self, text="PSF folder").grid(row=8, column=1)
        self.folderPSFWgt = Entry(self, width=15, bg="white", fg="black")
        self.folderPSFWgt.grid(row=8, column=2, sticky="w")
        Button(self, text="Browse").grid(row=9, column=3)

        Label(self, text="PSF file prefix").grid(row=9, column=1)
        self.filePrfxPSFWgt = Entry(self, width=15, bg="white", fg="black")
        self.filePrfxPSFWgt.grid(row=9, column=2, sticky="w")

        Button(self, text="Save PSF multi-file", command=self.SavePSFMulti).grid(
            row=10, column=1
        )
        Button(self, text="Save PSF single-file", command=self.SavePSFSingle).grid(
            row=10, column=2
        )

        Button(self, text="Load Image", command=self.LoadCompareImageFile).grid(
            row=11, column=1
        )
        Button(self, text="Load PSF", command=self.LoadPSFImageFile).grid(
            row=11, column=2
        )
        Button(self, text="Deconvolve", command=self.DeconvolveIt).grid(
            row=11, column=3
        )
        Button(self, text="EXIT!", command=quit).grid(row=11, column=6)

        Label(self, text="").grid(row=1, column=4)  # blanc insert

        self.cnvImg = Canvas(self, width=150, height=450, bg="white")
        self.cnvImg.grid(row=1, column=5, rowspan=10, sticky=(N, E, S, W))
        self.cnvPSF = Canvas(self, width=150, height=450, bg="white")
        self.cnvPSF.grid(row=1, column=6, rowspan=10, sticky=(N, E, S, W))
        self.cnvDecon = Canvas(self, width=150, height=450, bg="white")
        self.cnvDecon.grid(row=1, column=7, rowspan=10, sticky=(N, E, S, W))

        Label(self, text="").grid(row=12, column=6)  # blanc insert

    def SelectBeadImage(self):
        """Selecting bead file"""
        self.beadImgPath = askopenfilename(title="Load Beads Photo")
        self.beadImgPathW.insert(0, self.beadImgPath)

    def LoadBeadImageFile(self):
        """Loading raw bead photo from file at self.beadImgPath"""
        if not hasattr(self, "beadImgPath"):
            showerror("Error", "Select bead image first!")
            return
        elif self.beadImgPath == "":
            showerror("Error", "Bead image path empty!")
            return
        try:
            #            self.imgBeadRaw = Image.open(self.beadImgPath)
            #            print("Number of frames: ", self.imgBeadRaw.n_frames)
            #            frameNumber = int( self.imgBeadRaw.n_frames / 2)
            #            print("Frame number for output: ", frameNumber)
            #            # setting imgTmp to desired number
            #            self.imgBeadRaw.seek(frameNumber)
            #            # preparing image for canvas from desired frame
            #            self.cnvBeadImg = ImageTk.PhotoImage(self.imgBeadRaw)
            print("Open path: ", self.beadImgPath)
            self.imgBeadRaw = fio.ReadTiffStackFileTFF(self.beadImgPath)
            # creating figure with matplotlib
            fig, axs = plt.subplots(3, 1, sharex=False, figsize=(2, 6))
            fig.suptitle("Bead")
            axs[0].pcolormesh(
                self.imgBeadRaw[self.imgBeadRaw.shape[0] // 2, :, :], cmap=cm.jet
            )
            axs[1].pcolormesh(
                self.imgBeadRaw[:, self.imgBeadRaw.shape[1] // 2, :], cmap=cm.jet
            )
            axs[2].pcolormesh(
                self.imgBeadRaw[:, :, self.imgBeadRaw.shape[2] // 2], cmap=cm.jet
            )
            # plt.show()
            # Instead of plt.show creating Tkwidget from figure
            self.figIMG_canvas_agg = FigureCanvasTkAgg(fig, self.cnvImg)
            self.figIMG_canvas_agg.get_tk_widget().grid(
                row=1, column=5, rowspan=10, sticky=(N, E, S, W)
            )

        except:
            showerror("LoadBeadImageFile: Error", "Can't read file.")
            return
        # updating scrollers
        # self.cnv1.configure(scrollregion = self.cnv1.bbox('all'))

    def LoadCompareImageFile(self):
        """Loading raw bead photo from file at self.beadImgPath"""
        beadCompPath = askopenfilename(title="Load Beads Photo")
        try:
            self.imgBeadComp = fio.ReadTiffStackFileTFF(beadCompPath)
        except:
            showerror("Load compare image: Error", "Can't read file.")
            return

    def CenteringImageInt(self):
        """Centering image array by intensity"""
        if not hasattr(self, "imgBeadRaw"):
            showerror("Error. No image loaded!")
            return
        try:
            #                imgBeadRaw = imtrans.CenterImageIntensity(self.imgBeadRaw)
            # FIXME: центровка работает как то странно. надо проверить и поправить.
            self.imgBeadRaw = imtrans.ShiftWithPadding(self.imgBeadRaw)
            # creating figure with matplotlib
            fig, axs = plt.subplots(3, 1, sharex=False, figsize=(2, 6))
            axs[0].pcolormesh(
                self.imgBeadRaw[self.imgBeadRaw.shape[0] // 2, :, :], cmap=cm.jet
            )
            axs[1].pcolormesh(
                self.imgBeadRaw[:, self.imgBeadRaw.shape[1] // 2, :], cmap=cm.jet
            )
            axs[2].pcolormesh(
                self.imgBeadRaw[:, :, self.imgBeadRaw.shape[2] // 2], cmap=cm.jet
            )
            # plt.show()
            # Instead of plt.show creating Tkwidget from figure
            self.figIMG_canvas_agg = FigureCanvasTkAgg(fig, self.cnvImg)
            self.figIMG_canvas_agg.get_tk_widget().grid(
                row=1, column=5, rowspan=10, sticky=(N, E, S, W)
            )

        except:
            showerror("centering error")

    def PlotBead3D(self, bead, treshold=np.exp(-1) * 255.0):
        """Plot 3D view of a given bead"""
        # теперь разбрасываем бид по отдельным массивам .
        zcoord = np.zeros(bead.shape[0] * bead.shape[1] * bead.shape[2])
        xcoord = np.zeros(bead.shape[0] * bead.shape[1] * bead.shape[2])
        ycoord = np.zeros(bead.shape[0] * bead.shape[1] * bead.shape[2])
        voxelVal = np.zeros(bead.shape[0] * bead.shape[1] * bead.shape[2])
        nn = 0
        bead = bead / np.amax(bead) * 255.0
        for i, j, k in itertools.product(
            range(bead.shape[0]), range(bead.shape[1]), range(bead.shape[2])
        ):
            zcoord[nn] = i
            xcoord[nn] = j
            ycoord[nn] = k
            voxelVal[nn] = bead[i, j, k]
            nn = nn + 1
        fig1 = plt.figure()
        ax = fig1.add_subplot(111, projection="3d")
        selection = voxelVal > treshold
        im = ax.scatter(
            xcoord[selection],
            ycoord[selection],
            zcoord[selection],
            c=voxelVal[selection],
            alpha=0.5,
            cmap=cm.jet,
        )
        fig1.colorbar(im)
        ax.set_xlabel("X Label")
        ax.set_ylabel("Y Label")
        ax.set_zlabel("Z Label")

        plt.show()

    def CalculatePSF(self):
        txt_beadSizenm = self.beadSizeWgt.get()
        txt_resolutionXY = self.beadImXYResWgt.get()
        txt_resolutionZ = self.beadImZResWgt.get()
        txt_itNum = self.iterNumWgt.get()
        print(txt_beadSizenm, txt_resolutionXY, txt_resolutionZ)
        if not hasattr(self, "imgBeadRaw"):
            showerror("Error", "No bead image loaded.")
        elif txt_beadSizenm == "" or txt_resolutionXY == "" or txt_resolutionZ == "":
            showerror("Error", "Empty Bead size or resolution value.")
        elif txt_beadSizenm == "0" or txt_resolutionXY == "0" or txt_resolutionZ == "0":
            showerror("Error", "Zero Bead size or resolution value.")
        elif txt_itNum == "0" or txt_itNum == "":
            txt_itNum = "10"  # default iteration number
        else:
            try:
                self.beadSizenm = float(txt_beadSizenm)
                self.resolutionXY = float(txt_resolutionXY)
                self.resolutionZ = float(txt_resolutionZ)
                self.beadSizepx = int(self.beadSizenm / self.resolutionXY / 2)
                self.itNum = int(txt_itNum)
                self.imArr1 = imtrans.PaddingImg(self.imgBeadRaw)
                print(
                    "shapes:",
                    self.imArr1.shape[0],
                    self.imArr1.shape[1],
                    self.imArr1.shape[2],
                )
                self.imgPSF = decon.MaxLikelhoodEstimationFFT_3D(
                    self.imArr1,
                    decon.MakeIdealSphereArray(self.imArr1.shape[0], self.beadSizepx),
                    self.itNum,
                )
            except:
                showerror("Error. Can't finish convolution properly.")
                return
            #            self.PlotBead3D(self.imgPSF)
            self.figPSF, axs = plt.subplots(3, 1, sharex=False, figsize=(2, 6))
            self.figPSF.suptitle("PSF")
            axs[0].pcolormesh(
                self.imgPSF[self.imgBeadRaw.shape[0] // 2, :, :], cmap=cm.jet
            )
            axs[1].pcolormesh(
                self.imgPSF[:, self.imgBeadRaw.shape[0] // 2, :], cmap=cm.jet
            )
            axs[2].pcolormesh(
                self.imgPSF[:, :, self.imgBeadRaw.shape[0] // 2], cmap=cm.jet
            )
            # plt.show()
            # Instead of plt.show creating Tkwidget from figure
            self.figPSF_canvas_agg = FigureCanvasTkAgg(self.figPSF, self.cnvPSF)
            self.figPSF_canvas_agg.get_tk_widget().grid(
                row=1, column=6, rowspan=10, sticky=(N, E, S, W)
            )

    def SavePSFMulti(self):
        """Save PSF array as single-page tiff files"""
        if hasattr(self, "imgPSF"):
            txt_folder = self.folderPSFWgt.get()
            txt_prefix = self.filePrfxPSFWgt.get()
            if txt_prefix == "":
                txt_prefix = "EML_psf"
            if txt_folder == "":
                dirId = -1
                while True:
                    dirId += 1
                    print(dirId)
                    txt_folder = str(os.getcwd()) + "\\" + "PSF_folder_" + str(dirId)
                    if not path.isdir(txt_folder):
                        print("creating dir")
                        os.mkdir(txt_folder)
                        break
            fio.SaveTiffFiles(self.imgPSF, txt_folder, txt_prefix)
            showinfo("PSF Files saved at:", txt_folder)

    def SavePSFSingle(self):
        """Save PSF array as multi-page tiff"""
        if hasattr(self, "imgPSF"):
            txt_folder = self.folderPSFWgt.get()
            txt_prefix = self.filePrfxPSFWgt.get()
            if txt_prefix == "":
                txt_prefix = "EML_psf"
            if txt_folder == "":
                dirId = -1
                while True:
                    dirId += 1
                    print(dirId)
                    txt_folder = str(os.getcwd()) + "\\" + "PSF_folder_" + str(dirId)
                    if not path.isdir(txt_folder):
                        print("creating dir")
                        os.mkdir(txt_folder)
                        break
            fio.SaveTiffStack(self.imgPSF, txt_folder, txt_prefix)
            showinfo("PSF File saved at:", txt_folder)

    def BeadExtractPlugin(self):
        #        self.BeadExtraction = BeadExtraction()
        return

    def LoadPSFImageFile(self):
        """Loading raw bead photo from file at self.beadImgPath"""
        fileList = askopenfilenames(title="Load Beads Photo")
        try:
            imgPSFPath = fileList[0]
            print("Open path: ", imgPSFPath)
            self.imgPSF = fio.ReadTiffStackFile(imgPSFPath)
            # creating figure with matplotlib
            self.figPSF, axs = plt.subplots(3, 1, sharex=False, figsize=(2, 6))
            self.figPSF.suptitle("PSF")
            axs[0].pcolormesh(self.imgPSF[self.imgPSF.shape[0] // 2, :, :], cmap=cm.jet)
            axs[1].pcolormesh(self.imgPSF[:, self.imgPSF.shape[0] // 2, :], cmap=cm.jet)
            axs[2].pcolormesh(self.imgPSF[:, :, self.imgPSF.shape[0] // 2], cmap=cm.jet)
            # plt.show()
            # Instead of plt.show creating Tkwidget from figure
            self.figPSF_canvas_agg = FigureCanvasTkAgg(self.figPSF, self.cnvPSF)
            self.figPSF_canvas_agg.get_tk_widget().grid(
                row=1, column=6, rowspan=10, sticky=(N, E, S, W)
            )

        except:
            showerror("LoadBeadImageFile: Error", "Can't read file.")
            return
        # updating scrollers
        # self.cnv1.configure(scrollregion = self.cnv1.bbox('all'))

    def LoadPSFImage(self):
        """Loading PSF from file"""
        if not hasattr(self, "beadImgPath"):
            showerror("Error", "Select bead image first!")
            return
        elif self.beadImgPath == "":
            showerror("Error", "Bead image path is empty!")
            return

        try:
            self.imgBeadRaw = Image.open(self.beadImgPath)
            print("Number of frames: ", self.imgBeadRaw.n_frames)
            frameNumber = int(self.imgBeadRaw.n_frames / 2)
            print("Frame number for output: ", frameNumber)
            # setting imgTmp to desired number
            self.imgBeadRaw.seek(frameNumber)
            # preparing image for canvas from desired frame
            self.cnvBeadImg = ImageTk.PhotoImage(self.imgBeadRaw)
        except:
            showerror("Error", "Can't read file.")
            return
        # replacing image on the canvas
        self.cnvImg.create_image(0, 0, image=self.cnvBeadImg, anchor=NW)
        # updating scrollers
        # self.cnv1.configure(scrollregion = self.cnv1.bbox('all'))

    def DeconvolveIt(self):
        txt_beadSizenm = self.beadSizeWgt.get()
        txt_resolutionXY = self.beadImXYResWgt.get()
        txt_resolutionZ = self.beadImZResWgt.get()
        txt_itNum = self.iterNumWgt.get()
        print(txt_beadSizenm, txt_resolutionXY, txt_resolutionZ)
        if not hasattr(self, "imgBeadRaw"):
            showerror("Error", "No bead image loaded.")
        elif txt_beadSizenm == "" or txt_resolutionXY == "" or txt_resolutionZ == "":
            showerror("Error", "Empty Bead size or resolution value.")
        elif txt_beadSizenm == "0" or txt_resolutionXY == "0" or txt_resolutionZ == "0":
            showerror("Error", "Zero Bead size or resolution value.")
        elif txt_itNum == "0" or txt_itNum == "":
            txt_itNum = "10"  # default iteration number
        else:
            try:
                self.beadSizenm = float(txt_beadSizenm)
                self.resolutionXY = float(txt_resolutionXY)
                self.resolutionZ = float(txt_resolutionZ)
                self.beadSizepx = int(self.beadSizenm / self.resolutionXY / 2)
                self.itNum = int(txt_itNum)
                self.imArr1 = imtrans.PaddingImg(self.imgBeadRaw)
                print(
                    "shapes:",
                    self.imArr1.shape[0],
                    self.imArr1.shape[1],
                    self.imArr1.shape[2],
                )
                self.imgDecon = decon.MaxLikelhoodEstimationFFT_3D(
                    self.imArr1, self.imgPSF, self.itNum
                )
            except:
                showerror("Error. Can't finish convolution properly.")
                return
            #            self.PlotBead3D(self.imgPSF)
            self.figDec, axs = plt.subplots(3, 1, sharex=False, figsize=(2, 6))
            self.figDec.suptitle("Deconvolved")
            dN = self.imgDecon.shape[0]
            axs[0].pcolormesh(self.imgDecon[dN // 2, :, :], cmap=cm.jet)
            #            axs[1].plot(xrange,self.imgBeadRaw[dN // 2,:,dN // 2],'b.-')
            #            axs[1].plot(xrange,self.imgDecon[dN // 2,:,dN // 2],'r.-')
            axs[1].pcolormesh(self.imgDecon[:, dN // 2, :], cmap=cm.jet)
            axs[2].pcolormesh(self.imgDecon[:, :, dN // 2], cmap=cm.jet)
            # plt.show()
            # Instead of plt.show creating Tkwidget from figure
            self.figDec_canvas_agg = FigureCanvasTkAgg(self.figDec, self.cnvDecon)
            self.figDec_canvas_agg.get_tk_widget().grid(
                row=1, column=6, rowspan=10, sticky=(N, E, S, W)
            )

            figComp, ax = plt.subplots(1, 1, sharex=False, figsize=(2, 6))
            figComp.suptitle("Original(blue) vs Deconvolved(red)")
            xrange = np.arange(0, dN)
            ax.plot(xrange, self.imgBeadRaw[dN // 2, :, dN // 2], "b.-")
            ax.plot(xrange, self.imgDecon[dN // 2, :, dN // 2], "r.-")
            if (
                hasattr(self, "imgBeadComp")
                and self.imgBeadComp.shape[1] == self.imgDecon.shape[1]
            ):
                ax.plot(xrange, self.imgBeadComp[:, dN // 2], "g.-")

            top = Toplevel(self)
            top.geometry("300x300")
            top.title("Compare")
            cnvCompare = Canvas(top, width=290, height=290, bg="white")
            cnvCompare.pack(side=TOP, fill=BOTH, expand=True)
            FigureCanvasTkAgg(figComp, cnvCompare).get_tk_widget().pack(
                side=TOP, fill=BOTH, expand=True
            )


if __name__ == "__main__":
    rootWin = PSFExtractorGUI()
    rootWin.mainloop()
