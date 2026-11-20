#!/usr/bin/env python3
"""M0 design boards — generates design-lab/m0/index.html (self-contained).
Run:  python3 design-lab/m0/build.py   (assets are read from ASSET_DIR; see README)"""
import base64, json, math, os, re, sys
ASSET_DIR = os.environ.get("M0_ASSETS", "/tmp/m0a/")
OUT = os.path.join(os.path.dirname(__file__), "index.html")
REPORT = json.load(open("assets-source/official-cards/normalized/normalization-report.json"))

def b64(name, mime):
    return f"data:{mime};base64," + base64.b64encode(open(ASSET_DIR + name, "rb").read()).decode()
IMG = {k: b64(v, "image/webp") for k, v in {
    "black":"card-black.webp","blue":"card-blue_ace.webp","green":"card-green.webp","purple":"card-purple_ace.webp",
    "red":"card-red.webp","teal":"card-teal.webp","orange":"card-orange_ace.webp","giraffes":"card-giraffes.webp","back":"card-back.webp",
    "phone":"phone.webp","table":"table.webp","david":"david.webp","mjeshi":"mjeshi.webp","bedadi":"bedadi.webp",
    "crown":"crown.webp","mark":"mark.webp","fronts":"fronts.webp","rawblue":"raw-blue.webp","rawback":"raw-back.webp"}.items()}
FONT_A = b64("archivo.woff2", "font/woff2"); FONT_I = b64("instrument.woff2", "font/woff2")

# ---------- geometry helpers (centre-based, because the flip pivot is the centre) ----------
def card(name, cx, cy, vis_w, rot=0, z=1, extra=""):
    w = vis_w * 1024 / 920; h = w * 1.5
    return (f'<img class="cd" alt="" src="@@{name}@@" style="left:{cx-w/2:.1f}px;top:{cy-h/2:.1f}px;width:{w:.1f}px;'
            f'transform:rotate({rot}deg);z-index:{z};{extra}">')
def phone(cx, top, w, rot=0, z=5, extra=""):
    # % padding resolves against the CONTAINING BLOCK's width, so the bezel lives on an inner element whose parent is the phone itself.
    return (f'<div class="ph" style="left:{cx-w/2:.1f}px;top:{top:.1f}px;width:{w:.1f}px;transform:rotate({rot}deg);z-index:{z};{extra}">'
            f'<div class="phb"><img alt="" src="@@phone@@"></div></div>')
def scaled(inner, w, h, s, cls=""):
    return (f'<div class="sc {cls}" style="width:{w*s:.1f}px;height:{h*s:.1f}px"><div class="scin" '
            f'style="width:{w}px;height:{h}px;transform:scale({s})">{inner}</div></div>')
CHIP = '<svg class="disc" viewBox="0 0 40 40" aria-hidden="true"><use href="#chip"/></svg>'
def btn(kind, label, state="", theme="", disabled=False, small=False):
    cls = f'btn btn-{kind} {state} {"sm" if small else ""}'
    dis = " disabled" if disabled else ""
    return (f'<button class="{cls}" type="button"{dis}><span class="lab">{label}</span>'
            f'<span class="chip">{CHIP}<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><use href="#arrow"/></svg></span></button>')
def meta(t, extra=""): return f'<span class="meta" style="{extra}">{t}</span>'
def ease(p): return 1 - (1 - p) ** 3
def lerp(a, b, t): return a + (b - a) * t
def clamp(x): return max(0.0, min(1.0, x))

CSS = r'''
@font-face{font-family:"Archivo Display";src:url(@@FONTA@@) format("woff2");font-weight:600 900;font-stretch:62% 100%;font-display:swap}
@font-face{font-family:"Instrument Sans";src:url(@@FONTI@@) format("woff2");font-weight:400 700;font-display:swap}
:root{--blue:#1238d4;--yellow:#ffe11a;--red:#e3261c;--green:#12884a;--ink:#000;--paper:#fff;
 --night:color-mix(in oklab,#1238d4 42%,#000);--e:cubic-bezier(.16,1,.3,1);--e2:cubic-bezier(.2,0,0,1);
 --d-fast:150ms;--d-std:260ms;--d-deal:520ms;--d-turn:520ms;--d-slide:320ms;--d-settle:460ms}
*{box-sizing:border-box}html{background:#000;color:#fff}
body{margin:0;font-family:"Instrument Sans",system-ui,sans-serif;font-size:17px;line-height:1.5;-webkit-font-smoothing:antialiased;min-width:1280px}
img{display:block}
.poster{font-family:"Archivo Display","Archivo";font-weight:900;font-stretch:62%;text-transform:uppercase;line-height:.8;letter-spacing:-.005em;word-spacing:.06em}
.edit{font-family:"Archivo Display","Archivo";font-weight:800;font-stretch:76%;text-transform:uppercase;line-height:.88;word-spacing:.05em}
.quiet{font-family:"Instrument Sans";font-weight:500;letter-spacing:-.01em;line-height:1.35;text-wrap:balance}
.meta{font-family:"Archivo Display","Archivo";font-weight:700;font-stretch:100%;text-transform:uppercase;letter-spacing:.09em;font-size:12px;line-height:1.2;font-variant-numeric:tabular-nums}
.num{font-family:"Archivo Display","Archivo";font-weight:900;font-stretch:70%;font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}
.out{color:transparent;-webkit-text-stroke:2px var(--yellow)}
.y{color:var(--yellow)}
/* ---------- shell ---------- */
.top{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:18px;height:64px;padding:0 30px;background:rgb(0 0 0/.92);border-bottom:1px solid #222}
.top .mk-wrap{display:flex;gap:4px;position:relative;align-items:center;height:100%}
.top a{white-space:nowrap;position:relative;color:#fff;text-decoration:none;font:700 11px/1 "Archivo Display","Archivo";font-stretch:100%;letter-spacing:.07em;text-transform:uppercase;padding:8px 5px}
.top a:focus-visible,.btn:focus-visible,.lnk:focus-visible,button:focus-visible{outline:3px solid var(--focus,#fff);outline-offset:3px}
.top .brand{display:flex;align-items:center;gap:10px;margin-right:6px;white-space:nowrap}.top .brand img{width:34px;height:34px}
.mk{position:absolute;bottom:-3px;left:0;width:14px;height:14px;color:var(--yellow);--chip-ring:#000;pointer-events:none;transition:transform var(--d-slide) var(--e2)}
.wrap{max-width:1240px;margin:0 auto;padding:0 30px}
.board{padding:72px 0 40px;border-top:1px solid #1d1d1d}
.bh{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;margin-bottom:26px}
.bn{display:inline-flex;align-items:center;gap:10px;color:var(--yellow)}
.bn i{display:inline-block;width:14px;height:14px}
.bt{font-size:58px;margin:10px 0 0}
.forms{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:560px}
.forms span{font:700 11px/1 "Archivo Display","Archivo";font-stretch:100%;letter-spacing:.08em;text-transform:uppercase;padding:7px 9px;border-radius:7px;border:1px solid #333;color:#777}
.forms span.on{background:var(--yellow);color:#000;border-color:var(--yellow)}
.panel{border-radius:18px;overflow:hidden;position:relative}
.gate{margin-top:26px;display:grid;grid-template-columns:260px 1fr 1fr;gap:20px;padding:20px 22px;border:1px solid #2a2a2a;border-radius:14px;background:#080808}
.gate b{font:800 13px/1.2 "Archivo Display","Archivo";font-stretch:100%;letter-spacing:.08em;text-transform:uppercase;color:var(--yellow)}
.gate p{margin:6px 0 0;font-size:15px;color:#cfcfcf}
.gate .v{font:900 26px/1 "Archivo Display","Archivo";font-stretch:70%;text-transform:uppercase}
.note{font-size:14px;color:#aaa;max-width:70ch}
.sc{position:relative;flex:none}.scin{transform-origin:0 0;position:absolute;left:0;top:0;overflow:hidden}
.cd{position:absolute;height:auto;filter:drop-shadow(0 20px 22px rgb(0 0 0/.42))}
.ph{position:absolute}
.ph .phb{background:#000;border-radius:13%/7%;padding:4.5%;box-shadow:0 40px 70px -30px rgb(0 0 0/.75)}
.ph img{width:100%;border-radius:10%/5.5%;height:auto}
.row{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}
/* ---------- buttons: the card-edge family ---------- */
.btn{--h:56px;--fs:18px;position:relative;display:inline-flex;align-items:center;gap:16px;height:var(--h);padding:0 6px 0 24px;border:0;border-radius:12px;
 font-family:"Archivo Display","Archivo";font-weight:900;font-size:var(--fs);line-height:1;font-stretch:78%;letter-spacing:.02em;text-transform:uppercase;cursor:pointer;
 overflow:hidden;isolation:isolate;white-space:nowrap;text-decoration:none;transition:transform var(--d-fast) var(--e),box-shadow var(--d-fast) var(--e)}
.btn.sm{--h:44px;--fs:15px;padding-left:18px;gap:12px}
.btn::before{content:"";position:absolute;inset:0;z-index:-1;transform:scaleX(0);transform-origin:0 50%;transition:transform 240ms var(--e)}
.btn .lab{transition:transform 200ms var(--e)}
.btn .chip{position:relative;flex:none;width:calc(var(--h) - 12px);height:calc(var(--h) - 12px);transition:transform 220ms var(--e)}
.btn .chip svg{position:absolute;inset:0;width:100%;height:100%}
.btn .chip .arr{inset:auto;left:50%;top:50%;width:46%;height:46%;transform:translate(-50%,-50%)}
.btn-app{background:var(--yellow);color:#000;box-shadow:inset 0 0 0 1.5px #000}
.btn-app::before{background:#fff;opacity:.6}
.btn-app .chip .disc{color:#000;--chip-ring:var(--yellow)}.btn-app .chip .arr{color:var(--yellow)}
.btn-cards{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}
.btn-cards::before{background:currentColor;opacity:.16}
.btn-cards .chip .disc{color:var(--yellow);--chip-ring:#000}.btn-cards .chip .arr{color:#000}
.btn:hover,.btn.is-hover{}
.btn:hover::before,.btn.is-hover::before,.btn.is-pressed::before{transform:scaleX(1)}
.btn:hover .lab,.btn.is-hover .lab{transform:translateX(3px)}
.btn:hover .chip,.btn.is-hover .chip{transform:translateX(4px) rotate(-12deg)}
.btn:active,.btn.is-pressed{transform:translateY(1px)}
.btn-app:active,.btn-app.is-pressed{box-shadow:inset 0 0 0 1.5px #000,inset 0 3px 0 rgb(0 0 0/.2)}
.btn-cards:active,.btn-cards.is-pressed{box-shadow:inset 0 0 0 1.5px currentColor,inset 0 3px 0 rgb(0 0 0/.25)}
.btn.is-pressed .chip{transform:translateX(2px) rotate(-6deg)}
.btn.is-focus{outline:3px solid var(--focus,#fff);outline-offset:3px}
.btn[disabled]{opacity:.45;cursor:not-allowed;box-shadow:none;outline:1.5px dashed currentColor;outline-offset:-1.5px;pointer-events:none}
.btn[disabled]::before{display:none}
.th-blue{background:var(--blue);--focus:#fff;color:#fff}.th-paper{background:#fff;--focus:var(--blue);color:#000}.th-night{background:var(--night);--focus:var(--yellow);color:#fff}
.seg{display:inline-flex;border-radius:11px;box-shadow:inset 0 0 0 1.5px currentColor;padding:3px;gap:2px}
.seg button{all:unset;cursor:pointer;min-width:44px;height:36px;display:grid;place-items:center;border-radius:8px;font:800 14px/1 "Archivo Display","Archivo";font-stretch:90%;letter-spacing:.04em;color:inherit;opacity:.8}
.seg button[aria-pressed=true]{background:currentColor;opacity:1}.seg button[aria-pressed=true] span{color:var(--seg-on,#000)}
.mx .btn{--h:44px;--fs:14px;padding-left:16px;gap:10px}
.sqbtn{all:unset;cursor:pointer;width:48px;height:48px;border-radius:11px;box-shadow:inset 0 0 0 1.5px currentColor;display:grid;place-items:center;color:inherit}
.sqbtn svg{width:22px;height:22px}
.sqbtn[disabled]{opacity:.4;cursor:not-allowed;outline:1.5px dashed currentColor;outline-offset:-1.5px;box-shadow:none}
/* ---------- nav object ---------- */
.nav{display:flex;align-items:center;gap:26px;height:60px;padding:0 9px 0 16px;border-radius:14px;width:100%}
.nav .logo{display:flex;align-items:center;gap:12px}.nav .logo img{width:38px;height:38px}
.nav .scene{padding-left:12px;border-left:1.5px solid currentColor;opacity:.85}
.nav .links{display:flex;gap:6px;margin:0 auto;position:relative;height:100%;align-items:center}
.nav .links a{position:relative;padding:12px 14px;font:700 15px/1 "Instrument Sans";letter-spacing:-.005em;color:inherit;text-decoration:none;opacity:.9}
.nav .links a[aria-current=true]{opacity:1;font-weight:700}
.nav .links .mk{bottom:5px;--x:0}
.nav-hero{background:transparent;box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.32);color:#fff;--focus:#fff}
.nav-paper{background:#fff;color:#000;box-shadow:inset 0 0 0 1.5px #000,0 14px 30px -14px rgb(0 0 0/.35);--focus:var(--blue);--chip-edge:#000}
.nav-night{background:var(--night);color:#fff;box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.28),0 14px 30px -12px rgb(0 0 0/.6);--focus:var(--yellow)}
.nav-paper .mk{color:var(--yellow)}
.nav-hero .seg,.nav-night .seg{--seg-on:#000}.nav-paper .seg{--seg-on:#fff}
.nav-hero .seg button[aria-pressed=true],.nav-night .seg button[aria-pressed=true]{background:#fff}
.nav-paper .seg button[aria-pressed=true]{background:#000}
.stage{position:relative;padding:18px;border-radius:16px;overflow:hidden}
/* ---------- champion cover ---------- */
.cover{position:relative;width:380px;height:540px;border-radius:20px;overflow:hidden;background:radial-gradient(120% 80% at 50% 12%,color-mix(in oklab,var(--blue) 82%,#fff) 0%,var(--blue) 40%,var(--night) 100%);flex:none}
.cover .cv-key{position:absolute;inset:12px;border-radius:12px;box-shadow:inset 0 0 0 1.5px var(--yellow);z-index:6;pointer-events:none}
.cover .cv-num{position:absolute;left:-22px;bottom:96px;font-family:"Archivo Display","Archivo";font-weight:900;font-stretch:62%;line-height:.74;-webkit-text-stroke:2.5px var(--yellow);color:transparent;z-index:1;font-feature-settings:"tnum" 1}
.cover .cv-photo{position:absolute;z-index:3;left:50%;transform:translateX(-50%);height:auto;filter:drop-shadow(0 16px 20px rgb(0 0 0/.35))}
.cover .cv-win{position:absolute;z-index:2;left:12px;right:12px;top:12px;bottom:170px;border-radius:12px 12px 0 0;overflow:hidden}
.cover .cv-win img{width:100%;height:100%;object-fit:cover;object-position:60% 18%}
.cover .cv-win::after{content:"";position:absolute;inset:0;background:radial-gradient(75% 70% at 62% 42%,transparent 38%,color-mix(in oklab,var(--blue) 70%,#000) 100%);mix-blend-mode:multiply}
.cover .cv-win::before{content:"";position:absolute;inset:0;z-index:2;box-shadow:inset 0 0 40px 6px color-mix(in oklab,var(--night) 85%,transparent)}
.cover .cv-top{position:absolute;z-index:7;left:28px;right:28px;top:26px;display:flex;justify-content:space-between;color:#fff}
.cover .cv-wave{position:absolute;z-index:5;left:0;bottom:0;width:100%;height:230px}
.cover .cv-pl{position:absolute;z-index:8;left:28px;right:28px;bottom:24px;display:flex;flex-direction:column;gap:6px}
.cover .cv-pl .nm{font-size:58px;color:#fff;line-height:.82;white-space:nowrap}
.cover .cv-pl .row2{display:flex;justify-content:space-between;align-items:flex-end;gap:8px}
.cover .cv-pl .loc{color:#d6dcff}
.cover .cv-pl .pz{font-size:30px;color:var(--yellow);line-height:.9;margin-top:2px}
.pl-chip{display:inline-flex;align-items:center;gap:7px;align-self:flex-start;background:var(--yellow);color:#000;border-radius:8px;padding:6px 9px 6px 7px;font:900 12px/1 "Archivo Display","Archivo";font-stretch:100%;letter-spacing:.09em}
.pl-chip svg{width:14px;height:14px;color:#000;--chip-ring:var(--yellow)}
/* ---------- arena / fixture / ladder ---------- */
.arena{background:linear-gradient(to bottom,var(--blue) 0%,var(--blue) 24%,var(--night) 78%,var(--night) 100%);color:#fff}
.cell{display:grid;place-items:center;height:84px;min-width:92px;padding:0 16px;border-radius:12px;box-shadow:inset 0 0 0 1.5px var(--yellow);font-size:64px;line-height:1;color:#fff}
.cell.sm{height:60px;min-width:70px;font-size:46px;padding:0 12px}
.dot{width:14px;height:14px;color:var(--yellow);--chip-ring:#000;flex:none}
.bar{position:relative;height:84px;flex:none;transform-origin:0 50%}
.bar svg{display:block}
.ladder.play .bar{animation:grow 620ms var(--e) both}
.ladder.play .bar.b2{animation-delay:90ms}.ladder.play .bar.b3{animation-delay:180ms}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
/* ---------- storyboard frames ---------- */
.fr{position:relative;overflow:hidden;background:var(--blue);color:#fff;font-family:"Instrument Sans"}
.frame-cap{display:flex;gap:10px;align-items:baseline;margin-top:9px}
.frame-cap b{font:900 22px/1 "Archivo Display","Archivo";font-stretch:70%;color:var(--yellow)}
.frame-cap span{font-size:13px;color:#b9b9b9;line-height:1.35}
.sb{display:grid;gap:22px}
/* ---------- flip + motion demos ---------- */
.flip{perspective:1500px;position:relative;cursor:pointer}
.flip .fi{position:absolute;inset:0;transform-style:preserve-3d;transition:transform var(--d-turn) cubic-bezier(.3,.75,.15,1)}
.flip.on .fi{transform:rotateY(180deg)}
.flip .face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.flip .face img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 18px 20px rgb(0 0 0/.4))}
.flip .back{transform:rotateY(180deg)}
.guide{position:absolute;pointer-events:none;border:1.5px dashed var(--yellow);border-radius:14px}
.demo{background:#0b0b0b;border:1px solid #262626;border-radius:16px;padding:22px;position:relative;overflow:hidden}
.demo h4{margin:0 0 4px;font:900 40px/.9 "Archivo Display","Archivo";font-stretch:62%;text-transform:uppercase}
.demo .area{height:260px;margin:14px 0;position:relative;border-radius:12px;overflow:hidden}
.tok{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:13px;color:#bbb}.tok b{color:#fff;font-family:"Archivo Display","Archivo";font-stretch:100%;letter-spacing:.06em;text-transform:uppercase;font-size:11px}
.deal .dc{position:absolute;width:150px;left:calc(50% - 75px);top:44px;opacity:1}
.deal.play .dc{animation:dealin 560ms var(--e) both;animation-delay:calc(var(--i)*85ms)}
@keyframes dealin{from{transform:translate(260px,210px) rotate(34deg)}60%{}to{transform:translate(var(--tx),var(--ty)) rotate(var(--tr))}}
.deal .dc{transform:translate(var(--tx),var(--ty)) rotate(var(--tr))}
.settle p{margin:0 0 6px}.settle.play p{animation:settle var(--d-settle) var(--e) both;animation-delay:calc(var(--i)*70ms)}
@keyframes settle{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.slide-nav{display:flex;gap:6px;position:relative;padding-bottom:14px}.slide-nav button{all:unset;cursor:pointer;padding:10px 12px;font:700 15px/1 "Instrument Sans";color:#fff}
.slide-nav .mk{bottom:0}
[data-rm] *{animation-duration:.01ms!important;animation-delay:0ms!important;transition-duration:.01ms!important}
[data-rm] .flip .fi{transition:none}
.tag-no{display:inline-flex;gap:8px;align-items:center;padding:9px 12px;border-radius:9px;border:1px solid #333;font-size:14px;margin:0 8px 8px 0;color:#d8d8d8}
.tag-no s{color:#8a8a8a;text-decoration-color:var(--red);text-decoration-thickness:2px}
table.t{border-collapse:collapse;width:100%;font-size:14px}table.t th,table.t td{padding:9px 10px;border-bottom:1px solid #222;text-align:left}
table.t th{font:700 11px/1 "Archivo Display","Archivo";font-stretch:100%;letter-spacing:.08em;text-transform:uppercase;color:#9a9a9a}
table.t td.n{font-variant-numeric:tabular-nums;text-align:right}
'''

