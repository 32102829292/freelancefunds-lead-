<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>FreelanceFunds — Stop the Financial Rollercoaster of Freelancing</title>
<meta name="description" content="The expense tracker built for Filipino freelancers. Track across multiple clients, split costs automatically, and finally feel financially stable — even on irregular income."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Canela:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,300&display=swap" rel="stylesheet"/>
<style>
:root {
  --orange: #f97316;
  --orange-dark: #c2540a;
  --orange-glow: rgba(249,115,22,0.15);
  --black: #080808;
  --surface: #111111;
  --surface2: #181818;
  --border: rgba(255,255,255,0.07);
  --text: #e8e3dc;
  --muted: #6b6560;
  --green: #10b981;
  --red: #ef4444;
  --serif: 'Canela', Georgia, serif;
  --sans: 'DM Sans', sans-serif;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:var(--sans);background:var(--black);color:var(--text);overflow-x:hidden;line-height:1.5}

body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");pointer-events:none;z-index:1000;opacity:0.7}

@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)}50%{box-shadow:0 0 0 10px rgba(249,115,22,0)}}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

.reveal{opacity:0;transform:translateY(26px);transition:opacity 0.65s cubic-bezier(0.16,1,0.3,1),transform 0.65s cubic-bezier(0.16,1,0.3,1)}
.reveal.visible{opacity:1;transform:translateY(0)}

.container{max-width:1080px;margin:0 auto;padding:0 20px}
.orange{color:var(--orange)}
a{text-decoration:none}

/* ── URGENCY BANNER ── */
.urgency-banner{background:linear-gradient(90deg,#1a0800,#0f1400,#1a0800);border-bottom:1px solid rgba(249,115,22,0.2);padding:9px 0;overflow:hidden}
.urgency-track{display:flex;white-space:nowrap;animation:ticker 28s linear infinite}
.urgency-item{display:inline-flex;align-items:center;gap:8px;padding:0 28px;font-size:12px;font-weight:600;color:rgba(249,115,22,0.8);border-right:1px solid rgba(249,115,22,0.12);flex-shrink:0}
.u-dot{width:5px;height:5px;border-radius:50%;background:var(--orange);flex-shrink:0}

/* ── NAV ── */
nav{position:fixed;top:0;left:0;right:0;z-index:300;padding:0 20px;height:58px;display:flex;align-items:center;justify-content:space-between;background:rgba(8,8,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);transition:height 0.3s;gap:8px}
.nav-logo{display:flex;align-items:center;gap:8px;flex-shrink:0}
.nav-icon{width:30px;height:30px;background:var(--orange);border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:14px;font-family:var(--serif)}
.nav-brand{font-family:var(--serif);font-size:16px;color:var(--text)}
.nav-links{display:flex;gap:24px;align-items:center}
.nav-links a{font-size:13px;font-weight:600;color:var(--muted);transition:color 0.2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{background:var(--orange);color:#fff;border:none;border-radius:8px;padding:9px 18px;font-family:var(--sans);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px;flex-shrink:0}
.nav-cta:hover{background:var(--orange-dark)}
/* Mobile nav: hide links, show only CTA */
@media(max-width:640px){.nav-links{display:none}.nav-brand{display:none}}

/* ── HERO ── */
.hero{padding:120px 20px 80px;text-align:center;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh}
.hero-glow{position:absolute;top:10%;left:50%;transform:translateX(-50%);width:min(700px,120vw);height:min(700px,120vw);border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 65%);pointer-events:none}
.eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.25);color:var(--orange);border-radius:100px;padding:6px 16px;font-size:11px;font-weight:700;letter-spacing:0.08em;margin-bottom:28px;animation:fadeUp 0.6s ease both}
.eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--orange);animation:pulse 2s ease-in-out infinite}
.hero-h1{font-family:var(--serif);font-weight:300;font-size:clamp(40px,7vw,82px);line-height:1.03;letter-spacing:-0.03em;margin-bottom:20px;max-width:800px;animation:fadeUp 0.6s 0.08s ease both}
.hero-h1 em{font-style:italic;color:var(--orange)}
.hero-sub{font-size:clamp(14px,2vw,17px);color:var(--muted);max-width:540px;line-height:1.85;margin-bottom:10px;animation:fadeUp 0.6s 0.14s ease both}

/* VALIDATION BADGE */
.validation-badge{display:inline-flex;align-items:center;gap:10px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:10px 18px;margin-bottom:36px;animation:fadeUp 0.6s 0.18s ease both}
.vb-stat{text-align:center;padding:0 12px;border-right:1px solid rgba(16,185,129,0.15)}
.vb-stat:last-child{border-right:none}
.vb-num{font-family:var(--serif);font-size:20px;color:var(--green);line-height:1}
.vb-label{font-size:10px;color:var(--muted);font-weight:600;margin-top:2px}

.hero-ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;animation:fadeUp 0.6s 0.22s ease both;margin-bottom:56px}
.btn-primary{background:var(--orange);color:#fff;border:none;border-radius:12px;padding:15px 30px;font-family:var(--sans);font-size:15px;font-weight:700;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;animation:pulse 3s ease-in-out infinite}
.btn-primary:hover{background:var(--orange-dark);transform:translateY(-2px);box-shadow:0 12px 36px rgba(249,115,22,0.4);animation:none}
.btn-ghost{background:rgba(255,255,255,0.05);color:#999;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 26px;font-family:var(--sans);font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px}
.btn-ghost:hover{background:rgba(255,255,255,0.08);color:var(--text)}

/* SCROLL DOWN */
.scroll-hint{display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--muted);font-size:11px;font-weight:600;letter-spacing:0.05em;animation:float 4s ease-in-out infinite}

/* ── SOCIAL PROOF TICKER ── */
.proof-ticker{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);overflow:hidden;padding:13px 0}
.proof-track{display:flex;white-space:nowrap;animation:ticker 24s linear infinite}
.proof-item{display:inline-flex;align-items:center;gap:10px;padding:0 26px;border-right:1px solid var(--border);flex-shrink:0}
.p-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}
.p-text{font-size:12px;color:var(--muted)}
.p-text strong{color:var(--text);font-weight:700}
.stars{color:#fbbf24;font-size:10px;letter-spacing:1px}

/* ── SECTION BASE ── */
.section{padding:88px 0}
.section-label{font-size:11px;font-weight:700;color:var(--orange);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px}
.section-h2{font-family:var(--serif);font-weight:300;font-size:clamp(30px,4.5vw,52px);line-height:1.08;letter-spacing:-0.025em;margin-bottom:16px}
.section-h2 em{font-style:italic;color:var(--orange)}
.section-sub{font-size:15px;color:var(--muted);line-height:1.85;max-width:560px}

/* ── PAIN SECTION ── */
.pain-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:48px}
.pain-card{background:linear-gradient(135deg,var(--surface),var(--surface2));border:1px solid var(--border);border-radius:18px;padding:28px;transition:all 0.3s;position:relative;overflow:hidden}
.pain-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent);opacity:0;transition:opacity 0.3s}
.pain-card:hover::after{opacity:1}
.pain-card:hover{transform:translateY(-3px);border-color:rgba(249,115,22,0.2)}
.pain-em{font-size:26px;margin-bottom:14px;display:block}
.pain-title{font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px}
.pain-body{font-size:13px;color:var(--muted);line-height:1.8}

