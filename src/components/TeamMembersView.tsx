import { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  X,
  Mail,
  Crown,
  Key,
} from "lucide-react";
import type { WorkspaceMember, Workspace, UserProfile } from "../types";
import { formatDate } from "../utils/crypto";

interface TeamMembersViewProps {
  members: WorkspaceMember[];
  activeWorkspace?: Workspace;
  currentUser: UserProfile;
  onInviteMember: (email: string, role: "owner" | "admin" | "member" | "auditor") => void;
  onRevokeMember: (memberId: string) => void;
}

export function TeamMembersView({
  members,
  activeWorkspace,
  currentUser,
  onInviteMember,
  onRevokeMember,
}: TeamMembersViewProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "admin" | "member" | "auditor">("member");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setInviteError("Please enter a valid corporate email address.");
      return;
    }

    onInviteMember(inviteEmail.trim(), inviteRole);
    setInviteSuccess(`Invitation sent to ${inviteEmail} with role: ${inviteRole.toUpperCase()}`);
    setInviteEmail("");
    setTimeout(() => {
      setInviteSuccess("");
      setInviteModalOpen(false);
    }, 1500);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <span className="role-chip chip-owner">
            <Crown size={12} /> Owner
          </span>
        );
      case "admin":
        return (
          <span className="role-chip chip-admin">
            <Shield size={12} /> Security Admin
          </span>
        );
      case "auditor":
        return (
          <span className="role-chip chip-auditor">
            <Key size={12} /> Compliance Auditor
          </span>
        );
      default:
        return (
          <span className="role-chip chip-member">
            <Users size={12} /> Member
          </span>
        );
    }
  };

  return (
    <div className="team-members-container">
      {/* Header Row */}
      <div className="explorer-header-row">
        <div>
          <h2 className="explorer-title">Workspace Team & Role Permissions</h2>
          <p className="explorer-subtitle">
            Manage authorized users with strict company boundary isolation for{" "}
            <strong>{activeWorkspace?.name || "this workspace"}</strong>.
          </p>
        </div>

        <button
          type="button"
          className="enterprise-btn-primary"
          onClick={() => {
            setInviteError("");
            setInviteSuccess("");
            setInviteModalOpen(true);
          }}
        >
          <UserPlus size={16} />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Isolation Notice Banner */}
      <div className="members-isolation-banner">
        <ShieldCheck size={20} className="text-emerald" />
        <div className="banner-content">
          <span className="banner-title">Multi-Tenant Access Enforcement</span>
          <p className="banner-desc">
            Members of this workspace can only view documents uploaded to {activeWorkspace?.name}. Cross-organization access is cryptographically blocked by row-level security.
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="enterprise-table-wrapper">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email Address</th>
              <th>Workspace Role</th>
              <th>Security Clearance</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isCurrentUser = member.user_id === currentUser.id || member.email === currentUser.email;

              return (
                <tr key={member.id} className="table-row">
                  <td>
                    <div className="member-name-cell">
                      <div className="member-avatar">
                        {(member.full_name || member.email)
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="member-meta">
                        <span className="member-name">{member.full_name}</span>
                        {isCurrentUser && (
                          <span className="you-pill">You</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="email-text">{member.email}</span>
                  </td>

                  <td>{getRoleBadge(member.role)}</td>

                  <td>
                    <span className="clearance-badge">
                      {member.role === "owner" || member.role === "admin"
                        ? "Full Vault Access"
                        : "Workspace Read & Upload"}
                    </span>
                  </td>

                  <td>
                    <span className={`status-badge badge-${member.status}`}>
                      <CheckCircle2 size={11} />
                      <span style={{ textTransform: "capitalize" }}>{member.status}</span>
                    </span>
                  </td>

                  <td>
                    <span className="date-text">{formatDate(member.joined_at)}</span>
                  </td>

                  <td>
                    {!isCurrentUser && member.role !== "owner" ? (
                      <button
                        type="button"
                        className="action-icon-btn btn-danger"
                        onClick={() => onRevokeMember(member.id)}
                        title="Revoke workspace access"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <span className="locked-action">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInviteModalOpen(false);
          }}
        >
          <div className="enterprise-modal invite-modal">
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-header-icon icon-emerald">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Invite Team Member</h3>
                  <span className="modal-subtitle">
                    Grant access to {activeWorkspace?.name || "Workspace"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setInviteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Corporate Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-left-icon" />
                  <input
                    type="email"
                    placeholder="colleague@yourcompany.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role & Permissions</label>
                <div className="role-select-cards">
                  <div
                    className={`role-choice-card ${inviteRole === "member" ? "active" : ""}`}
                    onClick={() => setInviteRole("member")}
                  >
                    <span className="role-title">Member</span>
                    <span className="role-desc">Can upload and read documents in this workspace</span>
                  </div>

                  <div
                    className={`role-choice-card ${inviteRole === "admin" ? "active" : ""}`}
                    onClick={() => setInviteRole("admin")}
                  >
                    <span className="role-title">Security Admin</span>
                    <span className="role-desc">Can manage sharing, invite members, and configure vault</span>
                  </div>

                  <div
                    className={`role-choice-card ${inviteRole === "auditor" ? "active" : ""}`}
                    onClick={() => setInviteRole("auditor")}
                  >
                    <span className="role-title">Auditor</span>
                    <span className="role-desc">Read-only access to ProofChain and TrustLens audit logs</span>
                  </div>
                </div>
              </div>

              {inviteError && (
                <div className="modal-error-alert">
                  <span>{inviteError}</span>
                </div>
              )}

              {inviteSuccess && (
                <div className="modal-status-alert">
                  <span>{inviteSuccess}</span>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="enterprise-btn-secondary"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="enterprise-btn-primary">
                  <UserPlus size={15} />
                  <span>Send Workspace Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