# ============================ BOARD BODIES ============================
def b01_type():
    pz = lambda t, s, extra="": f'<div class="poster" style="font-size:{s}px;{extra}">{t}</div>'
    axis = "".join(f'<div style="display:flex;align-items:baseline;gap:20px;border-bottom:1px solid #222;padding:8px 0"><span class="meta" style="width:150px;color:#9a9a9a">wdth {w} · wght {g}</span>'
                   f'<span style="font-family:\'Archivo Display\';font-weight:{g};font-stretch:{w}%;font-size:54px;line-height:1;text-transform:uppercase">Albastini tuchezee</span></div>'
                   for w, g in ((62, 900), (70, 900), (78, 800), (100, 700), (100, 600)))
    return f'''
<div class="panel th-blue" style="padding:44px 52px 50px">
  <div style="display:flex;justify-content:space-between">{meta("01 · Poster")}{meta("Archivo · wdth 62 · wght 900 · leading .8 · hero · arena · finale","opacity:.75")}</div>
  <div style="margin-top:24px">{pz("Two ways<br>to play.",186)}{pz("One Albastini.",96,"margin-top:14px;color:var(--yellow)")}</div>
</div>
<div style="display:grid;grid-template-columns:1.15fr 1fr;gap:22px;margin-top:22px">
  <div class="panel th-paper" style="padding:40px 44px">
    <div style="display:flex;justify-content:space-between">{meta("02 · Editorial")}{meta("wdth 76 · wght 800 · leading .88","opacity:.6")}</div>
    <div class="edit" style="font-size:78px;margin-top:22px;white-space:nowrap">From the table.</div>
    <div class="edit" style="font-size:78px;color:var(--blue);white-space:nowrap">To the screen.</div>
    <div class="edit" style="font-size:58px;margin-top:34px;white-space:nowrap">Take the game<br>to the <span class="out" style="-webkit-text-stroke:2px #000">table.</span></div>
    <p class="note" style="color:#444;margin:20px 0 0">One word is outlined or tinted per headline — the only "italic" the system needs. Archivo italic is not shipped and stays off.</p>
  </div>
  <div style="display:grid;gap:22px">
    <div class="panel th-night" style="padding:34px 38px">
      <div style="display:flex;justify-content:space-between">{meta("03 · Quiet")}{meta("Instrument Sans · 500 · 28/1.35","opacity:.7")}</div>
      <p class="quiet" style="font-size:30px;margin:20px 0 0;max-width:20ch">The official How to Play guide is inside the Albastini app.</p>
      <p class="quiet" style="font-size:20px;margin:16px 0 0;opacity:.8">Download the app. Tap How to Play on the home screen.</p>
    </div>
    <div class="panel" style="padding:30px 36px;background:#0d0d0d;border:1px solid #262626">
      <div style="display:flex;justify-content:space-between">{meta("04 · Meta")}{meta("wdth 100 · wght 700 · +.09em · tabular","opacity:.6")}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">
        {"".join(f'<span class="meta" style="padding:9px 11px;border-radius:8px;box-shadow:inset 0 0 0 1.5px #444;font-size:12px">{t}</span>' for t in ("Tournament #27","12 Dec 2026","Register in the app","1st place","Dar es Salaam, Tanzania","No. 01 / 03"))}
      </div>
    </div>
  </div>
</div>
<div class="panel th-night" style="margin-top:22px;padding:38px 48px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:34px;align-items:start">
  <div>{meta("05 · Numerals — tabular ON (shipped)")}
    <div class="num" style="font-size:70px;line-height:1;text-align:right;margin-top:16px;max-width:400px;color:var(--yellow)">130,000<br>65,000<br>26,000</div>
    <div class="meta" style="text-align:right;max-width:400px;margin-top:8px;opacity:.7">TSH · digits share one width · columns align</div></div>
  <div>{meta("Proportional (tnum off) — rejected","opacity:.7")}
    <div class="num" style="font-size:70px;line-height:1;text-align:right;margin-top:16px;max-width:400px;font-feature-settings:'tnum' 0;font-variant-numeric:proportional-nums;opacity:.6">130,000<br>65,000<br>26,000</div>
    <div class="meta" style="text-align:right;max-width:400px;margin-top:8px;opacity:.5">digits no longer stack</div></div>
  <div>{meta("Numeral roles")}
    <div style="display:grid;gap:14px;margin-top:16px">
      <div style="display:flex;align-items:baseline;gap:16px"><span class="num out" style="font-size:150px;line-height:.8">27</span><span class="meta">tournament no. · outlined</span></div>
      <div style="display:flex;align-items:baseline;gap:16px"><span class="num" style="font-size:54px">12 DEC 2026</span></div>
      <div style="display:flex;align-items:baseline;gap:16px"><span class="num y" style="font-size:54px">01<span style="opacity:.5"> / 03</span></span><span class="meta">collector index</span></div>
    </div></div>
</div>
<div class="panel" style="margin-top:22px;padding:24px 36px;background:#0d0d0d;border:1px solid #262626">
  {meta("The width axis is the unused instrument — range available inside the one shipped font (61 KB total, no new fonts)")}
  <div style="margin-top:8px">{axis}</div>
</div>'''

