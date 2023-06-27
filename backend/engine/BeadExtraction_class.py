from logging import raiseExceptions
from tkinter import *
from tkinter import ttk
from tkinter.messagebox import showerror, showinfo
from tkinter.filedialog import askopenfilename
from tkinter.filedialog import askopenfilenames
from PIL import ImageTk, Image, ImageEnhance
from matplotlib import pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from mpl_toolkits.axes_grid1 import make_axes_locatable
import matplotlib.cm as cm
import itertools
import os
from os import path
import numpy as np
from scipy.special import jv
from scipy.ndimage import gaussian_filter,median_filter
from scipy.interpolate import interpn
from scipy.interpolate import RegularGridInterpolator

import file_input as fio
#from  ImageRaw_class import ImageRaw

"""   TODO: 
       - change layer in bead selection window
       - add tiff tag with voxel size information
"""



class BeadExtraction(Tk):
      """Class provides instruments for extraction of beads from microscope multilayer photo."""

      def __init__(self, master = None, wwidth = 600, wheight = 600):
            super().__init__()
            # new  class properties
            self.beadCoords = [] # Coordinates of beads on the canvas
            self.beadMarks = []  # rectangle pics on the canvas
            self.intensityFactor = 1.0 # intensity factor for beads selection widget
            self.beadsPhotoLayerID = 0 # default index of beads microscope photo

            #list of arrays
            beadZlist = []
            beadXlist = []
            beadYlist = []
            beadVal = []

            self.sideHalf = 18 # default selection halfsize

            self.beadDiameter = 0.2 # initial bead diameter in micrometers = diameter(nm)/1000

            self.beadVoxelSize = [0.2,0.089,0.089] # microscope voxel size(z,x,y) in micrometres (resolution=micrometre/pixel)
            self.voxelFields = 'Z','X','Y'
            self.voxelSizeEntries = {}

            self.xr = 0
            self.yr = 0

            # new window widgets
            self.title("Bead extraction window.")
            self.resizable(False,False)
            Label(self, text="Extract Beads Set from the Microscope Image", font='Helvetica 14 bold').grid(row=0,column = 0, columnspan=2)

            f0 = Frame(self)
            #making frames to pack several fileds in one grid cell

            # -------------- image and canvas frame --------------------------
            f1 = Frame(f0)
            Label(f1, text = "1. Load beads photos from the microscope and enter bead size and voxel parameters", font='Helvetica 10 bold').grid(row= 0, column = 0,columnspan = 2, sticky = 'w')

            f1_1 = Frame(f1)
            Button(f1_1, text = 'Load Beads Photo', command = self.LoadBeadsPhoto).pack(side = LEFT, padx = 52, pady = 2)
            Label(f1_1, text = " Adjust canvas brightness:").pack(side = LEFT, padx = 2, pady = 2)
            Button(f1_1, text = '+', command = self.AddBrightnessToBeadSelectionWidget).pack(side = LEFT, padx = 2, pady = 2) 
            Button(f1_1, text = '-', command = self.LowerBrightnessToBeadSelectionWidget).pack(side = LEFT, padx = 2, pady = 2)
            Label(f1_1, text = " Layer:").pack(side = LEFT, padx = 2, pady = 2)
            Button(f1_1, text = '+', command = self.ShowNextLayer).pack(side = LEFT, padx = 2, pady = 2)
            self.label_beadsPhotoLayerID = Label(f1_1, text = str(self.beadsPhotoLayerID))
            self.label_beadsPhotoLayerID.pack(side = LEFT, padx = 2, pady = 2)
            Button(f1_1, text = '-', command = self.ShowPrevLayer).pack(side = LEFT, padx = 2, pady = 2)
            f1_1.grid(row = 1, column = 0, columnspan=2)
            frameBeadSize = Frame(f1)
            Label(frameBeadSize, width = 20, text = 'Actual bead Size:', anchor = 'w').pack(side = LEFT, padx = 2, pady = 2)
            self.beadSizeEntry = Entry(frameBeadSize, width = 5, bg = 'green', fg = 'white')
            self.beadSizeEntry.pack(side = LEFT,padx=2,pady=2)
            Label(frameBeadSize, text = '\u03BCm ').pack(side  = LEFT)# mu simbol encoding - \u03BC
            frameBeadSize.grid(row=2,column=1,padx=2,pady=2,sticky='we')
            self.beadSizeEntry.insert(0, self.beadDiameter)
            self.beadSizeEntry.bind('<Return>', self.ReturnBeadSizeEntryContent)

            voxSizeFrame = Frame(f1)
            Label(voxSizeFrame, text = 'Voxel size (\u03BCm): ', anchor='w').pack(side  = LEFT,padx=2,pady=2)
            for idField,voxelField in enumerate(self.voxelFields):
                  Label(voxSizeFrame, text = voxelField + "=").pack(side  = LEFT,padx=2,pady=2)
                  ent = Entry(voxSizeFrame, width = 5, bg = 'green', fg = 'white')
                  ent.pack(side = LEFT,padx=2,pady=2)
                  Label(voxSizeFrame, text = " ").pack(side  = LEFT,padx=2,pady=2)
                  ent.insert(0,self.beadVoxelSize[idField])
                  ent.bind('<Return>', self.ReturnVoxelSizeEntryContent)
                  self.voxelSizeEntries[voxelField] = ent
            voxSizeFrame.grid(row=2,column=0,sticky='we')
            f1.pack(side=TOP)
            ttk.Separator(f0,orient = "horizontal").pack(ipadx=200, pady=10)
            #---------------------- Mark Beads Frame --------------------

            f2 = Frame(f0)
            Label(f2, text = "2.Mark beads by right click on the window", font='Helvetica 10 bold').grid(row= 0, column = 0,columnspan = 2, sticky = 'w')
            selectSizeFrame = Frame(f2)
            Label(selectSizeFrame, width=20, text = 'Selection Size: ', anchor='w').pack(side = LEFT,padx= 2, pady = 2)
            self.selectSizeEntry = Entry(selectSizeFrame, width = 5, bg = 'green', fg = 'white')
            self.selectSizeEntry.pack(side = LEFT,padx=2,pady=2)
            Label(selectSizeFrame, text = 'px').pack(side  = LEFT,padx=2,pady=2)
            self.selectSizeEntry.insert(0, self.sideHalf * 2)
            self.selectSizeEntry.bind('<Return>', self.ReturnSizeEntryContent)
            selectSizeFrame.grid(row=1,column=0,sticky='we')

            frameMarks = Frame(f2)
            Button(frameMarks,text = 'Undo mark', command = self.RemoveLastMark).pack(side = LEFT,padx=2,pady=2,fill=BOTH,expand=1)
            Button(frameMarks, text = 'Clear All Marks', command = self.ClearAllMarks).pack(side = LEFT, padx=2,pady=2,fill=BOTH,expand = 1)
            frameMarks.grid(row =1,column = 1,sticky='we')
            f2.pack(side =TOP)
            ttk.Separator(f0,orient = "horizontal").pack(ipadx=200, pady=10)

            # ------------------- Extract Beads Frame ------------------------
            f3 = Frame(f0)
            Label(f3, text = "3. Extract selected beads and save set", font='Helvetica 10 bold').grid(row= 0, column = 0,columnspan = 2, sticky = 'w')

            Button(f3, text = 'Extract Selected Beads', command = self.ExtractBeads).grid(row=1,column=0,padx=2,pady=2,sticky='we')

            Button(f3, text = 'Save Extracted Beads', command = self.SaveSelectedBeads).grid(row=1,column=1,padx=2,pady=2,sticky='we')

            self.tiffMenuBitText = ['8 bit','16 bit','32 bit']
            self.tiffMenuBitDict={'8 bit':'uint8','16 bit':'uint16','32 bit':'uint32'}
            self.tiffSaveBitType =  StringVar()
            self.tiffSaveBitType.set(self.tiffMenuBitText[0])

            frameTiffTypeSelect = Frame(f3)
            Label(frameTiffTypeSelect,width=10, text="Tiff type ").pack(side = LEFT,padx= 2,pady=2)
            OptionMenu(frameTiffTypeSelect, self.tiffSaveBitType, *self.tiffMenuBitText).pack(side = LEFT, padx = 2,pady = 2) 
            frameTiffTypeSelect.grid(row=1,column=2,padx=2,pady=2,sticky='we')

            f3.pack(side =TOP)
            ttk.Separator(f0,orient = "horizontal").pack(ipadx=200, pady=10)

            
            # --------------- Average Beads Frame --------------------------
            frameAvrageBeads = Frame(f0)
            Label(frameAvrageBeads, text = "4. Calculate averaged bead with desired blur type and save it.", font='Helvetica 10 bold').pack(side=TOP)

            self.blurMenuTypeText = ['gauss','none','median']
            self.blurApplyType =  StringVar()
            self.blurApplyType.set(self.blurMenuTypeText[0])

            frameBlurTypeSelect = Frame(frameAvrageBeads)
            Label(frameBlurTypeSelect,width=10, text=" Blur type:").pack(side = LEFT,padx= 2,pady=2)
