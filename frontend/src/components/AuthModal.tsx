import { useState } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (fullName: string, email: string, password: string) => Promise<boolean>;
  initialMode?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  initialMode = "login",
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "#ef4444" };
    if (score === 2) return { score: 50, label: "Fair", color: "#f59e0b" };
    if (score === 3) return { score: 75, label: "Good", color: "#38bdf8" };
    return { score: 100, label: "Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    if (authMode === "register" && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (authMode === "register") {
        const hasSession = await onRegister(fullName, email, password);
        if (hasSession) {
          setSuccessMsg("Account created and signed in successfully!");
          setTimeout(() => onClose(), 800);
        } else {
          setSuccessMsg(
            "Registration successful. Check your email to confirm your account before signing in."
          );
        }
      } else {
        await onLogin(email, password);
        setSuccessMsg("Signed in successfully. Opening command center...");
        setTimeout(() => onClose(), 600);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please verify credentials.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          className="auth-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <ShieldCheck size={28} />
          </div>
          <span className="section-kicker">ENTERPRISE SECURITY PORTAL</span>
          <h2 id="auth-title">
            {authMode === "login"
              ? "Sign in to TrustVault"
              : "Create Company Account"}
          </h2>
          <p className="auth-description">
            {authMode === "login"
              ? "Access your isolated company vault and zero-trust documents."
              : "Set up your secure organization with cryptographic auditability."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-switch">
          <button
            type="button"
            className={authMode === "login" ? "active" : ""}
            onClick={() => {
              setAuthMode("login");
              setErrorMsg("");
              setSuccessMsg("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={authMode === "register" ? "active" : ""}
            onClick={() => {
              setAuthMode("register");
              setErrorMsg("");
              setSuccessMsg("");
            }}
          >
            Create Account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {authMode === "register" && (
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. David Ross"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Corporate Email</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="password-field">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={
                  authMode === "login" ? "current-password" : "new-password"
                }
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {authMode === "register" && password && (
              <div className="pwd-strength-container">
                <div className="pwd-strength-bar">
                  <div
                    className="pwd-strength-fill"
                    style={{
                      width: `${strength.score}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span className="pwd-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {authMode === "register" && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="password-field">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="auth-message auth-error" role="alert">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-message auth-success" role="status">
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-sm" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : (
              <>
                <span>{authMode === "login" ? "Sign In to Vault" : "Create Enterprise Account"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-note">
          <LockKeyhole size={13} />
          <span>
            Protected with Supabase Auth · Row-Level Security & Encrypted Tokens
          </span>
        </div>
      </section>
    </div>
  );
}