def b02_buttons():
    states = [("Normal", ""), ("Hover", "is-hover"), ("Pressed", "is-pressed"), ("Focus", "is-focus"), ("Disabled", "")]
    def row(theme, kind, label):
        cells = ""
        for i, (nm, st) in enumerate(states):
            cells += f'<div style="display:grid;gap:12px;justify-items:start">{meta(nm,"opacity:.7")}{btn(kind,label,st,disabled=(nm=="Disabled"))}</div>'
        return f'<div class="panel th-{theme} mx" style="padding:22px 24px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px;align-items:end">{cells}</div>'
    return f'''
<div style="display:grid;gap:14px">
  {row("blue","app","Download the app")}
  {row("blue","cards","Card availability")}
  {row("paper","app","Download the app")}
  {row("paper","cards","Card availability")}
  {row("night","app","Play on the app")}
  {row("night","cards","Card availability")}
</div>
<div style="display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:18px;margin-top:22px">
  <div class="panel th-blue" style="padding:26px 30px">{meta("Anatomy")}
    <ul class="note" style="color:#dfe5ff;margin:12px 0 0;padding-left:18px;line-height:1.75">
      <li><b>Edge</b> — 12px radius (the card corner), not a pill</li><li><b>Keyline</b> — 1.5px inset, like a printed card border</li>
      <li><b>Chip</b> — the 11-point disc carries the arrow (the one non-generic part)</li><li><b>Hover</b> — fill sweeps in 240ms, label +3px, chip +4px and tilts −12° like a dealt card</li>
      <li><b>Press</b> — 1px down, inner shadow; <b>Focus</b> — 3px ring in the scene's contrast colour</li></ul></div>
  <div class="panel th-night" style="padding:26px 30px;display:grid;gap:16px;align-content:start">{meta("Related controls (same geometry)")}
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <div class="seg" style="--seg-on:#000"><button aria-pressed="true" style="background:#fff"><span>EN</span></button><button aria-pressed="false"><span>SW</span></button></div>
      <button class="sqbtn" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="sqbtn" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="sqbtn" disabled aria-label="Next (disabled)"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">{btn("app","Get the app","", small=True)}{btn("cards","Cards","",small=True)}</div></div>
  <div class="panel th-paper" style="padding:26px 30px;display:grid;gap:14px;align-content:start">{meta("Live — hover, press, Tab to focus")}
    <div style="display:flex;gap:14px;flex-wrap:wrap">{btn("app","Play on the app")}{btn("cards","Physical cards")}</div>
    <p class="note" style="color:#444;margin:0">Contrast: black on yellow 16:1 · white ring on blue 8:1 · blue ring on paper 8:1 · yellow ring on night 12.5:1.</p></div>
</div>'''

NAV_LINKS = ["Play", "How to play", "Tournaments", "Physical cards"]
def nav_bar(theme, active, scene, en_on=True):
    links = "".join(f'<a href="#" data-i="{i}" {"aria-current=\"true\"" if i==active else ""}>{t}</a>' for i, t in enumerate(NAV_LINKS))
    return (f'<nav class="nav nav-{theme}" aria-label="demo"><div class="logo"><img src="@@mark@@" alt="">'
            f'<span class="meta scene">{scene}</span></div><div class="links" data-links>{links}<svg class="mk" viewBox="0 0 40 40"><use href="#chip"/></svg></div>'
            f'<div class="seg"><button aria-pressed="true"><span>EN</span></button><button aria-pressed="false"><span>SW</span></button></div>'
            f'{btn("app","Download the app","",small=True)}</nav>')
def b03_nav():
    mobile_closed = f'''<div class="fr" style="width:375px;height:300px;background:var(--blue);padding:14px">
      <div class="nav nav-hero" style="height:56px;padding:0 8px 0 12px;gap:12px"><div class="logo"><img src="@@mark@@" alt="" style="width:34px;height:34px"><span class="meta scene" style="font-size:11px">01 · Play</span></div>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center">{btn("app","Get the app","",small=True).replace('class="btn btn-app sm"','class="btn btn-app sm" style="--h:40px;--fs:13px;padding-left:12px;gap:8px"')}
        <button class="sqbtn" style="width:40px;height:40px" aria-label="Menu"><svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></div></div>
      <div class="poster" style="font-size:66px;margin-top:40px">Two ways<br>to play.</div></div>'''
    overlay = f'''<div class="fr" style="width:375px;height:812px;background:var(--blue);display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px"><img src="@@mark@@" alt="" style="width:40px;height:40px">
        <button class="sqbtn" style="color:#fff" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></div>
      <div style="padding:10px 22px;display:grid">{"".join(f'<div style="display:flex;align-items:center;gap:14px;border-bottom:1px solid rgb(255 255 255/.22);padding:14px 0"><span style="width:24px;height:24px;color:var(--yellow);--chip-ring:#000;opacity:{1 if i==2 else 0}"><svg viewBox="0 0 40 40" width="24" height="24"><use href="#chip"/></svg></span><span class="poster" style="font-size:50px;line-height:.9;white-space:nowrap;{"color:var(--yellow)" if i==2 else ""}">{t}</span></div>' for i,t in enumerate(["Play","How to play","Tournaments","Physical cards"]))}</div>
      <div style="margin-top:auto;padding:20px 22px 30px;display:grid;gap:18px">
        <div class="seg" style="--seg-on:#000;width:fit-content;color:#fff"><button aria-pressed="true" style="background:#fff"><span>EN</span></button><button aria-pressed="false"><span>SW</span></button></div>
        {btn("app","Download the app","").replace('class="btn btn-app "','class="btn btn-app " style="width:100%;justify-content:space-between"')}
        <div class="poster y" style="font-size:30px;line-height:.9;white-space:nowrap">INGIA UWANJANI TUCHEZE.</div></div></div>'''
    return f'''
<div style="display:grid;gap:16px">
  <div class="stage" style="background:var(--blue)"><div style="display:flex;justify-content:space-between;margin-bottom:12px">{meta("Theme 1 · Hero blue — transparent, keyline only")}{meta("scene theme = blue","opacity:.7")}</div>{nav_bar("hero",0,"01 · Play")}
    <div class="poster" style="font-size:90px;margin-top:34px">Two ways to play.</div></div>
  <div class="stage" style="background:#fff;color:#000"><div style="display:flex;justify-content:space-between;margin-bottom:12px;color:#000">{meta("Theme 2 · Paper — ink keyline, lifted shadow")}{meta("scene theme = paper","opacity:.6")}</div>{nav_bar("paper",1,"03 · How to play")}
    <div class="edit" style="font-size:80px;margin-top:34px;color:#000">Your next move starts here.</div></div>
  <div class="stage arena"><div style="display:flex;justify-content:space-between;margin-bottom:12px">{meta("Theme 3 · Night arena — keyline at 28%")}{meta("scene theme = night","opacity:.7")}</div>{nav_bar("night",2,"04 · Tournaments")}
    <div class="poster" style="font-size:96px;margin-top:34px">Play for <span class="y">the win.</span></div></div>
</div>
<div style="display:grid;grid-template-columns:1fr auto auto;gap:26px;margin-top:26px;align-items:start">
  <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:26px 30px">{meta("The 11-point active marker — live (click a link)")}
    <div class="th-night" style="margin-top:18px;border-radius:14px;padding:14px 18px;color:#fff;--chip-ring:#000"><div class="links" id="liveNav" style="display:flex;gap:6px;position:relative;padding-bottom:18px" data-links>{"".join(f'<a href="#" data-i="{i}" {"aria-current=\"true\"" if i==0 else ""} style="color:#fff;text-decoration:none;padding:12px 14px;font:700 17px/1 Instrument Sans">{t}</a>' for i,t in enumerate(NAV_LINKS))}<svg class="mk" style="width:16px;height:16px;bottom:0" viewBox="0 0 40 40"><use href="#chip"/></svg></div></div>
    <ul class="note" style="margin:14px 0 0;padding-left:18px;line-height:1.7"><li>Replaces the underline. A yellow disc with the chip's dashed ring slides (SLIDE, 320ms) to the current scene — scroll-driven in build.</li><li>On paper it gains a 1.5px ink edge so it never disappears into white.</li><li>No scene label or marker uses colour alone: link is also bold + <code>aria-current</code>.</li></ul></div>
  <div><div style="margin-bottom:8px">{meta("Mobile · compact bar")}</div>{scaled(mobile_closed,375,300,.8)}</div>
  <div><div style="margin-bottom:8px">{meta("Mobile · overlay open")}</div>{scaled(overlay,375,812,.6)}</div>
</div>'''


# ---------------- champion covers ----------------
def cover(rank, name, loc, prize, mode, src, scale=1.0, num_size=470, stroke="var(--yellow)", photo_w=430, crown=False):
    plate = ('<svg class="cv-wave" viewBox="0 0 380 230" preserveAspectRatio="none" aria-hidden="true">'
             '<path d="M0 62 C 80 14, 170 4, 230 36 S 340 78, 380 44 L380 230 L0 230 Z" fill="var(--night)"/>'
             '<path d="M0 62 C 80 14, 170 4, 230 36 S 340 78, 380 44" fill="none" stroke="var(--yellow)" stroke-width="1.6"/></svg>')
    if mode == "cut":
        photo = f'<img class="cv-photo" alt="" src="@@{src}@@" style="width:{photo_w}px;bottom:0">'
        numz = "z-index:1"
    else:
        photo = f'<div class="cv-win"><img alt="" src="@@{src}@@"></div>'
        numz = "z-index:4"
    crown_html = '<img src="@@crown@@" alt="" style="position:absolute;z-index:7;left:50%;top:18px;width:38px;margin-left:-19px">' if crown else ""
    return f'''<article class="cover" aria-label="{name}">
  <div class="cv-num" style="font-size:{num_size}px;-webkit-text-stroke-color:{stroke};{numz}">{rank}</div>
  {photo}{plate}<div class="cv-key"></div>{crown_html}
  <div class="cv-top">{meta(f"No. 0{rank} / 03")}{meta("T#26 · 26 Sep 2026")}</div>
  <div class="cv-pl"><span class="pl-chip"><svg viewBox="0 0 40 40" aria-hidden="true"><use href="#chip"/></svg>{ {1:"1ST PLACE",2:"2ND PLACE",3:"3RD PLACE"}[rank] }</span>
    <div class="poster nm">{name}</div>
    <span class="num pz" style="white-space:nowrap">{prize}</span><span class="meta loc">{loc}</span></div>
</article>'''
def covers():
    return (cover(1,"David Sanya","Dar es Salaam, Tanzania","130,000 TSH","cut","david",num_size=500,photo_w=430,crown=True) +
            cover(2,"Bedadi","Kilimanjaro, Tanzania","65,000 TSH","scene","bedadi",num_size=430,stroke="rgb(255 255 255/.86)") +
            cover(3,"MJeshi","Iringa, Tanzania","26,000 TSH","cut","mjeshi",num_size=380,stroke="rgb(255 255 255/.6)",photo_w=470))
