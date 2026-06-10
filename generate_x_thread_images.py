from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math, textwrap

OUT = Path('/root/wallbox/x_thread_images')
OUT.mkdir(exist_ok=True)
W, H = 1600, 900
BG = '#080F11'
PANEL = '#101618'
PANEL2 = '#151B1E'
BORDER = '#292F31'
TEXT = '#E7EAEB'
MUTED = '#8E989C'
GREEN = '#00D497'
GREEN_DARK = '#003931'
GREEN_BORDER = '#236A4C'

FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'

def font(size, bold=False, mono=False):
    return ImageFont.truetype(FONT_MONO if mono else (FONT_BOLD if bold else FONT_REG), size)

def rounded(draw, xy, fill, outline=BORDER, r=24, width=2):
    draw.rounded_rectangle(xy, r, fill=fill, outline=outline, width=width)

def grid(draw):
    for x in range(0, W, 80):
        draw.line([(x,0),(x,H)], fill=(18,29,32), width=1)
    for y in range(0, H, 80):
        draw.line([(0,y),(W,y)], fill=(18,29,32), width=1)
    # controlled glow, kept subtle so text stays readable
    glow = Image.new('RGBA', (W,H), (0,0,0,0))
    gd = ImageDraw.Draw(glow)
    for i in range(10,0,-1):
        alpha = int(5*i)
        gd.ellipse((1030-i*34, 120-i*34, 1260+i*34, 350+i*34), fill=(0,212,151,alpha))
    return glow.filter(ImageFilter.GaussianBlur(24))

def text(draw, xy, s, size=42, fill=TEXT, bold=False, mono=False, anchor=None):
    draw.text(xy, s, font=font(size,bold,mono), fill=fill, anchor=anchor)

def multiline_text(draw, xy, s, size=58, fill=TEXT, bold=True, gap=10):
    x, y = xy
    for line in s.split('\\n'):
        draw.text((x, y), line, font=font(size, bold), fill=fill)
        y += size + gap
    return y

def wrap_text(draw, s, x, y, max_width, size=34, fill=MUTED, bold=False, line_gap=12):
    f = font(size,bold)
    words=s.split()
    lines=[]; cur=''
    for w in words:
        test=(cur+' '+w).strip()
        if draw.textlength(test, font=f) <= max_width:
            cur=test
        else:
            if cur: lines.append(cur)
            cur=w
    if cur: lines.append(cur)
    for line in lines:
        draw.text((x,y), line, font=f, fill=fill)
        y += size + line_gap
    return y

def logo(draw, x, y, scale=1):
    size=int(64*scale)
    rounded(draw, (x,y,x+size,y+size), GREEN_DARK, GREEN_BORDER, r=max(4,int(8*scale)), width=max(1,int(2*scale)))
    # cube icon approximation
    cx=x+size/2; cy=y+size/2+2*scale; s=18*scale
    pts_top=[(cx,cy-s),(cx+s,cy-s/2),(cx,cy),(cx-s,cy-s/2)]
    pts_left=[(cx-s,cy-s/2),(cx,cy),(cx,cy+s),(cx-s,cy+s/2)]
    pts_right=[(cx+s,cy-s/2),(cx,cy),(cx,cy+s),(cx+s,cy+s/2)]
    for pts in [pts_top, pts_left, pts_right]: draw.line(pts+[pts[0]], fill=GREEN, width=max(2,int(3*scale)))
    draw.rectangle((x+size-13*scale,y-5*scale,x+size-2*scale,y+6*scale), fill=GREEN)

def base(title, subtitle=None):
    im=Image.new('RGB',(W,H),BG); draw=ImageDraw.Draw(im)
    im.paste(Image.alpha_composite(Image.new('RGBA',(W,H),(0,0,0,0)), grid(draw)), (0,0), None)
    draw=ImageDraw.Draw(im)
    logo(draw, 80, 70, 1)
    text(draw, (160,82), 'WALLBOX', 28, TEXT, True)
    text(draw, (160,121), 'agent accountability infrastructure', 20, MUTED)
    title_end = multiline_text(draw, (80,205), title, 58, TEXT, True, gap=14)
    if subtitle:
        wrap_text(draw, subtitle, 84, title_end + 18, 710, 28, MUTED)
    return im, ImageDraw.Draw(im)

def connector(draw, a, b, fill=GREEN, width=3):
    draw.line([a,b], fill=fill, width=width)
    r=6
    draw.ellipse((b[0]-r,b[1]-r,b[0]+r,b[1]+r), fill=fill)

def card(draw, x,y,w,h, title, body=None, accent=False, mono=False):
    rounded(draw,(x,y,x+w,y+h),PANEL2 if accent else PANEL, GREEN_BORDER if accent else BORDER, r=18, width=2)
    text(draw,(x+24,y+22),title,28,TEXT,True,mono=mono)
    if body:
        wrap_text(draw, body, x+24, y+65, w-48, 24, MUTED, line_gap=8)

# 1 hero
im,d=base('Verifiable flight recorder\nfor AI agents','Capture an agent run, store the evidence on Walrus, anchor the proof on Sui through Tatum.')
rounded(d,(875,175,1505,720),PANEL,BORDER,26,2)
text(d,(925,220),'Latest certified run',32,TEXT,True)
card(d,925,285,450,70,'VERIFIED',accent=True)
text(d,(1200,307),'hash match',24,GREEN,True)
for i,(k,v) in enumerate([('Walrus blob','blob://walrus-testnet/...'),('Sui certificate','0x7f3a...c91d'),('Tx digest','9PLK...Q2m'),('Capsule hash','sha256: 8b78f7...')]):
    y=390+i*82; text(d,(925,y),k,22,MUTED); text(d,(925,y+30),v,24,TEXT,mono=True)
