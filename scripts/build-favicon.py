from pathlib import Path
import base64
import io

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO = Image.open(ROOT / "public" / "brand" / "pathed-logo.png").convert("RGBA")
PUBLIC = ROOT / "public"
APP = ROOT / "src" / "app"


def pad_square(src: Image.Image, size: int, bg=(255, 255, 255, 255), inset=0.12):
    canvas = Image.new("RGBA", (size, size), bg)
    inner = max(1, int(size * (1 - inset * 2)))
    mark = src.resize((inner, inner), Image.Resampling.LANCZOS)
    off = (size - inner) // 2
    canvas.paste(mark, (off, off), mark)
    return canvas


def save_ico(path: Path):
    frames = [
        pad_square(LOGO, 16, inset=0.08),
        pad_square(LOGO, 32, inset=0.1),
        pad_square(LOGO, 48, inset=0.1),
    ]
    frames[0].save(
        path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=frames[1:],
    )


save_ico(PUBLIC / "favicon.ico")
pad_square(LOGO, 32, inset=0.1).save(PUBLIC / "favicon.png", "PNG", optimize=True)
pad_square(LOGO, 512, inset=0.12).save(APP / "icon.png", "PNG", optimize=True)
apple = pad_square(LOGO, 180, inset=0.14)
apple.save(PUBLIC / "apple-icon.png", "PNG", optimize=True)
apple.save(APP / "apple-icon.png", "PNG", optimize=True)

tiny = pad_square(LOGO, 64, bg=(255, 255, 255, 0), inset=0.02)
buf = io.BytesIO()
tiny.save(buf, "PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode("ascii")
(PUBLIC / "favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n'
    f'  <image href="data:image/png;base64,{b64}" width="64" height="64"/>\n'
    "</svg>\n",
    encoding="utf-8",
)

print("wrote favicon.ico/png/svg and app icons")
