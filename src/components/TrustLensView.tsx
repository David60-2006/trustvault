import { useState } from "react";
import {
  Fingerprint,
  CheckCircle2,
  XCircle,
  Sparkles,
  Play,
} from "lucide-react";
import type { AccessDecision, DocumentItem, Workspace } from "../types";
import { formatDate } from "../utils/crypto";

interface TrustLensViewProps {
  decisions: AccessDecision[];
  documents: DocumentItem[];
  activeWorkspace?: Workspace;
  onSimulateDecision: (decision: Omit<AccessDecision, "id" | "timestamp">) => void;
}

export function TrustLensView({
  decisions,
  documents,
  activeWorkspace,
  onSimulateDecision,
}: TrustLensViewProps) {
  const [filterDecision, setFilterDecision] = useState<"ALL" | "ALLOWED" | "DENIED">("ALL");
  const [selectedDecision, setSelectedDecision] = useState<AccessDecision | null>(
    decisions[0] || null
  );

  // Simulator State
  const [simRole, setSimRole] = useState("owner");
  const [simAction, setSimAction] = useState("DOWNLOAD");
  const [simDocument, setSimDocument] = useState(documents[0]?.name || "Q3-Financials.pdf");
  const [simMFA, setSimMFA] = useState(true);

  const filteredDecisions = decisions.filter((d) => {
    if (filterDecision !== "ALL" && d.decision !== filterDecision) return false;
    return true;
  });

  const handleRunSimulation = () => {
    const isAllowed = simRole === "owner" || (simRole === "member" && simAction !== "SHARE" && simMFA);
    const newDecision: Omit<AccessDecision, "id" | "timestamp"> = {
      subject: simRole === "owner" ? "security.officer@company.com" : "developer@contractor.io",
      role: simRole,
      action: simAction,
      resource: simDocument,
      decision: isAllowed ? "ALLOWED" : "DENIED",
      risk_score: isAllowed ? 12 : 88,
      reason: isAllowed
        ? `Policy TRUST-01 passed: ${simRole.toUpperCase()} has valid role clearance and active MFA session.`
        : `Policy VIOLATION: ${simRole.toUpperCase()} is unauthorized to perform ${simAction} on ${simDocument} without elevated security tokens.`,
      policy_matched: isAllowed ? "POL-RBAC-ZERO-TRUST-01" : "POL-DENY-EXTERNAL-EXPORT",
      ip_address: isAllowed ? "192.168.1.104" : "198.51.100.42 (Untrusted Geo)",
      mfa_verified: simMFA,
    };

    onSimulateDecision(newDecision);
  };

  const allowedCount = decisions.filter((d) => d.decision === "ALLOWED").length;
  const deniedCount = decisions.filter((d) => d.decision === "DENIED").length;

  return (
    <div className="trustlens-container">
      {/* Header Banner */}
      <div className="trustlens-hero-banner">
        <div className="trustlens-hero-content">
          <div className="trustlens-badge">
            <Fingerprint size={16} />
            <span>EXPLAINABLE ZERO-TRUST POLICY ENGINE</span>
          </div>
          <h2>TrustLens Access Inspector</h2>
          <p>
            Every document access request is verified dynamically against identity, workspace boundary,
            device risk, and cryptographic permissions. Never trust, always verify.
          </p>
        </div>

        <div className="trustlens-stats-grid">
          <div className="lens-stat-card">
            <span className="stat-label">Total Evaluated</span>
            <span className="stat-number">{decisions.length}</span>
            <span className="stat-trend text-emerald">100% Policy Enforced</span>
          </div>
          <div className="lens-stat-card">
            <span className="stat-label">Allowed</span>
            <span className="stat-number text-emerald">{allowedCount}</span>
            <span className="stat-sub">Identity-Verified</span>
          </div>
          <div className="lens-stat-card">
            <span className="stat-label">Threats Blocked</span>
            <span className="stat-number text-crimson">{deniedCount}</span>
            <span className="stat-sub">Unauthorized Blocked</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="trustlens-columns">
        {/* Left Column: Decision Log Table */}
        <div className="trustlens-left-col">
          <div className="lens-table-card">
            <div className="lens-card-header">
              <div className="lens-header-left">
                <span className="lens-table-title">Access Decision Stream</span>
                <span className="count-pill">{filteredDecisions.length}</span>
              </div>
              <div className="lens-filter-pills">
                <button
                  type="button"
                  className={`pill-btn ${filterDecision === "ALL" ? "active" : ""}`}
                  onClick={() => setFilterDecision("ALL")}
                >
                  All ({decisions.length})
                </button>
                <button
                  type="button"
                  className={`pill-btn pill-emerald ${filterDecision === "ALLOWED" ? "active" : ""}`}
                  onClick={() => setFilterDecision("ALLOWED")}
                >
                  Allowed ({allowedCount})
                </button>
                <button
                  type="button"
                  className={`pill-btn pill-crimson ${filterDecision === "DENIED" ? "active" : ""}`}
                  onClick={() => setFilterDecision("DENIED")}
                >
                  Denied ({deniedCount})
                </button>
              </div>
            </div>

            <div className="lens-table-body">
              {filteredDecisions.map((d) => {
                const isSelected = selectedDecision?.id === d.id;
                const isAllowed = d.decision === "ALLOWED";

                return (
                  <div
                    key={d.id}
                    className={`decision-stream-item ${isSelected ? "selected" : ""} ${
                      isAllowed ? "decision-item-allowed" : "decision-item-denied"
                    }`}
                    onClick={() => setSelectedDecision(d)}
                  >
                    <div className="decision-item-icon">
                      {isAllowed ? (
                        <CheckCircle2 size={18} className="text-emerald" />
                      ) : (
                        <XCircle size={18} className="text-crimson" />
                      )}
                    </div>
                    <div className="decision-item-main">
                      <div className="decision-item-top">
                        <span className="decision-subject">{d.subject}</span>
                        <span
                          className={`decision-badge ${
                            isAllowed ? "badge-allowed" : "badge-denied"
                          }`}
                        >
                          {d.decision}
                        </span>
                      </div>
                      <div className="decision-item-action-row">
                        <span className="action-tag">{d.action}</span>
                        <span className="resource-name">{d.resource}</span>
                      </div>
                      <div className="decision-item-meta">
                        <span>{formatDate(d.timestamp)}</span>
                        <span>·</span>
                        <span>Risk Score: {d.risk_score}/100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Explainability Panel & Policy Simulator */}
        <div className="trustlens-right-col">
          {/* Detailed Decision Explainability Card */}
          {selectedDecision ? (
            <div className="explainability-card">
              <div className="explain-header">
                <div className="explain-header-left">
                  <Sparkles size={18} className="text-emerald" />
                  <h3>Decision Explainability Breakdown</h3>
                </div>
                <span
                  className={`decision-badge ${
                    selectedDecision.decision === "ALLOWED"
                      ? "badge-allowed"
                      : "badge-denied"
                  }`}
                >
                  {selectedDecision.decision}
                </span>
              </div>

              <div className="explain-reason-box">
                <span className="box-title">EVALUATION SUMMARY</span>
                <p className="reason-text">{selectedDecision.reason}</p>
              </div>

              <div className="policy-vector-list">
                <div className="vector-row">
                  <span className="vector-name">Matched Policy</span>
                  <code className="vector-code">{selectedDecision.policy_matched}</code>
                </div>
                <div className="vector-row">
                  <span className="vector-name">User Role & Identity</span>
                  <span className="vector-val">{selectedDecision.role.toUpperCase()} ({selectedDecision.subject})</span>
                </div>
                <div className="vector-row">
                  <span className="vector-name">Target Resource</span>
                  <span className="vector-val">{selectedDecision.resource}</span>
                </div>
                <div className="vector-row">
                  <span className="vector-name">Origin IP & Network</span>
                  <code className="vector-code">{selectedDecision.ip_address}</code>
                </div>
                <div className="vector-row">
                  <span className="vector-name">Two-Factor Authentication</span>
                  <span className="vector-val text-emerald">
                    {selectedDecision.mfa_verified ? "Verified via Hardware Token" : "Unverified"}
                  </span>
                </div>
                <div className="vector-row">
                  <span className="vector-name">Calculated Risk Factor</span>
                  <span className={`vector-val ${selectedDecision.risk_score < 30 ? "text-emerald" : "text-crimson"}`}>
                    {selectedDecision.risk_score}% ({selectedDecision.risk_score < 30 ? "Low Risk" : "High Risk"})
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="explainability-card empty-explain">
              <p>Select any decision from the left to inspect its explainability breakdown.</p>
            </div>
          )}

          {/* Policy Decision Simulator */}
          <div className="simulator-card">
            <div className="sim-header">
              <Play size={16} className="text-cyan" />
              <h4>Zero-Trust Policy Simulator</h4>
            </div>
            <p className="sim-desc">
              Test how TrustLens evaluates incoming access requests for documents in {activeWorkspace?.name || "your workspace"}.
            </p>

            <div className="sim-form-grid">
              <div className="sim-field">
                <label>Actor Role</label>
                <select value={simRole} onChange={(e) => setSimRole(e.target.value)}>
                  <option value="owner">Workspace Owner</option>
                  <option value="admin">Security Administrator</option>
                  <option value="member">Team Member</option>
                  <option value="external">External Guest (Contractor)</option>
                </select>
              </div>

              <div className="sim-field">
                <label>Action</label>
                <select value={simAction} onChange={(e) => setSimAction(e.target.value)}>
                  <option value="READ">Read / Preview</option>
                  <option value="DOWNLOAD">Download Binary</option>
                  <option value="SHARE">Generate Share Link</option>
                  <option value="REVOKE">Revoke Permissions</option>
                </select>
              </div>

              <div className="sim-field">
                <label>Target Document</label>
                <select value={simDocument} onChange={(e) => setSimDocument(e.target.value)}>
                  {documents.length > 0 ? (
                    documents.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))
                  ) : (
                    <option value="Q3-Financials.pdf">Q3-Financials.pdf</option>
                  )}
                </select>
              </div>

              <div className="sim-field">
                <label>MFA Verified</label>
                <select
                  value={simMFA ? "true" : "false"}
                  onChange={(e) => setSimMFA(e.target.value === "true")}
                >
                  <option value="true">Yes (Active FIDO2/TOTP)</option>
                  <option value="false">No (Single-Factor Only)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="enterprise-btn-primary w-full sim-btn"
              onClick={handleRunSimulation}
            >
              <Sparkles size={15} />
              <span>Evaluate Access with TrustLens</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
