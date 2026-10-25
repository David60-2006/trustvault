import { useState } from "react";
import { Building2, X, Plus, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreateWorkspace,
  isLoading,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter an organization or workspace name.");
      return;
    }

    try {
      await onCreateWorkspace(trimmed);
      setSuccess(`Workspace "${trimmed}" created successfully. You are the assigned Owner.`);
      setName("");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create workspace.");
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="enterprise-modal create-ws-modal">
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-header-icon icon-blue">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="modal-title">Create Company Workspace</h3>
              <span className="modal-subtitle">
                Isolated cryptographic boundary for your organization
              </span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Company or Department Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Corporation, SecOps, Financial Audit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              maxLength={100}
              required
            />
            <span className="form-hint">
              Documents uploaded to this workspace will be isolated strictly from other workspaces.
            </span>
          </div>

          <div className="isolation-assurance-box">
            <ShieldCheck size={18} className="text-emerald" />
            <div className="box-text">
              <span className="box-title">Multi-Tenant Data Isolation</span>
              <p className="box-sub">
                Row-Level Security policies will automatically restrict document queries and storage tokens exclusively to members of this workspace.
              </p>
            </div>
          </div>

          {error && (
            <div className="modal-error-alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="modal-status-alert">
              <CheckCircle2 size={15} />
              <span>{success}</span>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="enterprise-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="enterprise-btn-primary"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner-sm" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Create Isolated Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
