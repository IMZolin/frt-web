import numpy as np


# Class which store chunk information
class ImageChunk:
    def __init__(
        self,
        imgSource,
        rowStart,
        colStart,
        layers,
        chunkSize,
        offsetSize,
        rowOffsetBegin,
        rowOffsetEnd,
        colOffsetBegin,
        colOffsetEnd,
    ):
        self.chunkData = np.zeros(
            shape=[layers, chunkSize + 2 * offsetSize, chunkSize + 2 * offsetSize]
        )
        self.chunkData[
            :,
            offsetSize - rowOffsetBegin : offsetSize + chunkSize + rowOffsetEnd,
            offsetSize - colOffsetBegin : offsetSize + chunkSize + colOffsetEnd,
        ] = imgSource[
            :,
            rowStart - rowOffsetBegin : (rowStart + chunkSize + rowOffsetEnd),
            colStart - colOffsetBegin : (colStart + chunkSize + colOffsetEnd),
        ]

        self.rowStart = rowStart
        self.colStart = colStart

        self.layers = layers
        self.rows = chunkSize
        self.cols = chunkSize
        self.offset = offsetSize

        self.dataLayers = layers
        self.dataRows = chunkSize + 2 * offsetSize
        self.dataCols = chunkSize + 2 * offsetSize

        self.rowOffsetBegin = rowOffsetBegin
        self.rowOffsetEnd = rowOffsetEnd
        self.colOffsetBegin = colOffsetBegin
        self.colOffsetEnd = colOffsetEnd

        return

    def GetChunkWithoutOffset(self):
        chunkWithoutOffset = self.chunkData[
            :,
            self.offset : self.dataRows - self.offset,
            self.offset : self.dataCols - self.offset,
        ]
        return chunkWithoutOffset


# class which provides separating images into chunks and conclusion from chunks
class BigImageManager:
    # constructor
    def __init__(self, img, chunkSizeBorder=48, offsetSize=8):
        # original image data
        self._img = img
        self._imgLayers = img.shape[0]
        self._imgRows = img.shape[1]
        self._imgCols = img.shape[2]

        # inflated image data (we work with it)
        isNeedToInflate = False
        self._inflatedRows = self._imgRows
        if self._imgRows % chunkSizeBorder != 0:
            newRows = chunkSizeBorder - self._imgRows % chunkSizeBorder
            self._inflatedRows = self._inflatedRows + newRows
            isNeedToInflate = True

        self._inflatedCols = self._imgCols
        if self._imgCols % chunkSizeBorder != 0:
            newCols = chunkSizeBorder - self._imgCols % chunkSizeBorder
            self._inflatedCols = self._inflatedCols + newCols
            isNeedToInflate = True

        if not isNeedToInflate:
            self._inflatedImg = self._img
        else:
            self._inflatedImg = np.zeros(
                shape=[self._imgLayers, self._inflatedRows, self._inflatedCols]
            )
            self._inflatedImg[:, 0 : self._imgRows, 0 : self._imgCols] = self._img[
                :, :, :
            ]

        self._chunkSizeBorder = chunkSizeBorder
        self._offsetSize = offsetSize
        return

    # method which provides splitting image into chunks
    def SeparateInChunks(self):
        chunksList = []

        rowStart = 0
        colStart = 0

        # Trying to go all chunks in rows in outer 'while True' loop
        while True:
            # Trying to go all chunks in current row in inner 'while True' loop
            while True:
                # chunk sizes init
                chunkRowStart = rowStart
                chunkColStart = colStart
                chunkRows = min(
                    self._inflatedRows - chunkRowStart, self._chunkSizeBorder
                )
                chunkCols = min(
                    self._inflatedCols - chunkColStart, self._chunkSizeBorder
                )

                # offsets init
                chunkRowOffsetBegin = (
                    0 if chunkRowStart - self._offsetSize < 0 else self._offsetSize
                )
                chunkRowOffsetEnd = (
                    0
                    if chunkRowStart + chunkRows == self._inflatedRows
                    else self._offsetSize
                )
                chunkColOffsetBegin = (
                    0 if chunkColStart - self._offsetSize < 0 else self._offsetSize
                )
                chunkColOffsetEnd = (
                    0
                    if chunkColStart + chunkCols == self._inflatedCols
                    else self._offsetSize
                )

                # Generate new chunk
                newChunk = ImageChunk(
                    self._inflatedImg,
                    chunkRowStart,
                    chunkColStart,
                    self._imgLayers,
                    self._chunkSizeBorder,
                    self._offsetSize,
                    chunkRowOffsetBegin,
                    chunkRowOffsetEnd,
                    chunkColOffsetBegin,
                    chunkColOffsetEnd,
                )
                chunksList.append(newChunk)

                # If we need to stop process this row -> leave; else -> continue chunk separating
                if chunkColStart + chunkCols == self._inflatedCols:
                    break
                else:
                    colStart = colStart + self._chunkSizeBorder

            # If we need to stop process this image -> leave; else -> continue chunk separating
            if chunkRowStart + chunkRows == self._inflatedRows:
                break
            else:
                rowStart = rowStart + self._chunkSizeBorder
                colStart = 0

        return chunksList

    # Method which concatenate chunks into one big image
    def ConcatenateChunksIntoImage(self, chunksList):
        newImgInflate = np.zeros(
            shape=[self._imgLayers, self._inflatedRows, self._inflatedCols]
        )

        for chunk in chunksList:
            chunkWithoutOffset = chunk.GetChunkWithoutOffset()
            newImgInflate[
                :,
                chunk.rowStart : (chunk.rowStart + chunk.rows),
                chunk.colStart : (chunk.colStart + chunk.cols),
            ] = chunkWithoutOffset[:, :, :]

        newImg = newImgInflate[:, 0 : self._imgRows, 0 : self._imgCols]
        return newImg