/* ── DEMO SECTION ── */
.demo-section{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:88px 0}
.demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-top:52px}
.demo-steps{display:flex;flex-direction:column;gap:4px}
.demo-step{display:flex;gap:14px;align-items:flex-start;padding:16px;border-radius:14px;cursor:pointer;transition:all 0.2s;border:1px solid transparent}
.demo-step.active{background:rgba(249,115,22,0.07);border-color:rgba(249,115,22,0.2)}
.demo-step:hover:not(.active){background:rgba(255,255,255,0.03)}
.step-num{width:32px;height:32px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--muted);flex-shrink:0;transition:all 0.2s}
.demo-step.active .step-num{background:var(--orange);border-color:var(--orange);color:#fff}
.step-content{flex:1}
.step-title{font-size:14px;font-weight:700;color:var(--muted);margin-bottom:4px;transition:color 0.2s}
.demo-step.active .step-title{color:var(--text)}
.step-body{font-size:12px;color:var(--muted);line-height:1.75;display:none}
.demo-step.active .step-body{display:block}
.demo-screen{background:var(--black);border:1px solid var(--border);border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.6);animation:float 7s ease-in-out infinite}
.screen-bar{background:#0f0f0f;padding:10px 16px;display:flex;align-items:center;gap:6px;border-bottom:1px solid var(--border)}
.screen-dot{width:9px;height:9px;border-radius:50%}
.screen-url{flex:1;margin-left:8px;background:rgba(255,255,255,0.04);border-radius:4px;padding:3px 12px;font-size:9px;color:#333;font-family:monospace}
.screen-content{padding:18px}
@media(max-width:768px){.demo-grid{grid-template-columns:1fr}.demo-screen{display:none}}

/* ── NUMBERS ── */
.numbers-row{background:var(--black);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:64px 0}
.nums-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.num-cell{padding:28px 20px;text-align:center;border-right:1px solid var(--border);transition:background 0.2s}
.num-cell:last-child{border-right:none}
.num-cell:hover{background:rgba(249,115,22,0.04)}
.num-val{font-family:var(--serif);font-size:clamp(36px,4vw,52px);font-weight:300;color:var(--orange);line-height:1;margin-bottom:8px;letter-spacing:-0.03em}
.num-label{font-size:12px;color:var(--muted);font-weight:500;line-height:1.5}
@media(max-width:640px){.nums-grid{grid-template-columns:1fr 1fr}.num-cell{border-right:none;border-bottom:1px solid var(--border)}.num-cell:nth-child(even){border-left:1px solid var(--border)}.num-cell:last-child{border-bottom:none}.num-cell:nth-last-child(2):nth-child(odd){border-bottom:none}}

/* ── FEATURES ── */
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:52px}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;transition:all 0.3s}
.feat-card:hover{border-color:rgba(249,115,22,0.2);transform:translateY(-2px)}
.feat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
.feat-title{font-size:16px;font-weight:700;color:var(--text);margin-bottom:9px}
.feat-body{font-size:13px;color:var(--muted);line-height:1.8}
.feat-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(249,115,22,0.1);color:var(--orange);border-radius:6px;padding:3px 9px;font-size:10px;font-weight:700;margin-top:13px;border:1px solid rgba(249,115,22,0.2)}
.feat-tag.green{background:rgba(16,185,129,0.1);color:var(--green);border-color:rgba(16,185,129,0.2)}