im.save(OUT/'01-wallbox-hero.png')

# 2 problem
im,d=base('AI agents need\naccountability','Chat history is not enough when agents call tools, use sources, and create artifacts.')
center=(1040,440); card(d,910,360,260,100,'AI Agent Run',accent=True)
for label,pos in [('Prompts',(720,260)),('Tool calls',(1240,260)),('Sources',(720,585)),('Outputs',(1240,585))]:
    card(d,pos[0],pos[1],230,78,label)
    connector(d, center, (pos[0]+115,pos[1]+39))
text(d,(80,720),'What happened? What evidence was used? Was the record changed?',30,GREEN,True)
im.save(OUT/'02-accountability.png')

# 3 capsule
im,d=base('Canonical\naudit capsule','Wallbox packages the full run into deterministic evidence before certification.')
rounded(d,(840,170,1490,745),PANEL,BORDER,26,2)
text(d,(885,220),'Audit Capsule JSON',34,TEXT,True,mono=True)
for i,item in enumerate(['prompts','tool_calls','sources','artifacts','final_output','verification_metadata']):
    y=295+i*58; d.rectangle((890,y,918,y+28),fill=GREEN_DARK,outline=GREEN_BORDER); text(d,(940,y-2),f'"{item}"',26,TEXT,mono=True)
rounded(d,(885,665,1435,710),BG,GREEN_BORDER,12,2)
text(d,(905,676),'capsule_hash: sha256(...)',24,GREEN,mono=True)
im.save(OUT/'03-audit-capsule.png')

# 4 walrus
im,d=base('Evidence stored\non Walrus','The full audit bundle is retrievable later for independent verification.')
card(d,880,250,520,110,'Walrus evidence bundle', 'canonical capsule JSON stored as a blob', True)
card(d,760,510,760,110,'blob_id', 'walrus://testnet/blob/8b78f7...d9a2', False, True)
connector(d,(1040,360),(1040,510)); text(d,(835,690),'Not just a private log. Publicly fetchable evidence.',32,GREEN,True)
im.save(OUT/'04-walrus-storage.png')

# 5 sui tatum
im,d=base('Proof anchored\non Sui','Tatum is used to create a certificate with the capsule hash and Walrus blob ID.')
card(d,820,220,310,95,'Capsule hash','sha256: 8b78f7...',True)
card(d,1190,220,310,95,'Walrus blob ID','blob: 9PLK...',True)
card(d,965,455,390,110,'Sui certificate','object + transaction digest')
connector(d,(975,315),(1125,455)); connector(d,(1345,315),(1180,455))
text(d,(850,690),'Evidence on Walrus. Proof on Sui. Transaction via Tatum.',30,GREEN,True)
im.save(OUT/'05-sui-tatum-certificate.png')

# 6 verify flow
im,d=base('Verification\nflow','Fetch the evidence, recompute the hash, compare it with the certificate.')
steps=[('1','Fetch bundle'),('2','Recompute hash'),('3','Compare proof'),('4','Return result')]
x0=725
for i,(n,label) in enumerate(steps):
    x=x0+i*215; rounded(d,(x,360,x+175,475),PANEL,GREEN_BORDER if i==3 else BORDER,18,2); text(d,(x+22,382),n,34,GREEN,True); text(d,(x+22,425),label,24,TEXT,True)
    if i<3: connector(d,(x+175,418),(x+215,418))
rounded(d,(965,585,1270,665),GREEN_DARK,GREEN_BORDER,18,2); text(d,(1022,607),'VERIFIED',34,GREEN,True)
im.save(OUT/'06-verification-flow.png')

# 7 tamper
im,d=base('Tamper demo','If the evidence changes after certification, the recomputed hash no longer matches.')
card(d,800,250,460,90,'Original evidence','hash: 8b78f7...',True)
card(d,800,430,460,90,'Modified evidence','hash: e4c19a...',False)
connector(d,(1030,340),(1030,430),fill='#E25555')
rounded(d,(1045,620,1370,705),'#2A1111','#E25555',18,2); text(d,(1095,644),'TAMPERED',34,'#FF6B6B',True)
text(d,(80,720),'Do not trust the UI. Verify the evidence.',34,GREEN,True)
im.save(OUT/'07-tamper-demo.png')

# 8 architecture
im,d=base('Wallbox architecture','A complete proof path for autonomous AI agent runs.')
labels=[('Agent run',160,430),('Wallbox capsule',460,430),('Walrus evidence',800,315),('Sui certificate',800,555),('Public verifier',1160,430)]
for title,x,y in labels: card(d,x,y,240,90,title,accent=title in ['Wallbox capsule','Public verifier'])
connector(d,(400,475),(460,475)); connector(d,(700,455),(800,360)); connector(d,(700,500),(800,600)); connector(d,(1040,360),(1160,455)); connector(d,(1040,600),(1160,500))
text(d,(230,730),'Demo: wallbox.hanslabs.xyz/demo',30,TEXT,True)
text(d,(230,775),'Repo: github.com/didiansyah/wallbox',26,MUTED,mono=True)
im.save(OUT/'08-final-architecture.png')

print('\n'.join(str(p) for p in sorted(OUT.glob('*.png'))))