def b04_champions():
    mobile = f'<div class="fr" style="width:375px;height:640px;background:var(--night)"><div style="position:absolute;left:24px;top:30px;width:380px;transform:scale(.8);transform-origin:0 0">{cover(2,"Bedadi","Kilimanjaro, Tanzania","65,000 TSH","scene","bedadi",num_size=430,stroke="rgb(255 255 255/.86)")}</div><div style="position:absolute;left:340px;top:30px;transform:scale(.8);transform-origin:0 0">{cover(3,"MJeshi","Iringa, Tanzania","26,000 TSH","cut","mjeshi",num_size=380,stroke="rgb(255 255 255/.6)",photo_w=470)}</div><div style="position:absolute;left:0;right:0;bottom:30px;display:flex;justify-content:center;gap:12px;align-items:center"><button class="sqbtn" aria-label="Prev" style="width:44px;height:44px"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span style="display:flex;gap:6px"><i style="width:10px;height:10px;border-radius:50%;background:rgb(255 255 255/.4)"></i><i style="width:30px;height:10px;border-radius:5px;background:var(--yellow)"></i><i style="width:10px;height:10px;border-radius:50%;background:rgb(255 255 255/.4)"></i></span><button class="sqbtn" aria-label="Next" style="width:44px;height:44px"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>'
    return f'''
<div class="panel arena" style="padding:46px 40px 40px">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:26px"><div><div class="edit" style="font-size:54px">They played. They won.</div>
    <div class="meta" style="margin-top:10px;opacity:.8">Tournament #26 · Saturday, 26 September 2026</div></div>{meta("3 real photographs · 2 photo modes · 1 cover system","opacity:.8")}</div>
  <div style="display:flex;gap:16px;justify-content:center;transform:scale(.945);transform-origin:50% 0;height:510px">{covers()}</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:22px">
  <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:28px 32px">{meta("How uneven photography becomes intentional")}
    <ol class="note" style="color:#ccc;line-height:1.8;padding-left:20px;margin:14px 0 0"><li><b>Cut-out on plate</b> (David, MJeshi) — figure bottom-anchored, shoulders bleed past the keyline, rank numeral sits <i>behind</i> them.</li>
    <li><b>Scene in a window</b> (Bedadi) — his real photo, edge-graded into arena blue by a vignette; numeral sits <i>in front</i>, outlined, so the face stays clear.</li>
    <li><b>Shared</b> — keyline, wave-cut nameplate, rank numeral, placement chip, collector index, prize in tabular numerals. Any future photo picks one of the two modes.</li>
    <li><b>Rank</b> by scale (500 / 430 / 380 px numeral) and keyline contrast; the crown marks first place only. No medal colours.</li></ol></div>
  <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:28px 32px"><div style="display:flex;gap:26px;align-items:flex-start"><div>{meta("Mobile — native swipe, next cover peeks")}<div style="margin-top:12px">{scaled(mobile,375,640,.62)}</div></div>
    <div class="note" style="padding-top:26px"><p style="margin:0 0 10px"><b style="color:#fff">What these photos can't do:</b> David is 720×880 (backlit selfie, soft at 2×); Bedadi's crop is 480×600; MJeshi was separated from a poster. The frame unifies them; it can't repair them. Better originals drop in with no redesign.</p>
    <p style="margin:0"><b style="color:#fff">Tried and rejected:</b> auto-cutting Bedadi — the model kept his white throne chair and gold drape (a throne is off-brand), so he stays a real scene.</p></div></div></div>
</div>'''

# ---------------- fixture board ----------------
def fixture_desktop(postponed=False):
    if postponed:
        date = '<div class="poster" style="font-size:64px;color:#fff;line-height:.86">New date<br>to be announced.</div>'
        status = f'<span class="pl-chip" style="background:var(--red);color:#fff"><svg viewBox="0 0 40 40"><use href="#chip"/></svg>POSTPONED</span>'
        lines = ""
    else:
        dot = '<svg class="dot" viewBox="0 0 40 40"><use href="#chip"/></svg>'
        date = (f'<div class="meta" style="margin-bottom:10px">Saturday</div><div style="display:flex;align-items:center;gap:14px"><span class="cell num">12</span>{dot}<span class="cell num">DEC</span>{dot}<span class="cell num">2026</span></div>')
        status = ""
        lines = (f'<div style="display:grid;gap:12px;margin-top:26px"><div style="display:flex;gap:12px;align-items:center"><svg class="dot" viewBox="0 0 40 40"><use href="#chip"/></svg><span class="meta" style="font-size:14px">Register in the Albastini app</span></div>'
                 f'<div style="display:flex;gap:12px;align-items:center;opacity:.75"><svg class="dot" viewBox="0 0 40 40" style="opacity:.6"><use href="#chip"/></svg><span class="meta" style="font-size:14px">Start time · to be announced</span></div></div>')
    return f'''<div style="display:grid;gap:6px">
  <div style="display:flex;gap:14px;align-items:center">{meta("Next tournament","color:var(--yellow)")}{status}</div>
  <div style="position:relative"><div class="meta" style="position:absolute;left:6px;top:14px;z-index:2">Tournament</div><div class="num out" style="font-size:300px;line-height:.74;padding-top:30px;letter-spacing:-.01em">27</div></div>
    <div style="margin-top:6px">{date}</div>{lines}
  <div style="margin-top:26px">{btn("app","Play on the app","")}</div></div>'''
def b05_fixture():
    wave = '<svg aria-hidden="true" viewBox="0 0 1180 90" preserveAspectRatio="none" style="position:absolute;left:0;bottom:0;width:100%;height:90px;opacity:.5"><path d="M0 60 C 200 10, 420 0, 620 38 S 1000 92, 1180 30" fill="none" stroke="var(--yellow)" stroke-width="1.6"/></svg>'
    mob = f'''<div class="fr arena" style="width:375px;height:780px;padding:34px 24px;background:linear-gradient(to bottom,var(--blue) 0%,var(--night) 62%)">
      <div class="poster" style="font-size:78px">Play for<br><span class="y">the win.</span></div>
      <div style="margin-top:34px;display:grid;gap:8px"><div class="meta y">Next tournament</div>
        <div style="position:relative"><div class="meta" style="position:absolute;left:4px;top:8px">Tournament</div><div class="num out" style="font-size:220px;line-height:.74;padding-top:22px">27</div></div>
        <div class="meta">Saturday</div><div style="display:flex;align-items:center;gap:9px"><span class="cell sm num">12</span><svg class="dot" viewBox="0 0 40 40" style="width:10px;height:10px"><use href="#chip"/></svg><span class="cell sm num">DEC</span><svg class="dot" viewBox="0 0 40 40" style="width:10px;height:10px"><use href="#chip"/></svg><span class="cell sm num">2026</span></div>
        <div style="display:grid;gap:8px;margin-top:14px"><div style="display:flex;gap:10px;align-items:center"><svg class="dot" viewBox="0 0 40 40" style="width:12px;height:12px"><use href="#chip"/></svg><span class="meta" style="font-size:12px">Register in the Albastini app</span></div><div style="display:flex;gap:10px;align-items:center;opacity:.75"><svg class="dot" viewBox="0 0 40 40" style="width:12px;height:12px;opacity:.6"><use href="#chip"/></svg><span class="meta" style="font-size:12px">Start time · to be announced</span></div></div>
        <div style="margin-top:18px">{btn("app","Play on the app","")}</div></div></div>'''
    return f'''
<div class="panel arena" style="padding:54px 56px 96px;min-height:700px">{wave}
  <div style="display:grid;grid-template-columns:.9fr 1.1fr;gap:40px;align-items:start;position:relative">
    <div><div class="poster" style="font-size:128px;white-space:nowrap">Play for<br><span class="y">the win.</span></div><p class="quiet" style="font-size:24px;max-width:22ch;margin:26px 0 0;opacity:.92">Albastini tournaments bring players together to compete for the top spot.</p></div>
    <div style="padding-top:20px">{fixture_desktop()}</div></div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:26px;margin-top:22px;align-items:start">
  <div>{meta("Mobile · stacked, same typography")}<div style="margin-top:12px">{scaled(mob,375,780,.7)}</div></div>
  <div style="display:grid;gap:22px"><div class="panel arena" style="padding:34px 38px">{meta("State · postponed, no new date")}<div style="margin-top:14px;transform-origin:0 0">{fixture_desktop(True).replace('font-size:300px','font-size:190px').replace('font-size:64px','font-size:44px')}</div></div>
    <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:26px 30px"><ul class="note" style="margin:0;padding-left:18px;line-height:1.75">
      <li><b style="color:#fff">No box.</b> The old black rectangle is gone: the numeral, date cells and lines sit directly in the arena, on a wave stroke.</li>
      <li><b style="color:#fff">Only verified fields show:</b> #27, 12 Dec 2026, "register in the app". Start time shows "to be announced" and <i>no countdown</i> until a time is verified; then the time + countdown slot fills in automatically.</li>
      <li><b style="color:#fff">Mode is not shown</b> — it isn't verified for #27.</li>
      <li>The weekday is computed from the date (12 Dec 2026 is a Saturday), not typed.</li></ul></div></div>
</div>'''

# ---------------- prize ladder ----------------
def bar(w, h, fill):
    d = f"M0 0 H{w-26:.1f} C{w+8:.1f} {h*.26:.1f}, {w-50:.1f} {h*.7:.1f}, {w-12:.1f} {h} H0 Z"
    return f'<svg width="{w+12:.0f}" height="{h}" viewBox="0 0 {w+12:.0f} {h}" aria-hidden="true"><path d="{d}" fill="{fill}"/></svg>'
def ladder(maxw=640, h=84, fs=64, numfs=150, gap=18, cls="ladder"):
    rows = [(1, 130000, "var(--yellow)", "1ST"), (2, 65000, "#fff", "2ND"), (3, 26000, "rgb(255 255 255/.72)", "3RD")]
    out = ""
    for r, amt, fill, lab in rows:
        w = round(maxw * amt / 130000); pr = f"{amt:,}"
        stroke = "var(--yellow)" if r == 1 else "rgb(255 255 255/.8)"
        out += (f'<li style="display:flex;align-items:center;gap:{gap}px;margin:0 0 {gap}px"><span class="num" style="font-size:{numfs}px;line-height:.78;width:{numfs*.62:.0f}px;color:transparent;-webkit-text-stroke:2px {stroke};flex:none">{r}</span>'
                f'<div class="bar b{r}" style="width:{w+12}px;height:{h}px">{bar(w,h,fill)}<span class="meta" style="position:absolute;left:18px;top:50%;transform:translateY(-50%);color:#000;font-size:{max(11,h//7)}px">{lab}</span></div>'
                f'<span class="num" style="margin-left:auto;font-size:{fs}px;line-height:1;color:{"var(--yellow)" if r==1 else "#fff"}">{pr}<span class="meta" style="font-size:{max(11,fs//4.4):.0f}px;margin-left:8px;opacity:.8">TSH</span></span></li>')
    return f'<ol class="{cls}" style="list-style:none;margin:0;padding:0">{out}</ol>'
def b06_ladder():
    mob = f'<div class="fr arena" style="width:375px;height:520px;padding:30px 20px;background:var(--night)">{meta("Prize ladder","color:var(--yellow)")}<div style="margin-top:22px">{ladder(maxw=104,h=58,fs=24,numfs=78,gap=12,cls="ladder mob")}</div></div>'
    return f'''
<div class="panel arena" style="padding:48px 56px 38px;background:var(--night)">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:34px"><div><div class="edit" style="font-size:60px">The prize ladder</div><div class="meta" style="margin-top:10px;opacity:.8">Recurring structure · every Albastini tournament</div></div>
    <button class="btn btn-cards sm" data-replay=".ladder" type="button"><span class="lab">Replay</span><span class="chip">{CHIP}<svg class="arr" viewBox="0 0 24 24"><use href="#arrow"/></svg></span></button></div>
  {ladder()}
  <div class="meta" style="opacity:.7;margin-top:6px">Bar length is proportional: 26k = 20% · 65k = 50% · 130k = 100% of the longest bar</div></div>
<div style="display:grid;grid-template-columns:auto 1fr;gap:26px;margin-top:22px;align-items:start">
  <div>{meta("Mobile")}<div style="margin-top:12px">{scaled(mob,375,520,.78)}</div></div>
  <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:28px 32px"><ul class="note" style="margin:0;padding-left:18px;line-height:1.8">
    <li><b style="color:#fff">A ladder, not a pricing table.</b> Three columns of cards would read as a plan comparison. One axis of length reads as ranking.</li>
    <li><b style="color:#fff">Data-driven.</b> Rendered from <code>tournamentPrizeStructure</code> — change the amounts there and lengths, labels and numbers follow. Nothing is typed twice.</li>
    <li><b style="color:#fff">The wave is the bar's end</b> — the same curve that crosses every card face.</li>
    <li><b style="color:#fff">Tabular numerals</b> right-align the prizes into a true column (see Board 01).</li>
    <li><b style="color:#fff">Motion:</b> one SLIDE per bar (scaleX, 620ms, 90ms stagger), once on entry; numbers never count up. Reduced motion: bars appear at full length.</li>
    <li><b style="color:#fff">Accessibility:</b> real ordered list with the amounts as text; the bars are decorative.</li></ul></div>
</div>'''

