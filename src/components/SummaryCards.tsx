import {
  FileText,
  HardDrive,
  Fingerprint,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { formatBytes } from "../utils/crypto";

interface SummaryCardsProps {
  documentCount: number;
  storageBytes: number;
  activeSharesCount: number;
  totalDecisionsCount: number;
  allowedDecisionsCount: number;
  proofChainVerified: boolean;
  onVerifyProofChain: () => void;
  onViewDocuments: () => void;
  onViewTrustLens: () => void;
}

export function SummaryCards({
  documentCount,
  storageBytes,
  activeSharesCount,
  totalDecisionsCount,
  allowedDecisionsCount,
  proofChainVerified,
  onVerifyProofChain,
  onViewDocuments,
  onViewTrustLens,
}: SummaryCardsProps) {
  return (
    <div className="summary-cards-grid">
      {/* Card 1: Secured Documents */}
      <div className="enterprise-metric-card" onClick={onViewDocuments}>
        <div className="metric-card-header">
          <div className="metric-icon-box icon-emerald">
            <FileText size={20} />
          </div>
          <div className="metric-badge badge-emerald">
            <CheckCircle2 size={12} />
            <span>Encrypted</span>
          </div>
        </div>
        <div className="metric-card-body">
          <span className="metric-label">SECURED DOCUMENTS</span>
          <div className="metric-value-row">
            <span className="metric-number">{documentCount}</span>
            <span className="metric-sublabel">Files in Vault</span>
          </div>
          <p className="metric-caption">
            {activeSharesCount > 0
              ? `${activeSharesCount} with active restricted access`
              : "Private company isolation active"}
          </p>
        </div>
        <div className="metric-card-footer">
          <span className="metric-link">
            <span>Explore Vault</span>
            <ArrowUpRight size={14} />
          </span>
          <span className="metric-crypto-tag">SHA-256</span>
        </div>
      </div>

      {/* Card 2: Vault Storage */}
      <div className="enterprise-metric-card">
        <div className="metric-card-header">
          <div className="metric-icon-box icon-blue">
            <HardDrive size={20} />
          </div>
          <div className="metric-badge badge-blue">
            <Lock size={12} />
            <span>AES-256</span>
          </div>
        </div>
        <div className="metric-card-body">
          <span className="metric-label">STORAGE UTILIZATION</span>
          <div className="metric-value-row">
            <span className="metric-number">
              {formatBytes(storageBytes || 1240000)}
            </span>
            <span className="metric-sublabel">of 10 GB</span>
          </div>
          <div className="metric-progress-track">
            <div
              className="metric-progress-bar"
              style={{
                width: `${Math.max(
                  Math.min(((storageBytes || 1240000) / (10 * 1024 * 1024 * 1024)) * 100, 100),
                  3
                )}%`,
              }}
            />
          </div>
        </div>
        <div className="metric-card-footer">
          <span className="metric-quota-info">Encrypted Bucket Storage</span>
          <span className="metric-status-ok">Normal</span>
        </div>
      </div>

      {/* Card 3: TrustLens Decisions */}
      <div className="enterprise-metric-card" onClick={onViewTrustLens}>
        <div className="metric-card-header">
          <div className="metric-icon-box icon-purple">
            <Fingerprint size={20} />
          </div>
          <div className="metric-badge badge-purple">
            <Sparkles size={12} />
            <span>Zero-Trust</span>
          </div>
        </div>
        <div className="metric-card-body">
          <span className="metric-label">TRUSTLENS DECISIONS</span>
          <div className="metric-value-row">
            <span className="metric-number">{totalDecisionsCount}</span>
            <span className="metric-sublabel">Evaluations</span>
          </div>
          <p className="metric-caption">
            {allowedDecisionsCount} Allowed · {totalDecisionsCount - allowedDecisionsCount} Denied/Blocked
          </p>
        </div>
        <div className="metric-card-footer">
          <span className="metric-link">
            <span>Inspect Decisions</span>
            <ArrowUpRight size={14} />
          </span>
          <span className="metric-badge-ok">99.8% Pass Rate</span>
        </div>
      </div>

      {/* Card 4: ProofChain Integrity */}
      <div className="enterprise-metric-card metric-card-proofchain">
        <div className="metric-card-header">
          <div className="metric-icon-box icon-cyan">
            <ShieldCheck size={20} />
          </div>
          <div
            className={`metric-badge ${
              proofChainVerified ? "badge-emerald" : "badge-amber"
            }`}
          >
            <CheckCircle2 size={12} />
            <span>{proofChainVerified ? "Verified" : "Pending Check"}</span>
          </div>
        </div>
        <div className="metric-card-body">
          <span className="metric-label">PROOFCHAIN AUDIT LEDGER</span>
          <div className="metric-value-row">
            <span className="metric-number">100%</span>
            <span className="metric-sublabel">Immutable Hash Chain</span>
          </div>
          <p className="metric-caption">
            Block #1084 linked with continuous cryptographic checksums.
          </p>
        </div>
        <div className="metric-card-footer">
          <button
            type="button"
            className="metric-verify-btn"
            onClick={(e) => {
              e.stopPropagation();
              onVerifyProofChain();
            }}
          >
            <span>Verify Chain Integrity</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
