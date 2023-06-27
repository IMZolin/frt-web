from scipy import signal
from scipy import misc
import numpy as np
import itertools
from scipy.special import jv
from tkinter.messagebox import showerror, showinfo



def PointFunction(pt, r0, r, maxIntensity):
    """Function of sphere of radius r with center in r0. 
    Function return maxIntensity if pt in sphere and 0 if out of sphere.
    pt and r0 are np.array vectors : np.array([x,y,z])"""
    if (pt-r0).dot(pt-r0) <= r * r :
        result = maxIntensity
    else:
        result = 0
    return result




def PointFunctionAiryNotZoomed(pt, r0, maxIntensity=255, zoomfactor = 2.6):
    """Function of sphere of radius r with center in r0. 
    Function return Airy disk intesity within first circle if pt in sphere and 0 if out of sphere.
    pt and r0 are np.array vectors : np.array([x,y,z])
    All  dimension in pixels are equal to x-dimension
    """
    beadVoxelSize = 0.044
    beadDiameter = 0.2
    pt = pt * beadVoxelSize
    r0 = r0 * beadVoxelSize
    r = beadDiameter * zoomfactor / 2.
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


def PointFunctionAiry(pt, r0, maxIntensity=255, zoomfactor = 2.6):
    """
    Zoom of bead circle  from microscope
    Radius = self.BeadDiameter / 2
    Center  r0 - np.array[0:2]. 
    Function return Airy disk intesity within first circle if pt in sphere and 0 if out of sphere.
    pt and r0 are np.array vectors : np.array([x,y,z])
    All  dimension in pixels are equal to x-dimension
    """
    beadVoxelSize = 0.044
    beadDiameter = 0.2

    l = abs(r0[0]-pt[0]) * beadVoxelSize
    r = beadDiameter / 2.
    if r**2 - l**2 > 0:
            R =np.sqrt(r**2 - l**2) * zoomfactor
            ptd = pt * beadVoxelSize
            r0d = r0 * beadVoxelSize

            distSq = (ptd[1]-r0d[1])**2 + (ptd[2]-r0d[2])**2
            dist = np.sqrt(distSq) 
            # if distSq <= R**2:
            #     x = dist / R * 4.0
            #     # NOTE: If 'x' is equal zero - result == nan!. To prevent it - make result equal 'maxIntensity'
            #     if abs(x) >= 0.00001:          # Zero-criterion
            #             result = (2. * jv(1, x) / x)**2 * maxIntensity
            #     else:
            #             result = maxIntensity
            # else:
            #     result = 0
            x = dist / R * 4.0
            # NOTE: If 'x' is equal zero - result == nan!. To prevent it - make result equal 'maxIntensity'
            if abs(x) >= 0.00001:          # Zero-criterion
                result = (2. * jv(1, x) / x)**2 * maxIntensity
            else:
                result = maxIntensity

    else:
            result = 0

    return result





def MakeIdealSphereArray(imgSize = 36, sphRadius = 5):
    """create ideal  sphere array corresponding to sphere_type"""
    imgMidCoord = int(imgSize/2)
    #imgSize = self.sideHalf *2
    imgCenter = np.array([imgMidCoord,imgMidCoord,imgMidCoord])
    tiffDraw = np.ndarray([imgSize,imgSize,imgSize])
    print("image size:", imgSize)
    print("sphere radius:", sphRadius)

    #tiffBit = self.tiffMenuBitDict[self.tiffSaveBitType.get()]
    
    # NOTE: get max intensity for different output bits types
    #lightIntensity = np.iinfo(tiffBit).max
    lightIntensity = 255
    
    for i,j,k in itertools.product(range(imgSize), repeat = 3):
        tiffDraw[i,j,k] = PointFunctionAiry(np.array([i,j,k]), imgCenter, lightIntensity)
    print("Sphere created")             
    return tiffDraw




# def MakeIdealSphereArray(imgSize = 36, sphRadius = 5):
#     """create ideall sphere array"""
#     imgMidCoord = 0.5 * (imgSize)
#     imgCenter = np.array([imgMidCoord,imgMidCoord,imgMidCoord])
#     tiffDraw = np.ndarray([imgSize,imgSize,imgSize])
#     lightIntensity = 1000
#     for i in range(imgSize):
#       for j in range(imgSize):
#         for k in range(imgSize):
#           tiffDraw[i,j,k] = PointFunction(np.array([i,j,k]), imgCenter, sphRadius, lightIntensity)
#     return tiffDraw

def LoadIdealSphereArray(imgSize = 36, sphRadius = 5):
    """create ideall sphere array"""
    imgMidCoord = 0.5 * (imgSize)
    imgCenter = np.array([imgMidCoord,imgMidCoord,imgMidCoord])
    tiffDraw = np.ndarray([imgSize,imgSize,imgSize])
    lightIntensity = 1000
    for i in range(imgSize):
      for j in range(imgSize):
        for k in range(imgSize):
          tiffDraw[i,j,k] = PointFunction(np.array([i,j,k]), imgCenter, sphRadius, lightIntensity)
    return tiffDraw



