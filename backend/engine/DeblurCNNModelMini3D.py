import tensorflow as tf
from tensorflow import keras


# Class witch provides CNN training and giving answers
class DeblurCNNModelMini3D:
    def __init__(self):
        return

    def ModelBuilder(input_shape = (64, 64, 40, 1), learning_rate = 0.001):
        # Original source with tutorial: https://towardsdatascience.com/hitchhikers-guide-to-residual-networks-resnet-in-keras-385ec01ec8ff
        
        TOTAL_CHANNELS = 32

        # Define the input as a tensor with shape input_shape
        X_input = keras.layers.Input(input_shape, name="img")

        # Stage 0: lvl-up channels
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv0')(X_input)
        stageZeroOutput = keras.layers.LeakyReLU()(X)

        # Stage 1: first Residual layer with (3x3) kernels and (40, 64, 64, *) input_shape
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv1_1', padding='same')(stageZeroOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (9, 9, 9), name = 'conv1_2', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv1_3', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageZeroOutput])
        X = keras.layers.BatchNormalization()(X)
        StageOneLongcut = keras.layers.LeakyReLU()(X)
        stageOneOutput = keras.layers.MaxPooling3D((2, 2, 2))(StageOneLongcut)
        
        # Stage 2: second Residual layer with (3x3) kernels and (32, 32, 1) input_shape
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv2_1', padding='same')(stageOneOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (7, 7, 7), name = 'conv2_2', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv2_3', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageOneOutput])
        X = keras.layers.BatchNormalization()(X)
        StageTwoLongcut = keras.layers.LeakyReLU()(X)
        stageTwoOutput = keras.layers.MaxPooling3D((2, 2, 2))(StageTwoLongcut)

        # Stage 3: third Residual layer with (3x3) kernels and (16, 16, 1) input_shape
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv3_1', padding='same')(stageTwoOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (5, 5, 5), name = 'conv3_2', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv3_3', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageTwoOutput])
        X = keras.layers.BatchNormalization()(X)
        StageThreeLongcut = keras.layers.LeakyReLU()(X)
        stageThreeOutput = keras.layers.MaxPooling3D((2, 2, 2))(StageThreeLongcut)

        # Stage 4: fourth Residual layer with (5x5) kernels and (16, 16, 1) input_shape
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv4_1', padding='same')(stageThreeOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (3, 3, 3), name = 'conv4_2', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv4_3', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageThreeOutput])
        X = keras.layers.BatchNormalization()(X)
        stageFourOutput = keras.layers.LeakyReLU()(X)

        # Stage 5: upsampling info from 4th stage
        # Stage 5.1: prepare data from stage 1 and add two layers
        StageThreeLongcut = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv5_1', padding='same')(StageThreeLongcut)
        StageThreeLongcut = keras.layers.LeakyReLU()(StageThreeLongcut)

        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv5_2', padding='same')(stageFourOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.UpSampling3D((2, 2, 2))(X)
        X = keras.layers.LeakyReLU()(X)

        X = keras.layers.Add()([StageThreeLongcut, X])
        stageFiveInput = keras.layers.LeakyReLU()(X)
        # Stage 5.2: fourth Residual layer with (3x3) kernels and (20, 20, 1) input_shape
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv5_6', padding='same')(stageFiveInput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (5, 5, 5), name = 'conv5_7', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv5_8', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageFiveInput])
        X = keras.layers.BatchNormalization()(X)
        stageFiveOutput = keras.layers.LeakyReLU()(X)

        # Stage 6: upsampling info from 4th stage
        # Stage 6.1: prepare data from stage 1 and add two layers
        StageTwoLongcut = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv6_1', padding='same')(StageTwoLongcut)
        StageTwoLongcut = keras.layers.LeakyReLU()(StageTwoLongcut)

        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv6_2', padding='same')(stageFiveOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.UpSampling3D((2, 2, 2))(X)
        X = keras.layers.LeakyReLU()(X)

        X = keras.layers.Add()([StageTwoLongcut, X])
        stageSixInput = keras.layers.LeakyReLU()(X)
        # Stage 6.2: fourth Residual layer with (3x3) kernels and (20, 20, 1) input_shape
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv6_6', padding='same')(stageSixInput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (7, 7, 7), name = 'conv6_7', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv6_8', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageSixInput])
        X = keras.layers.BatchNormalization()(X)
        stageSixOutput = keras.layers.LeakyReLU()(X)

        # Stage 7: upsampling info from 2rd stage
        # Stage 7.1: prepare data from stage 2 and add two layers
        StageOneLongcut = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv7_1', padding='same')(StageOneLongcut)
        StageOneLongcut = keras.layers.LeakyReLU()(StageOneLongcut)

        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv7_2', padding='same')(stageSixOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.UpSampling3D((2, 2, 2))(X)
        X = keras.layers.LeakyReLU()(X)

        X = keras.layers.Add()([StageOneLongcut, X])
        stageSevenInput = keras.layers.LeakyReLU()(X)
        # Stage 7.2: fourth Residual layer with (3x3) kernels and (20, 20, 1) input_shape
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv7_6', padding='same')(stageSevenInput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (9, 9, 9), name = 'conv7_7', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(TOTAL_CHANNELS, (1, 1, 1), name = 'conv7_8', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageSevenInput])
        X = keras.layers.BatchNormalization()(X)
        stageSevenOutput = keras.layers.LeakyReLU()(X)

        # Stage 8: Stack outputs from 3, 4 stages
        # Stage 8.1: Prepair output from 3 stage [convert (*, 10, 10, 32) into (*, 20, 20, 32)]
        Z = keras.layers.UpSampling3D((4, 4, 4))(stageFourOutput)
        Z = keras.layers.LeakyReLU()(Z)
        X = keras.layers.UpSampling3D((2, 2, 2))(stageFiveOutput)
        X = keras.layers.LeakyReLU()(X)
        # Stage 8.2: Concatinate outputs from 3 and 4 stages [3rd (*, 20, 20, 32) and 4th (*, 20, 20, 32) -> (*, 20, 20, 64)]
        stageEightThreeStack = keras.layers.Concatenate(axis=-1)([X, Z, stageSixOutput])
        # Stage 8.3: fifth Residual layer with (3x3) kernels and (20, 20, 1) input_shape
        X = keras.layers.Conv3D(3*TOTAL_CHANNELS, (1, 1, 1), name = 'conv8_4', padding='same')(stageEightThreeStack)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(3*TOTAL_CHANNELS, (7, 7, 7), name = 'conv8_5', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(3*TOTAL_CHANNELS, (1, 1, 1), name = 'conv8_6', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageEightThreeStack])
        X = keras.layers.BatchNormalization()(X)
        stageEightOutput = keras.layers.LeakyReLU()(X)

        # Stage 9: Stack outputs from 6 and 5 stages
        # Stage 9.1: Prepair output from 6 stage [convert (*, 32, 32, 64) into (*, 64, 64, 64)]
        X = keras.layers.UpSampling3D((2, 2, 2))(stageEightOutput)
        X = keras.layers.LeakyReLU()(X)
        # Stage 9.2: Prepair output from 5 stage [convert (*, 64, 64, 32) into (*, 64, 64, 64)]
        Y = keras.layers.Conv3D(3*TOTAL_CHANNELS, (1, 1, 1), name = 'conv9_1', padding='same')(stageSevenOutput)
        Y = keras.layers.LeakyReLU()(Y)
        # Stage 9.3: Sum outputs from 6 and 5 stages
        X = keras.layers.Add()([X, Y])
        stageNineInput = keras.layers.LeakyReLU()(X)
        # Stage 9.4: sixth Residual layer with (5x5) kernels and (*, 64, 64, 64) input_shape
        X = keras.layers.Conv3D(3*TOTAL_CHANNELS, (1, 1, 1), name = 'conv9_5', padding='same')(stageNineInput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(3*TOTAL_CHANNELS, (9, 9, 9), name = 'conv9_6', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv3D(3*TOTAL_CHANNELS, (1, 1, 1), name = 'conv9_7', padding='same')(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageNineInput])
        X = keras.layers.BatchNormalization()(X)
        stageNineOutput = keras.layers.LeakyReLU()(X)

        # Stage 9: go down channels
        X = keras.layers.Conv3D(1, (1, 1, 1), name = 'conv10', padding='same')(stageNineOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X_input, X])
        X_output = keras.layers.Activation('relu')(X)

        # Create model
        model = keras.Model(inputs = X_input, outputs = X_output, name='DeblurCNNMini3D')
        model.compile(optimizer= keras.optimizers.Adam(learning_rate=learning_rate, beta_2 = 0.9),loss='mae')
    
        return model