#            OptionMenu(frameBlurTypeSelect, self.blurApplyType, *self.blurMenuTypeText).pack(side = LEFT, padx = 2,pady = 2) 
            blurTypeSelect = ttk.Combobox(frameBlurTypeSelect, textvariable =self.blurApplyType, values = self.blurMenuTypeText,state = "readonly")
            blurTypeSelect.current(0)
            blurTypeSelect.pack(side = LEFT)
            self.doRescaleOverZ = IntVar(value = 0)
            Checkbutton(frameBlurTypeSelect,variable = self.doRescaleOverZ, text = " equal XYZ scale", onvalue =1, offvalue = 0).pack(side = LEFT, padx = 2,pady = 2)
            self.precessBeadPrev = IntVar(value = 0)
            Checkbutton(frameBlurTypeSelect,variable = self.precessBeadPrev, text = " preview bead", onvalue =1, offvalue = 0).pack(side = LEFT, padx = 2,pady = 2)

            frameBlurTypeSelect.pack(side = TOP,padx=2,pady=2)

            frameAvrageBeadsButtons = Frame(frameAvrageBeads)
            Button(frameAvrageBeadsButtons,text = 'Average Bead', command = self.BeadsArithmeticMean).pack(side = LEFT,padx=2,pady=2,fill=BOTH,expand=1)
            Button(frameAvrageBeadsButtons, text = 'Save Average Bead', command = self.SaveAverageBead).pack(side = LEFT, padx=2,pady=2,fill=BOTH,expand = 1)
            frameAvrageBeadsButtons.pack(side=TOP)
            frameAvrageBeads.pack(side = TOP)#grid(row =6,column = 0,sticky='we')

            # frameIdealBead = Frame(self)
            # Button(frameIdealBead,text = 'Save Plane Bead', command = self.SavePlaneSphereBead).pack(side = LEFT,padx=2,pady=2,fill=BOTH,expand=1)
            # Button(frameIdealBead, text = 'Save Airy Bead', command = self.SaveAirySphereBead).pack(side = LEFT, padx=2,pady=2,fill=BOTH,expand = 1)
            # frameIdealBead.grid(row =7,column = 0,sticky='we')

            ttk.Separator(f0,orient = "horizontal").pack(ipadx=200, pady=10)

