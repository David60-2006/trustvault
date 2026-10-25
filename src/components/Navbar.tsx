import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  ChevronDown,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Plus,
  Check,
  CheckCircle2,
  Menu,
  X,
  FileText,
} from "lucide-react";
import type { Workspace, UserProfile } from "../types";

interface NavbarProps {
  user: UserProfile;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onOpenCreateWorkspace: () => void;
  onSignOut: () => void;
  onOpenSettings: (tab?: string) => void;
  onOpenSearch: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export function Navbar({
  user,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenCreateWorkspace,
  onSignOut,
  onOpenSettings,
  onOpenSearch,
  mobileMenuOpen,
  onToggleMobileMenu,
}: NavbarProps) {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || {
    id: activeWorkspaceId,
    name: "Default Workspace",
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: "1",
      title: "ProofChain Block Verified",
      time: "2 mins ago",
      desc: "SHA-256 chain integrity verified at block #1084",
      read: false,
    },
    {
      id: "2",
      title: "Zero-Trust Policy Enforced",
      time: "15 mins ago",
      desc: "Session authenticated with company cryptographic key",
      read: false,
    },
    {
      id: "3",
      title: "Company Isolation Active",
      time: "1 hour ago",
      desc: `All document streams restricted to ${activeWorkspace.name}`,
      read: true,
    },
  ];

  const userInitials = (user.fullName || user.email || "TV")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="enterprise-navbar">
      <div className="navbar-left">
        <button
          className="mobile-nav-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="navbar-brand">
          <div className="brand-shield-glow">
            <ShieldCheck size={22} className="brand-shield-icon" />
          </div>
          <div className="brand-meta">
            <div className="brand-title-row">
              <span className="brand-name">TrustVault</span>
              <span className="enterprise-badge">ENTERPRISE</span>
            </div>
            <span className="brand-subtitle">Zero-Trust Document Security</span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="workspace-dropdown-container" ref={workspaceRef}>
          <button
            type="button"
            className="workspace-selector-btn"
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            title="Switch Workspace"
          >
            <div className="workspace-btn-icon">
              <span className="workspace-initial">
                {activeWorkspace.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="workspace-btn-text">
              <span className="workspace-label">WORKSPACE</span>
              <span className="workspace-active-name">{activeWorkspace.name}</span>
            </div>
            <ChevronDown size={14} className={`dropdown-chevron ${workspaceMenuOpen ? "open" : ""}`} />
          </button>

          {workspaceMenuOpen && (
            <div className="enterprise-dropdown-menu workspace-menu">
              <div className="dropdown-header">
                <span>Select Company Workspace</span>
                <span className="count-pill">{workspaces.length}</span>
              </div>
              <div className="workspace-list">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    className={`workspace-item ${ws.id === activeWorkspaceId ? "active" : ""}`}
                    onClick={() => {
                      onSelectWorkspace(ws.id);
                      setWorkspaceMenuOpen(false);
                    }}
                  >
                    <div className="workspace-item-info">
                      <div className="workspace-item-avatar">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="workspace-item-names">
                        <span className="ws-name">{ws.name}</span>
                        <span className="ws-meta">Isolated Storage · AES-256</span>
                      </div>
                    </div>
                    {ws.id === activeWorkspaceId && (
                      <Check size={16} className="ws-checked" />
                    )}
                  </button>
                ))}
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-action-btn"
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  onOpenCreateWorkspace();
                }}
              >
                <Plus size={15} />
                <span>Create Company Workspace</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar (Omnibox) */}
      <div className="navbar-center">
        <button
          type="button"
          className="enterprise-search-trigger"
          onClick={onOpenSearch}
          title="Search documents and audit logs (Ctrl+K)"
        >
          <Search size={15} className="search-icon" />
          <span className="search-placeholder">
            Search documents, SHA-256 hashes, audit logs...
          </span>
          <span className="search-shortcut">
            <kbd>Ctrl</kbd> <kbd>K</kbd>
          </span>
        </button>
      </div>

      {/* Navbar Right Actions */}
      <div className="navbar-right">
        {/* Security Health Indicator */}
        <div className="security-status-indicator" title="Enterprise Zero-Trust Active">
          <span className="security-pulse-dot" />
          <span className="security-label">Zero-Trust Active</span>
        </div>

        {/* Notifications */}
        <div className="notif-container" ref={notifRef}>
          <button
            type="button"
            className="navbar-icon-btn notif-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="notif-badge">3</span>
          </button>

          {notificationsOpen && (
            <div className="enterprise-dropdown-menu notifications-menu">
              <div className="dropdown-header">
                <span>Security Notifications</span>
                <span className="text-link" onClick={() => setNotificationsOpen(false)}>Close</span>
              </div>
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
                    <div className="notif-indicator">
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="notif-content">
                      <div className="notif-top">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-time">{n.time}</span>
                      </div>
                      <p className="notif-desc">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button
                  type="button"
                  className="dropdown-footer-btn"
                  onClick={() => {
                    setNotificationsOpen(false);
                    onOpenSettings("audit");
                  }}
                >
                  <FileText size={13} />
                  <span>View All ProofChain Logs</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="user-profile-container" ref={userRef}>
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="User profile menu"
          >
            <div className="user-avatar-badge">{userInitials}</div>
            <div className="user-info-text">
              <span className="user-name-display">{user.fullName || "Security Admin"}</span>
              <span className="user-role-badge">Owner</span>
            </div>
            <ChevronDown size={14} className={`dropdown-chevron ${userMenuOpen ? "open" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="enterprise-dropdown-menu user-menu">
              <div className="user-menu-header">
                <div className="user-menu-avatar">{userInitials}</div>
                <div className="user-menu-meta">
                  <div className="user-full-name">{user.fullName || "Security Officer"}</div>
                  <div className="user-email-text">{user.email}</div>
                  <span className="user-verified-chip">
                    <CheckCircle2 size={11} /> Verified Account
                  </span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="user-menu-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenSettings("profile");
                }}
              >
                <User size={15} />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                className="user-menu-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenSettings("security");
                }}
              >
                <Settings size={15} />
                <span>Security & Zero-Trust Settings</span>
              </button>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="user-menu-item sign-out-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  onSignOut();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
