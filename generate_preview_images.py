import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

out_dir = r"d:\NASA\terrawatch\terrawatch\frontend\public\images"
os.makedirs(out_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. WATERWATCH PREVIEW: Radar Grayscale with Electric Blue Flood
# -------------------------------------------------------------
def generate_waterwatch():
    w, h = 640, 420
    np.random.seed(42)
    # Background radar backscatter (grayscale speckle with terrain texture)
    base = np.random.normal(120, 25, (h, w)).clip(40, 230).astype(np.uint8)
    # Add low-frequency terrain gradient
    x_coords, y_coords = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    terrain = np.sin(x_coords * 6) * np.cos(y_coords * 4) * 25
    base = np.clip(base + terrain, 30, 240).astype(np.uint8)
    
    # Create RGB image
    img = Image.fromarray(base).convert("RGB")
    draw = ImageDraw.Draw(img)
    
    # Generate river channels (dark meandering lines)
    river_mask = np.zeros((h, w), dtype=bool)
    flood_mask = np.zeros((h, w), dtype=float)
    
    # Main river
    nodes = [(40, 210), (120, 190), (180, 240), (280, 220), (380, 260), (480, 230), (560, 280), (630, 290)]
    # Secondary tributaries
    trib1 = [(150, 40), (170, 110), (220, 170), (280, 220)]
    trib2 = [(350, 400), (370, 340), (410, 300), (480, 230)]
    trib3 = [(20, 90), (80, 130), (130, 180)]
    
    for branch, r_width in [(nodes, 14), (trib1, 8), (trib2, 7), (trib3, 6)]:
        for i in range(len(branch) - 1):
            p1, p2 = branch[i], branch[i+1]
            draw.line([p1, p2], fill=(12, 18, 28), width=r_width)
            
    # Convert back to array to apply flood overlay
    arr = np.array(img)
    
    # Generate realistic flood inundation plumes around the rivers
    for branch in [nodes, trib1, trib2, trib3]:
        for px, py in branch:
            # Gaussian flood blob
            dist = np.sqrt((x_coords * w - px)**2 + (y_coords * h - py)**2)
            blob = np.exp(-(dist**2) / (2 * (65 + np.random.randint(-10, 20))**2))
            flood_mask = np.maximum(flood_mask, blob)
            
    # Add fractal noise to flood mask
    noise = np.random.uniform(0.7, 1.3, (h, w))
    flood_mask = np.clip(flood_mask * noise, 0, 1)
    
    # Apply flood mask: Electric blue color map (matches user's screenshot)
    flood_indices = flood_mask > 0.28
    # In flood zones: Electric blue (rgb 20-40, 120-180, 230-255)
    for y in range(h):
        for x in range(w):
            f_val = flood_mask[y, x]
            if f_val > 0.35:
                # Strong floodwater
                r = int(arr[y, x, 0] * 0.15 + 20 * f_val)
                g = int(arr[y, x, 1] * 0.35 + 130 * f_val)
                b = int(min(255, arr[y, x, 2] * 0.4 + 235 * f_val))
                arr[y, x] = [r, g, b]
            elif f_val > 0.22:
                # Saturated / partially flooded edge
                factor = (f_val - 0.22) / 0.13
                arr[y, x, 0] = int(arr[y, x, 0] * (1 - factor) + 30 * factor)
                arr[y, x, 1] = int(arr[y, x, 1] * (1 - factor) + 110 * factor)
                arr[y, x, 2] = int(arr[y, x, 2] * (1 - factor) + 210 * factor)

    result = Image.fromarray(arr)
    # Add subtle radar dark channel redraw for open deep water
    draw_res = ImageDraw.Draw(result)
    for branch, r_width in [(nodes, 10), (trib1, 6), (trib2, 5), (trib3, 5)]:
        for i in range(len(branch) - 1):
            p1, p2 = branch[i], branch[i+1]
            draw_res.line([p1, p2], fill=(10, 16, 26), width=r_width)
            
    result.save(os.path.join(out_dir, "waterwatch_preview.png"), quality=95)
    print("Saved waterwatch_preview.png")

# -------------------------------------------------------------
# 2. FORESTWATCH PREVIEW: Side-by-side January vs May Deforestation
# -------------------------------------------------------------
def generate_forestwatch():
    w, h = 640, 420
    half_w = w // 2
    
    np.random.seed(101)
    
    # Base forest pattern (lush deep green canopy)
    def create_forest_tile():
        tile = np.zeros((h, half_w, 3), dtype=np.uint8)
        # Forest green background: rgb(24, 76, 32)
        base_g = np.random.normal(70, 10, (h, half_w)).clip(45, 95)
        base_r = np.random.normal(30, 8, (h, half_w)).clip(15, 45)
        base_b = np.random.normal(32, 8, (h, half_w)).clip(18, 48)
        
        tile[:, :, 0] = base_r
        tile[:, :, 1] = base_g
        tile[:, :, 2] = base_b
        
        img_tile = Image.fromarray(tile)
        draw = ImageDraw.Draw(img_tile)
        
        # Surrounding agricultural / pasture plots (lighter lime green & tan)
        plots = [
            (0, 0, 80, h),
            (0, 0, half_w, 70),
            (half_w - 75, 0, half_w, h),
            (0, h - 85, half_w, h),
            (80, 70, 150, 160),
            (half_w - 140, 70, half_w - 75, 170),
        ]
        for x1, y1, x2, y2 in plots:
            p_color = (
                np.random.randint(90, 135),
                np.random.randint(140, 175),
                np.random.randint(65, 100)
            )
            draw.rectangle([x1, y1, x2, y2], fill=p_color)
            # Add grid texture
            draw.rectangle([x1, y1, x2, y2], outline=(150, 180, 110), width=1)
            
        # Logging access roads
        draw.line([(0, 68), (half_w, 68)], fill=(180, 170, 130), width=2)
        draw.line([(78, 0), (78, h)], fill=(180, 170, 130), width=2)
        draw.line([(half_w - 74, 0), (half_w - 74, h)], fill=(180, 170, 130), width=2)
        
        return img_tile

    # Panel 1: January 19, 2020 (Intact forest in center)
    panel_jan = create_forest_tile()
    draw_jan = ImageDraw.Draw(panel_jan)
    # Header label
    draw_jan.rectangle([0, 0, half_w, 28], fill=(245, 245, 245))
    draw_jan.text((12, 6), "January 19, 2020", fill=(60, 60, 60))
    
    # Panel 2: May 8, 2020 (Deforestation clearing patch inside central forest)
    panel_may = create_forest_tile()
    draw_may = ImageDraw.Draw(panel_may)
    draw_may.rectangle([0, 0, half_w, 28], fill=(245, 245, 245))
    draw_may.text((12, 6), "May 8, 2020", fill=(60, 60, 60))
    
    # Deforestation clearcut (square patch in the forest)
    cx1, cy1, cx2, cy2 = 110, 180, 215, 275
    draw_may.rectangle([cx1, cy1, cx2, cy2], fill=(138, 142, 95), outline=(175, 180, 120), width=2)
    # Add logged soil texture
    for _ in range(35):
        lx = np.random.randint(cx1 + 4, cx2 - 4)
        ly = np.random.randint(cy1 + 4, cy2 - 4)
        draw_may.line([(lx, ly), (lx + np.random.randint(5, 15), ly)], fill=(90, 85, 60), width=1)
        
    # Draw arrow and "Deforestation" label
    arrow_start = (cx1 - 40, (cy1 + cy2) // 2)
    arrow_end = (cx1 - 4, (cy1 + cy2) // 2)
    draw_may.line([arrow_start, arrow_end], fill=(255, 255, 255), width=2)
    draw_may.polygon([(arrow_end[0], arrow_end[1] - 4), (arrow_end[0] + 6, arrow_end[1]), (arrow_end[0], arrow_end[1] + 4)], fill=(255, 255, 255))
    draw_may.text((cx1 - 95, (cy1 + cy2) // 2 - 8), "Deforestation", fill=(255, 255, 255))
    
    # Combine panels side by side with divider
    combined = Image.new("RGB", (w, h))
    combined.paste(panel_jan, (0, 0))
    combined.paste(panel_may, (half_w, 0))
    
    draw_comb = ImageDraw.Draw(combined)
    draw_comb.line([(half_w, 0), (half_w, h)], fill=(40, 40, 40), width=3)
    
    combined.save(os.path.join(out_dir, "forestwatch_preview.png"), quality=95)
    print("Saved forestwatch_preview.png")

# -------------------------------------------------------------
# 3. AGROWATCH PREVIEW: Geometric Agricultural Crop Mosaic
# -------------------------------------------------------------
def generate_agrowatch():
    w, h = 640, 420
    np.random.seed(77)
    
    img = Image.new("RGB", (w, h), color=(140, 155, 110))
    draw = ImageDraw.Draw(img)
    
    # Palette of realistic agricultural field colors (crops, bare soil, pasture, wheat)
    palette = [
        (92, 148, 80),    # Vibrant green crops
        (130, 168, 88),   # Lime young crops
        (185, 172, 102),  # Golden ripe wheat
        (160, 142, 98),   # Harvested stubble
        (115, 102, 75),   # Dark tilled loam soil
        (75, 125, 70),    # Dense alfalfa
        (205, 192, 138),  # Dry fallow
        (145, 162, 120),  # Mixed pasture
        (85, 110, 65),    # Mature canopy
        (170, 135, 90),   # Dry clay loam
    ]
    
    # Create irregular grid of rectangular parcels
    xs = [0]
    while xs[-1] < w:
        xs.append(xs[-1] + np.random.randint(28, 65))
    xs[-1] = w
    
    ys = [0]
    while ys[-1] < h:
        ys.append(ys[-1] + np.random.randint(20, 50))
    ys[-1] = h
    
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            x1, x2 = xs[i], xs[i+1]
            y1, y2 = ys[j], ys[j+1]
            col = palette[np.random.randint(0, len(palette))]
            draw.rectangle([x1, y1, x2, y2], fill=col)
            
            # Add furrow lines
            if np.random.rand() > 0.4:
                step = np.random.randint(3, 7)
                if np.random.rand() > 0.5:
                    for ly in range(y1 + 2, y2 - 2, step):
                        furrow_col = tuple(max(0, c - 18) for c in col)
                        draw.line([(x1 + 1, ly), (x2 - 1, ly)], fill=furrow_col, width=1)
                else:
                    for lx in range(x1 + 2, x2 - 2, step):
                        furrow_col = tuple(max(0, c - 18) for c in col)
                        draw.line([(lx, y1 + 1), (lx, y2 - 1)], fill=furrow_col, width=1)
                        
            # Parcel boundary road/ditch
            draw.rectangle([x1, y1, x2, y2], outline=(100, 95, 75), width=1)
            
    # Add a few circular center-pivot irrigation circles
    for cx, cy, r in [(140, 110, 32), (380, 260, 40), (520, 90, 30)]:
        col = (80, 140, 75)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col, outline=(120, 110, 80), width=2)
        # Pivot arm
        draw.line([(cx, cy), (cx + r - 4, cy + 4)], fill=(210, 210, 200), width=2)
        
    img.save(os.path.join(out_dir, "agrowatch_preview.png"), quality=95)
    print("Saved agrowatch_preview.png")

# -------------------------------------------------------------
# 4. GEOMOTION PREVIEW: Coastal InSAR Displacement Heatmap
# -------------------------------------------------------------
def generate_geomotion():
    w, h = 640, 420
    np.random.seed(88)
    
    # 1. Base coastal satellite terrain
    base = np.zeros((h, w, 3), dtype=np.uint8)
    # Ocean on top / top-left
    for y in range(h):
        for x in range(w):
            coast_line = 130 + math.sin(x / 45.0) * 35 + math.cos(x / 90.0) * 20
            if y < coast_line:
                # Deep ocean blue/teal
                depth = (coast_line - y) / 130.0
                base[y, x] = [int(12 + depth * 10), int(45 + depth * 35), int(95 + depth * 55)]
            else:
                # Urban & topography coastal plain
                noise = np.random.randint(-15, 15)
                base[y, x] = [int(110 + noise), int(120 + noise), int(105 + noise)]
                
    img = Image.fromarray(base)
    draw = ImageDraw.Draw(img)
    
    # Add coastal roads and urban street grid
    for ly in range(160, h, 28):
        draw.line([(0, ly), (w, ly)], fill=(90, 95, 85), width=1)
    for lx in range(50, w, 35):
        draw.line([(lx, 140), (lx, h)], fill=(90, 95, 85), width=1)
        
    # Coastline surf foam
    for x in range(0, w, 2):
        cy = int(130 + math.sin(x / 45.0) * 35 + math.cos(x / 90.0) * 20)
        draw.point((x, cy), fill=(180, 215, 230))
        draw.point((x, cy + 1), fill=(140, 185, 205))
        
    # 2. InSAR Heatmap overlay
    # Stable: green/cyan. Subsidence hotspots: yellow, orange, deep red
    x_coords, y_coords = np.meshgrid(np.linspace(0, w, w), np.linspace(0, h, h))
    heat = np.zeros((h, w), dtype=float)
    
    # Major subsidence hotspot 1 (urban port basin)
    h1 = np.exp(-(((x_coords - 480)**2) / (2 * 45**2) + ((y_coords - 260)**2) / (2 * 35**2)))
    # Major hotspot 2 (inland aquifer overdraft)
    h2 = np.exp(-(((x_coords - 280)**2) / (2 * 65**2) + ((y_coords - 240)**2) / (2 * 50**2)))
    # Secondary hotspot 3
    h3 = np.exp(-(((x_coords - 160)**2) / (2 * 35**2) + ((y_coords - 280)**2) / (2 * 30**2)))
    
    heat = np.maximum.reduce([h1 * 1.0, h2 * 0.85, h3 * 0.7])
    
    arr = np.array(img)
    # Apply InSAR fringes over land
    for y in range(h):
        coast_line = 130 + math.sin(y / 45.0) * 35 + math.cos(y / 90.0) * 20
        if y < 110:
            continue
        for x in range(w):
            val = heat[y, x]
            if val > 0.08:
                # Color ramp: 0.1 (cyan/green) -> 0.4 (yellow) -> 0.7 (orange) -> 0.9+ (red)
                if val > 0.75:
                    # Deep crimson red
                    r, g, b = 220, 35, 35
                elif val > 0.5:
                    # Orange
                    r, g, b = 245, 130, 20
                elif val > 0.3:
                    # Bright yellow
                    r, g, b = 245, 215, 30
                else:
                    # Light yellow-green / cyan fringe
                    r, g, b = 150, 215, 80
                    
                alpha = min(0.85, val * 1.1)
                arr[y, x, 0] = int(arr[y, x, 0] * (1 - alpha) + r * alpha)
                arr[y, x, 1] = int(arr[y, x, 1] * (1 - alpha) + g * alpha)
                arr[y, x, 2] = int(arr[y, x, 2] * (1 - alpha) + b * alpha)
                
    res = Image.fromarray(arr)
    dres = ImageDraw.Draw(res)
    
    # Legend color bar in top right: "LOS Ground Displacement Rate (mm/yr)"
    dres.rectangle([w - 240, 14, w - 16, 48], fill=(12, 18, 28, 200), outline=(50, 60, 75))
    dres.text((w - 232, 18), "LOS Ground Displacement Rate", fill=(220, 220, 220))
    # Gradient bar
    bar_x1, bar_y1, bar_x2, bar_y2 = w - 232, 34, w - 26, 42
    bar_w = bar_x2 - bar_x1
    for bx in range(bar_w):
        frac = bx / bar_w
        if frac < 0.3:
            col = (int(30 + frac * 200), 210, 80)
        elif frac < 0.6:
            col = (245, int(210 - (frac - 0.3) * 300), 30)
        else:
            col = (int(220 + (frac - 0.6) * 70), int(100 - (frac - 0.6) * 150), 30)
        dres.line([(bar_x1 + bx, bar_y1), (bar_x1 + bx, bar_y2)], fill=col)
        
    res.save(os.path.join(out_dir, "geomotion_preview.png"), quality=95)
    print("Saved geomotion_preview.png")

# -------------------------------------------------------------
# 5. FEATURE 3: Before-and-After River Flood Comparison Scene
# -------------------------------------------------------------
def generate_comparison_scenes():
    w, h = 640, 420
    np.random.seed(99)
    
    # Base urban & river landscape (Porto Alegre river delta style)
    def create_base_landscape():
        base = np.zeros((h, w, 3), dtype=np.uint8)
        # Sandy urban terrain and city blocks
        for y in range(h):
            for x in range(w):
                base[y, x] = [135 + np.random.randint(-10, 10), 125 + np.random.randint(-10, 10), 105 + np.random.randint(-10, 10)]
        img = Image.fromarray(base)
        draw = ImageDraw.Draw(img)
        # Draw highway system
        draw.line([(0, 180), (w, 195)], fill=(75, 75, 75), width=6)
        draw.line([(0, 182), (w, 197)], fill=(220, 220, 220), width=1) # center line
        draw.line([(240, 0), (280, h)], fill=(70, 70, 70), width=5)
        # Arena / Stadium structure
        draw.ellipse([140, 230, 210, 290], fill=(210, 215, 220), outline=(60, 60, 60), width=3)
        draw.ellipse([155, 245, 195, 275], fill=(70, 150, 65)) # inner pitch
        # Commercial & residential warehouse polygons
        for bx, by, bw, bh in [(320, 80, 50, 40), (410, 70, 70, 45), (310, 230, 65, 55), (420, 220, 80, 60), (80, 80, 45, 35)]:
            draw.rectangle([bx, by, bx + bw, by + bh], fill=(185, 180, 175), outline=(50, 50, 50), width=1)
        return img

    # Before Flood Image (normal river channel confined to river banks)
    img_before = create_base_landscape()
    draw_before = ImageDraw.Draw(img_before)
    # Confined river
    river_pts = [(0, 110), (120, 130), (220, 120), (360, 150), (500, 130), (640, 140)]
    for i in range(len(river_pts) - 1):
        draw_before.line([river_pts[i], river_pts[i+1]], fill=(65, 80, 95), width=38)
    img_before.save(os.path.join(out_dir, "flood_comparison_before.png"), quality=95)
    
    # After Flood Image (river overflowing, submerged streets, stadiums, and neighborhoods)
    img_after = create_base_landscape()
    arr_after = np.array(img_after)
    # Turbid brown/muddy floodwaters covering vast area
    x_coords, y_coords = np.meshgrid(np.linspace(0, w, w), np.linspace(0, h, h))
    # Inundation mask
    flood_dist = np.abs(y_coords - 170)
    flood_mask = np.clip(1.0 - (flood_dist / 140.0), 0, 1)
    
    # Add localized flood pools around arena and highway
    pool1 = np.exp(-(((x_coords - 175)**2) + ((y_coords - 260)**2)) / (2 * 75**2))
    pool2 = np.exp(-(((x_coords - 450)**2) + ((y_coords - 250)**2)) / (2 * 90**2))
    flood_mask = np.maximum.reduce([flood_mask, pool1 * 0.9, pool2 * 0.95])
    
    for y in range(h):
        for x in range(w):
            f_val = flood_mask[y, x]
            if f_val > 0.25:
                # Muddy brown floodwater (rgb 120, 95, 65)
                alpha = min(0.92, (f_val - 0.2) * 1.4)
                arr_after[y, x, 0] = int(arr_after[y, x, 0] * (1 - alpha) + 115 * alpha)
                arr_after[y, x, 1] = int(arr_after[y, x, 1] * (1 - alpha) + 90 * alpha)
                arr_after[y, x, 2] = int(arr_after[y, x, 2] * (1 - alpha) + 65 * alpha)
                
    res_after = Image.fromarray(arr_after)
    draw_after = ImageDraw.Draw(res_after)
    # Redraw deep turbid main current
    for i in range(len(river_pts) - 1):
        draw_after.line([river_pts[i], river_pts[i+1]], fill=(85, 70, 50), width=58)
    res_after.save(os.path.join(out_dir, "flood_comparison_after.png"), quality=95)
    print("Saved flood_comparison_before.png and flood_comparison_after.png")

if __name__ == "__main__":
    generate_waterwatch()
    generate_forestwatch()
    generate_agrowatch()
    generate_geomotion()
    generate_comparison_scenes()
    print("All preview images generated successfully!")