#            Button(f0, text='Close', background='yellow', command = quit).pack(side = TOP)#grid(row = 6, column = 3,padx=2,pady=2, sticky = 'we')


            f0.grid(row = 1, column = 0, sticky = "NSWE")

            # ---------------- Bead Photo Frame -----------------------------
            canvasFrame = Frame(self)
            self.cnv1 = Canvas(canvasFrame,  width = wwidth, height = wheight, bg = 'white')
            self.cnv1.grid(row = 0,column=0,sticky=(N,E,S,W))
            # main image scrollbars
            self.hScroll = Scrollbar(canvasFrame, orient = 'horizontal')
            self.vScroll = Scrollbar(canvasFrame, orient = 'vertical') 
            self.hScroll.grid(row = 1,column=0,columnspan=2,sticky=(E,W))
            self.vScroll.grid(row=0,column=1,sticky=(N,S))
            self.hScroll.config(command = self.cnv1.xview)
            self.cnv1.config(xscrollcommand=self.hScroll.set)
            self.vScroll.config(command = self.cnv1.yview)
            self.cnv1.config(yscrollcommand=self.vScroll.set)
            # mark bead with right click
            self.cnv1.bind('<Button-3>', self.BeadMarkClick)
            canvasFrame.grid(row = 1,column = 1, sticky = "WENS")

            # -------------- Bead Preview Frame -----------------------------
            beadPreviewFrame = Frame(self)

            #test bead display canvas. May be removed. if implemented separate window.
            Label(beadPreviewFrame, text = 'Bead Preview').pack(side = TOP ,padx = 2, pady = 2)
            self.cnvImg = Canvas(beadPreviewFrame,  width = 190, height = 570, bg = 'white')
            self.cnvImg.pack(side = TOP, padx = 2, pady = 2)


            beadPreviewMenuFrame = Frame(beadPreviewFrame)
            self.beadPrevNum = Entry(beadPreviewMenuFrame, width = 5)
            self.beadPrevNum.pack(side = LEFT)
            self.beadPrevNum.insert(0,len(self.beadCoords))
            Button(beadPreviewMenuFrame, text = "Bead 2D",command = self.PlotBeadPreview2D).pack(side = LEFT)
            Button(beadPreviewMenuFrame, text = "Bead 3D",command = self.PlotBeadPreview3D).pack(side = LEFT)
            beadPreviewMenuFrame.pack(side = TOP,padx=2,pady=2)
            beadPreviewFrame.grid(row = 1, column = 2, sticky = "NSWE")

      def Foo(self):
            """placeholder function"""
            pass
            print("do nothing.")

      def UpdateBeadSelectionWidgetImage(self):
            """ Preparing image for canvas from desired frame with setted parameters."""
            # brightness adjust
            enhancer = ImageEnhance.Brightness(self.imgBeadsRaw)
            imgCanvEnhaced = enhancer.enhance(self.intensityFactor)

            self.imgCnv = ImageTk.PhotoImage(imgCanvEnhaced)
            self.cnv1.create_image(0, 0, image = self.imgCnv, anchor = NW)
            # updating scrollers
            self.cnv1.configure(scrollregion = self.cnv1.bbox('all'))  
            self.DrawAllMarks()


      def AddBrightnessToBeadSelectionWidget(self):
            """ Funcion increase intensity """
            self.intensityFactor *= 1.1 
            self.UpdateBeadSelectionWidgetImage()

      def LowerBrightnessToBeadSelectionWidget(self):
            """ Funcion decrease intensity """
            self.intensityFactor *= 0.9 
            self.UpdateBeadSelectionWidgetImage()


      def ShowNextLayer(self):
            """ Change visible layer """
            self.beadsPhotoLayerID += 1
            if self.beadsPhotoLayerID > self.imgBeadsRaw.n_frames - 1 :
                  self.beadsPhotoLayerID = self.imgBeadsRaw.n_frames - 1
            # updating label on interface
            self.label_beadsPhotoLayerID.config(text = str(self.beadsPhotoLayerID))
            self.imgBeadsRaw.seek(self.beadsPhotoLayerID)
            self.UpdateBeadSelectionWidgetImage()


      def ShowPrevLayer(self):
            """ Change visible layer """
            self.beadsPhotoLayerID += -1
            if self.beadsPhotoLayerID < 0 :
                  self.beadsPhotoLayerID = 0
            # updating label on interface
            self.label_beadsPhotoLayerID.config(text = str(self.beadsPhotoLayerID))
            self.imgBeadsRaw.seek(self.beadsPhotoLayerID)
            self.UpdateBeadSelectionWidgetImage()



      def Bead2Arrays(self,beadID):
            bead = self.selectedBeads[int(beadID)]
            #теперь разбрасываем бид по отдельным массивам .
            print("shape:",bead.shape[0],bead.shape[1],bead.shape[2])
            zcoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            xcoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            ycoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            voxelVal = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            nn = 0
            bead = bead/np.amax(bead)*255.0
            for i,j,k in itertools.product(range(bead.shape[0]),range(bead.shape[1]),range(bead.shape[2])):
                  if bead[i,j,k] > np.exp(-1):
                        zcoord[nn] =  i
                        xcoord[nn] =  j
                        ycoord[nn] =  k
                        voxelVal[nn] =  bead[i,j,k]
       #                 voxelVal[voxelVal < 0.5] = 0
                        nn = nn + 1
            plotFlag = 0
            if plotFlag == 1:
                  fig = plt.figure()
                  ax = fig.add_subplot(111, projection='3d')
                  n = nn-1
                  im = ax.scatter(xcoord[0:n], ycoord[0:n], zcoord[0:n], c=voxelVal[0:n],alpha=0.5, cmap=cm.jet)
                  fig.colorbar(im)
                  ax.set_xlabel('X Label')
                  ax.set_ylabel('Y Label')
                  ax.set_zlabel('Z Label')
                  plt.show()
            return zcoord, xcoord, ycoord, voxelVal

      def PlotBead3D(self, bead, treshold = np.exp(-1)*255.0):
            """Plot 3D view of a given bead"""
            #теперь разбрасываем бид по отдельным массивам .
            zcoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            xcoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            ycoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            voxelVal = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            nn = 0
            bead = bead/np.amax(bead)*255.0
            for i,j,k in itertools.product(range(bead.shape[0]),range(bead.shape[1]),range(bead.shape[2])):
                  zcoord[nn] =  i
                  xcoord[nn] =  j
                  ycoord[nn] =  k
                  voxelVal[nn] =  bead[i,j,k]
                  nn = nn + 1
            fig1= plt.figure()
            ax = fig1.add_subplot(111, projection='3d')
            selection = voxelVal> treshold
            im = ax.scatter(xcoord[selection], ycoord[selection], zcoord[selection], c=voxelVal[selection],alpha=0.5, cmap=cm.jet)
            fig1.colorbar(im)
            ax.set_xlabel('X Label')
            ax.set_ylabel('Y Label')
            ax.set_zlabel('Z Label')

            plt.show()

      def UpscaleBead3D(self, bead, plotPreview = False):
            """Upscale of a given bead"""
            #теперь разбрасываем бид по отдельным массивам .
            zcoord = np.zeros(bead.shape[0])
            xcoord = np.zeros(bead.shape[1])
            ycoord = np.zeros(bead.shape[2])
            zcoordR = np.zeros(bead.shape[1])
            bead = bead/np.amax(bead)*255.0
