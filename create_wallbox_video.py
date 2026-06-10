from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import textwrap, subprocess, os

OUT = Path('/root/wallbox/video_assets')
OUT.mkdir(exist_ok=True)
W,H = 1920,1080
BG = '#080F11'
PANEL = '#101618'
PANEL2 = '#151B1E'
BORDER = '#292F31'
TEXT = '#E7EAEB'
MUTED = '#9AA1A3'
DIM = '#4D5558'
ACCENT = '#00D497'
DANGER = '#FF6785'
WARN = '#FEBB55'

FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'

def font(size, bold=False, mono=False):
    return ImageFont.truetype(FONT_MONO if mono else (FONT_BOLD if bold else FONT_REG), size)

def fit_cover(img, box_w, box_h):
    iw, ih = img.size
    scale = max(box_w/iw, box_h/ih)
    nw, nh = int(iw*scale), int(ih*scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw-box_w)//2; top=(nh-box_h)//2
    return img.crop((left, top, left+box_w, top+box_h))

def crop_region(path, y_frac=0, h_frac=0.45):
    img = Image.open(path).convert('RGB')
    iw, ih = img.size
    y = int((ih - ih*h_frac) * y_frac)
    return img.crop((0, y, iw, min(ih, y + int(ih*h_frac))))

def round_rect(draw, xy, fill, outline=BORDER, width=2, radius=0):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def wrap(draw, text, max_w, f):
    lines=[]
    for para in text.split('\n'):
        if not para:
            lines.append('')
            continue
        words=para.split()
        line=''
        for w in words:
            test=(line+' '+w).strip()
            if draw.textbbox((0,0), test, font=f)[2] <= max_w:
                line=test
            else:
                if line: lines.append(line)
                line=w
        if line: lines.append(line)
    return lines

def add_text(draw, xy, text, f, fill=TEXT, max_w=None, line_gap=8):
    x,y=xy
    if max_w is None:
        draw.text((x,y), text, font=f, fill=fill)
        return y + draw.textbbox((x,y), text, font=f)[3]-draw.textbbox((x,y), text, font=f)[1]
    for line in wrap(draw, text, max_w, f):
        draw.text((x,y), line, font=f, fill=fill)
        y += f.size + line_gap
    return y

def base():
    im=Image.new('RGB',(W,H),BG)
    d=ImageDraw.Draw(im)
    # grid
    for x in range(0,W,80): d.line((x,0,x,H), fill=(18,31,34), width=1)
    for y in range(0,H,80): d.line((0,y,W,y), fill=(18,31,34), width=1)
    # subtle glow
    glow=Image.new('RGBA',(W,H),(0,0,0,0)); gd=ImageDraw.Draw(glow)
    gd.ellipse((1250,-260,2260,740), fill=(0,212,151,30))
    glow=glow.filter(ImageFilter.GaussianBlur(90))
    im=Image.alpha_composite(im.convert('RGBA'), glow).convert('RGB')
    d=ImageDraw.Draw(im)
    # header
    d.rectangle((0,0,W,74), fill='#0B1113', outline=BORDER)
    d.rectangle((54,24,76,46), fill=ACCENT)
    d.text((92,23),'WALLBOX', font=font(24, bold=True, mono=True), fill=TEXT)
    d.text((1540,26),'WALRUS TESTNET / SUI TESTNET', font=font(18, mono=True), fill=ACCENT)
    return im,d

def paste_panel(im, img, box, border=True):
    x,y,w,h=box
    shot=fit_cover(img,w,h)
    im.paste(shot,(x,y))
    if border:
        d=ImageDraw.Draw(im)
        d.rectangle((x,y,x+w,y+h), outline=BORDER, width=2)

home='/root/.hermes/cache/screenshots/browser_screenshot_f045401b1d7943aeafca81bea0170437.png'
run='/root/.hermes/cache/screenshots/browser_screenshot_22aa6d927ec141d1a3631fe02a993064.png'
status='/root/.hermes/cache/screenshots/browser_screenshot_5e62e4cf4d3f4bcc8ed56dcab3a948af.png'
verify='/root/.hermes/cache/screenshots/browser_screenshot_aaa25fbe62574e97b8d78862d80d6885.png'

slides=[]

def make_slide(idx, eyebrow, title, body, shot_path=None, y_frac=0, h_frac=0.45, bullets=None, right_custom=None, accent=ACCENT):
    im,d=base()
    d.text((80,132), eyebrow.upper(), font=font(20, mono=True), fill=accent)
    add_text(d,(80,174), title, font(66, bold=True), TEXT, max_w=760, line_gap=10)
    add_text(d,(82,390), body, font(28), MUTED, max_w=720, line_gap=10)
    if bullets:
        y=580
        for b in bullets:
            d.rectangle((84,y+7,98,y+21), fill=accent)
            add_text(d,(118,y), b, font(24, mono=True), TEXT, max_w=620, line_gap=6)
            y+=62
    if shot_path:
        img=crop_region(shot_path,y_frac,h_frac)
        paste_panel(im,img,(900,132,900,810))
    if right_custom:
        right_custom(im,d)
    d.text((80,1008), 'INTEGRITY VERIFIED, NOT TRUTH CERTIFIED', font=font(22, mono=True), fill=DIM)
    out=OUT/f'slide_{idx:02d}.png'
    im.save(out)
    slides.append(out)