def MaxLikelhoodEstimationFFT_3D(pImg, idSphImg, iterLimit = 20,debug_flag = False):
    """Function for  convolution 
    """
    hm = pImg
    # if there is NAN in image array(seems from source image) replace it with zeros
    hm[np.isnan(hm)] = 0
    beadMaxInt = np.amax(pImg)
    print("starting convolution:", pImg.shape,idSphImg.shape,hm.shape)
    b_noize = (np.mean(hm[0,0,:])+np.mean(hm[0,:,0])+np.mean(hm[:,0,0]))/3
    
    if debug_flag:
        print("Debug output:")
        print( np.mean(hm[0,0,:]),np.mean(hm[0,:,0]),np.mean(hm[:,0,0]) )
        print(np.amax(hm[0,0,:]),np.amax(hm[0,:,0]),np.amax(hm[:,0,0]))
        print(hm[0,0,56],hm[0,56,0], hm[56,0,0])
#        input("debug end")
#    b_noize = 0.1
#    print("Background intensity:", b_noize)
#    print('max intensity value:', np.amax(hm))
    p = idSphImg
# preparing for start of iteration cycle
    f_old = hm
    Hm = np.fft.fftn(hm)
    P = np.fft.fftn(p)
# starting iteration cycle
    for k in range(0, iterLimit):
      print('\r',"iter:",k,end=' ')
       # first convolution
      e = signal.fftconvolve(f_old, p, mode='same')
      #e = np.real(e)
      e = e + b_noize
      r = hm / e
      # second convolution
      p1=np.flip(p)
      rnew = signal.fftconvolve(r, p1, mode='same')
      rnew = np.real(rnew)
#      rnew = rnew.clip(min=0)
      f_old = f_old * rnew

      f_old = f_old / np.amax(f_old) * beadMaxInt
# end of iteration cycle

    xdim = f_old.shape[1]
#    print("shape: ",xdim)
    xstart = xdim //4
    xend = xstart + xdim // 2
    hm = hm[xstart:xend,xstart:xend,xstart:xend]
    p = p[xstart:xend,xstart:xend,xstart:xend]
    f_old = f_old[xstart:xend,xstart:xend,xstart:xend]
    return f_old

def DeconvolutionRL(image, imgPSF, iterLimit = 20,debug_flag = False):
    """Function for  convolution 
    """
    
    hm = image
    # if there is NAN in image array(seems from source image) replace it with zeros
    hm[np.isnan(hm)] = 0.0
    #do image padding
    pad = imgPSF.shape
    hm = np.pad(hm,((pad[0],pad[0]),(pad[1],pad[1]),(pad[2],pad[2])),'edge')
    beadMaxInt = np.amax(image)

    p = imgPSF

    b_noize = (np.mean(hm[0,0,:])+np.mean(hm[0,:,0])+np.mean(hm[:,0,0]))/3
    
    if debug_flag:
        print("Debug output:")
        print("Background intensity:", b_noize, 'Max intensity:', np.amax(hm))
        print("Deconvoluiton input shape (image, padded, psf):", image.shape, hm.shape, imgPSF.shape)
    #    print( np.mean(hm[0,0,:]),np.mean(hm[0,:,0]),np.mean(hm[:,0,0]) )
    #    print(np.amax(hm[0,0,:]),np.amax(hm[0,:,0]),np.amax(hm[:,0,0]))
#        input("debug end")
#    b_noize = 0.1
# preparing for start of iteration cycle
    f_old = hm
#    Hm = np.fft.fftn(hm)
#    P = np.fft.fftn(p)
# starting iteration cycle
    for k in range(0, iterLimit):
        print('\r',"iter:",k,end=' ')
        # first convolution
        e = signal.fftconvolve(f_old, p, mode='same')
        #e = np.real(e)
        e = e + b_noize
        r = hm / e
        # second convolution
        p1=np.flip(p)
        rnew = signal.fftconvolve(r, p1, mode='same')
        rnew = np.real(rnew)
        #      rnew = rnew.clip(min=0)
        f_old = f_old * rnew
        f_old = f_old / np.amax(f_old) * beadMaxInt
# end of iteration cycle
    imSh = hm.shape
    pad = imgPSF.shape
    f_old = f_old[pad[0]:imSh[0]-pad[0],pad[1]:imSh[1]-pad[1],pad[2]:imSh[2]-pad[2]]
    if debug_flag:
        print("Debug output:")
        print("Deconvoluiton output shape :", f_old.shape)

    return f_old



def EM_MLE_3D(pImg, idSphImg, iterLimit = 20,debug_flag = True):
    """Function for  convolution 
    """
    hm = pImg
    beadMaxInt = np.amax(pImg)

    # if there is NAN in image array(seems from source image) replace it with zeros
    hm[np.isnan(hm)] = 0
    print("starting convolution:", pImg.shape,idSphImg.shape,hm.shape)
    b_noize = (np.mean(hm[0,0,:])+np.mean(hm[0,:,0])+np.mean(hm[:,0,0]))/3
    
    if debug_flag:
        print("Debug output:")
        print( np.mean(hm[0,0,:]),np.mean(hm[0,:,0]),np.mean(hm[:,0,0]) )
        print(np.amax(hm[0,0,:]),np.amax(hm[0,:,0]),np.amax(hm[:,0,0]))
        print(hm[0,0,56],hm[0,56,0], hm[56,0,0])