# new code
#            maximum = np.amax(bead)
#            maxcoords = np.unravel_index(np.argmax(bead, axis=None), bead.shape)
#            print("maxcoords:",maxcoords)
#
            print("range test:", np.linspace(0.0, bead.shape[0], num=bead.shape[0],endpoint=False))
            zcoord = np.arange(bead.shape[0]) * self.beadVoxelSize[0]
            xcoord = np.arange(bead.shape[1]) * self.beadVoxelSize[1]
            ycoord = np.arange(bead.shape[2]) * self.beadVoxelSize[2]
            # shift to compensate rescale move relative to center
            shift = (bead.shape[0] * self.beadVoxelSize[0] - bead.shape[1] * self.beadVoxelSize[1]) * 0.5
#            shift = maxcoords[0] * self.beadVoxelSize[0] - bead.shape[1] * self.beadVoxelSize[1] * 0.5
            zcoordR =shift +  np.arange(bead.shape[1]) * self.beadVoxelSize[1]
            interp_fun = RegularGridInterpolator((zcoord, xcoord, ycoord), bead)

            pts = np.array(list(itertools.product(zcoordR, xcoord, ycoord)))
            pts_ID = list(itertools.product(np.arange(bead.shape[1]), np.arange(bead.shape[1]), np.arange(bead.shape[1])))
            ptsInterp = interp_fun(pts)
            beadInterp = np.ndarray((bead.shape[1],bead.shape[1],bead.shape[1]))
            for pID, p_ijk in enumerate(pts_ID):
                  beadInterp[p_ijk[0],p_ijk[1],p_ijk[2]] = ptsInterp[pID]
            if plotPreview == True:
                  figUpsc, figUpscAxs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
                  figUpsc.suptitle("Image preview")
                  figUpscAxs[0].pcolormesh(beadInterp[beadInterp.shape[0] // 2,:,:],cmap=cm.jet)
                  figUpscAxs[1].pcolormesh(beadInterp[:,beadInterp.shape[1] // 2,:],cmap=cm.jet)
                  figUpscAxs[2].pcolormesh(beadInterp[:,:,beadInterp.shape[2] // 2],cmap=cm.jet)

                  newWin= Toplevel(self)
                  newWin.geometry("200x600")
                  newWin.title("Image ")
                  cnvFigUpsc = Canvas(newWin,  width = 200, height = 600, bg = 'white')
                  cnvFigUpsc.pack(side = TOP, fill = BOTH, expand = True)
                  FigureCanvasTkAgg(figUpsc,cnvFigUpsc).get_tk_widget().pack(side = TOP, fill = BOTH, expand = True)

            # fig, axs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
            # axs[0].pcolormesh(beadInterp[beadInterp.shape[0] // 2,:,:],cmap=cm.jet)
            # axs[1].pcolormesh(beadInterp[:,beadInterp.shape[1] // 2,:],cmap=cm.jet)
            # axs[2].pcolormesh(beadInterp[:,:,beadInterp.shape[2] // 2],cmap=cm.jet)
            # plt.show()
            return beadInterp

      def UpscaleBead_Zaxis(self, bead, plotPreview = False):
            """Upscale along Z axis of a given bead"""
            #теперь разбрасываем бид по отдельным массивам .
            zcoord = np.zeros(bead.shape[0])
            xcoord = np.zeros(bead.shape[1])
            ycoord = np.zeros(bead.shape[2])
            zcoordR = np.zeros(bead.shape[1]) # shape of rescaled bead in Z dimension  - same as x shape
#            bead = bead/np.amax(bead)*255.0 # normalize bead intensity
            maxcoords = np.unravel_index(np.argmax(bead, axis=None), bead.shape)
#            print("maxcoords:",maxcoords)

            zcoord = np.arange(bead.shape[0]) * self.beadVoxelSize[0]
            xcoord = np.arange(bead.shape[1]) * self.beadVoxelSize[1]
            ycoord = np.arange(bead.shape[2]) * self.beadVoxelSize[2]
            # shift to compensate rescale move relative to center
#            shift = (bead.shape[0] * self.beadVoxelSize[0] - bead.shape[1] * self.beadVoxelSize[1]) * 0.5
            # fixed shift now depends on center of the bead
            shift = maxcoords[0] * self.beadVoxelSize[0] - bead.shape[1] * self.beadVoxelSize[1] * 0.5
            zcoordR = shift +  np.arange(bead.shape[1]) * self.beadVoxelSize[1]
            interp_fun = RegularGridInterpolator((zcoord, xcoord, ycoord), bead)

            pts = np.array(list(itertools.product(zcoordR, xcoord, ycoord)))
            pts_ID = list(itertools.product(np.arange(bead.shape[1]), np.arange(bead.shape[1]), np.arange(bead.shape[1])))
            ptsInterp = interp_fun(pts)
            beadInterp = np.ndarray((bead.shape[1],bead.shape[1],bead.shape[1]))
            for pID, p_ijk in enumerate(pts_ID):
                  beadInterp[p_ijk[0],p_ijk[1],p_ijk[2]] = ptsInterp[pID]
            self.__upscaledBead = np.ndarray((bead.shape[1],bead.shape[1],bead.shape[1]))
            self.__upscaledBead = beadInterp
            self.beadVoxelSize[0] = self.beadVoxelSize[1]
            if plotPreview == True:  # draw 3 projections of bead
                  figUpsc, figUpscAxs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
                  figUpsc.suptitle("Image preview")
                  figUpscAxs[0].pcolormesh(beadInterp[beadInterp.shape[0] // 2,:,:],cmap=cm.jet)
                  figUpscAxs[1].pcolormesh(beadInterp[:,beadInterp.shape[1] // 2,:],cmap=cm.jet)
                  figUpscAxs[2].pcolormesh(beadInterp[:,:,beadInterp.shape[2] // 2],cmap=cm.jet)

                  newWin= Toplevel(self)
                  newWin.geometry("200x600")
                  newWin.title("Image ")
                  cnvFigUpsc = Canvas(newWin,  width = 200, height = 600, bg = 'white')
                  cnvFigUpsc.pack(side = TOP, fill = BOTH, expand = True)
                  FigureCanvasTkAgg(figUpsc,cnvFigUpsc).get_tk_widget().pack(side = TOP, fill = BOTH, expand = True)

            return beadInterp


      def PlotBead3DResample(self,bead):
            """may be removed."""
            zcoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            xcoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            ycoord = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            voxelVal = np.zeros(bead.shape[0]*bead.shape[1]*bead.shape[2])
            nn = 0
            bead = bead/np.amax(bead)*255.0
            treshold = np.exp(-1)*255.0
            for i,j,k in itertools.product(range(bead.shape[0]),range(bead.shape[1]),range(bead.shape[2])):
                  if bead[i,j,k] > treshold:
                        zcoord[nn] =  i
                        xcoord[nn] =  j
                        ycoord[nn] =  k
                        voxelVal[nn] =  bead[i,j,k]
                        nn = nn + 1
            plotFlag = True
            if plotFlag:
                  fig = plt.figure()
                  ax = fig.add_subplot(111, projection='3d')
                  n = nn-1
                  im = ax.scatter(xcoord[0:n], ycoord[0:n], zcoord[0:n], c=voxelVal[0:n],alpha=0.5, cmap=cm.jet)
                  fig.colorbar(im)
                  ax.set_xlabel('X Label')
                  ax.set_ylabel('Y Label')
                  ax.set_zlabel('Z Label')
                  plt.show()

      def LoadBeadsPhoto(self):
            """Loading raw beads photo from file"""
            fileList = askopenfilenames(title = 'Load Beads Photo')
            if len(fileList) > 1:
                  self.imgCnvArr = fio.ReadTiffMultFiles(fileList)
                  try:
                        self.beadsPhotoLayerID = int(len(fileList)/2)
                        tmppath = os.getcwd()+"\\tmp.tiff"
                        # Checking existance of self.imgBeadsRaw.close()
                        try: 
                              self.imgBeadsRaw.close()
                        except :
                              pass
                        fio.SaveAsTiffStack(self.imgCnvArr, tmppath)
                        self.imgBeadsRaw = Image.open(tmppath)
                        self.imgBeadsRaw.seek(self.beadsPhotoLayerID)
                  except:
                        showerror("Error"," Multifile load: Can't read file for canvas")
                        return
            else:
                  beadImPath = fileList[0]
                  print("read one file",beadImPath)
                  self.imgCnvArr = fio.ReadTiffStackFile(beadImPath)
                  try:
                        self.imgBeadsRaw = Image.open(beadImPath)
                        print(self.imgBeadsRaw.mode)
                        print("Number of frames: ", self.imgBeadsRaw.n_frames)
                        self.beadsPhotoLayerID = int( self.imgBeadsRaw.n_frames / 2)
                        print("Frame number for output: ", self.beadsPhotoLayerID)
                        # setting imgTmp to desired number
                        self.imgBeadsRaw.seek(self.beadsPhotoLayerID)
                  except:
                        showerror("Error","Singlefile load: Can't read file for canvas.")
                        return
            # updating label on interface
            self.label_beadsPhotoLayerID.config(text = str(self.beadsPhotoLayerID))
            # preparing image for canvas from desired frame
            self.imgCnv = ImageTk.PhotoImage(self.imgBeadsRaw)
            # replacing image on the canvas
            self.cnv1.create_image(0, 0, image = self.imgCnv, anchor = NW)
            # updating scrollers
            self.cnv1.configure(scrollregion = self.cnv1.bbox('all'))  


      
      def BeadMarkClickOld(self,event):
            """Append mouse event coordinates to global list."""
            cnv = event.widget
            self.xr,self.yr = cnv.canvasx(event.x),cnv.canvasy(event.y)
            self.beadMarks.append(cnv.create_rectangle(self.xr-self.sideHalf,self.yr-self.sideHalf,self.xr+self.sideHalf,self.yr+self.sideHalf, outline='chartreuse1',width = 2))
            self.beadCoords.append([self.xr,self.yr])

      def BeadMarkClick(self,event):
            """Append mouse event coordinates to global list. Center is adjusted according to max intensity."""
            cnv = event.widget
            self.xr,self.yr = cnv.canvasx(event.x),cnv.canvasy(event.y)
#            self.xr,self.yr = self.LocateFrameMAxIntensity2D()   # 2d center 
            self.xr,self.yr = self.LocateFrameMAxIntensity3D()
            self.beadMarks.append(cnv.create_rectangle(self.xr-self.sideHalf,self.yr-self.sideHalf,self.xr+self.sideHalf,self.yr+self.sideHalf, outline='chartreuse1',width = 2))
            self.beadCoords.append([self.xr,self.yr])

      def DrawAllMarks(self):
            """Draw marks for beads on main canvas(cnv1)"""
            cnv = self.cnv1
            for self.xr,self.yr in self.beadCoords:
                  self.beadMarks.append(cnv.create_rectangle(self.xr-self.sideHalf,self.yr-self.sideHalf,self.xr+self.sideHalf,self.yr+self.sideHalf, outline='chartreuse1',width = 2))


      def LocateFrameMAxIntensity2D(self):
            """Locate point with maximum intensity in current 2d array.
                  In: array - np.array
                  Out: coords - list
            """
            d = self.sideHalf
            # dimension 0 - its z- plane
            # dimension 1 - y
            # dimension 2 - x
            xi =  self.xr
            yi =  self.yr
            bound3 = int(xi - d) 
            bound4 = int(xi + d)
            bound1 = int(yi - d)
            bound2 = int(yi + d)
#                  print("coords: ",bound1,bound2,bound3,bound4)
            sample = self.imgCnvArr[int( self.imgBeadsRaw.n_frames / 2),bound1:bound2,bound3:bound4]
            maximum = np.amax(sample)
            coords = np.unravel_index(np.argmax(sample, axis=None), sample.shape)
            #    print("LocateMaxIntensity: amax: ", maximum)
            print("LocateMaxIntensity: coords:", coords)
            return coords[2]+bound3,coords[1]+bound1

# TODO: 3D need additional testing. Maybe centering along z-axis also?
      def LocateFrameMAxIntensity3D(self):
            """Locate point with maximum intensity in current 3d array.
                  In: array - np.array
                  Out: coords - list
            """
            d = self.sideHalf
            # dimension 0 - its z- plane
            # dimension 1 - y
            # dimension 2 - x
            xi =  self.xr
            yi =  self.yr
            bound3 = int(xi - d) 
            bound4 = int(xi + d)
            bound1 = int(yi - d)
            bound2 = int(yi + d)
#                  print("coords: ",bound1,bound2,bound3,bound4)
            sample = self.imgCnvArr[:,bound1:bound2,bound3:bound4]
            maximum = np.amax(sample)
            coords = np.unravel_index(np.argmax(sample, axis=None), sample.shape)
#            print("LocateMaxIntensity: coords:", coords)
            return coords[2]+bound3,coords[1]+bound1

      def RemoveLastMark(self):
            """Removes the last bead in the list"""
            self.beadCoords.pop()
            self.cnv1.delete(self.beadMarks[-1])
            self.beadMarks.pop()

      def ClearAllMarks(self):
            """Clears all bead marks"""
            self.beadCoords = []
            for sq in self.beadMarks:
                  self.cnv1.delete(sq)
            self.beadMarks = []

      def IsFloat(self, string):
            """ Checks if string is float or not ( isnumeric() works only for integers )"""
            try:
                  float(string)
                  return True
            except ValueError:
                  return False

      def ReturnVoxelSizeEntryContent(self,event):
            """Bead voxel size change"""
            for idField,vField in enumerate(self.voxelFields):
                  tmp = self.voxelSizeEntries[vField].get()
                  if not self.IsFloat(tmp):
                        showerror("ReturnVoxelSizeContent", "Bad input: not a number.")
                        self.voxelSizeEntries[vField].delete(0,END)
                        self.voxelSizeEntries[vField].insert(0,self.beadVoxelSize[idField])
                        return
                  else:
                        if float(tmp) < 0.0000001:
                              showerror("ReturnVoxelSizeContent", "Bad input: zero or negative.")
                              self.voxelSizeEntries[vField].delete(0,END)
                              self.voxelSizeEntries[vField].insert(0,self.beadVoxelSize[idField])
                              return
                        else:
                              self.beadVoxelSize[idField] = float(tmp)
#            print(self.beadVoxelSize)

      def ReturnSizeEntryContent(self,event):
            """Bead selection size change"""
            tmp = self.selectSizeEntry.get()
            if not tmp.isnumeric():
                  showerror("ReturnSizeEntryContent", "Bad input")
                  self.selectSizeEntry.delete(0,END)
                  self.selectSizeEntry.insert(0,self.sideHalf * 2)
                  return
            else:
                  self.sideHalf = int(abs(float(tmp)) / 2)

      def ReturnBeadSizeEntryContent(self,event):
            """Bead selection size change"""
            tmp = self.selectSizeEntry.get()
            if not tmp.isnumeric():
                  showerror("ReturnSizeEntryContent", "Bad input")
                  self.selectSizeEntry.delete(0,END)
                  self.selectSizeEntry.insert(0,self.sideHalf * 2)
                  return
            else:
                  self.sideHalf = abs(int(float(tmp) / 2))
                  
      def ExtractBeads(self):
            """Extracting bead stacks from picture set"""
            self.selectedBeads = []
            d = self.sideHalf
            print(self.imgCnvArr.shape)
            elem = np.ndarray([self.imgCnvArr.shape[0],d*2,d*2])
            for idx,i in enumerate(self.beadCoords):
                  bound3 = int(i[0] - d)
                  bound4 = int(i[0] + d)
                  bound1 = int(i[1] - d)
                  bound2 = int(i[1] + d)
#                  print("coords: ",bound1,bound2,bound3,bound4)
                  elem = self.imgCnvArr[:,bound1:bound2,bound3:bound4]
                  self.selectedBeads.append(elem)


      def SaveSelectedBeads(self):
            """Save selected beads as multi-page tiffs"""
            if hasattr(self, 'selectedBeads')  :
#                  txt_folder = self.folderPSFWgt.get()
#                  txt_prefix = self.filePrfxPSFWgt.get()
                  txt_folder = ''
                  txt_prefix = ''
                  if txt_prefix == '':
                        txt_prefix = "bead_"
                  if txt_folder == '':
                        dirId = -1
                  while True:
                        dirId += 1
                        print(dirId)
                        txt_folder = str(os.getcwd()) + "\\"+"bead_folder_"+str(dirId)
                        if not path.isdir(txt_folder):
                              print("creating dir")
                              os.mkdir(txt_folder)
                              break
                  tiffBit = self.tiffMenuBitDict[self.tiffSaveBitType.get()]
                  for idx,bead in enumerate(self.selectedBeads):
                        # bead = self.BlurBead(bead)
                        # if self.doRescaleOverZ.get() == 1:
                        #       bead = self.UpscaleBead_Zaxis(bead)
                        fio.SaveTiffStack(bead,  txt_folder, txt_prefix+str(idx).zfill(2),tiffBit)
                        # the rest is test bead view print. May be removed later
#                        self.imgBeadRaw = bead
                        # creating figure with matplotlib
                        # fig, axs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
                        # axs[0].pcolormesh(self.imgBeadRaw[self.imgBeadRaw.shape[0] // 2,:,:],cmap=cm.jet)
                        # axs[1].pcolormesh(self.imgBeadRaw[:,self.imgBeadRaw.shape[1] // 2,:],cmap=cm.jet)
                        # axs[2].pcolormesh(self.imgBeadRaw[:,:,self.imgBeadRaw.shape[2] // 2],cmap=cm.jet)
                        # plt.show()
                        # Instead of plt.show creating Tkwidget from figure
                        # self.figIMG_canvas_agg = FigureCanvasTkAgg(fig,self.cnvImg)
                        # self.figIMG_canvas_agg.get_tk_widget().grid(row = 1,column=5, rowspan=10,sticky=(N,E,S,W))
                  showinfo("Selected beads tiffs saved at saved at:", txt_folder)


      def PlotBeadPreview2D(self):
            """"Plots three bead in XYZ planes"""
            if len(self.beadCoords) <= 0:
                  showerror("PlotBeadPreview","Error. No beads selected")
            elif not hasattr(self,'selectedBeads'):
                  showerror("PlotBeadPreview","Error. Beads are not extracted.")
            else:
                  tmp = self.beadPrevNum.get()
#                  self.BeadAsArrays(0)
                  if not tmp.isnumeric():
                        showerror("PlotBeadPreview", "Bad input")
                        self.beadPrevNum.delete(0,END)
                        self.beadPrevNum.insert(0,str(len(self.selectedBeads)-1))
                        return
                  else:
                        try:
                              self.imgBeadRaw = self.selectedBeads[int(tmp)]
                              # creating figure with matplotlib
                              fig, axs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
                              axs[0].pcolormesh(self.imgBeadRaw[self.imgBeadRaw.shape[0] // 2,:,:],cmap=cm.jet)
                              axs[1].pcolormesh(self.imgBeadRaw[:,self.imgBeadRaw.shape[1] // 2,:],cmap=cm.jet)
                              axs[2].pcolormesh(self.imgBeadRaw[:,:,self.imgBeadRaw.shape[2] // 2],cmap=cm.jet)
                              # plt.show()
                              # Instead of plt.show creating Tkwidget from figure
                              self.figIMG_canvas_agg = FigureCanvasTkAgg(fig,self.cnvImg)
                              self.figIMG_canvas_agg.get_tk_widget().grid(row = 1,column=5, rowspan=10,sticky=(N,E,S,W))
                        except IndexError:
                              showerror("PlotBeadPreview", "Index out of range.")
                              self.beadPrevNum.delete(0,END)
                              self.beadPrevNum.insert(0,str(len(self.selectedBeads)-1))

      def PlotBeadPreview3D(self):
            """"Plots three bead in 3D pointplot"""
            if len(self.beadCoords) <= 0:
                  showerror("PlotBeadPreview","Error. No beads selected")
            elif not hasattr(self,'selectedBeads'):
                  showerror("PlotBeadPreview","Error. Beads are not extracted.")
            else:
                  tmp = self.beadPrevNum.get()
#                  self.BeadAsArrays(0)
                  if not tmp.isnumeric():
                        showerror("PlotBeadPreview", "Bad input")
                        self.beadPrevNum.delete(0,END)
                        self.beadPrevNum.insert(0,str(len(self.selectedBeads)-1))
                        return
                  else:
                        try:
                              self.PlotBead3D(self.selectedBeads[int(tmp)])
                        except IndexError:
                              showerror("PlotBeadPreview", "Index out of range.")
                              self.beadPrevNum.delete(0,END)
                              self.beadPrevNum.insert(0,str(len(self.selectedBeads)-1))

      def BlurBead(self, bead, blurType, plotPreview = False):
            """
            Blur bead with selected filter
            """
#            blurType = self.blurApplyType.get()
            if blurType == 'gauss':
                  bead  = gaussian_filter(bead, sigma = 1)
            elif blurType == 'median':
                  bead = median_filter(bead, size = 3)
            beadInterp = np.ndarray((bead.shape[1],bead.shape[1],bead.shape[1]))
            if plotPreview == True:  # draw 3 projections of bead
                  figUpsc, figUpscAxs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
                  figUpsc.suptitle("Image preview")
                  figUpscAxs[0].pcolormesh(bead[bead.shape[0] // 2,:,:],cmap=cm.jet)
                  figUpscAxs[1].pcolormesh(bead[:,beadInterp.shape[1] // 2,:],cmap=cm.jet)
                  figUpscAxs[2].pcolormesh(bead[:,:,bead.shape[2] // 2],cmap=cm.jet)

                  newWin= Toplevel(self)
                  newWin.geometry("200x600")
                  newWin.title("Image ")
                  cnvFigUpsc = Canvas(newWin,  width = 200, height = 600, bg = 'white')
                  cnvFigUpsc.pack(side = TOP, fill = BOTH, expand = True)
                  FigureCanvasTkAgg(figUpsc,cnvFigUpsc).get_tk_widget().pack(side = TOP, fill = BOTH, expand = True)

            return bead

      def BeadsArithmeticMean(self):
#            print("blurtype", self.blurApplyType.get(), "rescale Z", self.doRescaleOverZ.get() )
            if not hasattr(self,'selectedBeads'):
                  showerror("Error","Extract beads first.")
            else:
                  self.__avrageBead = sum(self.selectedBeads) / len(self.selectedBeads)
                  # blurType = self.blurApplyType.get()
                  # if blurType == 'gauss':
                  #       self.__avrageBead = gaussian_filter(self.__avrageBead, sigma = 1)
                  # elif blurType == 'median':
                  #       self.__avrageBead = median_filter(self.__avrageBead, size = 3)
                  self.__avrageBead = self.BlurBead(self.__avrageBead, self.blurApplyType.get())
                  if self.doRescaleOverZ.get() == 1:
                        self.__avrageBead = self.UpscaleBead_Zaxis(self.__avrageBead)
                  if self.precessBeadPrev.get() == 1:  # draw 3 projections of bead
                        figUpsc, figUpscAxs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
                        figUpsc.suptitle("Image preview")
                        figUpscAxs[0].pcolormesh(self.__avrageBead[self.__avrageBead.shape[0] // 2,:,:],cmap=cm.jet)
                        figUpscAxs[1].pcolormesh(self.__avrageBead[:,self.__avrageBead.shape[1] // 2,:],cmap=cm.jet)
                        figUpscAxs[2].pcolormesh(self.__avrageBead[:,:,self.__avrageBead.shape[2] // 2],cmap=cm.jet)

                        newWin= Toplevel(self)
                        newWin.geometry("200x600")
                        newWin.title("Image ")
                        cnvFigUpsc = Canvas(newWin,  width = 200, height = 600, bg = 'white')
                        cnvFigUpsc.pack(side = TOP, fill = BOTH, expand = True)
                        FigureCanvasTkAgg(figUpsc,cnvFigUpsc).get_tk_widget().pack(side = TOP, fill = BOTH, expand = True)
                       

      def SaveAverageBead(self):
            """Save averaged bead to file"""
            print("upscaled bead shape:", type(self.__avrageBead))
            txt_folder = ''
            txt_prefix = ''
            if txt_prefix == '':
                  txt_prefix = "Average_r_"
            if txt_folder == '':
                  txt_folder = str(os.getcwd()) + "\\"+"average_bead_folder"
            if not path.isdir(txt_folder):
                  print("creating dir")
                  os.mkdir(txt_folder)
                  fname = txt_prefix+str(self.beadDiameter*1000)+"nm".zfill(2)
            elif path.isfile( txt_folder + "\\" + txt_prefix + str(self.beadDiameter*1000) + "nm".zfill(2)):
            # TODO: resolve duplicate fname  (popup name ask)
                  fname = txt_prefix+str(self.beadDiameter*1000)+"nm".zfill(2)+"_1"
            tiffBit = self.tiffMenuBitDict[self.tiffSaveBitType.get()]
            fio.SaveTiffStack(self.__avrageBead,  txt_folder, txt_prefix+str(self.beadDiameter*1000)+"nm".zfill(2),tiffBit)



      def PointFunctionAiry(self,pt, r0, maxIntensity=255, zoomfactor = 2.6):
            """Function of sphere of radius r with center in r0. 
            Function return Airy disk intesity within first circle if pt in sphere and 0 if out of sphere.
            pt and r0 are np.array vectors : np.array([x,y,z])
            All  dimension in pixels are equal to x-dimension
            """
            pt = pt * self.beadVoxelSize[1]
            r0 = r0 * self.beadVoxelSize[1]
            r = self.beadDiameter * zoomfactor / 2.
            # pt[0] = pt[0] * self.beadVoxelSize[1]
            # pt[1] = pt[1] * self.beadVoxelSize[1]/ zoomfactor
            # pt[2] = pt[2] * self.beadVoxelSize[1]/ zoomfactor
            # r0[0] = r0[0] * self.beadVoxelSize[1]
            # r0[1] = r0[1] * self.beadVoxelSize[1]/zoomfactor
            # r0[2] = r0[2] * self.beadVoxelSize[1]/zoomfactor
            r = self.beadDiameter  / 2.

            distSq = (pt-r0).dot(pt-r0)
            dist = np.sqrt(distSq) 
            if distSq <= r * r :
                  x = dist / r * 4.0
                  # NOTE: If 'x' is equal zero - result == nan!. To prevent it - make result equal 'maxIntensity'
                  if abs(x) >= 0.00001:          # Zero-criterion
                        result = (2. * jv(1, x) / x)**2 * maxIntensity
                  else:
                        result = maxIntensity
            else:
                  result = 0
            return result

      def PointFunctionAiryZoomed(self,pt, r0, maxIntensity=255, zoomfactor = 2.6):
            """
            Zoom of bead circle  from microscope
            Radius = self.BeadDiameter / 2
            Center  r0 - np.array[0:2]. 
            Function return Airy disk intesity within first circle if pt in sphere and 0 if out of sphere.
            pt and r0 are np.array vectors : np.array([x,y,z])
            All  dimension in pixels are equal to x-dimension
            """
            l = abs(r0[0]-pt[0]) * self.beadVoxelSize[1]
            r = self.beadDiameter / 2.
            if r**2 - l**2 > 0:
                  R =np.sqrt(r**2 - l**2) * zoomfactor
                  ptd = pt * self.beadVoxelSize[1]
                  r0d = r0 * self.beadVoxelSize[1]

                  distSq = (ptd[1]-r0d[1])**2 + (ptd[2]-r0d[2])**2
                  dist = np.sqrt(distSq) 
#                  print("ZoomedN:",pt,r0,l,r,R)
#                  print("ZoomedD:",ptd,r0d,l,r,R)
                  if distSq <= R**2:
                        x = dist / R * 4.0
                        # NOTE: If 'x' is equal zero - result == nan!. To prevent it - make result equal 'maxIntensity'
                        if abs(x) >= 0.00001:          # Zero-criterion
                              result = (2. * jv(1, x) / x)**2 * maxIntensity
                        else:
                              result = maxIntensity
                  else:
                        result = 0

            else:
                  result = 0

            return result



      def MakeIdealSphereArray(self, sphere_type = "airy"):
            """create ideal  sphere array corresponding to sphere_type"""
            if sphere_type == 'airy':
                  imgMidCoord = self.sideHalf
                  imgSize = self.sideHalf * 2
                  imgCenter = np.array([imgMidCoord,imgMidCoord,imgMidCoord])
                  tiffDraw = np.ndarray([imgSize,imgSize,imgSize])

                  tiffBit = self.tiffMenuBitDict[self.tiffSaveBitType.get()]
                  
                  # NOTE: get max intensity for different output bits types
                  lightIntensity = np.iinfo(tiffBit).max
                  print("Airy parameters:")
                  print("voxel size:", self.beadVoxelSize[1])
                  print("diameter:", self.beadDiameter)
                  print("center:",imgCenter," intensity:",lightIntensity)
                  
                  for i,j,k in itertools.product(range(imgSize), repeat = 3):
                        tiffDraw[i,j,k] = self.PointFunctionAiryZoomed(np.array([i,j,k]), imgCenter, lightIntensity)
                  self.PlotBead3D(tiffDraw,1)
                  # fig, axs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
                  # axs[0].pcolormesh(tiffDraw[imgMidCoord,:,:],cmap=cm.jet)
                  # axs[1].pcolormesh(tiffDraw[:,imgMidCoord,:],cmap=cm.jet)
                  # axs[2].pcolormesh(tiffDraw[:,:,imgMidCoord],cmap=cm.jet)
                  # plt.show()
            elif sphere_type == 'plane':
                  print("Not Implemented")
                  return
                  # тут должна быть сфера с постоянной  яркостью.
            else:
                  raise ValueError('unsupported sphere_type')               
            return tiffDraw

      def SaveAirySphereBead(self):
            imgSize =  self.sideHalf
            try:
                  bead = self.MakeIdealSphereArray('airy')
            except:
                  print("Type problem")
                  return
            txt_folder = ''
            txt_prefix = ''
            if txt_prefix == '':
                  txt_prefix = "Airy_r_"
            if txt_folder == '':
                  txt_folder = str(os.getcwd()) + "\\"+"airy_bead_folder"
            if not path.isdir(txt_folder):
                  print("creating dir")
                  os.mkdir(txt_folder)
            tiffBit = self.tiffMenuBitDict[self.tiffSaveBitType.get()]
            fio.SaveTiffStack(bead,  txt_folder, txt_prefix+str(self.beadDiameter*1000)+"nm".zfill(2),tiffBit)

      def SavePlaneSphereBead(self):
            imgSize =  self.sideHalf
            try:
                  bead = self.MakeIdealSphereArray('plane')
            except:
                  print("Type problem")
                  return
            txt_folder = ''
            txt_prefix = ''
            if txt_prefix == '':
                  txt_prefix = "Airy_r_"
            if txt_folder == '':
                  txt_folder = str(os.getcwd()) + "\\"+"airy_bead_folder"
            if not path.isdir(txt_folder):
                  print("creating dir")
                  os.mkdir(txt_folder)
            tiffBit = self.tiffMenuBitDict[self.tiffSaveBitType.get()]
            fio.SaveTiffStack(bead,  txt_folder, txt_prefix+str(self.beadDiameter*1000)+"nm".zfill(2),tiffBit)




if __name__ == '__main__':
      base1 = BeadExtraction()
      base1.mainloop()