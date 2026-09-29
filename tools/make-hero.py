"""Gera as imagens do hero a partir de tools/hero-original.webp.

Uso: python3 tools/make-hero.py   (precisa de Pillow com AVIF: pip install pillow)

- Usa só a metade direita da arte (celular, pedras e brilho vermelho); a
  esquerda tinha texto e cabeçalho embutidos na imagem.
- Melhora: nitidez, contraste, pretos mais fundos e vermelho mais vivo.
- Continua o cenário: preenche o resto da tela com preto e o brilho
  vermelho do chão, com a emenda em degradê.
- Saídas em AVIF e WebP: desktop 16:9 (1920 e 1280) e celular em pé (900x1600).
"""
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageChops
import os

HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, '..', 'assets', 'img')
BG = (5, 5, 5)

src = Image.open(os.path.join(HERE, 'hero-original.webp')).convert('RGB')
art = src.crop((752, 90, 1536, 1024))  # 784 x 934

def enhance(im):
    im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2))
    im = ImageEnhance.Contrast(im).enhance(1.08)
    # pretos mais fundos: curva leve nas sombras
    im = im.point(lambda v: 0 if v < 10 else int(((v - 10) / 245) ** 1.08 * 255))
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * 1.06)))
    return Image.merge('RGB', (r, g, b))

art = enhance(art)

def glow(size, center, radius, color, strength):
    """brilho radial suave (para continuar a luz vermelha do chão)"""
    w, h = size
    layer = Image.new('RGB', size, (0, 0, 0))
    mask = Image.new('L', size, 0)
    d = ImageDraw.Draw(mask)
    cx, cy = center
    steps = 60
    for i in range(steps, 0, -1):
        rr = radius * i / steps
        a = int(strength * (1 - i / steps) ** 2 * 255)
        d.ellipse((cx - rr, cy - rr * 0.45, cx + rr, cy + rr * 0.45), fill=a)
    mask = mask.filter(ImageFilter.GaussianBlur(radius / 6))
    layer.paste(Image.new('RGB', size, color), (0, 0), mask)
    return layer

def compose(W, H, art_h, art_right, art_bottom, fade_px):
    canvas = Image.new('RGB', (W, H), BG)
    # continuação do chão vermelho para a esquerda
    canvas = ImageChops.add(canvas, glow((W, H), (int(W * 0.62), int(H * 0.93)), int(W * 0.6), (170, 10, 5), 0.7))
    canvas = ImageChops.add(canvas, glow((W, H), (int(W * 0.30), int(H * 0.98)), int(W * 0.35), (90, 4, 2), 0.35))
    scale = art_h / art.height
    a = art.resize((int(art.width * scale), art_h), Image.LANCZOS)
    x = W - art_right - a.width
    y = H - art_bottom - a.height
    # emenda: degradê nas bordas esquerda e de cima da arte
    m = Image.new('L', a.size, 255)
    d = ImageDraw.Draw(m)
    for i in range(fade_px):
        v = int(255 * (i / fade_px) ** 1.6)
        d.line([(i, 0), (i, a.height)], fill=v)
    top = int(fade_px * 0.6)
    mt = Image.new('L', a.size, 255)
    dt = ImageDraw.Draw(mt)
    for j in range(top):
        dt.line([(0, j), (a.width, j)], fill=int(255 * (j / top) ** 1.4))
    m = ImageChops.multiply(m, mt)
    canvas.paste(a, (x, y), m)
    return canvas

def save(im, name):
    im.save(os.path.join(OUT, name + '.avif'), quality=58, speed=4)
    im.save(os.path.join(OUT, name + '.webp'), quality=80, method=6)

desk = compose(1920, 1080, 1080, 0, 0, 150)
save(desk, 'hero-1920')
save(desk.resize((1280, 720), Image.LANCZOS), 'hero-1280')

mob = compose(900, 1600, 1100, -12, 0, 60)
# topo mais escuro no celular: o texto fica em cima
fade = Image.new('L', mob.size, 0)
d = ImageDraw.Draw(fade)
for j in range(760):
    d.line([(0, j), (mob.width, j)], fill=int(255 * (1 - j / 760) ** 1.3 * 0.85))
mob.paste(Image.new('RGB', mob.size, BG), (0, 0), fade)
save(mob, 'hero-mobile')
print('ok')
