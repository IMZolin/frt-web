import tifffile

def convert_3d_tif_to_tiff_stack(input_file, output_prefix):
    try:
        # Read the 3D image from the input .tif file
        stack = tifffile.imread(input_file)

        # Save each slice of the stack as a separate .tiff file
        for i, slice in enumerate(stack):
            output_file = f"{output_prefix}_{i+1:03}.tif"
            tifffile.imwrite(output_file, slice)

        print("Conversion successful!")
        return len(stack)  # Return the length of the converted stack
    except Exception as e:
        print("Error during conversion:", e)
        return 0  # Return 0 if there is an error

# Usage example
input_file = "input.tif"
output_prefix = "output"
num_images = convert_3d_tif_to_tiff_stack(input_file, output_prefix)
if num_images > 1:
    console.log(num_images)  # Display the length of the converted images
