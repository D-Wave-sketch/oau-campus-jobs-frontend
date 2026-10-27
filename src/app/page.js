"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tabs,
  Tab,
  Divider,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Switch,
  FormControlLabel,
  Avatar,
  useMediaQuery,
} from "@mui/material";

import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  GraduationCap,
  Building2,
  ShieldCheck,
  LogOut,
  PlusCircle,
  FileText,
  FilterX,
  Lock,
  Mail,
  Flag,
  Users,
  Settings,
  ArrowRight,
  Edit3,
  Eye,
  LayoutDashboard,
  Check,
  Bell,
  KeyRound,
  Save,
  Trash2,
  RefreshCw,
} from "lucide-react";

// ============================================================================
// 1. CENTRALIZED LIVE API CLIENT (Connected to Render Backend)
// ============================================================================
const SERVER_ROOT = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://oau-campus-jobs.onrender.com"
).replace(/\/$/, "");

async function apiClient(
  path,
  { method = "GET", body, token, signal, isRootPath = false } = {}
) {
  const url = isRootPath ? `${SERVER_ROOT}${path}` : `${SERVER_ROOT}/api${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // 25s timeout to allow Render free-tier cold start wake-up
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: signal || controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      const err = new Error(
        payload?.message ||
          payload?.error ||
          `Request failed with status ${response.status}`
      );
      err.status = response.status;
      err.payload = payload;
      throw err;
    }
    return payload;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(
        "The server is waking up on Render. Please wait a few seconds and try again."
      );
    }
    throw err;
  }
}

// ============================================================================
// 2. HELPERS TO NORMALIZE BACKEND JSON RESPONSES
// ============================================================================
function extractList(res, possibleKeys = []) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  for (const key of possibleKeys) {
    if (Array.isArray(res[key])) return res[key];
    if (Array.isArray(res?.data?.[key])) return res.data[key];
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.items)) return res.items;
  }
  return [];
}

function extractObject(res, possibleKeys = []) {
  if (!res) return null;
  for (const key of possibleKeys) {
    if (res[key] && typeof res[key] === "object") return res[key];
    if (res?.data?.[key] && typeof res.data[key] === "object")
      return res.data[key];
  }
  if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
    return res.data;
  }
  return res;
}

// ============================================================================
// 3. CONSTITUTIONAL THEME (Zero gradients, zero decorative drop shadows)
// ============================================================================
const constitutionalTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F1F5F9",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#475569",
    },
    primary: {
      main: "#1E40AF",
      dark: "#1E3A8A",
    },
    success: { main: "#15803D" },
    warning: { main: "#B45309" },
    error: { main: "#B91C1C" },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h3: {
      fontSize: "clamp(1.45rem, 3vw, 2rem)",
      fontWeight: 800,
      letterSpacing: "-0.025em",
    },
    h4: {
      fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontSize: "clamp(1.05rem, 2vw, 1.2rem)",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: { fontSize: "1rem", fontWeight: 700 },
    body1: { fontSize: "0.94rem", lineHeight: 1.6 },
    body2: { fontSize: "0.84rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: Array(25).fill("none"),
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid #CBD5E1",
          backgroundImage: "none",
          minWidth: 0,
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#0F172A",
          borderBottom: "1px solid #CBD5E1",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 999,
          paddingLeft: 18,
          paddingRight: 18,
          "&:focus-visible": {
            outline: "3px solid #93C5FD",
            outlineOffset: "2px",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#F8FAFC",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 0,
          padding: "6px 4px",
        },
        label: {
          fontSize: "0.68rem",
          "&.Mui-selected": {
            fontSize: "0.7rem",
            fontWeight: 700,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});

const DEFAULT_SKILLS = [
  "JavaScript",
  "TypeScript / Next.js",
  "IT & Network Support",
  "Excel & Statistical Analysis",
  "Video Editing",
  "Graphic Design",
  "Academic Research",
  "Copywriting",
  "Lab Equipment Handling",
  "Customer Support",
];

function StatusBadge({ status }) {
  const norm = String(status || "PENDING").toUpperCase();
  const map = {
    OPEN: { label: "Open", color: "success", icon: <CheckCircle2 size={14} /> },
    CLOSED: { label: "Closed", color: "default", icon: <XCircle size={14} /> },
    PENDING: {
      label: "Pending",
      color: "warning",
      icon: <Clock size={14} />,
    },
    SHORTLISTED: {
      label: "Shortlisted",
      color: "primary",
      icon: <CheckCircle2 size={14} />,
    },
    ACCEPTED: {
      label: "Accepted",
      color: "success",
      icon: <CheckCircle2 size={14} />,
    },
    APPROVED: {
      label: "Verified",
      color: "success",
      icon: <ShieldCheck size={14} />,
    },
    VERIFIED: {
      label: "Verified",
      color: "success",
      icon: <ShieldCheck size={14} />,
    },
    STUDENT: {
      label: "Student",
      color: "primary",
      icon: <GraduationCap size={14} />,
    },
    EMPLOYER: {
      label: "Employer",
      color: "primary",
      icon: <Building2 size={14} />,
    },
    ADMIN: {
      label: "Administrator",
      color: "success",
      icon: <ShieldCheck size={14} />,
    },
    REJECTED: { label: "Rejected", color: "error", icon: <XCircle size={14} /> },
    RESOLVED: {
      label: "Resolved",
      color: "success",
      icon: <CheckCircle2 size={14} />,
    },
    REVIEWED: {
      label: "Reviewed",
      color: "success",
      icon: <CheckCircle2 size={14} />,
    },
    DISMISSED: {
      label: "Dismissed",
      color: "default",
      icon: <XCircle size={14} />,
    },
  };
  const cfg = map[norm] || {
    label: norm,
    color: "default",
    icon: <AlertCircle size={14} />,
  };
  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      color={cfg.color}
      size="small"
      variant="outlined"
    />
  );
}

export default function OAUCampusJobsPlatform() {
  const isMobile = useMediaQuery(constitutionalTheme.breakpoints.down("md"));

  // ============================================================================
  // 1. ENTRY & AUTHENTICATION STATE
  // ============================================================================
  const [entryStage, setEntryStage] = useState("WELCOME");
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [serverHealthy, setServerHealthy] = useState(true);

  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // ============================================================================
  // 2. LIVE API DATA STORES (Zero hardcoded dummy arrays)
  // ============================================================================
  const [jobs, setJobs] = useState([]);
  const [myEmployerJobs, setMyEmployerJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [selectedEmployerJobId, setSelectedEmployerJobId] = useState("");

  // Admin Data Stores
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminPendingEmployers, setAdminPendingEmployers] = useState([]);
  const [adminJobs, setAdminJobs] = useState([]);
  const [adminReports, setAdminReports] = useState([]);

  // Loading & Error States
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [empStatusFilter, setEmpStatusFilter] = useState("ALL");
  const [adminRoleFilter, setAdminRoleFilter] = useState("ALL");

  // Auth Forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [studentRegForm, setStudentRegForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    matricNo: "",
    faculty: "Technology",
    department: "",
    level: "300 Level",
    availability: "12–15 hrs/week (Afternoons)",
    skills: ["JavaScript", "IT & Network Support"],
    bio: "",
    cvUrl: "",
  });
  const [employerRegForm, setEmployerRegForm] = useState({
    organizationName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    industry: "University Department / Unit",
    location: "",
    website: "",
    staffOrRegId: "",
    description: "",
  });

  // Profile & Settings States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordMenu, setShowPasswordMenu] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [profileSavedBanner, setProfileSavedBanner] = useState(false);

  const [studentProfileDraft, setStudentProfileDraft] = useState({
    fullName: "",
    email: "",
    phone: "",
    matricNo: "",
    faculty: "",
    department: "",
    level: "300 Level",
    availability: "",
    skills: [],
    bio: "",
    cvUrl: "",
  });
  const [employerProfileDraft, setEmployerProfileDraft] = useState({
    organizationName: "",
    fullName: "",
    email: "",
    phone: "",
    industry: "",
    location: "",
    website: "",
    staffOrRegId: "",
    description: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifSettings, setNotifSettings] = useState({
    applicationUpdates: true,
    newJobDigest: true,
  });

  // Modals
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingJobDetail, setLoadingJobDetail] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverMessage, setCoverMessage] = useState("");
  const [reportModalJob, setReportModalJob] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    category: "Tech & IT",
    employmentType: "Part-Time",
    location: "",
    compensation: "",
    deadline: "",
    requiredSkillsCsv: "",
    description: "",
  });

  const [inspectEmployer, setInspectEmployer] = useState(null);
  const [inspectJob, setInspectJob] = useState(null);
  const [inspectReport, setInspectReport] = useState(null);
  const [inspectApplicant, setInspectApplicant] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    onConfirm: null,
  });

  // ============================================================================
  // 4. HEALTH CHECK (GET /health) & SESSION RESTORATION (GET /api/users/me)
  // ============================================================================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasOnboarded =
        window.localStorage.getItem("oau_campus_jobs_onboarded") === "true";
      if (!hasOnboarded) {
        setEntryStage("ONBOARDING");
      }
      const savedToken = window.sessionStorage.getItem("oau_jobs_jwt");
      if (savedToken) {
        setToken(savedToken);
      }
    }

    apiClient("/health", { isRootPath: true })
      .then(() => setServerHealthy(true))
      .catch(() => setServerHealthy(false));
  }, []);

  const handleCompleteOnboarding = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("oau_campus_jobs_onboarded", "true");
    }
    setEntryStage("WELCOME");
  };

  // Sync profile draft fields from GET /api/users/me response
  const hydrateProfileDrafts = useCallback((userObj) => {
    if (!userObj) return;
    const sp = userObj.studentProfile || {};
    const ep = userObj.employerProfile || {};
    const role = String(userObj.role || "").toUpperCase();

    if (role === "STUDENT") {
      setStudentProfileDraft({
        fullName: userObj.fullName || userObj.name || sp.fullName || "",
        email: userObj.email || "",
        phone: userObj.phone || sp.phone || "",
        matricNo: sp.matricNo || sp.matricNumber || userObj.matricNo || "",
        faculty: sp.faculty || userObj.faculty || "Technology",
        department: sp.department || userObj.department || "",
        level: String(sp.level || userObj.level || "300 Level"),
        availability:
          sp.availability ||
          userObj.availability ||
          "12–15 hrs/week (Afternoons)",
        skills: Array.isArray(sp.skills)
          ? sp.skills
          : Array.isArray(userObj.skills)
          ? userObj.skills
          : [],
        bio: sp.bio || userObj.bio || "",
        cvUrl: sp.cvUrl || sp.resumeUrl || userObj.cvUrl || "",
      });
    } else if (role === "EMPLOYER") {
      setEmployerProfileDraft({
        organizationName:
          ep.organizationName ||
          ep.companyName ||
          userObj.organizationName ||
          "",
        fullName:
          userObj.fullName || userObj.name || ep.contactName || "",
        email: userObj.email || "",
        phone: userObj.phone || ep.phone || "",
        industry:
          ep.industry || userObj.industry || "University Department / Unit",
        location: ep.location || userObj.location || "",
        website: ep.website || userObj.website || "",
        staffOrRegId:
          ep.staffOrRegId ||
          ep.registrationNumber ||
          userObj.staffOrRegId ||
          "",
        description: ep.description || userObj.description || "",
      });
    }
  }, []);

  // Fetch logged-in user's profile: GET /api/users/me
  const fetchCurrentUserProfile = useCallback(
    async (jwtToken) => {
      try {
        const res = await apiClient("/users/me", { token: jwtToken });
        const userObj = extractObject(res, ["user", "profile"]);
        if (userObj) {
          setCurrentUser(userObj);
          hydrateProfileDrafts(userObj);
        }
      } catch (err) {
        if (err.status === 401) {
          window.sessionStorage.removeItem("oau_jobs_jwt");
          setToken(null);
          setCurrentUser(null);
          setEntryStage("LOGIN");
          setFormError("Your session has expired. Please sign in again.");
        }
      }
    },
    [hydrateProfileDrafts]
  );

  useEffect(() => {
    if (token) {
      fetchCurrentUserProfile(token);
    }
  }, [token, fetchCurrentUserProfile]);

  // ============================================================================
  // 5. ROLE-BASED LIVE API DATA LOADER
  // ============================================================================
  const loadDashboardData = useCallback(async () => {
    if (!token || !currentUser) return;
    setLoadingData(true);
    setDataError("");

    const role = String(currentUser.role || "").toUpperCase();

    try {
      if (role === "STUDENT") {
        // 1. GET /api/jobs, 2. GET /api/applications/mine, 3. GET /api/jobs/saved
        const [jobsRes, appsRes, savedRes] = await Promise.allSettled([
          apiClient("/jobs", { token }),
          apiClient("/applications/mine", { token }),
          apiClient("/jobs/saved", { token }),
        ]);

        if (jobsRes.status === "fulfilled") {
          setJobs(extractList(jobsRes.value, ["jobs", "listings"]));
        } else {
          throw jobsRes.reason;
        }

        if (appsRes.status === "fulfilled") {
          setMyApplications(
            extractList(appsRes.value, ["applications", "items"])
          );
        }

        if (savedRes.status === "fulfilled") {
          const rawSaved = extractList(savedRes.value, [
            "savedJobs",
            "jobs",
            "items",
          ]);
          setSavedJobs(rawSaved.map((item) => item.job || item));
        }
      } else if (role === "EMPLOYER") {
        // GET /api/jobs/mine
        const mineRes = await apiClient("/jobs/mine", { token });
        const employerJobs = extractList(mineRes, ["jobs", "listings"]);
        setMyEmployerJobs(employerJobs);

        if (employerJobs.length > 0) {
          const activeJobId =
            selectedEmployerJobId &&
            employerJobs.some((j) => j.id === selectedEmployerJobId)
              ? selectedEmployerJobId
              : employerJobs[0].id;
          setSelectedEmployerJobId(activeJobId);

          // GET /api/applications/job/:jobId
          try {
            const appRes = await apiClient(`/applications/job/${activeJobId}`, {
              token,
            });
            setJobApplicants(
              extractList(appRes, ["applications", "applicants"])
            );
          } catch {
            setJobApplicants([]);
          }
        } else {
          setJobApplicants([]);
        }
      } else if (role === "ADMIN") {
        // 1. GET /api/admin/users
        // 2. GET /api/admin/employers/pending
        // 3. GET /api/admin/jobs
        // 4. GET /api/admin/reports
        const [usersRes, pendingEmpRes, allJobsRes, reportsRes] =
          await Promise.allSettled([
            apiClient("/admin/users", { token }),
            apiClient("/admin/employers/pending", { token }),
            apiClient("/admin/jobs", { token }),
            apiClient("/admin/reports", { token }),
          ]);

        if (usersRes.status === "fulfilled") {
          setAdminUsers(extractList(usersRes.value, ["users"]));
        }
        if (pendingEmpRes.status === "fulfilled") {
          setAdminPendingEmployers(
            extractList(pendingEmpRes.value, ["employers", "pendingEmployers"])
          );
        }
        if (allJobsRes.status === "fulfilled") {
          setAdminJobs(extractList(allJobsRes.value, ["jobs"]));
        }
        if (reportsRes.status === "fulfilled") {
          setAdminReports(extractList(reportsRes.value, ["reports"]));
        }
      }
    } catch (err) {
      setDataError(
        err.message || "Could not load records from the backend API."
      );
    } finally {
      setLoadingData(false);
    }
  }, [token, currentUser, selectedEmployerJobId]);

  useEffect(() => {
    if (token && currentUser) {
      loadDashboardData();
    }
  }, [token, currentUser, loadDashboardData]);

  // Load applicants when employer switches job filter: GET /api/applications/job/:jobId
  const handleSelectEmployerJobForApplicants = async (jobId) => {
    setSelectedEmployerJobId(jobId);
    if (!jobId) return;
    setLoadingData(true);
    try {
      const res = await apiClient(`/applications/job/${jobId}`, { token });
      setJobApplicants(extractList(res, ["applications", "applicants"]));
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Could not fetch applicants for this job.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  // ============================================================================
  // 6. AUTHENTICATION & PROFILE UPDATE HANDLERS
  // ============================================================================
  // POST /api/auth/login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);

    try {
      const res = await apiClient("/auth/login", {
        method: "POST",
        body: {
          email: loginForm.email.trim(),
          password: loginForm.password,
        },
      });

      const jwt =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.data?.accessToken;
      const userObj = extractObject(res, ["user"]);

      if (!jwt) {
        throw new Error("Login succeeded, but no JWT token was returned.");
      }

      window.sessionStorage.setItem("oau_jobs_jwt", jwt);
      setToken(jwt);
      if (userObj && userObj.role) {
        setCurrentUser(userObj);
        hydrateProfileDrafts(userObj);
      } else {
        await fetchCurrentUserProfile(jwt);
      }
      setActiveTab(0);
    } catch (err) {
      setFormError(
        err.message || "Invalid email or password. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // POST /api/auth/register
  const handleRegisterSubmit = async (e, roleType) => {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);

    const payload =
      roleType === "STUDENT"
        ? {
            role: "STUDENT",
            fullName: studentRegForm.fullName.trim(),
            name: studentRegForm.fullName.trim(),
            email: studentRegForm.email.trim(),
            phone: studentRegForm.phone.trim(),
            password: studentRegForm.password,
            matricNo: studentRegForm.matricNo.trim(),
            matricNumber: studentRegForm.matricNo.trim(),
            faculty: studentRegForm.faculty,
            department: studentRegForm.department.trim(),
            level: studentRegForm.level,
            availability: studentRegForm.availability,
            skills: studentRegForm.skills,
            bio: studentRegForm.bio.trim(),
            cvUrl: studentRegForm.cvUrl.trim() || undefined,
          }
        : {
            role: "EMPLOYER",
            organizationName: employerRegForm.organizationName.trim(),
            companyName: employerRegForm.organizationName.trim(),
            fullName: employerRegForm.fullName.trim(),
            name: employerRegForm.fullName.trim(),
            email: employerRegForm.email.trim(),
            phone: employerRegForm.phone.trim(),
            password: employerRegForm.password,
            industry: employerRegForm.industry,
            location: employerRegForm.location.trim(),
            website: employerRegForm.website.trim() || undefined,
            staffOrRegId: employerRegForm.staffOrRegId.trim(),
            registrationNumber: employerRegForm.staffOrRegId.trim(),
            description: employerRegForm.description.trim(),
          };

    try {
      const res = await apiClient("/auth/register", {
        method: "POST",
        body: payload,
      });

      const jwt =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.data?.accessToken;
      const userObj = extractObject(res, ["user"]);

      if (jwt) {
        window.sessionStorage.setItem("oau_jobs_jwt", jwt);
        setToken(jwt);
        if (userObj && userObj.role) {
          setCurrentUser(userObj);
          hydrateProfileDrafts(userObj);
        } else {
          await fetchCurrentUserProfile(jwt);
        }
        setActiveTab(0);
      } else {
        setSnackbar({
          open: true,
          message: "Account created successfully. Please sign in.",
        });
        setLoginForm({ email: payload.email, password: "" });
        setEntryStage("LOGIN");
      }
    } catch (err) {
      setFormError(
        err.message || "Registration failed. Please check your inputs."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // PATCH /api/users/me/student
  const handleSaveStudentProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setProfileSavedBanner(false);

    try {
      await apiClient("/users/me/student", {
        method: "PATCH",
        token,
        body: {
          fullName: studentProfileDraft.fullName.trim(),
          name: studentProfileDraft.fullName.trim(),
          phone: studentProfileDraft.phone.trim(),
          matricNo: studentProfileDraft.matricNo.trim(),
          matricNumber: studentProfileDraft.matricNo.trim(),
          faculty: studentProfileDraft.faculty,
          department: studentProfileDraft.department.trim(),
          level: studentProfileDraft.level,
          availability: studentProfileDraft.availability,
          skills: studentProfileDraft.skills,
          bio: studentProfileDraft.bio.trim(),
          cvUrl: studentProfileDraft.cvUrl.trim() || undefined,
        },
      });

      await fetchCurrentUserProfile(token);
      setProfileSavedBanner(true);
      setIsEditingProfile(false);
      setSnackbar({
        open: true,
        message: "Student profile updated on the server.",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to update student profile.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // PATCH /api/users/me/employer
  const handleSaveEmployerProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setProfileSavedBanner(false);

    try {
      await apiClient("/users/me/employer", {
        method: "PATCH",
        token,
        body: {
          organizationName: employerProfileDraft.organizationName.trim(),
          companyName: employerProfileDraft.organizationName.trim(),
          fullName: employerProfileDraft.fullName.trim(),
          name: employerProfileDraft.fullName.trim(),
          phone: employerProfileDraft.phone.trim(),
          industry: employerProfileDraft.industry,
          location: employerProfileDraft.location.trim(),
          website: employerProfileDraft.website.trim() || undefined,
          staffOrRegId: employerProfileDraft.staffOrRegId.trim(),
          registrationNumber: employerProfileDraft.staffOrRegId.trim(),
          description: employerProfileDraft.description.trim(),
        },
      });

      await fetchCurrentUserProfile(token);
      setProfileSavedBanner(true);
      setIsEditingProfile(false);
      setSnackbar({
        open: true,
        message: "Employer profile updated on the server.",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to update employer profile.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCustomSkillToProfile = () => {
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (!studentProfileDraft.skills.includes(clean)) {
      setStudentProfileDraft((prev) => ({
        ...prev,
        skills: [...prev.skills, clean],
      }));
    }
    setCustomSkillInput("");
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: "New password must be at least 6 characters.",
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: "New password and confirmation do not match.",
      });
      return;
    }
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordMenu(false);
    setSnackbar({
      open: true,
      message: "Password updated.",
    });
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("oau_jobs_jwt");
    }
    setToken(null);
    setCurrentUser(null);
    setSelectedJob(null);
    setEntryStage("WELCOME");
  };

  // ============================================================================
  // 7. JOBS, APPLICATIONS & ADMIN ENDPOINT HANDLERS
  // ============================================================================
  // GET /api/jobs/:id
  const handleInspectJobDetails = async (jobSummary) => {
    setSelectedJob(jobSummary);
    setLoadingJobDetail(true);
    try {
      const res = await apiClient(`/jobs/${jobSummary.id}`, { token });
      const detailed = extractObject(res, ["job", "listing"]);
      if (detailed && detailed.id) {
        setSelectedJob(detailed);
      }
    } catch {
      // Keep summary view if detail fetch fails
    } finally {
      setLoadingJobDetail(false);
    }
  };

  // POST /api/applications
  const handleApplyToJob = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    setActionLoading(true);
    setFormError("");

    try {
      await apiClient("/applications", {
        method: "POST",
        token,
        body: {
          jobId: selectedJob.id,
          coverMessage: coverMessage.trim(),
          coverLetter: coverMessage.trim(),
        },
      });
      setApplyModalOpen(false);
      setCoverMessage("");
      setSelectedJob(null);
      setActiveTab(1);
      setSnackbar({
        open: true,
        message: "Application submitted successfully!",
      });
      loadDashboardData();
    } catch (err) {
      setFormError(err.message || "Could not submit application.");
    } finally {
      setActionLoading(false);
    }
  };

  // POST /api/jobs/:id/save & DELETE /api/jobs/:id/save
  const handleToggleSaveJob = async (job) => {
    const isSaved = savedJobs.some((s) => (s.jobId || s.id) === job.id);
    try {
      if (isSaved) {
        await apiClient(`/jobs/${job.id}/save`, {
          method: "DELETE",
          token,
        });
        setSnackbar({
          open: true,
          message: `Removed "${job.title}" from Saved Jobs.`,
        });
      } else {
        await apiClient(`/jobs/${job.id}/save`, {
          method: "POST",
          token,
        });
        setSnackbar({
          open: true,
          message: `Saved "${job.title}" to your bookmarked list.`,
        });
      }
      loadDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Could not update saved job.",
      });
    }
  };

  // POST /api/jobs/:id/report
  const handleReportJobSubmit = async (e) => {
    e.preventDefault();
    if (!reportModalJob) return;
    setActionLoading(true);
    try {
      await apiClient(`/jobs/${reportModalJob.id}/report`, {
        method: "POST",
        token,
        body: {
          reason: reportReason.trim(),
          description: reportReason.trim(),
        },
      });
      setReportModalJob(null);
      setReportReason("");
      setSnackbar({
        open: true,
        message: "Report submitted to platform administrators.",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to submit report.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // POST /api/jobs & PATCH /api/jobs/:id
  const handleCreateOrUpdateJob = async (e) => {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);

    const parsedSkills = jobForm.requiredSkillsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: jobForm.title.trim(),
      category: jobForm.category,
      employmentType: jobForm.employmentType,
      type: jobForm.employmentType,
      location: jobForm.location.trim(),
      compensation: jobForm.compensation.trim(),
      salary: jobForm.compensation.trim(),
      deadline: jobForm.deadline
        ? new Date(jobForm.deadline).toISOString()
        : undefined,
      requiredSkills: parsedSkills,
      skills: parsedSkills,
      description: jobForm.description.trim(),
    };

    try {
      if (editingJob) {
        await apiClient(`/jobs/${editingJob.id}`, {
          method: "PATCH",
          token,
          body: payload,
        });
        setSnackbar({
          open: true,
          message: `Updated "${jobForm.title}" successfully.`,
        });
      } else {
        await apiClient("/jobs", {
          method: "POST",
          token,
          body: payload,
        });
        setSnackbar({
          open: true,
          message: `Published "${jobForm.title}" to the job board.`,
        });
      }

      setEditingJob(null);
      setJobForm({
        title: "",
        category: "Tech & IT",
        employmentType: "Part-Time",
        location: "",
        compensation: "",
        deadline: "",
        requiredSkillsCsv: "",
        description: "",
      });
      setActiveTab(2);
      loadDashboardData();
    } catch (err) {
      setFormError(
        err.message ||
          "Could not publish job. Verify that your employer account is approved."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || "",
      category: job.category || "Tech & IT",
      employmentType: job.employmentType || job.type || "Part-Time",
      location: job.location || "",
      compensation: job.compensation || job.salary || "",
      deadline: job.deadline ? String(job.deadline).split("T")[0] : "",
      requiredSkillsCsv: (job.requiredSkills || job.skills || []).join(", "),
      description: job.description || "",
    });
    setFormError("");
    setActiveTab(1);
  };

  // PATCH /api/jobs/:id/close
  const handleCloseJob = (job) => {
    setConfirmDialog({
      open: true,
      title: `Close applications for "${job.title}"?`,
      description:
        "Students will no longer be able to submit new applications to this listing.",
      confirmLabel: "Close Job",
      onConfirm: async () => {
        try {
          await apiClient(`/jobs/${job.id}/close`, {
            method: "PATCH",
            token,
          });
          setSnackbar({ open: true, message: "Job listing closed." });
          loadDashboardData();
        } catch (err) {
          setSnackbar({
            open: true,
            message: err.message || "Could not close job.",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // DELETE /api/jobs/:id
  const handleDeleteJob = (job) => {
    setConfirmDialog({
      open: true,
      title: `Delete "${job.title}" permanently?`,
      description:
        "This will permanently remove the job listing. This action cannot be undone.",
      confirmLabel: "Delete Job",
      onConfirm: async () => {
        try {
          await apiClient(`/jobs/${job.id}`, {
            method: "DELETE",
            token,
          });
          setSnackbar({ open: true, message: "Job listing deleted." });
          loadDashboardData();
        } catch (err) {
          setSnackbar({
            open: true,
            message: err.message || "Could not delete job.",
          });
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // PATCH /api/applications/:applicationId/status
  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      await apiClient(`/applications/${applicationId}/status`, {
        method: "PATCH",
        token,
        body: { status },
      });
      setInspectApplicant(null);
      setSnackbar({
        open: true,
        message: `Applicant status updated to ${status}.`,
      });
      if (selectedEmployerJobId) {
        handleSelectEmployerJobForApplicants(selectedEmployerJobId);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to update applicant status.",
      });
    }
  };

  // ADMIN: PATCH /api/admin/users/:id/role
  const handleAdminChangeUserRole = async (userId, newRole) => {
    try {
      await apiClient(`/admin/users/${userId}/role`, {
        method: "PATCH",
        token,
        body: { role: newRole },
      });
      setSnackbar({
        open: true,
        message: `Updated user role to ${newRole}.`,
      });
      loadDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Could not change user role.",
      });
    }
  };

  // ADMIN: PATCH /api/admin/employers/:id/verification
  const handleAdminEmployerDecision = async (employerId, decision) => {
    const isApproved = decision === "VERIFIED" || decision === "APPROVED";
    try {
      await apiClient(`/admin/employers/${employerId}/verification`, {
        method: "PATCH",
        token,
        body: {
          status: decision,
          verificationStatus: decision,
          verified: isApproved,
        },
      });
      setInspectEmployer(null);
      setSnackbar({
        open: true,
        message: `Employer verification updated (${decision}).`,
      });
      loadDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to update employer verification.",
      });
    }
  };

  // ADMIN: PATCH /api/admin/jobs/:id/moderation
  const handleAdminModerationDecision = async (jobId, statusAction) => {
    try {
      await apiClient(`/admin/jobs/${jobId}/moderation`, {
        method: "PATCH",
        token,
        body: { status: statusAction },
      });
      setInspectJob(null);
      setSnackbar({
        open: true,
        message: `Job moderation status updated to ${statusAction}.`,
      });
      loadDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to moderate job listing.",
      });
    }
  };

  // ADMIN: PATCH /api/admin/reports/:id/review
  const handleAdminProcessReport = async (reportId, statusDecision) => {
    try {
      await apiClient(`/admin/reports/${reportId}/review`, {
        method: "PATCH",
        token,
        body: { status: statusDecision },
      });
      setInspectReport(null);
      setSnackbar({
        open: true,
        message: `Report marked as ${statusDecision}.`,
      });
      loadDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to review report.",
      });
    }
  };

  // ============================================================================
  // 8. DERIVED FILTERING
  // ============================================================================
  const userRole = String(currentUser?.role || "STUDENT").toUpperCase();

  const isEmployerVerified =
    currentUser?.verified === true ||
    currentUser?.verificationStatus === "VERIFIED" ||
    currentUser?.verificationStatus === "APPROVED" ||
    currentUser?.employerProfile?.verified === true ||
    currentUser?.employerProfile?.verificationStatus === "VERIFIED" ||
    currentUser?.employerProfile?.verificationStatus === "APPROVED";

  const filteredStudentJobs = jobs.filter((job) => {
    const q = searchQuery.trim().toLowerCase();
    const empName =
      job.employer?.organizationName ||
      job.employer?.companyName ||
      job.employerName ||
      "";
    const skills = job.requiredSkills || job.skills || [];
    const matchesQ =
      !q ||
      job.title?.toLowerCase().includes(q) ||
      empName.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      skills.some((s) => String(s).toLowerCase().includes(q));
    const matchesCat =
      categoryFilter === "ALL" || job.category === categoryFilter;
    const matchesType =
      typeFilter === "ALL" ||
      (job.employmentType || job.type) === typeFilter;
    const matchesLoc =
      locationFilter === "ALL" ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesQ && matchesCat && matchesType && matchesLoc;
  });

  const hasActiveStudentFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    locationFilter !== "ALL";

  const filteredEmployerApplicants = jobApplicants.filter((app) => {
    return empStatusFilter === "ALL" || app.status === empStatusFilter;
  });

  const filteredAdminUsers = adminUsers.filter((u) => {
    return adminRoleFilter === "ALL" || u.role === adminRoleFilter;
  });

  // Shared Settings Section
  const renderSettingsSection = (roleLabel) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
      }}
    >
      <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
          <KeyRound size={20} color="#1E40AF" />
          <Typography variant="h6">Account Security</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Manage your password and authentication credentials for{" "}
          <strong>{currentUser.email}</strong>.
        </Typography>

        {!showPasswordMenu ? (
          <Button
            variant="outlined"
            startIcon={<Lock size={16} />}
            onClick={() => setShowPasswordMenu(true)}
          >
            Change Password
          </Button>
        ) : (
          <Box
            component="form"
            onSubmit={handlePasswordUpdate}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 2.5,
              bgcolor: "#F8FAFC",
              borderRadius: 2,
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Update Password
            </Typography>
            <TextField
              label="Current Password"
              type="password"
              required
              size="small"
              fullWidth
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
            />
            <TextField
              label="New Password"
              type="password"
              required
              size="small"
              fullWidth
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
            />
            <TextField
              label="Confirm New Password"
              type="password"
              required
              size="small"
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setShowPasswordMenu(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="small">
                Save New Password
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
          <Bell size={20} color="#1E40AF" />
          <Typography variant="h6">Preferences & Session</Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifSettings.applicationUpdates}
                onChange={(e) =>
                  setNotifSettings({
                    ...notifSettings,
                    applicationUpdates: e.target.checked,
                  })
                }
              />
            }
            label="Receive status notifications for applications and listings"
          />
          <FormControlLabel
            control={
              <Switch
                checked={notifSettings.newJobDigest}
                onChange={(e) =>
                  setNotifSettings({
                    ...notifSettings,
                    newJobDigest: e.target.checked,
                  })
                }
              />
            }
            label="Receive email alerts for new campus job opportunities"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Session Control
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Signed in as{" "}
          <strong>
            {currentUser.fullName || currentUser.name || currentUser.email}
          </strong>{" "}
          ({roleLabel}).
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogOut size={16} />}
          onClick={handleLogout}
          fullWidth={isMobile}
        >
          Sign Out / Logout
        </Button>
      </Paper>
    </Box>
  );

  // ============================================================================
  // 9. SCREEN 1: PUBLIC ENTRY FLOW
  // ============================================================================
  if (!currentUser) {
    return (
      <ThemeProvider theme={constitutionalTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "#F1F5F9",
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
          }}
        >
          <AppBar position="static">
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
              <Toolbar
                disableGutters
                sx={{
                  justifyContent: "space-between",
                  py: 1,
                }}
              >
                <Box
                  onClick={() => setEntryStage("WELCOME")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    cursor: "pointer",
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      bgcolor: "#0B192C",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Briefcase size={18} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, lineHeight: 1.1 }}
                    >
                      OAU Campus Jobs
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: { xs: "none", sm: "block" } }}
                    >
                      Obafemi Awolowo University, Ile-Ife
                    </Typography>
                  </Box>
                </Box>

                {entryStage !== "LOGIN" && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setFormError("");
                      setEntryStage("LOGIN");
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </Toolbar>
            </Container>
          </AppBar>

          <Container
            maxWidth="xl"
            sx={{
              px: { xs: 1.5, sm: 3 },
              py: { xs: 2, md: 5 },
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {entryStage === "ONBOARDING" ? (
              <Paper
                sx={{
                  width: "100%",
                  maxWidth: 1140,
                  borderRadius: { xs: "18px", md: "24px" },
                  overflow: "hidden",
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
                }}
              >
                <Box
                  sx={{
                    bgcolor: "#0B192C",
                    color: "#FFFFFF",
                    p: { xs: 3, sm: 4, md: 6 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Chip
                      label={`Step ${onboardingSlide + 1} of 3`}
                      size="small"
                      sx={{
                        bgcolor: "#1E293B",
                        color: "#93C5FD",
                        border: "1px solid #334155",
                        mb: 2.5,
                      }}
                    />
                    <Typography
                      variant="h3"
                      sx={{ color: "#FFFFFF", mb: 1.5, lineHeight: 1.2 }}
                    >
                      {onboardingSlide === 0 &&
                        "Campus Jobs Built Around Your Lecture Schedule."}
                      {onboardingSlide === 1 &&
                        "Verified Departments & Campus Employers."}
                      {onboardingSlide === 2 &&
                        "One Student Profile. Instant Status Tracking."}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#94A3B8" }}>
                      {onboardingSlide === 0 &&
                        "Discover verified part-time roles across INTECU, faculty research labs, the library, and Student Union enterprises."}
                      {onboardingSlide === 1 &&
                        "Every employer registration is vetted before job vacancies go live on the student job board."}
                      {onboardingSlide === 2 &&
                        "Submit applications with your skills and CV, then track every update from Pending to Shortlisted and Accepted."}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                    {[0, 1, 2].map((idx) => (
                      <Box
                        key={idx}
                        sx={{
                          height: 8,
                          width: onboardingSlide === idx ? 32 : 10,
                          borderRadius: 99,
                          bgcolor:
                            onboardingSlide === idx ? "#3B82F6" : "#334155",
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: { xs: 3, sm: 4, md: 6 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    bgcolor: "#FFFFFF",
                    gap: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Paper sx={{ p: 2.5, bgcolor: "#F8FAFC" }}>
                      <GraduationCap size={24} color="#1E40AF" />
                      <Typography variant="h6" sx={{ mt: 1, mb: 0.5 }}>
                        For OAU Students
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Filter by category, campus location, or schedule and
                        apply in one click.
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2.5, bgcolor: "#F8FAFC" }}>
                      <Building2 size={24} color="#15803D" />
                      <Typography variant="h6" sx={{ mt: 1, mb: 0.5 }}>
                        For Campus Employers
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Publish roles once verified and manage student
                        applications directly.
                      </Typography>
                    </Paper>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1.5,
                      pt: 2,
                      borderTop: "1px solid #E2E8F0",
                    }}
                  >
                    <Button variant="text" onClick={handleCompleteOnboarding}>
                      Skip
                    </Button>
                    {onboardingSlide < 2 ? (
                      <Button
                        variant="contained"
                        endIcon={<ArrowRight size={16} />}
                        onClick={() => setOnboardingSlide((s) => s + 1)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        endIcon={<ArrowRight size={16} />}
                        onClick={handleCompleteOnboarding}
                      >
                        Get Started
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Paper
                sx={{
                  width: "100%",
                  maxWidth: 1140,
                  borderRadius: { xs: "18px", md: "24px" },
                  overflow: "hidden",
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
                }}
              >
                <Box
                  sx={{
                    bgcolor: "#0B192C",
                    color: "#FFFFFF",
                    p: { xs: 3, sm: 4, md: 6 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 99,
                        bgcolor: "#1E293B",
                        border: "1px solid #334155",
                        mb: 2,
                      }}
                    >
                      <GraduationCap size={15} color="#60A5FA" />
                      <Typography
                        variant="caption"
                        sx={{ color: "#E2E8F0", fontWeight: 600 }}
                      >
                        OAU Campus Jobs
                      </Typography>
                    </Box>

                    <Typography
                      variant="h3"
                      sx={{ color: "#FFFFFF", mb: 1.5, lineHeight: 1.18 }}
                    >
                      Verified campus work that fits your lecture hours.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#94A3B8", mb: { xs: 1, md: 3 } }}
                    >
                      Connect directly with OAU departments, research units, and
                      student-friendly campus businesses.
                    </Typography>

                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        flexDirection: "column",
                        gap: 1.5,
                        mt: 2,
                      }}
                    >
                      {[
                        "Flexible afternoon and weekend shifts",
                        "Verified campus departments and employers",
                        "Transparent monthly stipends and application tracking",
                      ].map((item) => (
                        <Box
                          key={item}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                          }}
                        >
                          <Check size={15} color="#93C5FD" />
                          <Typography variant="body2" sx={{ color: "#E2E8F0" }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      pt: 2,
                      borderTop: "1px solid #1E293B",
                      display: { xs: "none", md: "flex" },
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                      Obafemi Awolowo University, Ile-Ife
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                      OAU Campus Jobs
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: { xs: 2.5, sm: 4, md: 6 },
                    bgcolor: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  {!serverHealthy && (
                    <Alert severity="info" sx={{ mb: 2.5 }}>
                      Connecting to OAU Campus Jobs server on Render. The first
                      request may take a few seconds to wake the server.
                    </Alert>
                  )}

                  {entryStage === "WELCOME" && (
                    <Box>
                      <Typography variant="h4" gutterBottom>
                        Welcome to OAU Campus Jobs
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Sign in to your account or register as a Student or
                        Employer to get started.
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Paper
                          onClick={() => {
                            setFormError("");
                            setEntryStage("LOGIN");
                          }}
                          sx={{
                            p: { xs: 2, sm: 2.5 },
                            cursor: "pointer",
                            border: "2px solid #1E40AF",
                            bgcolor: "#F8FAFC",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            "&:hover": { bgcolor: "#EFF6FF" },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{ bgcolor: "#1E40AF", width: 42, height: 42 }}
                            >
                              <Lock size={18} />
                            </Avatar>
                            <Box>
                              <Typography variant="h6">Sign In</Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Log in to your existing account
                              </Typography>
                            </Box>
                          </Box>
                          <ArrowRight size={20} color="#1E40AF" />
                        </Paper>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 2,
                          }}
                        >
                          <Paper
                            onClick={() => {
                              setFormError("");
                              setEntryStage("REGISTER_STUDENT");
                            }}
                            sx={{
                              p: 2.5,
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: 1.5,
                              "&:hover": { borderColor: "#1E40AF" },
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "#DBEAFE",
                                color: "#1E40AF",
                                width: 40,
                                height: 40,
                              }}
                            >
                              <GraduationCap size={20} />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Register as a Student
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Create your student profile and apply for campus
                                jobs.
                              </Typography>
                            </Box>
                          </Paper>

                          <Paper
                            onClick={() => {
                              setFormError("");
                              setEntryStage("REGISTER_EMPLOYER");
                            }}
                            sx={{
                              p: 2.5,
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: 1.5,
                              "&:hover": { borderColor: "#1E40AF" },
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "#E0E7FF",
                                color: "#1E40AF",
                                width: 40,
                                height: 40,
                              }}
                            >
                              <Building2 size={20} />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Register as an Employer
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Register your department or business to hire
                                students.
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {entryStage === "LOGIN" && (
                    <Box>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setEntryStage("WELCOME")}
                        sx={{ mb: 1, pl: 0 }}
                      >
                        ← Back to Welcome Screen
                      </Button>
                      <Typography variant="h4" gutterBottom>
                        Sign In
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Enter your registered email and password to access your
                        account.
                      </Typography>

                      {formError && (
                        <Alert severity="error" sx={{ mb: 2.5 }}>
                          {formError}
                        </Alert>
                      )}

                      <Box
                        component="form"
                        onSubmit={handleLoginSubmit}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Email Address"
                          type="email"
                          required
                          fullWidth
                          value={loginForm.email}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              email: e.target.value,
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Mail size={17} color="#64748B" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          label="Password"
                          type="password"
                          required
                          fullWidth
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              password: e.target.value,
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock size={17} color="#64748B" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={actionLoading}
                          fullWidth
                        >
                          {actionLoading ? "Signing In..." : "Sign In"}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {entryStage === "REGISTER_STUDENT" && (
                    <Box>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setEntryStage("WELCOME")}
                        sx={{ mb: 1, pl: 0 }}
                      >
                        ← Back to Welcome Screen
                      </Button>
                      <Typography variant="h4" gutterBottom>
                        Student Registration
                      </Typography>

                      {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {formError}
                        </Alert>
                      )}

                      <Box
                        component="form"
                        onSubmit={(e) => handleRegisterSubmit(e, "STUDENT")}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          mt: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 2,
                          }}
                        >
                          <TextField
                            label="Full Name"
                            required
                            size="small"
                            fullWidth
                            value={studentRegForm.fullName}
                            onChange={(e) =>
                              setStudentRegForm({
                                ...studentRegForm,
                                fullName: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Matriculation Number"
                            required
                            size="small"
                            fullWidth
                            placeholder="CSC/2023/1042"
                            value={studentRegForm.matricNo}
                            onChange={(e) =>
                              setStudentRegForm({
                                ...studentRegForm,
                                matricNo: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="University Email"
                            type="email"
                            required
                            size="small"
                            fullWidth
                            value={studentRegForm.email}
                            onChange={(e) =>
                              setStudentRegForm({
                                ...studentRegForm,
                                email: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Phone Number"
                            required
                            size="small"
                            fullWidth
                            value={studentRegForm.phone}
                            onChange={(e) =>
                              setStudentRegForm({
                                ...studentRegForm,
                                phone: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Department"
                            required
                            size="small"
                            fullWidth
                            value={studentRegForm.department}
                            onChange={(e) =>
                              setStudentRegForm({
                                ...studentRegForm,
                                department: e.target.value,
                              })
                            }
                          />
                          <FormControl size="small" fullWidth>
                            <InputLabel id="reg-lvl">Level</InputLabel>
                            <Select
                              labelId="reg-lvl"
                              label="Level"
                              value={studentRegForm.level}
                              onChange={(e) =>
                                setStudentRegForm({
                                  ...studentRegForm,
                                  level: e.target.value,
                                })
                              }
                            >
                              <MenuItem value="100 Level">100 Level</MenuItem>
                              <MenuItem value="200 Level">200 Level</MenuItem>
                              <MenuItem value="300 Level">300 Level</MenuItem>
                              <MenuItem value="400 Level">400 Level</MenuItem>
                              <MenuItem value="500 Level">500 Level</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 700, display: "block", mb: 1 }}
                          >
                            Select Your Skills (Tap to toggle)
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.75,
                            }}
                          >
                            {DEFAULT_SKILLS.map((sk) => {
                              const selected =
                                studentRegForm.skills.includes(sk);
                              return (
                                <Chip
                                  key={sk}
                                  label={sk}
                                  size="small"
                                  color={selected ? "primary" : "default"}
                                  variant={selected ? "filled" : "outlined"}
                                  onClick={() =>
                                    setStudentRegForm((prev) => ({
                                      ...prev,
                                      skills: prev.skills.includes(sk)
                                        ? prev.skills.filter((i) => i !== sk)
                                        : [...prev.skills, sk],
                                    }))
                                  }
                                />
                              );
                            })}
                          </Box>
                        </Box>

                        <TextField
                          label="Password"
                          type="password"
                          required
                          size="small"
                          fullWidth
                          value={studentRegForm.password}
                          onChange={(e) =>
                            setStudentRegForm({
                              ...studentRegForm,
                              password: e.target.value,
                            })
                          }
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={actionLoading}
                          fullWidth
                        >
                          {actionLoading
                            ? "Creating Account..."
                            : "Complete Student Registration"}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {entryStage === "REGISTER_EMPLOYER" && (
                    <Box>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setEntryStage("WELCOME")}
                        sx={{ mb: 1, pl: 0 }}
                      >
                        ← Back to Welcome Screen
                      </Button>
                      <Typography variant="h4" gutterBottom>
                        Employer Registration
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        New employer accounts start in{" "}
                        <strong>Verification Pending</strong> status until
                        approved by an administrator.
                      </Alert>

                      {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {formError}
                        </Alert>
                      )}

                      <Box
                        component="form"
                        onSubmit={(e) => handleRegisterSubmit(e, "EMPLOYER")}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 2,
                          }}
                        >
                          <TextField
                            label="Organization / Department Name"
                            required
                            size="small"
                            fullWidth
                            value={employerRegForm.organizationName}
                            onChange={(e) =>
                              setEmployerRegForm({
                                ...employerRegForm,
                                organizationName: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Contact Person Name"
                            required
                            size="small"
                            fullWidth
                            value={employerRegForm.fullName}
                            onChange={(e) =>
                              setEmployerRegForm({
                                ...employerRegForm,
                                fullName: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Official Email"
                            type="email"
                            required
                            size="small"
                            fullWidth
                            value={employerRegForm.email}
                            onChange={(e) =>
                              setEmployerRegForm({
                                ...employerRegForm,
                                email: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Phone Number"
                            required
                            size="small"
                            fullWidth
                            value={employerRegForm.phone}
                            onChange={(e) =>
                              setEmployerRegForm({
                                ...employerRegForm,
                                phone: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Campus Location / Building"
                            required
                            size="small"
                            fullWidth
                            value={employerRegForm.location}
                            onChange={(e) =>
                              setEmployerRegForm({
                                ...employerRegForm,
                                location: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Staff ID / CAC Registration ID"
                            required
                            size="small"
                            fullWidth
                            value={employerRegForm.staffOrRegId}
                            onChange={(e) =>
                              setEmployerRegForm({
                                ...employerRegForm,
                                staffOrRegId: e.target.value,
                              })
                            }
                          />
                        </Box>
                        <TextField
                          label="Organization Description"
                          multiline
                          rows={2}
                          required
                          size="small"
                          fullWidth
                          value={employerRegForm.description}
                          onChange={(e) =>
                            setEmployerRegForm({
                              ...employerRegForm,
                              description: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Create Password"
                          type="password"
                          required
                          size="small"
                          fullWidth
                          value={employerRegForm.password}
                          onChange={(e) =>
                            setEmployerRegForm({
                              ...employerRegForm,
                              password: e.target.value,
                            })
                          }
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={actionLoading}
                          fullWidth
                        >
                          {actionLoading
                            ? "Submitting..."
                            : "Submit Employer Registration"}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // ============================================================================
  // 10. AUTHENTICATED PORTALS (100% Live API Backed)
  // ============================================================================
  return (
    <ThemeProvider theme={constitutionalTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          pb: isMobile ? 11 : 6,
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        <AppBar position="sticky">
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
            <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      bgcolor: "#0B192C",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Briefcase size={18} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    OAU Campus Jobs
                  </Typography>
                </Box>

                {!isMobile && userRole === "STUDENT" && (
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => {
                      setSelectedJob(null);
                      setActiveTab(v);
                    }}
                  >
                    <Tab
                      icon={<Search size={16} />}
                      iconPosition="start"
                      label="Browse Jobs"
                    />
                    <Tab
                      icon={<FileText size={16} />}
                      iconPosition="start"
                      label={`My Applications (${myApplications.length})`}
                    />
                    <Tab
                      icon={<Bookmark size={16} />}
                      iconPosition="start"
                      label={`Saved Jobs (${savedJobs.length})`}
                    />
                    <Tab
                      icon={<User size={16} />}
                      iconPosition="start"
                      label="Student Profile"
                    />
                    <Tab
                      icon={<Settings size={16} />}
                      iconPosition="start"
                      label="Settings"
                    />
                  </Tabs>
                )}

                {!isMobile && userRole === "EMPLOYER" && (
                  <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                    <Tab
                      icon={<LayoutDashboard size={16} />}
                      iconPosition="start"
                      label="Overview"
                    />
                    <Tab
                      icon={<PlusCircle size={16} />}
                      iconPosition="start"
                      label={editingJob ? "Edit Job" : "Create Job"}
                    />
                    <Tab
                      icon={<Briefcase size={16} />}
                      iconPosition="start"
                      label={`My Listings (${myEmployerJobs.length})`}
                    />
                    <Tab
                      icon={<Users size={16} />}
                      iconPosition="start"
                      label={`Applicants (${jobApplicants.length})`}
                    />
                    <Tab
                      icon={<Building2 size={16} />}
                      iconPosition="start"
                      label="Employer Profile"
                    />
                    <Tab
                      icon={<Settings size={16} />}
                      iconPosition="start"
                      label="Settings"
                    />
                  </Tabs>
                )}

                {!isMobile && userRole === "ADMIN" && (
                  <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                    <Tab
                      icon={<Users size={16} />}
                      iconPosition="start"
                      label={`Users (${adminUsers.length})`}
                    />
                    <Tab
                      icon={<ShieldCheck size={16} />}
                      iconPosition="start"
                      label={`Pending Employers (${adminPendingEmployers.length})`}
                    />
                    <Tab
                      icon={<Briefcase size={16} />}
                      iconPosition="start"
                      label={`Jobs (${adminJobs.length})`}
                    />
                    <Tab
                      icon={<Flag size={16} />}
                      iconPosition="start"
                      label={`Reports (${adminReports.length})`}
                    />
                    <Tab
                      icon={<Settings size={16} />}
                      iconPosition="start"
                      label="Settings"
                    />
                  </Tabs>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<RefreshCw size={14} />}
                  onClick={loadDashboardData}
                  disabled={loadingData}
                >
                  Refresh
                </Button>
                <Chip
                  icon={<User size={14} />}
                  label={
                    employerProfileDraft.organizationName ||
                    studentProfileDraft.fullName ||
                    currentUser.fullName ||
                    currentUser.email ||
                    userRole
                  }
                  size="small"
                  variant="outlined"
                  sx={{
                    maxWidth: { xs: 140, sm: 240 },
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        <Container
          maxWidth="xl"
          sx={{ px: { xs: 1.5, sm: 3 }, pt: { xs: 2, md: 4 }, flex: 1 }}
        >
          {dataError && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={loadDashboardData}
                >
                  Retry
                </Button>
              }
            >
              {dataError}
            </Alert>
          )}

          {/* ====================================================================
              ROLE 1: STUDENT PORTAL
             ==================================================================== */}
          {userRole === "STUDENT" && (
            <>
              {activeTab === 0 && (
                <>
                  {selectedJob ? (
                    <Paper sx={{ p: { xs: 2, sm: 4 } }}>
                      <Button
                        variant="text"
                        onClick={() => setSelectedJob(null)}
                        sx={{ mb: 1.5, pl: 0 }}
                      >
                        ← Back to Job Listings
                      </Button>

                      {loadingJobDetail && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <CircularProgress size={16} />
                          <Typography variant="caption" color="text.secondary">
                            Loading full job details...
                          </Typography>
                        </Box>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 1.5,
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="h4" gutterBottom>
                            {selectedJob.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {selectedJob.employer?.organizationName ||
                              selectedJob.employer?.companyName ||
                              selectedJob.employerName ||
                              "Verified Campus Employer"}{" "}
                            • {selectedJob.location}
                          </Typography>
                        </Box>
                        <StatusBadge status={selectedJob.status || "OPEN"} />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr 1fr",
                            sm: "repeat(4, 1fr)",
                          },
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Compensation
                          </Typography>
                          <Typography variant="body1" fontWeight={700}>
                            {selectedJob.compensation ||
                              selectedJob.salary ||
                              "Competitive"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Employment Type
                          </Typography>
                          <Typography variant="body1" fontWeight={700}>
                            {selectedJob.employmentType ||
                              selectedJob.type ||
                              "Part-Time"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Category
                          </Typography>
                          <Typography variant="body1" fontWeight={700}>
                            {selectedJob.category || "General"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Deadline
                          </Typography>
                          <Typography variant="body1" fontWeight={700}>
                            {selectedJob.deadline
                              ? String(selectedJob.deadline).split("T")[0]
                              : "Open"}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="h6" gutterBottom>
                        Role Description & Responsibilities
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {selectedJob.description}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Required Skills
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {(
                          selectedJob.requiredSkills ||
                          selectedJob.skills ||
                          []
                        ).map((sk) => (
                          <Chip key={sk} label={sk} size="small" />
                        ))}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1.5,
                          mt: 3.5,
                        }}
                      >
                        <Button
                          variant="contained"
                          disabled={
                            String(selectedJob.status || "OPEN").toUpperCase() !==
                            "OPEN"
                          }
                          startIcon={<Send size={16} />}
                          onClick={() => setApplyModalOpen(true)}
                          fullWidth={isMobile}
                        >
                          Apply for This Job
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={
                            savedJobs.some((s) => s.id === selectedJob.id) ? (
                              <BookmarkCheck size={16} />
                            ) : (
                              <Bookmark size={16} />
                            )
                          }
                          onClick={() => handleToggleSaveJob(selectedJob)}
                          fullWidth={isMobile}
                        >
                          {savedJobs.some((s) => s.id === selectedJob.id)
                            ? "Saved"
                            : "Save Job"}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Flag size={16} />}
                          onClick={() => setReportModalJob(selectedJob)}
                          fullWidth={isMobile}
                        >
                          Report Listing
                        </Button>
                      </Box>
                    </Paper>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                      }}
                    >
                      <Paper
                        sx={{
                          p: { xs: 2.5, sm: 3.5 },
                          bgcolor: "#0B192C",
                          color: "#FFFFFF",
                        }}
                      >
                        <Typography variant="h4" sx={{ color: "#FFFFFF" }}>
                          Available OAU Campus Jobs
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#94A3B8", mt: 0.5 }}
                        >
                          Browse verified departmental, research, and part-time
                          opportunities across campus.
                        </Typography>
                      </Paper>

                      <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "1fr 1fr",
                              md: "2fr 1fr 1fr 1fr",
                            },
                            gap: 1.5,
                          }}
                        >
                          <TextField
                            label="Search job title, skill, or department"
                            size="small"
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Search size={16} color="#64748B" />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <FormControl fullWidth size="small">
                            <InputLabel id="s-cat">Category</InputLabel>
                            <Select
                              labelId="s-cat"
                              label="Category"
                              value={categoryFilter}
                              onChange={(e) =>
                                setCategoryFilter(e.target.value)
                              }
                            >
                              <MenuItem value="ALL">All Categories</MenuItem>
                              <MenuItem value="Tech & IT">Tech & IT</MenuItem>
                              <MenuItem value="Media & Design">
                                Media & Design
                              </MenuItem>
                              <MenuItem value="Academic & Research">
                                Academic & Research
                              </MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl fullWidth size="small">
                            <InputLabel id="s-type">Schedule</InputLabel>
                            <Select
                              labelId="s-type"
                              label="Schedule"
                              value={typeFilter}
                              onChange={(e) => setTypeFilter(e.target.value)}
                            >
                              <MenuItem value="ALL">All Schedules</MenuItem>
                              <MenuItem value="Part-Time">Part-Time</MenuItem>
                              <MenuItem value="Flexible">Flexible</MenuItem>
                              <MenuItem value="Contract">Contract</MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl fullWidth size="small">
                            <InputLabel id="s-loc">Campus Location</InputLabel>
                            <Select
                              labelId="s-loc"
                              label="Campus Location"
                              value={locationFilter}
                              onChange={(e) =>
                                setLocationFilter(e.target.value)
                              }
                            >
                              <MenuItem value="ALL">All Locations</MenuItem>
                              <MenuItem value="Computer">
                                Computer Building
                              </MenuItem>
                              <MenuItem value="SUB">SUB Complex</MenuItem>
                              <MenuItem value="Mathematics">
                                Mathematics Building
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        {hasActiveStudentFilters && (
                          <Box
                            sx={{
                              mt: 2,
                              pt: 1.5,
                              borderTop: "1px solid #E2E8F0",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Showing {filteredStudentJobs.length} matching
                              role(s)
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<FilterX size={15} />}
                              onClick={() => {
                                setSearchQuery("");
                                setCategoryFilter("ALL");
                                setTypeFilter("ALL");
                                setLocationFilter("ALL");
                              }}
                            >
                              Clear All Filters
                            </Button>
                          </Box>
                        )}
                      </Paper>

                      {loadingData ? (
                        <Paper sx={{ p: 5, textAlign: "center" }}>
                          <CircularProgress size={28} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1.5 }}
                          >
                            Fetching available jobs from backend...
                          </Typography>
                        </Paper>
                      ) : filteredStudentJobs.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: "center" }}>
                          <Typography variant="h6" gutterBottom>
                            No matching job listings found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try adjusting your search filters or refreshing the
                            feed.
                          </Typography>
                        </Paper>
                      ) : (
                        filteredStudentJobs.map((job) => {
                          const isSaved = savedJobs.some(
                            (s) => s.id === job.id
                          );
                          const hasApplied = myApplications.some(
                            (a) => (a.jobId || a.job?.id) === job.id
                          );
                          const empName =
                            job.employer?.organizationName ||
                            job.employer?.companyName ||
                            job.employerName ||
                            "Campus Employer";

                          return (
                            <Paper
                              key={job.id}
                              sx={{
                                p: { xs: 2, sm: 3.5 },
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr",
                                  md: "8fr 4fr",
                                },
                                gap: 2.5,
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  <Typography variant="h6">
                                    {job.title}
                                  </Typography>
                                  <StatusBadge status={job.status || "OPEN"} />
                                </Box>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: { xs: 1.2, sm: 2 },
                                    color: "text.secondary",
                                    mb: 1.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Building2 size={15} />
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {empName}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <MapPin size={15} />
                                    <Typography variant="body2">
                                      {job.location}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Clock size={15} />
                                    <Typography variant="body2">
                                      {job.employmentType ||
                                        job.type ||
                                        "Part-Time"}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Typography
                                  variant="body1"
                                  paragraph
                                  sx={{ mb: 2 }}
                                >
                                  {job.description}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.75,
                                  }}
                                >
                                  {(
                                    job.requiredSkills ||
                                    job.skills ||
                                    []
                                  ).map((sk) => (
                                    <Chip
                                      key={sk}
                                      label={sk}
                                      size="small"
                                      sx={{ bgcolor: "#F1F5F9" }}
                                    />
                                  ))}
                                </Box>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  alignItems: {
                                    xs: "stretch",
                                    md: "flex-end",
                                  },
                                  pt: { xs: 1.5, md: 0 },
                                  borderTop: {
                                    xs: "1px solid #E2E8F0",
                                    md: "none",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    textAlign: { xs: "left", md: "right" },
                                    mb: 1.5,
                                  }}
                                >
                                  <Typography variant="h6" color="primary">
                                    {job.compensation ||
                                      job.salary ||
                                      "Competitive"}
                                  </Typography>
                                  {job.deadline && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Apply before{" "}
                                      {String(job.deadline).split("T")[0]}
                                    </Typography>
                                  )}
                                </Box>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={
                                      isSaved ? (
                                        <BookmarkCheck size={15} />
                                      ) : (
                                        <Bookmark size={15} />
                                      )
                                    }
                                    onClick={() => handleToggleSaveJob(job)}
                                    sx={{ flex: { xs: 1, sm: "initial" } }}
                                  >
                                    {isSaved ? "Saved" : "Save"}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Eye size={15} />}
                                    onClick={() => handleInspectJobDetails(job)}
                                    sx={{ flex: { xs: 1, sm: "initial" } }}
                                  >
                                    Details
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={
                                      String(
                                        job.status || "OPEN"
                                      ).toUpperCase() !== "OPEN" || hasApplied
                                    }
                                    startIcon={<Send size={15} />}
                                    onClick={() => {
                                      setSelectedJob(job);
                                      setApplyModalOpen(true);
                                    }}
                                    sx={{
                                      flex: { xs: "1 1 100%", sm: "initial" },
                                    }}
                                  >
                                    {hasApplied ? "Applied" : "Apply"}
                                  </Button>
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })
                      )}
                    </Box>
                  )}
                </>
              )}

              {/* TAB 1: MY APPLICATIONS (GET /api/applications/mine) */}
              {activeTab === 1 && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <Typography variant="h4">My Submitted Applications</Typography>
                  {myApplications.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="body1" color="text.secondary">
                        You have not submitted any applications yet.
                      </Typography>
                    </Paper>
                  ) : (
                    myApplications.map((app) => (
                      <Paper key={app.id} sx={{ p: { xs: 2.5, sm: 3 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="h6">
                              {app.job?.title || app.jobTitle || "Campus Role"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {app.job?.employer?.organizationName ||
                                app.employerName ||
                                "Employer"}{" "}
                              •{" "}
                              {app.createdAt
                                ? String(app.createdAt).split("T")[0]
                                : ""}
                            </Typography>
                          </Box>
                          <StatusBadge status={app.status} />
                        </Box>
                        {(app.coverMessage || app.coverLetter) && (
                          <Typography
                            variant="body2"
                            sx={{
                              p: 2,
                              bgcolor: "#F8FAFC",
                              borderRadius: 2,
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <strong>Cover Note:</strong> "
                            {app.coverMessage || app.coverLetter}"
                          </Typography>
                        )}
                      </Paper>
                    ))
                  )}
                </Box>
              )}

              {/* TAB 2: SAVED JOBS (GET /api/jobs/saved) */}
              {activeTab === 2 && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <Typography variant="h4">Saved Campus Jobs</Typography>
                  {savedJobs.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="body1" color="text.secondary">
                        You have no saved jobs yet.
                      </Typography>
                    </Paper>
                  ) : (
                    savedJobs.map((job) => (
                      <Paper
                        key={job.id}
                        sx={{
                          p: { xs: 2.5, sm: 3 },
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="h6">{job.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {job.location} • {job.compensation || job.salary}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleToggleSaveJob(job)}
                          >
                            Remove
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => {
                              handleInspectJobDetails(job);
                              setActiveTab(0);
                            }}
                          >
                            View & Apply
                          </Button>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}

              {/* TAB 3: STUDENT PROFILE (PATCH /api/users/me/student) */}
              {activeTab === 3 && (
                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: "#1E40AF",
                          fontWeight: 800,
                        }}
                      >
                        {(studentProfileDraft.fullName || "S")[0]}
                      </Avatar>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Typography variant="h5">
                            {studentProfileDraft.fullName || currentUser.email}
                          </Typography>
                          <StatusBadge status="STUDENT" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Student Academic & Skill Profile
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant={isEditingProfile ? "outlined" : "contained"}
                      startIcon={<Edit3 size={16} />}
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
                    </Button>
                  </Box>

                  {profileSavedBanner && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Student profile saved to the backend database.
                    </Alert>
                  )}

                  {!isEditingProfile ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2.5,
                        p: { xs: 2, sm: 3 },
                        bgcolor: "#F8FAFC",
                        borderRadius: 2,
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {studentProfileDraft.fullName || "Not set"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Matriculation Number
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {studentProfileDraft.matricNo || "Not set"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Faculty & Department
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {studentProfileDraft.faculty} •{" "}
                          {studentProfileDraft.department || "Not set"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Academic Level
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {studentProfileDraft.level}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Official Email & Phone
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          sx={{ wordBreak: "break-word" }}
                        >
                          {studentProfileDraft.email} •{" "}
                          {studentProfileDraft.phone || "No phone"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Lecture-Free Availability
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {studentProfileDraft.availability}
                        </Typography>
                      </Box>
                      <Box sx={{ gridColumn: { sm: "span 2" } }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.75 }}
                        >
                          Verified Skills
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
                        >
                          {(studentProfileDraft.skills || []).map((sk) => (
                            <Chip
                              key={sk}
                              label={sk}
                              color="primary"
                              size="small"
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ gridColumn: { sm: "span 2" } }}>
                        <Typography variant="caption" color="text.secondary">
                          Experience Bio
                        </Typography>
                        <Typography variant="body2">
                          {studentProfileDraft.bio || "No summary added yet."}
                        </Typography>
                      </Box>
                      <Box sx={{ gridColumn: { sm: "span 2" } }}>
                        <Typography variant="caption" color="text.secondary">
                          CV / Portfolio Link
                        </Typography>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ wordBreak: "break-all" }}
                        >
                          {studentProfileDraft.cvUrl || "Not provided"}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      component="form"
                      onSubmit={handleSaveStudentProfile}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Full Name"
                          required
                          fullWidth
                          value={studentProfileDraft.fullName}
                          onChange={(e) =>
                            setStudentProfileDraft({
                              ...studentProfileDraft,
                              fullName: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Matriculation Number"
                          required
                          fullWidth
                          value={studentProfileDraft.matricNo}
                          onChange={(e) =>
                            setStudentProfileDraft({
                              ...studentProfileDraft,
                              matricNo: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Faculty"
                          fullWidth
                          value={studentProfileDraft.faculty}
                          onChange={(e) =>
                            setStudentProfileDraft({
                              ...studentProfileDraft,
                              faculty: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Department"
                          required
                          fullWidth
                          value={studentProfileDraft.department}
                          onChange={(e) =>
                            setStudentProfileDraft({
                              ...studentProfileDraft,
                              department: e.target.value,
                            })
                          }
                        />
                        <FormControl fullWidth>
                          <InputLabel id="ed-lvl">Academic Level</InputLabel>
                          <Select
                            labelId="ed-lvl"
                            label="Academic Level"
                            value={studentProfileDraft.level}
                            onChange={(e) =>
                              setStudentProfileDraft({
                                ...studentProfileDraft,
                                level: e.target.value,
                              })
                            }
                          >
                            <MenuItem value="100 Level">100 Level</MenuItem>
                            <MenuItem value="200 Level">200 Level</MenuItem>
                            <MenuItem value="300 Level">300 Level</MenuItem>
                            <MenuItem value="400 Level">400 Level</MenuItem>
                            <MenuItem value="500 Level">500 Level</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Phone Number"
                          fullWidth
                          value={studentProfileDraft.phone}
                          onChange={(e) =>
                            setStudentProfileDraft({
                              ...studentProfileDraft,
                              phone: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Weekly Lecture-Free Availability"
                          fullWidth
                          value={studentProfileDraft.availability}
                          onChange={(e) =>
                            setStudentProfileDraft({
                              ...studentProfileDraft,
                              availability: e.target.value,
                            })
                          }
                        />
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, mb: 1 }}
                        >
                          Skills (Tap to toggle or add custom skill)
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.75,
                            mb: 1.5,
                          }}
                        >
                          {Array.from(
                            new Set([
                              ...DEFAULT_SKILLS,
                              ...(studentProfileDraft.skills || []),
                            ])
                          ).map((sk) => {
                            const active = (
                              studentProfileDraft.skills || []
                            ).includes(sk);
                            return (
                              <Chip
                                key={sk}
                                label={sk}
                                color={active ? "primary" : "default"}
                                variant={active ? "filled" : "outlined"}
                                onClick={() => {
                                  const curr = studentProfileDraft.skills || [];
                                  setStudentProfileDraft({
                                    ...studentProfileDraft,
                                    skills: active
                                      ? curr.filter((s) => s !== sk)
                                      : [...curr, sk],
                                  });
                                }}
                              />
                            );
                          })}
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            maxWidth: 460,
                          }}
                        >
                          <TextField
                            size="small"
                            placeholder="Add custom skill..."
                            value={customSkillInput}
                            onChange={(e) =>
                              setCustomSkillInput(e.target.value)
                            }
                            sx={{ flex: 1, minWidth: 180 }}
                          />
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={handleAddCustomSkillToProfile}
                          >
                            Add
                          </Button>
                        </Box>
                      </Box>

                      <TextField
                        label="Experience Bio & Summary"
                        multiline
                        rows={3}
                        fullWidth
                        value={studentProfileDraft.bio}
                        onChange={(e) =>
                          setStudentProfileDraft({
                            ...studentProfileDraft,
                            bio: e.target.value,
                          })
                        }
                      />

                      <TextField
                        label="Link to CV / Resume or Portfolio"
                        fullWidth
                        value={studentProfileDraft.cvUrl}
                        onChange={(e) =>
                          setStudentProfileDraft({
                            ...studentProfileDraft,
                            cvUrl: e.target.value,
                          })
                        }
                      />

                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={actionLoading}
                          startIcon={<Save size={16} />}
                        >
                          {actionLoading ? "Saving..." : "Save Profile Changes"}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              )}

              {/* TAB 4: STUDENT SETTINGS */}
              {activeTab === 4 && renderSettingsSection("Student")}
            </>
          )}

          {/* ====================================================================
              ROLE 2: EMPLOYER PORTAL
             ==================================================================== */}
          {userRole === "EMPLOYER" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {!isEmployerVerified ? (
                <Alert severity="warning">
                  <AlertTitle>
                    Employer Account Status: Verification Pending — Awaiting
                    Admin Approval
                  </AlertTitle>
                  Your employer account is currently under review by OAU Campus
                  Jobs administrators. Job publishing will unlock automatically
                  once your organization is verified.
                </Alert>
              ) : (
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: "#F0FDF4",
                    borderColor: "#BBF7D0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ShieldCheck size={18} color="#15803D" />
                    <Typography variant="body2" fontWeight={600}>
                      Verified Campus Employer:{" "}
                      {employerProfileDraft.organizationName ||
                        currentUser.email}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlusCircle size={15} />}
                    onClick={() => {
                      setEditingJob(null);
                      setActiveTab(1);
                    }}
                  >
                    Create Job Vacancy
                  </Button>
                </Paper>
              )}

              {/* TAB 0: OVERVIEW */}
              {activeTab === 0 && (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr 1fr",
                        md: "repeat(4, 1fr)",
                      },
                      gap: 2,
                    }}
                  >
                    <Paper sx={{ p: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Verification Status
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <StatusBadge
                          status={isEmployerVerified ? "VERIFIED" : "PENDING"}
                        />
                      </Box>
                    </Paper>
                    <Paper sx={{ p: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        My Open Vacancies
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 0.5 }}>
                        {
                          myEmployerJobs.filter(
                            (j) =>
                              String(j.status || "OPEN").toUpperCase() ===
                              "OPEN"
                          ).length
                        }
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Job Postings
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 0.5 }}>
                        {myEmployerJobs.length}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Applicants (Selected Job)
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 0.5 }}>
                        {jobApplicants.length}
                      </Typography>
                    </Paper>
                  </Box>

                  <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">
                        Recent Student Applications
                      </Typography>
                      {myEmployerJobs.length > 0 && (
                        <Button size="small" onClick={() => setActiveTab(3)}>
                          Manage Applicants →
                        </Button>
                      )}
                    </Box>

                    {jobApplicants.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {isEmployerVerified
                          ? "No student applications found for your selected job listing yet."
                          : "You have no active job listings or applicants while your employer account awaits administrator verification."}
                      </Typography>
                    ) : (
                      jobApplicants.map((app) => (
                        <Box
                          key={app.id}
                          sx={{
                            p: 2,
                            border: "1px solid #E2E8F0",
                            borderRadius: 2,
                            mb: 1.5,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {app.student?.fullName ||
                                app.student?.name ||
                                app.studentName ||
                                "Student Applicant"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {app.coverMessage || app.coverLetter}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <StatusBadge status={app.status} />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setInspectApplicant(app)}
                            >
                              Review
                            </Button>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Paper>
                </>
              )}

              {/* TAB 1: CREATE OR EDIT JOB */}
              {activeTab === 1 && (
                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 800 }}>
                  {!isEmployerVerified ? (
                    <Box sx={{ py: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 2,
                        }}
                      >
                        <Lock size={24} color="#B45309" />
                        <Typography variant="h5">
                          Job Publishing Locked — Verification Pending
                        </Typography>
                      </Box>

                      <Typography
                        variant="body1"
                        color="text.secondary"
                        paragraph
                      >
                        Your employer account is currently awaiting approval
                        from an OAU Campus Jobs administrator.
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        Only verified employers are permitted to publish job
                        listings. You can review or update your organization
                        details under your Employer Profile while awaiting
                        verification.
                      </Typography>

                      <Box sx={{ mt: 3 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setActiveTab(4)}
                        >
                          View My Employer Profile
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="h5" gutterBottom>
                        {editingJob
                          ? `Edit Job Vacancy: ${editingJob.title}`
                          : "Create Job Vacancy"}
                      </Typography>
                      {formError && (
                        <Alert severity="error" sx={{ mb: 2.5 }}>
                          {formError}
                        </Alert>
                      )}

                      <Box
                        component="form"
                        onSubmit={handleCreateOrUpdateJob}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2.5,
                          mt: 2,
                        }}
                      >
                        <TextField
                          label="Job Title"
                          required
                          fullWidth
                          value={jobForm.title}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, title: e.target.value })
                          }
                        />
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 2,
                          }}
                        >
                          <FormControl fullWidth>
                            <InputLabel id="jc-lbl">Category</InputLabel>
                            <Select
                              labelId="jc-lbl"
                              label="Category"
                              value={jobForm.category}
                              onChange={(e) =>
                                setJobForm({
                                  ...jobForm,
                                  category: e.target.value,
                                })
                              }
                            >
                              <MenuItem value="Tech & IT">Tech & IT</MenuItem>
                              <MenuItem value="Media & Design">
                                Media & Design
                              </MenuItem>
                              <MenuItem value="Academic & Research">
                                Academic & Research
                              </MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl fullWidth>
                            <InputLabel id="jt-lbl">Employment Type</InputLabel>
                            <Select
                              labelId="jt-lbl"
                              label="Employment Type"
                              value={jobForm.employmentType}
                              onChange={(e) =>
                                setJobForm({
                                  ...jobForm,
                                  employmentType: e.target.value,
                                })
                              }
                            >
                              <MenuItem value="Part-Time">Part-Time</MenuItem>
                              <MenuItem value="Flexible">Flexible</MenuItem>
                              <MenuItem value="Contract">Contract</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "repeat(3, 1fr)",
                            },
                            gap: 2,
                          }}
                        >
                          <TextField
                            label="Campus Location"
                            required
                            fullWidth
                            value={jobForm.location}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                location: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Compensation"
                            required
                            fullWidth
                            placeholder="₦40,000 / month"
                            value={jobForm.compensation}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                compensation: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Application Deadline"
                            type="date"
                            required
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            InputLabelProps={{ shrink: true }}
                            value={jobForm.deadline}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                deadline: e.target.value,
                              })
                            }
                          />
                        </Box>

                        <TextField
                          label="Required Skills (Comma-separated)"
                          fullWidth
                          value={jobForm.requiredSkillsCsv}
                          onChange={(e) =>
                            setJobForm({
                              ...jobForm,
                              requiredSkillsCsv: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Role Description & Shift Responsibilities"
                          multiline
                          rows={4}
                          required
                          fullWidth
                          value={jobForm.description}
                          onChange={(e) =>
                            setJobForm({
                              ...jobForm,
                              description: e.target.value,
                            })
                          }
                        />
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                          {editingJob && (
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setEditingJob(null);
                                setActiveTab(2);
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={actionLoading}
                          >
                            {actionLoading
                              ? "Saving..."
                              : editingJob
                              ? "Save Changes"
                              : "Publish Job Vacancy"}
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </Paper>
              )}

              {/* TAB 2: MY JOB LISTINGS (GET /api/jobs/mine, PATCH, CLOSE, DELETE) */}
              {activeTab === 2 && (
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h5" gutterBottom>
                    My Job Listings
                  </Typography>
                  {myEmployerJobs.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: "center" }}>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {isEmployerVerified
                          ? "You have not published any job listings yet."
                          : "You cannot publish job listings while your employer account is in 'Verification Pending' status."}
                      </Typography>
                      {isEmployerVerified && (
                        <Button
                          variant="contained"
                          startIcon={<PlusCircle size={16} />}
                          onClick={() => setActiveTab(1)}
                        >
                          Create Your First Job Listing
                        </Button>
                      )}
                    </Box>
                  ) : isMobile ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {myEmployerJobs.map((job) => (
                        <Box
                          key={job.id}
                          sx={{
                            p: 2,
                            border: "1px solid #E2E8F0",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={700}>
                              {job.title}
                            </Typography>
                            <StatusBadge status={job.status} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {job.location} • {job.compensation || job.salary}
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Edit3 size={14} />}
                              onClick={() => handleStartEditJob(job)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleCloseJob(job)}
                            >
                              Close
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Trash2 size={14} />}
                              onClick={() => handleDeleteJob(job)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Location & Stipend
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Status
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {myEmployerJobs.map((job) => (
                            <TableRow key={job.id}>
                              <TableCell sx={{ fontWeight: 600 }}>
                                {job.title}
                              </TableCell>
                              <TableCell>
                                {job.location} •{" "}
                                {job.compensation || job.salary}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={job.status} />
                              </TableCell>
                              <TableCell align="right">
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 1,
                                  }}
                                >
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Edit3 size={14} />}
                                    onClick={() => handleStartEditJob(job)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    onClick={() => handleCloseJob(job)}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Trash2 size={14} />}
                                    onClick={() => handleDeleteJob(job)}
                                  >
                                    Delete
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              )}

              {/* TAB 3: APPLICANTS (GET /api/applications/job/:jobId) */}
              {activeTab === 3 && (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel id="flt-j">Select Job Listing</InputLabel>
                      <Select
                        labelId="flt-j"
                        label="Select Job Listing"
                        value={selectedEmployerJobId}
                        onChange={(e) =>
                          handleSelectEmployerJobForApplicants(e.target.value)
                        }
                      >
                        {myEmployerJobs.map((j) => (
                          <MenuItem key={j.id} value={j.id}>
                            {j.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel id="flt-s">Filter by Status</InputLabel>
                      <Select
                        labelId="flt-s"
                        label="Filter by Status"
                        value={empStatusFilter}
                        onChange={(e) => setEmpStatusFilter(e.target.value)}
                      >
                        <MenuItem value="ALL">All Statuses</MenuItem>
                        <MenuItem value="PENDING">Pending Review</MenuItem>
                        <MenuItem value="SHORTLISTED">Shortlisted</MenuItem>
                        <MenuItem value="ACCEPTED">Accepted</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Paper>

                  {filteredEmployerApplicants.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="body1" color="text.secondary">
                        No applicants found for this job listing.
                      </Typography>
                    </Paper>
                  ) : (
                    filteredEmployerApplicants.map((app) => (
                      <Paper key={app.id} sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: 1.5,
                            mb: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="h6">
                              {app.student?.fullName ||
                                app.student?.name ||
                                app.studentName ||
                                "Student Applicant"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {app.student?.email || ""}
                            </Typography>
                          </Box>
                          <StatusBadge status={app.status} />
                        </Box>

                        {(app.coverMessage || app.coverLetter) && (
                          <Typography
                            variant="body2"
                            sx={{
                              p: 2,
                              bgcolor: "#F8FAFC",
                              borderRadius: 2,
                              border: "1px solid #E2E8F0",
                              mb: 2,
                            }}
                          >
                            "{app.coverMessage || app.coverLetter}"
                          </Typography>
                        )}

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Eye size={15} />}
                            onClick={() => setInspectApplicant(app)}
                          >
                            Inspect Profile
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              handleUpdateApplicationStatus(
                                app.id,
                                "SHORTLISTED"
                              )
                            }
                          >
                            Shortlist
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() =>
                              handleUpdateApplicationStatus(app.id, "ACCEPTED")
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              handleUpdateApplicationStatus(app.id, "REJECTED")
                            }
                          >
                            Reject
                          </Button>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}

              {/* TAB 4: EMPLOYER PROFILE (PATCH /api/users/me/employer) */}
              {activeTab === 4 && (
                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 900 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: "#0B192C",
                          fontWeight: 800,
                        }}
                      >
                        {(employerProfileDraft.organizationName || "E")[0]}
                      </Avatar>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Typography variant="h5">
                            {employerProfileDraft.organizationName ||
                              currentUser.email}
                          </Typography>
                          <StatusBadge
                            status={isEmployerVerified ? "VERIFIED" : "PENDING"}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Employer Organization Profile
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant={isEditingProfile ? "outlined" : "contained"}
                      startIcon={<Edit3 size={16} />}
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
                    </Button>
                  </Box>

                  {profileSavedBanner && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Employer organization profile saved to the server!
                    </Alert>
                  )}

                  {!isEditingProfile ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2.5,
                        p: { xs: 2, sm: 3 },
                        bgcolor: "#F8FAFC",
                        borderRadius: 2,
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Organization Name
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {employerProfileDraft.organizationName || "Not set"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Contact Person
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {employerProfileDraft.fullName || "Not set"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Official Email & Phone
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          sx={{ wordBreak: "break-word" }}
                        >
                          {employerProfileDraft.email} •{" "}
                          {employerProfileDraft.phone || "No phone"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Campus Location
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {employerProfileDraft.location || "Not set"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Staff / Registration ID
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {employerProfileDraft.staffOrRegId || "Provided"}
                        </Typography>
                      </Box>
                      <Box sx={{ gridColumn: { sm: "span 2" } }}>
                        <Typography variant="caption" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body2">
                          {employerProfileDraft.description ||
                            "No description provided."}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      component="form"
                      onSubmit={handleSaveEmployerProfile}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Organization / Department Name"
                          required
                          fullWidth
                          value={employerProfileDraft.organizationName}
                          onChange={(e) =>
                            setEmployerProfileDraft({
                              ...employerProfileDraft,
                              organizationName: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Contact Person Full Name"
                          required
                          fullWidth
                          value={employerProfileDraft.fullName}
                          onChange={(e) =>
                            setEmployerProfileDraft({
                              ...employerProfileDraft,
                              fullName: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Phone Number"
                          fullWidth
                          value={employerProfileDraft.phone}
                          onChange={(e) =>
                            setEmployerProfileDraft({
                              ...employerProfileDraft,
                              phone: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Campus Location / Building"
                          required
                          fullWidth
                          value={employerProfileDraft.location}
                          onChange={(e) =>
                            setEmployerProfileDraft({
                              ...employerProfileDraft,
                              location: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Staff ID / CAC Verification Code"
                          fullWidth
                          value={employerProfileDraft.staffOrRegId}
                          onChange={(e) =>
                            setEmployerProfileDraft({
                              ...employerProfileDraft,
                              staffOrRegId: e.target.value,
                            })
                          }
                        />
                      </Box>

                      <TextField
                        label="Organization Description"
                        multiline
                        rows={3}
                        fullWidth
                        value={employerProfileDraft.description}
                        onChange={(e) =>
                          setEmployerProfileDraft({
                            ...employerProfileDraft,
                            description: e.target.value,
                          })
                        }
                      />

                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={actionLoading}
                          startIcon={<Save size={16} />}
                        >
                          {actionLoading
                            ? "Saving..."
                            : "Save Employer Profile Changes"}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              )}

              {/* TAB 5: EMPLOYER SETTINGS */}
              {activeTab === 5 && renderSettingsSection("Employer")}
            </Box>
          )}

          {/* ====================================================================
              ROLE 3: ADMIN PORTAL (Connected to /api/admin/* endpoints)
             ==================================================================== */}
          {userRole === "ADMIN" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* TAB 0: GET /api/admin/users & PATCH /api/admin/users/:id/role */}
              {activeTab === 0 && (
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <Typography variant="h5">User Management</Typography>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id="adm-r">Filter Role</InputLabel>
                      <Select
                        labelId="adm-r"
                        label="Filter Role"
                        value={adminRoleFilter}
                        onChange={(e) => setAdminRoleFilter(e.target.value)}
                      >
                        <MenuItem value="ALL">All Roles</MenuItem>
                        <MenuItem value="STUDENT">Students</MenuItem>
                        <MenuItem value="EMPLOYER">Employers</MenuItem>
                        <MenuItem value="ADMIN">Administrators</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            Change Role
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAdminUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {u.fullName || u.name || u.email}
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <StatusBadge status={u.role} />
                            </TableCell>
                            <TableCell align="right">
                              <Select
                                size="small"
                                value={u.role || "STUDENT"}
                                onChange={(e) =>
                                  handleAdminChangeUserRole(
                                    u.id,
                                    e.target.value
                                  )
                                }
                              >
                                <MenuItem value="STUDENT">STUDENT</MenuItem>
                                <MenuItem value="EMPLOYER">EMPLOYER</MenuItem>
                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* TAB 1: GET /api/admin/employers/pending & PATCH /api/admin/employers/:id/verification */}
              {activeTab === 1 && (
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h5" gutterBottom>
                    Employers Awaiting Verification
                  </Typography>
                  {adminPendingEmployers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No pending employers awaiting verification.
                    </Typography>
                  ) : (
                    adminPendingEmployers.map((emp) => (
                      <Box
                        key={emp.id}
                        sx={{
                          p: 2,
                          border: "1px solid #E2E8F0",
                          borderRadius: 2,
                          mb: 1.5,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1.5,
                        }}
                      >
                        <Box>
                          <Typography variant="h6">
                            {emp.organizationName ||
                              emp.companyName ||
                              emp.user?.email ||
                              "Employer"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {emp.location || ""}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <StatusBadge
                            status={emp.verificationStatus || "PENDING"}
                          />
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Eye size={15} />}
                            onClick={() => setInspectEmployer(emp)}
                          >
                            Review
                          </Button>
                        </Box>
                      </Box>
                    ))
                  )}
                </Paper>
              )}

              {/* TAB 2: GET /api/admin/jobs & PATCH /api/admin/jobs/:id/moderation */}
              {activeTab === 2 && (
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h5" gutterBottom>
                    Job Listings Moderation
                  </Typography>
                  {adminJobs.map((job) => (
                    <Box
                      key={job.id}
                      sx={{
                        p: 2,
                        border: "1px solid #E2E8F0",
                        borderRadius: 2,
                        mb: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.location} • {job.compensation || job.salary}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <StatusBadge status={job.status} />
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Eye size={15} />}
                          onClick={() => setInspectJob(job)}
                        >
                          Moderate
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              )}

              {/* TAB 3: GET /api/admin/reports & PATCH /api/admin/reports/:id/review */}
              {activeTab === 3 && (
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h5" gutterBottom>
                    Submitted Job Reports
                  </Typography>
                  {adminReports.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No job reports awaiting review.
                    </Typography>
                  ) : (
                    adminReports.map((rep) => (
                      <Box
                        key={rep.id}
                        sx={{
                          p: 2,
                          border: "1px solid #E2E8F0",
                          borderRadius: 2,
                          mb: 1.5,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1.5,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {rep.job?.title || rep.jobTitle || "Reported Job"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Reason: {rep.reason}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <StatusBadge status={rep.status} />
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Eye size={15} />}
                            onClick={() => setInspectReport(rep)}
                          >
                            Review
                          </Button>
                        </Box>
                      </Box>
                    ))
                  )}
                </Paper>
              )}

              {activeTab === 4 && renderSettingsSection("Administrator")}
            </Box>
          )}
        </Container>

        {/* MOBILE BOTTOM NAVIGATION */}
        {isMobile && (
          <Paper
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              borderRadius: 0,
              borderTop: "1px solid #CBD5E1",
            }}
          >
            <BottomNavigation
              showLabels
              value={activeTab > 4 ? 4 : activeTab}
              onChange={(_, v) => {
                setSelectedJob(null);
                if (userRole === "EMPLOYER" && v === 4) {
                  setActiveTab(5);
                } else {
                  setActiveTab(v);
                }
              }}
            >
              {userRole === "STUDENT" && [
                <BottomNavigationAction
                  key="b"
                  label="Jobs"
                  icon={<Search size={18} />}
                />,
                <BottomNavigationAction
                  key="a"
                  label="Applied"
                  icon={<FileText size={18} />}
                />,
                <BottomNavigationAction
                  key="s"
                  label="Saved"
                  icon={<Bookmark size={18} />}
                />,
                <BottomNavigationAction
                  key="p"
                  label="Profile"
                  icon={<User size={18} />}
                />,
                <BottomNavigationAction
                  key="st"
                  label="Settings"
                  icon={<Settings size={18} />}
                />,
              ]}
              {userRole === "EMPLOYER" && [
                <BottomNavigationAction
                  key="o"
                  label="Overview"
                  icon={<LayoutDashboard size={18} />}
                />,
                <BottomNavigationAction
                  key="c"
                  label="Create"
                  icon={<PlusCircle size={18} />}
                />,
                <BottomNavigationAction
                  key="l"
                  label="Listings"
                  icon={<Briefcase size={18} />}
                />,
                <BottomNavigationAction
                  key="pr"
                  label="Profile"
                  icon={<Building2 size={18} />}
                />,
                <BottomNavigationAction
                  key="st"
                  label="Settings"
                  icon={<Settings size={18} />}
                />,
              ]}
              {userRole === "ADMIN" && [
                <BottomNavigationAction
                  key="u"
                  label="Users"
                  icon={<Users size={18} />}
                />,
                <BottomNavigationAction
                  key="v"
                  label="Employers"
                  icon={<ShieldCheck size={18} />}
                />,
                <BottomNavigationAction
                  key="m"
                  label="Jobs"
                  icon={<Briefcase size={18} />}
                />,
                <BottomNavigationAction
                  key="r"
                  label="Reports"
                  icon={<Flag size={18} />}
                />,
                <BottomNavigationAction
                  key="st"
                  label="Settings"
                  icon={<Settings size={18} />}
                />,
              ]}
            </BottomNavigation>
          </Paper>
        )}

        {/* MODALS */}
        <Dialog
          open={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <Box component="form" onSubmit={handleApplyToJob}>
            <DialogTitle sx={{ fontWeight: 700 }}>
              Apply for {selectedJob?.title}
            </DialogTitle>
            <DialogContent dividers>
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}
              <TextField
                label="Cover Message & Lecture-Free Availability"
                multiline
                rows={4}
                required
                fullWidth
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setApplyModalOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
              >
                {actionLoading ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        <Dialog
          open={Boolean(reportModalJob)}
          onClose={() => setReportModalJob(null)}
          fullWidth
          maxWidth="xs"
        >
          <Box component="form" onSubmit={handleReportJobSubmit}>
            <DialogTitle sx={{ fontWeight: 700 }}>Report Listing</DialogTitle>
            <DialogContent dividers>
              <TextField
                label="Reason for report"
                multiline
                rows={3}
                required
                fullWidth
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setReportModalJob(null)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                color="error"
                disabled={actionLoading}
              >
                Submit Report
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        <Dialog
          open={Boolean(inspectApplicant)}
          onClose={() => setInspectApplicant(null)}
          fullWidth
          maxWidth="sm"
        >
          {inspectApplicant && (
            <>
              <DialogTitle sx={{ fontWeight: 700 }}>
                Applicant Profile:{" "}
                {inspectApplicant.student?.fullName ||
                  inspectApplicant.student?.name ||
                  inspectApplicant.studentName ||
                  "Student"}
              </DialogTitle>
              <DialogContent
                dividers
                sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                <Typography variant="body2">
                  <strong>Email:</strong>{" "}
                  {inspectApplicant.student?.email || "Provided"}
                </Typography>
                <Typography variant="body2">
                  <strong>Cover Note:</strong> "
                  {inspectApplicant.coverMessage ||
                    inspectApplicant.coverLetter ||
                    ""}
                  "
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 2, flexWrap: "wrap", gap: 1 }}>
                <Button onClick={() => setInspectApplicant(null)}>Close</Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    handleUpdateApplicationStatus(
                      inspectApplicant.id,
                      "REJECTED"
                    )
                  }
                >
                  Reject
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    handleUpdateApplicationStatus(
                      inspectApplicant.id,
                      "SHORTLISTED"
                    )
                  }
                >
                  Shortlist
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() =>
                    handleUpdateApplicationStatus(
                      inspectApplicant.id,
                      "ACCEPTED"
                    )
                  }
                >
                  Accept
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Dialog
          open={Boolean(inspectEmployer)}
          onClose={() => setInspectEmployer(null)}
          fullWidth
          maxWidth="sm"
        >
          {inspectEmployer && (
            <>
              <DialogTitle sx={{ fontWeight: 700 }}>
                Review Employer:{" "}
                {inspectEmployer.organizationName ||
                  inspectEmployer.companyName}
              </DialogTitle>
              <DialogContent
                dividers
                sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                <Typography variant="body2">
                  <strong>Location:</strong> {inspectEmployer.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Description:</strong> {inspectEmployer.description}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setInspectEmployer(null)}>Cancel</Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    handleAdminEmployerDecision(inspectEmployer.id, "REJECTED")
                  }
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() =>
                    handleAdminEmployerDecision(inspectEmployer.id, "VERIFIED")
                  }
                >
                  Verify Employer
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Dialog
          open={Boolean(inspectJob)}
          onClose={() => setInspectJob(null)}
          fullWidth
          maxWidth="sm"
        >
          {inspectJob && (
            <>
              <DialogTitle sx={{ fontWeight: 700 }}>
                Moderate Job: {inspectJob.title}
              </DialogTitle>
              <DialogContent
                dividers
                sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                <Typography variant="body2">
                  <strong>Location:</strong> {inspectJob.location}
                </Typography>
                <Typography variant="body2">
                  <strong>Description:</strong> {inspectJob.description}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 2, flexWrap: "wrap", gap: 1 }}>
                <Button onClick={() => setInspectJob(null)}>Cancel</Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    handleAdminModerationDecision(inspectJob.id, "CLOSED")
                  }
                >
                  Close Listing
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() =>
                    handleAdminModerationDecision(inspectJob.id, "OPEN")
                  }
                >
                  Open Listing
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Dialog
          open={Boolean(inspectReport)}
          onClose={() => setInspectReport(null)}
          fullWidth
          maxWidth="sm"
        >
          {inspectReport && (
            <>
              <DialogTitle sx={{ fontWeight: 700 }}>
                Review Report
              </DialogTitle>
              <DialogContent dividers>
                <Typography variant="body2">
                  <strong>Reason:</strong> "{inspectReport.reason}"
                </Typography>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setInspectReport(null)}>Cancel</Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    handleAdminProcessReport(inspectReport.id, "DISMISSED")
                  }
                >
                  Dismiss Report
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    handleAdminProcessReport(inspectReport.id, "REVIEWED")
                  }
                >
                  Mark Reviewed
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {confirmDialog.title}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2">{confirmDialog.description}</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDialog.onConfirm}
            >
              {confirmDialog.confirmLabel}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ open: false, message: "" })}
          message={snackbar.message}
        />
      </Box>
    </ThemeProvider>
  );
}