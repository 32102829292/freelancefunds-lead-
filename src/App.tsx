import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Receipt, FolderOpen, FileBarChart2, Plus, Pencil, Trash2, X, Check,
  ChevronRight, ChevronLeft, Sun, Moon, Zap, Download, Search, ArrowUpDown, ListFilter,
  Utensils, Car, Monitor, Package, Building2, Megaphone, Smartphone, Paperclip,
  TrendingUp, Clock, Folder, Tag, BarChart3, PieChart, AlertTriangle, Star,
  StickyNote, BookOpen, HelpCircle, CheckCircle2, Sparkles, Shield, Database,
  RefreshCw, ArrowRight, Info, Wallet, FileText, Share2, Lock, Unlock, Trophy,
  LogOut, User, CheckCircle, ArrowRightCircle, Gift, LogIn, UserPlus, Mail, Eye, EyeOff
} from "lucide-react";

/* ─── Constants ─── */
const CATEGORIES = ["Meals","Transport","Software","Equipment","Office","Marketing","Communication","Other"];
const CAT_META = {
  Meals:         { Icon: Utensils,  color: "#f97316" },
  Transport:     { Icon: Car,       color: "#3b82f6" },
  Software:      { Icon: Monitor,   color: "#8b5cf6" },
  Equipment:     { Icon: Package,   color: "#06b6d4" },
  Office:        { Icon: Building2, color: "#64748b" },
  Marketing:     { Icon: Megaphone, color: "#ec4899" },
  Communication: { Icon: Smartphone,color: "#10b981" },
  Other:         { Icon: Paperclip, color: "#94a3b8" },
};
const PALETTE = ["#f97316","#3b82f6","#10b981","#a855f7","#ef4444","#eab308","#06b6d4","#6366f1","#ec4899","#14b8a6"];
const FREE_EXP = 50, FREE_PROJ = 3;
const fmt = n => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 });
const pClr = (projects,pid) => projects.find(p=>p.id===pid)?.color||"#888";
const pNm  = (projects,pid) => projects.find(p=>p.id===pid)?.name||"Unknown";