# ---------------- hero DEAL storyboard ----------------
DOT = '<svg class="dot" viewBox="0 0 40 40"><use href="#chip"/></svg>'
def hero_text_d():
    return (f'<div style="position:absolute;left:44px;right:44px;top:30px">{nav_bar("hero",0,"01 · Play")}</div>'
            f'<div style="position:absolute;left:80px;top:196px;z-index:9"><div class="poster" style="font-size:132px">Two ways<br>to play.</div>'
            f'<div class="poster y" style="font-size:80px;margin-top:16px">One Albastini.</div>'
            f'<p class="quiet" style="font-size:28px;margin:26px 0 0;max-width:15ch;opacity:.92">Cards around the table. Albastini on your phone.</p>'
            f'<div style="display:flex;gap:14px;margin-top:30px">{btn("app","Download the app")}{btn("cards","Card availability")}</div></div>')
def deal_frame_d(t):
    fin = {"black": (870, 410, -7, 2, 0), "red": (745, 495, -19, 1, 90), "blue": (985, 470, 6, 3, 180)}
    deck = (1395, 965); out = ""
    for nm, (x, y, r, z, d) in fin.items():
        p = clamp((t - d) / 520); e = ease(p)
        cx = lerp(deck[0], x, e); cy = lerp(deck[1], y, e) - 150 * math.sin(math.pi * p); cr = lerp(30, r, e)
        out += card(nm, cx, cy, 250, cr, z)
    pp = clamp((t - 420) / 560); pe = ease(pp)
    ph = phone(1235, 150 + 130 * (1 - pe), 300 * lerp(.94, 1, pe), lerp(0, 5, pe), 6 if pp > .45 else 0, f"opacity:{clamp(pp*2.2):.2f}") if pp > 0 else ""
    return f'<div class="fr" style="width:1440px;height:900px">{hero_text_d()}{out}{ph}</div>'
def deal_frame_m(t):
    fin = {"black": (150, 590, -7, 2, 0), "red": (88, 640, -19, 1, 90), "blue": (192, 625, 6, 3, 180)}
    deck = (410, 850); out = ""
    for nm, (x, y, r, z, d) in fin.items():
        p = clamp((t - d) / 520); e = ease(p)
        out += card(nm, lerp(deck[0], x, e), lerp(deck[1], y, e) - 90 * math.sin(math.pi * p), 122, lerp(30, r, e), z)
    pp = clamp((t - 420) / 560); pe = ease(pp)
    ph = phone(268, 470 + 90 * (1 - pe), 150 * lerp(.94, 1, pe), lerp(0, 5, pe), 6 if pp > .45 else 0, f"opacity:{clamp(pp*2.2):.2f}") if pp > 0 else ""
    txt = (f'<div style="position:absolute;left:24px;right:24px;top:30px;z-index:9"><div class="poster" style="font-size:84px">Two ways<br>to play.</div><div class="poster y" style="font-size:46px;margin-top:10px">One Albastini.</div>'
           f'<div style="display:grid;gap:10px;margin-top:22px">{btn("app","Download the app").replace("class=\"btn btn-app \"","class=\"btn btn-app \" style=\"width:100%;justify-content:space-between\"")}'
           f'{btn("cards","Card availability").replace("class=\"btn btn-cards \"","class=\"btn btn-cards \" style=\"width:100%;justify-content:space-between\"")}</div></div>')
    return f'<div class="fr" style="width:375px;height:812px">{txt}{out}{ph}</div>'
def b07_deal():
    T = [(0, "Resting", "Headline and both CTAs are already there. The deck waits at the lower-right corner — nothing is hidden, nothing delays reading."),
         (180, "First card dealt", "Black ace leaves the deck on an arc (ease-out, no overshoot)."),
         (340, "Second and third follow", "80–90ms stagger. Three controlled moves, not a shower."),
         (560, "The hand settles", "Cards land; shadows deepen as they touch the table. The phone starts rising from behind the hand."),
         (980, "≈ 1 second", "Phone crosses in front of the blue ace's edge. Final composition = today's hero. Done; nothing keeps moving.")]
    d = "".join(f'<div>{scaled(deal_frame_d(t),1440,900,.26,"panel")}<div class="frame-cap"><b>{i+1}</b><span><b style="font:700 11px/1 Archivo Display;letter-spacing:.08em;color:#fff;text-transform:uppercase">{t} ms · {nm}</b><br>{cap}</span></div></div>' for i, (t, nm, cap) in enumerate(T))
    m = "".join(f'<div>{scaled(deal_frame_m(t),375,812,.5,"panel")}<div class="frame-cap"><b>{i+1}</b><span>{t} ms</span></div></div>' for i, (t, nm, cap) in enumerate(T))
    legend = '''<div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:22px 24px;width:374px"><div class="meta">DEAL · tokens</div><div class="tok" style="margin-top:12px">
      <b>Duration</b><span>520 ms per card</span><b>Stagger</b><span>90 ms</span><b>Easing</b><span>cubic-bezier(.16,1,.3,1) — fast out, settles, no overshoot</span>
      <b>Path</b><span>deck (lower-right) → hand, 150px arc lift</span><b>Order</b><span>black, red, blue, then phone at 420 ms</span><b>Animates</b><span>transform only</span>
      <b>LCP</b><span>unchanged — the H1 is the largest paint and is visible at 0 ms</span><b>Reduced motion</b><span>final composition, no entrance</span></div></div>'''
    return f'''<div style="display:grid;grid-template-columns:repeat(3,374px);gap:22px 22px;justify-content:space-between">{d}{legend}</div>
<div style="margin-top:30px">{meta("Mobile — own composition, headline + both CTAs first, hand below, phone centred-right (5 frames)")}
  <div style="display:grid;grid-template-columns:repeat(5,188px);gap:22px;margin-top:14px;justify-content:space-between">{m}</div></div>
<div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:22px 28px;margin-top:22px"><ul class="note" style="margin:0;padding-left:18px;line-height:1.75"><li><b style="color:#fff">Hero is a full composition (D5):</b> at 1440×900 the hero now fills the viewport. On small screens priority is headline → both experiences → primary CTA, not forced height (mobile frame is 812 tall and fits all three).</li>
  <li><b style="color:#fff">Hero cards stay decorative</b> — no cursor token, no extra tab stops (D6). Desktop pointer depth is a separate, restrained layer (3 rates + phone), shown in the build, not a storyboard.</li></ul></div>'''

# ---------------- Table -> Screen storyboard ----------------
FAN = ["black", "red", "blue", "green", "teal"]
def ts_text(p, mobile=False):
    fs = 52 if mobile else 124; l = 24 if mobile else 80; t = 36 if mobile else 96
    o1 = lerp(1, .3, clamp((p - .35) / .5)); o2 = .28 + .72 * clamp((p - .4) / .5)
    c2 = "var(--yellow)" if p >= .75 else "#fff"
    return (f'<div style="position:absolute;left:{l}px;top:{t}px;z-index:9"><div class="poster" style="font-size:{fs}px;opacity:{o1:.2f}">From the table.</div>'
            f'<div class="poster" style="font-size:{fs}px;margin-top:{8 if mobile else 14}px;opacity:{o2:.2f};color:{c2}">To the screen.</div></div>')
def ts_frame_d(p):
    s = 1 - clamp(p / .5); q = clamp((p - .5) / .5); eq = ease(q)
    cx0, cy0 = 560, 610; cx = lerp(cx0, 380, eq); cy = lerp(cy0, 706, eq); vw = lerp(236, 214, eq)
    cards = ""
    for i, nm in enumerate(FAN):
        k = i - 2
        x = cx + k * 150 * s + k * 4 * (1 - s); y = cy + abs(k) * 30 * s - (k + 2) * 3 * (1 - s) - 0
        cards += card(nm, x, y, vw, k * 15 * s + k * .6 * (1 - s), 10 - abs(k) if nm != "blue" else 12)
    pp = clamp((p - .45) / .55); pe = ease(pp)
    ph = phone(lerp(560, 1010, pe), lerp(420, 150, pe), 330, lerp(0, 4, pe), 3, "") if pp > 0 else ""
    bh = lerp(0, 300, clamp((p - .5) / .5))
    band = (f'<svg style="position:absolute;left:0;bottom:0;width:1440px;height:{bh+60:.0f}px;z-index:2" viewBox="0 0 1440 {bh+60:.0f}" preserveAspectRatio="none"><path d="M0 52 C 240 4, 520 0, 760 34 S 1220 86, 1440 28 L1440 {bh+60:.0f} L0 {bh+60:.0f} Z" fill="var(--blue)"/></svg>' if bh > 4 else "")
    return (f'<div class="fr" style="width:1440px;height:900px;background:#111"><img src="@@table@@" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:46% 60%">'
            f'<div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgb(0 0 0/.35),rgb(0 0 0/.78))"></div>{ts_text(p)}{band}{ph}{cards}</div>')
def ts_frame_m(p):
    s = 1 - clamp(p / .5); q = clamp((p - .5) / .5); eq = ease(q)
    cx = lerp(187, 108, eq); cy = lerp(500, 690, eq); vw = lerp(108, 104, eq); cards = ""
    for i, nm in enumerate(FAN):
        k = i - 2
        cards += card(nm, cx + k * 62 * s + k * 3 * (1 - s), cy + abs(k) * 16 * s - (k + 2) * 2.5 * (1 - s), vw, k * 15 * s + k * .5 * (1 - s), 10 - abs(k) if nm != "blue" else 12)
    pp = clamp((p - .45) / .55); pe = ease(pp)
    ph = phone(lerp(187, 250, pe), lerp(420, 330, pe), 170, lerp(0, 4, pe), 3, "") if pp > 0 else ""
    bh = lerp(0, 330, clamp((p - .5) / .5))
    band = (f'<svg style="position:absolute;left:0;bottom:0;width:375px;height:{bh+40:.0f}px;z-index:2" viewBox="0 0 375 {bh+40:.0f}" preserveAspectRatio="none"><path d="M0 34 C 70 4, 150 0, 210 22 S 320 56, 375 20 L375 {bh+40:.0f} L0 {bh+40:.0f} Z" fill="var(--blue)"/></svg>' if bh > 4 else "")
    return (f'<div class="fr" style="width:375px;height:812px;background:#111"><img src="@@table@@" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:46% 60%">'
            f'<div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgb(0 0 0/.35),rgb(0 0 0/.8))"></div>{ts_text(p,True).replace("<div class=\"poster\" style=\"font-size:52px","<div class=\"poster\" style=\"white-space:nowrap;font-size:52px")}{band}{ph}{cards}</div>')
