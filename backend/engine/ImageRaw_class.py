import numpy as np
from tkinter import *
import itertools
from scipy.interpolate import interpn
from scipy.interpolate import RegularGridInterpolator
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg


class ImageRaw:
      """Class for image storage."""
      def __init__(self, fpath, voxelSize = [0.1,0.022,0.022],imArray=np.zeros((30,30,30))):
            self.path = fpath

            if self.CheckVoxel(voxelSize):
                  # microscope voxel size(z,x,y) in micrometres (resolution=micrometre/pixel)
                  self.beadVoxelSize = voxelSize 
            self.voxelFields = 'Z','X','Y'
            self.voxelSizeEntries ={}

            self.imArray = imArray
            # fixing possible array value issues
            self.imArray[np.isnan(self.imArray)] = 0 # replace NaN with 0
            self.imArray.clip(0)                     # replace negative with 0


# methods
      def ShowClassInfo(self,plotPreview = False):
            print("ImageClassInfo:")
            print("path:", self.path)
            print("voxel(micrometres):", self.beadVoxelSize)
            print("image shape:", self.imArray.shape)
            if plotPreview == True:  # draw 3 projections of bead
                  figUpsc, figUpscAxs = plt.subplots(3, 1, sharex = False, figsize=(2,6))
                  figUpsc.suptitle("Image preview")
                  figUpscAxs[0].pcolormesh(self.imArray[self.imArray.shape[0] // 2,:,:],cmap=cm.jet)
                  figUpscAxs[1].pcolormesh(self.imArray[:,self.imArray.shape[1] // 2,:],cmap=cm.jet)
                  figUpscAxs[2].pcolormesh(self.imArray[:,:,self.imArray.shape[2] // 2],cmap=cm.jet)
                  newWin= Toplevel(self)
                  newWin.geometry("200x600")
                  newWin.title("Image ")
                  cnvFigUpsc = Canvas(newWin,  width = 200, height = 600, bg = 'white')
                  cnvFigUpsc.pack(side = TOP, fill = BOTH, expand = True)
                  FigureCanvasTkAgg(figUpsc,cnvFigUpsc).get_tk_widget().pack(side = TOP, fill = BOTH, expand = True)

      def CheckVoxel(self, voxel):
            """Checking if voxel empty,wrong length or wrong values. All good return True"""
            if len(voxel) != 3 or np.amin(voxel) <= 0 :
                  return False
            return True            

      def SetVoxel(self, newVoxel):
            """Setting objects voxel"""
            if self.CheckVoxel(newVoxel):
                  try:
                        self.beadVoxelSize = newVoxel
                  except:
                        print("Can't assign new voxel.")
                        return False
            else:
                  print("Something wrong with new voxel.")
                  return False
            return True

      def RescaleZ(self, newZVoxelSize):
            "Rescale over z. newZVoxelSize in micrometers"
            #теперь разбрасываем бид по отдельным массивам .
            oldShape = self.imArray.shape
      #        print("old shape:",oldShape)
      #        print("newshape:",newShape)
            # zcoord = np.zeros(oldShape[0])
            # xcoord = np.zeros(oldShape[1])
            # ycoord = np.zeros(oldShape[2])
            # zcoordR = np.zeros(shapeZ) # shape of rescaled bead in Z dimension  - same as x shape
      #            bead = bead/np.amax(bead)*255.0 # normalize bead intensity
      #        maxcoords = np.unravel_index(np.argmax(bead, axis=None), bead.shape)
      #            print("maxcoords:",maxcoords)

            zcoord = np.arange(oldShape[0]) * self.beadVoxelSize[0]
            xcoord = np.arange(oldShape[1]) * self.beadVoxelSize[1]
            ycoord = np.arange(oldShape[2]) * self.beadVoxelSize[2]
            shapeZ = int(zcoord[oldShape[0]-1] / newZVoxelSize)
            print("voxel size, oldshape, shapeZ :",self.beadVoxelSize[0],oldShape[0] , (shapeZ))
            zcoordR =np.arange(shapeZ) * newZVoxelSize
      #        print("zcoord:",zcoord,shapeZ)
      #        print("zcoordR:",zcoordR)
            interp_fun = RegularGridInterpolator((zcoord, xcoord, ycoord), self.imArray)

            pts = np.array(list(itertools.product(zcoordR, xcoord, ycoord)))
            pts_ID = list(itertools.product(np.arange(shapeZ), np.arange(oldShape[1]), np.arange(oldShape[2])))
            ptsInterp = interp_fun(pts)
            beadInterp = np.ndarray((shapeZ,oldShape[1],oldShape[2]))
            for pID, p_ijk in enumerate(pts_ID):
                  beadInterp[p_ijk[0],p_ijk[1],p_ijk[2]] = ptsInterp[pID]
            self.imArray = beadInterp
            self.beadVoxelSize[0] = newZVoxelSize


if __name__ == '__main__':
      pass
