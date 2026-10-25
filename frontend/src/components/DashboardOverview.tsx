import {
  UploadCloud,
  FileText,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Eye,
  Download,
  CheckCircle2,
  HardDrive,
} from "lucide-react";
import type { DocumentItem, AuditLogEntry, AccessDecision, Workspace, UserProfile } from "../types";
import type { NavTab } from "./Sidebar";
import { SummaryCards } from "./SummaryCards";
import { formatDate, truncateHash, formatBytes } from "../utils/crypto";

interface DashboardOverviewProps {
  user: UserProfile;
  activeWorkspace?: Workspace;
  documents: DocumentItem[];
  logs: AuditLogEntry[];
  decisions: AccessDecision[];
  proofChainVerified: boolean;
  onVerifyProofChain: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenCreateWorkspace: () => void;
  onPreviewDocument: (doc: DocumentItem) => void;
  onDownloadDocument: (doc: DocumentItem) => void;
}

export function DashboardOverview({
  user,
  activeWorkspace,
  documents,
  logs,
  decisions,
  proofChainVerified,
  onVerifyProofChain,
  onSelectTab,
  onOpenUpload,
  onOpenCreateWorkspace,
  onPreviewDocument,
  onDownloadDocument,
}: DashboardOverviewProps) {
  const recentDocs = documents.slice(0, 5);
  const recentLogs = logs.slice(0, 6);

  const storageUsedBytes = documents.reduce((acc, d) => acc + (d.size || 250000), 0);
  const activeSharesCount = documents.filter((d) => d.shared).length;
  const allowedDecisionsCount = decisions.filter((d) => d.decision === "ALLOWED").length;

  return (
    <div className="dashboard-overview-container">
      {/* Top Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-banner-left">
          <div className="welcome-tag">
            <span className="pulse-dot" />
            <span>ENTERPRISE COMMAND CENTER</span>
          </div>
          <h1 className="welcome-title">
            Welcome back, {user.fullName ? user.fullName.split(" ")[0] : "Commander"}
          </h1>
          <p className="welcome-subtitle">
            Your document vault in <strong>{activeWorkspace?.name || "Company Workspace"}</strong> is protected by zero-trust identity policies and continuous ProofChain cryptographic verification.
          </p>
        </div>

        <div className="welcome-banner-actions">
          <button
            type="button"
            className="enterprise-btn-secondary"
            onClick={onOpenCreateWorkspace}
          >
            <Building2 size={15} />
            <span>New Workspace</span>
          </button>

          <button
            type="button"
            className="enterprise-btn-primary"
            onClick={onOpenUpload}
          >
            <UploadCloud size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Empty Workspace Notification */}
      {!activeWorkspace && (
        <div className="workspace-empty-banner">
          <div className="empty-banner-content">
            <Building2 size={24} className="text-emerald" />
            <div>
              <h3>Create your company workspace</h3>
              <p>You haven't joined or created an isolated workspace yet. Create one to start securing confidential documents.</p>
            </div>
          </div>
          <button
            type="button"
            className="enterprise-btn-primary"
            onClick={onOpenCreateWorkspace}
          >
            <Building2 size={15} />
            <span>Create Company Workspace</span>
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <SummaryCards
        documentCount={documents.length}
        storageBytes={storageUsedBytes}
        activeSharesCount={activeSharesCount}
        totalDecisionsCount={decisions.length}
        allowedDecisionsCount={allowedDecisionsCount}
        proofChainVerified={proofChainVerified}
        onVerifyProofChain={onVerifyProofChain}
        onViewDocuments={() => onSelectTab("documents")}
        onViewTrustLens={() => onSelectTab("trustlens")}
      />

      {/* Two Column Layout */}
      <div className="dashboard-main-grid">
        {/* Left Column: Recent Documents & Security Posture */}
        <div className="grid-col-left">
          {/* Card: Recent Documents */}
          <div className="enterprise-panel-card">
            <div className="panel-card-header">
              <div className="panel-title-wrap">
                <FileText size={18} className="text-emerald" />
                <h3>Recent Vault Documents</h3>
                <span className="count-pill">{documents.length}</span>
              </div>
              <button
                type="button"
                className="panel-header-link"
                onClick={() => onSelectTab("documents")}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="recent-docs-list">
              {recentDocs.length === 0 ? (
                <div className="empty-panel-box">
                  <p>No documents uploaded yet to this workspace.</p>
                  <button
                    type="button"
                    className="enterprise-btn-primary"
                    onClick={onOpenUpload}
                  >
                    <UploadCloud size={14} />
                    <span>Upload First File</span>
                  </button>
                </div>
              ) : (
                recentDocs.map((doc) => (
                  <div key={doc.id} className="recent-doc-row">
                    <div className="recent-doc-left">
                      <div className="doc-type-icon">
                        <FileText size={16} />
                      </div>
                      <div className="doc-details">
                        <span
                          className="doc-name-clickable"
                          onClick={() => onPreviewDocument(doc)}
                        >
                          {doc.name}
                        </span>
                        <div className="doc-sub-meta">
                          <code className="doc-mini-hash">
                            SHA: {truncateHash(doc.sha256, 6, 4)}
                          </code>
                          <span>·</span>
                          <span>{formatBytes(doc.size || 250000)}</span>
                          <span>·</span>
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="recent-doc-right">
                      <span className="classification-pill-sm">
                        {doc.classification || "Confidential"}
                      </span>
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => onPreviewDocument(doc)}
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => onDownloadDocument(doc)}
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card: Zero-Trust Security Posture */}
          <div className="enterprise-panel-card">
            <div className="panel-card-header">
              <div className="panel-title-wrap">
                <ShieldCheck size={18} className="text-blue" />
                <h3>Zero-Trust Security Posture</h3>
              </div>
              <span className="security-grade-badge">GRADE A+ SECURED</span>
            </div>

            <div className="security-posture-grid">
              <div className="posture-item">
                <div className="posture-top">
                  <span className="posture-name">Row-Level Tenant Isolation</span>
                  <CheckCircle2 size={15} className="text-emerald" />
                </div>
                <p className="posture-desc">
                  Guarantees documents in {activeWorkspace?.name} cannot be read by other tenants.
                </p>
              </div>

              <div className="posture-item">
                <div className="posture-top">
                  <span className="posture-name">Cryptographic SHA-256 Hashing</span>
                  <CheckCircle2 size={15} className="text-emerald" />
                </div>
                <p className="posture-desc">
                  Every uploaded file is digested before write to prevent unauthorized payload tampering.
                </p>
              </div>

              <div className="posture-item">
                <div className="posture-top">
                  <span className="posture-name">TrustLens Decision Policy</span>
                  <CheckCircle2 size={15} className="text-emerald" />
                </div>
                <p className="posture-desc">
                  Real-time explainable access enforcement evaluating identity, role, and MFA context.
                </p>
              </div>

              <div className="posture-item">
                <div className="posture-top">
                  <span className="posture-name">Continuous ProofChain Ledger</span>
                  <CheckCircle2 size={15} className="text-emerald" />
                </div>
                <p className="posture-desc">
                  Audit events are cryptographically chained to guarantee immutable compliance trails.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live ProofChain Feed & Storage Meter */}
        <div className="grid-col-right">
          {/* ProofChain Live Audit Stream */}
          <div className="enterprise-panel-card">
            <div className="panel-card-header">
              <div className="panel-title-wrap">
                <Clock size={17} className="text-cyan" />
                <h3>ProofChain Live Activity</h3>
              </div>
              <button
                type="button"
                className="panel-header-link"
                onClick={() => onSelectTab("proofchain")}
              >
                <span>Full Ledger</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="live-activity-feed">
              {recentLogs.map((log) => (
                <div key={log.id} className="activity-feed-item">
                  <div className="activity-dot-line">
                    <span className="activity-dot" />
                    <span className="activity-line" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-top-row">
                      <span className="activity-action-label">
                        {log.action.replace("_", " ")}
                      </span>
                      <span className="activity-time">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <span className="activity-resource">{log.resource_name}</span>
                    <div className="activity-meta-row">
                      <span className="activity-actor">By {log.actor}</span>
                      <code className="activity-hash">
                        #{log.block_index} ({truncateHash(log.current_hash, 6, 4)})
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vault Storage Usage Breakdown */}
          <div className="enterprise-panel-card">
            <div className="panel-card-header">
              <div className="panel-title-wrap">
                <HardDrive size={17} className="text-purple" />
                <h3>Vault Storage Breakdown</h3>
              </div>
              <span className="storage-percent-chip">
                {formatBytes(storageUsedBytes)}
              </span>
            </div>

            <div className="storage-breakdown-body">
              <div className="storage-distribution-bar">
                <div className="bar-segment seg-pdf" style={{ width: "45%" }} title="PDF Documents (45%)" />
                <div className="bar-segment seg-sheet" style={{ width: "25%" }} title="Spreadsheets (25%)" />
                <div className="bar-segment seg-media" style={{ width: "15%" }} title="Media & Images (15%)" />
                <div className="bar-segment seg-other" style={{ width: "15%" }} title="Archives & Data (15%)" />
              </div>

              <div className="storage-legend-grid">
                <div className="legend-item">
                  <span className="legend-dot seg-pdf" />
                  <span className="legend-label">PDF Documents</span>
                  <span className="legend-val">45%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot seg-sheet" />
                  <span className="legend-label">Spreadsheets</span>
                  <span className="legend-val">25%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot seg-media" />
                  <span className="legend-label">Media & Images</span>
                  <span className="legend-val">15%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot seg-other" />
                  <span className="legend-label">Encrypted Blobs</span>
                  <span className="legend-val">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