def b08_table():
    P = [(0, "The table", "Five real cards fanned on the real table. 'FROM THE TABLE.' leads."),
         (.25, "The fan tightens", "Cards draw together; the headline holds."),
         (.5, "A squared deck", "Edges align into one physical deck. 'FROM' starts to dim, 'TO THE SCREEN.' wakes."),
         (.75, "Hand-off", "The phone slides out from behind the deck. The blue wave rises under it."),
         (1, "The screen", "Deck stays as a base at lower-left. 'TO THE SCREEN.' resolves in yellow. The app is real, the cards are real.")]
    d = "".join(f'<div>{scaled(ts_frame_d(p),1440,900,.26,"panel")}<div class="frame-cap"><b>{i+1}</b><span><b style="font:700 11px/1 Archivo Display;letter-spacing:.08em;color:#fff;text-transform:uppercase">{int(p*100)}% · {nm}</b><br>{cap}</span></div></div>' for i, (p, nm, cap) in enumerate(P))
    m = "".join(f'<div>{scaled(ts_frame_m(p),375,812,.5,"panel")}<div class="frame-cap"><b>{i+1}</b><span>{int(p*100)}%</span></div></div>' for i, (p, nm, cap) in enumerate(P))
    legend = '''<div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:22px 24px;width:374px"><div class="meta">DECK → HAND-OFF · rules</div><div class="tok" style="margin-top:12px">
      <b>Not a morph</b><span>card (1:1.4) → phone (~1:1.8) would distort both; owner decision D4</span>
      <b>Length</b><span>desktop ≈ 1.6 viewports of native scroll; mobile ≈ 1.2</span><b>Pinning</b><span>native sticky only; no scroll-jacking; never > 1 viewport</span>
      <b>Driven by</b><span>CSS scroll timelines (Chrome/Edge, Safari 26, Firefox 159) + the existing JS progress variable as fallback</span>
      <b>Animates</b><span>transform + opacity; wave rises by scaleY (no animated masks)</span>
      <b>Reduced motion / no JS</b><span>static end-state: both experiences visible together</span></div></div>'''
    return f'''<div style="display:grid;grid-template-columns:repeat(3,374px);gap:22px;justify-content:space-between">{d}{legend}</div>
<div style="margin-top:30px">{meta("Mobile — separate choreography: fan fills the first screen → short scroll → phone enters beside the deck (5 frames)")}
  <div style="display:grid;grid-template-columns:repeat(5,188px);gap:22px;margin-top:14px;justify-content:space-between">{m}</div></div>'''

# ---------------- card geometry ----------------
def b09_geometry():
    C = REPORT["cards"]; bw, bh = REPORT["box"]["w"], REPORT["box"]["h"]
    rows = "".join(f'<tr><td>{c["id"].split("_",1)[1][:22]}</td><td>{c["kind"]}</td><td class="n">{c["source"]["w"]}×{c["source"]["h"]}</td><td class="n">{c["source"]["ratio"]:.3f}</td><td class="n">{c["scale"]:.3f}{" ↑" if c["upscaled"] else ""}</td><td class="n">{c["placed"]["w"]}×{c["placed"]["h"]}</td><td class="n">{c["cropPct"]}%</td></tr>' for c in C)
    pw = [c["placed"]["w"] for c in C]; ph_ = [c["placed"]["h"] for c in C]; sw = [c["source"]["w"] for c in C]; sr = [c["source"]["ratio"] for c in C]
    after_w = (max(pw) - min(pw)) / min(pw) * 100; after_h = (max(ph_) - min(ph_)) / min(ph_) * 100
    before_w = (max(sw) - min(sw)) / min(sw) * 100; before_r = (max(sr) - min(sr)) / min(sr) * 100
    outlines = "".join(f'<rect x="{(1024-c["placed"]["w"])/2:.0f}" y="{(1536-c["placed"]["h"])/2:.0f}" width="{c["placed"]["w"]}" height="{c["placed"]["h"]}" rx="52" fill="none" stroke="{"#ff4b3a" if c["kind"]=="back" else "rgb(255 225 26/.75)"}" stroke-width="{5 if c["kind"]=="back" else 3}"/>' for c in C)
    thumbs = "".join(f'<div style="text-align:center"><div style="width:96px;height:144px;background:rgb(255 255 255/.04);border-radius:8px;position:relative"><img src="@@{n}@@" alt="" style="width:100%;height:100%;object-fit:contain"></div></div>' for n in ["black","red","blue","green","purple","teal","orange","giraffes","back"])
    gw, gh = 300, 450
    gbw, gbh = gw * bw / 1024, gh * bh / 1536
    guide = f'<div class="guide" style="left:{(gw-gbw)/2:.1f}px;top:{(gh-gbh)/2:.1f}px;width:{gbw:.1f}px;height:{gbh:.1f}px"></div>'
    # magnified top-left corner: the 3% differences become visible
    zoom = (f'<svg viewBox="40 110 190 190" style="width:300px;height:300px;border-radius:10px;background:rgb(255 255 255/.04)" aria-label="Top-left corner of all nine silhouettes, magnified">'
            f'<rect x="{(1024-bw)/2:.0f}" y="{(1536-bh)/2:.0f}" width="{bw}" height="{bh}" rx="52" fill="none" stroke="#fff" stroke-dasharray="10 8" stroke-width="2.4" opacity=".8"/>'
            + outlines.replace('stroke-width="3"','stroke-width="2.2"').replace('stroke-width="5"','stroke-width="3.6"') + '</svg>')
    def sil(w1, h1, w2, h2, lab):
        sc = 150 / max(h1, h2)
        return (f'<svg viewBox="0 0 170 160" style="width:170px;height:160px"><rect x="{85-w1*sc/2:.1f}" y="{80-h1*sc/2:.1f}" width="{w1*sc:.1f}" height="{h1*sc:.1f}" rx="6" fill="none" stroke="rgb(255 225 26)" stroke-width="2"/>'
                f'<rect x="{85-w2*sc/2:.1f}" y="{80-h2*sc/2:.1f}" width="{w2*sc:.1f}" height="{h2*sc:.1f}" rx="6" fill="none" stroke="#ff6b5c" stroke-width="2"/></svg><div class="meta" style="opacity:.8;text-align:center">{lab}</div>')
    cb = next(c for c in C if c["id"].endswith("02_blue_ace")); cba = next(c for c in C if c["kind"] == "back")
    sil_before = sil(250, 250 * cb["source"]["ratio"], 250, 250 * cba["source"]["ratio"], "front vs back, as supplied")
    sil_after = sil(cb["placed"]["w"], cb["placed"]["h"], cba["placed"]["w"], cba["placed"]["h"], "front vs back, normalised")
    flipn = f'<div class="flip" id="flipN" style="width:{gw}px;height:{gh}px" tabindex="0" role="button" aria-label="Turn card"><div class="fi"><div class="face front"><img src="@@blue@@" alt="Blue ace, front"></div><div class="face back"><img src="@@back@@" alt="Card back"></div></div>{guide}</div>'
    # raw demo: faces at their own aspect, same width, top-aligned on the front's box
    rw = 250; rfh = rw * 1.365; rbh = rw * 1.45
    flipr = (f'<div class="flip" id="flipR" style="width:{rw+40}px;height:{rbh+40:.0f}px" tabindex="0" role="button" aria-label="Turn raw card"><div class="fi">'
             f'<div class="face front" style="display:grid;place-items:center"><img src="@@rawblue@@" alt="" style="width:{rw}px;height:{rfh:.0f}px;object-fit:fill"></div>'
             f'<div class="face back" style="display:grid;place-items:center"><img src="@@rawback@@" alt="" style="width:{rw}px;height:{rbh:.0f}px;object-fit:fill"></div></div>'
             f'<div class="guide" style="left:20px;top:{(rbh+40-rfh)/2:.0f}px;width:{rw}px;height:{rfh:.0f}px"></div></div>')
    return f'''
<div style="display:grid;grid-template-columns:auto 1fr;gap:26px;align-items:start">
  <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:24px 26px;width:345px">{meta("All 9 on one canvas (1024×1536)")}
    <div style="display:grid;grid-template-columns:repeat(3,96px);gap:14px;margin-top:16px">{thumbs}</div>
    <svg viewBox="0 0 1024 1536" style="width:300px;height:450px;margin-top:18px;border-radius:10px;background:rgb(255 255 255/.04)"><rect x="{(1024-bw)/2:.0f}" y="{(1536-bh)/2:.0f}" width="{bw}" height="{bh}" rx="52" fill="none" stroke="#fff" stroke-dasharray="14 12" stroke-width="3" opacity=".7"/>{outlines}</svg>
    <p class="note" style="margin:10px 0 0">Dashed white = canonical box 920×1288 (1:1.4). Yellow = the 8 fronts, red = the back, after fitting. Nothing is cropped.</p></div>
  <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:24px 26px"><table class="t"><thead><tr><th>Card</th><th>Side</th><th>Supplied</th><th>h/w</th><th>Scale</th><th>Placed</th><th>Cropped</th></tr></thead><tbody>{rows}</tbody></table>
    <p class="note" style="margin:12px 0 0">↑ = scaled up: <b>orange +8.5%</b> (smallest source, 848 px) and red +2%. Everything else scales down by 0.4–3.9%.</p>
    <div style="display:flex;gap:26px;align-items:center;margin-top:16px"><div>{meta("Top-left corner, magnified ×5")}<div style="margin-top:8px">{zoom}</div></div>
      <p class="note" style="margin:0;max-width:34ch">Yellow = the eight fronts, red = the back, dashed white = the canonical box. At true size they are one outline; magnified, the real spread is a few pixels, and the red back is the outlier.</p></div></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:22px">
  <div class="panel th-night" style="padding:28px 32px;display:grid;grid-template-columns:auto 1fr;gap:28px;align-items:center">
    <div><div class="meta" style="margin-bottom:12px">After — normalised (click)</div>{flipn}<div style="margin-top:10px">{sil_after}</div><div style="margin-top:10px"><button class="btn btn-app sm" data-flip="#flipN" type="button"><span class="lab">Turn</span><span class="chip">{CHIP}<svg class="arr" viewBox="0 0 24 24"><use href="#arrow"/></svg></span></button></div></div>
    <div class="note" style="color:#dfe5ff"><p style="margin:0 0 10px"><b style="color:#fff">Same canvas, same centre, same pivot.</b> Front and back share one 1024×1536 frame; the dashed box is the canonical card.</p>
    <p style="margin:0"><b style="color:#fff">Residual:</b> silhouettes now differ by at most <b style="color:var(--yellow)">{after_w:.1f}% in width</b> and <b style="color:var(--yellow)">{after_h:.1f}% in height</b> (the back is the narrow one) — down from {before_w:.1f}% width / {before_r:.1f}% ratio spread as supplied. At the flip's midpoint the card is edge-on, so this is invisible.</p></div></div>
  <div class="panel th-night" style="padding:28px 32px;display:grid;grid-template-columns:auto 1fr;gap:28px;align-items:center;background:#1a0f12">
    <div><div class="meta" style="margin-bottom:12px;color:#ff9a8f">Before — as supplied (click)</div>{flipr}<div style="margin-top:10px">{sil_before}</div><div style="margin-top:10px"><button class="btn btn-cards sm" data-flip="#flipR" type="button"><span class="lab">Turn</span><span class="chip">{CHIP}<svg class="arr" viewBox="0 0 24 24"><use href="#arrow"/></svg></span></button></div></div>
    <div class="note" style="color:#f0d4d0"><p style="margin:0 0 10px"><b style="color:#fff">The jump you'd have shipped.</b> Cropped to their own edges at equal width, the back is 6% taller than the front: the dashed line (front's edge) is overrun on every turn.</p>
    <p style="margin:0">Fixed without cropping, stretching or inventing pixels: originals untouched in <code>assets-source/</code>; normalised masters are generated by <code>scripts/normalize-cards.mjs</code>.</p></div></div>
</div>'''

# ---------------- finale + footer ----------------
def finale_d():
    rings = ('<svg style="position:absolute;inset:0;z-index:0" width="1440" height="900" viewBox="0 0 1440 900" aria-hidden="true">'
             '<circle cx="1075" cy="430" r="500" fill="none" stroke="var(--yellow)" stroke-width="3" stroke-dasharray="7 15" opacity=".42"/>'
             '<circle cx="1075" cy="430" r="580" fill="none" stroke="#fff" stroke-width="1.5" opacity=".14"/></svg>')
    fan = "".join(card(nm, 1115 + (i - 2) * 160, 820 + abs(i - 2) * 46, 320, (i - 2) * 12, 10 - abs(i - 2)) for i, nm in enumerate(["teal", "red", "blue", "black", "green"]))
    footer = (f'<div style="position:absolute;left:0;right:0;bottom:0;height:92px;z-index:20;background:#02061c;border-top:1px solid rgb(255 255 255/.18);display:flex;align-items:center;gap:22px;padding:0 60px">'
              f'<img src="@@mark@@" alt="" style="width:46px;height:46px"><div><div class="poster" style="font-size:26px;line-height:.9">INGIA UWANJANI TUCHEZE.</div><div style="font-size:14px;opacity:.75;margin-top:4px">The Tanzanian card game.</div></div>'
              f'<div style="margin-left:auto;display:flex;gap:30px;font:700 13px/1 Instrument Sans;opacity:.9"><span>Play</span><span>How to play</span><span>Tournaments</span><span>Physical cards</span></div>'
              f'<div class="seg" style="--seg-on:#000;color:#fff"><button aria-pressed="true" style="background:#fff"><span>EN</span></button><button aria-pressed="false"><span>SW</span></button></div></div>')
    return (f'<div class="fr" style="width:1440px;height:900px;background:radial-gradient(90% 90% at 70% 40%,color-mix(in oklab,var(--blue) 38%,#000) 0%,#02061c 70%)">{rings}'
            f'<img src="@@crown@@" alt="" style="position:absolute;left:{1075-390}px;top:{430-378}px;width:780px;z-index:1;filter:drop-shadow(0 30px 60px rgb(0 0 0/.55))">{fan}'
            f'<div style="position:absolute;left:80px;top:96px;z-index:11"><div class="poster" style="font-size:272px">Ready to<br>play?</div>'
            f'<div style="display:flex;align-items:center;gap:16px;margin-top:34px"><svg class="dot" viewBox="0 0 40 40" style="width:20px;height:20px"><use href="#chip"/></svg><div class="poster y" style="font-size:54px;line-height:.9">INGIA UWANJANI TUCHEZE.</div></div>'
            f'<div style="display:flex;gap:14px;margin-top:36px">{btn("app","Download the app")}{btn("cards","Card availability")}</div></div>{footer}</div>')
