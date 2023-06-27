from tkinter import *

from app_gui import *
from cnn_deconvolution_gui import *
from cnn_learning import *
from psf_extractor_gui import PSFExtractorGUI

"""
TODO:
- Close all TODO in cnn_deconvloution_gui.py
- Close all TODO in psf_extractor_gui.py

- Maybe make some img label on start window?
"""


class MainWindowGUI(Tk):
    def __init__(self, master=None, wwidth=800, wheight=2000):
        super().__init__()
        self.imgBeadRawLoad = FALSE

        self.title("Simple experimental PSF extractor")
        self.resizable(False, False)
        Label(self, text="").grid(row=0, column=0)  # blanc insert
        Label(self, text="").grid(row=2, column=0)  # blanc insert
        Button(text="Launch bead extractor", command=self.LaunchBeadExtractor).grid(
            row=2, column=1
        )
        Label(self, text="").grid(row=2, column=2)  # blanc insert
        Button(text="Launch PSF extractor", command=self.LaunchPSFExtractor).grid(
            row=2, column=3
        )
        Label(self, text="").grid(row=2, column=4)  # blanc insert
        
        Label(self, text="").grid(row=3, column=0)  # blanc insert
        
        Label(self, text="").grid(row=4, column=0)  # blanc insert
        Button(
            text="Launch CNN learning", command=self.LaunchCNNLearning
        ).grid(row=4, column=1)
        Label(self, text="").grid(row=4, column=2)  # blanc insert
        Button(
            text="Launch CNN deconvolution", command=self.LaunchCNNDeconvolution
        ).grid(row=4, column=3)
    
        Label(self, text="").grid(row=5, column=1)  # blanc insert

        # add menu
        m = Menu(self)
        self.config(menu=m)

        # add buttons
        m.add_command(label="Authors", command=self.Authors)
        m.add_command(label="Exit", command=quit)
        return

    def Authors(self):
        tk = Toplevel()
        Label(tk, text="").grid(row=0, column=0)
        Label(tk, text="AUTHORS").grid(row=1, column=5)
        Label(tk, text="").grid(row=2, column=0)

        Label(tk, text="Chukanov V.").grid(row=3, column=1)
        Label(tk, text="").grid(row=3, column=2)
        Label(tk, text="Pchitskaya E.").grid(row=3, column=3)
        Label(tk, text="").grid(row=3, column=4)

        Label(tk, text="").grid(row=3, column=6)
        Label(tk, text="Gerasimenko A.").grid(row=3, column=7)
        Label(tk, text="").grid(row=3, column=8)
        Label(tk, text="Sachuk A.").grid(row=3, column=9)
        Label(tk, text="").grid(row=3, column=10)

        Label(tk, text="").grid(row=4, column=0)
        return

    def LaunchCNNDeconvolution(self):
        deconvolver = CNNDeconvGUI(self)

        def on_closing():
            if askokcancel("Quit", "Do you want to quit?"):
                deconvolver.destroy()

        deconvolver.protocol("WM_DELETE_WINDOW", on_closing)
        deconvolver.grab_set()
        return

    def LaunchCNNLearning(self):
        teacher = CNNLearningGUI(self)
        teacher.grab_set()
        return
    
    def LaunchPSFExtractor(self):
        extractor = PSFExtractorGUI(self)
        extractor.grab_set()
        return

    def LaunchBeadExtractor(self):
        return


if __name__ == "__main__":
    rootWin = MainWindowGUI()
    rootWin.mainloop()
