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
  Menu,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Play,
  CheckCircle,
  ArrowRightCircle,
  Gift,
} from "lucide-react";

const SUPABASE_URL = "https://kftkfpzwxsxqotadaxru.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGtmcHp3eHN4cW90YWRheHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTYxNDcsImV4cCI6MjA4OTEzMjE0N30.LF_51Ic1IkazL4dL5HRKKak1WPyfg4EG1VvzYa9V-Jw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

const fmt = (n) =>
  "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 });
const pClr = (projects, pid) =>
  projects.find((p) => p.id === pid)?.color || "#888";
const pNm = (projects, pid) =>
  projects.find((p) => p.id === pid)?.name || "Unknown";

// ── BREAKPOINT ──
function useBreakpoint() {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return {
    isMobile: w < 768,
    isTablet: w >= 768 && w < 1024,
    isDesktop: w >= 1024,
    isXSmall: w < 480,
  };
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

// ── AUTH ──
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

// ── DATA ──
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
    await supabase.from("expense_splits").insert(
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

// ── CHARTS ──
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
        bottom: 96,
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

// ── USER MANUAL ──
function UserManual({ onClose, tk }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 800,
        padding: 16,
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: tk.card,
          border: `1px solid ${tk.brd}`,
          borderRadius: 24,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
          padding: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, color: tk.txt }}>
            <BookOpen
              size={24}
              style={{ display: "inline", marginRight: 8, color: "#f97316" }}
            />
            User Manual
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={20} color={tk.muted} />
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 12,
              color: "#f97316",
            }}
          >
            Getting Started
          </h3>
          <ol style={{ paddingLeft: 20, color: tk.muted, lineHeight: 1.8 }}>
            <li>Create your first project in the Projects tab</li>
            <li>Add expenses and assign them to projects</li>
            <li>Use Smart Split to divide costs across multiple projects</li>
            <li>Check your Dashboard for insights and tax savings estimates</li>
            <li>Export CSV reports for your accountant or BIR filing</li>
          </ol>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 12,
              color: "#f97316",
            }}
          >
            Smart Split Feature
          </h3>
          <p style={{ color: tk.muted, lineHeight: 1.6 }}>
            When you have an expense that benefits multiple projects (like
            software subscriptions or phone bills), use Smart Split to divide
            the cost by percentage. The total must equal 100%. Pro users can
            split across up to 4 projects at once.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 12,
              color: "#f97316",
            }}
          >
            Tax Reports
          </h3>
          <p style={{ color: tk.muted, lineHeight: 1.6 }}>
            The Reports tab shows a complete breakdown of your expenses by
            project and category. Export CSV files for your accountant. Pro
            users get formatted PDF reports ready for BIR filing. Estimated tax
            savings are calculated at 20% - confirm with a licensed CPA for your
            actual rate.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 12,
            background: "#f97316",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ── ONBOARDING GUIDE ──
const ONBOARDING_STEPS = [
  {
    title: "Welcome to FreelanceFunds! 🎉",
    description:
      "Your all-in-one expense tracker built specifically for Filipino freelancers. Let's get you set up in just a few minutes.",
    tip: "You can replay this guide anytime from the Help button in the sidebar.",
    icon: <Gift size={32} color="#f97316" />,
    iconBg: "rgba(249,115,22,0.15)",
    accent: "#f97316",
  },
  {
    title: "Create Your First Project",
    description:
      "Projects represent your clients or ongoing work. Each project helps you track expenses separately and see which clients are most profitable.",
    tip: "Name your projects clearly, like 'Website Redesign - Acme Corp' or 'Social Media - Client ABC'.",
    icon: <FolderOpen size={32} color="#3b82f6" />,
    iconBg: "rgba(59,130,246,0.15)",
    accent: "#3b82f6",
  },
  {
    title: "Log Your First Expense",
    description:
      "Record every business expense you make. Add a description, amount, category, and date. You can also add notes for important details.",
    tip: "Log expenses right after spending to avoid forgetting. Keep receipts for BIR filing!",
    icon: <Receipt size={32} color="#10b981" />,
    iconBg: "rgba(16,185,129,0.15)",
    accent: "#10b981",
  },
  {
    title: "Smart Split Feature ✨",
    description:
      "Share expenses across multiple projects! Perfect for software subscriptions, phone bills, or any cost that benefits multiple clients.",
    tip: "Pro users can split across 4 projects. Use the Auto button to split equally, or set custom percentages.",
    icon: <Zap size={32} color="#8b5cf6" />,
    iconBg: "rgba(139,92,246,0.15)",
    accent: "#8b5cf6",
  },
  {
    title: "Track Your Tax Savings",
    description:
      "Watch your estimated tax savings grow automatically. The Dashboard shows your total tracked expenses and potential deductions at 20%.",
    tip: "Confirm your actual tax rate with a licensed CPA. This is an estimate based on standard Philippine rates.",
    icon: <Shield size={32} color="#10b981" />,
    iconBg: "rgba(16,185,129,0.15)",
    accent: "#10b981",
  },
  {
    title: "Generate Reports for BIR",
    description:
      "Export CSV reports for your accountant or get formatted PDF reports with Pro. Everything is organized by project and category.",
    tip: "Save your reports alongside physical receipts. This is exactly what BIR needs for filing.",
    icon: <FileBarChart2 size={32} color="#ec4899" />,
    iconBg: "rgba(236,72,153,0.15)",
    accent: "#ec4899",
  },
  {
    title: "You're All Set! 🚀",
    description:
      "Start tracking your expenses, save money on taxes, and grow your freelance business. Upgrade to Pro for unlimited expenses and premium features.",
    tip: "The first 50 Pro subscribers get lifetime ₱500/month pricing. Don't miss out!",
    icon: <Trophy size={32} color="#f97316" />,
    iconBg: "rgba(249,115,22,0.15)",
    accent: "#f97316",
  },
];