def finale_m():
    fan = "".join(card(nm, 187 + (i - 2) * 66, 735 + abs(i - 2) * 22, 124, (i - 2) * 13, 10 - abs(i - 2)) for i, nm in enumerate(["teal", "red", "blue", "black", "green"]))
    return (f'<div class="fr" style="width:375px;height:812px;background:radial-gradient(100% 70% at 80% 24%,color-mix(in oklab,var(--blue) 38%,#000),#02061c 72%)">'
            f'<svg style="position:absolute;inset:0" width="375" height="812" viewBox="0 0 375 812" aria-hidden="true"><circle cx="300" cy="190" r="200" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-dasharray="5 11" opacity=".42"/></svg>'
            f'<img src="@@crown@@" alt="" style="position:absolute;left:150px;top:40px;width:300px;z-index:1">{fan}'
            f'<div style="position:absolute;left:24px;right:24px;top:96px;z-index:11"><div class="poster" style="font-size:100px;white-space:nowrap">Ready to<br>play?</div>'
            f'<div style="display:flex;align-items:center;gap:10px;margin-top:22px"><svg class="dot" viewBox="0 0 40 40" style="width:14px;height:14px"><use href="#chip"/></svg><div class="poster y" style="font-size:33px;line-height:.9;white-space:nowrap">INGIA UWANJANI TUCHEZE.</div></div>'
            f'<div style="display:grid;gap:10px;margin-top:22px">{btn("app","Download the app").replace("class=\"btn btn-app \"","class=\"btn btn-app \" style=\"width:100%;justify-content:space-between\"")}{btn("cards","Card availability").replace("class=\"btn btn-cards \"","class=\"btn btn-cards \" style=\"width:100%;justify-content:space-between\"")}</div></div></div>')
def b10_finale():
    return f'''
{scaled(finale_d(),1440,900,.8194,"panel")}
<div style="display:grid;grid-template-columns:auto 1fr;gap:26px;margin-top:22px;align-items:start">
  <div>{meta("Mobile")}<div style="margin-top:12px">{scaled(finale_m(),375,812,.62,"panel")}</div></div>
  <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:28px 32px"><ul class="note" style="margin:0;padding-left:18px;line-height:1.8">
    <li><b style="color:#fff">The crown token is the anchor</b> — the official token cropped from the official mark (circular mask, no redraw), at poster scale, ringed by the same dashed perforation as the 11-point chip.</li>
    <li><b style="color:#fff">The type crosses it.</b> "READY TO PLAY?" overlaps the token so word and object are one composition, not a headline beside a picture.</li>
    <li><b style="color:#fff">A full hand bleeds off the bottom</b> — five official cards, fanned, cut by the frame like a hand held low at the table.</li>
    <li><b style="color:#fff">The phrase is the signature:</b> INGIA UWANJANI TUCHEZE. with a chip bullet; exactly one full stop, at the end.</li>
    <li><b style="color:#fff">Footer = last line of the poster,</b> not a new section: mark, phrase, links, language. Only verified destinations; no social or legal links until supplied.</li>
    <li><b style="color:#fff">Held frame.</b> It stops. Nothing loops at the end of the page.</li></ul></div></div>'''

# ---------------- motion verbs ----------------
def b11_motion():
    dc = lambda nm, i, tx, ty, tr: f'<img class="cd dc" alt="" src="@@{nm}@@" style="--i:{i};--tx:{tx}px;--ty:{ty}px;--tr:{tr}deg">'
    nav = "".join(f'<button type="button" data-i="{i}">{t}</button>' for i, t in enumerate(NAV_LINKS))
    def demo(title, verb, spec, area, ctrl=""):
        return f'<div class="demo"><div style="display:flex;justify-content:space-between;align-items:flex-start"><h4>{title}</h4>{ctrl}</div>{meta(verb,"color:var(--yellow)")}<div class="area">{area}</div><div class="tok">{spec}</div></div>'
    rep = lambda sel: f'<button class="btn btn-cards sm" data-replay="{sel}" type="button"><span class="lab">Replay</span><span class="chip">{CHIP}<svg class="arr" viewBox="0 0 24 24"><use href="#arrow"/></svg></span></button>'
    return f'''
<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px"><label style="display:flex;align-items:center;gap:10px;cursor:pointer" class="meta"><input id="rm" type="checkbox" style="width:20px;height:20px;accent-color:#ffe11a"> Simulate “reduce motion”</label><span class="note">Everything below respects it: entrances become the end state, TURN swaps instantly, bars appear at length.</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px">
{demo("Deal","Cards entering",'<b>Duration</b><span>520 ms · stagger 85 ms</span><b>Easing</b><span>(.16,1,.3,1) — no overshoot</span><b>Animates</b><span>transform</span><b>Used</b><span>hero hand, product fan</span><b>Reduced</b><span>end state, no travel</span>',
  f'<div class="deal play" id="dDeal" style="position:absolute;inset:0;background:var(--blue)">{dc("red",0,-118,34,-19)}{dc("black",1,0,0,-7)}{dc("blue",2,116,22,6)}</div>',rep("#dDeal"))}
{demo("Turn","Card flip — normalised geometry",'<b>Duration</b><span>520 ms</span><b>Easing</b><span>(.3,.75,.15,1) — weighty start, soft land</span><b>Animates</b><span>rotateY, perspective 1500px</span><b>Used</b><span>product cards only (not decorative)</span><b>Reduced</b><span>instant swap + visible state</span><b>A11y</b><span>real button, aria-pressed, both faces labelled</span>',
  f'<div style="position:absolute;inset:0;background:var(--night);display:grid;place-items:center"><div class="flip" id="dTurn" style="width:170px;height:255px" tabindex="0" role="button" aria-pressed="false" aria-label="Turn card"><div class="fi"><div class="face front"><img src="@@red@@" alt="Red ace, front"></div><div class="face back"><img src="@@back@@" alt="Card back"></div></div></div></div>',
  f'<button class="btn btn-app sm" data-flip="#dTurn" type="button"><span class="lab">Turn</span><span class="chip">{CHIP}<svg class="arr" viewBox="0 0 24 24"><use href="#arrow"/></svg></span></button>')}
{demo("Slide","Marker · bars · carousel",'<b>Duration</b><span>280–340 ms (bars 620 ms)</span><b>Easing</b><span>(.2,0,0,1) — directional</span><b>Animates</b><span>translateX / scaleX</span><b>Used</b><span>nav marker, ladder bars, champion numerals</span><b>Reduced</b><span>instant</span>',
  f'<div style="position:absolute;inset:0;background:var(--night);padding:28px 26px"><div class="slide-nav" data-links id="dSlide">{nav}<svg class="mk" viewBox="0 0 40 40"><use href="#chip"/></svg></div><div class="ladder play" id="dBars" style="margin-top:20px"><div class="bar b1" style="height:26px;width:300px;background:var(--yellow);border-radius:6px"></div><div class="bar b2" style="height:26px;width:150px;background:#fff;border-radius:6px;margin-top:10px"></div><div class="bar b3" style="height:26px;width:60px;background:rgb(255 255 255/.7);border-radius:6px;margin-top:10px"></div></div></div>',rep("#dBars"))}
{demo("Settle","Secondary text",'<b>Duration</b><span>460 ms · stagger 70 ms</span><b>Easing</b><span>(.16,1,.3,1)</span><b>Animates</b><span>opacity + 14px rise</span><b>Used</b><span>supporting copy only — never headlines</span><b>Reduced</b><span>visible, no rise</span>',
  f'<div class="settle play" id="dSettle" style="position:absolute;inset:0;background:var(--blue);padding:30px 32px"><p class="meta" style="--i:0;color:var(--yellow)">Tournament #27</p><p class="poster" style="--i:1;font-size:54px">12 Dec 2026</p><p class="quiet" style="--i:2;font-size:20px">Register in the Albastini app.</p><p class="quiet" style="--i:3;font-size:20px;opacity:.8">Start time to be announced.</p></div>',rep("#dSettle"))}
</div>
<div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:24px 30px;margin-top:22px"><ul class="note" style="margin:0;padding-left:18px;line-height:1.8">
<li><b style="color:#fff">Named from the table, not from animation libraries:</b> deal · turn · slide · settle. Each scene owns <i>one</i> hero verb; the rest is settle or still.</li>
<li><b style="color:#fff">Never:</b> looping float, springy overshoot, letter-by-letter split text, scroll-jacking, parallax on everything. All motion = transform/opacity.</li></ul></div>'''

# ---------------- not used ----------------
def b12_not_used():
    items = [("Glassmorphism / blurred nav", "Generic; hurts contrast over photography. The nav is a keylined object instead."), ("Noisy / grain gradients", "Only one gradient exists: brand blue → blue mixed with black (the arena)."),
             ("Random 3D & tilt-everything", "3D is reserved for one place: a card turning. Nothing else has depth cues."), ("Brutalist / marquee type", "Albastini is energetic, not anti-design. Type is composed, not shouted in loops."),
             ("Custom cursor everywhere", "Token only over cards that act (select / flip). Native cursor elsewhere."), ("Cursor on hero cards", "They do nothing on click; a 'VIEW' label would be a lie (D6)."),
             ("Medal colours (gold/silver/bronze)", "Rank = scale, numeral and keyline; one yellow, one paper, one dimmer paper (D7)."), ("Thrones, trophies, confetti, money graphics", "Casino/pageant cues. Prestige comes from scale and real faces."),
             ("Literal card → phone morph", "Distorts both objects; looks like a tech demo (D4). Deck hand-off instead."), ("Pill buttons", "24 pills was the single most template-like trait. Replaced by the card edge."),
             ("Letter-by-letter split text", "Delays reading; reads as a reel. Headlines settle as whole phrases."), ("Magnetic buttons, cursor-follow blobs", "Fast chase motion; no physical meaning at a card table."),
             ("Preloader / intro screen", "Content is the first paint; nothing makes anyone wait."), ("WebGL", "Nothing in the concept needs it; CSS 3D covers the one flip."),
             ("Bento grids / feature cards", "Reintroduces the generic section stack the CEO removed."), ("Stock or generated people", "Real photographs only (3 winners). Community slot stays empty."),
             ("Auto-matted Bedadi cut-out", "Tried. The model kept his white throne chair and gold drape; a throne is off-brand. He is shown as the real scene instead."), ("Proportional numerals for prizes", "Digits stop stacking; tabular numerals align (Board 01).")]
    tags = "".join(f'<div class="tag-no"><s>{a}</s></div>' for a, _ in items)
    why = "".join(f'<div style="padding:14px 0;border-bottom:1px solid #222;display:grid;grid-template-columns:300px 1fr;gap:20px"><b style="font:700 13px/1.3 Archivo Display;font-stretch:100%;letter-spacing:.06em;text-transform:uppercase;color:#fff">{a}</b><span class="note" style="max-width:none">{b}</span></div>' for a, b in items)
    return f'''<div style="margin-bottom:22px">{tags}</div><div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:12px 30px">{why}</div>'''

