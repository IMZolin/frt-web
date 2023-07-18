import tifffile

def convert_3d_tif_to_tiff_stack(input_file, output_prefix):
    try:
        stack = tifffile.imread(input_file)

        output_files = []  

        for i, slice in enumerate(stack):
            output_file = f"{output_prefix}_{i+1:03}.tif"
            tifffile.imwrite(output_file, slice)
            output_files.append(output_file)  

        print("Conversion successful!")
        return output_files  
    except Exception as e:
        print("Error during conversion:", e)
        return []  