#    print("Background intensity:", b_noize)
#    print('max intensity value:', np.amax(hm))
    p = idSphImg
# preparing for start of iteration cycle
    f_old = hm
#    f_old = p
    Hm = np.fft.fftn(hm)
    P = np.fft.fftn(p)
    #P_hat = np.fft.fftn(np.flip(p)) # spatially inverted p
# starting iteration cycle
    for k in range(0, iterLimit):
      print('\r',"iter:",k,end=' ')
       # first convolution
      e = signal.fftconvolve(f_old, p, mode='same')
      #e = np.real(e)
      e = e + b_noize
      r = hm / e
      # second convolution
      p1=np.flip(p)
      rnew = signal.fftconvolve(r, p1, mode='same')
      rnew = np.real(rnew)
#      rnew = rnew.clip(min=0)
      f_old = f_old * rnew
# applying intensity regulatization according to Conchello(1996) 
#      constr = np.amax(f_old)/np.amax(hm)
#      f_old = (-1.0+np.sqrt(1.0 + 2.0*constr*f_old))/(constr)
#      print("result:",hm[36,36,36],f_old[36,36,36],r[36,36,36],p[36,36,36],e[36,36,36],rnew[36,36,36])

      f_old = f_old / np.amax(f_old) *beadMaxInt
#  maximum  entropy regularisation - seems to work bad
#      f_old = f_old * rnew - 0.00001*rnew *np.log(rnew)
# end of iteration cycle

    xdim = f_old.shape[1]
    print("shape: ",xdim)
    xstart = xdim //4
    xend = xstart + xdim // 2
    hm = hm[xstart:xend,xstart:xend,xstart:xend]
    p = p[xstart:xend,xstart:xend,xstart:xend]
    f_old = f_old[xstart:xend,xstart:xend,xstart:xend]
    print("End of MaxLikelhoodEstimation fft")
    return f_old


def Tikhonov_Miller_3D(pImg, idSphImg, alpha = 0.1,debug_flag = True):
    """Function for Tikhonov_Miller convolution
    A*x = b 
    pImp -> b
    idSphImg -> A  
    """
    hm = pImg
    # if there is NAN in image array(seems from source image) replace it with zeros
    hm[np.isnan(hm)] = 0
    beadMaxInt = np.amax(pImg)
    print("starting Tikhonov:", pImg.shape,idSphImg.shape,hm.shape)
    
    if debug_flag:
        print("Debug output:")
        print( np.mean(hm[0,0,:]),np.mean(hm[0,:,0]),np.mean(hm[:,0,0]) )
        print(np.amax(hm[0,0,:]),np.amax(hm[0,:,0]),np.amax(hm[:,0,0]))
        print(hm[0,0,56],hm[0,56,0], hm[56,0,0])
    G = alpha * np.identity
    #x = (At*A + Gt*G)^{-1} *At*b
    x = np.transpose(A)*A

    p = idSphImg
# preparing for start of iteration cycle
    f_old = hm
#    f_old = p
    Hm = np.fft.fftn(hm)
    P = np.fft.fftn(p)
    #P_hat = np.fft.fftn(np.flip(p)) # spatially inverted p
# starting iteration cycle
    for k in range(0, iterLimit):
      print('\r',"iter:",k,end=' ')
       # first convolution
      e = signal.fftconvolve(f_old, p, mode='same')
      #e = np.real(e)
      e = e + b_noize
      r = hm / e
      # second convolution
      p1=np.flip(p)
      rnew = signal.fftconvolve(r, p1, mode='same')
      rnew = np.real(rnew)
#      rnew = rnew.clip(min=0)
      f_old = f_old * rnew
# applying intensity regulatization according to Conchello(1996) 
#      constr = np.amax(f_old)/np.amax(hm)
#      f_old = (-1.0+np.sqrt(1.0 + 2.0*constr*f_old))/(constr)
#      print("result:",hm[36,36,36],f_old[36,36,36],r[36,36,36],p[36,36,36],e[36,36,36],rnew[36,36,36])

      f_old = f_old / np.amax(f_old) * beadMaxInt
#  maximum  entropy regularisation - seems to work bad
#      f_old = f_old * rnew - 0.00001*rnew *np.log(rnew)
# end of iteration cycle

    xdim = f_old.shape[1]
    print("shape: ",xdim)
    xstart = xdim //4
    xend = xstart + xdim // 2
    hm = hm[xstart:xend,xstart:xend,xstart:xend]
    p = p[xstart:xend,xstart:xend,xstart:xend]
    f_old = f_old[xstart:xend,xstart:xend,xstart:xend]
    print("End of TikhonovMillerEstimation fft")
    return f_old