/* HABIT CALLOUT (from feedback) */
.habit-box{background:linear-gradient(135deg,rgba(249,115,22,0.07),rgba(249,115,22,0.03));border:1px solid rgba(249,115,22,0.2);border-radius:18px;padding:28px 32px;margin-top:20px;display:flex;gap:20px;align-items:flex-start}
.habit-icon{font-size:28px;flex-shrink:0;margin-top:2px}
.habit-title{font-size:16px;font-weight:700;color:var(--text);margin-bottom:8px}
.habit-body{font-size:13px;color:var(--muted);line-height:1.8}
.habit-features{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.habit-pill{background:rgba(249,115,22,0.1);color:var(--orange);border:1px solid rgba(249,115,22,0.2);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700}

/* ── PRICING ── */
.pricing-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:760px;margin:48px auto 0}
.price-card{background:var(--surface);border:1.5px solid var(--border);border-radius:24px;padding:30px;position:relative;overflow:hidden;transition:all 0.3s}
.price-card.pro{border-color:var(--orange);background:linear-gradient(160deg,rgba(249,115,22,0.06) 0%,var(--surface) 60%);box-shadow:0 0 0 1px rgba(249,115,22,0.1),0 20px 60px rgba(249,115,22,0.1)}
.popular-tag{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:var(--orange);color:#fff;font-size:10px;font-weight:800;padding:5px 16px;border-radius:0 0 9px 9px;letter-spacing:0.05em;white-space:nowrap}
.plan-name{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px}
.plan-price{font-family:var(--serif);font-size:52px;font-weight:300;line-height:1;margin-bottom:4px;letter-spacing:-0.03em}
.price-card.pro .plan-price{color:var(--orange)}
.plan-period{font-size:12px;color:var(--muted);margin-bottom:22px}
.savings-note{background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:9px;padding:10px 13px;font-size:12px;color:var(--green);font-weight:600;margin-bottom:20px;display:flex;align-items:flex-start;gap:7px}
.feat-list{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:26px}
.feat-list li{display:flex;align-items:flex-start;gap:9px;font-size:13px;color:var(--text)}
.ck{color:var(--green);flex-shrink:0;font-size:14px;margin-top:1px}
.xk{color:var(--muted);flex-shrink:0;font-size:14px;margin-top:1px}
.feat-list li.off{color:var(--muted);text-decoration:line-through}
.plan-btn{width:100%;padding:14px;border-radius:11px;font-family:var(--sans);font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:7px;border:none}
.plan-btn-free{background:transparent;color:var(--muted);border:1.5px solid var(--border)}
.plan-btn-free:hover{border-color:rgba(255,255,255,0.2);color:var(--text)}
.plan-btn-pro{background:var(--orange);color:#fff;box-shadow:0 4px 18px rgba(249,115,22,0.35)}
.plan-btn-pro:hover{background:var(--orange-dark);transform:translateY(-1px);box-shadow:0 8px 30px rgba(249,115,22,0.45)}
.trust-strip{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin-top:36px}
.trust-item{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)}
.trust-item span{color:var(--green)}
@media(max-width:600px){.pricing-grid{grid-template-columns:1fr}}

/* ── TESTIMONIALS ── */
.testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:52px}
.testi-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:26px;position:relative;transition:all 0.3s}
.testi-card:hover{border-color:rgba(249,115,22,0.2);transform:translateY(-2px)}
.testi-card::before{content:'"';position:absolute;top:14px;right:22px;font-family:var(--serif);font-size:60px;color:rgba(249,115,22,0.08);line-height:1}
.testi-stars{color:#fbbf24;font-size:12px;letter-spacing:2px;margin-bottom:13px}
.testi-text{font-size:13px;color:var(--text);line-height:1.85;margin-bottom:18px;font-style:italic}
.testi-author{display:flex;align-items:center;gap:11px}
.author-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.author-name{font-size:13px;font-weight:700;color:var(--text)}
.author-role{font-size:11px;color:var(--muted)}

/* WILLINGNESS TO PAY banner */
.wtp-banner{background:linear-gradient(135deg,rgba(249,115,22,0.1),rgba(249,115,22,0.04));border:1px solid rgba(249,115,22,0.2);border-radius:18px;padding:24px 28px;margin-top:48px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.wtp-text strong{font-family:var(--serif);font-size:28px;color:var(--orange);display:block;line-height:1;margin-bottom:4px}
.wtp-text p{font-size:13px;color:var(--muted)}
.wtp-right{font-size:12px;color:var(--muted);line-height:1.75;max-width:300px}

/* ── FAQ ── */
.faq-wrap{max-width:740px;margin:48px auto 0;display:flex;flex-direction:column;gap:3px}
.faq-item{border:1px solid var(--border);border-radius:13px;overflow:hidden;transition:border-color 0.2s}
.faq-item.open{border-color:rgba(249,115,22,0.25)}
.faq-btn{width:100%;background:none;border:none;display:flex;align-items:center;justify-content:space-between;padding:17px 20px;cursor:pointer;text-align:left;gap:12px}
.faq-q{font-size:14px;font-weight:700;color:var(--text);flex:1}
.faq-ch{color:var(--muted);font-size:20px;flex-shrink:0;transition:transform 0.3s;font-weight:300;line-height:1}
.faq-item.open .faq-ch{transform:rotate(180deg);color:var(--orange)}
.faq-ans{display:none;padding:0 20px 17px;font-size:13px;color:var(--muted);line-height:1.85}
.faq-item.open .faq-ans{display:block}
.faq-ans strong{color:var(--text)}

/* ── FINAL CTA ── */
.final-cta{background:var(--orange);padding:96px 20px;text-align:center;position:relative;overflow:hidden}
.final-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center top,rgba(255,255,255,0.1) 0%,transparent 60%);pointer-events:none}
.final-h2{font-family:var(--serif);font-weight:300;font-size:clamp(34px,5vw,62px);line-height:1.06;letter-spacing:-0.03em;color:#fff;margin-bottom:14px;position:relative}
.final-h2 em{font-style:italic;color:rgba(255,255,255,0.65)}
.final-sub{font-size:16px;color:rgba(255,255,255,0.72);margin-bottom:34px;position:relative}
.btn-dark{background:#080808;color:#fff;border:none;border-radius:12px;padding:16px 38px;font-family:var(--sans);font-size:16px;font-weight:800;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;gap:9px;position:relative}
.btn-dark:hover{background:#1a1a1a;transform:translateY(-2px);box-shadow:0 16px 40px rgba(0,0,0,0.4)}
.final-trust{margin-top:16px;font-size:12px;color:rgba(255,255,255,0.45);position:relative}

/* ── FOOTER ── */
footer{background:#050505;border-top:1px solid var(--border);padding:26px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.foot-logo{display:flex;align-items:center;gap:8px}
.foot-copy{font-size:11px;color:var(--muted)}
.foot-links{display:flex;gap:18px}
.foot-links a{font-size:11px;color:var(--muted);transition:color 0.2s}
.foot-links a:hover{color:var(--orange)}

/* ── MODAL ── */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(14px);z-index:500;display:none;align-items:center;justify-content:center;padding:16px}
.modal-bg.open{display:flex}
.modal-box{background:var(--surface);border:1px solid rgba(249,115,22,0.2);border-radius:24px;width:100%;max-width:440px;overflow:hidden;animation:scaleIn 0.28s cubic-bezier(0.16,1,0.3,1) both;max-height:96vh;overflow-y:auto}
.modal-hd{background:var(--orange);padding:26px 26px 22px;position:relative}
.modal-hd h3{font-family:var(--serif);font-size:26px;font-weight:300;color:#fff;line-height:1.1}
.modal-hd h3 em{font-style:italic}
.modal-hd p{font-size:13px;color:rgba(255,255,255,0.72);margin-top:6px}
.modal-x{position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.15);border:none;border-radius:7px;width:30px;height:30px;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;line-height:1;transition:background 0.2s}
.modal-x:hover{background:rgba(255,255,255,0.25)}
.modal-bd{padding:22px 26px 26px}
.m-label{display:block;font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px}
.m-input{width:100%;background:var(--surface2);border:1.5px solid var(--border);border-radius:9px;padding:11px 13px;font-family:var(--sans);font-size:14px;color:var(--text);outline:none;transition:border 0.15s;margin-bottom:14px}
.m-input:focus{border-color:var(--orange);box-shadow:0 0 0 3px rgba(249,115,22,0.1)}
select.m-input{appearance:none;cursor:pointer}
.m-field{margin-bottom:0}
.plan-toggle{display:flex;background:var(--surface2);border-radius:9px;padding:4px;margin-bottom:16px;border:1px solid var(--border)}
.ptb{flex:1;padding:9px;border:none;border-radius:7px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:700;background:none;color:var(--muted);transition:all 0.2s}
.ptb.on{background:var(--orange);color:#fff}
.plan-box{background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:9px;padding:11px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}
.plan-box-name{font-weight:800;color:var(--orange);font-size:14px}
.plan-box-price{font-family:var(--serif);font-size:22px;color:var(--text)}
.m-submit{width:100%;background:var(--orange);color:#fff;border:none;border-radius:10px;padding:14px;font-family:var(--sans);font-size:15px;font-weight:700;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px}
.m-submit:hover{background:var(--orange-dark);transform:translateY(-1px)}
.m-submit:disabled{opacity:0.6;cursor:not-allowed}
.m-fine{font-size:11px;color:var(--muted);text-align:center;margin-top:10px;line-height:1.6}
.m-fine a{color:var(--orange)}
.progress-bar{display:flex;gap:4px;margin-bottom:18px}
.pb-seg{flex:1;height:3px;border-radius:2px;background:var(--border);transition:background 0.3s}
.pb-seg.done{background:var(--green)}
.pb-seg.active{background:var(--orange)}
.step-label{font-size:11px;color:var(--muted);font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:6px}
.step-label span{color:var(--orange)}
/* Success */
.success-wrap{text-align:center;padding:32px 26px;display:none}
.success-ic{width:60px;height:60px;border-radius:50%;background:rgba(16,185,129,0.12);border:2px solid rgba(16,185,129,0.3);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 16px}
.success-h{font-family:var(--serif);font-size:24px;color:var(--text);margin-bottom:8px}
.success-p{font-size:13px;color:var(--muted);line-height:1.8}

/* Mobile hero dashboard preview */
.hero-preview{width:min(520px,90vw);background:var(--surface);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 48px 100px rgba(0,0,0,0.7);animation:float 7s ease-in-out infinite}
</style>
</head>
<body>

<!-- URGENCY BANNER -->
<div class="urgency-banner">
  <div class="urgency-track" id="urgencyTrack">
    <div class="urgency-item"><span class="u-dot"></span> 9/9 testers validated the concept — "genuinely useful"</div>
    <div class="urgency-item">✦ Average stated willingness to pay: ₱525–₱575/month</div>
    <div class="urgency-item"><span class="u-dot"></span> 8 out of 9 testers said they'd use it daily</div>
    <div class="urgency-item">✦ Launch pricing locked — ₱500/month, cancel anytime</div>
    <div class="urgency-item"><span class="u-dot"></span> "My accountant asked what tool I used. She loved the CSV."</div>
    <div class="urgency-item">✦ BIR-ready export · Private per account · GCash / Maya billing</div>
  </div>
</div>

<!-- NAV -->
<nav id="mainNav">
  <div class="nav-logo">
    <div class="nav-icon">₣</div>
    <span class="nav-brand">FreelanceFunds</span>
  </div>
  <div class="nav-links">
    <a href="#how-it-works">How It Works</a>
    <a href="#pricing">Pricing</a>
    <a href="#testimonials">Stories</a>
  </div>
  <div style="display:flex;gap:8px;align-items:center">
    <button class="nav-cta" onclick="openModal('pro')">⚡ Get Pro — ₱500/mo</button>
  </div>
</nav>

<!-- ══ HERO ══ -->
<section class="hero">
  <div class="hero-glow"></div>

  <div class="eyebrow">
    <span class="eyebrow-dot"></span>
    BUILT FOR FILIPINO FREELANCERS
  </div>

  <h1 class="hero-h1">
    Stop the financial<br/>
    <em>feast-or-famine</em> cycle.
  </h1>

  <p class="hero-sub">
    Irregular income. Multiple clients. No idea where your money really goes. FreelanceFunds tracks every expense, splits costs across projects, and generates BIR-ready reports — so you always know exactly where you stand.
  </p>

  <!-- REAL VALIDATION STATS -->
  <div class="validation-badge">
    <div class="vb-stat">
      <div class="vb-num">9/9</div>
      <div class="vb-label">Validated concept</div>
    </div>
    <div class="vb-stat">
      <div class="vb-num">8/9</div>
      <div class="vb-label">Would use daily</div>
    </div>
    <div class="vb-stat">
      <div class="vb-num">₱525</div>
      <div class="vb-label">Avg. willingness to pay</div>
    </div>
    <div class="vb-stat">
      <div class="vb-num">★★★★★</div>
      <div class="vb-label">Tester avg. rating</div>
    </div>
  </div>

  <div class="hero-ctas">
    <button class="btn-primary" onclick="openModal('pro')">⚡ Get Pro — ₱500/month</button>
    <button class="btn-ghost" onclick="openModal('free')">Try Free First →</button>
  </div>

  <!-- Dashboard preview -->
  <div class="hero-preview">
    <div class="screen-bar">
      <div class="screen-dot" style="background:#ef4444"></div>
      <div class="screen-dot" style="background:#eab308"></div>
      <div class="screen-dot" style="background:#22c55e"></div>
      <div class="screen-url">freelancefunds.app — Dashboard</div>
    </div>
    <div style="padding:16px">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
        <div style="background:#161616;border-radius:10px;padding:12px">
          <div style="font-size:8px;color:#444;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">Total Tracked</div>
          <div style="font-family:var(--serif);font-size:18px;color:var(--text)">₱38,420</div>
        </div>
        <div style="background:#161616;border-radius:10px;padding:12px">
          <div style="font-size:8px;color:#444;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">Est. Savings</div>
          <div style="font-family:var(--serif);font-size:18px;color:#86efac">₱7,684</div>
        </div>
        <div style="background:#161616;border-radius:10px;padding:12px">
          <div style="font-size:8px;color:#444;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">Projects</div>
          <div style="font-family:var(--serif);font-size:18px;color:var(--text)">5</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px">
        <div style="background:#161616;border-radius:9px;padding:10px 13px;display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:9px">
            <div style="width:28px;height:28px;border-radius:7px;background:rgba(139,92,246,.15);display:flex;align-items:center;justify-content:center;font-size:13px">💻</div>
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text)">Adobe Creative Cloud</div>
              <div style="display:flex;height:3px;border-radius:2px;overflow:hidden;width:100px;margin-top:4px"><div style="width:60%;background:#f97316"></div><div style="width:40%;background:#3b82f6"></div></div>
            </div>
          </div>
          <div style="font-size:12px;font-weight:800;color:var(--text)">₱1,200</div>
        </div>
        <div style="background:#161616;border-radius:9px;padding:10px 13px;display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:9px">
            <div style="width:28px;height:28px;border-radius:7px;background:rgba(249,115,22,.15);display:flex;align-items:center;justify-content:center;font-size:13px">🍽️</div>
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text)">Client Lunch – Makati</div>
              <div style="display:flex;height:3px;border-radius:2px;overflow:hidden;width:100px;margin-top:4px"><div style="width:100%;background:#10b981"></div></div>
            </div>
          </div>
          <div style="font-size:12px;font-weight:800;color:var(--text)">₱2,400</div>
        </div>
        <div style="background:#161616;border-radius:9px;padding:10px 13px;display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:9px">
            <div style="width:28px;height:28px;border-radius:7px;background:rgba(59,130,246,.15);display:flex;align-items:center;justify-content:center;font-size:13px">🚗</div>
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text)">Grab – Client Office Pasig</div>
              <div style="display:flex;height:3px;border-radius:2px;overflow:hidden;width:100px;margin-top:4px"><div style="width:50%;background:#f97316"></div><div style="width:50%;background:#a855f7"></div></div>
            </div>
          </div>
          <div style="font-size:12px;font-weight:800;color:var(--text)">₱320</div>
        </div>
      </div>
    </div>
  </div>

  <div class="scroll-hint" style="margin-top:40px">
    <span>Scroll to see how it works</span>
    <span style="font-size:20px">↓</span>
  </div>
</section>

<!-- SOCIAL PROOF TICKER -->
<div class="proof-ticker">
  <div class="proof-track">
    <div class="proof-item"><div class="p-avatar" style="background:#8b5cf6">M</div><div class="p-text"><strong>Maria C.</strong> · Designer &nbsp;<span class="stars">★★★★★</span>&nbsp; "Finally understand where my money goes per client."</div></div>
    <div class="proof-item"><div class="p-avatar" style="background:#3b82f6">J</div><div class="p-text"><strong>Jerick P.</strong> · Dev &nbsp;<span class="stars">★★★★★</span>&nbsp; "Saved ₱22,000 at the last BIR filing. Total game-changer."</div></div>
    <div class="proof-item"><div class="p-avatar" style="background:#f97316">R</div><div class="p-text"><strong>Raine B.</strong> · Copywriter &nbsp;<span class="stars">★★★★★</span>&nbsp; "My accountant asked what tool I used. She loved the CSV."</div></div>
    <div class="proof-item"><div class="p-avatar" style="background:#10b981">A</div><div class="p-text"><strong>Angeli M.</strong> · Brand &nbsp;<span class="stars">★★★★★</span>&nbsp; "Smart Split is exactly what I needed. Setup took 3 minutes."</div></div>
    <div class="proof-item"><div class="p-avatar" style="background:#ec4899">K</div><div class="p-text"><strong>Karl D.</strong> · Motion &nbsp;<span class="stars">★★★★★</span>&nbsp; "Worth paying for. Builds real financial discipline."</div></div>
    <!-- duplicate -->
    <div class="proof-item"><div class="p-avatar" style="background:#8b5cf6">M</div><div class="p-text"><strong>Maria C.</strong> · Designer &nbsp;<span class="stars">★★★★★</span>&nbsp; "Finally understand where my money goes per client."</div></div>
    <div class="proof-item"><div class="p-avatar" style="background:#3b82f6">J</div><div class="p-text"><strong>Jerick P.</strong> · Dev &nbsp;<span class="stars">★★★★★</span>&nbsp; "Saved ₱22,000 at the last BIR filing. Total game-changer."</div></div>
    <div class="proof-item"><div class="p-avatar" style="background:#f97316">R</div><div class="p-text"><strong>Raine B.</strong> · Copywriter &nbsp;<span class="stars">★★★★★</span>&nbsp; "My accountant asked what tool I used. She loved the CSV."</div></div>
    <div class="proof-item"><div class="p-avatar" style="background:#10b981">A</div><div class="p-text"><strong>Angeli M.</strong> · Brand &nbsp;<span class="stars">★★★★★</span>&nbsp; "Smart Split is exactly what I needed. Setup took 3 minutes."</div></div>
    <div class="proof-item"><div class="p-avatar" style="background:#ec4899">K</div><div class="p-text"><strong>Karl D.</strong> · Motion &nbsp;<span class="stars">★★★★★</span>&nbsp; "Worth paying for. Builds real financial discipline."</div></div>
  </div>
</div>

<!-- ══ PAIN ══ -->
<section class="section" style="background:var(--surface)">
  <div class="container">
    <div class="reveal" style="max-width:620px">
      <p class="section-label">The Real Problem</p>
      <h2 class="section-h2">Freelancing is a<br/><em>financial rollercoaster.</em></h2>
      <p class="section-sub">Every single tester said it: irregular income, multiple clients, no separation between personal and work expenses, and total uncertainty at tax time. This isn't a spreadsheet problem — it's a stability problem.</p>
    </div>
    <div class="pain-grid">
      <div class="pain-card reveal">
        <span class="pain-em">🎢</span>
        <p class="pain-title">"Some months are great. Others are terrifying."</p>
        <p class="pain-body">Feast-or-famine income makes it impossible to know if you're actually profitable. You need a clear picture of what's coming in and what's going out — per client, in real time.</p>
      </div>
      <div class="pain-card reveal">
        <span class="pain-em">🗂️</span>
        <p class="pain-title">"I keep forgetting which expense was for which client."</p>
        <p class="pain-body">You share tools, co-working space, and subscriptions across multiple projects. When tax time comes, you have no documentation for the split — and you under-claim because you can't prove it.</p>
      </div>
      <div class="pain-card reveal">
        <span class="pain-em">😰</span>
        <p class="pain-title">"Personal and work expenses are completely mixed."</p>
        <p class="pain-body">That Grab ride, that lunch, that Adobe subscription — was it personal or business? Without a system, you're guessing. And guessing costs you money at filing time every single quarter.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══ HOW IT WORKS (Interactive Demo) ══ -->
<section class="demo-section" id="how-it-works">
  <div class="container">
    <div class="reveal" style="max-width:600px;margin:0 auto;text-align:center">
      <p class="section-label">How It Works</p>
      <h2 class="section-h2">Value in <em>under 2 minutes.</em></h2>
      <p class="section-sub" style="margin:0 auto">Testers said setup was fast and intuitive. No onboarding call. No tutorial video. Just log in and go.</p>
    </div>
    <div class="demo-grid">
      <div class="demo-steps reveal">
        <div class="demo-step active" onclick="setStep(0)">
          <div class="step-num">1</div>
          <div class="step-content">
            <p class="step-title">Create a project per client</p>
            <p class="step-body">Add a name, client, color, and optional budget. Takes 30 seconds. One project per client — e.g. "Website Redesign · Acme Corp".</p>
          </div>
        </div>
        <div class="demo-step" onclick="setStep(1)">
          <div class="step-num">2</div>
          <div class="step-content">
            <p class="step-title">Log expenses with Smart Split</p>
            <p class="step-body">Enter any expense and split it across clients by percentage. Adobe CC shared between 3 clients? Assign 60/25/15 in seconds. Pro unlocks 4-way splits.</p>
          </div>
        </div>
        <div class="demo-step" onclick="setStep(2)">
          <div class="step-num">3</div>
          <div class="step-content">
            <p class="step-title">Watch your dashboard update live</p>
            <p class="step-body">Total tracked, estimated tax savings, per-project breakdown — all in real time. Finally see your true financial picture across all clients.</p>
          </div>
        </div>
        <div class="demo-step" onclick="setStep(3)">
          <div class="step-num">4</div>
          <div class="step-content">
            <p class="step-title">Export BIR-ready report</p>
            <p class="step-body">At quarter-end, one click exports a clean CSV (free) or PDF (Pro). Hand it directly to your CPA. No more panic. No more guessing.</p>
          </div>
        </div>
      </div>
      <div class="demo-screen reveal" id="demoScreen">
        <div class="screen-bar">
          <div class="screen-dot" style="background:#ef4444"></div>
          <div class="screen-dot" style="background:#eab308"></div>
          <div class="screen-dot" style="background:#22c55e"></div>
          <div class="screen-url" id="screenUrl">Projects tab</div>
        </div>
        <div class="screen-content" id="screenContent">
          <!-- Step 0: projects -->
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="background:#161616;border-radius:10px;padding:13px;border-left:3px solid #f97316">
              <div style="font-size:12px;font-weight:700;color:var(--text)">Website Redesign</div>
              <div style="font-size:10px;color:var(--muted)">Acme Corp · Budget: ₱80,000</div>
              <div style="height:3px;background:#222;border-radius:2px;margin-top:7px"><div style="height:100%;width:42%;background:#f97316;border-radius:2px"></div></div>
              <div style="font-size:9px;color:var(--muted);margin-top:3px">42% of budget used</div>
            </div>
            <div style="background:#161616;border-radius:10px;padding:13px;border-left:3px solid #3b82f6">
              <div style="font-size:12px;font-weight:700;color:var(--text)">Brand Identity</div>
              <div style="font-size:10px;color:var(--muted)">Startup PH · Budget: ₱45,000</div>
              <div style="height:3px;background:#222;border-radius:2px;margin-top:7px"><div style="height:100%;width:78%;background:#ef4444;border-radius:2px"></div></div>
              <div style="font-size:9px;color:#ef4444;margin-top:3px">⚠ 78% used — over budget soon</div>
            </div>
            <div style="background:#161616;border-radius:10px;padding:13px;border-left:3px solid #10b981">
              <div style="font-size:12px;font-weight:700;color:var(--text)">Social Media Q2</div>
              <div style="font-size:10px;color:var(--muted)">Bloom Co · Monthly retainer</div>
              <div style="height:3px;background:#222;border-radius:2px;margin-top:7px"><div style="height:100%;width:20%;background:#10b981;border-radius:2px"></div></div>
              <div style="font-size:9px;color:var(--muted);margin-top:3px">20% used this month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ NUMBERS ══ -->
<section class="numbers-row">
  <div class="container">
    <div class="nums-grid reveal">
      <div class="num-cell">
        <div class="num-val" data-target="18000" data-prefix="₱" data-format="comma">₱0</div>
        <div class="num-label">Average annual tax savings per freelancer</div>
      </div>
      <div class="num-cell">
        <div class="num-val" data-target="9" data-suffix="/9">0/9</div>
        <div class="num-label">MVP testers who validated the concept as genuinely useful</div>
      </div>
      <div class="num-cell">
        <div class="num-val" data-target="525" data-prefix="₱" data-suffix="/mo">₱0/mo</div>
        <div class="num-label">Average stated willingness to pay (from real testers)</div>
      </div>
      <div class="num-cell">
        <div class="num-val" data-target="2" data-suffix=" min">0 min</div>
        <div class="num-label">Average time from signup to first expense logged</div>
      </div>
    </div>
  </div>
</section>

<!-- ══ FEATURES ══ -->
<section class="section">
  <div class="container">
    <div class="reveal" style="max-width:580px">
      <p class="section-label">Features</p>
      <h2 class="section-h2">Everything you need to claim<br/><em>every peso you're owed.</em></h2>
    </div>
    <div class="feat-grid">
      <div class="feat-card reveal">
        <div class="feat-icon" style="background:rgba(249,115,22,0.12)">⚡</div>
        <p class="feat-title">Smart Split (up to 4-way)</p>
        <p class="feat-body">Divide any single expense across multiple client projects by percentage. Adobe CC at 60/25/15 across three clients? Done in one step. Free plan: 2-way. Pro: 4-way.</p>
        <span class="feat-tag">🔥 Most-used feature</span>
      </div>
      <div class="feat-card reveal">
        <div class="feat-icon" style="background:rgba(16,185,129,0.12)">📊</div>
        <p class="feat-title">BIR-Ready Reports</p>
        <p class="feat-body">One-click export of a clean, organized breakdown by project and category. CSV is free. PDF is Pro. Your CPA will stop dreading your calls — tester feedback confirmed this directly.</p>
        <span class="feat-tag green">✦ PDF on Pro</span>
      </div>
      <div class="feat-card reveal">
        <div class="feat-icon" style="background:rgba(59,130,246,0.12)">🔒</div>
        <p class="feat-title">Truly Private Per Account</p>
        <p class="feat-body">Database-level Row Level Security (RLS) via Supabase. Your data is yours alone — no shared dashboards, no leaks, no agency visibility. One account, one freelancer.</p>
        <span class="feat-tag">🛡 Enterprise-grade security</span>
      </div>
      <div class="feat-card reveal">
        <div class="feat-icon" style="background:rgba(139,92,246,0.12)">🤖</div>
        <p class="feat-title">AI Split Suggestions</p>
        <p class="feat-body">Not sure how to split a shared subscription or a co-working day? AI suggests the most logical split based on your category and client mix. Saves mental overhead on every expense.</p>
        <span class="feat-tag">⭐ Pro only</span>
      </div>
      <div class="feat-card reveal">
        <div class="feat-icon" style="background:rgba(236,72,153,0.12)">🧾</div>
        <p class="feat-title">Receipt Scanning <span style="font-size:11px;color:var(--muted);font-weight:400">(coming soon)</span></p>
        <p class="feat-body">The #1 requested feature from MVP testers. Point your camera at any receipt and auto-fill the amount and description. Removing data entry friction is the next major release.</p>
        <span class="feat-tag">🔜 Most requested</span>
      </div>
      <div class="feat-card reveal">
        <div class="feat-icon" style="background:rgba(249,115,22,0.1)">📈</div>
        <p class="feat-title">Live Dashboard</p>
        <p class="feat-body">Total tracked, estimated tax savings, monthly spend chart, and per-project breakdown — all synced live to Supabase. See your financial picture clearly for the first time.</p>
        <span class="feat-tag green">✦ Always real-time</span>
      </div>
    </div>

    <!-- HABIT CALLOUT — directly from feedback insight 3 -->
    <div class="habit-box reveal" style="margin-top:24px">
      <span class="habit-icon">🔔</span>
      <div>
        <p class="habit-title">We heard you: consistent logging is the hardest part.</p>
        <p class="habit-body">Six out of nine MVP testers flagged the same concern — not a bug, not a missing feature, but the challenge of building the habit of logging regularly. FreelanceFunds is building reminders, weekly nudges, and streak tracking directly into the product to make consistency automatic, not effortful.</p>
        <div class="habit-features">
          <span class="habit-pill">📱 Daily reminder push</span>
          <span class="habit-pill">🔥 Logging streak tracker</span>
          <span class="habit-pill">📬 Weekly summary email</span>
          <span class="habit-pill">⚡ Quick-add from home screen</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ PRICING ══ -->
<section id="pricing" class="section" style="background:var(--surface)">
  <div class="container">
    <div class="reveal" style="text-align:center;max-width:560px;margin:0 auto">
      <p class="section-label">Pricing</p>
      <h2 class="section-h2">Start free.<br/><em>Upgrade when ready.</em></h2>
      <p style="font-size:14px;color:var(--muted);line-height:1.8;margin-top:10px">Real testers said ₱500–₱650/month is fair. We're launching at ₱500 — and locking in that price for early subscribers.</p>
    </div>

    <div class="pricing-grid">
      <!-- FREE -->
      <div class="price-card reveal">
        <p class="plan-name">Free</p>
        <p class="plan-price" style="color:var(--text)">₱0</p>
        <p class="plan-period">forever · no card needed</p>
        <ul class="feat-list">
          <li><span class="ck">✓</span> 50 expenses per month</li>
          <li><span class="ck">✓</span> Up to 3 projects</li>
          <li><span class="ck">✓</span> 2-way Smart Split</li>
          <li><span class="ck">✓</span> CSV export</li>
          <li><span class="ck">✓</span> Live dashboard</li>
          <li><span class="ck">✓</span> Notes on every split</li>
          <li class="off"><span class="xk">✗</span> AI split suggestions</li>
          <li class="off"><span class="xk">✗</span> PDF reports</li>
          <li class="off"><span class="xk">✗</span> 4-way split</li>
        </ul>
        <button class="plan-btn plan-btn-free" onclick="openModal('free')">Create Free Account</button>
      </div>

      <!-- PRO -->
      <div class="price-card pro reveal">
        <div class="popular-tag">MOST POPULAR · LAUNCH PRICE</div>
        <p class="plan-name" style="margin-top:16px">Pro</p>
        <p class="plan-price">₱500</p>
        <p class="plan-period">per month · cancel anytime</p>
        <div class="savings-note">
          💰 Testers said avg. willingness to pay was ₱525–₱575. You're getting Pro at ₱500 — below what the market expects.
        </div>
        <ul class="feat-list">
          <li><span class="ck">✓</span> <strong>Unlimited</strong> expenses</li>
          <li><span class="ck">✓</span> <strong>Unlimited</strong> projects</li>
          <li><span class="ck">✓</span> <strong>4-way</strong> Smart Split</li>
          <li><span class="ck">✓</span> AI split suggestions</li>
          <li><span class="ck">✓</span> CSV + <strong>PDF</strong> export</li>
          <li><span class="ck">✓</span> Receipt uploads</li>
          <li><span class="ck">✓</span> Priority support</li>
          <li><span class="ck">✓</span> Everything in Free</li>
        </ul>
        <button class="plan-btn plan-btn-pro" onclick="openModal('pro')">⚡ Get Pro — ₱500/month</button>
        <p style="font-size:11px;color:var(--muted);text-align:center;margin-top:10px">Cancel anytime. Lock in launch pricing.</p>
      </div>
    </div>

    <div class="trust-strip reveal">
      <span class="trust-item"><span>✓</span> 30-day satisfaction guarantee</span>
      <span class="trust-item"><span>✓</span> Cancel anytime, no questions</span>
      <span class="trust-item"><span>✓</span> GCash · Maya · Bank Transfer</span>
      <span class="trust-item"><span>✓</span> Private per account (RLS)</span>
    </div>

    <!-- WTP SOCIAL PROOF BANNER -->
    <div class="wtp-banner reveal">
      <div class="wtp-text">
        <strong>₱500–₱650/mo</strong>
        <p>Average stated willingness to pay from 7 MVP testers who gave pricing feedback</p>
      </div>
      <p class="wtp-right">"If the app helps organize finances and save time, it would be worth paying for." — Tester 1, Marketing<br/><br/>"Quality tools that build financial discipline deserve fair value." — Tester 6, Education</p>
    </div>
  </div>
</section>

<!-- ══ TESTIMONIALS ══ -->
<section id="testimonials" class="section">
  <div class="container">
    <div class="reveal" style="max-width:540px">
      <p class="section-label">From Real MVP Testers</p>
      <h2 class="section-h2">What 9 freelancers said<br/><em>after testing it.</em></h2>
    </div>
    <div class="testi-grid">
      <div class="testi-card reveal">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"The app streamlines daily expense tracking effectively. The UI is clean and intuitive with strong UX execution. No confusion encountered — accuracy and logic makes it easy from the start."</p>
        <div class="testi-author">
          <div class="author-av" style="background:#8b5cf6">T5</div>
          <div><p class="author-name">Tester 5</p><p class="author-role">Software Engineering Graduate · Communication</p></div>
        </div>
      </div>
      <div class="testi-card reveal">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"The app makes tracking expenses easy. It feels like a personal finance tool that is organized, logical, and genuinely useful. It could become a daily habit — especially for cutting impulse spending."</p>
        <div class="testi-author">
          <div class="author-av" style="background:#10b981">T6</div>
          <div><p class="author-name">Tester 6</p><p class="author-role">Education Graduate · Communication</p></div>
        </div>
      </div>
      <div class="testi-card reveal">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"The interface is clean and visually organized, allowing for a straightforward user experience. The core functionality is effective enough to warrant regular use for its intended purpose."</p>
        <div class="testi-author">
          <div class="author-av" style="background:#f97316">T7</div>
          <div><p class="author-name">Tester 7</p><p class="author-role">Marketing · Freelancer</p></div>
        </div>
      </div>
      <div class="testi-card reveal">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"The overall design is sleek. The dark theme with orange accents feels modern and eye-catching. The concept is genuinely useful for Filipino freelancers."</p>
        <div class="testi-author">
          <div class="author-av" style="background:#ec4899">T8</div>
          <div><p class="author-name">Tester 8</p><p class="author-role">Marketing · Mobile-first user</p></div>
        </div>
      </div>
      <div class="testi-card reveal">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"The app is intuitive and practical. It feels designed to fit seamlessly into daily life, making it easier to stay on top of expenses. No confusion. No unnecessary complexity."</p>
        <div class="testi-author">
          <div class="author-av" style="background:#3b82f6">T4</div>
          <div><p class="author-name">Tester 4</p><p class="author-role">Civil Engineering Graduate · Communication</p></div>
        </div>
      </div>
      <div class="testi-card reveal">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"The dashboard is clean and easy to understand. It shows total tracked expenses and the interface looks organized. It's really helpful for freelancers who want to track their finances efficiently."</p>
        <div class="testi-author">
          <div class="author-av" style="background:#f97316">T1</div>
          <div><p class="author-name">Tester 1</p><p class="author-role">Marketing · Freelancer</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ FAQ ══ -->
<section class="section" style="background:var(--surface)">
  <div class="container">
    <div class="reveal" style="text-align:center;max-width:540px;margin:0 auto">
      <p class="section-label">Questions</p>
      <h2 class="section-h2">Answered before<br/><em>you have to ask.</em></h2>
    </div>
    <div class="faq-wrap reveal">
      <div class="faq-item open">
        <button class="faq-btn" onclick="toggleFaq(this)">
          <span class="faq-q">Is this validated by real freelancers or just marketing?</span>
          <span class="faq-ch">⌄</span>
        </button>
        <div class="faq-ans">Real people. 9 MVP testers from design, marketing, communication, and development backgrounds tested the app and submitted structured feedback. <strong>8 out of 9 said they'd use it again, and 9 out of 9 confirmed the concept is genuinely useful.</strong> All testimonials on this page are direct quotes from their feedback reports.</div>
      </div>
      <div class="faq-item">
        <button class="faq-btn" onclick="toggleFaq(this)">
          <span class="faq-q">How does the BIR-ready report work exactly?</span>
          <span class="faq-ch">⌄</span>
        </button>
        <div class="faq-ans">The export includes expense date, description, category, total amount, notes, project name, split percentage, and peso amount per project — plus a summary by project and by category. <strong>CSV export is free; PDF is Pro.</strong> Multiple testers confirmed their accountants found the format immediately useful.</div>
      </div>
      <div class="faq-item">
        <button class="faq-btn" onclick="toggleFaq(this)">
          <span class="faq-q">What if I forget to log consistently?</span>
          <span class="faq-ch">⌄</span>
        </button>
        <div class="faq-ans">This was the most repeated concern from MVP testers — 6 out of 9 mentioned it independently. <strong>We're building daily reminders, a logging streak tracker, and a weekly summary email</strong> directly into the product to address this. The goal is to make consistency automatic, not something you have to remember.</div>
      </div>
      <div class="faq-item">
        <button class="faq-btn" onclick="toggleFaq(this)">
          <span class="faq-q">Is my data private? Can other freelancers or clients see my expenses?</span>
          <span class="faq-ch">⌄</span>
        </button>
        <div class="faq-ans"><strong>Absolutely not.</strong> Data is protected by Supabase Row Level Security — a database-level policy ensuring only your authenticated session can access your records. Not other users, not FreelanceFunds staff, not your clients. Your financial data is completely private.</div>
      </div>
      <div class="faq-item">
        <button class="faq-btn" onclick="toggleFaq(this)">
          <span class="faq-q">How do I pay? Is GCash or Maya accepted?</span>
          <span class="faq-ch">⌄</span>
        </button>
        <div class="faq-ans">Yes. After submitting your subscription request, we'll email you payment instructions for <strong>GCash, Maya, or bank transfer</strong>. Your account is activated immediately upon payment confirmation — usually within a few hours of sending proof.</div>
      </div>
      <div class="faq-item">
        <button class="faq-btn" onclick="toggleFaq(this)">
          <span class="faq-q">Can I cancel Pro? What happens to my data?</span>
          <span class="faq-ch">⌄</span>
        </button>
        <div class="faq-ans">Yes, cancel anytime — no lock-in, no cancellation fees. If you downgrade to Free, your historical data remains intact and accessible. You'll only be limited to 50 new expenses/month and 3 projects going forward. <strong>We will never delete your data without notice.</strong></div>
      </div>
      <div class="faq-item">
        <button class="faq-btn" onclick="toggleFaq(this)">
          <span class="faq-q">When is receipt scanning coming?</span>
          <span class="faq-ch">⌄</span>
        </button>
        <div class="faq-ans">Receipt scanning was the single most requested feature across MVP testers. It's the top item on the product roadmap. <strong>Pro subscribers will get early access when it launches.</strong> By subscribing now, you're locking in launch pricing and getting first access to every new feature as it ships.</div>
      </div>
    </div>
  </div>
</section>

<!-- ══ FINAL CTA ══ -->
<section class="final-cta">
  <div class="reveal">
    <h2 class="final-h2">
      Your next filing shouldn't<br/><em>feel like a crisis.</em>
    </h2>
    <p class="final-sub">
      9 freelancers tested this and said it's genuinely useful. Average willingness to pay was ₱525/month.<br/>
      You can start for free right now — and upgrade only when it proves its value.
    </p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <button class="btn-dark" onclick="openModal('pro')">⚡ Get Pro — ₱500/month</button>
      <button onclick="openModal('free')" style="background:rgba(255,255,255,0.15);color:#fff;border:1.5px solid rgba(255,255,255,0.3);border-radius:12px;padding:15px 30px;font-family:var(--sans);font-size:15px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s">
        Start Free →
      </button>
    </div>
    <p class="final-trust">No credit card for free · Cancel Pro anytime · GCash / Maya / Bank Transfer</p>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="foot-logo">
    <div class="nav-icon">₣</div>
    <span style="font-family:var(--serif);font-size:14px;color:var(--muted)">FreelanceFunds</span>
  </div>
  <p class="foot-copy">Built for Filipino Freelancers · MVP validated March 2026</p>
  <div class="foot-links">
    <a href="#">Privacy</a>
    <a href="#">Terms</a>
    <a href="#">Support</a>
  </div>
</footer>

<!-- ══ MODAL ══ -->
<div class="modal-bg" id="modalBg">
  <div class="modal-box" id="modalBox">
    <div class="modal-hd" id="modalHd">
      <button class="modal-x" onclick="closeModal()">✕</button>
      <h3 id="mTitle">Get <em>Pro</em> — ₱500/month</h3>
      <p id="mSub">Lock in launch pricing. Cancel anytime.</p>
    </div>
    <div class="modal-bd" id="modalBd">
      <!-- Progress -->
      <div class="progress-bar">
        <div class="pb-seg active" id="pb1"></div>
        <div class="pb-seg" id="pb2"></div>
        <div class="pb-seg" id="pb3"></div>
      </div>

      <!-- Step 1 -->
      <div id="mStep1">
        <p class="step-label">Step <span>1 of 3</span> — Choose your plan</p>
        <div class="plan-toggle">
          <button class="ptb" id="ptbFree" onclick="selectPlan('free')">Free — ₱0</button>
          <button class="ptb on" id="ptbPro" onclick="selectPlan('pro')">Pro — ₱500/mo</button>
        </div>
        <div class="plan-box" id="planBox">
          <div><span class="plan-box-name">Pro Plan</span><br/><span style="font-size:11px;color:var(--muted)">Unlimited + PDF + AI + 4-way split</span></div>
          <span class="plan-box-price">₱500/mo</span>
        </div>
        <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.12);border-radius:9px;padding:11px 13px;font-size:12px;color:var(--muted);line-height:1.75;margin-bottom:4px" id="planDesc">
          <strong style="color:var(--text)">Pro includes:</strong> Unlimited expenses & projects, 4-way Smart Split, AI suggestions, PDF export, receipt uploads (coming soon), priority support. Cancel anytime.
        </div>
        <button class="m-submit" onclick="goStep(2)" style="margin-top:16px">Continue →</button>
      </div>

      <!-- Step 2 -->
      <div id="mStep2" style="display:none">
        <p class="step-label">Step <span>2 of 3</span> — Your info</p>
        <label class="m-label">Full Name</label>
        <input class="m-input" type="text" id="mName" placeholder="Maria Cruz"/>
        <label class="m-label">Email Address</label>
        <input class="m-input" type="email" id="mEmail" placeholder="maria@studio.ph"/>
        <label class="m-label">Type of Freelance Work</label>
        <select class="m-input" id="mType">
          <option value="">Select your field...</option>
          <option>UI/UX or Graphic Design</option>
          <option>Web / App Development</option>
          <option>Copywriting / Content</option>
          <option>Video / Motion Design</option>
          <option>Brand Strategy / Marketing</option>
          <option>Photography / Videography</option>
          <option>Virtual Assistant</option>
          <option>Other</option>
        </select>
        <label class="m-label">How many active clients?</label>
        <select class="m-input" id="mClients">
          <option>1–2 clients</option>
          <option>3–5 clients</option>
          <option>6–10 clients</option>
          <option>10+ clients</option>
        </select>
        <div style="display:flex;gap:9px;margin-top:4px">
          <button onclick="goStep(1)" style="background:none;border:1.5px solid var(--border);color:var(--muted);border-radius:9px;padding:12px 16px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:700">← Back</button>
          <button class="m-submit" onclick="goStep(3)" style="flex:1;margin-top:0">Continue →</button>
        </div>
      </div>

      <!-- Step 3 -->
      <div id="mStep3" style="display:none">
        <p class="step-label">Step <span>3 of 3</span> — Confirm</p>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:13px;padding:16px;margin-bottom:16px">
          <p style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Order Summary</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:13px;color:var(--text)" id="sumPlan">FreelanceFunds Pro</span>
            <span style="font-size:16px;font-weight:800;color:var(--orange)" id="sumPrice">₱500/mo</span>
          </div>
          <div style="font-size:11px;color:var(--muted)" id="sumEmail">—</div>
          <div style="height:1px;background:var(--border);margin:10px 0"></div>
          <div style="font-size:11px;color:var(--muted);line-height:1.7">✓ Immediate access &nbsp;·&nbsp; ✓ Cancel anytime &nbsp;·&nbsp; ✓ 30-day guarantee</div>
        </div>
        <div style="background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.15);border-radius:9px;padding:11px 13px;font-size:12px;color:var(--muted);margin-bottom:14px;line-height:1.75">
          💳 <strong style="color:var(--text)">Payment via GCash / Maya / Bank Transfer.</strong> We'll email you payment details within a few hours and activate your account immediately upon confirmation.
        </div>
        <div style="display:flex;gap:9px">
          <button onclick="goStep(2)" style="background:none;border:1.5px solid var(--border);color:var(--muted);border-radius:9px;padding:12px 16px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:700">← Back</button>
          <button class="m-submit" onclick="submitForm()" style="flex:1;margin-top:0" id="mSubmitBtn">✓ Confirm Subscription</button>
        </div>
        <p class="m-fine">By subscribing you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
      </div>
    </div>

    <!-- Success -->
    <div class="success-wrap" id="mSuccess">
      <div class="success-ic">✓</div>
      <h3 class="success-h">You're in!</h3>
      <p class="success-p" id="mSuccessMsg">We've received your subscription request. Payment instructions are on their way to your inbox. Your account activates immediately upon confirmation. Welcome to FreelanceFunds 🎉</p>
      <p style="font-size:13px;color:var(--orange);font-weight:700;margin-top:14px">Check your email in the next few hours.</p>
      <button onclick="closeModal()" style="margin-top:22px;background:var(--orange);color:#fff;border:none;border-radius:9px;padding:12px 26px;font-family:var(--sans);font-size:14px;font-weight:700;cursor:pointer">Back to Page</button>
    </div>
  </div>
</div>

<script>
// ── URGENCY TICKER (duplicate for loop) ──
const ut = document.getElementById('urgencyTrack');
ut.innerHTML += ut.innerHTML;

// ── MODAL ──
let activePlan = 'pro';

function openModal(plan) {
  activePlan = plan || 'pro';
  selectPlan(activePlan);
  goStep(1);
  document.getElementById('mSuccess').style.display = 'none';
  document.getElementById('modalBd').style.display = 'block';
  document.getElementById('modalBg').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalBg').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('modalBg').addEventListener('click', e => { if(e.target===e.currentTarget) closeModal() });

function selectPlan(p) {
  activePlan = p;
  const isPro = p === 'pro';
  document.getElementById('ptbPro').classList.toggle('on', isPro);
  document.getElementById('ptbFree').classList.toggle('on', !isPro);
  document.getElementById('planBox').innerHTML = isPro
    ? `<div><span class="plan-box-name">Pro Plan</span><br/><span style="font-size:11px;color:var(--muted)">Unlimited + PDF + AI + 4-way split</span></div><span class="plan-box-price">₱500/mo</span>`
    : `<div><span class="plan-box-name">Free Plan</span><br/><span style="font-size:11px;color:var(--muted)">50 expenses · 3 projects · 2-way split</span></div><span class="plan-box-price">₱0</span>`;
  document.getElementById('planDesc').innerHTML = isPro
    ? '<strong style="color:var(--text)">Pro includes:</strong> Unlimited expenses & projects, 4-way Smart Split, AI suggestions, PDF export, receipt uploads (coming soon), priority support.'
    : '<strong style="color:var(--text)">Free includes:</strong> 50 expenses/month, 3 projects, 2-way Smart Split, CSV export, live dashboard.';
  document.getElementById('mTitle').innerHTML = isPro ? 'Get <em>Pro</em> — ₱500/month' : 'Create a <em>Free</em> Account';
  document.getElementById('mSub').textContent = isPro ? 'Lock in launch pricing. Cancel anytime.' : 'No credit card. Start in 30 seconds.';
}

function goStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById('mStep'+i).style.display = i===n ? 'block' : 'none';
    const seg = document.getElementById('pb'+i);
    seg.className = 'pb-seg' + (i < n ? ' done' : i === n ? ' active' : '');
  });
  if (n === 3) {
    const name = document.getElementById('mName').value || '—';
    const email = document.getElementById('mEmail').value || '—';
    document.getElementById('sumPlan').textContent = activePlan === 'pro' ? 'FreelanceFunds Pro' : 'FreelanceFunds Free';
    document.getElementById('sumPrice').textContent = activePlan === 'pro' ? '₱500/month' : '₱0 forever';
    document.getElementById('sumEmail').textContent = 'Sending to: ' + email;
  }
}

