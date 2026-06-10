from pathlib import Path
import subprocess

OUT = Path('/root/wallbox/x_thread_images_v2')
OUT.mkdir(exist_ok=True)

slides = [
('01-wallbox-hero', 'Wallbox', 'Verifiable flight recorder for AI agents', '''
  <div class="hero-card wide">
    <div class="status ok">VERIFIED</div>
    <div class="kv"><span>Walrus blob</span><b>blob://testnet/8b78f7...</b></div>
    <div class="kv"><span>Sui certificate</span><b>0x7f3a...c91d</b></div>
    <div class="kv"><span>Tx digest</span><b>9PLK...Q2m</b></div>
    <div class="hash-row"><span>on-chain hash</span><strong>MATCH</strong><span>recomputed hash</span></div>
  </div>
'''),
('02-accountability', 'AI agents need accountability', 'Chat history is not enough when agents call tools and create artifacts.', '''
  <div class="node center">AI Agent Run</div>
  <div class="node n1">Prompts</div><div class="node n2">Tool calls</div><div class="node n3">Sources</div><div class="node n4">Outputs</div>
  <svg class="lines" viewBox="0 0 760 420"><path d="M380 210 L160 90 M380 210 L610 90 M380 210 L160 340 M380 210 L610 340"/></svg>
  <div class="caption two-line">What happened? What evidence was used?<br>Was the record changed?</div>
'''),
('03-audit-capsule', 'Canonical audit capsule', 'A deterministic evidence bundle for one agent run.', '''
  <div class="json-card">
    <div class="json-title">Audit Capsule JSON</div>
    <code>{</code>
    <code>  "prompts": [...],</code>
    <code>  "tool_calls": [...],</code>
    <code>  "sources": [...],</code>
    <code>  "artifacts": [...],</code>
    <code>  "final_output": "...",</code>
    <code>  "verification_metadata": {...}</code>
    <code>}</code>
    <div class="hash">capsule_hash: sha256(...)</div>
  </div>
'''),
('04-walrus-storage', 'Evidence stored on Walrus', 'The complete capsule can be fetched later for independent verification.', '''
  <div class="flow"><div class="box">Audit capsule</div><div class="arrow">→</div><div class="box accent">Walrus blob</div></div>
  <div class="big-id">walrus://testnet/blob/8b78f7...d9a2</div>
  <div class="caption">Not a private log. A retrievable evidence bundle.</div>
'''),
('05-sui-tatum-certificate', 'Proof anchored on Sui', 'Tatum creates a certificate with the capsule hash and Walrus blob ID.', '''
  <div class="split"><div class="box accent">capsule_hash<br><small>sha256: 8b78f7...</small></div><div class="box accent">walrus_blob_id<br><small>blob: 9PLK...</small></div></div>
  <div class="arrow down">↓</div>
  <div class="certificate">Sui certificate object<br><small>transaction submitted through Tatum</small></div>
'''),
('06-verification-flow', 'Verification flow', 'Fetch evidence, recompute hash, compare against the certificate.', '''
  <div class="steps"><div>1<br><span>Fetch bundle</span></div><div>2<br><span>Recompute hash</span></div><div>3<br><span>Compare proof</span></div><div class="okbox">4<br><span>VERIFIED</span></div></div>
  <div class="caption">If hashes match, the evidence has not changed.</div>
'''),
('07-tamper-demo', 'Tamper demo', 'Changed evidence breaks the proof.', '''
  <div class="tamper"><div class="box">Original evidence<br><small>hash: 8b78f7...</small></div><div class="red-arrow">↓ modified</div><div class="box red">Modified evidence<br><small>hash: e4c19a...</small></div></div>
  <div class="tampered">TAMPERED</div>
  <div class="caption">Do not trust the UI. Verify the evidence.</div>
'''),
('08-final-architecture', 'Wallbox architecture', 'A complete proof path for autonomous AI agent runs.', '''
  <div class="arch"><div>Agent run</div><span>→</span><div class="accent">Wallbox capsule</div><span>→</span><div>Walrus evidence</div><span>+</span><div>Sui certificate</div><span>→</span><div class="accent">Public verifier</div></div>
  <div class="links">wallbox.hanslabs.xyz/demo<br>github.com/didiansyah/wallbox</div>
''')
]

