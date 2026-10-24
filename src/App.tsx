import {
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Fingerprint,
  FileCheck2,
  Activity,
  CheckCircle2,
  Globe,
  Menu,
  X,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./App.css";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
const [workspaceName, setWorkspaceName] = useState("");
const [workspaceLoading, setWorkspaceLoading] = useState(false);
const [workspaceMessage, setWorkspaceMessage] = useState("");
const [workspaces, setWorkspaces] = useState<
  { id: string; name: string }[]
>([]);
const [workspacesLoading, setWorkspacesLoading] = useState(false);
const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [documentLoading, setDocumentLoading] = useState(false);
const [documentMessage, setDocumentMessage] = useState("");

      useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);
const loadWorkspaces = async () => {
  setWorkspacesLoading(true);

  try {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (error) throw error;

    setWorkspaces(data ?? []);
  } catch (error) {
    console.error("Failed to load workspaces:", error);
  } finally {
    setWorkspacesLoading(false);
  }
};
useEffect(() => {
  if (userLoggedIn) {
    loadWorkspaces();
  } else {
    setWorkspaces([]);
  }
}, [userLoggedIn]); 
const handleCreateWorkspace = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();
  setWorkspaceMessage("");

  const name = workspaceName.trim();

  if (!name) {
    setWorkspaceMessage("Please enter a workspace name.");
    return;
  }

  setWorkspaceLoading(true);

  try {
    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError) throw userError;

    const user = userData.user;

    if (!user) {
      throw new Error("Please sign in again.");
    }

    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({
        name,
        created_by: user.id,
      })
      .select("id, name")
      .single();

    if (workspaceError) throw workspaceError;

    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      setWorkspaceMessage(
        `Workspace created, but owner assignment failed: ${memberError.message}`
      );
      return;
    }

    setWorkspaceName("");
    setWorkspaceMessage(
      `Workspace "${workspace.name}" created successfully. You are the owner.`
    );
    await loadWorkspaces();
  } catch (error: unknown) {
  console.error("Workspace creation failed:", error);

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error
      ? String(error.message)
      : String(error);

  setWorkspaceMessage(message || "Could not create the workspace.");
} finally {
    setWorkspaceLoading(false);
  }
};
  const handleDocumentUpload = async (
  event: React.MouseEvent<HTMLButtonElement>
) => {
  event.preventDefault();
  setDocumentMessage("");

  if (!selectedWorkspaceId) {
    setDocumentMessage("Please select a workspace.");
    return;
  }

  if (!selectedFile) {
    setDocumentMessage("Please choose a file to upload.");
    return;
  }

  if (selectedFile.size > 10 * 1024 * 1024) {
    setDocumentMessage("File size must be 10 MB or less.");
    return;
  }

  setDocumentLoading(true);

  try {
    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError) throw userError;
    if (!userData.user) throw new Error("Please sign in again.");

    const safeName = selectedFile.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
    const filePath =
      `${selectedWorkspaceId}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("trustvault-documents")
      .upload(filePath, selectedFile, {
        upsert: false,
        contentType: selectedFile.type || "application/octet-stream",
      });

    if (uploadError) throw uploadError;
    const fileBuffer = await selectedFile.arrayBuffer();
const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
const sha256 = Array.from(new Uint8Array(hashBuffer))
  .map((byte) => byte.toString(16).padStart(2, "0"))
  .join("");
    const { error: metadataError } = await supabase
  .from("documents")
  .insert({
    workspace_id: selectedWorkspaceId,
    uploaded_by: userData.user.id,
    name: selectedFile.name,
    storage_path: filePath,
    sha256: sha256, 
  });

if (metadataError) {
  await supabase.storage
    .from("trustvault-documents")
    .remove([filePath]);

  throw metadataError;
}

    setDocumentMessage(`Uploaded "${selectedFile.name}" successfully.`);
    setSelectedFile(null);

    const fileInput = document.getElementById(
      "document-file"
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = "";
  } catch (error: unknown) {
    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error
        ? String(error.message)
        : String(error);

    console.error("Document upload failed:", error);
    setDocumentMessage(message || "Could not upload the document.");
  } finally {
    setDocumentLoading(false);
  }
};
  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (authMode === "register" && password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setAuthSuccess("Account created successfully! You are signed in.");
        } else {
          setAuthSuccess(
            "Registration successful. Check your email to confirm your account before signing in."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setUserLoggedIn(true);
        setAuthSuccess("Login successful!");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again.";

      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };


  const features = [
    {
      icon: LockKeyhole,
      title: "Zero-Trust Access",
      text: "Verify identity, workspace membership and permissions before every document request.",
    },
    {
      icon: Fingerprint,
      title: "TrustLens",
      text: "Understand why a request is allowed or denied with clear, explainable access decisions.",
    },
    {
      icon: FileCheck2,
      title: "ProofChain",
      text: "Verify a hash-linked audit history and detect unexpected changes to recorded events.",
    },
  ];
  if (userLoggedIn) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>🛡️ TrustVault</h2>
        <button
          className="sign-out-button"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          Sign out
        </button>
      </header>

      <section className="dashboard-welcome">
        <p className="dashboard-label">SECURE WORKSPACE</p>
        <h1>Your security command center.</h1>
        <p>
          Manage confidential documents, control access, and track
          activity from one place.
        </p>
      </section>
      <section className="workspace-create-card">
  <h2>Create your company workspace</h2>
  <p>Create a private workspace for your team to manage confidential documents.</p>

  <form onSubmit={handleCreateWorkspace}>
    <input
      type="text"
      value={workspaceName}
      onChange={(event) => setWorkspaceName(event.target.value)}
      placeholder="Enter your company or workspace name"
      required
      maxLength={100}
    />

    <button type="submit" disabled={workspaceLoading}>
      {workspaceLoading ? "Creating..." : "Create workspace"}
    </button>
  </form>

  {workspaceMessage && (
    <p role="status">{workspaceMessage}</p>
  )}
</section>    
      <section className="dashboard-cards">
        <div className="dashboard-card">
          <h3>📁 Documents</h3>
          <p>Upload and manage confidential files.</p>
          <div className="document-upload">
  <select
    value={selectedWorkspaceId}
    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
    required
  >
    <option value="">Select a workspace</option>
    {workspaces.map((workspace) => (
      <option key={workspace.id} value={workspace.id}>
        {workspace.name}
      </option>
    ))}
  </select>

  <input
    id="document-file"
    type="file"
    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
    required
  />

  <button
    type="button"
    onClick={handleDocumentUpload}
    disabled={documentLoading}
  >
    {documentLoading ? "Uploading..." : "Upload document"}
  </button>

  {documentMessage && <p role="status">{documentMessage}</p>}
</div>
        </div>

<div className="dashboard-card">
  <h3>🏢 Workspaces</h3>
  <p>View and manage your company workspaces.</p>

  {workspacesLoading ? (
    <p>Loading workspaces...</p>
  ) : workspaces.length > 0 ? (
    <ul>
      {workspaces.map((workspace) => (
        <li key={workspace.id}>{workspace.name}</li>
      ))}
    </ul>
  ) : (
    <p>No workspaces found.</p>
  )}

  <button type="button" onClick={loadWorkspaces}>
    Refresh workspaces
  </button>
</div>

        <div className="dashboard-card">
          <h3>🔐 TrustLens</h3>
          <p>Understand why access is allowed or denied.</p>
          <span>Coming next</span>
        </div>

        <div className="dashboard-card">
          <h3>⛓️ ProofChain</h3>
          <p>Review document activity and audit history.</p>
          <span>Coming next</span>
        </div>
      </section>
    </div>
  );
}

  return (
    <main className="app-shell" id="home">
      <nav className="navbar">
        <a href="#home" className="brand">
          <span className="brand-mark"><ShieldCheck size={25} /></span>
          <span>
            <strong>TrustVault</strong>
            <small>SECURE BY DESIGN</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={23} />
        </button>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#security" onClick={() => setMenuOpen(false)}>Security</a>
          <a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
<button
  type="button"
  className="nav-cta"
  onClick={() => {
    setAuthMode("login");
    setAuthError("");
    setAuthSuccess("");
    setAuthOpen(true);
    setMenuOpen(false);
  }}
>
  Get started <ArrowRight size={16} />
</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="pulse-dot" />
            CONFIDENTIAL DOCUMENTS. COMPLETE CLARITY.
          </div>

          <h1>
            Your documents.
            <br />
            <span>Your control.</span>
            <br />
            Real accountability.
          </h1>

          <p className="hero-description">
            Share confidential files with confidence. Control who can access
            them, understand every access decision, and verify your activity
            history with TrustVault.
          </p>

          <div className="hero-buttons">
<button
  type="button"
  className="button-primary"
  onClick={() => {
    setAuthMode("register");
    setAuthError("");
    setAuthSuccess("");
    setAuthOpen(true);
  }}
>
  Discover TrustVault <ArrowRight size={18} />
</button>
            <a href="#features" className="button-secondary">
              Explore the platform
            </a>
          </div>

          <div className="hero-assurance">
            <CheckCircle2 size={17} />
            Identity-first security · Controlled sharing · Auditability
          </div>
        </div>

        <div className="hero-visual" id="security">
          <div className="orbit orbit-large" />
          <div className="orbit orbit-small" />

          <div className="security-card">
            <div className="card-header">
              <span>TRUSTVAULT / SECURITY</span>
              <span className="system-label">DESIGN PREVIEW</span>
            </div>

            <div className="main-shield">
              <ShieldCheck size={56} strokeWidth={1.4} />
            </div>

            <h2>Protection with proof.</h2>
            <p className="card-subtitle">
              Access should always be intentional.
            </p>

            <div className="security-row">
              <span><CheckCircle2 size={17} /> Identity checks</span>
              <span className="row-status">CORE</span>
            </div>
            <div className="security-row">
              <span><CheckCircle2 size={17} /> Permission enforcement</span>
              <span className="row-status">CORE</span>
            </div>
            <div className="security-row">
              <span><Activity size={17} /> Audit verification</span>
              <span className="row-status">PLANNED</span>
            </div>

            <div className="card-footer">
              <span><Globe size={15} /> COMPANY WORKSPACES</span>
              <LockKeyhole size={16} />
            </div>
          </div>

          <div className="floating-tag tag-top">
            <Fingerprint size={19} />
            <span>Identity first</span>
          </div>
          <div className="floating-tag tag-bottom">
            <Activity size={19} />
            <span>Accountability built in</span>
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <span>PRIVATE FILE STORAGE</span>
        <i />
        <span>COMPANY DATA ISOLATION</span>
        <i />
        <span>CONTROLLED SHARING</span>
        <i />
        <span>VERIFIABLE AUDIT HISTORY</span>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="section-kicker">THE TRUSTVAULT DIFFERENCE</span>
          <h2>Security you can <span>demonstrate.</span></h2>
          <p>
            More than document storage. A platform designed to make
            confidential access controlled, understandable and accountable.
          </p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }, index) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon"><Icon size={24} /></div>
              <span className="feature-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <a href="#workflow">Explore feature <ArrowRight size={15} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div>
          <span className="section-kicker">SIMPLE WORKFLOW. STRONGER CONTROL.</span>
          <h2>From upload to <span>proof.</span></h2>
          <p>
            Every step has a purpose, from storing files privately to
            verifying who accessed them.
          </p>
        </div>

        <div className="workflow-steps">
          <article><span>01</span><div><h3>Upload privately</h3><p>Keep documents out of public storage.</p></div></article>
          <article><span>02</span><div><h3>Grant specific access</h3><p>Define who can view or download each file.</p></div></article>
          <article><span>03</span><div><h3>Verify the history</h3><p>Inspect access events and integrity checks.</p></div></article>
        </div>
      </section>

      <section className="final-cta" id="get-started">
        <div className="cta-emblem"><ShieldCheck size={31} /></div>
        <span className="section-kicker">BUILT FOR ACCOUNTABILITY</span>
        <h2>Every document deserves <span>protection.</span></h2>
        <p>
          TrustVault is being built to help organizations manage confidential
          documents with clearer access controls and a verifiable activity history.
        </p>
        <a href="#home" className="button-primary">
          Back to top <ArrowRight size={17} />
        </a>
      </section>

      <footer className="footer">
        <a href="#home" className="footer-brand">
          <span className="brand-mark"><ShieldCheck size={21} /></span>
          <strong>TrustVault</strong>
        </a>
        <span>Secure sharing. Clear accountability.</span>
        <span>Independent hackathon project · 2026</span>
      </footer>
      
      {authOpen && (
        <div
          className="auth-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAuthOpen(false);
            }
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
              aria-label="Close authentication"
              onClick={() => setAuthOpen(false)}
            >
              <X size={21} />
            </button>

            <div className="auth-brand-icon">
              <ShieldCheck size={30} />
            </div>

            <span className="section-kicker">SECURE ACCESS</span>
            <h2 id="auth-title">
              {authMode === "login" ? "Welcome back." : "Create your account."}
            </h2>
            <p className="auth-description">
              {authMode === "login"
                ? "Sign in to continue to TrustVault."
                : "Start securing your company's documents."}
            </p>

            <div className="auth-switch">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === "register" ? "active" : ""}
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === "register" && (
                <label>
                  Full name
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      authMode === "login" ? "current-password" : "new-password"
                    }
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {authMode === "register" && (
                <label>
                  Confirm password
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    minLength={8}
                    required
                  />
                </label>
              )}

              {authError && (
                <p className="auth-message auth-error" role="alert">
                  {authError}
                </p>
              )}

              {authSuccess && (
                <p className="auth-message auth-success" role="status">
                  {authSuccess}
                </p>
              )}

              <button
                type="submit"
                className="button-primary auth-submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Sign in"
                    : "Create account"}
                {!authLoading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="auth-privacy">
              <LockKeyhole size={14} />
              Your account is protected by Supabase authentication.
            </p>
          </section>
        </div>
      )}

    </main>
  );
}

export default App;
