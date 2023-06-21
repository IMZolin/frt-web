import PIL
from tkinter import *


class LoadHelpWindow(Toplevel):
    def __init__(self, parent, help_img_path):
        super().__init__(parent)
        # load image
        instruction = PIL.Image.open(help_img_path)
        img = PIL.ImageTk.PhotoImage(instruction)
        self.instr = Label(self, image=img)
        self.instr.image = img
        self.instr.pack()
        return