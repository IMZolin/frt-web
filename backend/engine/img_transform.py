import numpy as np


def LocateMaxIntensity( array ):
    """Locate point with maximum intensity in 3d array.
       In: array - np.array
       Out: coords - ndarray
    """
    maximum = np.amax(array)
    coords = np.unravel_index(np.argmax(array, axis=None), array.shape)
#    print("LocateMaxIntensity: amax: ", maximum)
    print("LocateMaxIntensity: coords:", coords)
    return coords

def ShiftArray(inArr,newCtr):
    nx,ny,nz = inArr.shape
    dx =  int(nx / 2 - newCtr[0])
    dy =  int(ny / 2 - newCtr[1])
    dz =  int(nz / 2 - newCtr[2])
    # shifting by [dx,dy,dz]
    print("newCenter:", newCtr)
    print("dx,dy,dz:",dx,dy,dz)
    arr = inArr
    tmparr = np.empty_like(arr)
    print("start  shift")
    if (dx > 0):
        tmparr[:dx,:,:] = 0
        tmparr[dx:,:,:] = arr[:-dx,:,:]
    elif(dx < 0):
        tmparr[dx:,:,:] = 0
        tmparr[:dx,:,:] = arr[-dx:,:,:]
    else:
        tmparr = arr
    arr = tmparr
    print("x shift")
    if (dy > 0):
        tmparr[:,:dy,:] = 0
        tmparr[:,dy:,:] = arr[:,:-dy,:]
    elif(dy < 0):
        tmparr[:,dy:,:,:] = 0
        tmparr[:,:dy,:] = arr[:,-dy:,:]
    else:
        tmparr = arr
    arr = tmparr
    print("y shift")
    if (dz > 0):
        tmparr[:,:,:dz] = 0
        tmparr[:,:,dz:] = arr[:,:,:-dz]
    elif(dz < 0):
        tmparr[:,:,dz:] = 0
        tmparr[:,:,:dz] = arr[:,:,-dz:]
    else:
        tmparr = arr
    print("z shift")

    arr = tmparr
    print("centering finished.")
    return arr
    
def CenterImageIntensity(imArray):
    newCenter = LocateMaxIntensity( imArray )
    print("intesity max coords:", newCenter)
    centerIntArr = ShiftArray(imArray,newCenter)
    return centerIntArr

def ShiftWithPadding(imArray):
    tmpArr = PaddingImg(imArray)
    nx,ny,nz = imArray.shape
    lx = int(nx / 2) 
    ly = int(ny / 2)
    lz = int(nz / 2)
    c = LocateMaxIntensity( tmpArr )
    newArr = tmpArr[c[0]-lx:c[0]+lx,c[1]-ly:c[1]+ly,c[2]-lz:c[2]+lz]
    print("centering finished.")
    return newArr



def PaddingImg(imArray):
    """Function for padding array. Return padded array"""
    nlayers,nrows,ncols = imArray.shape
# check even or odd on side and if odd then add on layer
    pad = np.zeros(3)
    imDim = np.array([nlayers,nrows,ncols])
    for i in range(3):
        if 0 != (imDim[i] % 2) :
            pad[i] = int(1)
    imArray = np.pad(imArray,((0,int(pad[0])),(0,int(pad[1])),(0,int(pad[2]))),'edge')    
    print("imArray.shape", imArray.shape)
# do padding with all shapes even
    nlayers,nrows,ncols = imArray.shape
    max_sz = np.amax(np.array([nlayers,nrows,ncols]))
    pad0 = int((max_sz - nlayers + max_sz) // 2)
    pad1 = int((max_sz - nrows + max_sz) // 2)
    pad2 = int((max_sz - ncols + max_sz) // 2)
    print("dimensions:", nlayers, nrows, ncols)
    print("padding:", pad0, pad1, pad2)
#    hm = hm / np.amax(hm)
    imPadded = np.pad(imArray,((pad0,pad0),(pad1,pad1),(pad2,pad2)),'edge')
    return imPadded

# def PaddingImgArb(imArray, padDim):
#     """Function for padding array. Return padded array"""
#     nlayers,nrows,ncols = imArray.shape
# # check even or odd on side and if odd then add on layer
#     for i in range(3):
#         pad[i] = int(1)
#     imArray = np.pad(imArray,((0,int(pad[0])),(0,int(pad[1])),(0,int(pad[2]))),'edge')    
#     print("imArray.shape", imArray.shape)
# # do padding with all shapes even
#     nlayers,nrows,ncols = imArray.shape
#     max_sz = np.amax(np.array([nlayers,nrows,ncols]))
#     pad0 = int((max_sz - nlayers + max_sz) // 2)
#     pad1 = int((max_sz - nrows + max_sz) // 2)
#     pad2 = int((max_sz - ncols + max_sz) // 2)
#     print("dimensions:", nlayers, nrows, ncols)
#     print("padding:", pad0, pad1, pad2)
# #    hm = hm / np.amax(hm)
#     imPadded = np.pad(imArray,((pad0,pad0),(pad1,pad1),(pad2,pad2)),'edge')
#     return imPadded