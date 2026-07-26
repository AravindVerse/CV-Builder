from PIL import Image
import os

# Make sure your high-quality PNG is named exactly this
png_filename = "logo.png"
ico_filename = "logo.ico"

if not os.path.exists(png_filename):
    print(f"Error: Could not find {png_filename} in the current folder.")
else:
    # Open the high-quality PNG
    img = Image.open(png_filename)

    # Force the image into a square (Windows icons must be 1:1 ratio)
    # If your logo isn't perfectly square, you might want to crop it first!
    img = img.resize((256, 256), Image.Resampling.LANCZOS)

    # Define all the exact pixel sizes Windows expects in an ICO file
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]

    # Save it as an ICO with all layers embedded
    img.save(ico_filename, format="ICO", sizes=icon_sizes)
    print(f"Success! Created a high-quality {ico_filename} with all resolutions.")