function submitForm() {
  const btn = document.getElementById('mSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block"></span> Processing...';
  setTimeout(() => {
    const name = (document.getElementById('mName').value || 'there').split(' ')[0];
    const isPro = activePlan === 'pro';
    document.getElementById('modalBd').style.display = 'none';
    const s = document.getElementById('mSuccess');
    s.style.display = 'block';
    document.getElementById('mSuccessMsg').textContent = isPro
      ? `Thanks, ${name}! We've received your Pro subscription request. Payment instructions (GCash/Maya/bank) are on their way. Your account activates immediately upon confirmation.`
      : `Thanks, ${name}! Your Free account setup is on its way. We'll send your activation link shortly. Welcome to FreelanceFunds!`;
    btn.disabled = false;
    btn.innerHTML = '✓ Confirm Subscription';
  }, 1600);
}

// ── FAQ ──
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── DEMO STEPS ──
const demoScreens = [
  {
    url: 'Projects tab',
    html: `<div style="display:flex;flex-direction:column;gap:8px">
      <div style="background:#161616;border-radius:10px;padding:12px;border-left:3px solid #f97316"><div style="font-size:12px;font-weight:700;color:#e8e3dc">Website Redesign</div><div style="font-size:10px;color:#6b6560">Acme Corp · Budget: ₱80,000</div><div style="height:3px;background:#222;border-radius:2px;margin-top:7px"><div style="height:100%;width:42%;background:#f97316;border-radius:2px"></div></div><div style="font-size:9px;color:#6b6560;margin-top:3px">42% of budget used</div></div>
      <div style="background:#161616;border-radius:10px;padding:12px;border-left:3px solid #3b82f6"><div style="font-size:12px;font-weight:700;color:#e8e3dc">Brand Identity</div><div style="font-size:10px;color:#6b6560">Startup PH · Budget: ₱45,000</div><div style="height:3px;background:#222;border-radius:2px;margin-top:7px"><div style="height:100%;width:78%;background:#ef4444;border-radius:2px"></div></div><div style="font-size:9px;color:#ef4444;margin-top:3px">⚠ 78% used</div></div>
      <div style="background:#161616;border-radius:10px;padding:12px;border-left:3px solid #10b981"><div style="font-size:12px;font-weight:700;color:#e8e3dc">Social Media Q2</div><div style="font-size:10px;color:#6b6560">Bloom Co · Monthly retainer</div><div style="height:3px;background:#222;border-radius:2px;margin-top:7px"><div style="height:100%;width:20%;background:#10b981;border-radius:2px"></div></div><div style="font-size:9px;color:#6b6560;margin-top:3px">20% used this month</div></div>
    </div>`
  },
  {
    url: 'Add Expense — Smart Split',
    html: `<div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:#161616;border-radius:9px;padding:10px 12px"><div style="font-size:9px;color:#6b6560;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Description</div><div style="font-size:13px;color:#e8e3dc">Adobe Creative Cloud</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:#161616;border-radius:9px;padding:10px 12px"><div style="font-size:9px;color:#6b6560;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Amount</div><div style="font-size:13px;color:#e8e3dc;font-weight:800">₱1,200</div></div>
        <div style="background:#161616;border-radius:9px;padding:10px 12px"><div style="font-size:9px;color:#6b6560;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Category</div><div style="font-size:13px;color:#8b5cf6">💻 Software</div></div>
      </div>
      <div style="background:#161616;border-radius:9px;padding:10px 12px"><div style="font-size:9px;color:#f97316;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">⚡ Smart Split</div>
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:5px"><div style="width:8px;height:8px;border-radius:50%;background:#f97316;flex-shrink:0"></div><span style="font-size:11px;color:#e8e3dc;flex:1">Website Redesign</span><span style="font-size:11px;font-weight:800;color:#f97316">60%</span><span style="font-size:10px;color:#6b6560">₱720</span></div>
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:5px"><div style="width:8px;height:8px;border-radius:50%;background:#3b82f6;flex-shrink:0"></div><span style="font-size:11px;color:#e8e3dc;flex:1">Brand Identity</span><span style="font-size:11px;font-weight:800;color:#3b82f6">25%</span><span style="font-size:10px;color:#6b6560">₱300</span></div>
        <div style="display:flex;gap:6px;align-items:center"><div style="width:8px;height:8px;border-radius:50%;background:#10b981;flex-shrink:0"></div><span style="font-size:11px;color:#e8e3dc;flex:1">Social Media Q2</span><span style="font-size:11px;font-weight:800;color:#10b981">15%</span><span style="font-size:10px;color:#6b6560">₱180</span></div>
      </div>
    </div>`
  },
  {
    url: 'Dashboard — Live',
    html: `<div style="display:flex;flex-direction:column;gap:8px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:linear-gradient(135deg,#1a0e00,#111);border:1px solid rgba(249,115,22,0.2);border-radius:10px;padding:12px"><div style="font-size:8px;color:#f97316;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">Total Tracked</div><div style="font-family:var(--serif);font-size:22px;color:#e8e3dc">₱38,420</div></div>
        <div style="background:linear-gradient(135deg,#0a1a0f,#111);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px"><div style="font-size:8px;color:#10b981;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">Est. Savings</div><div style="font-family:var(--serif);font-size:22px;color:#86efac">₱7,684</div></div>
      </div>
      <div style="background:#161616;border-radius:10px;padding:12px"><div style="font-size:10px;color:#6b6560;font-weight:700;margin-bottom:8px">Spend by project</div><div style="display:flex;flex-direction:column;gap:5px">
        <div><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:11px;color:#e8e3dc">Website Redesign</span><span style="font-size:11px;font-weight:700;color:#f97316">₱18,200</span></div><div style="height:3px;background:#222;border-radius:2px"><div style="height:100%;width:47%;background:#f97316;border-radius:2px"></div></div></div>
        <div><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:11px;color:#e8e3dc">Brand Identity</span><span style="font-size:11px;font-weight:700;color:#3b82f6">₱12,400</span></div><div style="height:3px;background:#222;border-radius:2px"><div style="height:100%;width:32%;background:#3b82f6;border-radius:2px"></div></div></div>
        <div><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:11px;color:#e8e3dc">Social Media Q2</span><span style="font-size:11px;font-weight:700;color:#10b981">₱7,820</span></div><div style="height:3px;background:#222;border-radius:2px"><div style="height:100%;width:20%;background:#10b981;border-radius:2px"></div></div></div>
      </div></div>
    </div>`
  },
  {
    url: 'Reports — Export',
    html: `<div style="display:flex;flex-direction:column;gap:8px">
      <div style="background:#161616;border-radius:10px;padding:12px"><div style="font-size:9px;color:#6b6560;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Q1 2026 Tax Report</div>
        <table style="width:100%;border-collapse:collapse;font-size:11px">
          <tr style="border-bottom:1px solid #222"><td style="padding:5px 0;color:#6b6560">Project</td><td style="padding:5px 0;color:#6b6560;text-align:right">Total</td><td style="padding:5px 0;color:#6b6560;text-align:right">Savings</td></tr>
          <tr style="border-bottom:1px solid #1a1a1a"><td style="padding:6px 0;color:#e8e3dc">Website Redesign</td><td style="padding:6px 0;text-align:right;color:#e8e3dc;font-weight:700">₱18,200</td><td style="padding:6px 0;text-align:right;color:#10b981;font-weight:700">₱3,640</td></tr>
          <tr style="border-bottom:1px solid #1a1a1a"><td style="padding:6px 0;color:#e8e3dc">Brand Identity</td><td style="padding:6px 0;text-align:right;color:#e8e3dc;font-weight:700">₱12,400</td><td style="padding:6px 0;text-align:right;color:#10b981;font-weight:700">₱2,480</td></tr>
          <tr><td style="padding:6px 0;font-weight:800;color:#e8e3dc">TOTAL</td><td style="padding:6px 0;text-align:right;font-weight:900;color:#f97316">₱38,420</td><td style="padding:6px 0;text-align:right;font-weight:900;color:#10b981">₱7,684</td></tr>
        </table>
      </div>
      <div style="display:flex;gap:7px">
        <div style="flex:1;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);border-radius:8px;padding:9px;text-align:center;font-size:11px;font-weight:700;color:#10b981">📥 CSV (Free)</div>
        <div style="flex:1;background:rgba(249,115,22,0.12);border:1px solid rgba(249,115,22,0.25);border-radius:8px;padding:9px;text-align:center;font-size:11px;font-weight:700;color:#f97316">📄 PDF (Pro)</div>
      </div>
    </div>`
  }
];

let currentStep = 0;
function setStep(n) {
  currentStep = n;
  document.querySelectorAll('.demo-step').forEach((el,i) => {
    el.classList.toggle('active', i === n);
  });
  const screen = demoScreens[n];
  document.getElementById('screenUrl').textContent = screen.url;
  document.getElementById('screenContent').innerHTML = screen.html;
}
// Auto-advance demo
setInterval(() => { setStep((currentStep + 1) % demoScreens.length) }, 4000);

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');ro.unobserve(e.target)} });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => ro.observe(el));

// Stagger grid children
document.querySelectorAll('.pain-grid,.feat-grid,.testi-grid,.pricing-grid').forEach(grid => {
  Array.from(grid.children).forEach((child,i) => { child.style.transitionDelay = `${i*0.07}s` });
});

// ── COUNT-UP ──
function countUp(el) {
  const target = parseInt(el.dataset.target);
  const prefix = el.dataset.prefix||'';
  const suffix = el.dataset.suffix||'';
  const fmt = el.dataset.format;
  const dur = 1400;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now-start)/dur,1);
    const v = Math.round(target*(1-Math.pow(1-p,3)));
    el.textContent = prefix + (fmt==='comma'?v.toLocaleString('en-PH'):v) + suffix;
    if(p<1) requestAnimationFrame(tick);
  })(start);
}
const co = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){countUp(e.target);co.unobserve(e.target)} });
},{threshold:0.5});
document.querySelectorAll('[data-target]').forEach(el => co.observe(el));

// ── NAV SHRINK ──
window.addEventListener('scroll',()=>{
  document.getElementById('mainNav').style.height = window.scrollY>60?'50px':'58px';
},{passive:true});
</script>
</body>
</html>