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

    print(f"Generated 5 realistic test images in {OUTPUT_DIR}")

if __name__ == "__main__":
    generate_samples()