css = r'''
@font-face{font-family:Inter;src:local("DejaVu Sans")}*{box-sizing:border-box}body{margin:0;width:1600px;height:900px;background:#080F11;color:#E7EAEB;font-family:Inter,Arial,sans-serif}.slide{position:relative;width:1600px;height:900px;overflow:hidden;background:radial-gradient(circle at 78% 18%,rgba(0,212,151,.16),transparent 23%),linear-gradient(#101618 1px,transparent 1px),linear-gradient(90deg,#101618 1px,transparent 1px),#080F11;background-size:auto,80px 80px,80px 80px}.brand{position:absolute;left:80px;top:64px;display:flex;align-items:center;gap:18px}.logo{width:70px;height:70px;background:#003931;border:2px solid #236A4C;display:grid;place-items:center;position:relative}.logo:after{content:"";position:absolute;right:-8px;top:-8px;width:14px;height:14px;background:#00D497;box-shadow:0 0 25px #00D497}.cube{width:34px;height:34px;border:3px solid #00D497;transform:rotate(45deg);border-radius:3px}.brand b{font-size:28px;letter-spacing:.18em}.brand span{display:block;color:#8E989C;font-size:18px;margin-top:6px}.title{position:absolute;left:80px;top:198px;width:720px;font-weight:800;font-size:68px;line-height:1.04;letter-spacing:-.04em}.subtitle{position:absolute;left:84px;top:360px;width:650px;color:#A7B0B4;font-size:30px;line-height:1.35}.canvas{position:absolute;right:80px;top:158px;width:760px;height:600px}.hero-card,.json-card{background:#101618;border:2px solid #292F31;border-radius:28px;padding:42px;box-shadow:0 30px 90px rgba(0,0,0,.45)}.wide{width:680px}.status{display:inline-flex;padding:14px 22px;border-radius:999px;font-size:26px;font-weight:800;letter-spacing:.08em}.ok{background:#003931;color:#00D497;border:1px solid #236A4C}.kv{margin-top:28px;border-top:1px solid #292F31;padding-top:20px}.kv span{display:block;color:#8E989C;font-size:21px}.kv b{display:block;font-family:monospace;font-size:27px;margin-top:8px}.hash-row{margin-top:30px;display:flex;gap:16px;align-items:center;color:#8E989C;font-size:20px}.hash-row strong{color:#00D497;border:1px solid #236A4C;background:#003931;padding:10px 18px;border-radius:10px}.node,.box,.certificate,.big-id{background:#101618;border:2px solid #292F31;border-radius:22px;padding:26px;text-align:center;font-weight:800;font-size:28px}.center{position:absolute;left:260px;top:210px;width:260px;border-color:#236A4C;background:#003931;color:#00D497}.n1,.n2,.n3,.n4{position:absolute;width:210px}.n1{left:20px;top:48px}.n2{right:20px;top:48px}.n3{left:20px;bottom:48px}.n4{right:20px;bottom:48px}.lines{position:absolute;inset:0;z-index:0}.lines path{stroke:#00D497;stroke-width:3;fill:none;opacity:.7}.caption{position:absolute;left:0;right:0;bottom:0;color:#00D497;font-size:28px;font-weight:800;text-align:center}.caption.two-line{font-size:24px;line-height:1.25;bottom:-2px}.json-card{width:680px}.json-title{font-size:34px;font-weight:800;margin-bottom:24px}code{display:block;font-family:monospace;font-size:24px;color:#DCE3E5;line-height:1.55}.hash,.big-id{margin-top:28px;font-family:monospace;color:#00D497;border-color:#236A4C;background:#003931}.flow,.split,.steps,.arch{display:flex;align-items:center;justify-content:center;gap:22px}.flow{margin-top:130px}.arrow{font-size:60px;color:#00D497;font-weight:800}.down{text-align:center;margin:34px 0}.split .box{width:320px}.certificate{width:520px;margin:0 auto;border-color:#236A4C;background:#003931;color:#00D497}.box small,.certificate small{display:block;color:#A7B0B4;font-size:20px;margin-top:12px;font-weight:500}.accent{border-color:#236A4C!important;background:#003931!important;color:#00D497!important}.steps{margin-top:185px}.steps div{width:160px;height:150px;background:#101618;border:2px solid #292F31;border-radius:22px;display:grid;place-items:center;color:#00D497;font-size:42px;font-weight:900}.steps span{display:block;color:#E7EAEB;font-size:20px;line-height:1.2}.steps .okbox{background:#003931;border-color:#236A4C}.tamper{margin-top:70px;display:grid;gap:24px;place-items:center}.red-arrow{color:#FF6B6B;font-size:26px;font-weight:800}.red{border-color:#7A2C2C!important;background:#241314!important}.tampered{margin:38px auto 0;width:360px;padding:22px;border-radius:22px;text-align:center;background:#241314;border:2px solid #FF6B6B;color:#FF6B6B;font-size:42px;font-weight:900}.arch{margin-top:135px;flex-wrap:wrap}.arch div{width:230px;height:96px;background:#101618;border:2px solid #292F31;border-radius:20px;display:grid;place-items:center;text-align:center;font-size:24px;font-weight:800}.arch span{color:#00D497;font-size:42px;font-weight:900}.links{margin-top:70px;text-align:center;color:#A7B0B4;font-family:monospace;font-size:26px;line-height:1.65}
'''

def html(slide):
    name, title, subtitle, content = slide
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body><main class="slide"><div class="brand"><div class="logo"><div class="cube"></div></div><div><b>WALLBOX</b><span>agent accountability infrastructure</span></div></div><h1 class="title">{title}</h1><p class="subtitle">{subtitle}</p><section class="canvas">{content}</section></main></body></html>'

for s in slides:
    (OUT / f'{s[0]}.html').write_text(html(s))

for s in slides:
    h = OUT / f'{s[0]}.html'
    p = OUT / f'{s[0]}.png'
    subprocess.run(['google-chrome','--headless','--disable-gpu','--no-sandbox','--window-size=1600,900',f'--screenshot={p}',f'file://{h}'], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(p)
