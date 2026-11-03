import os
import subprocess

def run(cmd):
    subprocess.run(cmd, shell=True, check=True)

res_dir = 'android/app/src/main/res'
logo_src = 'public/branding/onroadpriz-logo.png'

os.makedirs('temp_icons', exist_ok=True)
master_icon = 'temp_icons/master_icon.png'
# Create a 512x512 square icon with deep crimson #77101F background and crisp centered logo
run(f'convert -size 512x512 xc:"#77101F" \\( {logo_src} -resize 440x440 \\) -gravity center -composite {master_icon}')

# Create foreground with safe padding for Android adaptive icons
master_foreground = 'temp_icons/master_foreground.png'
run(f'convert -size 432x432 xc:none \\( {logo_src} -resize 280x280 \\) -gravity center -composite {master_foreground}')

# 1. Launcher Icons (square & round)
densities = {
    'mipmap-mdpi': (48, 108),
    'mipmap-hdpi': (72, 162),
    'mipmap-xhdpi': (96, 216),
    'mipmap-xxhdpi': (144, 324),
    'mipmap-xxxhdpi': (192, 432)
}

for folder, (size, fg_size) in densities.items():
    out_dir = os.path.join(res_dir, folder)
    os.makedirs(out_dir, exist_ok=True)
    # Standard launcher icon
    run(f'convert {master_icon} -resize {size}x{size} {out_dir}/ic_launcher.png')
    # Round launcher icon
    run(f'convert {master_icon} -resize {size}x{size} \\( +clone -alpha extract -draw "circle {size//2},{size//2} {size//2},0" \\) -alpha off -compose CopyOpacity -composite {out_dir}/ic_launcher_round.png')
    # Adaptive foreground
    run(f'convert {master_foreground} -resize {fg_size}x{fg_size} {out_dir}/ic_launcher_foreground.png')

print("Launcher icons generated successfully.")

# 2. Splash Screens (Clean white background with centered OnRoadPriz logo)
splash_dims = {
    'drawable': (480, 800),
    'drawable-port-mdpi': (320, 480),
    'drawable-port-hdpi': (480, 800),
    'drawable-port-xhdpi': (720, 1280),
    'drawable-port-xxhdpi': (960, 1600),
    'drawable-port-xxxhdpi': (1280, 1920),
    'drawable-land-mdpi': (480, 320),
    'drawable-land-hdpi': (800, 480),
    'drawable-land-xhdpi': (1280, 720),
    'drawable-land-xxhdpi': (1600, 960),
    'drawable-land-xxxhdpi': (1920, 1280),
}

for folder, (w, h) in splash_dims.items():
    out_dir = os.path.join(res_dir, folder)
    os.makedirs(out_dir, exist_ok=True)
    logo_w = min(int(w * 0.72), 650)
    run(f'convert -size {w}x{h} xc:white \\( {logo_src} -resize {logo_w}x \\) -gravity center -composite {out_dir}/splash.png')

print("Splash screens generated successfully.")
