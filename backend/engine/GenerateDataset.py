from engine.RealDataGenerator.MultiSpheresDataSetGenerator import MultiSpheresDataSetGenerator
from engine.RealDataGenerator.LongSpheresDataSetGenerator import LongSpheresDataSetGenerator
from engine.RealDataGenerator.LinesDataSetGenerator import LinesDataSetGenerator
from engine.RealDataGenerator.LongLinesDataSetGenerator import LongLinesDataSetGenerator
from engine.RealDataGenerator.SpheresDataSetGenerator import SpheresDataSetGenerator
from engine.RealDataGenerator.DataSet2DModifier import DataSet2DModifier

def generate_set_2d(blured, bead_size, voxel_x, voxel_y, voxel_z):
    # init data generators
    modifier = DataSet2DModifier()
    spheresMaker = SpheresDataSetGenerator(modifier)
    linesMaker = LinesDataSetGenerator()
    multiSpheresMaker = MultiSpheresDataSetGenerator()
    blured_list = list()
    clear_list = list()

    # create images with one circle
    print("Generate 1 circle")
    circles_dataset, LOWER_COEF = spheresMaker.GenerateCirclesModel(blured, 6, bead_size, voxel_x, voxel_y, voxel_z)
    bluredCircles, clearCircles = spheresMaker.TransformDataSetAtLists(circles_dataset)
    blured_list = blured_list + bluredCircles
    clear_list = clear_list + clearCircles

    # create images with two sheres
    print("Generate 2 spheres")
    spheres_1 = multiSpheresMaker.GenerateSpheresModel(blured, 2, 2, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredCircles_1, clearCircles_1 = multiSpheresMaker.TransformDataSetAtLists(spheres_1)
    blured_list = blured_list + bluredCircles_1
    clear_list = clear_list + clearCircles_1

    # create images with 1 line
    print("Generate one-lines")
    lines_dataset = linesMaker.GenerateLinesModel(blured, 3, 1, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredLines, clearLines = linesMaker.TransformDataSetAtLists(lines_dataset)
    blured_list = blured_list + bluredLines
    clear_list = clear_list + clearLines
    
    # create images with 1 line
    print("Generate one-lines (2-part)")
    lines_dataset = linesMaker.GenerateLinesModel(blured, 3, 1, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredLines, clearLines = linesMaker.TransformDataSetAtLists(lines_dataset)
    blured_list = blured_list + bluredLines
    clear_list = clear_list + clearLines

    # create images with 2 line
    print("Generate two-lines")
    lines_dataset_2 = linesMaker.GenerateLinesModel(blured, 2, 2, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredLines_2, clearLines_2 = linesMaker.TransformDataSetAtLists(lines_dataset_2)
    blured_list = blured_list + bluredLines_2
    clear_list = clear_list + clearLines_2

    return blured_list, clear_list

def generate_set_3d(blured, bead_size, voxel_x, voxel_y, voxel_z):
    # init data
    modifier = DataSet2DModifier()
    spheresMaker = SpheresDataSetGenerator(modifier)
    linesMaker = LinesDataSetGenerator()
    longLinesMaker = LongLinesDataSetGenerator()
    multiSpheresMaker = MultiSpheresDataSetGenerator()
    longSpheresMaker = LongSpheresDataSetGenerator()
    blured_list = list()
    clear_list = list()

    # create images with one circle
    print("Generate 1 circle")
    circles_dataset, LOWER_COEF = spheresMaker.GenerateCirclesModel(blured, 4, bead_size, voxel_x, voxel_y, voxel_z)
    bluredCircles, clearCircles = spheresMaker.TransformDataSetAtLists(circles_dataset)
    blured_list = blured_list + bluredCircles
    clear_list = clear_list + clearCircles

    # create images with two sheres
    print("Generate 2 spheres")
    spheres_1 = multiSpheresMaker.GenerateSpheresModel(blured, 2, 2, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredCircles_1, clearCircles_1 = multiSpheresMaker.TransformDataSetAtLists(spheres_1)
    blured_list = blured_list + bluredCircles_1
    clear_list = clear_list + clearCircles_1

    # create images with three spheres
    print("Generate long spheres")
    long_spheres = longSpheresMaker.GenerateSpheresModel(blured, 2, 1, bead_size, voxel_x, voxel_y, voxel_z, [1, 1], [1, 1], [3, 6], LOWER_COEF)
    bluredLongCircles, clearLongCircles = longSpheresMaker.TransformDataSetAtLists(long_spheres)
    blured_list = blured_list + bluredLongCircles
    clear_list = clear_list + clearLongCircles

    # create images with 1 line
    print("Generate one-lines")
    lines_dataset = linesMaker.GenerateLinesModel(blured, 2, 1, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredLines, clearLines = linesMaker.TransformDataSetAtLists(lines_dataset)
    blured_list = blured_list + bluredLines
    clear_list = clear_list + clearLines
    
    # create images with 1 line
    print("Generate one-lines (2-part)")
    lines_dataset = linesMaker.GenerateLinesModel(blured, 2, 1, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredLines, clearLines = linesMaker.TransformDataSetAtLists(lines_dataset)
    blured_list = blured_list + bluredLines
    clear_list = clear_list + clearLines

    # create images with 2 line
    print("Generate two-lines")
    lines_dataset_2 = linesMaker.GenerateLinesModel(blured, 2, 2, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredLines_2, clearLines_2 = linesMaker.TransformDataSetAtLists(lines_dataset_2)
    blured_list = blured_list + bluredLines_2
    clear_list = clear_list + clearLines_2

    # create images with 2 line
    print("Generate z-fat-lines")
    lines_dataset_2 = longLinesMaker.GenerateLinesModel(blured, 1, 1, 3, 3, 3, 1, 1, 1, bead_size, voxel_x, voxel_y, voxel_z, LOWER_COEF)
    bluredLines_2, clearLines_2 = longLinesMaker.TransformDataSetAtLists(lines_dataset_2)
    blured_list = blured_list + bluredLines_2
    clear_list = clear_list + clearLines_2

    return blured_list, clear_list
