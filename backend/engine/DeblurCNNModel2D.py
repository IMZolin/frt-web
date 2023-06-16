import tensorflow as tf
from tensorflow import keras


# Class witch provides CNN training and giving answers
class DeblurCNNModel2D:
    def __init__(self):
        return

    def ModelBuilder(input_shape=(40, 40, 1), learning_rate=0.001):
        # Original source with tutorial: https://towardsdatascience.com/hitchhikers-guide-to-residual-networks-resnet-in-keras-385ec01ec8ff

        # Define the input as a tensor with shape input_shape
        X_input = keras.layers.Input(input_shape, name="img")

        # Stage 0: lvl-up channels
        X = keras.layers.Conv2D(32, (1, 1), name="conv0")(X_input)
        stageZeroOutput = keras.layers.LeakyReLU()(X)

        # Stage 1: first Residual layer with (3x3) kernels and (64, 64, 1) input_shape
        X = keras.layers.Conv2D(32, (9, 9), name="conv1_1", padding="same")(stageZeroOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (9, 9), name="conv1_2", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (9, 9), name="conv1_3", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageZeroOutput])
        X = keras.layers.BatchNormalization()(X)
        StageOneMid = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv1_4", padding="same")(StageOneMid)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv1_5", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv1_6", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, StageOneMid])
        X = keras.layers.BatchNormalization()(X)
        StageOneLongcut = keras.layers.LeakyReLU()(X)
        stageOneOutput = keras.layers.MaxPooling2D((2, 2))(StageOneLongcut)

        # Stage 2: second Residual layer with (3x3) kernels and (32, 32, 1) input_shape
        X = keras.layers.Conv2D(32, (7, 7), name="conv2_1", padding="same")(stageOneOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv2_2", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv2_3", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageOneOutput])
        X = keras.layers.BatchNormalization()(X)
        StageTwoMid = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv2_4", padding="same")(StageTwoMid)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv2_5", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv2_6", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, StageTwoMid])
        X = keras.layers.BatchNormalization()(X)
        StageTwoLongcut = keras.layers.LeakyReLU()(X)
        stageTwoOutput = keras.layers.MaxPooling2D((2, 2))(StageTwoLongcut)

        # Stage 3: third Residual layer with (3x3) kernels and (16, 16, 1) input_shape
        X = keras.layers.Conv2D(32, (5, 5), name="conv3_1", padding="same")(stageTwoOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv3_2", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv3_3", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageTwoOutput])
        X = keras.layers.BatchNormalization()(X)
        stageThreeOutput = keras.layers.LeakyReLU()(X)

        # Stage 4: upsampling info from 4th stage
        # Stage 4.1: prepare data from stage 1 and add two layers
        StageTwoLongcut = keras.layers.Conv2D(32, (1, 1), name="conv4_1", padding="same")(
            StageTwoLongcut
        )
        StageTwoLongcut = keras.layers.LeakyReLU()(StageTwoLongcut)

        X = keras.layers.Conv2D(32, (1, 1), name="conv4_2", padding="same")(stageThreeOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.UpSampling2D((2, 2))(X)
        X = keras.layers.LeakyReLU()(X)

        X = keras.layers.Add()([StageTwoLongcut, X])
        stageFourInput = keras.layers.LeakyReLU()(X)
        # Stage 4.2: fourth Residual layer with (3x3) kernels and (20, 20, 1) input_shape
        X = keras.layers.Conv2D(32, (5, 5), name="conv4_3", padding="same")(stageFourInput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv4_4", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv4_5", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageFourInput])
        X = keras.layers.BatchNormalization()(X)
        stageFourMid = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv4_6", padding="same")(stageFourMid)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv4_7", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv4_8", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageFourMid])
        X = keras.layers.BatchNormalization()(X)
        stageFourOutput = keras.layers.LeakyReLU()(X)

        # Stage 5: upsampling info from 2rd stage
        # Stage 5.1: prepare data from stage 2 and add two layers
        StageOneLongcut = keras.layers.Conv2D(32, (1, 1), name="conv5_1", padding="same")(
            StageOneLongcut
        )
        StageOneLongcut = keras.layers.LeakyReLU()(StageOneLongcut)

        X = keras.layers.Conv2D(32, (1, 1), name="conv5_2", padding="same")(stageFourOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.UpSampling2D((2, 2))(X)
        X = keras.layers.LeakyReLU()(X)

        X = keras.layers.Add()([StageOneLongcut, X])
        stageFiveInput = keras.layers.LeakyReLU()(X)
        # Stage 5.2: fourth Residual layer with (3x3) kernels and (20, 20, 1) input_shape
        X = keras.layers.Conv2D(32, (5, 5), name="conv5_3", padding="same")(stageFiveInput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv5_4", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (5, 5), name="conv5_5", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageFiveInput])
        X = keras.layers.BatchNormalization()(X)
        stageFiveMid = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv5_6", padding="same")(stageFiveMid)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv5_7", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(32, (7, 7), name="conv5_8", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageFiveMid])
        X = keras.layers.BatchNormalization()(X)
        stageFiveOutput = keras.layers.LeakyReLU()(X)

        # Stage 6: Stack outputs from 3, 4 stages
        # Stage 6.1: Prepair output from 3 stage [convert (*, 10, 10, 32) into (*, 20, 20, 32)]
        X = keras.layers.UpSampling2D((2, 2))(stageThreeOutput)
        X = keras.layers.LeakyReLU()(X)
        # Stage 6.2: Concatinate outputs from 3 and 4 stages [3rd (*, 20, 20, 32) and 4th (*, 20, 20, 32) -> (*, 20, 20, 64)]
        stageSixTwoStack = keras.layers.Concatenate(axis=-1)([X, stageFourOutput])
        # Stage 6.3: fifth Residual layer with (3x3) kernels and (20, 20, 1) input_shape
        X = keras.layers.Conv2D(64, (5, 5), name="conv6_1", padding="same")(stageSixTwoStack)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (5, 5), name="conv6_2", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (5, 5), name="conv6_3", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageSixTwoStack])
        X = keras.layers.BatchNormalization()(X)
        stageSixMid = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (7, 7), name="conv6_4", padding="same")(stageSixMid)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (7, 7), name="conv6_5", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (7, 7), name="conv6_6", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageSixMid])
        X = keras.layers.BatchNormalization()(X)
        stageSixOutput = keras.layers.LeakyReLU()(X)

        # Stage 7: Stack outputs from 6 and 5 stages
        # Stage 7.1: Prepair output from 6 stage [convert (*, 32, 32, 64) into (*, 64, 64, 64)]
        X = keras.layers.UpSampling2D((2, 2))(stageSixOutput)
        X = keras.layers.LeakyReLU()(X)
        # Stage 7.2: Prepair output from 5 stage [convert (*, 64, 64, 32) into (*, 64, 64, 64)]
        Y = keras.layers.Conv2D(64, (1, 1), name="conv7_1", padding="same")(stageFiveOutput)
        Y = keras.layers.LeakyReLU()(Y)
        # Stage 7.3: Sum outputs from 6 and 5 stages
        X = keras.layers.Add()([X, Y])
        stageSevenInput = keras.layers.LeakyReLU()(X)
        # Stage 7.4: sixth Residual layer with (5x5) kernels and (*, 64, 64, 64) input_shape
        X = keras.layers.Conv2D(64, (7, 7), name="conv7_2", padding="same")(stageSevenInput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (7, 7), name="conv7_3", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (7, 7), name="conv7_4", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageSevenInput])
        X = keras.layers.BatchNormalization()(X)
        stageSevenMid = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (9, 9), name="conv7_5", padding="same")(stageSevenMid)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (9, 9), name="conv7_6", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Conv2D(64, (9, 9), name="conv7_7", padding="same")(X)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X, stageSevenMid])
        X = keras.layers.BatchNormalization()(X)
        stageSevenOutput = keras.layers.LeakyReLU()(X)

        # Stage 8: go down channels
        X = keras.layers.Conv2D(1, (1, 1), name="conv8", padding="same")(stageSevenOutput)
        X = keras.layers.LeakyReLU()(X)
        X = keras.layers.Add()([X_input, X])
        X_output = keras.layers.Activation("relu")(X)

        # Create model
        model = keras.Model(inputs=X_input, outputs=X_output, name="Test2DDeblurReCNN")
        model.compile(
            optimizer = keras.optimizers.Adam(learning_rate=learning_rate, beta_2=0.9), loss="mae"
        )

        return model
