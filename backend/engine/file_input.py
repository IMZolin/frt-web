import numpy as np
from PIL import Image
import tifffile as tff          #  https://pypi.org/project/tifffile/


def ReadTiffStackFile(fileName):
    """Function ReadTiffStackFile() reads tiff stack from file and return np.array"""
    try:
        image_tiff = Image.open(fileName)
        ncols, nrows = image_tiff.size
        nlayers = image_tiff.n_frames
        imgArray = np.ndarray([nlayers, nrows, ncols])
        for i in range(nlayers):
            image_tiff.seek(i)
            imgArray[i, :, :] = np.array(image_tiff)
        return ncols, nrows, nlayers, imgArray
    except FileNotFoundError:
        print("ReadTiffStackFile: Error. File not found!")
        return 0, 0, 0, np.array([])  # Return default values in case of an error


def ReadTiffMultFiles(fileNameList):
    """Function ReadTiffStackFile() reads tiff stack from file and return np.array"""
    print("Loading Images from files", end = " ")
    intensity_mult = 10
    try:
        image_preread = Image.open(fileNameList[0])
        print("color_mode:", image_preread.mode, ".......", end = " ")
        nlayers =  len(fileNameList)
        ncols, nrows = image_preread.size
        imgArray = np.ndarray([nlayers,nrows,ncols])
        # checking file color mode and convert to grayscale
        if image_preread.mode == "RGB":
            #convert to Grayscale
            for i,fileName in enumerate(fileNameList):
                image_tiff = Image.open(fileName)
                image_tiff.getdata()
                r, g, b = image_tiff.split()
                ra = np.array(r)
                ga = np.array(g)
                ba = np.array(b)
                grayImgArr = (0.299*ra + 0.587*ga + 0.114*ba)
                imgArray[i,:,:] = grayImgArr
                #print("maxint:", i, np.max(grayImgArr))
        elif image_preread.mode =="I" or image_preread.mode =="L":
            for i,fileName in enumerate(fileNameList):
                imgArray[i,:,:] = np.array(Image.open(fileName))
        print("Done.")
        return imgArray
    except FileNotFoundError:
        print("ReadTiffStackFile: Error. File not found!")
        return 0


def ReadTiffStackFileTFF(fileName):
    """Function ReadTiffStackFile() reads tiff stack from file and return np.array"""
    print("Loading Image from tiff stack file..... ", end = ' ')
    try:
        image_stack = tff.imread(fileName)
        print("Done.")
        return image_stack
    except FileNotFoundError:
        print("ReadTiffStackFileTFF: Error. File not found!")
        return 0



def SaveTiffFiles(tiffDraw = np.zeros([3,4,6]), dirName = "img", filePrefix = ""):
  """ Print files for any input arrray of intensity values
      tiffDraw - numpy ndarray of intensity values"""
  layerNumber = tiffDraw.shape[0]
  for i in range(layerNumber):
    im = Image.fromarray(tiffDraw[i,:,:])
    im.save(dirName+"\\"+filePrefix+str(i).zfill(2)+".tiff")





def SaveTiffStack(tiffDraw = np.zeros([3,4,6]), dirName = "img", filePrefix = "!stack", outtype = "uint8"):
    """ Print files for any input arrray of intensity values 
        tiffDraw - numpy ndarray of intensity values"""
    print("trying to save file", outtype)
    path = dirName+"\\"+filePrefix+".tif"
    imlist = []
    for tmp in tiffDraw:
#        print(tmp.shape,type(tmp))
        imlist.append(Image.fromarray(tmp.astype(outtype)))

    imlist[0].save( path, save_all=True, append_images=imlist[1:])
    print("file saved in one tiff",dirName+"\\"+filePrefix+".tiff")

def SaveAsTiffStack(tiffDraw = np.zeros([3,4,6]), filename= "img", outtype = "uint8"):
    """ Save 3D numpy array as tiff multipage file. 
        Input:
        tiffDraw -- 3d numpy ndarray of intensity values
        filename -- name of output file
        outtype -- type of output file ( uint8/16/32)"""
    print( "Trying to save tiff file as:", filename, " color_mode:", outtype ,".......", end = " ")
    imlist = []
#    try: 
    for tmp in tiffDraw:
        imlist.append( Image.fromarray( tmp.astype(outtype) ) )
    imlist[0].save( filename, save_all=True, append_images=imlist[1:])
    print("Done.")
    # except Exception as e:
    #     print("Not done.")
    #     print("Exception message: ", e)

def SaveAsTiffStack_tag(tiffDraw = np.zeros([3,4,6]), filename= "img", outtype = "uint8"):
    """ Print files for any input arrray of intensity values 
        tiffDraw - numpy ndarray of intensity values"""
    print( "Trying to save file", outtype )
    imlist = []
    for tmp in tiffDraw:
        imlist.append( Image.fromarray( tmp.astype(outtype) ) )
    #imlist[0].tag[270] = "testing tag system"
    imlist[0].save( filename, tiffinfo = "testing tag system", save_all=True, append_images=imlist[1:])
    print( "File saved in one tiff", filename )




def SaveTiffStackTFF(tiffDraw = np.zeros([3,4,6]), dirName = "img", filePrefix = "!stack", outtype = "uint8"):
    """ Print files for any input arrray of intensity values
      tiffDraw - numpy ndarray of intensity values"""
    print("trying to save file", outtype)
    outTiff = np.rint(tiffDraw).astype(outtype)
    print("outTiff type: ",tiffDraw.dtype)
#    tff.imwrite(dirName+"\\"+filePrefix+".tiff", outTiff)
    tff.imwrite(dirName+"\\"+filePrefix+".tiff", tiffDraw, dtype=tiffDraw.dtype)
    print("file saved in one tiff",dirName+"\\"+filePrefix+".tiff")