# ============================ ASSEMBLY ============================
FORMS = ["Edge", "Wave", "Chip", "Fan", "Back", "Crown", "Rank"]
BOARDS = [
 ("b01", "Type", "Type system", b01_type, ["Rank", "Chip"],
  ("Passes in context only.", "Heavy condensed caps could belong to any sports or gaming brand. It becomes Albastini through what it sets: outlined rank numerals, tabular prize columns, a single-font width-axis discipline, and the real copy.", "On its own this is the most generic board. Don't judge the type apart from the covers, ladder and fixture.")),
 ("b02", "Buttons", "Card-edge buttons", b02_buttons, ["Edge", "Chip"],
  ("Passes, narrowly — depends on the chip.", "12px card corner, printed keyline, and an arrow carried by the 11-point disc that tilts like a dealt card on hover.", "A rounded rectangle with an arrow is common. Remove the chip and this is generic. If review finds the chip too small a signal, the next pass adds a card-corner cut to the keyline.")),
 ("b03", "Navigation", "Navigation & the 11-point marker", b03_nav, ["Chip", "Edge"],
  ("Passes.", "The scene-aware keylined object and, above all, the sliding 11-point chip that replaces the underline — plus a scene label that names where you are in the table → screen story.", "A floating bar is a common pattern; its three themes are what make it ours. Needs real scroll to judge the theme hand-offs.")),
 ("b04", "Champions", "Champion covers ×3", b04_champions, ["Edge", "Wave", "Crown", "Rank", "Chip"],
  ("Passes strongly.", "Rank numeral as architecture, wave-cut nameplate, keyline, crown on first place only, collector index. These could only be Albastini champions.", "Source photography is uneven and the frame cannot repair it: Bedadi (scene) and the cut-outs remain visibly different even after grading. Better originals would close the gap.")),
 ("b05", "Fixture #27", "Tournament #27 fixture board", b05_fixture, ["Chip", "Rank", "Wave"],
  ("Passes.", "Date in keylined cells separated by 11-point chips, outlined tournament numeral, wave stroke; only verified fields appear.", "A giant outlined number is a sports-poster staple; the chips and cells carry the identity. The postponed state is the least resolved layout.")),
 ("b06", "Ladder", "Prize ladder", b06_ladder, ["Wave", "Rank", "Chip"],
  ("Passes.", "Proportional bars ending in the card wave, outlined ranks, tabular amounts, driven by the real prize structure.", "Horizontal bars resemble a bar chart by nature; the wave end and rank numerals are the differentiators.")),
 ("b07", "Hero DEAL", "Hero DEAL storyboard", b07_deal, ["Fan", "Edge", "Rank"],
  ("Passes strongly.", "Cards dealt from a deck onto a table, then a phone joins the same hand — the product's two ways to play in the first second.", "Five stills can't prove the motion feels weighty. Judge it in the preview build, not on this board.")),
 ("b08", "Table → Screen", "Table → Screen: deck hand-off", b08_table, ["Fan", "Wave", "Edge"],
  ("Passes strongly.", "The deck squares up and the phone slides out from behind it, using a real table photograph and real cards. The concept is the product.", "The phone shape itself is generic; the deck is what makes it specific. Scroll choreography is the highest-risk build item.")),
 ("b09", "Geometry", "Card geometry test (D3)", b09_geometry, ["Back", "Edge", "Fan"],
  ("Passes — infrastructure.", "Makes the approved back and fronts behave as one physical card.", "Residual 3.5% width difference remains by design (padding, not cropping). Orange ace is upscaled 8.5%.")),
 ("b10", "Finale", "Finale poster", b10_finale, ["Crown", "Fan", "Chip", "Edge"],
  ("Passes with caution.", "The crown token as anchor with the dashed perforation ring, type crossing it, a full hand bleeding off the frame.", "Huge type on dark with a fan is a poster formula; the official crown and chip ring are what hold it to Albastini.")),
 ("b11", "Motion", "The four verbs", b11_motion, ["Fan", "Back"],
  ("Passes by use, not by motion.", "Verbs named from the table (deal, turn, slide, settle), each assigned to one place, with reduced-motion equivalents.", "Slide and settle are ordinary motions; their meaning comes from where they're used.")),
 ("b12", "Not used", "What we intentionally did not use", b12_not_used, [],
  ("n/a", "Rejected devices and why.", "")),
]
def board(i, bid, short, title, fn, forms_on, gate):
    forms = "".join(f'<span class="{"on" if f in forms_on else ""}">{f}</span>' for f in FORMS)
    g = ""
    if gate[0] != "n/a":
        g = (f'<div class="gate"><div><b>Could this belong to another brand?</b><div class="v" style="margin-top:8px;color:#fff">{gate[0]}</div></div>'
             f'<div><b>What makes it Albastini</b><p>{gate[1]}</p></div><div><b>Weakest point (honest)</b><p>{gate[2]}</p></div></div>')
    return (f'<section class="board" id="{bid}"><div class="wrap"><div class="bh"><div><div class="bn meta"><i><svg viewBox="0 0 40 40" width="14" height="14"><use href="#chip"/></svg></i>Board {i:02d}</div>'
            f'<h2 class="poster bt">{title}</h2></div><div class="forms" aria-label="Albastini forms used">{forms}</div></div>{fn()}{g}</div></section>')
def scorecard():
    rows = "".join(f'<tr><td><a class="lnk" href="#{b[0]}" style="color:var(--yellow)">{i+1:02d} · {b[1]}</a></td><td>{", ".join(b[4]) or "—"}</td><td>{b[5][0]}</td><td>{b[5][2]}</td></tr>' for i, b in enumerate(BOARDS) if b[5][0] != "n/a")
    return f'''<section class="board" id="b13"><div class="wrap"><div class="bh"><div><div class="bn meta"><i><svg viewBox="0 0 40 40" width="14" height="14"><use href="#chip"/></svg></i>Board 13</div><h2 class="poster bt">The gate</h2></div></div>
<p class="quiet" style="font-size:26px;max-width:34ch;margin:0 0 22px">Could these boards belong to any other brand? My honest read: <b>7 of 11 are clearly Albastini (3 strongly); 4 pass only with a qualifier</b> — type, buttons, finale and motion each lean on something else to carry the identity.</p>
<div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:14px 26px"><table class="t"><thead><tr><th>Board</th><th>Albastini forms</th><th>Verdict</th><th>Weakest point</th></tr></thead><tbody>{rows}</tbody></table></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:22px">
<div class="panel th-blue" style="padding:28px 32px"><div class="meta">If you approve</div><p class="quiet" style="font-size:22px;margin:12px 0 0">M1 builds the foundations: tokens (edge, keyline, chip, four motion verbs), scene themes, focus system and the budget scripts — then nav and buttons (M2).</p></div>
<div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:28px 32px"><div class="meta">Needs your eye first</div><ul class="note" style="margin:12px 0 0;padding-left:18px;line-height:1.75"><li>Is the <b>chip</b> a strong enough signal for buttons and nav, or should the keyline get a card-corner cut?</li><li>Bedadi as a <b>scene window</b> beside two cut-outs: unified enough, or do you want better originals before M7?</li><li>Finale: crown at poster scale — right, or too heavy?</li></ul></div></div></div></section>'''
SPRITE = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'
          '<symbol id="chip" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18.6" fill="currentColor" stroke="var(--chip-edge,transparent)" stroke-width="2.2"/>'
          '<circle cx="20" cy="20" r="12.6" fill="none" stroke="var(--chip-ring,#000)" stroke-width="2.2" stroke-dasharray="4.1 3.5"/></symbol>'
          '<symbol id="arrow" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></symbol></defs></svg>')
JS = r'''
(function(){const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function place(l){const cur=$('[aria-current="true"]',l)||$('a,button',l),mk=$('.mk',l);if(!cur||!mk)return;const lr=l.getBoundingClientRect(),cr=cur.getBoundingClientRect();mk.style.transform='translateX('+(cr.left-lr.left+cr.width/2-mk.getBoundingClientRect().width/2)+'px)';}
$$('[data-links]').forEach(l=>{place(l);$$('a,button',l).forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$$('a,button',l).forEach(x=>x.removeAttribute('aria-current'));a.setAttribute('aria-current','true');place(l);}));});
window.addEventListener('load',()=>$$('[data-links]').forEach(place));
$$('[data-replay]').forEach(b=>b.addEventListener('click',()=>{const t=$(b.dataset.replay);t.classList.remove('play');void t.offsetWidth;t.classList.add('play');}));
$$('.flip').forEach(f=>{const tg=()=>{f.classList.toggle('on');f.setAttribute('aria-pressed',f.classList.contains('on'))};f.addEventListener('click',tg);f.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tg();}});});
$$('[data-flip]').forEach(b=>b.addEventListener('click',()=>{const f=$(b.dataset.flip);f.classList.toggle('on');}));
const rm=$('#rm');if(rm)rm.addEventListener('change',()=>{document.documentElement.toggleAttribute('data-rm',rm.checked)});
// top bar scroll-spy with the 11-point marker
const top=$('#topLinks'),secs=$$('.board');function spy(){let cur=null;secs.forEach(s=>{if(s.getBoundingClientRect().top<140)cur=s.id});$$('a',top).forEach(a=>{if(a.getAttribute('href')==='#'+cur)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});place(top);}
addEventListener('scroll',spy,{passive:true});spy();})();
'''
def build():
    sections = "".join(board(i + 1, b[0], b[1], b[2], b[3], b[4], b[5]) for i, b in enumerate(BOARDS))
    toplinks = "".join(f'<a href="#{b[0]}">{b[1]}</a>' for b in BOARDS) + '<a href="#b13">Gate</a>'
    intro = f'''<header class="wrap" style="padding-top:64px;padding-bottom:38px">
  <div class="bn meta"><i><svg viewBox="0 0 40 40" width="14" height="14"><use href="#chip"/></svg></i>Albastini · feature/award-revamp · M0</div>
  <h1 class="poster" style="font-size:150px;margin:18px 0 0">The living<br>table — <span class="y">boards.</span></h1>
  <p class="quiet" style="font-size:26px;max-width:36ch;margin:26px 0 0;opacity:.92">Design boards only. No scene code. Every image is a real Albastini asset; every fact is verified (Tournament #26 results, #27 on 12 Dec 2026, prize structure).</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:34px">
   <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:24px 28px"><div class="meta y">The seven forms (every board lights the ones it uses)</div>
     <div class="forms" style="justify-content:flex-start;max-width:none;margin-top:14px">{"".join(f'<span class="on">{f}</span>' for f in FORMS)}</div>
     <p class="note" style="margin:14px 0 0">Edge = card corner · Wave = the curve on every face · Chip = 11 POINTS · Fan = a hand · Back = the official back · Crown = the token · Rank = outlined numerals.</p></div>
   <div class="panel" style="background:#0d0d0d;border:1px solid #262626;padding:24px 28px"><div class="meta y">Your decisions, applied</div>
     <p class="note" style="margin:10px 0 0;line-height:1.7">D3 cards normalised, non-destructively · D4 deck → hand-off · D5 full-composition hero · D6 cursor only on actionable cards · D7 subtle rank tints · D8 current photos · D9 sound deferred · MJeshi canonical.</p></div></div>
</header>'''
    html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1280"><title>Albastini — M0 design boards</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Sans:wght@400..700&display=swap"><style>{CSS}</style></head><body>{SPRITE}
<nav class="top" aria-label="Boards"><span class="brand"><img src="@@mark@@" alt=""><span class="meta">M0 boards</span></span><div class="mk-wrap" id="topLinks" data-x style="gap:2px">{toplinks}<svg class="mk" viewBox="0 0 40 40"><use href="#chip"/></svg></div></nav>
{intro}{sections}{scorecard()}<footer class="wrap" style="padding:50px 30px 90px"><div class="poster y" style="font-size:44px">INGIA UWANJANI TUCHEZE.</div></footer><script>{JS}</script></body></html>'''
    html = html.replace("@@FONTA@@", FONT_A).replace("@@FONTI@@", FONT_I)
    # Each image is stored ONCE (in a JS map) and assigned at load: the page was 10 MB when every use embedded its own copy.
    PIX = "data:image/gif;base64,R0lGODlhAQABAAAAACw="
    html = re.sub(r'src="@@(\w+)@@"', lambda m: f'data-k="{m.group(1)}" src="{PIX}"', html)
    html = html.replace("</body>", "<script>const IMG=" + json.dumps(IMG) + ";document.querySelectorAll('img[data-k]').forEach(i=>{i.src=IMG[i.dataset.k]});</script></body>")
    assert "@@" not in html.replace("@@FONT", ""), "unresolved asset token"
    open(OUT, "w").write(html); print("wrote", OUT, round(len(html) / 1024), "KB")
if __name__ == "__main__": build()
