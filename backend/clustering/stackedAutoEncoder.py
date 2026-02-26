import tensorflow as tf
from tensorflow import keras
from keras import layers,models

# input_dim=dimension of the input data(e.g., 784 for 28x28 images)
# encoding_dim=list of dimensions for each encoding layer (e.g., [256, 128, 50])
def build_autoencoder(input_dim, encoding_dim=[256, 128, 50]):
    inp = layers.Input(shape=(input_dim,))

    # encoder
    x = inp
    for d in encoding_dim:
        x = layers.Dense(d, activation='relu')(x)
    bottleneck = x  # this is the encoded representation

    # decoder
    for d in reversed(encoding_dim[:-1]):
        x = layers.Dense(d, activation='relu')(x)
    out = layers.Dense(input_dim, activation='sigmoid')(x)

    autoencoder = models.Model(inp, out) # recontructed images
    encoder = models.Model(inp, bottleneck) # the most important feature of the image

    return autoencoder, encoder