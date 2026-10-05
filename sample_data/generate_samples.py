"""Generate high-resolution sample asphalt road images with realistic potholes
for Bengaluru civic demonstration and benchmark testing."""

import os
import math
import random
import numpy as np
from PIL import Image, ImageDraw

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_asphalt_texture(width=1024, height=768, base_color=(52, 54, 58)):
    arr = np.full((height, width, 3), base_color, dtype=np.uint8)
    noise = np.random.normal(0, 15, (height, width, 3)).astype(np.int16)
    textured = np.clip(arr + noise, 20, 110).astype(np.uint8)
    return Image.fromarray(textured)

def draw_lane_marking(draw, width, height, y_offset=480, dashed=True):
    for x in range(40, width, 160 if dashed else 20):
        length = 90 if dashed else 20
        draw.line([(x, y_offset), (x + length, y_offset)], fill=(220, 205, 140), width=10)

def draw_pothole(draw, img, center_x, center_y, rx, ry, has_water=False):
    num_points = 24
    points = []
    for i in range(num_points):
        angle = (2 * math.pi * i) / num_points
        radius_x = rx * (0.8 + 0.4 * random.random())
        radius_y = ry * (0.7 + 0.5 * random.random())
        px = center_x + radius_x * math.cos(angle)
        py = center_y + radius_y * math.sin(angle)
        points.append((px, py))
    
    lip_points = [(p[0] + random.randint(-4, 4), p[1] + random.randint(-4, 4)) for p in points]
    draw.polygon(lip_points, fill=(35, 34, 32), outline=(22, 21, 20))
    
    inner_points = [
        (center_x + (p[0] - center_x) * 0.72, center_y + (p[1] - center_y) * 0.72)
        for p in points
    ]
    core_color = (14, 13, 15) if not has_water else (18, 28, 38)
    draw.polygon(inner_points, fill=core_color)
    
    for _ in range(6):
        start_pt = random.choice(lip_points)
        cx, cy = start_pt
        crack_length = random.randint(25, 80)
        c_angle = math.atan2(cy - center_y, cx - center_x) + random.uniform(-0.3, 0.3)
        for step in range(crack_length // 10):
            nx = cx + 10 * math.cos(c_angle) + random.randint(-2, 2)
            ny = cy + 10 * math.sin(c_angle) + random.randint(-2, 2)
            draw.line([(cx, cy), (nx, ny)], fill=(24, 23, 22), width=random.choice([1, 2]))
            cx, ny = nx, ny

def generate_samples():
    random.seed(42)
    np.random.seed(42)

    # 1. Outer Ring Road (Severe 3-cluster)
    img1 = create_asphalt_texture(1024, 768, (48, 50, 54))
    draw1 = ImageDraw.Draw(img1)
    draw_lane_marking(draw1, 1024, 768, 620, dashed=True)
    draw_pothole(draw1, img1, 380, 420, 140, 95, has_water=True)
    draw_pothole(draw1, img1, 680, 490, 90, 65, has_water=False)
    draw_pothole(draw1, img1, 220, 510, 70, 50, has_water=False)
    img1.save(os.path.join(OUTPUT_DIR, "bellandur_outer_ring_road_severe.jpg"), quality=92)

    # 2. Indiranagar 100ft Road (Single large deep crater)
    img2 = create_asphalt_texture(1024, 768, (55, 56, 58))
    draw2 = ImageDraw.Draw(img2)
    draw_lane_marking(draw2, 1024, 768, 280, dashed=False)
    draw_pothole(draw2, img2, 512, 450, 160, 110, has_water=False)
    img2.save(os.path.join(OUTPUT_DIR, "indiranagar_100ft_road_cluster.jpg"), quality=92)

    # 3. Whitefield ITPL Main Road (Critical water-filled)
    img3 = create_asphalt_texture(1024, 768, (44, 46, 50))
    draw3 = ImageDraw.Draw(img3)
    draw_lane_marking(draw3, 1024, 768, 650, dashed=True)
    draw_pothole(draw3, img3, 440, 400, 180, 120, has_water=True)
    draw_pothole(draw3, img3, 760, 440, 110, 75, has_water=True)
    img3.save(os.path.join(OUTPUT_DIR, "whitefield_itpl_critical.jpg"), quality=92)

    # 4. Koramangala 80ft Road (Moderate depression)
    img4 = create_asphalt_texture(1024, 768, (60, 62, 65))
    draw4 = ImageDraw.Draw(img4)
    draw_pothole(draw4, img4, 520, 410, 110, 70, has_water=False)
    img4.save(os.path.join(OUTPUT_DIR, "koramangala_80ft_road_moderate.jpg"), quality=92)

    # 5. Indoor Hackathon Test Simulation
    img5 = create_asphalt_texture(1024, 768, (65, 66, 68))
    draw5 = ImageDraw.Draw(img5)
    draw5.rectangle([(50, 40), (450, 110)], fill=(20, 25, 35), outline=(0, 200, 255), width=2)
    draw5.text((65, 55), "CIVICPULSE HACKATHON TEST BED", fill=(0, 220, 255))
    draw5.text((65, 78), "Live CV Edge Detection & Contour Pipeline", fill=(180, 200, 220))
    draw_pothole(draw5, img5, 530, 460, 130, 85, has_water=False)
    draw_pothole(draw5, img5, 290, 520, 80, 55, has_water=False)
    img5.save(os.path.join(OUTPUT_DIR, "indoor_hackathon_demo.jpg"), quality=92)

    print(f"Generated 5 realistic benchmark images in {OUTPUT_DIR}")

def generate_validation_set():
    random.seed(101)
    np.random.seed(101)
    val_dir = os.path.join(OUTPUT_DIR, "validation_set")
    os.makedirs(val_dir, exist_ok=True)

    # 1. Large Pothole (Wide, deep crater)
    img_large = create_asphalt_texture(1024, 768, (50, 52, 55))
    draw_large = ImageDraw.Draw(img_large)
    draw_lane_marking(draw_large, 1024, 768, 550, dashed=True)
    draw_pothole(draw_large, img_large, 512, 430, 210, 130, has_water=False)
    img_large.save(os.path.join(val_dir, "01_large_pothole.jpg"), quality=90)

    # 2. Small Pothole (Tight, localized depression)
    img_small = create_asphalt_texture(1024, 768, (52, 54, 57))
    draw_small = ImageDraw.Draw(img_small)
    draw_lane_marking(draw_small, 1024, 768, 550, dashed=True)
    draw_pothole(draw_small, img_small, 480, 410, 55, 40, has_water=False)
    img_small.save(os.path.join(val_dir, "02_small_pothole.jpg"), quality=90)

    # 3. Shallow Pothole (Low-contrast surface delamination)
    img_shallow = create_asphalt_texture(1024, 768, (54, 55, 58))
    draw_shallow = ImageDraw.Draw(img_shallow)
    draw_lane_marking(draw_shallow, 1024, 768, 550, dashed=True)
    # Draw shallow crater with lighter core color
    points = []
    num_pts = 20
    for i in range(num_pts):
        angle = (2 * math.pi * i) / num_pts
        r = 110 * (0.85 + 0.3 * random.random())
        points.append((500 + r * math.cos(angle), 420 + r * 0.65 * math.sin(angle)))
    draw_shallow.polygon(points, fill=(42, 43, 46), outline=(36, 37, 39))
    img_shallow.save(os.path.join(val_dir, "03_shallow_pothole.jpg"), quality=90)

    # 4. Dark Asphalt (Freshly surfaced dark bituminous mix)
    img_dark = create_asphalt_texture(1024, 768, (26, 27, 29))
    draw_dark = ImageDraw.Draw(img_dark)
    draw_lane_marking(draw_dark, 1024, 768, 550, dashed=True)
    draw_pothole(draw_dark, img_dark, 520, 440, 130, 85, has_water=False)
    img_dark.save(os.path.join(val_dir, "04_dark_asphalt.jpg"), quality=90)

    # 5. Bright Asphalt (Weathered, sun-bleached high-reflectance asphalt)
    img_bright = create_asphalt_texture(1024, 768, (115, 118, 122))
    draw_bright = ImageDraw.Draw(img_bright)
    draw_lane_marking(draw_bright, 1024, 768, 550, dashed=True)
    draw_pothole(draw_bright, img_bright, 500, 420, 135, 90, has_water=False)
    img_bright.save(os.path.join(val_dir, "05_bright_asphalt.jpg"), quality=90)

    # 6. Wet Road (Rain-slicked surface with pooled water reflection)
    img_wet = create_asphalt_texture(1024, 768, (38, 42, 48))
    draw_wet = ImageDraw.Draw(img_wet)
    draw_lane_marking(draw_wet, 1024, 768, 550, dashed=True)
    # Add glossy specular glare bands
    for y in range(300, 600, 30):
        draw_wet.line([(80, y), (940, y + 20)], fill=(55, 62, 70), width=8)
    draw_pothole(draw_wet, img_wet, 490, 430, 150, 95, has_water=True)
    img_wet.save(os.path.join(val_dir, "06_wet_road.jpg"), quality=90)

    # 7. Multiple Potholes (4 distinct craters scattered across lane)
    img_multi = create_asphalt_texture(1024, 768, (50, 52, 54))
    draw_multi = ImageDraw.Draw(img_multi)
    draw_lane_marking(draw_multi, 1024, 768, 550, dashed=True)
    draw_pothole(draw_multi, img_multi, 280, 380, 85, 60, has_water=False)
    draw_pothole(draw_multi, img_multi, 520, 460, 110, 75, has_water=True)
    draw_pothole(draw_multi, img_multi, 750, 400, 90, 65, has_water=False)
    draw_pothole(draw_multi, img_multi, 840, 540, 70, 50, has_water=False)
    img_multi.save(os.path.join(val_dir, "07_multiple_potholes.jpg"), quality=90)

    # 8. Shadow-Heavy Image (Strong tree/building diagonal shadow cast across road)
    img_shadow = create_asphalt_texture(1024, 768, (52, 54, 56))
    draw_shadow = ImageDraw.Draw(img_shadow)
    draw_lane_marking(draw_shadow, 1024, 768, 550, dashed=True)
    draw_pothole(draw_shadow, img_shadow, 360, 440, 120, 80, has_water=False)
    # Cast a massive diagonal shadow across the right half of the road
    shadow_polygon = [(420, 0), (1024, 0), (1024, 768), (620, 768)]
    # Darken pixels in the shadow region
    shadow_mask = Image.new("L", (1024, 768), 0)
    ImageDraw.Draw(shadow_mask).polygon(shadow_polygon, fill=160)
    shadow_layer = Image.new("RGB", (1024, 768), (10, 12, 16))
    img_shadow.paste(shadow_layer, (0, 0), mask=shadow_mask)
    img_shadow.save(os.path.join(val_dir, "08_shadow_heavy_image.jpg"), quality=90)

    # 9. Low-Quality Smartphone Image (Lower resolution, high noise, compression)
    img_lq = create_asphalt_texture(640, 480, (50, 52, 55))
    draw_lq = ImageDraw.Draw(img_lq)
    draw_lane_marking(draw_lq, 640, 480, 360, dashed=True)
    draw_pothole(draw_lq, img_lq, 320, 270, 90, 60, has_water=False)
    # Apply compression noise
    img_lq.save(os.path.join(val_dir, "09_low_quality_smartphone_image.jpg"), quality=35)

    # 10. Non-Pothole Road Image (Pristine asphalt, zero defects)
    img_clean = create_asphalt_texture(1024, 768, (52, 54, 58))
    draw_clean = ImageDraw.Draw(img_clean)
    draw_lane_marking(draw_clean, 1024, 768, 520, dashed=True)
    draw_lane_marking(draw_clean, 1024, 768, 260, dashed=False)
    img_clean.save(os.path.join(val_dir, "10_non_pothole_road_image.jpg"), quality=92)

    print(f"Generated 10 varied validation test images in {val_dir}")

if __name__ == "__main__":
    generate_samples()
    generate_validation_set()
