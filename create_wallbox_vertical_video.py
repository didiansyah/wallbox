from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import subprocess, math, wave, struct

OUT = Path('/root/wallbox/video_assets_vertical')
OUT.mkdir(exist_ok=True)
W,H = 1080,1920
BG = '#080F11'; PANEL='#101618'; PANEL2='#151B1E'; BORDER='#292F31'; TEXT='#E7EAEB'; MUTED='#9AA1A3'; DIM='#4D5558'; ACCENT='#00D497'; DANGER='#FF6785'
FONT_REG='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_MONO='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'

def font(size,bold=False,mono=False): return ImageFont.truetype(FONT_MONO if mono else (FONT_BOLD if bold else FONT_REG), size)

def fit_cover(img, box_w, box_h):
    iw,ih=img.size; s=max(box_w/iw, box_h/ih); nw,nh=int(iw*s),int(ih*s)
    img=img.resize((nw,nh), Image.Resampling.LANCZOS)
    return img.crop(((nw-box_w)//2,(nh-box_h)//2,(nw+box_w)//2,(nh+box_h)//2))

def crop_region(path, y_frac=0, h_frac=0.5):
    img=Image.open(path).convert('RGB'); iw,ih=img.size
    hh=int(ih*h_frac); y=int((ih-hh)*y_frac)
    return img.crop((0,y,iw,min(ih,y+hh)))

def wrap(draw,text,max_w,f):
    out=[]
    for para in text.split('\n'):
        words=para.split(); line=''
        for w in words:
            test=(line+' '+w).strip()
            if draw.textbbox((0,0),test,font=f)[2] <= max_w: line=test
            else:
                if line: out.append(line)
                line=w
        if line: out.append(line)
    return out

def add_text(draw,xy,text,f,fill=TEXT,max_w=None,line_gap=8):
    x,y=xy
    lines=[text] if max_w is None else wrap(draw,text,max_w,f)
    for line in lines:
        draw.text((x,y),line,font=f,fill=fill)
        y += f.size + line_gap
    return y

def base():
    im=Image.new('RGB',(W,H),BG)
    d=ImageDraw.Draw(im)
    for x in range(0,W,60): d.line((x,0,x,H), fill=(18,31,34), width=1)
    for y in range(0,H,60): d.line((0,y,W,y), fill=(18,31,34), width=1)
    glow=Image.new('RGBA',(W,H),(0,0,0,0)); gd=ImageDraw.Draw(glow)
    gd.ellipse((420,-220,1440,780), fill=(0,212,151,34))
    gd.ellipse((-500,1120,600,2200), fill=(0,212,151,18))
    glow=glow.filter(ImageFilter.GaussianBlur(95))
    im=Image.alpha_composite(im.convert('RGBA'),glow).convert('RGB')
    d=ImageDraw.Draw(im)
    d.rectangle((0,0,W,86), fill='#0B1113', outline=BORDER)
    d.rectangle((44,28,68,52), fill=ACCENT)
    d.text((84,26),'WALLBOX', font=font(27,True,True), fill=TEXT)
    d.text((590,30),'WALRUS / SUI / TATUM', font=font(20,False,True), fill=ACCENT)
    return im,d

def caption_box(d, text):
    y=1610
    d.rounded_rectangle((54,y,1026,1840), radius=8, fill=(10,17,19), outline=BORDER, width=2)
    add_text(d,(82,y+35),text.upper(),font(36,True),TEXT,max_w=916,line_gap=9)

def make_slide(idx, eyebrow, title, body, caption, shot_path=None, y_frac=0, h_frac=.45, bullets=None, custom=None):
    im,d=base()
    d.text((58,138),eyebrow.upper(),font=font(22,False,True),fill=ACCENT)
    add_text(d,(58,186),title,font(62,True),TEXT,max_w=960,line_gap=10)
    add_text(d,(60,410),body,font(29),MUTED,max_w=940,line_gap=10)
    if bullets:
        yy=585
        for b in bullets:
            d.rectangle((62,yy+9,80,yy+27),fill=ACCENT)
            add_text(d,(102,yy),b,font(25,False,True),TEXT,max_w=880,line_gap=6)
            yy += 58
    if shot_path:
        img=crop_region(shot_path,y_frac,h_frac)
        shot=fit_cover(img,960,710)
        im.paste(shot,(60,850))
        d.rectangle((60,850,1020,1560),outline=BORDER,width=2)
    if custom: custom(im,d)
    caption_box(d,caption)
    d.text((58,1872),'INTEGRITY VERIFIED, NOT TRUTH CERTIFIED',font=font(18,False,True),fill=DIM)
    p=OUT/f'vslide_{idx:02d}.png'; im.save(p); return p

home='/root/.hermes/cache/screenshots/browser_screenshot_f045401b1d7943aeafca81bea0170437.png'
run='/root/.hermes/cache/screenshots/browser_screenshot_22aa6d927ec141d1a3631fe02a993064.png'
status='/root/.hermes/cache/screenshots/browser_screenshot_5e62e4cf4d3f4bcc8ed56dcab3a948af.png'
verify='/root/.hermes/cache/screenshots/browser_screenshot_aaa25fbe62574e97b8d78862d80d6885.png'

def capsule(im,d):
    x,y=80,850
    d.rounded_rectangle((x,y,1000,1555),radius=4,fill=PANEL,outline=BORDER,width=2)
    d.text((x+36,y+34),'AUDIT CAPSULE',font=font(30,True,True),fill=ACCENT)
    files=['trace.jsonl','sources.json','verdict.json','final_report.md']
    yy=y+115
    for f in files:
        d.rectangle((x+38,yy,x+842,yy+78),fill=PANEL2,outline=BORDER,width=1)
        d.text((x+62,yy+24),f,font=font(25,False,True),fill=TEXT)
        d.text((x+690,yy+24),'OK',font=font(25,True,True),fill=ACCENT)
        yy += 100
    d.text((x+42,yy+55),'capsule_hash',font=font(24,False,True),fill=MUTED)
    d.text((x+42,yy+96),'0x312122a508d0e7a5...',font=font(26,False,True),fill=ACCENT)

slides=[]
slides.append(make_slide(1,'Hook','The black box for autonomous AI agents.','Agents are moving from chat into real work. Wallbox records what happened and makes the evidence verifiable.','AI agents are starting to do real work. But when something goes wrong, the evidence is usually weak.',home,0,.25,['Record','Store','Certify','Verify']))
slides.append(make_slide(2,'Problem','Logs can be rewritten. Screenshots are not proof.','Wallbox captures prompts, tools, sources, outputs, and artifacts into a tamper-evident chain of custody.','Logs can be rewritten. Tool traces are scattered. A screenshot cannot prove what actually happened.',home,.27,.27,['Mutable logs','Scattered traces','Disputed outputs']))
slides.append(make_slide(3,'Run demo','RiskLens trust review run.','A deterministic demo agent reviews whether an AI trading agent should be trusted with user funds.','First, an agent runs a task. Wallbox captures the task, agent identity, model label, tools, sources, and final artifacts.',run,0,.95,['Execution console','Deterministic trace','Hosted demo agent']))
slides.append(make_slide(4,'Audit capsule','Structured evidence. Reproducible hash.','Each evidence file is hashed. The capsule receives a SHA-256 hash that changes if any artifact changes.','Next, Wallbox builds an audit capsule with trace.jsonl, sources.json, verdict.json, and the final report.',custom=capsule,bullets=['File-level hashes','Canonical capsule','SHA-256 proof']))
slides.append(make_slide(5,'Live testnet','Walrus storage. Sui certificate.','The deployment is live on Walrus testnet and anchors certificates on Sui through Tatum.','The capsule is uploaded through Walrus-compatible storage. Then Wallbox anchors a certificate on Sui through Tatum.',status,0,1.0,['Walrus live','Sui/Tatum live','Keys server-side']))
slides.append(make_slide(6,'Verifier','Public verification page.','Anyone can paste a certificate ID. Wallbox fetches the certificate, retrieves evidence, and recomputes the capsule hash.','Finally, anyone can verify the run. If the anchored hash and recomputed hash match, the run is integrity verified.',verify,0,.56,['On-chain hash','Recomputed hash','Evidence blob ID']))
slides.append(make_slide(7,'Tamper proof','Change the evidence, break the proof.','If a local evidence clone is altered, the recomputed hash diverges and verification fails.','If evidence is tampered with, the hash changes and Wallbox marks the run as tampered.',verify,.32,.43,['Verified when hashes match','Tampered when hashes diverge','Integrity, not truth']))
slides.append(make_slide(8,'Close','Record. Store. Certify. Verify.','Evidence on Walrus. Certificates on Sui through Tatum. Integrity verified, not truth certified.','Wallbox gives each agent run a chain of custody: record, store, certify, and verify.',home,.67,.30,['AI trading agents','Research copilots','Coding agents','Compliance teams']))

# make subtle bg music wav
sr=48000; dur=167; wav=str(OUT/'ambient.wav')
notes=[55,82.41,110,164.81]
with wave.open(wav,'w') as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(sr)
    for n in range(sr*dur):
        t=n/sr
        val=0
        for i,freq in enumerate(notes):
            val += math.sin(2*math.pi*freq*t + i*.7)*0.045
        val += math.sin(2*math.pi*220*t)*0.01*(0.5+0.5*math.sin(2*math.pi*0.08*t))
        # slow fade in/out
        env=min(1,t/4,(dur-t)/5)
        sample=int(max(-1,min(1,val*env))*32767)
        wv.writeframes(struct.pack('<h',sample))

concat=OUT/'concat.txt'; durations=[21,20,21,20,21,22,20,21]
with open(concat,'w') as f:
    for p,dur_s in zip(slides,durations):
        f.write(f"file '{p}'\n")
        f.write(f'duration {dur_s}\n')
    f.write(f"file '{slides[-1]}'\n")
subprocess.run(['ffmpeg','-y','-f','concat','-safe','0','-i',str(concat),'-vf','fps=30','-pix_fmt','yuv420p','/root/wallbox/wallbox_vertical_silent.mp4'],check=True)
# mix narration + ambient music ducked low
subprocess.run(['ffmpeg','-y','-i','/root/wallbox/wallbox_voiceover_english_2min.ogg','-i',wav,'-filter_complex','[1:a]volume=0.10[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-16:TP=-1.5:LRA=11[a]','-map','[a]','/root/wallbox/wallbox_vertical_audio.m4a'],check=True)
subprocess.run(['ffmpeg','-y','-i','/root/wallbox/wallbox_vertical_silent.mp4','-i','/root/wallbox/wallbox_vertical_audio.m4a','-c:v','copy','-c:a','aac','-shortest','/root/wallbox/wallbox_short_vertical_english_vo_final.mp4'],check=True)
print('/root/wallbox/wallbox_short_vertical_english_vo_final.mp4')
