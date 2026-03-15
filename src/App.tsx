import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Receipt,
  FolderOpen,
  FileBarChart2,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Zap,
  Download,
  Search,
  ArrowUpDown,
  ListFilter,
  Utensils,
  Car,
  Monitor,
  Package,
  Building2,
  Megaphone,
  Smartphone,
  Paperclip,
  TrendingUp,
  Clock,
  Folder,
  Tag,
  BarChart3,
  PieChart,
  AlertTriangle,
  Star,
  StickyNote,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Shield,
  Database,
  RefreshCw,
  ArrowRight,
  Info,
  Wallet,
  FileText,
  Share2,
  Lock,
  Unlock,
  Trophy,
  LogOut,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  User,
} from "lucide-react";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://kftkfpzwxsxqotadaxru.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGtmcHp3eHN4cW90YWRheHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTYxNDcsImV4cCI6MjA4OTEzMjE0N30.LF_51Ic1IkazL4dL5HRKKak1WPyfg4EG1VvzYa9V-Jw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
 * ── SUPABASE SQL (run once in SQL Editor) ────────────────────────────────────
 *
 * -- Add user_id to projects and expenses so data is private per account
 *
 * alter table projects add column if not exists user_id uuid references auth.users(id) on delete cascade;
 * alter table expenses add column if not exists user_id uuid references auth.users(id) on delete cascade;
 *
 * -- Drop old "allow all" policies and replace with per-user RLS
 * drop policy if exists "allow all" on projects;
 * drop policy if exists "allow all" on expenses;
 * drop policy if exists "allow all" on expense_splits;
 *
 * create policy "own projects"       on projects       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 * create policy "own expenses"       on expenses       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 * create policy "own splits"         on expense_splits for all using (
 *   expense_id in (select id from expenses where user_id = auth.uid())
 * );
 *
 * -- Make sure RLS is enabled
 * alter table projects       enable row level security;
 * alter table expenses       enable row level security;
 * alter table expense_splits enable row level security;
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Meals",
  "Transport",
  "Software",
  "Equipment",
  "Office",
  "Marketing",
  "Communication",
  "Other",
];
const CAT_META = {
  Meals: { Icon: Utensils, color: "#f97316" },
  Transport: { Icon: Car, color: "#3b82f6" },
  Software: { Icon: Monitor, color: "#8b5cf6" },
  Equipment: { Icon: Package, color: "#06b6d4" },
  Office: { Icon: Building2, color: "#64748b" },
  Marketing: { Icon: Megaphone, color: "#ec4899" },
  Communication: { Icon: Smartphone, color: "#10b981" },
  Other: { Icon: Paperclip, color: "#94a3b8" },
};
const AI_TIPS = {
  Meals:
    "Client meals are usually split equally — try 50/50 between active projects.",
  Transport: "Travel to a specific client? Assign 100% to that project.",
  Software: "Multi-project subscriptions? Split by estimated hours per client.",
  Equipment: "Bought for one deliverable? Assign 100% to that project.",
  Marketing: "Split marketing proportionally to each project's budget share.",
  Office: "Overhead costs? Split equally across all active projects.",
  Communication: "Phone/internet bills? Split by client communication hours.",
};
const PALETTE = [
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
];
const FREE_EXP = 50;
const FREE_PROJ = 3;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 });
const pClr = (projects, pid) =>
  projects.find((p) => p.id === pid)?.color || "#888";
const pNm = (projects, pid) =>
  projects.find((p) => p.id === pid)?.name || "Unknown";

function useBreakpoint() {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024 };
}

function useLS(key, def) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : def;
    } catch {
      return def;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
}

// ── SUPABASE AUTH HOOK ────────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, authLoading, signUp, signIn, signOut };
}

// ── SUPABASE DATA HOOK (user-scoped) ─────────────────────────────────────────
function useData(userId) {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setDbError(null);
    try {
      const { data: proj, error: pe } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (pe) throw pe;
      const { data: exp, error: ee } = await supabase
        .from("expenses")
        .select("*, expense_splits(project_id, pct)")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (ee) throw ee;
      setProjects(proj || []);
      setExpenses(
        (exp || []).map((e) => ({
          ...e,
          splits: (e.expense_splits || []).map((s) => ({
            pid: s.project_id,
            pct: s.pct,
          })),
        }))
      );
    } catch (err) {
      setDbError(err.message || "Database error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAll();
  }, [fetchAll, userId]);

  const addProject = async (f) => {
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          name: f.name,
          client: f.client,
          color: f.color,
          budget: Number(f.budget) || 0,
          user_id: userId,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    setProjects((p) => [...p, data]);
    return data;
  };
  const removeProject = async (pid) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", pid)
      .eq("user_id", userId);
    if (error) throw error;
    setProjects((p) => p.filter((x) => x.id !== pid));
  };
  const addExpense = async (f) => {
    const { data: exp, error: ee } = await supabase
      .from("expenses")
      .insert([
        {
          description: f.description,
          amount: Number(f.amount),
          category: f.category,
          date: f.date,
          notes: f.notes || "",
          user_id: userId,
        },
      ])
      .select()
      .single();
    if (ee) throw ee;
    await supabase
      .from("expense_splits")
      .insert(
        f.splits.map((s) => ({
          expense_id: exp.id,
          project_id: s.pid,
          pct: s.pct,
        }))
      );
    setExpenses((p) => [{ ...exp, splits: f.splits }, ...p]);
  };
  const updateExpense = async (id, f) => {
    const { error: ee } = await supabase
      .from("expenses")
      .update({
        description: f.description,
        amount: Number(f.amount),
        category: f.category,
        date: f.date,
        notes: f.notes || "",
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (ee) throw ee;
    await supabase.from("expense_splits").delete().eq("expense_id", id);
    await supabase
      .from("expense_splits")
      .insert(
        f.splits.map((s) => ({ expense_id: id, project_id: s.pid, pct: s.pct }))
      );
    setExpenses((p) =>
      p.map((e) =>
        e.id === id
          ? { ...e, ...f, amount: Number(f.amount), splits: f.splits }
          : e
      )
    );
  };
  const removeExpense = async (id) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    setExpenses((p) => p.filter((e) => e.id !== id));
  };

  return {
    expenses,
    projects,
    loading,
    dbError,
    addProject,
    removeProject,
    addExpense,
    updateExpense,
    removeExpense,
  };
}