make_slide(1,'Product hook','The black box for autonomous AI agents.','Wallbox records agent runs as tamper-evident evidence capsules, then makes them publicly verifiable.',home,0,0.28, bullets=['Record', 'Store', 'Certify', 'Verify'])
make_slide(2,'Problem','AI agents act. Logs can be rewritten.','Agents browse, trade, call tools, and write code. When something goes wrong, teams need proof of the prompt, tools, sources, outputs, and artifacts.',home,0.28,0.26, bullets=['Mutable logs', 'Scattered traces', 'Disputed outputs'])
make_slide(3,'Demo flow','Run the RiskLens trust review.','A deterministic demo agent reviews whether an AI trading agent should be trusted with user funds. Wallbox captures the run end-to-end.',run,0,0.95, bullets=['Task + agent identity', 'Tool trace', 'Sources + final report'])

def capsule_custom(im,d):
    x,y=930,180
    round_rect(d,(x,y,x+840,y+700),PANEL)
    d.text((x+40,y+40),'AUDIT CAPSULE', font=font(28,bold=True,mono=True), fill=ACCENT)
    files=['trace.jsonl','sources.json','verdict.json','artifacts/final_report.md']
    yy=y+120
    for f in files:
        d.rectangle((x+44,yy,x+796,yy+70), fill=PANEL2, outline=BORDER)
        d.text((x+70,yy+22),f, font=font(24,mono=True), fill=TEXT)
        d.text((x+675,yy+22),'HASHED', font=font(22,mono=True), fill=ACCENT)
        yy+=92
    d.line((x+80,yy+25,x+760,yy+25), fill=BORDER, width=2)
    d.text((x+70,yy+70),'capsule_hash', font=font(24,mono=True), fill=MUTED)
    d.text((x+70,yy+112),'0x312122a508d0e7a5...', font=font(26,mono=True), fill=ACCENT)
make_slide(4,'Evidence model','Every file is hashed. The capsule is reproducible.','Wallbox packages the trace, sources, verdict, and report into a canonical audit capsule with a SHA-256 hash.', right_custom=capsule_custom, bullets=['Canonical JSON', 'File-level hashes', 'Capsule hash'])
make_slide(5,'Live readiness','Walrus storage. Sui/Tatum certificate.','This deployment shows Walrus testnet live, key-protected capture API, and Sui/Tatum certificate anchoring configured.',status,0,1.0, bullets=['Walrus live', 'Sui/Tatum live', 'Private keys server-side'])
make_slide(6,'Public verifier','Anyone can verify the certificate.','Wallbox fetches the certificate, retrieves the evidence blob, recomputes the capsule hash, and checks it against the anchored hash.',verify,0,0.56, bullets=['On-chain hash', 'Recomputed hash', 'Evidence blob ID'])
make_slide(7,'Tamper proof','Change the evidence, break the proof.','If a local evidence clone is altered, the recomputed hash no longer matches the certificate. Verification fails.',verify,0.32,0.42, bullets=['Verified when hashes match', 'Tampered when hashes diverge', 'Integrity, not truth'])
make_slide(8,'Closing','Record. Store. Certify. Verify.','As agents move from chat into real workflows, Wallbox gives every run a chain of custody: evidence on Walrus, certificates on Sui through Tatum.',home,0.67,0.30, bullets=['AI trading agents', 'Research copilots', 'Coding agents', 'Compliance teams'])

# concat video from stills
concat = OUT/'concat.txt'
durations=[21,20,21,20,21,22,20,21]  # total 166 seconds
with open(concat,'w') as f:
    for p,dur in zip(slides,durations):
        f.write(f"file '{p}'\n")
        f.write(f'duration {dur}\n')
    f.write(f"file '{slides[-1]}'\n")

subprocess.run(['ffmpeg','-y','-f','concat','-safe','0','-i',str(concat),'-vf','fps=30','-pix_fmt','yuv420p','/root/wallbox/wallbox_video_silent.mp4'], check=True)
subprocess.run(['ffmpeg','-y','-i','/root/wallbox/wallbox_video_silent.mp4','-i','/root/wallbox/wallbox_voiceover_english_2min.ogg','-c:v','copy','-c:a','aac','-shortest','/root/wallbox/wallbox_short_english_vo.mp4'], check=True)
print('/root/wallbox/wallbox_short_english_vo.mp4')
