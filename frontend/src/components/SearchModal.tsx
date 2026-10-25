import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  FileCheck2,
  Fingerprint,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import type { DocumentItem, AuditLogEntry } from "../types";
import type { NavTab } from "./Sidebar";
import { truncateHash } from "../utils/crypto";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  logs: AuditLogEntry[];
  onSelectDocument: (doc: DocumentItem) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  documents,
  logs,
  onSelectDocument,
  onNavigateTab,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingDocs = q
    ? documents.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.sha256.toLowerCase().includes(q) ||
          d.storage_path.toLowerCase().includes(q)
      )
    : documents.slice(0, 4);

  const matchingLogs = q
    ? logs.filter(
        (l) =>
          l.resource_name.toLowerCase().includes(q) ||
          l.actor.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      )
    : logs.slice(0, 3);

  return (
    <div
      className="modal-backdrop omnibox-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="enterprise-modal omnibox-modal">
        <div className="omnibox-input-row">
          <Search size={20} className="omnibox-search-icon" />
          <input
            type="text"
            placeholder="Search documents, cryptographic SHA-256 digests, actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="omnibox-input"
          />
          <button
            type="button"
            className="omnibox-close-btn"
            onClick={onClose}
          >
            <kbd>ESC</kbd>
          </button>
        </div>

        <div className="omnibox-results">
          {/* Section: Documents */}
          <div className="omnibox-section">
            <span className="section-title">SECURED DOCUMENTS ({matchingDocs.length})</span>
            {matchingDocs.length === 0 ? (
              <p className="no-results">No documents matching "{query}"</p>
            ) : (
              matchingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="omnibox-result-item"
                  onClick={() => {
                    onSelectDocument(doc);
                    onClose();
                  }}
                >
                  <div className="result-icon icon-blue">
                    <FileText size={16} />
                  </div>
                  <div className="result-meta">
                    <span className="result-title">{doc.name}</span>
                    <span className="result-sub">
                      SHA-256: {truncateHash(doc.sha256, 10, 8)} · {doc.classification || "Confidential"}
                    </span>
                  </div>
                  <ArrowRight size={14} className="result-arrow" />
                </div>
              ))
            )}
          </div>

          {/* Section: ProofChain Audit Events */}
          <div className="omnibox-section">
            <span className="section-title">PROOFCHAIN AUDIT LOGS</span>
            {matchingLogs.map((log) => (
              <div
                key={log.id}
                className="omnibox-result-item"
                onClick={() => {
                  onNavigateTab("proofchain");
                  onClose();
                }}
              >
                <div className="result-icon icon-emerald">
                  <FileCheck2 size={16} />
                </div>
                <div className="result-meta">
                  <span className="result-title">{log.action}: {log.resource_name}</span>
                  <span className="result-sub">
                    By {log.actor} · Block #{log.block_index}
                  </span>
                </div>
                <ArrowRight size={14} className="result-arrow" />
              </div>
            ))}
          </div>

          {/* Section: Quick Navigation */}
          <div className="omnibox-section">
            <span className="section-title">QUICK NAVIGATION</span>
            <div className="quick-nav-grid">
              <button
                type="button"
                className="quick-nav-pill"
                onClick={() => {
                  onNavigateTab("dashboard");
                  onClose();
                }}
              >
                <Layers size={13} />
                <span>Dashboard Overview</span>
              </button>
              <button
                type="button"
                className="quick-nav-pill"
                onClick={() => {
                  onNavigateTab("documents");
                  onClose();
                }}
              >
                <FileText size={13} />
                <span>Document Vault</span>
              </button>
              <button
                type="button"
                className="quick-nav-pill"
                onClick={() => {
                  onNavigateTab("trustlens");
                  onClose();
                }}
              >
                <Fingerprint size={13} />
                <span>TrustLens Decisions</span>
              </button>
              <button
                type="button"
                className="quick-nav-pill"
                onClick={() => {
                  onNavigateTab("settings");
                  onClose();
                }}
              >
                <Shield size={13} />
                <span>Security Policies</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
