import { useState } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  Fingerprint,
  FileCheck2,
  Activity,
  CheckCircle2,
  Globe,
  Menu,
  X,
  ArrowRight,
  Lock,
} from "lucide-react";

interface LandingPageProps {
  onOpenAuth: (mode: "login" | "register") => void;
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    {
      icon: LockKeyhole,
      badge: "IDENTITY FIRST",
      title: "Zero-Trust Access",
      text: "Verify identity, workspace membership, and dynamic device risk before every document read or download.",
    },
    {
      icon: Fingerprint,
      badge: "EXPLAINABLE AI",
      title: "TrustLens Decisions",
      text: "Understand exactly why a request is allowed or blocked with clear, mathematically explainable audit decisions.",
    },
    {
      icon: FileCheck2,
      badge: "IMMUTABLE CHAIN",
      title: "ProofChain Ledger",
      text: "Continuous SHA-256 hash-chaining records every access event, exposing tampering or unauthorized file modifications immediately.",
    },
  ];

  const enterpriseStats = [
    { label: "CRYPTOGRAPHIC ALGORITHM", value: "SHA-256 / AES-256" },
    { label: "DATA ISOLATION", value: "Multi-Tenant RLS" },
    { label: "TAMPER DETECTION", value: "Immediate Alerting" },
    { label: "UPTIME SLA", value: "99.99% Availability" },
  ];

  return (
    <main className="app-shell" id="home">
      {/* Public Navbar */}
      <nav className="navbar">
        <a href="#home" className="brand">
          <span className="brand-mark">
            <ShieldCheck size={25} />
          </span>
          <span>
            <strong>TrustVault</strong>
            <small>ENTERPRISE SECURITY</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Platform Features
          </a>
          <a href="#security" onClick={() => setMenuOpen(false)}>
            Zero-Trust Architecture
          </a>
          <a href="#workflow" onClick={() => setMenuOpen(false)}>
            How It Works
          </a>

          <div className="nav-auth-buttons">
            <button
              type="button"
              className="nav-btn-login"
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth("login");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className="nav-cta"
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth("register");
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="pulse-dot" />
            <span>CONFIDENTIAL DOCUMENTS · COMPLETE ACCOUNTABILITY</span>
          </div>

          <h1>
            Your documents.
            <br />
            <span>Your control.</span>
            <br />
            Mathematical proof.
          </h1>

          <p className="hero-description">
            Share confidential enterprise files with total confidence. Control who can access
            them, understand every access decision with TrustLens, and verify activity history
            with the ProofChain immutable audit ledger.
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="button-primary"
              onClick={() => onOpenAuth("register")}
            >
              <span>Launch Enterprise Vault</span>
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => onOpenAuth("login")}
            >
              <Lock size={15} />
              <span>Sign In with Credentials</span>
            </button>
          </div>

          <div className="hero-assurance">
            <CheckCircle2 size={17} />
            <span>Identity-first security · Zero-knowledge isolation · Tamper-proof auditability</span>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="hero-visual" id="security">
          <div className="orbit orbit-large" />
          <div className="orbit orbit-small" />

          <div className="security-card">
            <div className="card-header">
              <span>TRUSTVAULT / CORE PROTOCOL</span>
              <span className="system-label">ACTIVE ENCRYPTION</span>
            </div>

            <div className="main-shield">
              <ShieldCheck size={56} strokeWidth={1.4} />
            </div>

            <h2>Protection with proof.</h2>
            <p className="card-subtitle">
              Every document read, download, or share requires verified identity clearance.
            </p>

            <div className="security-row">
              <span>
                <CheckCircle2 size={16} /> Identity & Role Check
              </span>
              <span className="row-status text-emerald">ACTIVE</span>
            </div>
            <div className="security-row">
              <span>
                <CheckCircle2 size={16} /> SHA-256 Hashing at Rest
              </span>
              <span className="row-status text-emerald">ENFORCED</span>
            </div>
            <div className="security-row">
              <span>
                <Activity size={16} /> ProofChain Hash-Linked Ledger
              </span>
              <span className="row-status text-emerald">VERIFIED</span>
            </div>

            <div className="card-footer">
              <span>
                <Globe size={14} /> MULTI-TENANT ISOLATION
              </span>
              <LockKeyhole size={15} />
            </div>
          </div>

          <div className="floating-tag tag-top">
            <Fingerprint size={18} />
            <span>Identity First Access</span>
          </div>
          <div className="floating-tag tag-bottom">
            <Activity size={18} />
            <span>ProofChain Verified</span>
          </div>
        </div>
      </section>

      {/* Trust Bar with Enterprise Stats */}
      <section className="trust-bar">
        {enterpriseStats.map((st, i) => (
          <div key={st.label} className="trust-bar-item">
            <span className="trust-bar-val">{st.value}</span>
            <span className="trust-bar-lbl">{st.label}</span>
            {i < enterpriseStats.length - 1 && <i className="trust-bar-divider" />}
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-kicker">THE TRUSTVAULT DIFFERENCE</span>
          <h2>
            Security you can <span>demonstrate.</span>
          </h2>
          <p>
            More than document storage. A platform engineered to make confidential access
            controlled, explainable, and cryptographically accountable.
          </p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, badge, title, text }, index) => (
            <article className="feature-card" key={title}>
              <div className="feature-top-row">
                <div className="feature-icon">
                  <Icon size={22} />
                </div>
                <span className="feature-badge-pill">{badge}</span>
              </div>
              <span className="feature-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <button
                type="button"
                className="feature-learn-btn"
                onClick={() => onOpenAuth("register")}
              >
                <span>Deploy capability</span>
                <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section" id="workflow">
        <div>
          <span className="section-kicker">SIMPLE WORKFLOW · STRONGER CONTROL</span>
          <h2>
            From upload to <span>cryptographic proof.</span>
          </h2>
          <p>
            Every step has an auditable purpose, from storing confidential files privately to
            mathematically verifying who accessed them and when.
          </p>
        </div>

        <div className="workflow-steps">
          <article>
            <span>01</span>
            <div>
              <h3>Upload Privately with SHA-256 Digest</h3>
              <p>Keep documents out of public storage. Files are digested and hashed before write.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Grant Specific Role-Based Access</h3>
              <p>Define who can view or download each file with time-limited signed tokens.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Verify Continuous Hash-Chain History</h3>
              <p>Traverse the ProofChain audit history to detect bit tampering or unauthorized changes.</p>
            </div>
          </article>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="final-cta">
        <div className="cta-emblem">
          <ShieldCheck size={32} />
        </div>
        <span className="section-kicker">BUILT FOR ENTERPRISE ACCOUNTABILITY</span>
        <h2>
          Every document deserves <span>provable protection.</span>
        </h2>
        <p>
          TrustVault empowers organizations to manage confidential documents with clearer access
          controls and an immutable audit history.
        </p>
        <button
          type="button"
          className="button-primary"
          onClick={() => onOpenAuth("register")}
        >
          <span>Get Started Free</span>
          <ArrowRight size={17} />
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <a href="#home" className="footer-brand">
          <span className="brand-mark">
            <ShieldCheck size={20} />
          </span>
          <strong>TrustVault</strong>
        </a>
        <span>Secure Document Sharing · Clear Accountability · Cryptographic Proof</span>
        <span>Enterprise Platform · 2026</span>
      </footer>
    </main>
  );
}
