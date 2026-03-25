// LandingPage.js - React Component Version
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  Lock,
  Check,
  X,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Shield,
  Database,
  ArrowRight,
  Wallet,
  FileText,
  Share2,
  Trophy,
  LogOut,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  User,
  Menu,
} from "lucide-react";

const LandingPage = ({ onLogin, onRegister }) => {
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState("pro");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 7, hrs: 0, min: 0, sec: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  useEffect(() => {
    const end = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        min: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        sec: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  const openModal = (plan) => {
    setModalPlan(plan);
    setSelectedPlan(plan);
    setSubmitted(false);
    setSubmitting(false);
    setEmailErr(false);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = () => {
    if (!email.trim() || !email.includes("@")) {
      setEmailErr(true);
      setTimeout(() => setEmailErr(false), 2000);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1400);
  };

  const goStep = (step) => setCurrentStep(step);

  const faqs = [
    {
      q: "Is my data private?",
      a: "Yes — 100%. Each account sees only its own data. Your projects, expenses, and reports are protected with row-level security (Supabase RLS). No one else — including us — can see your financials.",
    },
    {
      q: "Is this actually BIR-compliant?",
      a: "FreelanceFunds generates a clear, itemized breakdown by project and category that your accountant can use. It doesn't replace an accountant, but it gives them exactly what they need — quickly. Always confirm with a licensed CPA for your specific BIR filings.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Absolutely. Cancel your Pro subscription at any time with one click. You keep Pro features until the end of your billing period. No penalty, no forms.",
    },
    {
      q: 'What is the "Founding Member" price?',
      a: "The first 50 subscribers get ₱500/month locked in forever — even as the product grows and the price may increase.",
    },
    {
      q: "What happens to my data if I downgrade to Free?",
      a: "Your data stays safe. You'll just be limited to 50 expenses and 3 projects going forward. All existing data remains visible.",
    },
    {
      q: "Does it work on mobile?",
      a: "Yes — and we're actively improving it. The app works on mobile browsers today.",
    },
    {
      q: "When is receipt scanning coming?",
      a: "Receipt scanning is our #1 most-requested feature and is in development now. Pro subscribers get early access.",
    },
  ];

  const testimonials = [
    {
      stars: 5,
      text: '"The dashboard is clean and easy to understand. It shows total tracked expenses and gives useful insights like total spending and estimated tax savings."',
      name: "Maria C.",
      role: "Freelance Designer",
      color: "#f97316",
      initial: "M",
    },
    {
      stars: 5,
      text: '"The app streamlines daily expense tracking effectively. Clean and intuitive with strong UX execution."',
      name: "Jerick P.",
      role: "Software Engineer",
      color: "#8b5cf6",
      initial: "J",
    },
    {
      stars: 5,
      text: '"The concept is genuinely useful for Filipino freelancers. Sleek design, dark theme with orange accents feels modern."',
      name: "Raine B.",
      role: "Freelance Copywriter",
      color: "#10b981",
      initial: "R",
    },
  ];

  const tickerItems = [
    ["Adobe CC split 60/40", "✓ auto-allocated"],
    ["BIR quarterly report", "✓ one click"],
    ["Phone bill across 3 clients", "✓ by hours"],
    ["Grab rides per project", "✓ split instantly"],
    ["₱18,000 avg annual savings", "✓ documented"],
    ["10 hours saved monthly", "✓ no spreadsheets"],
    ["8 of 9 testers use it daily", "✓ validated"],
  ];

  const styles = {
    container: {
      fontFamily: "'DM Sans', sans-serif",
      background: "#faf8f4",
      color: "#0f0e0d",
      overflowX: "hidden",
    },
    urgencyBar: {
      background: "linear-gradient(135deg,#f97316,#c2410c)",
      padding: "14px 24px",
      paddingTop: isMobile ? 68 : 70,
      textAlign: "center",
      color: "#fff",
    },
    nav: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "12px 16px" : "14px 32px",
      background: "rgba(250,248,244,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid #e8e4de",
      boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,.07)" : "none",
      transition: "all .3s",
    },
    hero: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "80px 16px 60px" : "100px 24px 80px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    btnPrimary: {
      background: "#f97316",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: "15px 30px",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      transition: "all 0.2s",
    },
    btnGhost: {
      background: "rgba(255,255,255,0.05)",
      color: "#999",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      padding: "14px 26px",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      transition: "all 0.2s",
    },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.82)",
      backdropFilter: "blur(14px)",
      zIndex: 500,
      display: modalOpen ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    modalBox: {
      background: "#111",
      border: "1px solid rgba(249,115,22,0.2)",
      borderRadius: 24,
      width: "100%",
      maxWidth: 440,
      overflow: "hidden",
      animation: "scaleIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
      maxHeight: "96vh",
      overflowY: "auto",
    },
    modalHeader: {
      background: "#f97316",
      padding: "26px 26px 22px",
      position: "relative",
    },
    input: {
      width: "100%",
      background: "#181818",
      border: "1.5px solid rgba(255,255,255,0.07)",
      borderRadius: 9,
      padding: "11px 13px",
      fontSize: 14,
      color: "#e8e3dc",
      outline: "none",
      marginBottom: 14,
    },
  };

  const demoScreens = [
    {
      url: "Projects tab",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              background: "#161616",
              borderRadius: 10,
              padding: 12,
              borderLeft: "3px solid #f97316",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e3dc" }}>
              Website Redesign
            </div>
            <div style={{ fontSize: 10, color: "#6b6560" }}>
              Acme Corp · Budget: ₱80,000
            </div>
            <div
              style={{
                height: 3,
                background: "#222",
                borderRadius: 2,
                marginTop: 7,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "42%",
                  background: "#f97316",
                  borderRadius: 2,
                }}
              ></div>
            </div>
          </div>
          <div
            style={{
              background: "#161616",
              borderRadius: 10,
              padding: 12,
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e3dc" }}>
              Brand Identity
            </div>
            <div style={{ fontSize: 10, color: "#6b6560" }}>
              Startup PH · Budget: ₱45,000
            </div>
            <div
              style={{
                height: 3,
                background: "#222",
                borderRadius: 2,
                marginTop: 7,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "78%",
                  background: "#ef4444",
                  borderRadius: 2,
                }}
              ></div>
            </div>
          </div>
          <div
            style={{
              background: "#161616",
              borderRadius: 10,
              padding: 12,
              borderLeft: "3px solid #10b981",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e3dc" }}>
              Social Media Q2
            </div>
            <div style={{ fontSize: 10, color: "#6b6560" }}>
              Bloom Co · Monthly retainer
            </div>
            <div
              style={{
                height: 3,
                background: "#222",
                borderRadius: 2,
                marginTop: 7,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "20%",
                  background: "#10b981",
                  borderRadius: 2,
                }}
              ></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      url: "Smart Split",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              background: "#161616",
              borderRadius: 9,
              padding: "10px 12px",
            }}
          >
            <div style={{ fontSize: 9, color: "#6b6560", marginBottom: 4 }}>
              Adobe Creative Cloud
            </div>
            <div style={{ fontSize: 13, color: "#e8e3dc", fontWeight: 800 }}>
              ₱1,200
            </div>
          </div>
          <div style={{ background: "#161616", borderRadius: 9, padding: 10 }}>
            <div style={{ fontSize: 9, color: "#f97316", marginBottom: 6 }}>
              ⚡ Smart Split
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f97316",
                }}
              ></div>
              <span style={{ fontSize: 11, flex: 1 }}>Website Redesign</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f97316" }}>
                60%
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#3b82f6",
                }}
              ></div>
              <span style={{ fontSize: 11, flex: 1 }}>Brand Identity</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6" }}>
                40%
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const [demoStep, setDemoStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % demoScreens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: .8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .lp-fade { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
        .lp-fade-1 { animation: fadeUp .6s .1s cubic-bezier(.16,1,.3,1) both; }
        .lp-fade-2 { animation: fadeUp .6s .2s cubic-bezier(.16,1,.3,1) both; }
        .lp-fade-3 { animation: fadeUp .6s .3s cubic-bezier(.16,1,.3,1) both; }
        .lp-fade-4 { animation: fadeUp .6s .4s cubic-bezier(.16,1,.3,1) both; }
        .lp-float { animation: float 5s ease-in-out infinite; }
        .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: #f97316; position: relative; display: inline-block; }
        .pulse-dot::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: #f97316; animation: pulse-ring 1.5s cubic-bezier(.4,0,.6,1) infinite; }
        .ticker-inner { display: inline-flex; white-space: nowrap; animation: ticker 32s linear infinite; }
        .btn:hover { transform: translateY(-2px); }
        .btn-primary:hover { background: #ea6c0a; box-shadow: 0 12px 36px rgba(249,115,22,0.4); }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); color: #e8e3dc; }
        @media (max-width: 640px) {
          .lp-pricing-grid { grid-template-columns: 1fr !important; }
          .lp-pain-grid { grid-template-columns: 1fr !important; }
          .lp-ba { grid-template-columns: 1fr !important; }
          .lp-testi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Modal */}
      <div
        style={styles.modalOverlay}
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div style={styles.modalBox}>
          <div style={styles.modalHeader}>
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: 7,
                width: 30,
                height: 30,
                cursor: "pointer",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 300,
                color: "#fff",
                marginBottom: 6,
              }}
            >
              {selectedPlan === "free"
                ? "Create Free Account"
                : "Get Pro — ₱500/month"}
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
              {selectedPlan === "free"
                ? "No credit card. Start in 30 seconds."
                : "Lock in launch pricing. Cancel anytime."}
            </p>
          </div>

          <div style={{ padding: "22px 26px 26px" }}>
            {!submitted ? (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button
                    onClick={() => setSelectedPlan("free")}
                    style={{
                      flex: 1,
                      padding: 9,
                      borderRadius: 7,
                      border: "none",
                      background:
                        selectedPlan === "free" ? "#f97316" : "transparent",
                      color: selectedPlan === "free" ? "#fff" : "#6b6560",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Free — ₱0
                  </button>
                  <button
                    onClick={() => setSelectedPlan("pro")}
                    style={{
                      flex: 1,
                      padding: 9,
                      borderRadius: 7,
                      border: "none",
                      background:
                        selectedPlan === "pro" ? "#f97316" : "transparent",
                      color: selectedPlan === "pro" ? "#fff" : "#6b6560",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Pro — ₱500/mo
                  </button>
                </div>

                <div
                  style={{
                    background: "rgba(249,115,22,0.08)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    borderRadius: 9,
                    padding: "11px 14px",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#f97316" }}>
                    {selectedPlan === "pro" ? "Pro Plan" : "Free Plan"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6560" }}>
                    {selectedPlan === "pro"
                      ? "Unlimited expenses + projects, 4-way split, AI suggestions, PDF export"
                      : "50 expenses/month, 3 projects, 2-way split, CSV export"}
                  </div>
                </div>

                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#6b6560",
                    marginBottom: 6,
                  }}
                >
                  Full Name
                </label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Maria Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#6b6560",
                    marginBottom: 6,
                  }}
                >
                  Email Address
                </label>
                <input
                  style={{
                    ...styles.input,
                    borderColor: emailErr
                      ? "#ef4444"
                      : "rgba(255,255,255,0.07)",
                  }}
                  type="email"
                  placeholder="maria@studio.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    background: "#f97316",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  {submitting
                    ? "Processing..."
                    : selectedPlan === "free"
                    ? "Create Free Account"
                    : "Get Pro — ₱500/mo"}
                </button>

                <p
                  style={{
                    fontSize: 11,
                    color: "#6b6560",
                    textAlign: "center",
                    marginTop: 12,
                    lineHeight: 1.6,
                  }}
                >
                  No payment today. We'll send instructions after confirming
                  your spot.
                  <br />
                  Cancel anytime. 30-day money-back guarantee.
                </p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(16,185,129,0.12)",
                    border: "2px solid rgba(16,185,129,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <CheckCircle2 size={26} color="#10b981" />
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 24,
                    color: "#e8e3dc",
                    marginBottom: 8,
                  }}
                >
                  You're in!
                </h3>
                <p style={{ fontSize: 13, color: "#6b6560", lineHeight: 1.7 }}>
                  We've received your request. Payment instructions are on their
                  way to your inbox.
                </p>
                <button
                  onClick={closeModal}
                  style={{
                    marginTop: 20,
                    background: "#f97316",
                    color: "#fff",
                    border: "none",
                    borderRadius: 9,
                    padding: "10px 24px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Back to Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#f97316",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              fontSize: 17,
            }}
          >
            ₣
          </div>
          {!isMobile && (
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              FreelanceFunds
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isMobile && (
            <button
              onClick={onLogin}
              style={{
                background: "none",
                border: "1.5px solid #e8e4de",
                color: "#6b6460",
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Log In
            </button>
          )}
          <button
            onClick={() => openModal("pro")}
            style={{
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(249,115,22,.35)",
            }}
          >
            🔥 {isMobile ? "₱150 Deal" : "Promo: ₱150 for 7 Days"}
          </button>
        </div>
      </nav>

      {/* Urgency Bar */}
      <div style={styles.urgencyBar}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.2)",
              border: "1px solid rgba(255,255,255,.3)",
              borderRadius: 100,
              padding: "5px 16px",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <div className="pulse-dot" /> Early Access Open
          </div>
          <p style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600 }}>
            🔥 <strong>7-Day Launch Promo:</strong> Get full Pro for just{" "}
            <strong>₱150</strong> — offer expires soon.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(249,115,22,.08) 0%, transparent 60%)",
          }}
        />

        <div
          className="lp-fade"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(249,115,22,.1)",
            border: "1px solid rgba(249,115,22,.25)",
            color: "#f97316",
            borderRadius: 100,
            padding: "7px 18px",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          <div className="pulse-dot" /> Built for Filipino Freelancers
        </div>

        <h1
          className="lp-fade-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile
              ? "clamp(36px,10vw,52px)"
              : "clamp(38px,7vw,80px)",
            lineHeight: 1.03,
            letterSpacing: "-0.03em",
            maxWidth: 820,
            marginBottom: 24,
          }}
        >
          Stop guessing at
          <br />
          <span style={{ color: "#f97316", fontStyle: "italic" }}>
            every tax season.
          </span>
        </h1>

        <p
          className="lp-fade-2"
          style={{
            fontSize: isMobile ? 15 : 18,
            color: "#6b6460",
            maxWidth: 520,
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          Track expenses across multiple clients, split costs automatically, and
          generate BIR-ready reports — in one place.
        </p>

        <div
          className="lp-fade-3"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 60,
          }}
        >
          <button
            onClick={() => openModal("pro")}
            className="btn"
            style={styles.btnPrimary}
          >
            🔥 7-Day Promo — ₱150
          </button>
          <button
            onClick={() => openModal("free")}
            className="btn"
            style={styles.btnGhost}
          >
            Try Free First
          </button>
        </div>

        {/* Preview Dashboard */}
        <div
          className="lp-float lp-fade-4"
          style={{ filter: "drop-shadow(0 32px 64px rgba(0,0,0,.15))" }}
        >
          <div
            style={{
              background: "#111",
              borderRadius: 22,
              overflow: "hidden",
              width: `min(560px, ${isMobile ? "92vw" : "92vw"})`,
              maxWidth: 560,
              border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <div
              style={{
                background: "#1a1a1a",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderBottom: "1px solid rgba(255,255,255,.05)",
              }}
            >
              {["#ef4444", "#eab308", "#22c55e"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
              <div
                style={{
                  flex: 1,
                  marginLeft: 8,
                  background: "rgba(255,255,255,.05)",
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 10,
                  color: "#444",
                  fontFamily: "monospace",
                }}
              >
                freelancefunds.app — Q3 Report
              </div>
            </div>
            <div style={{ padding: 22 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                {[
                  ["Tracked", "₱48,320", "#fff"],
                  ["Tax Savings", "₱9,664", "#86efac"],
                  ["Projects", "6", "#fff"],
                ].map(([l, v, c]) => (
                  <div
                    key={l}
                    style={{
                      background: "#1a1a1a",
                      borderRadius: 12,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 8,
                        color: "#444",
                        textTransform: "uppercase",
                        letterSpacing: ".08em",
                        marginBottom: 5,
                        fontWeight: 700,
                      }}
                    >
                      {l}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: isMobile ? 14 : 18,
                        color: c,
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>
              {[
                {
                  icon: "💻",
                  name: "Adobe Creative Cloud",
                  splits: [
                    { w: 60, c: "#f97316" },
                    { w: 40, c: "#3b82f6" },
                  ],
                  amt: "₱1,200",
                },
                {
                  icon: "🍽️",
                  name: "Client Lunch – BGC",
                  splits: [{ w: 100, c: "#10b981" }],
                  amt: "₱850",
                },
                {
                  icon: "🚗",
                  name: "Grab to Makati Office",
                  splits: [
                    { w: 50, c: "#f97316" },
                    { w: 50, c: "#a855f7" },
                  ],
                  amt: "₱320",
                },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "11px 0",
                    borderBottom:
                      i < 2 ? "1px solid rgba(255,255,255,.04)" : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: "rgba(249,115,22,.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                      }}
                    >
                      {r.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#ccc",
                          marginBottom: 5,
                        }}
                      >
                        {r.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          height: 3,
                          borderRadius: 2,
                          overflow: "hidden",
                          gap: 1,
                          width: 110,
                        }}
                      >
                        {r.splits.map((s, j) => (
                          <div
                            key={j}
                            style={{ width: `${s.w}%`, background: s.c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>
                    {r.amt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div
        style={{
          background: "#111",
          borderTop: "1px solid #1e1e1e",
          borderBottom: "1px solid #1e1e1e",
          padding: "12px 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map(([l, a], i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "0 32px",
                fontSize: 12,
                fontWeight: 600,
                color: "#444",
                borderRight: "1px solid #1e1e1e",
              }}
            >
              <span style={{ color: "#666" }}>{l}</span>{" "}
              <span style={{ color: "#f97316" }}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <section
        style={{
          background: "#fff",
          padding: isMobile ? "60px 16px" : "72px 24px",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(135deg,#0f0e0d,#1a0e00)",
              border: "2px solid rgba(249,115,22,.35)",
              borderRadius: 20,
              padding: isMobile ? "20px 16px" : "28px 32px",
              marginBottom: 64,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  background: "#f97316",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 14px",
                  borderRadius: 20,
                }}
              >
                🔥 7-Day Launch Promo
              </span>
              <span
                style={{
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Get full Pro for just{" "}
                <span style={{ color: "#f97316", fontSize: 22 }}>₱150</span> —
                then ₱500/mo
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: isMobile ? 6 : 12,
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 13, color: "#888" }}>
                Offer expires in:
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  ["days", timeLeft.days],
                  ["hrs", timeLeft.hrs],
                  ["min", timeLeft.min],
                  ["sec", timeLeft.sec],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      background: "rgba(255,255,255,.07)",
                      border: `1px solid ${
                        label === "sec"
                          ? "rgba(249,115,22,.3)"
                          : "rgba(255,255,255,.1)"
                      }`,
                      borderRadius: 10,
                      padding: "8px 14px",
                      textAlign: "center",
                      minWidth: 52,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 22,
                        color: label === "sec" ? "#f97316" : "#fff",
                      }}
                    >
                      {pad(val)}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#555",
                        textTransform: "uppercase",
                        marginTop: 3,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => openModal("pro")}
                style={{
                  background: "#f97316",
                  color: "#fff",
                  border: "none",
                  borderRadius: 11,
                  padding: "11px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Claim ₱150 Deal →
              </button>
            </div>
          </div>

          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: 14,
            }}
          >
            What Beta Testers Say
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(26px,6vw,40px)"
                : "clamp(26px,4.5vw,52px)",
              lineHeight: 1.05,
              marginBottom: 32,
            }}
          >
            Filipino freelancers{" "}
            <span style={{ color: "#f97316", fontStyle: "italic" }}>
              already love it.
            </span>
          </h2>
          <div
            className="lp-testi-grid"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
              gap: 16,
            }}
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #e8e4de",
                  borderRadius: 20,
                  padding: 28,
                  transition: "all .2s",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 22,
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 80,
                    color: "rgba(249,115,22,.08)",
                  }}
                >
                  "
                </div>
                <div
                  style={{ color: "#f97316", fontSize: 14, marginBottom: 12 }}
                >
                  {"★".repeat(t.stars)}
                </div>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.85,
                    color: "#2a2825",
                    marginBottom: 18,
                  }}
                >
                  {t.text}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: t.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#fff",
                    }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#0f0e0d",
                      }}
                    >
                      {t.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b6460" }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        style={{
          background: "#fff",
          padding: isMobile ? "72px 16px" : "100px 24px",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(26px,6vw,40px)"
                : "clamp(26px,4.5vw,52px)",
              marginBottom: 48,
            }}
          >
            Questions{" "}
            <span style={{ color: "#f97316", fontStyle: "italic" }}>
              answered honestly.
            </span>
          </h2>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {faqs.map((f, i) => (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid #e8e4de",
                  padding: "22px 0",
                  cursor: "pointer",
                }}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 700,
                    fontSize: 15,
                    gap: 16,
                  }}
                >
                  {f.q}
                  <span
                    style={{
                      color: "#f97316",
                      fontSize: 20,
                      transition: "transform .2s",
                      transform: faqOpen === i ? "rotate(45deg)" : "none",
                    }}
                  >
                    +
                  </span>
                </div>
                {faqOpen === i && (
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "#6b6460",
                      lineHeight: 1.8,
                      marginTop: 12,
                    }}
                  >
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          background: "#0f0e0d",
          padding: isMobile ? "80px 16px" : "120px 24px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,.12) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(26px,7vw,44px)"
                : "clamp(26px,4.5vw,52px)",
              lineHeight: 1.05,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Ready to stop guessing
            <br />
            <span style={{ color: "#f97316", fontStyle: "italic" }}>
              at quarter-end?
            </span>
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: 16,
              marginBottom: 40,
              maxWidth: 460,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.75,
            }}
          >
            Create your free account now. Add your first project in 30 seconds.
            The founding rate won't last.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => openModal("pro")}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "17px 38px",
                fontSize: 17,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 8px 28px rgba(249,115,22,.4)",
              }}
            >
              🔥 Claim ₱150 Promo — 7 Days Left
            </button>
            <button
              onClick={() => openModal("free")}
              style={{
                background: "rgba(255,255,255,.07)",
                color: "#aaa",
                border: "1.5px solid rgba(255,255,255,.15)",
                borderRadius: 14,
                padding: "16px 28px",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#0f0e0d",
          color: "#444",
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #1a1a1a",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#f97316",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              fontSize: 13,
            }}
          >
            ₣
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 13,
              color: "#444",
            }}
          >
            FreelanceFunds
          </span>
        </div>
        <p
          style={{ fontSize: 11, color: "#2a2a2a", textTransform: "uppercase" }}
        >
          Built for Filipino Freelancers · 2025
        </p>
        <button
          onClick={onLogin}
          style={{
            background: "none",
            border: "none",
            color: "#444",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Log In →
        </button>
      </footer>
    </div>
  );
};

export default LandingPage;