function OnboardingGuide({
  onClose,
  steps,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  tk,
}) {
  const step = steps[currentStep];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 1000,
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: tk.card,
          borderRadius: 28,
          maxWidth: 480,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
          animation: "slideUp 0.3s ease",
        }}
      >
        <div style={{ padding: "32px 28px", textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: step.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            {step.icon}
          </div>

          <h3
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
              color: step.accent,
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              fontSize: 14,
              color: tk.muted,
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            {step.description}
          </p>

          <div
            style={{
              background: tk.D ? "#1a1200" : "#fff7ed",
              borderLeft: `3px solid #f97316`,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Sparkles size={14} color="#f97316" style={{ marginTop: 2 }} />
              <p
                style={{
                  fontSize: 12,
                  color: tk.D ? "#d97706" : "#78350f",
                  lineHeight: 1.5,
                }}
              >
                <strong>Pro Tip:</strong> {step.tip}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    i === currentStep
                      ? "#f97316"
                      : i < currentStep
                      ? "#10b981"
                      : tk.brd,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {currentStep > 0 && (
              <button
                onClick={onPrev}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "transparent",
                  border: `1.5px solid ${tk.brd}`,
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: tk.muted,
                  cursor: "pointer",
                }}
              >
                ← Previous
              </button>
            )}
            <button
              onClick={onNext}
              style={{
                flex: currentStep > 0 ? 1 : 2,
                padding: "12px 20px",
                background: "#f97316",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle size={16} /> Get Started
                </>
              ) : (
                <>
                  Next <ArrowRightCircle size={16} />
                </>
              )}
            </button>
          </div>

          <button
            onClick={onSkip}
            style={{
              marginTop: 16,
              background: "none",
              border: "none",
              fontSize: 12,
              color: tk.muted,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Skip guide
          </button>
        </div>
      </div>
    </div>
  );
}

// ── UPGRADE NUDGE ──
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

// ── MAIN APP (Desktop with Left Sidebar) ──
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useLS(
    "ff_sidebar_collapsed",
    false
  );

  const { isMobile, isTablet, isDesktop, isXSmall } = useBreakpoint();
  const isPro = plan === "pro";
  const maxExp = isPro ? Infinity : FREE_EXP;
  const maxProj = isPro ? Infinity : FREE_PROJ;
  const maxSpl = isPro ? 4 : 2;

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`ff_onboarded_${user.id}`);
    if (!loading && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [loading, user.id]);

  const D = dark;
  const bg = D ? "#0a0a0a" : "#f8f7f4";
  const card = D ? "#141414" : "#ffffff";
  const brd = D ? "#2a2a2a" : "#e8e4de";
  const txt = D ? "#e8e8e8" : "#1a1a1a";
  const muted = D ? "#6b6b6b" : "#9ca3af";
  const inp = D ? "#1f1f1f" : "#ffffff";
  const sidebarBg = D ? "#0f0f0f" : "#ffffff";
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
    const labs = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      vals = Array(12).fill(0);
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

  const completeOnboarding = () => {
    localStorage.setItem(`ff_onboarded_${user.id}`, "1");
    setShowOnboarding(false);
    showToast(
      "Welcome to FreelanceFunds! Start by creating your first project.",
      "success"
    );
  };

  const handleOnboardingNext = () => {
    if (onboardingStep === ONBOARDING_STEPS.length - 1) {
      completeOnboarding();
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const handleOnboardingPrev = () => {
    setOnboardingStep(onboardingStep - 1);
  };

  const handleOnboardingSkip = () => {
    completeOnboarding();
  };

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

  const navItems = [
    {
      id: "dashboard",
      Icon: LayoutDashboard,
      label: "Dashboard",
      description: "Overview & insights",
    },
    {
      id: "expenses",
      Icon: Receipt,
      label: "Expenses",
      description: "Track your spending",
    },
    {
      id: "projects",
      Icon: FolderOpen,
      label: "Projects",
      description: "Manage clients",
    },
    {
      id: "reports",
      Icon: FileBarChart2,
      label: "Reports",
      description: "BIR-ready exports",
    },
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{overflow-x:hidden;max-width:100vw;-webkit-font-smoothing:antialiased}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
    .fade-up{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
    .fade-up-1{animation:fadeUp .4s .05s cubic-bezier(.16,1,.3,1) both}
    .fade-up-2{animation:fadeUp .4s .1s cubic-bezier(.16,1,.3,1) both}
    .fade-up-3{animation:fadeUp .4s .15s cubic-bezier(.16,1,.3,1) both}
    .scale-in{animation:scaleIn .25s ease both}
    .slide-in{animation:slideIn .3s ease both}
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
    isMobile ? "12px" : "20px"
  };position:relative;overflow:hidden;transition:all .2s}
    .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,${
      D ? 0.25 : 0.08
    })}
    .row{border-radius:14px;padding:14px 16px;border:1px solid ${
      D ? "#1e1e1e" : "#f0f0f0"
    };background:${card};transition:all .18s;cursor:pointer}
    .row:hover{border-color:${
      D ? "rgba(249,115,22,.25)" : "rgba(249,115,22,.2)"
    };box-shadow:0 6px 20px rgba(0,0,0,${
    D ? 0.2 : 0.06
  });transform:translateY(-1px)}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:${
      isMobile ? "flex-end" : "center"
    };justify-content:center;z-index:600;padding:${
    isMobile ? "0" : "16px"
  };backdrop-filter:blur(12px)}
    .modal{background:${card};border-radius:${
    isMobile ? "22px 22px 0 0" : "24px"
  };padding:${isMobile ? "20px 16px 32px" : "24px"};width:100%;max-width:${
    isMobile ? "100%" : "520px"
  };max-height:${
    isMobile ? "92vh" : "92vh"
  };overflow-y:auto;border:1px solid ${brd};box-shadow:0 24px 60px rgba(0,0,0,.4)}
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
    @media(max-width:768px){
      .modal{max-width:100%;border-radius:22px 22px 0 0}
      input,select,textarea{font-size:16px!important}
    }
  `;

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

  // Mobile view with bottom navigation
  if (isMobile) {
    return (
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          background: bg,
          minHeight: "100vh",
          color: txt,
          paddingBottom: 88,
          overflowX: "hidden",
          width: "100%",
          maxWidth: "100vw",
          position: "relative",
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
        {showOnboarding && (
          <OnboardingGuide
            steps={ONBOARDING_STEPS}
            currentStep={onboardingStep}
            onNext={handleOnboardingNext}
            onPrev={handleOnboardingPrev}
            onSkip={handleOnboardingSkip}
            tk={tk}
          />
        )}

        {/* Mobile Header */}
        <header
          style={{
            background: D ? "rgba(14,14,14,.95)" : card,
            borderBottom: `1px solid ${brd}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 200,
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            <span style={{ fontWeight: 700, fontSize: 16, color: txt }}>
              FreelanceFunds
            </span>
            {isPro ? (
              <span className="badge-pro">PRO</span>
            ) : (
              <span className="badge-free">FREE</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
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
            <button
              className="btn btn-primary"
              onClick={openAdd}
              style={{ padding: "7px 13px" }}
            >
              <Plus size={16} />
            </button>
          </div>
        </header>

        {/* Mobile Content */}
        <main
          style={{
            padding: "16px 12px",
            width: "100%",
          }}
        >
          {tab === "dashboard" && (
            <DashboardContent
              {...{
                expenses,
                projects,
                grandTotal,
                estSavings,
                projTotals,
                catTotals,
                monthly,
                isPro,
                D,
                txt,
                muted,
                card,
                brd,
                exportCSV,
                openAdd,
                setShowManual,
                setTab,
                openEdit,
                pClr,
                pNm,
                fmt,
                isMobile,
                isXSmall,
                setModal,
                setPForm,
              }}
            />
          )}
          {tab === "expenses" && (
            <ExpensesContent
              {...{
                expenses,
                projects,
                sorted,
                search,
                setSearch,
                sortBy,
                setSortBy,
                fPid,
                setFPid,
                fCat,
                setFCat,
                catTotals,
                openAdd,
                exportCSV,
                openEdit,
                setDelId,
                D,
                txt,
                muted,
                brd,
                card,
                fmt,
                pClr,
                pNm,
                isMobile,
                isXSmall,
              }}
            />
          )}
          {tab === "projects" && (
            <ProjectsContent
              {...{
                projects,
                projTotals,
                expenses,
                isPro,
                D,
                txt,
                muted,
                brd,
                card,
                fmt,
                setModal,
                setPForm,
                handleRemoveProject,
                isMobile,
              }}
            />
          )}
          {tab === "reports" && (
            <ReportsContent
              {...{
                expenses,
                projects,
                grandTotal,
                estSavings,
                catTotals,
                projTotals,
                isPro,
                D,
                txt,
                muted,
                brd,
                card,
                fmt,
                exportCSV,
                setShowPlan,
              }}
            />
          )}
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: D ? "rgba(14,14,14,.97)" : card,
            borderTop: `1px solid ${brd}`,
            display: "flex",
            zIndex: 100,
            backdropFilter: "blur(16px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {navItems.map(({ id, Icon, label }) => (
            <button
              key={id}
              className={`mob-tab ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "10px 0",
                color: tab === id ? "#f97316" : muted,
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // Desktop view with left sidebar
  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        background: bg,
        minHeight: "100vh",
        color: txt,
        display: "flex",
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
      {showOnboarding && (
        <OnboardingGuide
          steps={ONBOARDING_STEPS}
          currentStep={onboardingStep}
          onNext={handleOnboardingNext}
          onPrev={handleOnboardingPrev}
          onSkip={handleOnboardingSkip}
          tk={tk}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        style={{
          width: sidebarCollapsed ? 80 : 280,
          background: sidebarBg,
          borderRight: `1px solid ${brd}`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          transition: "width 0.3s ease",
          zIndex: 100,
          overflowY: "auto",
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            padding: sidebarCollapsed ? "20px 0" : "24px 20px",
            borderBottom: `1px solid ${brd}`,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                fontSize: 18,
              }}
            >
              ₣
            </div>
            {!sidebarCollapsed && (
              <span
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: txt,
                }}
              >
                FreelanceFunds
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
              display: sidebarCollapsed ? "none" : "flex",
            }}
          >
            <ChevronLeftIcon size={18} />
          </button>
        </div>

        {/* Collapse Toggle Button when collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
              padding: "12px 0",
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <ChevronRightIcon size={18} />
          </button>
        )}

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: "20px 12px" }}>
          {navItems.map(({ id, Icon, label, description }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: sidebarCollapsed ? "12px" : "12px 16px",
                marginBottom: 4,
                borderRadius: 12,
                background:
                  tab === id
                    ? D
                      ? "rgba(249,115,22,.15)"
                      : "rgba(249,115,22,.08)"
                    : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => {
                if (tab !== id) {
                  e.currentTarget.style.background = D
                    ? "rgba(255,255,255,.05)"
                    : "rgba(0,0,0,.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Icon size={20} color={tab === id ? "#f97316" : muted} />
              {!sidebarCollapsed && (
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: tab === id ? 700 : 600,
                      color: tab === id ? "#f97316" : txt,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>
                    {description}
                  </div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div
          style={{
            padding: sidebarCollapsed ? "16px 0" : "20px",
            borderTop: `1px solid ${brd}`,
          }}
        >
          {!sidebarCollapsed && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: D ? "#1a1a1a" : "#f5f5f5",
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginBottom: 12,
                }}
              >
                <User size={14} color={muted} />
                <span
                  style={{
                    fontSize: 12,
                    color: txt,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </span>
              </div>
              <button
                onClick={() => setDark((d) => !d)}
                className="btn btn-ghost"
                style={{
                  width: "100%",
                  marginBottom: 8,
                  justifyContent: "center",
                }}
              >
                {D ? <Sun size={14} /> : <Moon size={14} />}
                <span style={{ marginLeft: 8 }}>
                  {D ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
              {!isPro && (
                <button
                  onClick={() => setShowPlan(true)}
                  className="btn btn-pro"
                  style={{
                    width: "100%",
                    marginBottom: 8,
                    justifyContent: "center",
                  }}
                >
                  <Zap size={14} /> Upgrade to Pro
                </button>
              )}
              <button
                onClick={signOut}
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <LogOut size={14} />
                <span style={{ marginLeft: 8 }}>Sign Out</span>
              </button>
            </>
          )}
          {sidebarCollapsed && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <button
                onClick={() => setDark((d) => !d)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                }}
              >
                {D ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {!isPro && (
                <button
                  onClick={() => setShowPlan(true)}
                  style={{
                    background: "#f97316",
                    border: "none",
                    borderRadius: 8,
                    padding: 8,
                    cursor: "pointer",
                  }}
                >
                  <Zap size={16} color="#fff" />
                </button>
              )}
              <button
                onClick={signOut}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarCollapsed ? 80 : 280,
          flex: 1,
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
          padding: "24px 32px",
          maxWidth: `calc(100% - ${sidebarCollapsed ? 80 : 280}px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 32,
                letterSpacing: "-0.03em",
                color: txt,
              }}
            >
              {navItems.find((i) => i.id === tab)?.label}
            </h1>
            <p style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              {navItems.find((i) => i.id === tab)?.description}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {expenses.length > 0 && (
              <button
                className="btn btn-share"
                onClick={() => setShowShare(true)}
              >
                <Share2 size={14} /> Share
              </button>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => setShowManual(true)}
            >
              <HelpCircle size={16} />
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={14} /> Add Expense
            </button>
          </div>
        </div>

        {/* Usage Bar */}
        {!isPro && (
          <div
            style={{
              background: D ? "#111" : "#fafafa",
              border: `1px solid ${brd}`,
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
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
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span style={{ fontSize: 12, color: muted }}>{u.label}:</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: txt }}>
                    {u.used}/{u.max}
                  </span>
                  <div style={{ width: 80 }}>
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
              <span style={{ fontSize: 12, color: muted }}>
                2-way split only
              </span>
            </div>
            <button
              className="btn btn-pro"
              style={{ fontSize: 12, padding: "6px 14px" }}
              onClick={() => setShowPlan(true)}
            >
              <Zap size={12} /> Upgrade to Pro
            </button>
          </div>
        )}

        {/* Tab Content */}
        {tab === "dashboard" && (
          <DashboardContent
            {...{
              expenses,
              projects,
              grandTotal,
              estSavings,
              projTotals,
              catTotals,
              monthly,
              isPro,
              D,
              txt,
              muted,
              card,
              brd,
              exportCSV,
              openAdd,
              setShowManual,
              setTab,
              openEdit,
              pClr,
              pNm,
              fmt,
              isMobile,
              isXSmall,
              setModal,
              setPForm,
            }}
          />
        )}
        {tab === "expenses" && (
          <ExpensesContent
            {...{
              expenses,
              projects,
              sorted,
              search,
              setSearch,
              sortBy,
              setSortBy,
              fPid,
              setFPid,
              fCat,
              setFCat,
              catTotals,
              openAdd,
              exportCSV,
              openEdit,
              setDelId,
              D,
              txt,
              muted,
              brd,
              card,
              fmt,
              pClr,
              pNm,
              isMobile,
              isXSmall,
            }}
          />
        )}
        {tab === "projects" && (
          <ProjectsContent
            {...{
              projects,
              projTotals,
              expenses,
              isPro,
              D,
              txt,
              muted,
              brd,
              card,
              fmt,
              setModal,
              setPForm,
              handleRemoveProject,
              isMobile,
            }}
          />
        )}
        {tab === "reports" && (
          <ReportsContent
            {...{
              expenses,
              projects,
              grandTotal,
              estSavings,
              catTotals,
              projTotals,
              isPro,
              D,
              txt,
              muted,
              brd,
              card,
              fmt,
              exportCSV,
              setShowPlan,
            }}
          />
        )}
      </main>

      {/* Modals */}
      {modal === "expense" && (
        <ExpenseModal
          form={form}
          setForm={setForm}
          projects={projects}
          totalPct={totalPct}
          splErr={splErr}
          setSplErr={setSplErr}
          isPro={isPro}
          maxSpl={maxSpl}
          saving={saving}
          editId={editId}
          saveExpense={saveExpense}
          autoSplit={autoSplit}
          setModal={setModal}
          setShowPlan={setShowPlan}
          D={D}
          txt={txt}
          muted={muted}
          card={card}
          brd={brd}
          isMobile={isMobile}
        />
      )}

      {modal === "project" && (
        <ProjectModal
          pForm={pForm}
          setPForm={setPForm}
          saving={saving}
          saveProject={saveProject}
          setModal={setModal}
          D={D}
          txt={txt}
          muted={muted}
          card={card}
          brd={brd}
          isMobile={isMobile}
        />
      )}

      {delId && (
        <DeleteConfirmModal
          delId={delId}
          setDelId={setDelId}
          confirmDelete={confirmDelete}
          D={D}
          txt={txt}
          muted={muted}
          card={card}
          brd={brd}
          isMobile={isMobile}
        />
      )}

      {showPlan && (
        <PlanModal
          plan={plan}
          setPlan={setPlan}
          setShowPlan={setShowPlan}
          showToast={showToast}
          D={D}
          txt={txt}
          muted={muted}
          card={card}
          brd={brd}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

// ── DASHBOARD CONTENT ──
function DashboardContent({
  expenses,
  projects,
  grandTotal,
  estSavings,
  projTotals,
  catTotals,
  monthly,
  isPro,
  D,
  txt,
  muted,
  card,
  brd,
  exportCSV,
  openAdd,
  setShowManual,
  setTab,
  openEdit,
  pClr,
  pNm,
  fmt,
  isMobile,
  isXSmall,
  setModal,
  setPForm,
}) {
  if (expenses.length === 0 && projects.length === 0) {
    return (
      <div
        className="fade-up"
        style={{ textAlign: "center", padding: "60px 20px" }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "rgba(249,115,22,.12)",
            border: "2px solid rgba(249,115,22,.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <FolderOpen size={36} color="#f97316" />
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 12, color: txt }}>
          Welcome to FreelanceFunds!
        </h2>
        <p
          style={{
            color: muted,
            marginBottom: 24,
            maxWidth: 400,
            margin: "0 auto 24px",
          }}
        >
          Start by creating your first project and logging expenses to see your
          tax savings.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              setModal("project");
              setPForm({ name: "", client: "", color: "#f97316", budget: "" });
            }}
          >
            <FolderOpen size={14} /> Create Project
          </button>
          <button className="btn btn-ghost" onClick={() => setShowManual(true)}>
            <BookOpen size={14} /> Read Guide
          </button>
        </div>
      </div>
    );
  }

  if (projects.length > 0 && expenses.length === 0) {
    return (
      <div
        className="fade-up"
        style={{ textAlign: "center", padding: "40px 20px" }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "rgba(59,130,246,.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Receipt size={28} color="#3b82f6" />
        </div>
        <h3 style={{ fontSize: 20, marginBottom: 8, color: txt }}>
          Ready to track expenses!
        </h3>
        <p style={{ color: muted, marginBottom: 20 }}>
          Your project is set up. Add your first expense to see the dashboard
          come to life.
        </p>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={14} /> Add Your First Expense
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: D
              ? "linear-gradient(135deg,#111,#1a0e00)"
              : "linear-gradient(135deg,#fff,#fff7ed)",
            borderRadius: 24,
            padding: isMobile ? 20 : 24,
            border: `1px solid ${
              D ? "rgba(249,115,22,.18)" : "rgba(249,115,22,.2)"
            }`,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "#f97316",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Total Tracked
          </p>
          <p
            style={{
              fontSize: isMobile ? 32 : 40,
              fontWeight: 700,
              color: txt,
              marginBottom: 4,
            }}
          >
            {fmt(grandTotal)}
          </p>
          <p style={{ fontSize: 12, color: muted }}>
            {expenses.length} expenses across {projects.length} project
            {projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div
          style={{
            background: D
              ? "linear-gradient(135deg,#0a1a0f,#0d2015)"
              : "linear-gradient(135deg,#f0fdf4,#dcfce7)",
            borderRadius: 24,
            padding: isMobile ? 20 : 24,
            border: `1px solid ${
              D ? "rgba(16,185,129,.18)" : "rgba(16,185,129,.25)"
            }`,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "#10b981",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Est. Tax Savings
          </p>
          <p
            style={{
              fontSize: isMobile ? 32 : 40,
              fontWeight: 700,
              color: "#10b981",
              marginBottom: 4,
            }}
          >
            {fmt(estSavings)}
          </p>
          <p style={{ fontSize: 12, color: muted }}>at 20% deduction rate</p>
        </div>
      </div>

      {/* Mini Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isXSmall ? "1fr 1fr" : "repeat(3,1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: isMobile ? 12 : 16 }}>
          <p className="lbl">Avg Expense</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: txt }}>
            {fmt(Math.round(grandTotal / expenses.length))}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? 12 : 16 }}>
          <p className="lbl">Top Category</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: txt }}>
            {Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
              "—"}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? 12 : 16 }}>
          <p className="lbl">Hours Saved</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: txt }}>~10 hrs</p>
        </div>
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "5fr 3fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: isMobile ? 16 : 20 }}>
          <p style={{ fontWeight: 700, marginBottom: 16, color: txt }}>
            <BarChart3
              size={14}
              style={{ display: "inline", marginRight: 8, color: "#f97316" }}
            />
            Monthly Spend
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 4,
              height: 80,
            }}
          >
            {monthly.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    height: 56,
                    display: "flex",
                    alignItems: "flex-end",
                    background: D ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${
                        (d.val / Math.max(...monthly.map((x) => x.val), 1)) *
                        100
                      }%`,
                      background: d.highlight
                        ? "#f97316"
                        : D
                        ? "#3b82f6"
                        : "#60a5fa",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.6s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: muted,
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: isMobile ? 16 : 20 }}>
          <p style={{ fontWeight: 700, marginBottom: 16, color: txt }}>
            <PieChart
              size={14}
              style={{ display: "inline", marginRight: 8, color: "#f97316" }}
            />
            Projects
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <DonutChart
              size={80}
              segments={projects.map((p) => ({
                pct: grandTotal
                  ? Math.round(((projTotals[p.id] || 0) / grandTotal) * 100)
                  : 0,
                color: p.color,
              }))}
            />
            <div style={{ flex: 1 }}>
              {projects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: p.color,
                      }}
                    />
                    <span style={{ fontSize: 12, color: txt }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: muted }}>
                    {fmt(Math.round(projTotals[p.id] || 0))}
                  </span>
                </div>
              ))}
              {projects.length > 3 && (
                <button
                  onClick={() => setTab("projects")}
                  style={{
                    fontSize: 11,
                    color: "#f97316",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  +{projects.length - 3} more
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Cards */}
      {projects.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {projects.slice(0, 3).map((p) => {
            const spent = projTotals[p.id] || 0;
            const pct = p.budget
              ? Math.min(100, Math.round((spent / p.budget) * 100))
              : null;
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: 16,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: p.color,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 4,
                      color: txt,
                    }}
                  >
                    {p.name}
                  </p>
                  <p style={{ fontSize: 11, color: muted, marginBottom: 12 }}>
                    {p.client || "No client"}
                  </p>
                  <p
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: txt,
                      marginBottom: 8,
                    }}
                  >
                    {fmt(Math.round(spent))}
                  </p>
                  {p.budget > 0 && (
                    <>
                      <div className="prog" style={{ marginBottom: 4 }}>
                        <div
                          className="prog-bar"
                          style={{
                            width: `${pct}%`,
                            background: pct > 80 ? "#ef4444" : p.color,
                          }}
                        />
                      </div>
                      <p style={{ fontSize: 10, color: muted }}>
                        {fmt(Math.round(p.budget - spent))} remaining
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade Nudge */}
      {!isPro && expenses.length >= 5 && (
        <UpgradeNudge
          feature="4-way splitting + AI suggestions + PDF reports"
          onUpgrade={() => setShowPlan(true)}
          D={D}
          brd={brd}
        />
      )}

      {/* Recent Activity */}
      <div className="card" style={{ padding: isMobile ? 16 : 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <p style={{ fontWeight: 700, color: txt }}>
            <Clock
              size={14}
              style={{ display: "inline", marginRight: 8, color: "#f97316" }}
            />
            Recent Activity
          </p>
          <button
            className="btn btn-ghost"
            onClick={() => setTab("expenses")}
            style={{ fontSize: 12 }}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {expenses.slice(0, 5).map((e) => {
            const { Icon: CIc, color: cClr } =
              CAT_META[e.category] || CAT_META.Other;
            return (
              <div
                key={e.id}
                className="row"
                onClick={() => openEdit(e)}
                style={{ padding: 12 }}
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
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${cClr}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CIc size={14} color={cClr} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: txt }}>
                        {e.description}
                      </p>
                      <p style={{ fontSize: 10, color: muted }}>
                        {e.date} · {e.category}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: txt }}>
                    {fmt(e.amount)}
                  </p>
                </div>
                <SplitBar splits={e.splits} projects={projects} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── EXPENSES CONTENT ──
function ExpensesContent({
  expenses,
  projects,
  sorted,
  search,
  setSearch,
  sortBy,
  setSortBy,
  fPid,
  setFPid,
  fCat,
  setFCat,
  catTotals,
  openAdd,
  exportCSV,
  openEdit,
  setDelId,
  D,
  txt,
  muted,
  brd,
  card,
  fmt,
  pClr,
  pNm,
  isMobile,
  isXSmall,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <p style={{ fontSize: 14, color: muted }}>
            {sorted.length} of {expenses.length} expenses ·{" "}
            {fmt(sorted.reduce((s, e) => s + e.amount, 0))}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-ghost"
            onClick={exportCSV}
            style={{ fontSize: 12 }}
          >
            <Download size={13} /> CSV
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
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
          <div style={{ position: "relative", width: isMobile ? "100%" : 160 }}>
            <ArrowUpDown
              size={12}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: muted,
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

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {[
            { id: "all", label: "All Projects" },
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
                  fPid === p.id ? p.color || txt : D ? "#1a1a1a" : "#f3f4f6",
                color: fPid === p.id ? "#fff" : muted,
                border: `1.5px solid ${fPid === p.id ? p.color || txt : brd}`,
                borderRadius: 20,
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {p.color && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: fPid === p.id ? "#fff" : p.color,
                  }}
                />
              )}
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setFCat("all")}
            style={{
              background: fCat === "all" ? txt : D ? "#1a1a1a" : "#f3f4f6",
              color: fCat === "all" ? (D ? "#000" : "#fff") : muted,
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All
          </button>
          {CATEGORIES.filter((c) => catTotals[c] > 0).map((c) => {
            const { Icon: CIc, color: cClr } = CAT_META[c];
            return (
              <button
                key={c}
                onClick={() => setFCat(c)}
                style={{
                  background: fCat === c ? cClr : D ? "#1a1a1a" : "#f3f4f6",
                  color: fCat === c ? "#fff" : muted,
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <CIc size={11} />
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "60px 20px", color: muted }}
          >
            <Receipt size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: txt,
                marginBottom: 8,
              }}
            >
              {expenses.length === 0 ? "No expenses yet" : "No results found"}
            </p>
            {expenses.length === 0 && (
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={14} /> Add First Expense
              </button>
            )}
          </div>
        ) : (
          sorted.map((e) => {
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
                      alignItems: "center",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `${cClr}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CIc size={16} color={cClr} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: txt,
                          marginBottom: 2,
                        }}
                      >
                        {e.description}
                      </p>
                      <p style={{ fontSize: 11, color: muted }}>
                        {e.date} · {e.category}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <p style={{ fontWeight: 700, fontSize: 15, color: txt }}>
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
                    gap: 6,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {e.splits.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        background: `${pClr(projects, s.pid)}15`,
                        color: pClr(projects, s.pid),
                        borderRadius: 12,
                        padding: "2px 8px",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {pNm(projects, s.pid)} {s.pct}%
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── PROJECTS CONTENT ──
function ProjectsContent({
  projects,
  projTotals,
  expenses,
  isPro,
  D,
  txt,
  muted,
  brd,
  card,
  fmt,
  setModal,
  setPForm,
  handleRemoveProject,
  isMobile,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <p style={{ fontSize: 14, color: muted }}>
          {projects.length}/{isPro ? "∞" : 3} used
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setModal("project");
            setPForm({ name: "", client: "", color: "#f97316", budget: "" });
          }}
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      {!isPro && projects.length >= FREE_PROJ && (
        <UpgradeNudge
          feature="unlimited projects"
          onUpgrade={() => setShowPlan(true)}
          D={D}
          brd={brd}
        />
      )}

      {projects.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "60px 20px", color: muted }}
        >
          <FolderOpen size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: txt,
              marginBottom: 8,
            }}
          >
            No projects yet
          </p>
          <p style={{ marginBottom: 20 }}>
            Create one project per client to get started
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setModal("project");
              setPForm({ name: "", client: "", color: "#f97316", budget: "" });
            }}
          >
            <Plus size={14} /> Create First Project
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
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
              <div
                key={p.id}
                className="card"
                style={{
                  padding: 20,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: p.color,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        marginBottom: 4,
                        color: txt,
                      }}
                    >
                      {p.name}
                    </p>
                    <p style={{ fontSize: 12, color: muted }}>
                      {p.client || "No client"}
                    </p>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "4px 8px" }}
                    onClick={() => handleRemoveProject(p.id)}
                  >
                    <X size={12} />
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p className="lbl">Spent</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: txt }}>
                      {fmt(spent)}
                    </p>
                  </div>
                  <div>
                    <p className="lbl">Expenses</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: txt }}>
                      {pExp.length}
                    </p>
                  </div>
                </div>

                {p.budget > 0 && (
                  <div style={{ marginBottom: 16 }}>
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
                          fontWeight: 700,
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
                    <p style={{ fontSize: 10, color: muted, marginTop: 4 }}>
                      {fmt(p.budget - spent)} remaining of {fmt(p.budget)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="lbl" style={{ marginBottom: 8 }}>
                    Top Categories
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[...new Set(pExp.map((e) => e.category))]
                      .slice(0, 3)
                      .map((c) => {
                        const { Icon: CIc } = CAT_META[c] || CAT_META.Other;
                        return (
                          <span
                            key={c}
                            style={{
                              background: D ? "#1f1f1f" : "#f3f4f6",
                              padding: "4px 10px",
                              borderRadius: 8,
                              fontSize: 11,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              color: muted,
                            }}
                          >
                            <CIc size={10} />
                            {c}
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── REPORTS CONTENT ──
function ReportsContent({
  expenses,
  projects,
  grandTotal,
  estSavings,
  catTotals,
  projTotals,
  isPro,
  D,
  txt,
  muted,
  brd,
  card,
  fmt,
  exportCSV,
  setShowPlan,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: muted,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Database size={12} /> BIR-ready · private to your account
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={exportCSV}>
            <Download size={13} /> CSV
          </button>
          {!isPro ? (
            <button className="btn btn-pro" onClick={() => setShowPlan(true)}>
              <Lock size={12} /> PDF · Pro
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => alert("PDF generation coming soon!")}
            >
              <Download size={13} /> PDF
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Total Deductible",
            val: fmt(grandTotal),
            sub: "all time",
            icon: TrendingUp,
          },
          {
            label: "Est. Tax Savings",
            val: fmt(estSavings),
            sub: "at 20% rate",
            icon: Shield,
            color: "#16a34a",
          },
          {
            label: "Expenses Filed",
            val: expenses.length,
            sub: `${Object.keys(catTotals).length} categories`,
            icon: FileText,
          },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <p className="lbl" style={{ marginBottom: 8 }}>
              {s.label}
            </p>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: s.color || txt,
                marginBottom: 4,
              }}
            >
              {s.val}
            </p>
            <p style={{ fontSize: 11, color: muted }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {!isPro && expenses.length > 0 && (
        <UpgradeNudge
          feature="PDF export (BIR-ready, accountant-ready)"
          onUpgrade={() => setShowPlan(true)}
          D={D}
          brd={brd}
        />
      )}

      {expenses.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "60px 20px", color: muted }}
        >
          <FileBarChart2 size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: txt }}>
            No data to report yet
          </p>
        </div>
      ) : (
        <>
          {/* By Project */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, marginBottom: 16, color: txt }}>
              <FolderOpen
                size={14}
                style={{ display: "inline", marginRight: 8, color: "#f97316" }}
              />
              By Project
            </p>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `2px solid ${brd}` }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 8px",
                        color: muted,
                        fontWeight: 600,
                      }}
                    >
                      Project
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 8px",
                        color: muted,
                        fontWeight: 600,
                      }}
                    >
                      Client
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "8px 8px",
                        color: muted,
                        fontWeight: 600,
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "8px 8px",
                        color: muted,
                        fontWeight: 600,
                      }}
                    >
                      Share
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "8px 8px",
                        color: muted,
                        fontWeight: 600,
                      }}
                    >
                      Savings
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const spent = Math.round(projTotals[p.id] || 0);
                    return (
                      <tr
                        key={p.id}
                        style={{ borderBottom: `1px solid ${brd}` }}
                      >
                        <td style={{ padding: "10px 8px" }}>
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
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td style={{ padding: "10px 8px", color: muted }}>
                          {p.client || "—"}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "right",
                            fontWeight: 600,
                          }}
                        >
                          {fmt(spent)}
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>
                          <span
                            style={{
                              background: `${p.color}15`,
                              color: p.color,
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 11,
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
                            padding: "10px 8px",
                            textAlign: "right",
                            color: "#16a34a",
                            fontWeight: 600,
                          }}
                        >
                          {fmt(Math.round(spent * 0.2))}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: `2px solid ${txt}` }}>
                    <td
                      colSpan={2}
                      style={{ padding: "12px 8px", fontWeight: 700 }}
                    >
                      TOTAL
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "right",
                        fontWeight: 700,
                      }}
                    >
                      {fmt(grandTotal)}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "right",
                        fontWeight: 700,
                      }}
                    >
                      100%
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "right",
                        fontWeight: 700,
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

          {/* By Category */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontWeight: 700, marginBottom: 16, color: txt }}>
              <Tag
                size={14}
                style={{ display: "inline", marginRight: 8, color: "#f97316" }}
              />
              By Category
            </p>
            {Object.entries(catTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, total]) => {
                const { Icon: CIc, color: cClr } =
                  CAT_META[cat] || CAT_META.Other;
                return (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <CIc size={14} color={cClr} />
                        <span style={{ fontWeight: 600, color: txt }}>
                          {cat}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ fontSize: 12, color: muted }}>
                          {Math.round((total / grandTotal) * 100)}%
                        </span>
                        <span style={{ fontWeight: 700, color: txt }}>
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
  );
}

// ── EXPENSE MODAL ──
function ExpenseModal({
  form,
  setForm,
  projects,
  totalPct,
  splErr,
  setSplErr,
  isPro,
  maxSpl,
  saving,
  editId,
  saveExpense,
  autoSplit,
  setModal,
  setShowPlan,
  D,
  txt,
  muted,
  card,
  brd,
  isMobile,
}) {
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && setModal(null)}
    >
      <div className="modal scale-in">
        {isMobile && (
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: brd,
              margin: "0 auto 16px",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 22, color: txt }}>
            {editId ? "Edit Expense" : "New Expense"}
          </h2>
          <button className="btn btn-ghost" onClick={() => setModal(null)}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
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
                    size={14}
                    color={cClr}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
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
                style={{ paddingLeft: 34 }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="lbl">Notes (optional)</label>
            <textarea
              className="input"
              placeholder="Add details about this expense..."
              value={form.notes || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
            />
          </div>

          {/* Smart Split Section */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <label className="lbl" style={{ margin: 0 }}>
                Smart Split *
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 12,
                    color: totalPct === 100 ? "#10b981" : "#ef4444",
                  }}
                >
                  {totalPct}%
                </span>
                <button
                  className="btn btn-ghost"
                  onClick={autoSplit}
                  style={{ padding: "4px 12px", fontSize: 11 }}
                >
                  <Zap size={11} /> Auto
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                    style={{ flex: 2 }}
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
                  <div style={{ position: "relative", width: 80 }}>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      max="100"
                      value={s.pct}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          splits: f.splits.map((x, j) =>
                            j === i ? { ...x, pct: Number(e.target.value) } : x
                          ),
                        }))
                      }
                      style={{ paddingRight: 24 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: muted,
                      }}
                    >
                      %
                    </span>
                  </div>
                  {form.splits.length > 1 && (
                    <button
                      className="btn btn-danger"
                      style={{ padding: "4px 8px" }}
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
                  fontSize: 11,
                  color: "#ef4444",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <AlertTriangle size={11} /> {splErr}
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
                  width: "100%",
                  padding: 8,
                  background: D ? "#1a1a1a" : "#f9fafb",
                  border: `1.5px dashed ${brd}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  color: muted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Plus size={12} /> Split to another project
              </button>
            ) : (
              !isPro &&
              form.splits.length >= maxSpl && (
                <button
                  onClick={() => setShowPlan(true)}
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: 8,
                    background: D ? "#1a0e00" : "#fff7ed",
                    border: "1.5px dashed #f97316",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#f97316",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Lock size={12} /> Upgrade to Pro for 4-way splitting
                </button>
              )
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center", padding: 12 }}
            onClick={saveExpense}
            disabled={saving || projects.length === 0}
          >
            {saving ? "Saving..." : editId ? "Save Changes" : "Add Expense"}
          </button>
          <button className="btn btn-ghost" onClick={() => setModal(null)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PROJECT MODAL ──
function ProjectModal({
  pForm,
  setPForm,
  saving,
  saveProject,
  setModal,
  D,
  txt,
  muted,
  card,
  brd,
  isMobile,
}) {
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && setModal(null)}
    >
      <div className="modal scale-in" style={{ maxWidth: 400 }}>
        {isMobile && (
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: brd,
              margin: "0 auto 16px",
            }}
          />
        )}
        <h2 style={{ fontSize: 22, marginBottom: 20, color: txt }}>
          New Project
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            <label className="lbl">Budget (₱) - optional</label>
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
                marginBottom: 12,
              }}
            >
              {PALETTE.map((c) => (
                <div
                  key={c}
                  className={`color-swatch ${pForm.color === c ? "sel" : ""}`}
                  style={{ background: c }}
                  onClick={() => setPForm((f) => ({ ...f, color: c }))}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center", padding: 12 }}
            onClick={saveProject}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Project"}
          </button>
          <button className="btn btn-ghost" onClick={() => setModal(null)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DELETE CONFIRM MODAL ──
function DeleteConfirmModal({
  delId,
  setDelId,
  confirmDelete,
  D,
  txt,
  muted,
  card,
  brd,
  isMobile,
}) {
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && setDelId(null)}
    >
      <div
        className="modal scale-in"
        style={{ maxWidth: 320, textAlign: "center" }}
      >
        <Trash2 size={40} color="#dc2626" style={{ marginBottom: 16 }} />
        <h3
          style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: txt }}
        >
          Delete Expense?
        </h3>
        <p style={{ fontSize: 13, color: muted, marginBottom: 24 }}>
          This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={confirmDelete}
          >
            Delete
          </button>
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={() => setDelId(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PLAN MODAL ──
function PlanModal({
  plan,
  setPlan,
  setShowPlan,
  showToast,
  D,
  txt,
  muted,
  card,
  brd,
  isMobile,
}) {
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && setShowPlan(false)}
    >
      <div className="modal scale-in">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 24, color: txt }}>Upgrade to Pro</h2>
          <button className="btn btn-ghost" onClick={() => setShowPlan(false)}>
            <X size={18} />
          </button>
        </div>

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
              period: "forever",
              features: [
                "50 expenses/month",
                "3 projects",
                "2-way split",
                "CSV export",
              ],
              limits: ["AI suggestions", "PDF reports", "4-way split"],
              cur: plan === "free",
            },
            {
              label: "Pro",
              price: "₱500",
              period: "per month",
              features: [
                "Unlimited expenses",
                "Unlimited projects",
                "4-way split",
                "AI suggestions",
                "PDF reports",
                "Priority support",
              ],
              cur: plan === "pro",
              popular: true,
            },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                border: `2px solid ${p.popular ? "#f97316" : brd}`,
                borderRadius: 16,
                padding: 20,
                background: p.cur
                  ? D
                    ? "#1a0e00"
                    : "#fff7ed"
                  : D
                  ? "#1a1a1a"
                  : "#fafafa",
                position: "relative",
              }}
            >
              {p.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#f97316",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 12px",
                    borderRadius: 12,
                  }}
                >
                  {p.cur ? "CURRENT" : "MOST POPULAR"}
                </div>
              )}
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: p.popular ? "#f97316" : txt,
                }}
              >
                {p.label}
              </h3>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 4,
                  color: txt,
                }}
              >
                {p.price}
              </p>
              <p style={{ fontSize: 12, color: muted, marginBottom: 20 }}>
                {p.period}
              </p>

              {p.features.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Check size={12} color={p.popular ? "#f97316" : "#10b981"} />
                  <span style={{ fontSize: 12, color: txt }}>{f}</span>
                </div>
              ))}

              {p.limits?.map((l) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    opacity: 0.5,
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
                    {l}
                  </span>
                </div>
              ))}

              <button
                onClick={() => {
                  if (p.label.toLowerCase() !== plan) {
                    setPlan(p.label.toLowerCase());
                    showToast(
                      p.label === "Pro"
                        ? "Pro unlocked! 🎉"
                        : "Switched to Free plan"
                    );
                  }
                  setShowPlan(false);
                }}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: 10,
                  borderRadius: 10,
                  border: `2px solid ${p.popular ? "#f97316" : brd}`,
                  background: p.cur
                    ? "#10b981"
                    : p.popular
                    ? "#f97316"
                    : "transparent",
                  color: p.cur ? "#fff" : p.popular ? "#fff" : txt,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {p.cur
                  ? "Current Plan"
                  : p.popular
                  ? "Upgrade Now"
                  : "Use Free"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FREELANCE FUNDS APP (Main App) ──
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useLS(
    "ff_sidebar_collapsed",
    false
  );

  const { isMobile, isTablet, isDesktop, isXSmall } = useBreakpoint();
  const isPro = plan === "pro";
  const maxExp = isPro ? Infinity : FREE_EXP;
  const maxProj = isPro ? Infinity : FREE_PROJ;
  const maxSpl = isPro ? 4 : 2;

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`ff_onboarded_${user.id}`);
    if (!loading && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [loading, user.id]);

  const D = dark;
  const bg = D ? "#0a0a0a" : "#f8f7f4";
  const card = D ? "#141414" : "#ffffff";
  const brd = D ? "#2a2a2a" : "#e8e4de";
  const txt = D ? "#e8e8e8" : "#1a1a1a";
  const muted = D ? "#6b6b6b" : "#9ca3af";
  const inp = D ? "#1f1f1f" : "#ffffff";
  const sidebarBg = D ? "#0f0f0f" : "#ffffff";
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
    const labs = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      vals = Array(12).fill(0);
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

  const completeOnboarding = () => {
    localStorage.setItem(`ff_onboarded_${user.id}`, "1");
    setShowOnboarding(false);
    showToast(
      "Welcome to FreelanceFunds! Start by creating your first project.",
      "success"
    );
  };

  const handleOnboardingNext = () => {
    if (onboardingStep === ONBOARDING_STEPS.length - 1) {
      completeOnboarding();
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const handleOnboardingPrev = () => {
    setOnboardingStep(onboardingStep - 1);
  };

  const handleOnboardingSkip = () => {
    completeOnboarding();
  };

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

  const navItems = [
    {
      id: "dashboard",
      Icon: LayoutDashboard,
      label: "Dashboard",
      description: "Overview & insights",
    },
    {
      id: "expenses",
      Icon: Receipt,
      label: "Expenses",
      description: "Track your spending",
    },
    {
      id: "projects",
      Icon: FolderOpen,
      label: "Projects",
      description: "Manage clients",
    },
    {
      id: "reports",
      Icon: FileBarChart2,
      label: "Reports",
      description: "BIR-ready exports",
    },
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{overflow-x:hidden;max-width:100vw;-webkit-font-smoothing:antialiased}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
    .fade-up{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
    .fade-up-1{animation:fadeUp .4s .05s cubic-bezier(.16,1,.3,1) both}
    .fade-up-2{animation:fadeUp .4s .1s cubic-bezier(.16,1,.3,1) both}
    .fade-up-3{animation:fadeUp .4s .15s cubic-bezier(.16,1,.3,1) both}
    .scale-in{animation:scaleIn .25s ease both}
    .slide-in{animation:slideIn .3s ease both}
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
    isMobile ? "12px" : "20px"
  };position:relative;overflow:hidden;transition:all .2s}
    .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,${
      D ? 0.25 : 0.08
    })}
    .row{border-radius:14px;padding:14px 16px;border:1px solid ${
      D ? "#1e1e1e" : "#f0f0f0"
    };background:${card};transition:all .18s;cursor:pointer}
    .row:hover{border-color:${
      D ? "rgba(249,115,22,.25)" : "rgba(249,115,22,.2)"
    };box-shadow:0 6px 20px rgba(0,0,0,${
    D ? 0.2 : 0.06
  });transform:translateY(-1px)}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:${
      isMobile ? "flex-end" : "center"
    };justify-content:center;z-index:600;padding:${
    isMobile ? "0" : "16px"
  };backdrop-filter:blur(12px)}
    .modal{background:${card};border-radius:${
    isMobile ? "22px 22px 0 0" : "24px"
  };padding:${isMobile ? "20px 16px 32px" : "24px"};width:100%;max-width:${
    isMobile ? "100%" : "520px"
  };max-height:${
    isMobile ? "92vh" : "92vh"
  };overflow-y:auto;border:1px solid ${brd};box-shadow:0 24px 60px rgba(0,0,0,.4)}
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
    @media(max-width:768px){
      .modal{max-width:100%;border-radius:22px 22px 0 0}
      input,select,textarea{font-size:16px!important}
    }
  `;

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

  // Mobile view with bottom navigation
  if (isMobile) {
    return (
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          background: bg,
          minHeight: "100vh",
          color: txt,
          paddingBottom: 88,
          overflowX: "hidden",
          width: "100%",
          maxWidth: "100vw",
          position: "relative",
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
        {showOnboarding && (
          <OnboardingGuide
            steps={ONBOARDING_STEPS}
            currentStep={onboardingStep}
            onNext={handleOnboardingNext}
            onPrev={handleOnboardingPrev}
            onSkip={handleOnboardingSkip}
            tk={tk}
          />
        )}

        {/* Mobile Header */}
        <header
          style={{
            background: D ? "rgba(14,14,14,.95)" : card,
            borderBottom: `1px solid ${brd}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 200,
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            <span style={{ fontWeight: 700, fontSize: 16, color: txt }}>
              FreelanceFunds
            </span>
            {isPro ? (
              <span className="badge-pro">PRO</span>
            ) : (
              <span className="badge-free">FREE</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
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
            <button
              className="btn btn-primary"
              onClick={openAdd}
              style={{ padding: "7px 13px" }}
            >
              <Plus size={16} />
            </button>
          </div>
        </header>

        {/* Mobile Content */}
        <main
          style={{
            padding: "16px 12px",
            width: "100%",
          }}
        >
          {tab === "dashboard" && (
            <DashboardContent
              {...{
                expenses,
                projects,
                grandTotal,
                estSavings,
                projTotals,
                catTotals,
                monthly,
                isPro,
                D,
                txt,
                muted,
                card,
                brd,
                exportCSV,
                openAdd,
                setShowManual,
                setTab,
                openEdit,
                pClr,
                pNm,
                fmt,
                isMobile,
                isXSmall,
                setModal,
                setPForm,
              }}
            />
          )}
          {tab === "expenses" && (
            <ExpensesContent
              {...{
                expenses,
                projects,
                sorted,
                search,
                setSearch,
                sortBy,
                setSortBy,
                fPid,
                setFPid,
                fCat,
                setFCat,
                catTotals,
                openAdd,
                exportCSV,
                openEdit,
                setDelId,
                D,
                txt,
                muted,
                brd,
                card,
                fmt,
                pClr,
                pNm,
                isMobile,
                isXSmall,
              }}
            />
          )}
          {tab === "projects" && (
            <ProjectsContent
              {...{
                projects,
                projTotals,
                expenses,
                isPro,
                D,
                txt,
                muted,
                brd,
                card,
                fmt,
                setModal,
                setPForm,
                handleRemoveProject,
                isMobile,
              }}
            />
          )}
          {tab === "reports" && (
            <ReportsContent
              {...{
                expenses,
                projects,
                grandTotal,
                estSavings,
                catTotals,
                projTotals,
                isPro,
                D,
                txt,
                muted,
                brd,
                card,
                fmt,
                exportCSV,
                setShowPlan,
              }}
            />
          )}
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: D ? "rgba(14,14,14,.97)" : card,
            borderTop: `1px solid ${brd}`,
            display: "flex",
            zIndex: 100,
            backdropFilter: "blur(16px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {navItems.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "10px 0",
                color: tab === id ? "#f97316" : muted,
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // Desktop view with left sidebar
  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        background: bg,
        minHeight: "100vh",
        color: txt,
        display: "flex",
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
      {showOnboarding && (
        <OnboardingGuide
          steps={ONBOARDING_STEPS}
          currentStep={onboardingStep}
          onNext={handleOnboardingNext}
          onPrev={handleOnboardingPrev}
          onSkip={handleOnboardingSkip}
          tk={tk}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        style={{
          width: sidebarCollapsed ? 80 : 280,
          background: sidebarBg,
          borderRight: `1px solid ${brd}`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          transition: "width 0.3s ease",
          zIndex: 100,
          overflowY: "auto",
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            padding: sidebarCollapsed ? "20px 0" : "24px 20px",
            borderBottom: `1px solid ${brd}`,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                fontSize: 18,
              }}
            >
              ₣
            </div>
            {!sidebarCollapsed && (
              <span
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: txt,
                }}
              >
                FreelanceFunds
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
              display: sidebarCollapsed ? "none" : "flex",
            }}
          >
            <ChevronLeftIcon size={18} />
          </button>
        </div>

        {/* Collapse Toggle Button when collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: muted,
              padding: "12px 0",
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <ChevronRightIcon size={18} />
          </button>
        )}

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: "20px 12px" }}>
          {navItems.map(({ id, Icon, label, description }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: sidebarCollapsed ? "12px" : "12px 16px",
                marginBottom: 4,
                borderRadius: 12,
                background:
                  tab === id
                    ? D
                      ? "rgba(249,115,22,.15)"
                      : "rgba(249,115,22,.08)"
                    : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => {
                if (tab !== id) {
                  e.currentTarget.style.background = D
                    ? "rgba(255,255,255,.05)"
                    : "rgba(0,0,0,.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Icon size={20} color={tab === id ? "#f97316" : muted} />
              {!sidebarCollapsed && (
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: tab === id ? 700 : 600,
                      color: tab === id ? "#f97316" : txt,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>
                    {description}
                  </div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div
          style={{
            padding: sidebarCollapsed ? "16px 0" : "20px",
            borderTop: `1px solid ${brd}`,
          }}
        >
          {!sidebarCollapsed && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: D ? "#1a1a1a" : "#f5f5f5",
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginBottom: 12,
                }}
              >
                <User size={14} color={muted} />
                <span
                  style={{
                    fontSize: 12,
                    color: txt,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email}
                </span>
              </div>
              <button
                onClick={() => setDark((d) => !d)}
                className="btn btn-ghost"
                style={{
                  width: "100%",
                  marginBottom: 8,
                  justifyContent: "center",
                }}
              >
                {D ? <Sun size={14} /> : <Moon size={14} />}
                <span style={{ marginLeft: 8 }}>
                  {D ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
              {!isPro && (
                <button
                  onClick={() => setShowPlan(true)}
                  className="btn btn-pro"
                  style={{
                    width: "100%",
                    marginBottom: 8,
                    justifyContent: "center",
                  }}
                >
                  <Zap size={14} /> Upgrade to Pro
                </button>
              )}
              <button
                onClick={signOut}
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <LogOut size={14} />
                <span style={{ marginLeft: 8 }}>Sign Out</span>
              </button>
            </>
          )}
          {sidebarCollapsed && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <button
                onClick={() => setDark((d) => !d)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                }}
              >
                {D ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {!isPro && (
                <button
                  onClick={() => setShowPlan(true)}
                  style={{
                    background: "#f97316",
                    border: "none",
                    borderRadius: 8,
                    padding: 8,
                    cursor: "pointer",
                  }}
                >
                  <Zap size={16} color="#fff" />
                </button>
              )}
              <button
                onClick={signOut}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarCollapsed ? 80 : 280,
          flex: 1,
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
          padding: "24px 32px",
          maxWidth: `calc(100% - ${sidebarCollapsed ? 80 : 280}px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 32,
                letterSpacing: "-0.03em",
                color: txt,
              }}
            >
              {navItems.find((i) => i.id === tab)?.label}
            </h1>
            <p style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              {navItems.find((i) => i.id === tab)?.description}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {expenses.length > 0 && (
              <button
                className="btn btn-share"
                onClick={() => setShowShare(true)}
              >
                <Share2 size={14} /> Share
              </button>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => setShowManual(true)}
            >
              <HelpCircle size={16} />
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={14} /> Add Expense
            </button>
          </div>
        </div>

        {/* Usage Bar */}
        {!isPro && (
          <div
            style={{
              background: D ? "#111" : "#fafafa",
              border: `1px solid ${brd}`,
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
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
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span style={{ fontSize: 12, color: muted }}>{u.label}:</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: txt }}>
                    {u.used}/{u.max}
                  </span>
                  <div style={{ width: 80 }}>
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
              <span style={{ fontSize: 12, color: muted }}>
                2-way split only
              </span>
            </div>
            <button
              className="btn btn-pro"
              style={{ fontSize: 12, padding: "6px 14px" }}
              onClick={() => setShowPlan(true)}
            >
              <Zap size={12} /> Upgrade to Pro
            </button>
          </div>
        )}

        {/* Tab Content */}
        {tab === "dashboard" && (
          <DashboardContent
            {...{
              expenses,
              projects,
              grandTotal,
              estSavings,
              projTotals,
              catTotals,
              monthly,
              isPro,
              D,
              txt,
              muted,
              card,
              brd,
              exportCSV,
              openAdd,
              setShowManual,
              setTab,
              openEdit,
              pClr,
              pNm,
              fmt,
              isMobile,
              isXSmall,
              setModal,
              setPForm,
            }}
          />
        )}
        {tab === "expenses" && (
          <ExpensesContent
            {...{
              expenses,
              projects,
              sorted,
              search,
              setSearch,
              sortBy,
              setSortBy,
              fPid,
              setFPid,
              fCat,
              setFCat,
              catTotals,
              openAdd,
              exportCSV,
              openEdit,
              setDelId,
              D,
              txt,
              muted,
              brd,
              card,
              fmt,
              pClr,
              pNm,
              isMobile,
              isXSmall,
            }}
          />
        )}
        {tab === "projects" && (
          <ProjectsContent
            {...{
              projects,
              projTotals,
              expenses,
              isPro,
              D,
              txt,
              muted,
              brd,
              card,
              fmt,
              setModal,
              setPForm,
              handleRemoveProject,
              isMobile,
            }}
          />
        )}
        {tab === "reports" && (
          <ReportsContent
            {...{
              expenses,
              projects,
              grandTotal,
              estSavings,
              catTotals,
              projTotals,
              isPro,
              D,
              txt,
              muted,
              brd,
              card,
              fmt,
              exportCSV,
              setShowPlan,
            }}
          />
        )}
      </main>

      {/* Modals */}
      {modal === "expense" && (
        <ExpenseModal
          form={form}
          setForm={setForm}
          projects={projects}
          totalPct={totalPct}
          splErr={splErr}
          setSplErr={setSplErr}
          isPro={isPro}
          maxSpl={maxSpl}
          saving={saving}
          editId={editId}
          saveExpense={saveExpense}
          autoSplit={autoSplit}
          setModal={setModal}
          setShowPlan={setShowPlan}
          D={D}
          txt={txt}
          muted={muted}
          card={card}
          brd={brd}
          isMobile={isMobile}
        />
      )}

      {modal === "project" && (
        <ProjectModal
          pForm={pForm}
          setPForm={setPForm}
          saving={saving}
          saveProject={saveProject}
          setModal={setModal}
          D={D}
          txt={txt}
          muted={muted}
          card={card}
          brd={brd}
          isMobile={isMobile}
        />
      )}

      {delId && (
        <DeleteConfirmModal
          delId={delId}
          setDelId={setDelId}
          confirmDelete={confirmDelete}
          D={D}
          txt={txt}
          muted={muted}
          card={card}
          brd={brd}
          isMobile={isMobile}
        />
      )}

      {showPlan && (
        <PlanModal
          plan={plan}
          setPlan={setPlan}
          setShowPlan={setShowPlan}
          showToast={showToast}
          D={D}
          txt={txt}
          muted={muted}
          card={card}
          brd={brd}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