// ── CHARTS ────────────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 88 }) {
  const r = 28,
    cx = 40,
    cy = 40,
    circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="12"
      />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const arc = { dash, offset: off, color: s.color };
        off += dash;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="12"
            strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
            strokeDashoffset={circ / 4 - arc.offset}
            style={{ transition: "stroke-dasharray .6s ease" }}
          />
        );
      })}
    </svg>
  );
}
function MiniBar({ data }) {
  const max = Math.max(...data.map((d) => d.val), 1);
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 64 }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <div
            style={{
              width: "100%",
              height: 52,
              display: "flex",
              alignItems: "flex-end",
              borderRadius: "3px 3px 0 0",
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                width: "100%",
                background: d.highlight ? "#f97316" : "#3b82f6",
                height: `${(d.val / max) * 100}%`,
                transition: "height .6s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 8, color: "#555", fontWeight: 700 }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
function SplitBar({ splits, projects }) {
  return (
    <div
      style={{
        display: "flex",
        height: 4,
        borderRadius: 3,
        overflow: "hidden",
        gap: 1,
      }}
    >
      {splits.map((s, i) => (
        <div
          key={i}
          style={{
            width: `${s.pct}%`,
            background: pClr(projects, s.pid),
            borderRadius:
              i === 0
                ? "3px 0 0 3px"
                : i === splits.length - 1
                ? "0 3px 3px 0"
                : 0,
            transition: "width .4s ease",
          }}
        />
      ))}
    </div>
  );
}
function Toast({ msg, type }) {
  const bg =
    { error: "#dc2626", warning: "#d97706", success: "#111" }[type] || "#111";
  const Ic =
    { error: X, warning: AlertTriangle, success: CheckCircle2 }[type] ||
    CheckCircle2;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: bg,
        color: "#fff",
        padding: "11px 20px",
        borderRadius: 30,
        fontSize: 13,
        fontWeight: 700,
        zIndex: 9999,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 8px 32px rgba(0,0,0,.5)",
        animation: "toastIn .25s ease",
        border: "1px solid rgba(255,255,255,.1)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ic size={14} /> {msg}
    </div>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({ onLogin, onRegister }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{overflow-x:hidden;scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
    @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    .bob{animation:bob 6s ease-in-out infinite}
    .mq{display:flex;white-space:nowrap;animation:marquee 28s linear infinite}
    .fade-u{animation:fadeUp .6s ease both}
    .fade-u-1{animation:fadeUp .6s .1s ease both}
    .fade-u-2{animation:fadeUp .6s .2s ease both}
    .fade-u-3{animation:fadeUp .6s .3s ease both}
    .feature-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:26px;transition:border-color .2s,background .2s}
    .feature-card:hover{background:#161616;border-color:rgba(249,115,22,.25)}
    a{text-decoration:none}
  `;

  const features = [
    {
      Icon: Zap,
      color: "#f97316",
      title: "Smart Split",
      body: "Divide any expense across multiple clients by percentage. Adobe CC at 60/40? Done in seconds.",
    },
    {
      Icon: FileText,
      color: "#10b981",
      title: "BIR-Ready Reports",
      body: "Generate a full breakdown by project and category. Export CSV or PDF and hand it to your accountant.",
    },
    {
      Icon: Shield,
      color: "#3b82f6",
      title: "Private Per Account",
      body: "Your data is yours only. Each account sees its own projects, expenses, and reports — nothing shared.",
    },
    {
      Icon: BarChart3,
      color: "#8b5cf6",
      title: "Live Dashboard",
      body: "Total tracked, estimated tax savings, monthly spend chart — all updating in real time.",
    },
    {
      Icon: StickyNote,
      color: "#ec4899",
      title: "Notes on Splits",
      body: "Add context to every expense. Document why a split was set a certain way for audit confidence.",
    },
    {
      Icon: Share2,
      color: "#06b6d4",
      title: "Share Your Stats",
      body: "Copy a shareable summary of your quarterly savings and send it to your network.",
    },
  ];

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{css}</style>

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "12px 24px" : "20px 24px",
          background: scrolled ? "rgba(10,10,10,.97)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,.06)" : "none",
          transition: "all .3s",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "#f97316",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              fontSize: 16,
            }}
          >
            ₣
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 18,
              color: "#fff",
            }}
          >
            FreelanceFunds
          </span>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {[
              ["#features", "Features"],
              ["#how", "How It Works"],
              ["#pricing", "Pricing"],
            ].map(([h, l]) => (
              <a
                key={h}
                href={h}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#666",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
              >
                {l}
              </a>
            ))}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {!isMobile && (
            <button
              onClick={onLogin}
              style={{
                background: "none",
                border: "1.5px solid rgba(255,255,255,.15)",
                color: "#ccc",
                borderRadius: 9,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,.4)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,.15)";
                e.currentTarget.style.color = "#ccc";
              }}
            >
              Log In
            </button>
          )}
          <button
            onClick={onRegister}
            style={{
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ea6c0a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f97316")}
          >
            {isMobile ? "Sign Up" : "Get Started Free"}
          </button>
          {isMobile && (
            <button
              onClick={() => setNavOpen((o) => !o)}
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.1)",
                color: "#fff",
                width: 36,
                height: 36,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              {navOpen ? <X size={16} /> : "☰"}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {isMobile && navOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 290,
            background: "rgba(0,0,0,.85)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setNavOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              top: 68,
              left: 16,
              right: 16,
              background: "#111",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,.08)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              ["#features", "Features"],
              ["#how", "How It Works"],
              ["#pricing", "Pricing"],
            ].map(([h, l]) => (
              <a
                key={h}
                href={h}
                onClick={() => setNavOpen(false)}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#ccc",
                  padding: "12px 16px",
                  borderRadius: 10,
                  display: "block",
                }}
              >
                {l}
              </a>
            ))}
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,.06)",
                margin: "8px 0",
              }}
            />
            <button
              onClick={() => {
                setNavOpen(false);
                onLogin();
              }}
              style={{
                background: "none",
                border: "1.5px solid rgba(255,255,255,.15)",
                color: "#ccc",
                borderRadius: 12,
                padding: 13,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setNavOpen(false);
                onRegister();
              }}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: 13,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "100px 20px 60px" : "120px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(249,115,22,.12) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="fade-u"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(249,115,22,.1)",
            border: "1px solid rgba(249,115,22,.25)",
            color: "#f97316",
            borderRadius: 100,
            padding: "6px 16px",
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 28,
            letterSpacing: ".07em",
          }}
        >
          BUILT FOR FILIPINO FREELANCERS
        </div>
        <h1
          className="fade-u-1"
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile
              ? "clamp(34px,10vw,52px)"
              : "clamp(44px,6vw,80px)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            marginBottom: 22,
            maxWidth: 860,
          }}
        >
          Stop losing money
          <br />
          every{" "}
          <span style={{ color: "#f97316", fontStyle: "italic" }}>
            tax season.
          </span>
        </h1>
        <p
          className="fade-u-2"
          style={{
            fontSize: isMobile ? 15 : 17,
            color: "#666",
            maxWidth: 520,
            lineHeight: 1.85,
            marginBottom: 36,
          }}
        >
          Track expenses across multiple clients, split costs automatically, and
          generate BIR-ready tax reports — in one place.
        </p>
        <div
          className="fade-u-3"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 56,
          }}
        >
          <button
            onClick={onRegister}
            style={{
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: 13,
              padding: isMobile ? "13px 26px" : "15px 32px",
              fontSize: isMobile ? 15 : 16,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ea6c0a";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f97316";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <UserPlus size={16} /> Create Free Account
          </button>
          <button
            onClick={onLogin}
            style={{
              background: "rgba(255,255,255,.05)",
              color: "#aaa",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 13,
              padding: isMobile ? "12px 22px" : "14px 28px",
              fontSize: isMobile ? 15 : 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LogIn size={16} /> Log In
          </button>
        </div>

        {/* Mock dashboard preview */}
        <div
          className="bob"
          style={{
            width: "min(500px,90vw)",
            background: "#111",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,.8)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              background: "#161616",
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
                  width: 10,
                  height: 10,
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
                borderRadius: 5,
                padding: "3px 12px",
                fontSize: 10,
                color: "#444",
              }}
            >
              freelancefunds — Dashboard
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {[
                ["Total Tracked", "₱24,390", "#fff"],
                ["Tax Savings", "₱4,878", "#86efac"],
                ["Projects", "4", "#fff"],
              ].map(([l, v, c]) => (
                <div
                  key={l}
                  style={{
                    background: "#1a1a1a",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      color: "#444",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      marginBottom: 4,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 16,
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
                ic: Monitor,
                nm: "Adobe Creative Cloud",
                clr: "#8b5cf6",
                sp: [60, 40],
                cs: ["#f97316", "#3b82f6"],
                a: "₱1,200",
              },
              {
                ic: Utensils,
                nm: "Client Lunch – BGC",
                clr: "#f97316",
                sp: [100],
                cs: ["#10b981"],
                a: "₱850",
              },
              {
                ic: Car,
                nm: "Grab to Client Office",
                clr: "#3b82f6",
                sp: [50, 50],
                cs: ["#f97316", "#a855f7"],
                a: "₱320",
              },
            ].map((r, i) => {
              const RIc = r.ic;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom:
                      i < 2 ? "1px solid rgba(255,255,255,.04)" : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${r.clr}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: r.clr,
                      }}
                    >
                      <RIc size={14} />
                    </div>
                    <div>
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}
                      >
                        {r.nm}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 2,
                          height: 3,
                          borderRadius: 2,
                          overflow: "hidden",
                          marginTop: 4,
                        }}
                      >
                        {r.sp.map((w, j) => (
                          <div
                            key={j}
                            style={{ width: `${w}%`, background: r.cs[j] }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                    {r.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div
        style={{
          background: "#111",
          overflow: "hidden",
          padding: "13px 0",
          borderTop: "1px solid rgba(255,255,255,.05)",
          borderBottom: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div className="mq">
          {[...Array(2)].flatMap(() =>
            [
              ["Monitor", "Adobe CC", "split 60/40"],
              ["Utensils", "Client meals", "auto-allocated"],
              ["FileText", "BIR reports", "one click"],
              ["Smartphone", "Phone bills", "split by hours"],
              ["Car", "Grab rides", "per project"],
              ["Megaphone", "Facebook Ads", "by budget share"],
              ["Clock", "10 hrs saved", "every month"],
              ["Shield", "₱18,000", "avg annual savings"],
            ].map(([, l, a], i) => (
              <div
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 28px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#444",
                  borderRight: "1px solid #1a1a1a",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "#666" }}>{l}</span>{" "}
                <span style={{ color: "#f97316" }}>{a}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section
        id="features"
        style={{
          padding: isMobile ? "72px 20px" : "100px 24px",
          background: "#0a0a0a",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              letterSpacing: ".09em",
              textTransform: "uppercase",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Why FreelanceFunds
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(24px,6vw,40px)"
                : "clamp(28px,4vw,48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 48,
              color: "#fff",
              textAlign: "center",
            }}
          >
            Built for how Filipino
            <br />
            <span style={{ fontStyle: "italic", color: "#f97316" }}>
              freelancers actually work.
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                ? "repeat(2,1fr)"
                : "repeat(3,1fr)",
              gap: 14,
            }}
          >
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <f.Icon size={20} color={f.color} />
                </div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#e5e5e5",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </p>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        style={{
          padding: isMobile ? "72px 20px" : "100px 24px",
          background: "#060606",
          borderTop: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              letterSpacing: ".09em",
              textTransform: "uppercase",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(24px,6vw,40px)"
                : "clamp(28px,4vw,48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 52,
              color: "#fff",
              textAlign: "center",
            }}
          >
            Value in{" "}
            <span style={{ fontStyle: "italic", color: "#f97316" }}>
              under 2 minutes.
            </span>
          </h2>
          {[
            {
              n: "01",
              Icon: UserPlus,
              t: "Create a free account",
              b: "Sign up with email and password. Your data is private — no one else sees your projects or expenses.",
            },
            {
              n: "02",
              Icon: FolderOpen,
              t: "Add a project per client",
              b: "Create one project per client. Set a budget, pick a color. Takes 30 seconds.",
            },
            {
              n: "03",
              Icon: Zap,
              t: "Log expenses with Smart Split",
              b: "Enter any expense and split the cost across clients by percentage. Adobe CC at 60/40? Done instantly.",
            },
            {
              n: "04",
              Icon: FileBarChart2,
              t: "Export your BIR-ready report",
              b: "At quarter-end, open Reports and export. Hand the CSV or PDF directly to your accountant. No panic.",
            },
          ].map((s, i, arr) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr",
                gap: 20,
                padding: "32px 0",
                borderBottom:
                  i < arr.length - 1
                    ? "1px solid rgba(255,255,255,.05)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 42,
                  color: "rgba(255,255,255,.06)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {s.n}
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <s.Icon size={16} color="#f97316" />
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#e5e5e5",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.t}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.85 }}>
                  {s.b}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        style={{
          padding: isMobile ? "72px 20px" : "100px 24px",
          background: "#0a0a0a",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              letterSpacing: ".09em",
              textTransform: "uppercase",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Simple pricing
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(24px,6vw,40px)"
                : "clamp(28px,4vw,48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 48,
              color: "#fff",
              textAlign: "center",
            }}
          >
            Start free.
            <br />
            <span style={{ fontStyle: "italic", color: "#f97316" }}>
              Upgrade when ready.
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
            }}
          >
            {[
              {
                label: "Free",
                price: "₱0",
                sub: "forever · no card needed",
                feats: [
                  "50 expenses/month",
                  "3 projects",
                  "2-way split",
                  "CSV export",
                  "Private per account",
                ],
                no: ["AI suggestions", "PDF reports", "4-way split"],
                accent: "#555",
              },
              {
                label: "Pro",
                price: "₱500",
                sub: "per month · cancel anytime",
                feats: [
                  "Unlimited expenses",
                  "Unlimited projects",
                  "4-way smart split",
                  "AI suggestions",
                  "PDF tax reports",
                  "Receipt uploads",
                ],
                no: [],
                accent: "#f97316",
                popular: true,
              },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  background: "#111",
                  border: `2px solid ${p.accent}`,
                  borderRadius: 22,
                  padding: isMobile ? 24 : 32,
                  position: "relative",
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#f97316",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 14px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: p.popular ? "#f97316" : "#555",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  {p.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 40,
                    color: p.popular ? "#f97316" : "#fff",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {p.price}
                </p>
                <p style={{ fontSize: 12, color: "#444", marginBottom: 20 }}>
                  {p.sub}
                </p>
                {p.feats.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginBottom: 9,
                    }}
                  >
                    <Check
                      size={13}
                      color={p.popular ? "#f97316" : "#10b981"}
                    />
                    <span style={{ fontSize: 13, color: "#aaa" }}>{f}</span>
                  </div>
                ))}
                {p.no.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginBottom: 9,
                    }}
                  >
                    <X size={13} color="#333" />
                    <span
                      style={{
                        fontSize: 13,
                        color: "#333",
                        textDecoration: "line-through",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
                <button
                  onClick={onRegister}
                  style={{
                    width: "100%",
                    padding: 13,
                    borderRadius: 12,
                    border: `2px solid ${
                      p.popular ? "#f97316" : "rgba(255,255,255,.12)"
                    }`,
                    background: p.popular ? "#f97316" : "transparent",
                    color: p.popular ? "#fff" : "#888",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    marginTop: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <UserPlus size={15} />{" "}
                  {p.popular ? "Start Pro Free Trial" : "Create Free Account"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "#f97316",
          padding: isMobile ? "64px 20px" : "88px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile
              ? "clamp(26px,7vw,44px)"
              : "clamp(28px,4vw,52px)",
            lineHeight: 1.06,
            color: "#fff",
            marginBottom: 14,
            letterSpacing: "-0.03em",
          }}
        >
          Ready to stop guessing
          <br />
          at quarter-end?
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,.75)",
            marginBottom: 32,
          }}
        >
          Create your free account. Add your first project in 30 seconds.
        </p>
        <button
          onClick={onRegister}
          style={{
            background: "#0a0a0a",
            color: "#fff",
            border: "none",
            borderRadius: 13,
            padding: "15px 36px",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <UserPlus size={16} /> Get Started Free
        </button>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#060606",
          padding: "24px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          borderTop: "1px solid rgba(255,255,255,.05)",
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
              fontSize: 14,
              color: "#444",
            }}
          >
            FreelanceFunds
          </span>
        </div>
        <p
          style={{
            fontSize: 11,
            color: "#2a2a2a",
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          Built for Filipino Freelancers · 2025
        </p>
      </footer>
    </div>
  );
}

// ── AUTH PAGE (Login / Register) ──────────────────────────────────────────────
function AuthPage({ mode, onSuccess, onSwitch, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false); // email confirm state
  const { signUp, signIn } = useAuth();
  const isRegister = mode === "register";

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email.trim(), password);
        setDone(true); // Supabase sends a confirmation email
      } else {
        await signIn(email.trim(), password);
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    .auth-card{animation:scaleIn .3s ease both}
  `;

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      <style>{css}</style>

      {/* Back to landing */}
      <button
        onClick={onBack}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.1)",
          color: "#888",
          borderRadius: 8,
          padding: "7px 12px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <ChevronLeft size={13} /> Back
      </button>

      <div
        className="auth-card"
        style={{
          background: "#111",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 24,
          width: "100%",
          maxWidth: 420,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "28px 28px 0", textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "#f97316",
              borderRadius: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontWeight: 900,
              color: "#fff",
              fontSize: 22,
            }}
          >
            ₣
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 26,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            {done
              ? "Check your email"
              : isRegister
              ? "Create your account"
              : "Welcome back"}
          </h2>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 28 }}>
            {done
              ? `We sent a confirmation link to ${email}. Click it to activate your account.`
              : isRegister
              ? "Free forever. No credit card needed."
              : "Log in to access your expenses and reports."}
          </p>
        </div>

        {done ? (
          <div style={{ padding: "0 28px 28px", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(16,185,129,.15)",
                border: "2px solid rgba(16,185,129,.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Mail size={24} color="#10b981" />
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#555",
                lineHeight: 1.75,
                marginBottom: 20,
              }}
            >
              After confirming your email, come back and log in.
            </p>
            <button
              onClick={() => {
                setDone(false);
                onSwitch();
              }}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LogIn size={15} /> Go to Log In
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "0 28px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 7,
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={14}
                  color="#444"
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%",
                    background: "#1a1a1a",
                    border: "1.5px solid #222",
                    borderRadius: 11,
                    padding: "11px 14px 11px 36px",
                    fontSize: 14,
                    color: "#fff",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border .15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                  onBlur={(e) => (e.target.style.borderColor = "#222")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 7,
                }}
              >
                Password{" "}
                {isRegister && (
                  <span
                    style={{
                      color: "#333",
                      fontWeight: 400,
                      textTransform: "none",
                    }}
                  >
                    (min 6 characters)
                  </span>
                )}
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={14}
                  color="#444"
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%",
                    background: "#1a1a1a",
                    border: "1.5px solid #222",
                    borderRadius: 11,
                    padding: "11px 40px 11px 36px",
                    fontSize: 14,
                    color: "#fff",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border .15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                  onBlur={(e) => (e.target.style.borderColor = "#222")}
                />
                <button
                  onClick={() => setShowPw((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#444",
                    padding: 2,
                    display: "flex",
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(220,38,38,.1)",
                  border: "1px solid rgba(220,38,38,.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertTriangle size={13} color="#dc2626" />
                <span
                  style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}
                >
                  {error}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity .15s",
              }}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={15}
                    style={{ animation: "spin .8s linear infinite" }}
                  />{" "}
                  {isRegister ? "Creating account..." : "Logging in..."}
                </>
              ) : isRegister ? (
                <>
                  <UserPlus size={15} /> Create Account
                </>
              ) : (
                <>
                  <LogIn size={15} /> Log In
                </>
              )}
            </button>

            {/* Switch */}
            <p style={{ textAlign: "center", fontSize: 13, color: "#444" }}>
              {isRegister ? "Already have an account? " : "No account yet? "}
              <button
                onClick={onSwitch}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f97316",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                {isRegister ? "Log In" : "Create one free"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── UPGRADE NUDGE ─────────────────────────────────────────────────────────────
function UpgradeNudge({ feature, onUpgrade, D, brd }) {
  return (
    <div
      style={{
        background: D ? "#1a0e00" : "#fff7ed",
        border: "1.5px dashed #f97316",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(249,115,22,.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Lock size={14} color="#f97316" />
        </div>
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#f97316",
              marginBottom: 2,
            }}
          >
            Unlock {feature}
          </p>
          <p style={{ fontSize: 11, color: D ? "#d97706" : "#92400e" }}>
            Pro users get this + unlimited everything for ₱500/month
          </p>
        </div>
      </div>
      <button
        onClick={onUpgrade}
        style={{
          background: "#f97316",
          color: "#fff",
          border: "none",
          borderRadius: 9,
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <Zap size={12} /> Upgrade
      </button>
    </div>
  );
}

// ── USER MANUAL ───────────────────────────────────────────────────────────────
const MANUAL_STEPS = [
  {
    Icon: FolderOpen,
    color: "#f97316",
    title: "Create a Project",
    body: "Start by creating one project per client. Go to the Projects tab and click '+ New Project'. Add a name, client, color, and optional budget.",
    tip: "Create one project per client — e.g. 'Website Redesign · Acme Corp'",
  },
  {
    Icon: Receipt,
    color: "#3b82f6",
    title: "Log an Expense",
    body: "Go to Expenses and click '+ Add'. Fill in description, amount, date, and category. Then use Smart Split to assign which project(s) share the cost.",
    tip: "You can split one expense across multiple projects by percentage",
  },
  {
    Icon: Zap,
    color: "#8b5cf6",
    title: "Use Smart Split",
    body: "Smart Split divides any expense across projects by percentage. Click Auto to split equally, or type custom percentages. Must always total 100%.",
    tip: "Use the Notes field to document why a split was set a certain way",
  },
  {
    Icon: LayoutDashboard,
    color: "#10b981",
    title: "Read the Dashboard",
    body: "The Dashboard shows total tracked expenses, estimated tax savings, monthly spend chart, and per-project breakdown — all in real time.",
    tip: "Estimated savings assumes 20% deduction rate — adjust with your accountant",
  },
  {
    Icon: FileBarChart2,
    color: "#ec4899",
    title: "Export Tax Reports",
    body: "Go to Reports for a BIR-ready breakdown by project and category. Export to CSV for free. Upgrade to Pro to unlock PDF export.",
    tip: "Export CSV at the end of every quarter and save it with your receipts",
  },
];

function UserManual({ onClose, tk }) {
  const [step, setStep] = useState(0);
  const cur = MANUAL_STEPS[step];
  const Ic = cur.Icon;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 900,
        padding: 16,
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: tk.card,
          border: `1px solid ${tk.brd}`,
          borderRadius: 24,
          width: "100%",
          maxWidth: 540,
          boxShadow: "0 40px 80px rgba(0,0,0,.6)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: tk.D ? "#111" : "#f9fafb",
            padding: "16px 24px 0",
            borderBottom: `1px solid ${tk.brd}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={16} color="#f97316" />
              <span style={{ fontWeight: 800, fontSize: 14, color: tk.txt }}>
                User Manual
              </span>
              <span
                style={{
                  background: "#f97316",
                  color: "#fff",
                  borderRadius: 20,
                  padding: "2px 9px",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {step + 1}/{MANUAL_STEPS.length}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: tk.muted,
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          </div>
          <div
            style={{
              height: 3,
              background: tk.D ? "#222" : "#e5e7eb",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                height: "100%",
                background: cur.color,
                width: `${((step + 1) / MANUAL_STEPS.length) * 100}%`,
                transition: "width .4s",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            padding: "14px 24px 0",
          }}
        >
          {MANUAL_STEPS.map((s, i) => {
            const DotIc = s.Icon;
            return (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: `2px solid ${
                    i === step ? s.color : i < step ? "#10b981" : tk.brd
                  }`,
                  background: i === step ? `${s.color}18` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i < step ? (
                  <Check size={11} color="#10b981" />
                ) : (
                  <DotIc size={11} color={i === step ? s.color : tk.muted} />
                )}
              </button>
            );
          })}
        </div>
        <div style={{ padding: "18px 24px" }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 13,
                background: `${cur.color}15`,
                border: `2px solid ${cur.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ic size={20} color={cur.color} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: tk.txt,
                  marginBottom: 7,
                  letterSpacing: "-0.02em",
                }}
              >
                {cur.title}
              </h3>
              <p style={{ fontSize: 13, color: tk.muted, lineHeight: 1.85 }}>
                {cur.body}
              </p>
            </div>
          </div>
          <div
            style={{
              background: tk.D ? "#1a1200" : "#fffbeb",
              border: `1px solid ${tk.D ? "#3a2800" : "#fed7aa"}`,
              borderRadius: 10,
              padding: "10px 13px",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              marginBottom: 18,
            }}
          >
            <Sparkles
              size={12}
              color="#f97316"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <p
              style={{
                fontSize: 12,
                color: tk.D ? "#d97706" : "#92400e",
                lineHeight: 1.75,
              }}
            >
              {cur.tip}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "none",
                border: `1.5px solid ${tk.brd}`,
                color: step === 0 ? tk.muted : tk.txt,
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: step === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: step === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            {step < MANUAL_STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#f97316",
                  border: "none",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Next <ChevronRight size={13} />
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#f97316",
                  border: "none",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <CheckCircle2 size={13} /> Got it!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SHARE CARD ────────────────────────────────────────────────────────────────
function ShareCard({ grandTotal, estSavings, projects, onClose, tk }) {
  const [copied, setCopied] = useState(false);
  const text = `I tracked ${fmt(
    grandTotal
  )} in expenses this quarter and estimated ${fmt(
    estSavings
  )} in tax savings using FreelanceFunds — the expense tracker built for Filipino freelancers. Try it free: freelancefunds.app`;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 800,
        padding: 16,
        backdropFilter: "blur(10px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: tk.card,
          border: `1px solid ${tk.brd}`,
          borderRadius: 22,
          width: "100%",
          maxWidth: 400,
          overflow: "hidden",
        }}
      >
        <div
          style={{ background: "#111", padding: "20px 24px", color: "#fff" }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,.4)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: 6,
            }}
          >
            My FreelanceFunds Report
          </p>
          <p
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 32,
              letterSpacing: "-0.03em",
              marginBottom: 4,
            }}
          >
            {fmt(grandTotal)}
          </p>
          <p style={{ fontSize: 13, color: "#86efac", fontWeight: 700 }}>
            Est. {fmt(estSavings)} in tax savings
          </p>
        </div>
        <div style={{ padding: "18px 24px" }}>
          <div
            style={{
              background: tk.D ? "#1a1a1a" : "#f9fafb",
              border: `1px solid ${tk.brd}`,
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 14,
            }}
          >
            <p style={{ fontSize: 12, color: tk.muted, lineHeight: 1.7 }}>
              {text}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(text).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{
                flex: 1,
                background: copied ? "#10b981" : "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={13} /> Copied!
                </>
              ) : (
                <>
                  <Share2 size={13} /> Copy to share
                </>
              )}
            </button>
            <button
              onClick={onClose}
              style={{
                background: tk.D ? "#1e1e1e" : "#f3f4f6",
                color: tk.muted,
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
function FreelanceFundsApp({ user, signOut }) {
  const {
    expenses,
    projects,
    loading,
    dbError,
    addProject,
    removeProject,
    addExpense,
    updateExpense,
    removeExpense,
  } = useData(user.id);
  const [dark, setDark] = useLS("ff_dark", true);
  const [seenOb, setSeenOb] = useLS(`ff_ob_${user.id}`, false);
  const [plan, setPlan] = useLS(`ff_plan_${user.id}`, "free");
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [fPid, setFPid] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saving, setSaving] = useState(false);

  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const isPro = plan === "pro";
  const maxExp = isPro ? Infinity : FREE_EXP;
  const maxProj = isPro ? Infinity : FREE_PROJ;
  const maxSpl = isPro ? 4 : 2;

  const D = dark;
  const bg = D ? "#0b0b0b" : "#f4f3ef";
  const card = D ? "#141414" : "#ffffff";
  const brd = D ? "#222" : "#e5e7eb";
  const txt = D ? "#e5e5e5" : "#111111";
  const muted = D ? "#555" : "#9ca3af";
  const inp = D ? "#1a1a1a" : "#ffffff";
  const tk = { D, bg, card, brd, txt, muted };

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Software",
    date: new Date().toISOString().split("T")[0],
    splits: [{ pid: "", pct: 100 }],
    notes: "",
  });
  const [pForm, setPForm] = useState({
    name: "",
    client: "",
    color: "#f97316",
    budget: "",
  });
  const [splErr, setSplErr] = useState("");

  const totalPct = form.splits.reduce((s, x) => s + Number(x.pct), 0);
  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const estSavings = Math.round(grandTotal * 0.2);
  const projTotals = Object.fromEntries(projects.map((p) => [p.id, 0]));
  expenses.forEach((e) =>
    e.splits.forEach((s) => {
      projTotals[s.pid] = (projTotals[s.pid] || 0) + (e.amount * s.pct) / 100;
    })
  );
  const catTotals = {};
  expenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const monthly = (() => {
    const labs = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const vals = Array(12).fill(0);
    expenses.forEach((e) => {
      vals[new Date(e.date).getMonth()] += e.amount;
    });
    return labs.map((label, i) => ({
      label,
      val: vals[i],
      highlight: vals[i] === Math.max(...vals) && vals[i] > 0,
    }));
  })();
  const sorted = [...expenses]
    .filter((e) => {
      if (fPid !== "all" && !e.splits.some((s) => s.pid === fPid)) return false;
      if (fCat !== "all" && e.category !== fCat) return false;
      if (search && !e.description.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const openAdd = () => {
    if (expenses.length >= maxExp) {
      showToast(`Free plan: max ${maxExp} expenses`, "warning");
      setShowPlan(true);
      return;
    }
    setEditId(null);
    setForm({
      description: "",
      amount: "",
      category: "Software",
      date: new Date().toISOString().split("T")[0],
      splits: [{ pid: projects[0]?.id || "", pct: 100 }],
      notes: "",
    });
    setSplErr("");
    setModal("expense");
  };
  const openEdit = (e) => {
    setEditId(e.id);
    setForm({
      description: e.description,
      amount: String(e.amount),
      category: e.category,
      date: e.date,
      splits: [...e.splits],
      notes: e.notes || "",
    });
    setSplErr("");
    setModal("expense");
  };
  const saveExpense = async () => {
    if (!form.description.trim() || !form.amount) {
      showToast("Fill in description and amount", "error");
      return;
    }
    if (totalPct !== 100) {
      setSplErr("Splits must total exactly 100%");
      return;
    }
    setSplErr("");
    setSaving(true);
    try {
      if (editId) {
        await updateExpense(editId, form);
        showToast("Expense updated");
      } else {
        await addExpense(form);
        showToast("Expense saved — split applied!");
      }
      setModal(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };
  const confirmDelete = async () => {
    try {
      await removeExpense(delId);
      setDelId(null);
      showToast("Expense deleted");
    } catch (err) {
      showToast(err.message, "error");
    }
  };
  const autoSplit = () => {
    const n = form.splits.length,
      base = Math.floor(100 / n),
      rem = 100 - base * n;
    setForm((f) => ({
      ...f,
      splits: f.splits.map((s, i) => ({
        ...s,
        pct: i === 0 ? base + rem : base,
      })),
    }));
  };
  const saveProject = async () => {
    if (!pForm.name.trim()) {
      showToast("Project name required", "error");
      return;
    }
    if (projects.length >= maxProj) {
      showToast(`You've hit the free limit. Upgrade to add more.`, "warning");
      setShowPlan(true);
      setModal(null);
      return;
    }
    setSaving(true);
    try {
      await addProject(pForm);
      setPForm({ name: "", client: "", color: "#f97316", budget: "" });
      setModal(null);
      showToast("Project created!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };
  const handleRemoveProject = async (pid) => {
    if (expenses.some((e) => e.splits.some((s) => s.pid === pid))) {
      showToast("Remove linked expenses first", "warning");
      return;
    }
    try {
      await removeProject(pid);
      showToast("Project removed");
    } catch (err) {
      showToast(err.message, "error");
    }
  };
  const exportCSV = () => {
    const rows = [
      [
        "Date",
        "Description",
        "Category",
        "Amount",
        "Notes",
        "Project",
        "Split%",
        "Project Amount",
      ],
    ];
    expenses.forEach((e) =>
      e.splits.forEach((s) => {
        rows.push([
          e.date,
          `"${e.description}"`,
          e.category,
          e.amount,
          `"${e.notes || ""}"`,
          `"${pNm(projects, s.pid)}"`,
          s.pct,
          Math.round((e.amount * s.pct) / 100),
        ]);
      })
    );
    const a = document.createElement("a");
    a.href =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(rows.map((r) => r.join(",")).join("\n"));
    a.download = "freelancefunds-export.csv";
    a.click();
    showToast("CSV exported — BIR-ready!");
  };

  const nearLimit =
    !isPro &&
    (expenses.length / FREE_EXP >= 0.7 || projects.length / FREE_PROJ >= 0.7);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{overflow-x:hidden;max-width:100vw;-webkit-font-smoothing:antialiased}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    .fade-up{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
    .fade-up-1{animation:fadeUp .4s .05s cubic-bezier(.16,1,.3,1) both}
    .fade-up-2{animation:fadeUp .4s .1s cubic-bezier(.16,1,.3,1) both}
    .fade-up-3{animation:fadeUp .4s .15s cubic-bezier(.16,1,.3,1) both}
    .scale-in{animation:scaleIn .25s ease both}
    .btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:10px;padding:9px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap}
    .btn-ghost{background:${D ? "#1e1e1e" : "#f3f4f6"};color:${
    D ? "#888" : "#374151"
  }}
    .btn-ghost:hover{background:${D ? "#282828" : "#e5e7eb"}}
    .btn-primary{background:#f97316;color:#fff;box-shadow:0 2px 12px rgba(249,115,22,.35)}
    .btn-primary:hover{background:#ea6c0a;transform:translateY(-1px);box-shadow:0 4px 18px rgba(249,115,22,.45)}
    .btn-danger{background:${D ? "#2a1010" : "#fee2e2"};color:#dc2626}
    .btn-pro{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;box-shadow:0 4px 14px rgba(249,115,22,.4)}
    .btn-share{background:${
      D ? "#0d2015" : "#f0fdf4"
    };color:#16a34a;border:1.5px solid ${D ? "#1a4a2a" : "#bbf7d0"}}
    .input{width:100%;border:1.5px solid ${brd};border-radius:10px;padding:10px 14px;font-family:inherit;font-size:14px;outline:none;background:${inp};color:${txt};transition:border .15s}
    .input:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.12)}
    select.input{appearance:none}
    textarea.input{resize:vertical;min-height:68px;line-height:1.6}
    .lbl{display:block;font-size:10px;font-weight:800;color:${muted};text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
    .card{background:${card};border-radius:18px;border:1px solid ${brd};transition:all .2s}
    .card:hover{border-color:${
      D ? "rgba(249,115,22,.2)" : "rgba(249,115,22,.15)"
    };box-shadow:0 4px 24px rgba(0,0,0,${D ? 0.2 : 0.06})}
    .stat-card{background:${card};border-radius:16px;border:1px solid ${brd};padding:${
    isMobile ? "14px" : "20px"
  };position:relative;overflow:hidden;transition:all .2s}
    .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,${
      D ? 0.25 : 0.08
    })}
    .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f97316,#ea580c);opacity:0;transition:opacity .2s}
    .stat-card:hover::before{opacity:1}
    .row{border-radius:14px;padding:14px 16px;border:1px solid ${
      D ? "#1e1e1e" : "#f0f0f0"
    };background:${card};transition:all .18s;cursor:pointer}
    .row:hover{border-color:${
      D ? "rgba(249,115,22,.25)" : "rgba(249,115,22,.2)"
    };box-shadow:0 6px 20px rgba(0,0,0,${
    D ? 0.2 : 0.06
  });transform:translateY(-1px)}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:600;padding:16px;backdrop-filter:blur(12px)}
    .modal{background:${card};border-radius:24px;padding:24px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;border:1px solid ${brd};box-shadow:0 24px 60px rgba(0,0,0,.4)}
    .tab-btn{background:none;border:none;cursor:pointer;padding:8px 14px;border-radius:9px;font-family:inherit;font-size:13px;font-weight:700;color:${muted};transition:all .15s;display:flex;align-items:center;gap:7px;white-space:nowrap}
    .tab-btn:hover{color:${txt};background:${
    D ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)"
  }}
    .tab-btn.active{background:#f97316;color:#fff;box-shadow:0 2px 10px rgba(249,115,22,.35)}
    .mob-tab{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;cursor:pointer;padding:8px 0 10px;font-family:inherit;font-size:9px;font-weight:800;color:${muted};transition:all .2s;flex:1;letter-spacing:.03em;text-transform:uppercase;position:relative}
    .mob-tab.active{color:#f97316}
    .mob-tab.active::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:32px;height:2px;background:#f97316;border-radius:0 0 3px 3px}
    .mob-tab-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;transition:all .2s;background:transparent}
    .mob-tab.active .mob-tab-icon{background:rgba(249,115,22,.12)}
    .prog{height:5px;background:${
      D ? "#1f1f1f" : "#f3f4f6"
    };border-radius:3px;overflow:hidden}
    .prog-bar{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.4,0,.2,1)}
    .split-row{display:flex;gap:8px;align-items:center;padding:8px;background:${
      D ? "#1a1a1a" : "#f9fafb"
    };border-radius:10px;border:1px solid ${brd};flex-wrap:wrap}
    .color-swatch{width:26px;height:26px;border-radius:50%;cursor:pointer;transition:transform .15s;flex-shrink:0}
    .color-swatch:hover{transform:scale(1.18)}
    .color-swatch.sel{box-shadow:0 0 0 3px ${
      D ? "#fff" : "#111"
    },0 0 0 5px transparent;transform:scale(1.1)}
    .badge-pro{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;box-shadow:0 2px 8px rgba(249,115,22,.3)}
    .badge-free{background:${
      D ? "#1e1e1e" : "#f3f4f6"
    };color:${muted};border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;border:1px solid ${brd}}
    .badge-db{background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(16,185,129,.25)}
    .limit-bar{height:4px;border-radius:2px;overflow:hidden;background:${
      D ? "#222" : "#f3f4f6"
    };margin-top:4px}
    .pulse{animation:pulse 2s ease-in-out infinite}
    .glow-orange{box-shadow:0 0 0 1px rgba(249,115,22,.2),0 4px 20px rgba(249,115,22,.15)}
    @media(max-width:480px){.modal{padding:16px;border-radius:20px}}
  `;

  const navItems = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard" },
    { id: "expenses", Icon: Receipt, label: "Expenses" },
    { id: "projects", Icon: FolderOpen, label: "Projects" },
    { id: "reports", Icon: FileBarChart2, label: "Reports" },
  ];

  if (dbError)
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          background: "#0d0d0d",
          minHeight: "100vh",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <Database size={44} color="#f97316" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Database Error</h2>
          <p style={{ color: "#555", fontSize: 13 }}>{dbError}</p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div
        style={{
          background: D ? "#0d0d0d" : "#f4f3ef",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #222",
            borderTopColor: "#f97316",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        background: bg,
        minHeight: "100vh",
        color: txt,
        paddingBottom: isMobile ? 72 : 0,
        overflowX: "hidden",
      }}
    >
      <style>{css}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {showManual && (
        <UserManual onClose={() => setShowManual(false)} tk={tk} />
      )}
      {showShare && (
        <ShareCard
          grandTotal={grandTotal}
          estSavings={estSavings}
          projects={projects}
          onClose={() => setShowShare(false)}
          tk={tk}
        />
      )}

      {delId && (
        <div className="overlay">
          <div
            className="modal scale-in"
            style={{ maxWidth: 320, textAlign: "center" }}
          >
            <Trash2 size={36} color="#dc2626" style={{ marginBottom: 12 }} />
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                marginBottom: 8,
                color: txt,
              }}
            >
              Delete this expense?
            </h3>
            <p style={{ color: muted, fontSize: 13, marginBottom: 22 }}>
              This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-danger" onClick={confirmDelete}>
                <Trash2 size={13} /> Delete
              </button>
              <button className="btn btn-ghost" onClick={() => setDelId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlan && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setShowPlan(false)}
        >
          <div
            className="modal scale-in"
            style={{ maxWidth: isMobile ? "100%" : 600 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 24,
                  color: txt,
                }}
              >
                Upgrade to Pro
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 10px" }}
                onClick={() => setShowPlan(false)}
              >
                <X size={15} />
              </button>
            </div>
            {!isPro && (
              <div
                style={{
                  background: D ? "#111" : "#f9fafb",
                  border: `1px solid ${brd}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 18,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: txt,
                    marginBottom: 10,
                  }}
                >
                  Your current usage
                </p>
                {[
                  {
                    label: "Expenses",
                    used: expenses.length,
                    max: FREE_EXP,
                    color: "#f97316",
                  },
                  {
                    label: "Projects",
                    used: projects.length,
                    max: FREE_PROJ,
                    color: "#3b82f6",
                  },
                ].map((u) => (
                  <div key={u.label} style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, color: muted }}>
                        {u.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color:
                            Math.round((u.used / u.max) * 100) >= 70
                              ? "#f97316"
                              : txt,
                        }}
                      >
                        {u.used}/{u.max}
                      </span>
                    </div>
                    <div className="limit-bar">
                      <div
                        style={{
                          height: "100%",
                          background: u.color,
                          width: `${Math.min(
                            100,
                            Math.round((u.used / u.max) * 100)
                          )}%`,
                          borderRadius: 2,
                          transition: "width .5s",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                {
                  label: "Free",
                  price: "₱0",
                  sub: "forever",
                  feats: [
                    "50 expenses/month",
                    "3 projects",
                    "2-way split",
                    "CSV export",
                  ],
                  no: ["AI suggestions", "PDF reports", "4-way split"],
                  accent: plan === "free" ? "#10b981" : brd,
                  cur: plan === "free",
                },
                {
                  label: "Pro",
                  price: "₱500",
                  sub: "per month",
                  feats: [
                    "Unlimited expenses",
                    "Unlimited projects",
                    "4-way split",
                    "AI suggestions",
                    "PDF tax reports",
                    "Receipt uploads",
                  ],
                  no: [],
                  accent: "#f97316",
                  cur: plan === "pro",
                  popular: true,
                },
              ].map((p) => (
                <div
                  key={p.label}
                  style={{
                    border: `2px solid ${p.accent}`,
                    borderRadius: 18,
                    padding: 22,
                    position: "relative",
                    background: p.cur
                      ? D
                        ? "#1a0e00"
                        : "#fff7ed"
                      : D
                      ? "#1a1a1a"
                      : "#fafafa",
                  }}
                >
                  {p.popular && (
                    <div
                      style={{
                        position: "absolute",
                        top: -11,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#f97316",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "3px 12px",
                        borderRadius: 20,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.cur ? "CURRENT" : "MOST POPULAR"}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#f97316",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    {p.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 32,
                      color: txt,
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {p.price}
                  </p>
                  <p style={{ fontSize: 12, color: muted, marginBottom: 14 }}>
                    {p.sub}
                  </p>
                  {p.feats.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 7,
                      }}
                    >
                      <Check
                        size={12}
                        color={p.label === "Pro" ? "#f97316" : "#10b981"}
                      />
                      <span style={{ fontSize: 12, color: txt }}>{f}</span>
                    </div>
                  ))}
                  {p.no.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 7,
                      }}
                    >
                      <X size={12} color={muted} />
                      <span
                        style={{
                          fontSize: 12,
                          color: muted,
                          textDecoration: "line-through",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setPlan(p.label.toLowerCase());
                      showToast(
                        p.label === "Pro" ? "Pro unlocked!" : "Switched to Free"
                      );
                      setShowPlan(false);
                    }}
                    style={{
                      width: "100%",
                      padding: 11,
                      borderRadius: 10,
                      border: `2px solid ${
                        p.label === "Pro" ? "#f97316" : brd
                      }`,
                      background:
                        p.label === "Pro"
                          ? p.cur
                            ? "#10b981"
                            : "#f97316"
                          : "transparent",
                      color: p.label === "Pro" ? "#fff" : txt,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      marginTop: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    {p.cur ? (
                      "Current Plan"
                    ) : p.label === "Pro" ? (
                      <>
                        <Unlock size={13} />
                        Upgrade — ₱500/month
                      </>
                    ) : (
                      "Use Free Plan"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header
        style={{
          background: D ? "rgba(14,14,14,.92)" : card,
          borderBottom: `1px solid ${brd}`,
          padding: isMobile ? "0 12px" : "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 58,
          position: "sticky",
          top: 0,
          zIndex: 200,
          gap: 8,
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "#f97316",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              fontSize: 15,
            }}
          >
            ₣
          </div>
          {!isMobile && (
            <span
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 17,
                color: txt,
              }}
            >
              FreelanceFunds
            </span>
          )}
          {isPro ? (
            <span className="badge-pro">PRO</span>
          ) : (
            <span className="badge-free">FREE</span>
          )}
          <span className="badge-db">
            <Database size={9} /> Live
          </span>
        </div>
        {!isSmall && (
          <nav
            style={{
              display: "flex",
              gap: 2,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {navItems.map(({ id, Icon, label }) => (
              <button
                key={id}
                className={`tab-btn ${tab === id ? "active" : ""}`}
                onClick={() => setTab(id)}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </nav>
        )}
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {expenses.length > 0 && (
            <button
              className="btn btn-share"
              style={{ padding: "7px 10px", fontSize: 12 }}
              onClick={() => setShowShare(true)}
            >
              <Share2 size={14} />
              {!isMobile && " Share"}
            </button>
          )}
          <button
            className="btn btn-ghost"
            style={{ padding: "7px 9px" }}
            onClick={() => setShowManual(true)}
          >
            <HelpCircle size={16} />
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: "7px 9px" }}
            onClick={() => setDark((d) => !d)}
          >
            {D ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {!isPro && !isMobile && (
            <button
              className={`btn btn-pro ${nearLimit ? "pulse" : ""}`}
              style={{ fontSize: 12, padding: "7px 12px" }}
              onClick={() => setShowPlan(true)}
            >
              <Zap size={13} /> {nearLimit ? "Upgrade Now" : "Pro"}
            </button>
          )}
          {/* User menu */}
          {!isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: D ? "#1e1e1e" : "#f3f4f6",
                borderRadius: 10,
                padding: "6px 12px",
              }}
            >
              <User size={13} color={muted} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: muted,
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </span>
              <button
                onClick={signOut}
                title="Sign out"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                  display: "flex",
                  padding: 2,
                }}
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
          {!isSmall && (
            <>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12 }}
                onClick={() => {
                  setModal("project");
                  setPForm({
                    name: "",
                    client: "",
                    color: "#f97316",
                    budget: "",
                  });
                }}
              >
                <Plus size={14} /> Project
              </button>
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={14} /> Add
              </button>
            </>
          )}
          {isMobile && (
            <button
              className="btn btn-primary"
              style={{ padding: "7px 13px" }}
              onClick={openAdd}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Usage bar */}
      {!isPro && (
        <div
          style={{
            background: D ? "#111" : "#fafafa",
            borderBottom: `1px solid ${brd}`,
            padding: "6px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Expenses",
                used: expenses.length,
                max: FREE_EXP,
                color: "#f97316",
              },
              {
                label: "Projects",
                used: projects.length,
                max: FREE_PROJ,
                color: "#3b82f6",
              },
            ].map((u) => (
              <div
                key={u.label}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span style={{ fontSize: 11, color: muted }}>{u.label}:</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color:
                      Math.round((u.used / u.max) * 100) >= 80
                        ? "#f97316"
                        : txt,
                  }}
                >
                  {u.used}/{u.max}
                </span>
                <div style={{ width: 40 }}>
                  <div className="limit-bar">
                    <div
                      style={{
                        height: "100%",
                        background: u.color,
                        borderRadius: 2,
                        width: `${Math.min(
                          100,
                          Math.round((u.used / u.max) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <span style={{ fontSize: 11, color: muted }}>2-way split only</span>
          </div>
          <button
            className="btn btn-pro"
            style={{ fontSize: 11, padding: "4px 12px" }}
            onClick={() => setShowPlan(true)}
          >
            <Zap size={11} /> Upgrade
          </button>
        </div>
      )}

      {isTablet && (
        <div
          style={{
            background: card,
            borderBottom: `1px solid ${brd}`,
            padding: "8px 16px",
            display: "flex",
            gap: 6,
            overflowX: "auto",
          }}
        >
          {navItems.map(({ id, Icon, label }) => (
            <button
              key={id}
              className={`tab-btn ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
              style={{ flexShrink: 0 }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}

      <main
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: isMobile
            ? "16px 12px"
            : isTablet
            ? "20px 16px"
            : "28px 20px",
        }}
      >
        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            {/* Page header */}
            <div
              className="fade-up"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: isMobile ? 26 : 32,
                    letterSpacing: "-0.03em",
                    marginBottom: 4,
                    color: txt,
                  }}
                >
                  Good day <span style={{ color: "#f97316" }}>✦</span>
                </h1>
                <p
                  style={{
                    color: muted,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "inline-block",
                    }}
                  />
                  {expenses.length} expenses · {projects.length} projects ·{" "}
                  {isPro ? "Pro Plan" : "Free Plan"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 12 }}
                  onClick={() => setShowManual(true)}
                >
                  <BookOpen size={13} /> Manual
                </button>
                {!isMobile && (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={exportCSV}
                  >
                    <Download size={13} /> Export
                  </button>
                )}
                {expenses.length > 0 && (
                  <button
                    className="btn btn-share"
                    style={{ fontSize: 12 }}
                    onClick={() => setShowShare(true)}
                  >
                    <Share2 size={13} /> Share
                  </button>
                )}
              </div>
            </div>

            {/* Empty state */}
            {expenses.length === 0 && projects.length === 0 && (
              <div
                className="fade-up-1"
                style={{
                  background: D
                    ? "linear-gradient(135deg,#141414,#1a1200)"
                    : "linear-gradient(135deg,#fff,#fff7ed)",
                  border: `1.5px dashed ${
                    D ? "rgba(249,115,22,.3)" : "rgba(249,115,22,.25)"
                  }`,
                  borderRadius: 24,
                  padding: "52px 32px",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: "rgba(249,115,22,.12)",
                    border: "2px solid rgba(249,115,22,.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: "0 8px 32px rgba(249,115,22,.15)",
                  }}
                >
                  <FolderOpen size={30} color="#f97316" />
                </div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 22,
                    color: txt,
                    marginBottom: 8,
                  }}
                >
                  Value in 2 minutes
                </h2>
                <p
                  style={{
                    color: muted,
                    fontSize: 14,
                    lineHeight: 1.75,
                    maxWidth: 340,
                    margin: "0 auto 8px",
                  }}
                >
                  Create your first project, log one expense, and see your
                  estimated tax savings instantly.
                </p>
                <p
                  style={{
                    color: "#f97316",
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 28,
                  }}
                >
                  Start here — takes 30 seconds.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 14, padding: "12px 22px" }}
                    onClick={() => {
                      setModal("project");
                      setPForm({
                        name: "",
                        client: "",
                        color: "#f97316",
                        budget: "",
                      });
                    }}
                  >
                    <FolderOpen size={15} /> Create First Project
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setShowManual(true)}
                  >
                    <BookOpen size={14} /> Read Manual
                  </button>
                </div>
              </div>
            )}

            {/* Project created but no expenses nudge */}
            {projects.length > 0 && expenses.length === 0 && (
              <div
                className="fade-up-1"
                style={{
                  background: D
                    ? "linear-gradient(135deg,#0d1a2a,#0a1520)"
                    : "linear-gradient(135deg,#eff6ff,#e0f2fe)",
                  border: `1px solid ${
                    D ? "rgba(59,130,246,.2)" : "rgba(59,130,246,.25)"
                  }`,
                  borderRadius: 18,
                  padding: "20px 24px",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 13,
                    background: "rgba(59,130,246,.15)",
                    border: "1px solid rgba(59,130,246,.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Receipt size={21} color="#3b82f6" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: txt,
                      marginBottom: 3,
                    }}
                  >
                    Project ready — log your first expense
                  </p>
                  <p style={{ fontSize: 12, color: muted }}>
                    Your dashboard will show live tax savings as soon as you add
                    one.
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={openAdd}
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={14} /> Add Expense
                </button>
              </div>
            )}

            {expenses.length > 0 && (
              <>
                {/* ── HERO STATS ── */}
                <div
                  className="fade-up-1"
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  {/* Total tracked */}
                  <div
                    style={{
                      background: D
                        ? "linear-gradient(135deg,#111,#1a0e00)"
                        : "linear-gradient(135deg,#fff,#fff7ed)",
                      borderRadius: 22,
                      padding: isMobile ? "20px 20px" : "24px 28px",
                      position: "relative",
                      overflow: "hidden",
                      border: `1px solid ${
                        D ? "rgba(249,115,22,.18)" : "rgba(249,115,22,.2)"
                      }`,
                      boxShadow: D
                        ? "0 8px 32px rgba(0,0,0,.4)"
                        : "0 4px 20px rgba(249,115,22,.1)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: -30,
                        top: -30,
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        background: "rgba(249,115,22,.08)",
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ position: "absolute", right: 10, top: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "rgba(249,115,22,.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Wallet size={16} color="#f97316" />
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#f97316",
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        marginBottom: 10,
                      }}
                    >
                      Total Tracked
                    </p>
                    <p
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: isMobile ? 34 : 42,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        color: txt,
                        marginBottom: 6,
                      }}
                    >
                      {fmt(grandTotal)}
                    </p>
                    <p style={{ color: muted, fontSize: 12 }}>
                      {expenses.length} expenses across {projects.length}{" "}
                      project{projects.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Tax savings */}
                  <div
                    style={{
                      background: D
                        ? "linear-gradient(135deg,#0a1a0f,#0d2015)"
                        : "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                      borderRadius: 22,
                      padding: isMobile ? "20px 20px" : "24px 28px",
                      position: "relative",
                      overflow: "hidden",
                      border: `1px solid ${
                        D ? "rgba(16,185,129,.18)" : "rgba(16,185,129,.25)"
                      }`,
                      boxShadow: D
                        ? "0 8px 32px rgba(0,0,0,.4)"
                        : "0 4px 20px rgba(16,185,129,.1)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: -30,
                        top: -30,
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        background: "rgba(16,185,129,.08)",
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ position: "absolute", right: 10, top: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "rgba(16,185,129,.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Shield size={16} color="#10b981" />
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#10b981",
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        marginBottom: 10,
                      }}
                    >
                      Est. Tax Savings
                    </p>
                    <p
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: isMobile ? 34 : 42,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        color: txt,
                        marginBottom: 6,
                      }}
                    >
                      {fmt(estSavings)}
                    </p>
                    <p style={{ color: muted, fontSize: 12 }}>
                      at 20% deduction rate
                    </p>
                  </div>
                </div>

                {/* ── MINI STATS ROW ── */}
                <div
                  className="fade-up-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  {[
                    {
                      label: "Avg Expense",
                      val: fmt(Math.round(grandTotal / expenses.length)),
                      Icon: BarChart3,
                      accent: "#8b5cf6",
                    },
                    {
                      label: "Top Category",
                      val:
                        Object.entries(catTotals).sort(
                          (a, b) => b[1] - a[1]
                        )[0]?.[0] || "–",
                      Icon: Tag,
                      accent: "#f97316",
                    },
                    {
                      label: "Hours Saved",
                      val: "~10 hrs",
                      Icon: Clock,
                      accent: "#3b82f6",
                    },
                  ].map((s, i) => (
                    <div key={i} className="stat-card">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: `${s.accent}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 10,
                        }}
                      >
                        <s.Icon size={15} color={s.accent} />
                      </div>
                      <p className="lbl" style={{ marginBottom: 4 }}>
                        {s.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: isMobile ? 15 : 18,
                          color: txt,
                          lineHeight: 1,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {s.val}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── CHARTS ROW ── */}
                <div
                  className="fade-up-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "5fr 3fr",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  {/* Bar chart */}
                  <div className="card" style={{ padding: isMobile ? 16 : 22 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: txt,
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <BarChart3 size={14} color="#f97316" /> Monthly Spend
                        </p>
                        <p style={{ fontSize: 11, color: muted, marginTop: 2 }}>
                          2025 overview
                        </p>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#f97316",
                        }}
                      >
                        {fmt(grandTotal)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 4,
                        height: 72,
                      }}
                    >
                      {monthly.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: 56,
                              display: "flex",
                              alignItems: "flex-end",
                              borderRadius: "4px 4px 0 0",
                              overflow: "hidden",
                              background: D
                                ? "rgba(255,255,255,.04)"
                                : "rgba(0,0,0,.04)",
                            }}
                            title={`${d.label}: ${fmt(d.val)}`}
                          >
                            <div
                              style={{
                                width: "100%",
                                background: d.highlight
                                  ? "#f97316"
                                  : D
                                  ? "#3b82f6"
                                  : "#60a5fa",
                                height: `${
                                  (d.val /
                                    Math.max(...monthly.map((x) => x.val), 1)) *
                                  100
                                }%`,
                                borderRadius: "4px 4px 0 0",
                                transition: "height .6s ease",
                                opacity: d.val === 0 ? 0.2 : 1,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 8,
                              color: muted,
                              fontWeight: 700,
                            }}
                          >
                            {d.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Donut */}
                  <div
                    className="card"
                    style={{
                      padding: isMobile ? 16 : 22,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: txt,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 16,
                      }}
                    >
                      <PieChart size={14} color="#f97316" /> Projects
                    </p>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <DonutChart
                        size={84}
                        segments={projects.map((p) => ({
                          pct: grandTotal
                            ? Math.round(
                                ((projTotals[p.id] || 0) / grandTotal) * 100
                              )
                            : 0,
                          color: p.color,
                        }))}
                      />
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 2,
                                  background: p.color,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 11,
                                  color: txt,
                                  fontWeight: 600,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 80,
                                }}
                              >
                                {p.name}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                color: muted,
                                fontWeight: 700,
                              }}
                            >
                              {fmt(Math.round(projTotals[p.id] || 0))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── PROJECT CARDS ── */}
            {projects.length > 0 && (
              <div
                className="fade-up-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isTablet
                    ? "repeat(2,1fr)"
                    : "repeat(auto-fit,minmax(210px,1fr))",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {projects.map((p, idx) => {
                  const spent = projTotals[p.id] || 0;
                  const pct = p.budget
                    ? Math.min(100, Math.round((spent / p.budget) * 100))
                    : null;
                  return (
                    <div
                      key={p.id}
                      style={{
                        background: card,
                        borderRadius: 18,
                        padding: 18,
                        border: `1px solid ${brd}`,
                        position: "relative",
                        overflow: "hidden",
                        transition: "all .2s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = D
                          ? "0 10px 36px rgba(0,0,0,.35)"
                          : "0 8px 28px rgba(0,0,0,.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Color accent bar */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: `linear-gradient(90deg,${p.color},${p.color}88)`,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                          paddingTop: 4,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontWeight: 800,
                              fontSize: 13,
                              color: txt,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.name}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: muted,
                              marginTop: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.client || "No client"}
                          </p>
                        </div>
                        <span
                          style={{
                            background: `${p.color}18`,
                            color: p.color,
                            border: `1px solid ${p.color}30`,
                            borderRadius: 8,
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {grandTotal
                            ? Math.round((spent / grandTotal) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: 22,
                          color: txt,
                          marginBottom: 8,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {fmt(Math.round(spent))}
                      </p>
                      {p.budget > 0 && (
                        <>
                          <div
                            style={{
                              height: 4,
                              background: D ? "#1f1f1f" : "#f3f4f6",
                              borderRadius: 2,
                              overflow: "hidden",
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: pct > 80 ? "#ef4444" : p.color,
                                borderRadius: 2,
                                transition: "width .8s ease",
                              }}
                            />
                          </div>
                          <p
                            style={{
                              fontSize: 10,
                              color: pct > 80 ? "#ef4444" : muted,
                            }}
                          >
                            {pct > 80 ? "⚠ " : ""}
                            {fmt(Math.round(p.budget - spent))} remaining
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* PLG upgrade nudge */}
            {!isPro && expenses.length >= 5 && (
              <div style={{ marginBottom: 14 }}>
                <UpgradeNudge
                  feature="4-way splitting + AI suggestions + PDF reports"
                  onUpgrade={() => setShowPlan(true)}
                  D={D}
                  brd={brd}
                />
              </div>
            )}

            {/* ── RECENT ACTIVITY ── */}
            {expenses.length > 0 && (
              <div
                className="card fade-up-3"
                style={{ padding: isMobile ? 14 : 22 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: txt,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Clock size={15} color="#f97316" /> Recent Activity
                    </p>
                    <p style={{ fontSize: 11, color: muted, marginTop: 2 }}>
                      Last {Math.min(5, expenses.length)} transactions
                    </p>
                  </div>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12, padding: "6px 12px" }}
                    onClick={() => setTab("expenses")}
                  >
                    View all <ArrowRight size={12} />
                  </button>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {expenses.slice(0, 5).map((e, idx) => {
                    const { Icon: CIc, color: cClr } =
                      CAT_META[e.category] || CAT_META.Other;
                    return (
                      <div
                        key={e.id}
                        className="row"
                        onClick={() => openEdit(e)}
                        style={{
                          marginBottom:
                            idx < Math.min(4, expenses.length - 1) ? 2 : 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                background: `${cClr}15`,
                                borderRadius: 11,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                color: cClr,
                                border: `1px solid ${cClr}20`,
                              }}
                            >
                              <CIc size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: txt,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {e.description}
                              </p>
                              <p
                                style={{
                                  fontSize: 10,
                                  color: muted,
                                  marginTop: 1,
                                }}
                              >
                                {e.date} · {e.category}
                              </p>
                            </div>
                          </div>
                          <p
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: txt,
                              flexShrink: 0,
                              marginLeft: 8,
                            }}
                          >
                            {fmt(e.amount)}
                          </p>
                        </div>
                        <SplitBar splits={e.splits} projects={projects} />
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                            marginTop: 7,
                          }}
                        >
                          {e.splits.map((s, i) => (
                            <span
                              key={i}
                              style={{
                                background: `${pClr(projects, s.pid)}12`,
                                color: pClr(projects, s.pid),
                                border: `1px solid ${pClr(projects, s.pid)}25`,
                                borderRadius: 20,
                                padding: "2px 9px",
                                fontSize: 10,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {pNm(projects, s.pid)} {s.pct}%
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {/* ── EXPENSES ── */}
        {tab === "expenses" && (
          <div className="fade-up">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "flex-end",
                flexDirection: isMobile ? "column" : "row",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: isMobile ? 26 : 32,
                    letterSpacing: "-0.03em",
                    color: txt,
                  }}
                >
                  Expenses
                </h1>
                <p style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                  {sorted.length} of {expenses.length} ·{" "}
                  {fmt(sorted.reduce((s, e) => s + e.amount, 0))}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!isMobile && (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={exportCSV}
                  >
                    <Download size={13} /> CSV
                  </button>
                )}
                <button className="btn btn-primary" onClick={openAdd}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
            <div
              style={{
                marginBottom: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <div style={{ position: "relative", flex: 1 }}>
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: muted,
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    className="input"
                    placeholder="Search expenses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 34 }}
                  />
                </div>
                <div
                  style={{
                    position: "relative",
                    width: isMobile ? "100%" : 165,
                  }}
                >
                  <ArrowUpDown
                    size={12}
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: muted,
                      pointerEvents: "none",
                    }}
                  />
                  <select
                    className="input"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ paddingLeft: 30 }}
                  >
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="amount-desc">Highest amount</option>
                    <option value="amount-asc">Lowest amount</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "all", label: "All Projects", color: null },
                  ...projects.map((p) => ({
                    id: p.id,
                    label: p.name,
                    color: p.color,
                  })),
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setFPid(p.id)}
                    style={{
                      background:
                        fPid === p.id
                          ? p.color || txt
                          : D
                          ? "#1a1a1a"
                          : "#f3f4f6",
                      color: fPid === p.id ? "#fff" : muted,
                      border: `1.5px solid ${
                        fPid === p.id ? p.color || txt : brd
                      }`,
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.color && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: fPid === p.id ? "#fff" : p.color,
                          display: "inline-block",
                        }}
                      />
                    )}
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => setFCat("all")}
                  style={{
                    background:
                      fCat === "all" ? txt : D ? "#1a1a1a" : "#f3f4f6",
                    color: fCat === "all" ? (D ? "#000" : "#fff") : muted,
                    border: `1.5px solid ${fCat === "all" ? txt : brd}`,
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <ListFilter size={11} /> All
                </button>
                {CATEGORIES.filter((c) => catTotals[c] > 0).map((c) => {
                  const { Icon: CIc, color: cClr } = CAT_META[c];
                  return (
                    <button
                      key={c}
                      onClick={() => setFCat(c)}
                      style={{
                        background:
                          fCat === c ? cClr : D ? "#1a1a1a" : "#f3f4f6",
                        color: fCat === c ? "#fff" : muted,
                        border: `1.5px solid ${fCat === c ? cClr : brd}`,
                        borderRadius: 20,
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <CIc size={11} /> {c}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sorted.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "52px 20px",
                    color: muted,
                  }}
                >
                  <Receipt
                    size={38}
                    style={{ marginBottom: 10, opacity: 0.3 }}
                  />
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: txt,
                      marginBottom: 8,
                    }}
                  >
                    {expenses.length === 0
                      ? "No expenses yet"
                      : "No results found"}
                  </p>
                  {expenses.length === 0 && (
                    <button
                      className="btn btn-primary"
                      style={{ margin: "0 auto" }}
                      onClick={openAdd}
                    >
                      <Plus size={14} /> Add First Expense
                    </button>
                  )}
                </div>
              )}
              {sorted.map((e) => {
                const { Icon: CIc, color: cClr } =
                  CAT_META[e.category] || CAT_META.Other;
                return (
                  <div key={e.id} className="row" onClick={() => openEdit(e)}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 9,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            background: `${cClr}18`,
                            borderRadius: 9,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: cClr,
                          }}
                        >
                          <CIc size={17} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              flexWrap: "wrap",
                              marginBottom: 2,
                            }}
                          >
                            <p
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                color: txt,
                              }}
                            >
                              {e.description}
                            </p>
                            <span
                              style={{
                                background: `${cClr}15`,
                                color: cClr,
                                border: `1px solid ${cClr}30`,
                                borderRadius: 6,
                                padding: "1px 7px",
                                fontSize: 10,
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <CIc size={9} /> {e.category}
                            </span>
                          </div>
                          <p style={{ fontSize: 10, color: muted }}>
                            {e.date}
                            {e.notes && (
                              <span
                                style={{ marginLeft: 8, fontStyle: "italic" }}
                              >
                                {" "}
                                · {e.notes.slice(0, 44)}
                                {e.notes.length > 44 ? "..." : ""}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        <p
                          style={{ fontWeight: 900, fontSize: 14, color: txt }}
                        >
                          {fmt(e.amount)}
                        </p>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "4px 8px" }}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setDelId(e.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <SplitBar splits={e.splits} projects={projects} />
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginTop: 6,
                      }}
                    >
                      {e.splits.map((s, i) => (
                        <span
                          key={i}
                          style={{
                            background: `${pClr(projects, s.pid)}18`,
                            color: pClr(projects, s.pid),
                            border: `1px solid ${pClr(projects, s.pid)}33`,
                            borderRadius: 20,
                            padding: "1px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {pNm(projects, s.pid)} {s.pct}%
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === "projects" && (
          <div className="fade-up">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "flex-end",
                flexDirection: isMobile ? "column" : "row",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: isMobile ? 26 : 32,
                    letterSpacing: "-0.03em",
                    color: txt,
                  }}
                >
                  Projects
                </h1>
                <p style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                  {projects.length}/{isPro ? "∞" : 3} used
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModal("project");
                  setPForm({
                    name: "",
                    client: "",
                    color: "#f97316",
                    budget: "",
                  });
                }}
              >
                <Plus size={14} /> New Project
              </button>
            </div>
            {!isPro && projects.length >= FREE_PROJ && (
              <div style={{ marginBottom: 16 }}>
                <UpgradeNudge
                  feature="unlimited projects"
                  onUpgrade={() => setShowPlan(true)}
                  D={D}
                  brd={brd}
                />
              </div>
            )}
            {projects.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: muted,
                }}
              >
                <FolderOpen
                  size={44}
                  style={{ marginBottom: 14, opacity: 0.3 }}
                />
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: txt,
                    marginBottom: 8,
                  }}
                >
                  No projects yet
                </p>
                <p style={{ fontSize: 13, marginBottom: 20 }}>
                  Create one project per client to get started
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setModal("project");
                    setPForm({
                      name: "",
                      client: "",
                      color: "#f97316",
                      budget: "",
                    });
                  }}
                >
                  <Plus size={14} /> Create First Project
                </button>
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : isTablet
                  ? "repeat(2,1fr)"
                  : "repeat(auto-fit,minmax(280px,1fr))",
                gap: 14,
              }}
            >
              {projects.map((p) => {
                const spent = Math.round(projTotals[p.id] || 0);
                const pExp = expenses.filter((e) =>
                  e.splits.some((s) => s.pid === p.id)
                );
                const pct = p.budget
                  ? Math.min(100, Math.round((spent / p.budget) * 100))
                  : null;
                return (
                  <div key={p.id} className="card" style={{ padding: 18 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 11,
                          background: `${p.color}18`,
                          border: `2px solid ${p.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 17,
                          fontWeight: 900,
                          color: p.color,
                          flexShrink: 0,
                        }}
                      >
                        {p.name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: txt,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.name}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: muted,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.client}
                        </p>
                      </div>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "5px 8px", flexShrink: 0 }}
                        onClick={() => handleRemoveProject(p.id)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 7,
                        marginBottom: 12,
                      }}
                    >
                      {[
                        ["Spent", fmt(spent)],
                        ["Expenses", pExp.length],
                        ["Savings", fmt(Math.round(spent * 0.2))],
                      ].map(([l, v]) => (
                        <div
                          key={l}
                          style={{
                            background: D ? "#1a1a1a" : "#f9fafb",
                            borderRadius: 9,
                            padding: "9px 8px",
                          }}
                        >
                          <p
                            className="lbl"
                            style={{ marginBottom: 3, fontSize: 9 }}
                          >
                            {l}
                          </p>
                          <p
                            style={{
                              fontFamily: "'Playfair Display',serif",
                              fontSize: 13,
                              color: l === "Savings" ? "#16a34a" : txt,
                            }}
                          >
                            {v}
                          </p>
                        </div>
                      ))}
                    </div>
                    {p.budget > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: 11, color: muted }}>
                            Budget usage
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: pct > 80 ? "#ef4444" : p.color,
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="prog">
                          <div
                            className="prog-bar"
                            style={{
                              width: `${pct}%`,
                              background: pct > 80 ? "#ef4444" : p.color,
                            }}
                          />
                        </div>
                        <p style={{ fontSize: 10, color: muted, marginTop: 3 }}>
                          {fmt(p.budget - spent)} remaining of {fmt(p.budget)}
                        </p>
                      </div>
                    )}
                    <div
                      style={{ height: 1, background: brd, margin: "12px 0" }}
                    />
                    <p className="lbl" style={{ marginBottom: 7 }}>
                      Top Categories
                    </p>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {[...new Set(pExp.map((e) => e.category))].slice(0, 3)
                        .length > 0 ? (
                        [...new Set(pExp.map((e) => e.category))]
                          .slice(0, 3)
                          .map((c) => {
                            const { Icon: CIc } = CAT_META[c] || CAT_META.Other;
                            return (
                              <span
                                key={c}
                                style={{
                                  background: D ? "#1f1f1f" : "#f3f4f6",
                                  borderRadius: 6,
                                  padding: "3px 9px",
                                  fontSize: 11,
                                  color: muted,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <CIc size={11} /> {c}
                              </span>
                            );
                          })
                      ) : (
                        <span style={{ fontSize: 12, color: muted }}>
                          No expenses yet
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab === "reports" && (
          <div className="fade-up">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "flex-end",
                flexDirection: isMobile ? "column" : "row",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: isMobile ? 26 : 32,
                    letterSpacing: "-0.03em",
                    color: txt,
                  }}
                >
                  Tax Report
                </h1>
                <p
                  style={{
                    color: muted,
                    fontSize: 12,
                    marginTop: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Database size={11} /> BIR-ready · private to your account
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 12 }}
                  onClick={exportCSV}
                >
                  <Download size={13} /> CSV
                </button>
                {!isPro ? (
                  <button
                    className="btn btn-pro"
                    style={{ fontSize: 12 }}
                    onClick={() => setShowPlan(true)}
                  >
                    <Lock size={12} /> PDF · Pro
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 12 }}
                    onClick={() => showToast("Generating PDF...", "warning")}
                  >
                    <Download size={13} /> PDF
                  </button>
                )}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                gap: 12,
                marginBottom: 14,
              }}
            >
              {[
                {
                  label: "Total Deductible",
                  val: fmt(grandTotal),
                  sub: "all time",
                  Icon: TrendingUp,
                },
                {
                  label: "Est. Tax Savings",
                  val: fmt(estSavings),
                  sub: "at 20% rate",
                  Icon: Shield,
                  accent: "#16a34a",
                },
                {
                  label: "Expenses Filed",
                  val: expenses.length,
                  sub: `${Object.keys(catTotals).length} categories`,
                  Icon: FileText,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: 18,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      opacity: 0.05,
                    }}
                  >
                    <s.Icon size={34} />
                  </div>
                  <p className="lbl" style={{ marginBottom: 6 }}>
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: isMobile ? 22 : 28,
                      color: s.accent || txt,
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.val}
                  </p>
                  <p style={{ fontSize: 11, color: muted, marginTop: 5 }}>
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>
            {!isPro && expenses.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <UpgradeNudge
                  feature="PDF export (BIR-ready, accountant-ready)"
                  onUpgrade={() => setShowPlan(true)}
                  D={D}
                  brd={brd}
                />
              </div>
            )}
            {expenses.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "48px 0", color: muted }}
              >
                <FileBarChart2
                  size={38}
                  style={{ marginBottom: 10, opacity: 0.3 }}
                />
                <p style={{ fontSize: 14, color: txt, fontWeight: 700 }}>
                  No data to report yet
                </p>
              </div>
            ) : (
              <>
                <div
                  className="card"
                  style={{ padding: isMobile ? 14 : 20, marginBottom: 12 }}
                >
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      marginBottom: 14,
                      color: txt,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FolderOpen size={14} color="#f97316" /> By Project
                  </p>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 12,
                        minWidth: 400,
                      }}
                    >
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${brd}` }}>
                          {[
                            "Project",
                            "Client",
                            "Exp.",
                            "Total",
                            "Share",
                            "Savings",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: "left",
                                padding: "7px 8px",
                                fontSize: 10,
                                fontWeight: 800,
                                color: muted,
                                textTransform: "uppercase",
                                letterSpacing: ".06em",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((p) => {
                          const spent = Math.round(projTotals[p.id] || 0);
                          const cnt = expenses.filter((e) =>
                            e.splits.some((s) => s.pid === p.id)
                          ).length;
                          return (
                            <tr
                              key={p.id}
                              style={{
                                borderBottom: `1px solid ${
                                  D ? "#1a1a1a" : "#f5f5f5"
                                }`,
                              }}
                            >
                              <td style={{ padding: "9px 8px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: p.color,
                                    }}
                                  />
                                  <strong style={{ color: txt }}>
                                    {p.name}
                                  </strong>
                                </div>
                              </td>
                              <td style={{ padding: "9px 8px", color: muted }}>
                                {p.client}
                              </td>
                              <td style={{ padding: "9px 8px", color: muted }}>
                                {cnt}
                              </td>
                              <td
                                style={{
                                  padding: "9px 8px",
                                  fontWeight: 800,
                                  color: txt,
                                }}
                              >
                                {fmt(spent)}
                              </td>
                              <td style={{ padding: "9px 8px" }}>
                                <span
                                  style={{
                                    background: `${p.color}18`,
                                    color: p.color,
                                    border: `1px solid ${p.color}33`,
                                    borderRadius: 20,
                                    padding: "2px 8px",
                                    fontSize: 11,
                                    fontWeight: 700,
                                  }}
                                >
                                  {grandTotal
                                    ? Math.round((spent / grandTotal) * 100)
                                    : 0}
                                  %
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "9px 8px",
                                  fontWeight: 800,
                                  color: "#16a34a",
                                }}
                              >
                                {fmt(Math.round(spent * 0.2))}
                              </td>
                            </tr>
                          );
                        })}
                        <tr style={{ borderTop: `2px solid ${txt}` }}>
                          <td
                            colSpan={3}
                            style={{
                              padding: "9px 8px",
                              fontWeight: 900,
                              color: txt,
                            }}
                          >
                            TOTAL
                          </td>
                          <td
                            style={{
                              padding: "9px 8px",
                              fontWeight: 900,
                              color: txt,
                            }}
                          >
                            {fmt(grandTotal)}
                          </td>
                          <td
                            style={{
                              padding: "9px 8px",
                              fontWeight: 900,
                              color: txt,
                            }}
                          >
                            100%
                          </td>
                          <td
                            style={{
                              padding: "9px 8px",
                              fontWeight: 900,
                              color: "#16a34a",
                            }}
                          >
                            {fmt(estSavings)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      marginBottom: 14,
                      color: txt,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Tag size={14} color="#f97316" /> By Category
                  </p>
                  {Object.entries(catTotals)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, total]) => {
                      const { Icon: CIc, color: cClr } =
                        CAT_META[cat] || CAT_META.Other;
                      return (
                        <div key={cat} style={{ marginBottom: 12 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <CIc size={13} color={cClr} />
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: txt,
                                }}
                              >
                                {cat}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              <span style={{ fontSize: 11, color: muted }}>
                                {Math.round((total / grandTotal) * 100)}%
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: txt,
                                }}
                              >
                                {fmt(total)}
                              </span>
                            </div>
                          </div>
                          <div className="prog">
                            <div
                              className="prog-bar"
                              style={{
                                width: `${(total / grandTotal) * 100}%`,
                                background: cClr,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {isMobile && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: D ? "rgba(14,14,14,.95)" : card,
            borderTop: `1px solid ${brd}`,
            display: "flex",
            zIndex: 100,
            backdropFilter: "blur(16px)",
            paddingBottom: "env(safe-area-inset-bottom,0px)",
          }}
        >
          {navItems.map(({ id, Icon, label }) => (
            <button
              key={id}
              className={`mob-tab ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              <div className="mob-tab-icon">
                <Icon size={tab === id ? 20 : 18} />
              </div>
              <span>{label}</span>
            </button>
          ))}
          <button
            className="mob-tab"
            onClick={openAdd}
            style={{ color: "#f97316" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#f97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(249,115,22,.45)",
              }}
            >
              <Plus size={20} color="#fff" />
            </div>
            <span>Add</span>
          </button>
        </nav>
      )}

      {/* EXPENSE MODAL */}
      {modal === "expense" && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal scale-in">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: isMobile ? 21 : 25,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {editId ? (
                  <>
                    <Pencil size={17} color="#f97316" /> Edit Expense
                  </>
                ) : (
                  <>
                    <Plus size={17} color="#f97316" /> New Expense
                  </>
                )}
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => setModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="lbl">Description *</label>
                <input
                  className="input"
                  placeholder="e.g. Adobe Creative Cloud"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label className="lbl">Amount (₱) *</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="lbl">Date *</label>
                  <input
                    className="input"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="lbl">Category</label>
                <div style={{ position: "relative" }}>
                  {(() => {
                    const { Icon: CIc, color: cClr } =
                      CAT_META[form.category] || CAT_META.Other;
                    return (
                      <CIc
                        size={13}
                        color={cClr}
                        style={{
                          position: "absolute",
                          left: 13,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    );
                  })()}
                  <select
                    className="input"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    style={{ paddingLeft: 33 }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  className="lbl"
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <StickyNote size={10} /> Notes{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (optional — explain your split)
                  </span>
                </label>
                <textarea
                  className="input"
                  placeholder="e.g. Split 60/40 — Alpha used Adobe CC more this month"
                  value={form.notes || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
              {AI_TIPS[form.category] && (
                <div
                  style={{
                    background: D ? "#1a1200" : "#fffbeb",
                    border: `1px solid ${D ? "#3a2800" : "#fed7aa"}`,
                    borderRadius: 10,
                    padding: "11px 13px",
                    display: "flex",
                    gap: 9,
                    alignItems: "flex-start",
                  }}
                >
                  <Sparkles
                    size={13}
                    color="#f97316"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: D ? "#fbbf24" : "#92400e",
                        marginBottom: 2,
                      }}
                    >
                      AI Split Suggestion
                      {!isPro && (
                        <span style={{ color: muted, fontWeight: 400 }}>
                          {" "}
                          · Pro only
                        </span>
                      )}
                    </p>
                    <p
                      style={{ fontSize: 12, color: D ? "#d97706" : "#78350f" }}
                    >
                      {isPro
                        ? AI_TIPS[form.category]
                        : "Upgrade to Pro to unlock AI split suggestions."}
                    </p>
                  </div>
                </div>
              )}
              {projects.length === 0 && (
                <div
                  style={{
                    background: D ? "#1a0e00" : "#fff7ed",
                    border: `1px solid ${D ? "#3a2000" : "#fed7aa"}`,
                    borderRadius: 10,
                    padding: "11px 13px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#d97706",
                    fontWeight: 600,
                  }}
                >
                  <AlertTriangle size={14} /> Create a project first before
                  adding expenses.
                </div>
              )}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <label
                    className="lbl"
                    style={{
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Zap size={10} color="#f97316" /> Smart Split *{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        textTransform: "none",
                        letterSpacing: 0,
                        fontSize: 10,
                      }}
                    >
                      — max {maxSpl}
                    </span>
                  </label>
                  <div
                    style={{ display: "flex", gap: 7, alignItems: "center" }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: totalPct === 100 ? "#16a34a" : "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {totalPct === 100 ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}{" "}
                      {totalPct}%
                    </span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "3px 9px", fontSize: 11 }}
                      onClick={autoSplit}
                    >
                      <Zap size={11} /> Auto
                    </button>
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {form.splits.map((s, i) => (
                    <div key={i} className="split-row">
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: pClr(projects, s.pid),
                          flexShrink: 0,
                        }}
                      />
                      <select
                        className="input"
                        style={{ flex: 2, minWidth: 0 }}
                        value={s.pid}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            splits: f.splits.map((x, j) =>
                              j === i ? { ...x, pid: e.target.value } : x
                            ),
                          }))
                        }
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <div
                        style={{
                          position: "relative",
                          width: 72,
                          flexShrink: 0,
                        }}
                      >
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="100"
                          value={s.pct}
                          style={{ paddingRight: 20 }}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              splits: f.splits.map((x, j) =>
                                j === i
                                  ? { ...x, pct: Number(e.target.value) }
                                  : x
                              ),
                            }))
                          }
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: 9,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: muted,
                            fontSize: 11,
                            pointerEvents: "none",
                          }}
                        >
                          %
                        </span>
                      </div>
                      {form.amount && (
                        <span
                          style={{
                            fontSize: 11,
                            color: muted,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmt(Math.round((Number(form.amount) * s.pct) / 100))}
                        </span>
                      )}
                      {form.splits.length > 1 && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 7px", flexShrink: 0 }}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              splits: f.splits.filter((_, j) => j !== i),
                            }))
                          }
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {splErr && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#ef4444",
                      marginTop: 5,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <AlertTriangle size={12} /> {splErr}
                  </p>
                )}
                {!splErr && totalPct === 100 && form.splits.length > 0 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#16a34a",
                      marginTop: 5,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <CheckCircle2 size={12} /> Splits look good!
                  </p>
                )}
                {form.splits.length < Math.min(maxSpl, projects.length) ? (
                  <button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        splits: [
                          ...f.splits,
                          { pid: projects[0]?.id || "", pct: 0 },
                        ],
                      }))
                    }
                    style={{
                      marginTop: 8,
                      background: D ? "#1a1a1a" : "#f9fafb",
                      border: `1.5px dashed ${brd}`,
                      borderRadius: 10,
                      padding: 9,
                      width: "100%",
                      cursor: "pointer",
                      fontSize: 13,
                      color: muted,
                      fontFamily: "inherit",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Plus size={13} /> Split to another project
                  </button>
                ) : (
                  !isPro &&
                  form.splits.length >= maxSpl && (
                    <button
                      onClick={() => setShowPlan(true)}
                      style={{
                        marginTop: 8,
                        background: D ? "#1a0e00" : "#fff7ed",
                        border: "1.5px dashed #f97316",
                        borderRadius: 10,
                        padding: 9,
                        width: "100%",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#f97316",
                        fontFamily: "inherit",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Lock size={13} /> Upgrade to Pro for 4-way splitting
                    </button>
                  )
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                className="btn btn-primary"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 12,
                  opacity: saving ? 0.7 : 1,
                }}
                onClick={saveExpense}
                disabled={saving || projects.length === 0}
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={14}
                      style={{ animation: "spin .8s linear infinite" }}
                    />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} />{" "}
                    {editId ? "Save Changes" : "Add Expense"}
                  </>
                )}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {modal === "project" && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal scale-in" style={{ maxWidth: 400 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 23,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <FolderOpen size={18} color="#f97316" /> New Project
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => setModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="lbl">Project Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Website Redesign"
                  value={pForm.name}
                  onChange={(e) =>
                    setPForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Client Name</label>
                <input
                  className="input"
                  placeholder="e.g. Acme Corp"
                  value={pForm.client}
                  onChange={(e) =>
                    setPForm((f) => ({ ...f, client: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Budget (₱) — optional</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={pForm.budget}
                  onChange={(e) =>
                    setPForm((f) => ({ ...f, budget: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Color</label>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  {PALETTE.map((c) => (
                    <div
                      key={c}
                      className={`color-swatch ${
                        pForm.color === c ? "sel" : ""
                      }`}
                      style={{ background: c }}
                      onClick={() => setPForm((f) => ({ ...f, color: c }))}
                    />
                  ))}
                </div>
                <div
                  style={{
                    padding: "9px 12px",
                    background: `${pForm.color}12`,
                    border: `1px solid ${pForm.color}30`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: pForm.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: pForm.color,
                      fontWeight: 700,
                    }}
                  >
                    {pForm.name || "Preview"}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                className="btn btn-primary"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 12,
                  opacity: saving ? 0.7 : 1,
                }}
                onClick={saveProject}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={14}
                      style={{ animation: "spin .8s linear infinite" }}
                    />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Create Project
                  </>
                )}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function Root() {
  const { user, authLoading, signUp, signIn, signOut } = useAuth();
  const [page, setPage] = useState("landing"); // "landing" | "login" | "register"

  // Auto-go to app if already logged in
  useEffect(() => {
    if (!authLoading && user) setPage("app");
  }, [user, authLoading]);

  if (authLoading)
    return (
      <div
        style={{
          background: "#0a0a0a",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #222",
            borderTopColor: "#f97316",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
      </div>
    );

  if (user) return <FreelanceFundsApp user={user} signOut={signOut} />;

  if (page === "landing")
    return (
      <LandingPage
        onLogin={() => setPage("login")}
        onRegister={() => setPage("register")}
      />
    );
  if (page === "login")
    return (
      <AuthPage
        mode="login"
        onSuccess={() => setPage("app")}
        onSwitch={() => setPage("register")}
        onBack={() => setPage("landing")}
      />
    );
  if (page === "register")
    return (
      <AuthPage
        mode="register"
        onSuccess={() => setPage("app")}
        onSwitch={() => setPage("login")}
        onBack={() => setPage("landing")}
      />
    );

  return null;
}
