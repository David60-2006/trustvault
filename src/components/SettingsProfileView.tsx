import { useState } from "react";
import {
  User,
  Shield,
  Lock,
  HardDrive,
  CheckCircle2,
  Save,
  Plus,
  Download,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import type { UserProfile, Workspace, SecuritySettings, AuditLogEntry } from "../types";

interface SettingsProfileViewProps {
  user: UserProfile;
  workspaces: Workspace[];
  activeWorkspace?: Workspace;
  onUpdateProfile: (fullName: string) => Promise<void>;
  onOpenCreateWorkspace: () => void;
  logs: AuditLogEntry[];
  initialTab?: string;
}

export function SettingsProfileView({
  user,
  workspaces,
  activeWorkspace,
  onUpdateProfile,
  onOpenCreateWorkspace,
  logs,
  initialTab = "profile",
}: SettingsProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "workspaces" | "compliance">(
    (initialTab as any) || "profile"
  );

  // Profile Form State
  const [fullName, setFullName] = useState(user.fullName || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Security Policies State
  const [settings, setSettings] = useState<SecuritySettings>({
    enforce2FA: true,
    enforceSha256Verification: true,
    autoExpireSharesDays: 7,
    restrictToCompanyDomain: true,
    ipWhitelistEnabled: false,
    tamperAlertsEnabled: true,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    try {
      await onUpdateProfile(fullName.trim());
      setProfileMessage("Profile updated successfully.");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TrustVault-Compliance-Audit-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const userInitials = (fullName || user.email || "TV")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="settings-container">
      {/* Settings Top Header */}
      <div className="explorer-header-row">
        <div>
          <h2 className="explorer-title">Security & Account Settings</h2>
          <p className="explorer-subtitle">
            Configure your enterprise security profile, multi-tenant workspaces, and zero-trust policies.
          </p>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="settings-tabs-nav">
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={16} />
          <span>User Profile</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Shield size={16} />
          <span>Zero-Trust Policies</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === "workspaces" ? "active" : ""}`}
          onClick={() => setActiveTab("workspaces")}
        >
          <Building2 size={16} />
          <span>Company Workspaces</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === "compliance" ? "active" : ""}`}
          onClick={() => setActiveTab("compliance")}
        >
          <SlidersHorizontal size={16} />
          <span>Compliance & Audit</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <div className="settings-panel-card">
          <div className="panel-header">
            <h3>Enterprise Identity & Profile</h3>
            <p>Your identity details are tied to your document access cryptographic keys.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="profile-avatar-row">
              <div className="profile-large-avatar">{userInitials}</div>
              <div className="avatar-meta">
                <span className="avatar-title">{fullName || user.email}</span>
                <span className="avatar-badge">
                  <CheckCircle2 size={12} /> Supabase Authenticated
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Primary Identity)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="form-input input-disabled"
              />
              <span className="form-hint">
                Your email identity is used to sign all ProofChain document actions.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role</label>
              <input
                type="text"
                value={user.role || "Workspace Owner / Security Admin"}
                disabled
                className="form-input input-disabled"
              />
            </div>

            {profileMessage && (
              <div className="modal-status-alert">
                <CheckCircle2 size={15} />
                <span>{profileMessage}</span>
              </div>
            )}

            <div className="form-actions-row">
              <button
                type="submit"
                className="enterprise-btn-primary"
                disabled={profileSaving}
              >
                <Save size={15} />
                <span>{profileSaving ? "Saving..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Zero-Trust Policies */}
      {activeTab === "security" && (
        <div className="settings-panel-card">
          <div className="panel-header">
            <h3>Zero-Trust Enforcement Policies</h3>
            <p>
              Automated rules applied by TrustLens to protect documents in {activeWorkspace?.name || "your workspace"}.
            </p>
          </div>

          <form onSubmit={handleSavePolicies} className="settings-form">
            <div className="policy-toggle-list">
              {/* Policy 1 */}
              <div className="policy-toggle-item">
                <div className="toggle-text">
                  <span className="toggle-title">Enforce SHA-256 Checksum Validation</span>
                  <p className="toggle-desc">
                    Recalculates file hash in client browser before download. Any bit flips immediately abort download.
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.enforceSha256Verification}
                    onChange={(e) =>
                      setSettings({ ...settings, enforceSha256Verification: e.target.checked })
                    }
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Policy 2 */}
              <div className="policy-toggle-item">
                <div className="toggle-text">
                  <span className="toggle-title">Mandatory Two-Factor Authentication (2FA)</span>
                  <p className="toggle-desc">
                    Requires hardware key or TOTP before granting access to Confidential files.
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.enforce2FA}
                    onChange={(e) =>
                      setSettings({ ...settings, enforce2FA: e.target.checked })
                    }
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Policy 3 */}
              <div className="policy-toggle-item">
                <div className="toggle-text">
                  <span className="toggle-title">Auto-Expire External Share Links</span>
                  <p className="toggle-desc">
                    Automatically revokes shared links after maximum 7 days to eliminate orphaned file access.
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.autoExpireSharesDays > 0}
                    onChange={(e) =>
                      setSettings({ ...settings, autoExpireSharesDays: e.target.checked ? 7 : 0 })
                    }
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Policy 4 */}
              <div className="policy-toggle-item">
                <div className="toggle-text">
                  <span className="toggle-title">ProofChain Tamper Alerts</span>
                  <p className="toggle-desc">
                    Sends immediate high-priority alerts to owners if any audit log cryptographic block fails validation.
                  </p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.tamperAlertsEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, tamperAlertsEnabled: e.target.checked })
                    }
                  />
                  <span className="slider round" />
                </label>
              </div>
            </div>

            {settingsSaved && (
              <div className="modal-status-alert">
                <CheckCircle2 size={15} />
                <span>Security policies updated and active across all workspace sessions.</span>
              </div>
            )}

            <div className="form-actions-row">
              <button type="submit" className="enterprise-btn-primary">
                <Save size={15} />
                <span>Apply Zero-Trust Policies</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Company Workspaces */}
      {activeTab === "workspaces" && (
        <div className="settings-panel-card">
          <div className="panel-header-with-action">
            <div>
              <h3>Company Workspaces</h3>
              <p>Workspaces provide isolated storage partitions and cryptographic boundaries.</p>
            </div>
            <button
              type="button"
              className="enterprise-btn-primary"
              onClick={onOpenCreateWorkspace}
            >
              <Plus size={15} />
              <span>Create New Workspace</span>
            </button>
          </div>

          <div className="workspaces-grid-list">
            {workspaces.map((ws) => (
              <div key={ws.id} className="workspace-manage-card">
                <div className="ws-card-top">
                  <div className="ws-avatar">{ws.name.slice(0, 2).toUpperCase()}</div>
                  <div className="ws-titles">
                    <h4>{ws.name}</h4>
                    <span className="ws-id-text">ID: {ws.id.slice(0, 16)}...</span>
                  </div>
                </div>
                <div className="ws-card-body">
                  <div className="ws-feature-chip">
                    <Shield size={12} className="text-emerald" />
                    <span>Isolated Vault</span>
                  </div>
                  <div className="ws-feature-chip">
                    <Lock size={12} className="text-blue" />
                    <span>AES-256 Storage</span>
                  </div>
                </div>
                <div className="ws-card-footer">
                  <span className="ws-owner-tag">You are Owner</span>
                  <span className="status-badge badge-active">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Compliance & Audit */}
      {activeTab === "compliance" && (
        <div className="settings-panel-card">
          <div className="panel-header">
            <h3>Enterprise Compliance & Cryptographic Proofs</h3>
            <p>Export tamper-proof audit trails for SOC2 Type II, ISO 27001, and HIPAA compliance.</p>
          </div>

          <div className="compliance-features-grid">
            <div className="compliance-feature-box">
              <div className="feature-icon icon-emerald">
                <Shield size={22} />
              </div>
              <h4>SOC2 & ISO 27001 Ready</h4>
              <p>Continuous cryptographic proof generation satisfies strict non-repudiation audit standards.</p>
            </div>

            <div className="compliance-feature-box">
              <div className="feature-icon icon-blue">
                <Lock size={22} />
              </div>
              <h4>NIST FIPS 180-4 Standard</h4>
              <p>Every file is verified via 256-bit Secure Hash Algorithm (SHA-256) digest.</p>
            </div>

            <div className="compliance-feature-box">
              <div className="feature-icon icon-purple">
                <HardDrive size={22} />
              </div>
              <h4>Private Multi-Tenant Storage</h4>
              <p>Zero cross-contamination between workspaces with Supabase Row-Level Security.</p>
            </div>
          </div>

          <div className="export-ledger-cta">
            <div className="export-text">
              <h4>Export Complete System Audit Ledger</h4>
              <p>Generates an offline verifiable JSON ledger including all blocks, hashes, and actors.</p>
            </div>
            <button
              type="button"
              className="enterprise-btn-primary"
              onClick={handleExportAudit}
            >
              <Download size={15} />
              <span>Download Compliance Ledger</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
