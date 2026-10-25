import {
  Activity,
  FileText,
  Fingerprint,
  FileCheck2,
  Users,
  Settings,
  HardDrive,
  Shield,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
} from "lucide-react";
import type { Workspace } from "../types";

export type NavTab =
  | "dashboard"
  | "documents"
  | "trustlens"
  | "proofchain"
  | "members"
  | "settings";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  documentCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeWorkspace?: Workspace;
  onQuickUpload: () => void;
  storageUsedBytes: number;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  documentCount,
  collapsed,
  onToggleCollapse,
  activeWorkspace,
  onQuickUpload,
  storageUsedBytes,
}: SidebarProps) {
  const maxStorageBytes = 10 * 1024 * 1024 * 1024; // 10 GB quota
  const storagePercent = Math.min(
    Math.round((storageUsedBytes / maxStorageBytes) * 100),
    100
  );

  const formatStorage = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: Activity,
      badge: undefined,
      description: "Overview & Metrics",
    },
    {
      id: "documents" as NavTab,
      label: "Secure Documents",
      icon: FileText,
      badge: documentCount.toString(),
      description: "Encrypted File Vault",
    },
    {
      id: "trustlens" as NavTab,
      label: "TrustLens Decisions",
      icon: Fingerprint,
      badge: "LIVE",
      badgeColor: "emerald",
      description: "Zero-Trust Access Logic",
    },
    {
      id: "proofchain" as NavTab,
      label: "ProofChain Ledger",
      icon: FileCheck2,
      badge: "VERIFIED",
      badgeColor: "cyan",
      description: "Hash-Chain Audit Logs",
    },
    {
      id: "members" as NavTab,
      label: "Team & Permissions",
      icon: Users,
      badge: undefined,
      description: "Role-Based Access",
    },
    {
      id: "settings" as NavTab,
      label: "Settings & Security",
      icon: Settings,
      badge: undefined,
      description: "Policies & Profile",
    },
  ];

  return (
    <aside className={`enterprise-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Quick Action Button */}
      <div className="sidebar-action-container">
        <button
          type="button"
          className="sidebar-quick-upload-btn"
          onClick={onQuickUpload}
          title="Upload confidential file"
        >
          <UploadCloud size={18} />
          {!collapsed && <span>Upload Document</span>}
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-title">
          {!collapsed && <span>VAULT SERVICES</span>}
        </div>
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sidebar-nav-link ${isActive ? "active" : ""}`}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-nav-icon">
                    <Icon size={18} />
                  </span>
                  {!collapsed && (
                    <span className="sidebar-nav-content">
                      <span className="sidebar-nav-title">{item.label}</span>
                      <span className="sidebar-nav-sub">{item.description}</span>
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={`sidebar-nav-pill ${
                        item.badgeColor ? `pill-${item.badgeColor}` : ""
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Workspace Isolation Status Card */}
      {!collapsed && (
        <div className="sidebar-isolation-card">
          <div className="isolation-header">
            <Shield size={14} className="isolation-icon" />
            <span>COMPANY BOUNDARY</span>
          </div>
          <div className="isolation-body">
            <span className="isolation-title">
              {activeWorkspace?.name || "Company Workspace"}
            </span>
            <p className="isolation-desc">
              Strict multi-tenant cryptographic isolation is enforced for this workspace.
            </p>
          </div>
        </div>
      )}

      {/* Storage Quota Meter */}
      {!collapsed && (
        <div className="sidebar-storage-widget">
          <div className="storage-top">
            <span className="storage-label">
              <HardDrive size={13} /> Vault Storage
            </span>
            <span className="storage-value">{formatStorage(storageUsedBytes)} / 10 GB</span>
          </div>
          <div className="storage-meter-track">
            <div
              className="storage-meter-fill"
              style={{ width: `${Math.max(storagePercent, 4)}%` }}
            />
          </div>
          <div className="storage-footer">
            <span>AES-256-GCM Encrypted</span>
            <span className="storage-percent">{storagePercent}%</span>
          </div>
        </div>
      )}

      {/* Collapse Toggle Footer */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