/* ─── Tiny helpers ─── */
const DonutChart = ({ segments, size=88 }) => {
  const r=28,cx=40,cy=40,circ=2*Math.PI*r; let off=0;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="12"/>
      {segments.map((s,i)=>{ const dash=(s.pct/100)*circ; const arc={dash,offset:off,color:s.color}; off+=dash;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color} strokeWidth="12"
          strokeDasharray={`${arc.dash} ${circ-arc.dash}`} strokeDashoffset={circ/4-arc.offset}
          style={{transition:"stroke-dasharray .6s ease"}}/>;
      })}
    </svg>
  );
};
const SplitBar = ({ splits, projects }) => (
  <div style={{display:"flex",height:4,borderRadius:3,overflow:"hidden",gap:1}}>
    {splits.map((s,i)=>(
      <div key={i} style={{width:`${s.pct}%`,background:pClr(projects,s.pid),
        borderRadius:i===0?"3px 0 0 3px":i===splits.length-1?"0 3px 3px 0":0,transition:"width .4s ease"}}/>
    ))}
  </div>
);
const Toast = ({ msg, type }) => {
  const bg={error:"#dc2626",warning:"#d97706",success:"#111"}[type]||"#111";
  const Ic={error:X,warning:AlertTriangle,success:CheckCircle2}[type]||CheckCircle2;
  return (
    <div style={{position:"fixed",bottom:96,left:"50%",transform:"translateX(-50%)",background:bg,color:"#fff",
      padding:"11px 20px",borderRadius:30,fontSize:13,fontWeight:700,zIndex:9999,pointerEvents:"none",
      whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,.5)",animation:"toastIn .25s ease",
      border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",gap:8}}>
      <Ic size={14}/> {msg}
    </div>
  );
};

/* ─── Onboarding ─── */
const ONBOARDING_STEPS = [
  { title:"Welcome to FreelanceFunds! 🎉", description:"Your all-in-one expense tracker built for Filipino freelancers.",
    tip:"You can replay this guide anytime from the Help button.", icon:<Gift size={32} color="#f97316"/>, iconBg:"rgba(249,115,22,0.15)", accent:"#f97316" },
  { title:"Create Your First Project", description:"Projects represent your clients or ongoing work.",
    tip:"Name projects clearly, like 'Website Redesign - Acme Corp'.", icon:<FolderOpen size={32} color="#3b82f6"/>, iconBg:"rgba(59,130,246,0.15)", accent:"#3b82f6" },
  { title:"Log Your First Expense", description:"Record every business expense you make.",
    tip:"Log expenses right after spending to avoid forgetting.", icon:<Receipt size={32} color="#10b981"/>, iconBg:"rgba(16,185,129,0.15)", accent:"#10b981" },
  { title:"Smart Split Feature ✨", description:"Share expenses across multiple projects!",
    tip:"Use the Auto button to split equally, or set custom percentages.", icon:<Zap size={32} color="#8b5cf6"/>, iconBg:"rgba(139,92,246,0.15)", accent:"#8b5cf6" },
  { title:"Track Your Tax Savings", description:"Watch your estimated tax savings grow automatically.",
    tip:"Confirm your actual tax rate with a licensed CPA.", icon:<Shield size={32} color="#10b981"/>, iconBg:"rgba(16,185,129,0.15)", accent:"#10b981" },
  { title:"Generate Reports for BIR", description:"Export CSV reports for your accountant.",
    tip:"Save your reports alongside physical receipts.", icon:<FileBarChart2 size={32} color="#ec4899"/>, iconBg:"rgba(236,72,153,0.15)", accent:"#ec4899" },
  { title:"You're All Set! 🚀", description:"Start tracking your expenses and save money on taxes.",
    tip:"Upgrade to Pro for unlimited expenses and premium features.", icon:<Trophy size={32} color="#f97316"/>, iconBg:"rgba(249,115,22,0.15)", accent:"#f97316" },
];
const OnboardingGuide = ({ onClose, steps, currentStep, onNext, onPrev, onSkip, tk }) => {
  const step = steps[currentStep];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,backdropFilter:"blur(8px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:tk.card,borderRadius:28,maxWidth:480,width:"100%",overflow:"hidden",
        boxShadow:"0 32px 64px rgba(0,0,0,.4)",animation:"slideUp 0.3s ease"}}>
        <div style={{padding:"32px 28px",textAlign:"center"}}>
          <div style={{width:72,height:72,borderRadius:20,background:step.iconBg,
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>{step.icon}</div>
          <h3 style={{fontSize:24,fontWeight:700,marginBottom:8,color:step.accent}}>{step.title}</h3>
          <p style={{fontSize:14,color:tk.muted,marginBottom:16,lineHeight:1.6}}>{step.description}</p>
          <div style={{background:tk.D?"#1a1200":"#fff7ed",borderLeft:"3px solid #f97316",borderRadius:8,
            padding:"12px 16px",marginBottom:24,textAlign:"left"}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <Sparkles size={14} color="#f97316" style={{marginTop:2}}/>
              <p style={{fontSize:12,color:tk.D?"#d97706":"#78350f",lineHeight:1.5}}><strong>Pro Tip:</strong> {step.tip}</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24}}>
            {steps.map((_,i)=>(
              <div key={i} style={{width:i===currentStep?24:8,height:8,borderRadius:4,
                background:i===currentStep?"#f97316":i<currentStep?"#10b981":tk.brd,transition:"all 0.3s ease"}}/>
            ))}
          </div>
          <div style={{display:"flex",gap:12}}>
            {currentStep>0&&<button onClick={onPrev} style={{flex:1,padding:"12px 20px",background:"transparent",
              border:`1.5px solid ${tk.brd}`,borderRadius:12,fontSize:14,fontWeight:600,color:tk.muted,cursor:"pointer"}}>← Previous</button>}
            <button onClick={onNext} style={{flex:currentStep>0?1:2,padding:"12px 20px",background:"#f97316",
              border:"none",borderRadius:12,fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {currentStep===steps.length-1?<><CheckCircle size={16}/>Get Started</>:<>Next<ArrowRightCircle size={16}/></>}
            </button>
          </div>
          <button onClick={onSkip} style={{marginTop:16,background:"none",border:"none",fontSize:12,color:tk.muted,cursor:"pointer",textDecoration:"underline"}}>Skip guide</button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════ */
const LandingPage = ({ onLogin }) => {
  const [scrolled, setScrolled]   = useState(false);
  const [faqOpen, setFaqOpen]     = useState(null);
  const [isMobile, setIsMobile]   = useState(false);
  const [timeLeft, setTimeLeft]   = useState({ days:7, hrs:0, min:0, sec:0 });

  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768); fn();
    window.addEventListener("resize",fn); return()=>window.removeEventListener("resize",fn);
  },[]);
  useEffect(()=>{
    const f=()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",f,{passive:true}); return()=>window.removeEventListener("scroll",f);
  },[]);
  useEffect(()=>{
    const end=Date.now()+7*24*60*60*1000;
    const tick=()=>{const d=Math.max(0,end-Date.now());setTimeLeft({
      days:Math.floor(d/(1000*60*60*24)),hrs:Math.floor((d%(1000*60*60*24))/(1000*60*60)),
      min:Math.floor((d%(1000*60*60))/(1000*60)),sec:Math.floor((d%(1000*60))/1000)});};
    tick(); const id=setInterval(tick,1000); return()=>clearInterval(id);
  },[]);
  const pad=n=>String(n).padStart(2,"0");

  const faqs=[
    {q:"Is my data private?",a:"Yes — 100%. Each account sees only its own data protected with row-level security. No one else can see your financials."},
    {q:"Is this actually BIR-compliant?",a:"FreelanceFunds generates a clear, itemized breakdown by project and category that your accountant can use. Always confirm with a licensed CPA."},
    {q:"Can I cancel anytime?",a:"Absolutely. Cancel your Pro subscription at any time with one click. You keep Pro features until the end of your billing period."},
    {q:'What is the "Founding Member" price?',a:"The first 50 subscribers get ₱500/month locked in forever — even as the product grows and the price may increase."},
    {q:"What happens if I downgrade to Free?",a:"Your data stays safe. You'll just be limited to 50 expenses and 3 projects going forward."},
    {q:"Does it work on mobile?",a:"Yes — fully responsive. The app works on mobile browsers and is actively being improved."},
    {q:"When is receipt scanning coming?",a:"Receipt scanning is our #1 most-requested feature and is in development now. Pro subscribers get early access."},
  ];

  const testimonials=[
    {stars:5,text:'"The dashboard is clean and shows total tracked expenses with useful insights like estimated tax savings."',name:"Maria C.",role:"Freelance Designer",color:"#f97316",initial:"M"},
    {stars:5,text:'"Streamlines daily expense tracking effectively. Clean, intuitive, with strong UX execution."',name:"Jerick P.",role:"Software Engineer",color:"#8b5cf6",initial:"J"},
    {stars:5,text:'"Genuinely useful for Filipino freelancers. Sleek design with a modern dark theme."',name:"Raine B.",role:"Freelance Copywriter",color:"#10b981",initial:"R"},
  ];

  const features=[
    {icon:"⚡",title:"Smart Split",desc:"Allocate one expense across multiple clients automatically."},
    {icon:"📊",title:"BIR-Ready Reports",desc:"Export clean CSVs your accountant can use directly."},
    {icon:"💰",title:"Tax Savings Tracker",desc:"See your estimated deductions grow in real time."},
    {icon:"📁",title:"Project Budgets",desc:"Set budgets and get alerts before you overspend."},
    {icon:"📱",title:"Mobile-First",desc:"Track on the go — works perfectly on any screen."},
    {icon:"🔒",title:"Private & Secure",desc:"Your data is encrypted and visible only to you."},
  ];

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#faf8f4",color:"#0f0e0d",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .lp-fade{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both}
        .lp-fade-1{animation:fadeUp .6s .1s cubic-bezier(.16,1,.3,1) both}
        .lp-fade-2{animation:fadeUp .6s .2s cubic-bezier(.16,1,.3,1) both}
        .lp-fade-3{animation:fadeUp .6s .3s cubic-bezier(.16,1,.3,1) both}
        .lp-fade-4{animation:fadeUp .6s .4s cubic-bezier(.16,1,.3,1) both}
        .lp-float{animation:float 5s ease-in-out infinite}
        .pulse-dot{width:7px;height:7px;border-radius:50%;background:#f97316;position:relative;display:inline-block}
        .pulse-dot::after{content:'';position:absolute;inset:0;border-radius:50%;background:#f97316;animation:pulse-ring 1.5s cubic-bezier(.4,0,.6,1) infinite}
        .ticker-inner{display:inline-flex;white-space:nowrap;animation:ticker 32s linear infinite}
        .lp-btn-primary:hover{background:#ea6c0a!important;transform:translateY(-2px);box-shadow:0 12px 36px rgba(249,115,22,0.4)!important}
        .lp-btn-ghost:hover{background:rgba(255,255,255,0.08)!important;color:#e8e3dc!important}
        .faq-item:hover{background:#f5f3ef}
        .feature-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.06)!important}
        .testi-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,.08)!important}
        @media(max-width:640px){.lp-grid-3{grid-template-columns:1fr!important}.lp-grid-2{grid-template-columns:1fr!important}}
      `}</style>

      {/* Nav */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",
        justifyContent:"space-between",padding:isMobile?"12px 16px":"14px 32px",
        background:"rgba(250,248,244,0.92)",backdropFilter:"blur(16px)",
        borderBottom:"1px solid #e8e4de",boxShadow:scrolled?"0 2px 24px rgba(0,0,0,.07)":"none",transition:"all .3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"#f97316",borderRadius:10,display:"flex",alignItems:"center",
            justifyContent:"center",fontWeight:900,color:"#fff",fontSize:17}}>₣</div>
          {!isMobile&&<span style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700}}>FreelanceFunds</span>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {!isMobile&&<span style={{fontSize:12,color:"#888",marginRight:4}}>Already have an account?</span>}
          <button onClick={onLogin} style={{background:"none",border:"1.5px solid #e8e4de",color:"#444",
            borderRadius:10,padding:"9px 18px",fontSize:14,fontWeight:600,cursor:"pointer",
            display:"flex",alignItems:"center",gap:6}}>
            <LogIn size={14}/> Log In
          </button>
          <button onClick={onLogin} className="lp-btn-primary" style={{background:"#f97316",color:"#fff",
            border:"none",borderRadius:10,padding:"10px 20px",fontSize:14,fontWeight:700,cursor:"pointer",
            boxShadow:"0 4px 14px rgba(249,115,22,.35)",display:"flex",alignItems:"center",gap:6,transition:"all .2s"}}>
            🔥 {isMobile?"₱150":"7-Day Promo — ₱150"}
          </button>
        </div>
      </nav>

      {/* Urgency bar */}
      <div style={{background:"linear-gradient(135deg,#f97316,#c2410c)",padding:isMobile?"68px 16px 14px":"70px 24px 14px",textAlign:"center",color:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.3)",borderRadius:100,padding:"5px 16px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:7}}>
            <div className="pulse-dot"/> Early Access Open
          </div>
          <p style={{fontSize:isMobile?12:14,fontWeight:600}}>🔥 <strong>Launch Promo:</strong> Get full Pro for just <strong>₱150</strong> — 7 days only.</p>
        </div>
      </div>

      {/* Hero */}
      <section style={{minHeight:"90vh",display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",padding:isMobile?"60px 16px 60px":"80px 24px 80px",textAlign:"center",
        position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 70% 50% at 50% 0%, rgba(249,115,22,.07) 0%, transparent 60%)"}}/>
        <div className="lp-fade" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(249,115,22,.1)",
          border:"1px solid rgba(249,115,22,.25)",color:"#f97316",borderRadius:100,padding:"7px 18px",
          fontSize:12,fontWeight:700,marginBottom:28}}><div className="pulse-dot"/> Built for Filipino Freelancers</div>
        <h1 className="lp-fade-1" style={{fontFamily:"'Playfair Display',serif",
          fontSize:isMobile?"clamp(36px,10vw,52px)":"clamp(38px,7vw,76px)",
          lineHeight:1.04,letterSpacing:"-0.03em",maxWidth:820,marginBottom:24}}>
          Stop guessing at<br/><span style={{color:"#f97316",fontStyle:"italic"}}>every tax season.</span>
        </h1>
        <p className="lp-fade-2" style={{fontSize:isMobile?15:18,color:"#6b6460",maxWidth:520,lineHeight:1.8,marginBottom:32}}>
          Track expenses across multiple clients, split costs automatically, and generate BIR-ready reports — in one place.
        </p>
        <div className="lp-fade-3" style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:64}}>
          <button onClick={onLogin} className="lp-btn-primary" style={{background:"#f97316",color:"#fff",border:"none",borderRadius:12,
            padding:"15px 30px",fontSize:15,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,
            boxShadow:"0 8px 28px rgba(249,115,22,.35)",transition:"all .2s"}}>🔥 7-Day Promo — ₱150</button>
          <button onClick={onLogin} className="lp-btn-ghost" style={{background:"rgba(15,14,13,.05)",color:"#444",
            border:"1.5px solid #e8e4de",borderRadius:12,padding:"14px 26px",fontSize:15,fontWeight:600,
            cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,transition:"all .2s"}}>Try Free First</button>
        </div>

        {/* Mock dashboard preview */}
        <div className="lp-float lp-fade-4" style={{filter:"drop-shadow(0 32px 64px rgba(0,0,0,.15))"}}>
          <div style={{background:"#111",borderRadius:22,overflow:"hidden",width:`min(560px,${isMobile?"92vw":"92vw"})`,
            maxWidth:560,border:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{background:"#1a1a1a",padding:"10px 16px",display:"flex",alignItems:"center",gap:6,borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              {["#ef4444","#eab308","#22c55e"].map(c=><div key={c} style={{width:11,height:11,borderRadius:"50%",background:c}}/>)}
              <div style={{flex:1,marginLeft:8,background:"rgba(255,255,255,.05)",borderRadius:6,padding:"4px 12px",fontSize:10,color:"#444",fontFamily:"monospace"}}>freelancefunds.app — Dashboard</div>
            </div>
            <div style={{padding:22}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
                {[["Tracked","₱48,320","#fff"],["Tax Savings","₱9,664","#86efac"],["Projects","6","#fff"]].map(([l,v,c])=>(
                  <div key={l} style={{background:"#1a1a1a",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:8,color:"#444",textTransform:"uppercase",letterSpacing:".08em",marginBottom:5,fontWeight:700}}>{l}</div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?14:18,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              {[
                {icon:"💻",name:"Adobe Creative Cloud",splits:[{w:60,c:"#f97316"},{w:40,c:"#3b82f6"}],amt:"₱1,200"},
                {icon:"🍽️",name:"Client Lunch – BGC",splits:[{w:100,c:"#10b981"}],amt:"₱850"},
                {icon:"🚗",name:"Grab to Makati Office",splits:[{w:50,c:"#f97316"},{w:50,c:"#a855f7"}],amt:"₱320"},
              ].map((row,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:i<2?"1px solid rgba(255,255,255,.04)":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:9,background:"rgba(249,115,22,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{row.icon}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"#ccc",marginBottom:5}}>{row.name}</div>
                      <div style={{display:"flex",height:3,borderRadius:2,overflow:"hidden",gap:1,width:110}}>
                        {row.splits.map((s,j)=><div key={j} style={{width:`${s.w}%`,background:s.c}}/>)}
                      </div>
                    </div>
                  </div>
                  <div style={{fontWeight:800,fontSize:13,color:"#fff"}}>{row.amt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div style={{background:"#111",borderTop:"1px solid #1e1e1e",borderBottom:"1px solid #1e1e1e",padding:"12px 0",overflow:"hidden"}}>
        <div className="ticker-inner">
          {[...["Adobe CC split 60/40 ✓","BIR quarterly report ✓","Phone bill across 3 clients ✓","Grab rides per project ✓",
                "₱18,000 avg annual savings ✓","10 hours saved monthly ✓","8 of 9 testers use it daily ✓"],
            ...["Adobe CC split 60/40 ✓","BIR quarterly report ✓","Phone bill across 3 clients ✓","Grab rides per project ✓",
                "₱18,000 avg annual savings ✓","10 hours saved monthly ✓","8 of 9 testers use it daily ✓"]].map((t,i)=>(
            <div key={i} style={{display:"inline-flex",alignItems:"center",gap:10,padding:"0 36px",fontSize:12,fontWeight:600,color:"#555",borderRight:"1px solid #1e1e1e"}}>
              <span style={{color:"#f97316"}}>●</span> {t}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{background:"#fff",padding:isMobile?"60px 16px":"80px 24px"}}>
        <div style={{maxWidth:1040,margin:"0 auto"}}>
          <p style={{fontSize:11,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:".1em",marginBottom:14,textAlign:"center"}}>Everything you need</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?"clamp(26px,6vw,40px)":"clamp(26px,4.5vw,48px)",
            lineHeight:1.05,marginBottom:48,textAlign:"center"}}>
            Built for how <span style={{color:"#f97316",fontStyle:"italic"}}>freelancers actually work.</span>
          </h2>
          <div className="lp-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {features.map((f,i)=>(
              <div key={i} className="feature-card" style={{background:"#faf8f4",borderRadius:20,padding:24,
                border:"1px solid #e8e4de",transition:"all .25s",cursor:"default"}}>
                <div style={{fontSize:28,marginBottom:16}}>{f.icon}</div>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>{f.title}</h3>
                <p style={{fontSize:13.5,color:"#6b6460",lineHeight:1.75}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{background:"#faf8f4",padding:isMobile?"60px 16px":"80px 24px"}}>
        <div style={{maxWidth:1040,margin:"0 auto"}}>
          <p style={{fontSize:11,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:".1em",marginBottom:14,textAlign:"center"}}>What beta testers say</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?"clamp(26px,6vw,40px)":"clamp(26px,4.5vw,48px)",
            lineHeight:1.05,marginBottom:40,textAlign:"center"}}>
            Filipino freelancers <span style={{color:"#f97316",fontStyle:"italic"}}>already love it.</span>
          </h2>
          <div className="lp-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:56}}>
            {testimonials.map((t,i)=>(
              <div key={i} className="testi-card" style={{background:"#fff",border:"1px solid #e8e4de",borderRadius:20,
                padding:28,transition:"all .2s",position:"relative"}}>
                <div style={{position:"absolute",top:14,right:22,fontFamily:"'Playfair Display',serif",fontSize:80,color:"rgba(249,115,22,.08)"}}>"</div>
                <div style={{color:"#f97316",fontSize:14,marginBottom:12}}>{"★".repeat(t.stars)}</div>
                <p style={{fontSize:13.5,lineHeight:1.85,color:"#2a2825",marginBottom:18}}>{t.text}</p>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:t.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,color:"#fff"}}>{t.initial}</div>
                  <div><div style={{fontWeight:700,fontSize:13,color:"#0f0e0d"}}>{t.name}</div><div style={{fontSize:11,color:"#6b6460"}}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div style={{background:"linear-gradient(135deg,#0f0e0d,#1a0e00)",border:"2px solid rgba(249,115,22,.35)",
            borderRadius:20,padding:isMobile?"20px 16px":"28px 32px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:16}}>
              <span style={{background:"#f97316",color:"#fff",fontSize:11,fontWeight:800,padding:"4px 14px",borderRadius:20}}>🔥 7-Day Launch Promo</span>
              <span style={{fontSize:isMobile?14:15,fontWeight:700,color:"#fff"}}>Get full Pro for just <span style={{color:"#f97316",fontSize:22}}>₱150</span> — then ₱500/mo</span>
            </div>
            <div style={{display:"flex",gap:isMobile?6:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
              <span style={{fontSize:13,color:"#888"}}>Offer expires in:</span>
              <div style={{display:"flex",gap:8}}>
                {[["days",timeLeft.days],["hrs",timeLeft.hrs],["min",timeLeft.min],["sec",timeLeft.sec]].map(([label,val])=>(
                  <div key={label} style={{background:"rgba(255,255,255,.07)",border:`1px solid ${label==="sec"?"rgba(249,115,22,.3)":"rgba(255,255,255,.1)"}`,borderRadius:10,padding:"8px 14px",textAlign:"center",minWidth:52}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:label==="sec"?"#f97316":"#fff"}}>{pad(val)}</div>
                    <div style={{fontSize:9,color:"#555",textTransform:"uppercase",marginTop:3}}>{label}</div>
                  </div>
                ))}
              </div>
              <button onClick={onLogin} style={{background:"#f97316",color:"#fff",border:"none",borderRadius:11,
                padding:"11px 22px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Claim ₱150 Deal →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{background:"#fff",padding:isMobile?"60px 16px":"80px 24px"}}>
        <div style={{maxWidth:860,margin:"0 auto",textAlign:"center"}}>
          <p style={{fontSize:11,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:".1em",marginBottom:14}}>Pricing</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?"clamp(26px,6vw,40px)":"clamp(26px,4.5vw,48px)",lineHeight:1.05,marginBottom:48}}>
            Start free. <span style={{color:"#f97316",fontStyle:"italic"}}>Upgrade when ready.</span>
          </h2>
          <div className="lp-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            {[{
              name:"Free",price:"₱0",sub:"Forever",
              features:["50 expenses/month","3 projects","2-way expense split","CSV export","Basic dashboard"],
              cta:"Start Free",ghost:true,
            },{
              name:"Pro",price:"₱500",sub:"per month",badge:"Most Popular",
              promo:"Launch Promo: ₱150 for 7 Days",
              features:["Unlimited expenses","Unlimited projects","4-way expense split","PDF + CSV export","AI suggestions","Priority support"],
              cta:"🔥 Get Pro",ghost:false,
            }].map((plan,i)=>(
              <div key={i} style={{background:i===1?"#111":"#faf8f4",border:i===1?"2px solid rgba(249,115,22,.4)":"1px solid #e8e4de",
                borderRadius:24,padding:isMobile?20:28,textAlign:"left",position:"relative",overflow:"hidden"}}>
                {plan.badge&&<div style={{position:"absolute",top:16,right:16,background:"#f97316",color:"#fff",
                  fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20}}>{plan.badge}</div>}
                <p style={{fontSize:13,fontWeight:700,color:i===1?"#f97316":"#6b6460",marginBottom:8}}>{plan.name}</p>
                {plan.promo&&<div style={{background:"rgba(249,115,22,.15)",border:"1px solid rgba(249,115,22,.3)",borderRadius:8,padding:"6px 10px",marginBottom:12}}>
                  <span style={{fontSize:11,color:"#f97316",fontWeight:700}}>🔥 {plan.promo}</span></div>}
                <div style={{marginBottom:20}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:40,color:i===1?"#fff":"#0f0e0d"}}>{plan.price}</span>
                  <span style={{fontSize:13,color:i===1?"#666":"#888",marginLeft:6}}>{plan.sub}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                  {plan.features.map((f,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"center",gap:10}}>
                      <CheckCircle2 size={14} color={i===1?"#f97316":"#10b981"}/>
                      <span style={{fontSize:13,color:i===1?"#ccc":"#444"}}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={onLogin} style={{width:"100%",background:plan.ghost?"transparent":"#f97316",
                  color:plan.ghost?"#444":"#fff",border:plan.ghost?"1.5px solid #e8e4de":"none",borderRadius:12,
                  padding:"12px 20px",fontSize:14,fontWeight:700,cursor:"pointer"}}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{background:"#faf8f4",padding:isMobile?"60px 16px":"80px 24px"}}>
        <div style={{maxWidth:720,margin:"0 auto",textAlign:"center"}}>
          <p style={{fontSize:11,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:".1em",marginBottom:14}}>FAQ</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?"clamp(26px,6vw,40px)":"clamp(26px,4.5vw,48px)",lineHeight:1.05,marginBottom:40}}>
            Questions <span style={{color:"#f97316",fontStyle:"italic"}}>answered honestly.</span>
          </h2>
          <div style={{textAlign:"left"}}>
            {faqs.map((f,i)=>(
              <div key={i} className="faq-item" onClick={()=>setFaqOpen(faqOpen===i?null:i)}
                style={{borderBottom:"1px solid #e8e4de",padding:"20px 16px",cursor:"pointer",borderRadius:8,transition:"background .15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:700,fontSize:15,gap:16}}>
                  {f.q}<span style={{color:"#f97316",fontSize:20,transition:"transform .2s",transform:faqOpen===i?"rotate(45deg)":"none",flexShrink:0}}>+</span>
                </div>
                {faqOpen===i&&<p style={{fontSize:13.5,color:"#6b6460",lineHeight:1.8,marginTop:12}}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{background:"#0f0e0d",padding:isMobile?"80px 16px":"120px 24px",textAlign:"center",position:"relative"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,.12) 0%, transparent 65%)"}}/>
        <div style={{maxWidth:640,margin:"0 auto",position:"relative",zIndex:1}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:isMobile?"clamp(26px,7vw,44px)":"clamp(26px,4.5vw,52px)",
            lineHeight:1.05,color:"#fff",marginBottom:16}}>
            Ready to stop guessing<br/><span style={{color:"#f97316",fontStyle:"italic"}}>at quarter-end?</span>
          </h2>
          <p style={{color:"#666",fontSize:16,marginBottom:40,lineHeight:1.75}}>Create your free account. Add your first project in 30 seconds.</p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={onLogin} style={{background:"#f97316",color:"#fff",border:"none",borderRadius:14,padding:"17px 38px",
              fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 28px rgba(249,115,22,.4)"}}>🔥 Claim ₱150 Promo</button>
            <button onClick={onLogin} style={{background:"rgba(255,255,255,.07)",color:"#aaa",border:"1.5px solid rgba(255,255,255,.15)",
              borderRadius:14,padding:"16px 28px",fontSize:16,fontWeight:600,cursor:"pointer"}}>Start Free</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:"#0f0e0d",color:"#444",padding:"24px 32px",display:"flex",alignItems:"center",
        justifyContent:"space-between",borderTop:"1px solid #1a1a1a",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,background:"#f97316",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff",fontSize:13}}>₣</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:"#444"}}>FreelanceFunds</span>
        </div>
        <p style={{fontSize:11,color:"#2a2a2a",textTransform:"uppercase"}}>Built for Filipino Freelancers · 2025</p>
        <button onClick={onLogin} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:12}}>Log In →</button>
      </footer>
    </div>
  );
};

/* ════════════════════════════════════════════
   AUTH SCREEN (Login / Register)
════════════════════════════════════════════ */
const AuthScreen = ({ onAuth, onBack }) => {
  const [mode, setMode]         = useState("login"); // login | register
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handle = () => {
    setError("");
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    if (mode==="register"&&!name.trim()) { setError("Please enter your name."); return; }
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      onAuth({ id: "user_"+Date.now(), email, name: name||email.split("@")[0] });
    }, 1000);
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:"#0f0e0d",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
      @keyframes authUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      .auth-input:focus{border-color:#f97316!important;box-shadow:0 0 0 3px rgba(249,115,22,.15)!important}
      `}</style>

      <div style={{width:"100%",maxWidth:420,animation:"authUp .4s cubic-bezier(.16,1,.3,1) both"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,background:"#f97316",borderRadius:14,display:"flex",alignItems:"center",
            justifyContent:"center",fontWeight:900,color:"#fff",fontSize:24,margin:"0 auto 12px"}}>₣</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,color:"#fff",marginBottom:4}}>FreelanceFunds</h1>
          <p style={{fontSize:13,color:"#555"}}>Expense tracking for Filipino freelancers</p>
        </div>

        {/* Card */}
        <div style={{background:"#161616",borderRadius:24,padding:28,border:"1px solid #2a2a2a"}}>
          {/* Tab toggle */}
          <div style={{display:"flex",background:"#111",borderRadius:12,padding:4,marginBottom:24}}>
            {[["login","Log In"],["register","Sign Up"]].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",
                background:mode===m?"#f97316":"transparent",color:mode===m?"#fff":"#555",
                fontWeight:700,fontSize:14,cursor:"pointer",transition:"all .2s",fontFamily:"inherit"}}>{l}</button>
            ))}
          </div>

          {mode==="register"&&(
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Full Name</label>
              <input className="auth-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Maria Cruz"
                style={{width:"100%",background:"#1f1f1f",border:"1.5px solid #2a2a2a",borderRadius:10,padding:"11px 14px",
                  fontSize:14,color:"#e8e3dc",outline:"none",boxSizing:"border-box",transition:"border .15s",fontFamily:"inherit"}}/>
            </div>
          )}
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Email</label>
            <input className="auth-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="maria@studio.ph"
              style={{width:"100%",background:"#1f1f1f",border:"1.5px solid #2a2a2a",borderRadius:10,padding:"11px 14px",
                fontSize:14,color:"#e8e3dc",outline:"none",boxSizing:"border-box",transition:"border .15s",fontFamily:"inherit"}}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Password</label>
            <div style={{position:"relative"}}>
              <input className="auth-input" type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                style={{width:"100%",background:"#1f1f1f",border:"1.5px solid #2a2a2a",borderRadius:10,padding:"11px 40px 11px 14px",
                  fontSize:14,color:"#e8e3dc",outline:"none",boxSizing:"border-box",transition:"border .15s",fontFamily:"inherit"}}
                onKeyDown={e=>e.key==="Enter"&&handle()}/>
              <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",color:"#555",padding:0}}>
                {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
          </div>

          {error&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:9,
            padding:"10px 14px",marginBottom:16,fontSize:13,color:"#ef4444",display:"flex",alignItems:"center",gap:8}}>
            <AlertTriangle size={14}/>{error}</div>}

          <button onClick={handle} disabled={loading} style={{width:"100%",background:"#f97316",color:"#fff",border:"none",
            borderRadius:11,padding:"13px 20px",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",
            opacity:loading?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit",transition:"all .15s"}}>
            {loading?<><div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}}/> Processing...</>
              :<>{mode==="login"?<LogIn size={16}/>:<UserPlus size={16}/>} {mode==="login"?"Log In":"Create Account"}</>}
          </button>

          <p style={{textAlign:"center",fontSize:12,color:"#444",marginTop:16}}>
            {mode==="login"?"Don't have an account? ":"Already have one? "}
            <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}}
              style={{background:"none",border:"none",color:"#f97316",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
              {mode==="login"?"Sign up free":"Log in"}
            </button>
          </p>
        </div>

        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,margin:"20px auto 0",
          background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
          <ChevronLeft size={14}/> Back to homepage
        </button>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

/* ════════════════════════════════════════════
   MAIN DASHBOARD APP
════════════════════════════════════════════ */
const Dashboard = ({ user, signOut }) => {
  const [dark, setDark]                 = useState(true);
  const [plan, setPlan]                 = useState("free");
  const [tab, setTab]                   = useState("dashboard");
  const [modal, setModal]               = useState(null);
  const [toast, setToast]               = useState(null);
  const [search, setSearch]             = useState("");
  const [fPid, setFPid]                 = useState("all");
  const [fCat, setFCat]                 = useState("all");
  const [sortBy, setSortBy]             = useState("date-desc");
  const [editId, setEditId]             = useState(null);
  const [delId, setDelId]               = useState(null);
  const [showPlan, setShowPlan]         = useState(false);
  const [showManual, setShowManual]     = useState(false);
  const [saving, setSaving]             = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [collapsed, setCollapsed]       = useState(false);
  const [isMobile, setIsMobile]         = useState(false);
  const [expenses, setExpenses]         = useState([]);
  const [projects, setProjects]         = useState([]);

  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768); fn();
    window.addEventListener("resize",fn); return()=>window.removeEventListener("resize",fn);
  },[]);
  useEffect(()=>{
    const seen=localStorage.getItem(`ff_onboarded_${user.id}`);
    if(!seen) setShowOnboarding(true);
  },[user.id]);

  const isPro=plan==="pro", maxExp=isPro?Infinity:FREE_EXP, maxProj=isPro?Infinity:FREE_PROJ;
  const D=dark;
  const bg   = D?"#0a0a0a":"#f8f7f4";
  const card = D?"#141414":"#ffffff";
  const brd  = D?"#2a2a2a":"#e8e4de";
  const txt  = D?"#e8e8e8":"#1a1a1a";
  const muted= D?"#6b6b6b":"#9ca3af";

  const [form, setForm] = useState({ description:"", amount:"", category:"Software",
    date:new Date().toISOString().split("T")[0], splits:[{pid:"",pct:100}], notes:"" });
  const [pForm, setPForm] = useState({ name:"", client:"", color:"#f97316", budget:"" });
  const [splErr, setSplErr] = useState("");

  const totalPct  = form.splits.reduce((s,x)=>s+Number(x.pct),0);
  const grandTotal= expenses.reduce((s,e)=>s+e.amount,0);
  const estSavings= Math.round(grandTotal*0.2);
  const projTotals= Object.fromEntries(projects.map(p=>[p.id,0]));
  expenses.forEach(e=>e.splits.forEach(s=>{ projTotals[s.pid]=(projTotals[s.pid]||0)+(e.amount*s.pct)/100; }));
  const catTotals={};
  expenses.forEach(e=>{ catTotals[e.category]=(catTotals[e.category]||0)+e.amount; });
  const monthly=(()=>{
    const labs=["J","F","M","A","M","J","J","A","S","O","N","D"],vals=Array(12).fill(0);
    expenses.forEach(e=>{ vals[new Date(e.date).getMonth()]+=e.amount; });
    return labs.map((label,i)=>({label,val:vals[i],highlight:vals[i]===Math.max(...vals)&&vals[i]>0}));
  })();
  const sorted=[...expenses].filter(e=>{
    if(fPid!=="all"&&!e.splits.some(s=>s.pid===fPid)) return false;
    if(fCat!=="all"&&e.category!==fCat) return false;
    if(search&&!e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>{
    if(sortBy==="date-desc") return new Date(b.date)-new Date(a.date);
    if(sortBy==="date-asc")  return new Date(a.date)-new Date(b.date);
    if(sortBy==="amount-desc") return b.amount-a.amount;
    if(sortBy==="amount-asc")  return a.amount-b.amount;
    return 0;
  });

  const showToast=useCallback((msg,type="success")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),2800);
  },[]);
  const completeOnboarding=()=>{ localStorage.setItem(`ff_onboarded_${user.id}`,"1"); setShowOnboarding(false); showToast("Welcome! Start by creating your first project."); };
  const handleOnboardingNext=()=>{ if(onboardingStep===ONBOARDING_STEPS.length-1) completeOnboarding(); else setOnboardingStep(s=>s+1); };

  const openAdd=()=>{
    if(expenses.length>=maxExp){ showToast(`Free plan: max ${maxExp} expenses`,"warning"); setShowPlan(true); return; }
    setEditId(null);
    setForm({description:"",amount:"",category:"Software",date:new Date().toISOString().split("T")[0],
      splits:[{pid:projects[0]?.id||"",pct:100}],notes:""});
    setSplErr(""); setModal("expense");
  };
  const openEdit=e=>{ setEditId(e.id); setForm({description:e.description,amount:String(e.amount),category:e.category,
    date:e.date,splits:[...e.splits],notes:e.notes||""}); setSplErr(""); setModal("expense"); };
  const saveExpense=()=>{
    if(!form.description.trim()||!form.amount){ showToast("Fill in description and amount","error"); return; }
    if(totalPct!==100){ setSplErr("Splits must total exactly 100%"); return; }
    setSplErr(""); setSaving(true);
    setTimeout(()=>{
      if(editId){ setExpenses(prev=>prev.map(e=>e.id===editId?{...e,...form,amount:Number(form.amount)}:e)); showToast("Expense updated"); }
      else{ setExpenses(prev=>[{...form,id:"e"+Date.now(),amount:Number(form.amount)},...prev]); showToast("Expense saved!"); }
      setModal(null); setSaving(false);
    },400);
  };
  const confirmDelete=()=>{ setExpenses(prev=>prev.filter(e=>e.id!==delId)); setDelId(null); showToast("Expense deleted"); };
  const autoSplit=()=>{ const n=form.splits.length,base=Math.floor(100/n),rem=100-base*n;
    setForm(f=>({...f,splits:f.splits.map((s,i)=>({...s,pct:i===0?base+rem:base}))})); };
  const saveProject=()=>{
    if(!pForm.name.trim()){ showToast("Project name required","error"); return; }
    if(projects.length>=maxProj){ showToast("Upgrade to add more projects","warning"); setShowPlan(true); setModal(null); return; }
    setSaving(true);
    setTimeout(()=>{ setProjects(prev=>[...prev,{...pForm,id:"p"+Date.now()}]);
      setPForm({name:"",client:"",color:"#f97316",budget:""}); setModal(null); showToast("Project created!"); setSaving(false); },400);
  };
  const exportCSV=()=>{
    const rows=[["Date","Description","Category","Amount","Notes","Project","Split%","Project Amount"]];
    expenses.forEach(e=>e.splits.forEach(s=>{
      rows.push([e.date,`"${e.description}"`,e.category,e.amount,`"${e.notes||""}"`,`"${pNm(projects,s.pid)}"`,s.pct,Math.round((e.amount*s.pct)/100)]);
    }));
    const a=document.createElement("a");
    a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(rows.map(r=>r.join(",")).join("\n"));
    a.download="freelancefunds-export.csv"; a.click();
    showToast("CSV exported — BIR-ready!");
  };

  const navItems=[
    {id:"dashboard",Icon:LayoutDashboard,label:"Dashboard",desc:"Overview & insights"},
    {id:"expenses", Icon:Receipt,        label:"Expenses",  desc:"Track your spending"},
    {id:"projects", Icon:FolderOpen,     label:"Projects",  desc:"Manage clients"},
    {id:"reports",  Icon:FileBarChart2,  label:"Reports",   desc:"BIR-ready exports"},
  ];

  const styles=`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{overflow-x:hidden}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .btn-primary{background:#f97316;color:#fff;border:none;border-radius:10px;padding:9px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
    .btn-primary:hover{background:#ea6c0a;transform:translateY(-1px);box-shadow:0 4px 18px rgba(249,115,22,.45)}
    .btn-ghost{background:${D?"#1e1e1e":"#f3f4f6"};color:${D?"#888":"#374151"};border:none;border-radius:10px;padding:9px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
    .btn-ghost:hover{background:${D?"#282828":"#e5e7eb"}}
    .input{width:100%;border:1.5px solid ${brd};border-radius:10px;padding:10px 14px;font-family:inherit;font-size:14px;outline:none;background:${D?"#1f1f1f":"#fff"};color:${txt};transition:border .15s}
    .input:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.12)}
    .lbl{display:block;font-size:10px;font-weight:800;color:${muted};text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
    .card{background:${card};border-radius:18px;border:1px solid ${brd};transition:all .2s}
    .card:hover{border-color:${D?"rgba(249,115,22,.2)":"rgba(249,115,22,.15)"};box-shadow:0 4px 24px rgba(0,0,0,${D?0.2:0.06})}
    .row{border-radius:14px;padding:14px 16px;border:1px solid ${D?"#1e1e1e":"#f0f0f0"};background:${card};transition:all .18s;cursor:pointer}
    .row:hover{border-color:${D?"rgba(249,115,22,.25)":"rgba(249,115,22,.2)"};transform:translateY(-1px)}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:${isMobile?"flex-end":"center"};justify-content:center;z-index:600;padding:${isMobile?"0":"16px"};backdrop-filter:blur(12px)}
    .modal{background:${card};border-radius:${isMobile?"22px 22px 0 0":"24px"};padding:${isMobile?"20px 16px 32px":"24px"};width:100%;max-width:${isMobile?"100%":"520px"};max-height:92vh;overflow-y:auto;border:1px solid ${brd}}
    .prog{height:5px;background:${D?"#1f1f1f":"#f3f4f6"};border-radius:3px;overflow:hidden}
    .prog-bar{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.4,0,.2,1)}
    .nav-btn{width:100%;display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:4px;border-radius:12px;border:none;cursor:pointer;transition:all .15s;font-family:inherit}
    .nav-btn:hover{background:${D?"rgba(249,115,22,.08)":"rgba(249,115,22,.05)"}}
    @media(max-width:768px){input,select,textarea{font-size:16px!important}}
  `;

  /* ── Render tabs ── */
  const renderDashboard=()=>{
    if(expenses.length===0&&projects.length===0) return (
      <div style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{width:80,height:80,borderRadius:24,background:"rgba(249,115,22,.12)",border:"2px solid rgba(249,115,22,.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><FolderOpen size={36} color="#f97316"/></div>
        <h2 style={{fontSize:24,marginBottom:12,color:txt}}>Welcome, {user.name||user.email.split("@")[0]}!</h2>
        <p style={{color:muted,marginBottom:24,maxWidth:400,margin:"0 auto 24px"}}>Start by creating your first project and logging expenses to see your tax savings.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-primary" onClick={()=>{setModal("project");setPForm({name:"",client:"",color:"#f97316",budget:""});}}><FolderOpen size={14}/> Create Project</button>
          <button className="btn-ghost" onClick={()=>setShowManual(true)}><BookOpen size={14}/> Read Guide</button>
        </div>
      </div>
    );
    if(projects.length>0&&expenses.length===0) return (
      <div style={{textAlign:"center",padding:"40px 20px"}}>
        <div style={{width:64,height:64,borderRadius:20,background:"rgba(59,130,246,.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Receipt size={28} color="#3b82f6"/></div>
        <h3 style={{fontSize:20,marginBottom:8,color:txt}}>Ready to track expenses!</h3>
        <p style={{color:muted,marginBottom:20}}>Your project is set up. Add your first expense to see the dashboard come to life.</p>
        <button className="btn-primary" onClick={openAdd}><Plus size={14}/> Add Your First Expense</button>
      </div>
    );
    return (
      <div style={{animation:"fadeUp .4s ease"}}>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16,marginBottom:24}}>
          <div style={{background:D?"linear-gradient(135deg,#111,#1a0e00)":"linear-gradient(135deg,#fff,#fff7ed)",borderRadius:24,padding:isMobile?20:24,border:`1px solid ${D?"rgba(249,115,22,.18)":"rgba(249,115,22,.2)"}`}}>
            <p style={{fontSize:12,color:"#f97316",fontWeight:700,marginBottom:8}}>Total Tracked</p>
            <p style={{fontSize:isMobile?32:40,fontWeight:700,color:txt,marginBottom:4}}>{fmt(grandTotal)}</p>
            <p style={{fontSize:12,color:muted}}>{expenses.length} expenses across {projects.length} project{projects.length!==1?"s":""}</p>
          </div>
          <div style={{background:D?"linear-gradient(135deg,#0a1a0f,#0d2015)":"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:24,padding:isMobile?20:24,border:`1px solid ${D?"rgba(16,185,129,.18)":"rgba(16,185,129,.25)"}`}}>
            <p style={{fontSize:12,color:"#10b981",fontWeight:700,marginBottom:8}}>Est. Tax Savings</p>
            <p style={{fontSize:isMobile?32:40,fontWeight:700,color:"#10b981",marginBottom:4}}>{fmt(estSavings)}</p>
            <p style={{fontSize:12,color:muted}}>at 20% deduction rate</p>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
          <div className="card" style={{padding:isMobile?12:16}}><p className="lbl">Avg Expense</p><p style={{fontSize:18,fontWeight:700,color:txt}}>{expenses.length?fmt(Math.round(grandTotal/expenses.length)):"—"}</p></div>
          <div className="card" style={{padding:isMobile?12:16}}><p className="lbl">Top Category</p><p style={{fontSize:18,fontWeight:700,color:txt}}>{Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—"}</p></div>
          <div className="card" style={{padding:isMobile?12:16}}><p className="lbl">Hours Saved</p><p style={{fontSize:18,fontWeight:700,color:txt}}>~{Math.max(1,Math.ceil(expenses.length/5))}h</p></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"5fr 3fr",gap:16,marginBottom:24}}>
          <div className="card" style={{padding:isMobile?16:20}}>
            <p style={{fontWeight:700,marginBottom:16,color:txt}}><BarChart3 size={14} style={{display:"inline",marginRight:8,color:"#f97316"}}/> Monthly Spend</p>
            <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
              {monthly.map((d,i)=>(
                <div key={i} style={{flex:1,textAlign:"center"}}>
                  <div style={{height:56,display:"flex",alignItems:"flex-end",background:D?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{width:"100%",height:`${(d.val/Math.max(...monthly.map(x=>x.val),1))*100}%`,
                      background:d.highlight?"#f97316":D?"#3b82f6":"#60a5fa",borderRadius:"4px 4px 0 0",transition:"height .6s"}}/>
                  </div>
                  <span style={{fontSize:10,color:muted,marginTop:4,display:"block"}}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{padding:isMobile?16:20}}>
            <p style={{fontWeight:700,marginBottom:16,color:txt}}><PieChart size={14} style={{display:"inline",marginRight:8,color:"#f97316"}}/> Projects</p>
            <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <DonutChart size={80} segments={projects.map(p=>({pct:grandTotal?Math.round(((projTotals[p.id]||0)/grandTotal)*100):0,color:p.color}))}/>
              <div style={{flex:1}}>
                {projects.slice(0,3).map(p=>(
                  <div key={p.id} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:2,background:p.color}}/><span style={{fontSize:12,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:80}}>{p.name}</span></div>
                    <span style={{fontSize:12,color:muted}}>{fmt(Math.round(projTotals[p.id]||0))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{padding:isMobile?16:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <p style={{fontWeight:700,color:txt}}><Clock size={14} style={{display:"inline",marginRight:8,color:"#f97316"}}/> Recent Activity</p>
            <button className="btn-ghost" onClick={()=>setTab("expenses")} style={{fontSize:12}}>View all <ArrowRight size={12}/></button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {expenses.slice(0,5).map(e=>{
              const {Icon:CIc,color:cClr}=CAT_META[e.category]||CAT_META.Other;
              return (
                <div key={e.id} className="row" onClick={()=>openEdit(e)} style={{padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                      <div style={{width:32,height:32,borderRadius:8,background:`${cClr}15`,display:"flex",alignItems:"center",justifyContent:"center"}}><CIc size={14} color={cClr}/></div>
                      <div><p style={{fontWeight:600,fontSize:13,color:txt}}>{e.description}</p><p style={{fontSize:10,color:muted}}>{e.date} · {e.category}</p></div>
                    </div>
                    <p style={{fontWeight:700,fontSize:14,color:txt}}>{fmt(e.amount)}</p>
                  </div>
                  <SplitBar splits={e.splits} projects={projects}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderExpenses=()=>(
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <div style={{position:"relative",flex:1,minWidth:160}}>
          <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:muted}}/>
          <input className="input" placeholder="Search expenses…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:36}}/>
        </div>
        <select className="input" value={fPid} onChange={e=>setFPid(e.target.value)} style={{width:"auto",minWidth:130}}>
          <option value="all">All Projects</option>
          {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input" value={fCat} onChange={e=>setFCat(e.target.value)} style={{width:"auto",minWidth:130}}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:"auto"}}>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>
      {sorted.length===0?<div style={{textAlign:"center",padding:"40px 20px",color:muted}}>No expenses match your filters.</div>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {sorted.map(e=>{
          const {Icon:CIc,color:cClr}=CAT_META[e.category]||CAT_META.Other;
          return (
            <div key={e.id} className="row">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flex:1}} onClick={()=>openEdit(e)}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${cClr}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CIc size={15} color={cClr}/></div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:600,fontSize:14,color:txt,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.description}</p>
                    <p style={{fontSize:11,color:muted}}>{e.date} · {e.category}{e.notes?` · "${e.notes.slice(0,30)}${e.notes.length>30?"…":""}"`:"  "}</p>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <p style={{fontWeight:700,fontSize:14,color:txt}}>{fmt(e.amount)}</p>
                  <button onClick={()=>openEdit(e)} style={{background:"none",border:"none",cursor:"pointer",color:muted,padding:4}}><Pencil size={13}/></button>
                  <button onClick={()=>setDelId(e.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",padding:4}}><Trash2 size={13}/></button>
                </div>
              </div>
              <SplitBar splits={e.splits} projects={projects}/>
              <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                {e.splits.map((s,i)=>(
                  <span key={i} style={{fontSize:10,fontWeight:700,color:pClr(projects,s.pid),background:`${pClr(projects,s.pid)}15`,
                    borderRadius:6,padding:"2px 8px"}}>{pNm(projects,s.pid)} {s.pct}%</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );

  const renderProjects=()=>(
    <div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {projects.map(p=>{
          const spent=projTotals[p.id]||0;
          const pct=p.budget?Math.min(100,Math.round((spent/p.budget)*100)):null;
          return (
            <div key={p.id} className="card" style={{padding:20,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:p.color}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <p style={{fontWeight:700,fontSize:15,color:txt,marginBottom:3}}>{p.name}</p>
                  <p style={{fontSize:11,color:muted}}>{p.client||"No client"}</p>
                </div>
                <button onClick={()=>handleRemoveProject(p.id)} style={{background:"none",border:"none",cursor:"pointer",color:muted,padding:4}}><Trash2 size={14}/></button>
              </div>
              <p style={{fontSize:28,fontWeight:700,color:txt,marginBottom:8}}>{fmt(Math.round(spent))}</p>
              {p.budget>0&&(<>
                <div className="prog" style={{marginBottom:4}}><div className="prog-bar" style={{width:`${pct}%`,background:pct>80?"#ef4444":p.color}}/></div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <p style={{fontSize:10,color:muted}}>{pct}% of budget used</p>
                  <p style={{fontSize:10,color:muted}}>{fmt(Math.round(p.budget-spent))} remaining</p>
                </div>
              </>)}
            </div>
          );
        })}
        <button onClick={()=>{setModal("project");setPForm({name:"",client:"",color:"#f97316",budget:""}); }}
          style={{background:"transparent",border:`2px dashed ${brd}`,borderRadius:18,padding:20,cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,minHeight:140,color:muted,transition:"all .2s"}}
          className="card">
          <Plus size={24}/><span style={{fontSize:13,fontWeight:600}}>New Project</span>
        </button>
      </div>
    </div>
  );

  const renderReports=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="card" style={{padding:24}}>
        <h3 style={{fontWeight:700,fontSize:16,color:txt,marginBottom:16}}>Summary</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
          {[["Total Expenses",fmt(grandTotal),"#f97316"],["Est. Tax Savings",fmt(estSavings),"#10b981"],
            ["Expense Count",expenses.length,"#3b82f6"],["Projects",projects.length,"#8b5cf6"]].map(([l,v,c])=>(
            <div key={l} style={{background:D?"#1a1a1a":"#f9fafb",borderRadius:12,padding:"14px 16px"}}>
              <p style={{fontSize:11,color:muted,marginBottom:6,fontWeight:700,textTransform:"uppercase"}}>{l}</p>
              <p style={{fontSize:22,fontWeight:700,color:c}}>{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{padding:24}}>
        <h3 style={{fontWeight:700,fontSize:16,color:txt,marginBottom:16}}>By Category</h3>
        {Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([cat,total])=>{
          const {Icon:CIc,color:cClr}=CAT_META[cat]||CAT_META.Other;
          const pct=grandTotal?Math.round((total/grandTotal)*100):0;
          return (
            <div key={cat} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><CIc size={13} color={cClr}/><span style={{fontSize:13,color:txt,fontWeight:600}}>{cat}</span></div>
                <div style={{display:"flex",gap:12}}><span style={{fontSize:12,color:muted}}>{pct}%</span><span style={{fontSize:13,fontWeight:700,color:txt}}>{fmt(Math.round(total))}</span></div>
              </div>
              <div className="prog"><div className="prog-bar" style={{width:`${pct}%`,background:cClr}}/></div>
            </div>
          );
        })}
        {Object.keys(catTotals).length===0&&<p style={{color:muted,fontSize:13}}>No data yet.</p>}
      </div>
      <div className="card" style={{padding:24}}>
        <h3 style={{fontWeight:700,fontSize:16,color:txt,marginBottom:8}}>Export</h3>
        <p style={{fontSize:13,color:muted,marginBottom:16}}>Download a CSV file suitable for your accountant's BIR filing.</p>
        <button className="btn-primary" onClick={exportCSV} disabled={expenses.length===0}><Download size={14}/> Export CSV</button>
      </div>
    </div>
  );

  const handleRemoveProject=pid=>{
    if(expenses.some(e=>e.splits.some(s=>s.pid===pid))){ showToast("Remove linked expenses first","warning"); return; }
    setProjects(prev=>prev.filter(p=>p.id!==pid)); showToast("Project removed");
  };

  /* ── Sidebar ── */
  const Sidebar=()=>(
    <aside style={{width:collapsed?72:260,background:D?"#0f0f0f":"#fff",borderRight:`1px solid ${brd}`,
      display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,bottom:0,transition:"width 0.25s ease",zIndex:100,overflowY:"auto",overflowX:"hidden"}}>
      <div style={{padding:collapsed?"16px 0":"20px 16px",borderBottom:`1px solid ${brd}`,display:"flex",alignItems:"center",justifyContent:collapsed?"center":"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:"#f97316",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff",fontSize:17,flexShrink:0}}>₣</div>
          {!collapsed&&<span style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,whiteSpace:"nowrap"}}>FreelanceFunds</span>}
        </div>
        {!collapsed&&<button onClick={()=>setCollapsed(true)} style={{background:"none",border:"none",cursor:"pointer",color:muted}}><ChevronLeft size={16}/></button>}
      </div>
      {collapsed&&<button onClick={()=>setCollapsed(false)} style={{background:"none",border:"none",cursor:"pointer",color:muted,padding:"12px 0",display:"flex",justifyContent:"center"}}><ChevronRight size={16}/></button>}
      <nav style={{flex:1,padding:collapsed?"12px 6px":"16px 10px"}}>
        {navItems.map(({id,Icon,label,desc})=>(
          <button key={id} onClick={()=>setTab(id)} className="nav-btn"
            style={{justifyContent:collapsed?"center":"flex-start",
              background:tab===id?(D?"rgba(249,115,22,.15)":"rgba(249,115,22,.08)"):"transparent",
              padding:collapsed?"12px":"10px 14px"}}>
            <Icon size={18} color={tab===id?"#f97316":muted}/>
            {!collapsed&&<div style={{textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:tab===id?700:600,color:tab===id?"#f97316":txt}}>{label}</div>
              <div style={{fontSize:11,color:muted}}>{desc}</div>
            </div>}
          </button>
        ))}
      </nav>
      <div style={{padding:collapsed?"12px 6px":"16px",borderTop:`1px solid ${brd}`}}>
        {!collapsed?(
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,background:D?"#1a1a1a":"#f5f5f5",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
              <User size={13} color={muted}/><span style={{fontSize:12,color:txt,flex:1,overflow:"hidden",textOverflow:"ellipsis"}}>{user.email}</span>
            </div>
            <button onClick={()=>setDark(d=>!d)} className="btn-ghost" style={{width:"100%",marginBottom:8,justifyContent:"center"}}>
              {D?<Sun size={13}/>:<Moon size={13}/>}<span style={{marginLeft:6}}>{D?"Light Mode":"Dark Mode"}</span>
            </button>
            {!isPro&&<button onClick={()=>setShowPlan(true)} className="btn-primary" style={{width:"100%",marginBottom:8,justifyContent:"center"}}><Zap size={13}/> Upgrade to Pro</button>}
            <button onClick={signOut} className="btn-ghost" style={{width:"100%",justifyContent:"center"}}><LogOut size={13}/><span style={{marginLeft:6}}>Sign Out</span></button>
          </>
        ):(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <button onClick={()=>setDark(d=>!d)} style={{background:"none",border:"none",cursor:"pointer",color:muted}}>{D?<Sun size={16}/>:<Moon size={16}/>}</button>
            {!isPro&&<button onClick={()=>setShowPlan(true)} style={{background:"#f97316",border:"none",borderRadius:8,padding:7,cursor:"pointer"}}><Zap size={14} color="#fff"/></button>}
            <button onClick={signOut} style={{background:"none",border:"none",cursor:"pointer",color:muted}}><LogOut size={16}/></button>
          </div>
        )}
      </div>
    </aside>
  );

  /* ── Mobile bottom nav ── */
  const MobileNav=()=>(
    <nav style={{position:"fixed",bottom:0,left:0,right:0,background:D?"rgba(14,14,14,.97)":card,
      borderTop:`1px solid ${brd}`,display:"flex",zIndex:100,backdropFilter:"blur(10px)"}}>
      {navItems.map(({id,Icon,label})=>(
        <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          gap:3,background:"none",border:"none",cursor:"pointer",padding:"10px 0",color:tab===id?"#f97316":muted,fontFamily:"inherit"}}>
          <Icon size={19}/><span style={{fontSize:10,fontWeight:600}}>{label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:bg,minHeight:"100vh",color:txt,
      display:"flex",paddingBottom:isMobile?80:0}}>
      <style>{styles}</style>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      {showOnboarding&&<OnboardingGuide steps={ONBOARDING_STEPS} currentStep={onboardingStep}
        onNext={handleOnboardingNext} onPrev={()=>setOnboardingStep(s=>s-1)} onSkip={completeOnboarding} tk={{D,card,brd,muted}}/>}

      {!isMobile&&<Sidebar/>}

      {/* Main */}
      <main style={{marginLeft:isMobile?0:collapsed?72:260,flex:1,padding:isMobile?"16px 12px":"28px 32px",transition:"margin-left 0.25s ease",minWidth:0}}>
        {/* Header */}
        {isMobile?(
          <header style={{background:D?"rgba(14,14,14,.95)":card,borderBottom:`1px solid ${brd}`,padding:"12px 16px",
            display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,
            marginLeft:-12,marginRight:-12,marginTop:-16,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:30,height:30,background:"#f97316",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff"}}>₣</div>
              <span style={{fontWeight:700,fontSize:15}}>FreelanceFunds</span>
              <span style={{background:D?"#1e1e1e":"#f3f4f6",color:muted,borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:800}}>FREE</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn-ghost" style={{padding:"7px 9px"}} onClick={()=>setDark(d=>!d)}>{D?<Sun size={14}/>:<Moon size={14}/>}</button>
              <button className="btn-primary" onClick={openAdd} style={{padding:"7px 12px"}}><Plus size={15}/></button>
            </div>
          </header>
        ):(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:30}}>{navItems.find(i=>i.id===tab)?.label}</h1>
              <p style={{color:muted,fontSize:13}}>{navItems.find(i=>i.id===tab)?.desc}</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              {expenses.length>0&&<button className="btn-ghost" onClick={exportCSV}><Download size={13}/> Export CSV</button>}
              <button className="btn-ghost" onClick={()=>setShowManual(true)}><HelpCircle size={14}/></button>
              <button className="btn-primary" onClick={openAdd}><Plus size={13}/> Add Expense</button>
            </div>
          </div>
        )}

        {/* Free plan limit bar (desktop) */}
        {!isMobile&&!isPro&&(
          <div style={{background:D?"#111":"#fafafa",border:`1px solid ${brd}`,borderRadius:12,padding:"10px 16px",
            marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
              {[{label:"Expenses",used:expenses.length,max:FREE_EXP,color:"#f97316"},{label:"Projects",used:projects.length,max:FREE_PROJ,color:"#3b82f6"}].map(u=>(
                <div key={u.label} style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:12,color:muted}}>{u.label}:</span>
                  <span style={{fontSize:12,fontWeight:800,color:txt}}>{u.used}/{u.max}</span>
                  <div style={{width:80,height:4,background:D?"#222":"#f3f4f6",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",background:u.color,width:`${Math.min(100,Math.round((u.used/u.max)*100))}%`}}/>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setShowPlan(true)}><Zap size={11}/> Upgrade</button>
          </div>
        )}

        {tab==="dashboard"&&renderDashboard()}
        {tab==="expenses"&&renderExpenses()}
        {tab==="projects"&&renderProjects()}
        {tab==="reports"&&renderReports()}
      </main>

      {isMobile&&<MobileNav/>}

      {/* ── Expense Modal ── */}
      {modal==="expense"&&(
        <div className="overlay">
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontWeight:700,fontSize:18,color:txt}}>{editId?"Edit Expense":"Add Expense"}</h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:muted}}><X size={18}/></button>
            </div>
            <label className="lbl">Description</label>
            <input className="input" style={{marginBottom:14}} placeholder="e.g. Adobe Creative Cloud" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div><label className="lbl">Amount (₱)</label>
                <input className="input" type="number" placeholder="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></div>
              <div><label className="lbl">Date</label>
                <input className="input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            </div>
            <label className="lbl">Category</label>
            <select className="input" style={{marginBottom:14}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <label className="lbl" style={{marginBottom:0}}>Project Split</label>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={autoSplit} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>Auto</button>
                  {form.splits.length<(isPro?4:2)&&projects.length>form.splits.length&&(
                    <button onClick={()=>setForm(f=>({...f,splits:[...f.splits,{pid:"",pct:0}]}))} className="btn-ghost" style={{fontSize:11,padding:"4px 10px"}}>+ Add</button>
                  )}
                </div>
              </div>
              {form.splits.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,background:D?"#1a1a1a":"#f9fafb",borderRadius:10,padding:8,border:`1px solid ${brd}`}}>
                  <select className="input" style={{flex:2,padding:"7px 10px"}} value={s.pid} onChange={e=>{const arr=[...form.splits];arr[i]={...arr[i],pid:e.target.value};setForm(f=>({...f,splits:arr}));}}>
                    <option value="">Select project</option>
                    {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input className="input" type="number" style={{width:64,padding:"7px 10px"}} value={s.pct} onChange={e=>{const arr=[...form.splits];arr[i]={...arr[i],pct:Number(e.target.value)};setForm(f=>({...f,splits:arr}));}}/>
                  <span style={{fontSize:12,color:muted}}>%</span>
                  {form.splits.length>1&&<button onClick={()=>setForm(f=>({...f,splits:f.splits.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444"}}><X size={14}/></button>}
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <span style={{fontSize:12,fontWeight:700,color:totalPct===100?"#10b981":"#ef4444"}}>Total: {totalPct}%</span>
              </div>
              {splErr&&<p style={{color:"#ef4444",fontSize:12,marginTop:4}}>{splErr}</p>}
            </div>
            <label className="lbl">Notes (optional)</label>
            <textarea className="input" style={{marginBottom:20,resize:"vertical",minHeight:60}} placeholder="Add a note…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
            <div style={{display:"flex",gap:10}}>
              {editId&&<button onClick={()=>setDelId(editId)} style={{background:"rgba(239,68,68,.1)",border:"none",borderRadius:10,padding:"9px 14px",fontSize:13,fontWeight:700,color:"#ef4444",cursor:"pointer"}}><Trash2 size={13}/></button>}
              <button onClick={()=>setModal(null)} className="btn-ghost" style={{flex:1}}>Cancel</button>
              <button onClick={saveExpense} className="btn-primary" style={{flex:2}} disabled={saving}>
                {saving?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}}/> Saving…</>:<><Check size={14}/> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Project Modal ── */}
      {modal==="project"&&(
        <div className="overlay">
          <div className="modal" style={{maxWidth:400}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontWeight:700,fontSize:18,color:txt}}>New Project</h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:muted}}><X size={18}/></button>
            </div>
            <label className="lbl">Project Name</label>
            <input className="input" style={{marginBottom:14}} placeholder="Website Redesign" value={pForm.name} onChange={e=>setPForm(f=>({...f,name:e.target.value}))}/>
            <label className="lbl">Client (optional)</label>
            <input className="input" style={{marginBottom:14}} placeholder="Acme Corp" value={pForm.client} onChange={e=>setPForm(f=>({...f,client:e.target.value}))}/>
            <label className="lbl">Budget (₱, optional)</label>
            <input className="input" type="number" style={{marginBottom:14}} placeholder="80000" value={pForm.budget} onChange={e=>setPForm(f=>({...f,budget:Number(e.target.value)}))}/>
            <label className="lbl">Color</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
              {PALETTE.map(c=>(
                <button key={c} onClick={()=>setPForm(f=>({...f,color:c}))} style={{width:26,height:26,borderRadius:"50%",background:c,border:"none",cursor:"pointer",
                  outline:pForm.color===c?`3px solid ${D?"#fff":"#111"}`:"none",outlineOffset:2,transform:pForm.color===c?"scale(1.15)":"scale(1)",transition:"all .15s"}}/>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setModal(null)} className="btn-ghost" style={{flex:1}}>Cancel</button>
              <button onClick={saveProject} className="btn-primary" style={{flex:2}} disabled={saving}>
                {saving?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}}/> Saving…</>:<><FolderOpen size={13}/> Create</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {delId&&(
        <div className="overlay">
          <div className="modal" style={{maxWidth:360,textAlign:"center"}}>
            <div style={{width:52,height:52,background:"rgba(239,68,68,.12)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Trash2 size={22} color="#ef4444"/></div>
            <h3 style={{fontWeight:700,fontSize:18,color:txt,marginBottom:8}}>Delete Expense?</h3>
            <p style={{color:muted,fontSize:13,marginBottom:24}}>This action cannot be undone.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDelId(null)} className="btn-ghost" style={{flex:1}}>Cancel</button>
              <button onClick={confirmDelete} style={{flex:1,background:"#ef4444",color:"#fff",border:"none",borderRadius:10,padding:"9px 15px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upgrade modal ── */}
      {showPlan&&(
        <div className="overlay">
          <div className="modal" style={{maxWidth:400}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontWeight:700,fontSize:18,color:txt}}>Upgrade to Pro</h3>
              <button onClick={()=>setShowPlan(false)} style={{background:"none",border:"none",cursor:"pointer",color:muted}}><X size={18}/></button>
            </div>
            <div style={{background:D?"linear-gradient(135deg,#1a0e00,#111)":"#fff7ed",border:"1.5px solid rgba(249,115,22,.3)",borderRadius:16,padding:20,marginBottom:16}}>
              <p style={{fontSize:36,fontWeight:700,color:"#f97316",marginBottom:4}}>₱500<span style={{fontSize:14,color:muted}}>/month</span></p>
              <p style={{fontSize:12,color:"#f97316",fontWeight:700}}>🔥 Launch promo: ₱150 for first 7 days</p>
            </div>
            {["Unlimited expenses & projects","4-way expense splitting","AI-powered suggestions","PDF + CSV export","Priority support","Early access to new features"].map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <CheckCircle2 size={14} color="#10b981"/><span style={{fontSize:13,color:txt}}>{f}</span>
              </div>
            ))}
            <button onClick={()=>{setPlan("pro");setShowPlan(false);showToast("Welcome to Pro! 🎉");}}
              className="btn-primary" style={{width:"100%",justifyContent:"center",marginTop:20,fontSize:15,padding:"13px 20px"}}>
              <Zap size={15}/> Upgrade Now
            </button>
            <p style={{textAlign:"center",fontSize:11,color:muted,marginTop:10}}>Cancel anytime · 30-day money-back guarantee</p>
          </div>
        </div>
      )}

      {/* ── Help manual ── */}
      {showManual&&(
        <div className="overlay">
          <div className="modal" style={{maxWidth:480}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontWeight:700,fontSize:18,color:txt}}>Help Guide</h3>
              <button onClick={()=>setShowManual(false)} style={{background:"none",border:"none",cursor:"pointer",color:muted}}><X size={18}/></button>
            </div>
            {[["1. Create a project","Go to Projects → click New Project. Give it a name, a client, and an optional budget."],
              ["2. Log an expense","Click Add Expense. Fill in the description, amount, category, and date."],
              ["3. Split across projects","In the expense form, use the Project Split section. Click + Add to split across multiple projects. Percentages must total 100%."],
              ["4. View your dashboard","The Dashboard shows your total tracked expenses, estimated tax savings, monthly spending chart, and recent activity."],
              ["5. Export for BIR","Go to Reports → Export CSV. Send this file to your accountant."],
            ].map(([title,body],i)=>(
              <div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<4?`1px solid ${brd}`:"none"}}>
                <p style={{fontWeight:700,fontSize:14,color:txt,marginBottom:4}}>{title}</p>
                <p style={{fontSize:13,color:muted,lineHeight:1.6}}>{body}</p>
              </div>
            ))}
            <button onClick={()=>{setShowManual(false);setShowOnboarding(true);setOnboardingStep(0);}} className="btn-ghost" style={{width:"100%",justifyContent:"center"}}>
              <RefreshCw size={13}/> Replay Onboarding Tour
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════
   ROOT — App Router
════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | auth | app
  const [user,   setUser]   = useState(null);

  const handleAuth = userData => { setUser(userData); setScreen("app"); };
  const handleSignOut = () => { setUser(null); setScreen("landing"); };

  if (screen === "app" && user) return <Dashboard user={user} signOut={handleSignOut}/>;
  if (screen === "auth")       return <AuthScreen onAuth={handleAuth} onBack={()=>setScreen("landing")}/>;
  return <LandingPage onLogin={()=>setScreen("auth")}/>;
}