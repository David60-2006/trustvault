import React, { useState, useMemo } from "react";
import {
  Search,
  UploadCloud,
  FileText,
  File,
  Download,
  Share2,
  Trash2,
  Eye,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Layers,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  AlertCircle,
  X,
  Shield,
  Sparkles,
} from "lucide-react";
import type { DocumentItem, Workspace } from "../types";
import { formatBytes, formatDate, truncateHash, calculateSHA256 } from "../utils/crypto";

interface DocumentExplorerProps {
  documents: DocumentItem[];
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onUploadDocument: (file: File, workspaceId: string, classification: string) => Promise<void>;
  onDownloadDocument: (doc: DocumentItem) => Promise<void>;
  onShareDocument: (doc: DocumentItem, role: "viewer" | "editor", expiresInHours: number) => Promise<string>;
  onRevokeShare: (doc: DocumentItem) => Promise<void>;
  onDeleteDocument: (doc: DocumentItem) => Promise<void>;
  isUploading: boolean;
  uploadMessage: string;
}

export function DocumentExplorer({
  documents,
  workspaces,
  activeWorkspaceId,
  onUploadDocument,
  onDownloadDocument,
  onShareDocument,
  onRevokeShare,
  onDeleteDocument,
  isUploading,
  uploadMessage,
}: DocumentExplorerProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedClassification, setSelectedClassification] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "name_asc" | "size_desc">("date_desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection state
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [shareDoc, setShareDoc] = useState<DocumentItem | null>(null);
  const [generatedShareLink, setGeneratedShareLink] = useState<string | null>(null);
  const [shareRole, setShareRole] = useState<"viewer" | "editor">("viewer");
  const [shareExpiryHours, setShareExpiryHours] = useState<number>(24);
  const [shareCopied, setShareCopied] = useState(false);

  // Upload modal local state
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [modalWorkspaceId, setModalWorkspaceId] = useState(activeWorkspaceId);
  const [modalClassification, setModalClassification] = useState<"Confidential" | "Restricted" | "Internal">("Confidential");
  const [modalSha256, setModalSha256] = useState<string>("");
  const [modalCalculatingHash, setModalCalculatingHash] = useState(false);
  const [modalError, setModalError] = useState<string>("");

  // Helper to determine file icon
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText size={18} className="file-icon-pdf" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet size={18} className="file-icon-sheet" />;
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return <FileArchive size={18} className="file-icon-archive" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "svg":
      case "webp":
        return <ImageIcon size={18} className="file-icon-image" />;
      case "ts":
      case "js":
      case "json":
      case "py":
      case "sh":
        return <FileCode size={18} className="file-icon-code" />;
      default:
        return <File size={18} className="file-icon-generic" />;
    }
  };

  // Handle file select in upload modal
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setModalError("File size exceeds 10 MB limit.");
      return;
    }

    setModalFile(file);
    setModalCalculatingHash(true);
    try {
      const buffer = await file.arrayBuffer();
      const hash = await calculateSHA256(buffer);
      setModalSha256(hash);
    } catch (err) {
      console.error("Hash calculation failed", err);
    } finally {
      setModalCalculatingHash(false);
    }
  };

  // Submit file upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    if (!modalFile) {
      setModalError("Please select a file to upload.");
      return;
    }
    const targetWs = modalWorkspaceId || activeWorkspaceId;
    if (!targetWs) {
      setModalError("Please select a company workspace.");
      return;
    }

    try {
      await onUploadDocument(modalFile, targetWs, modalClassification);
      setUploadModalOpen(false);
      setModalFile(null);
      setModalSha256("");
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  // Copy hash to clipboard
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Filter by active workspace if set
      if (activeWorkspaceId && doc.workspace_id !== activeWorkspaceId) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesHash = doc.sha256.toLowerCase().includes(q);
        if (!matchesName && !matchesHash) return false;
      }

      // Filter by file type
      if (selectedType !== "ALL") {
        const ext = doc.name.split(".").pop()?.toLowerCase();
        if (selectedType === "PDF" && ext !== "pdf") return false;
        if (
          selectedType === "SPREADSHEET" &&
          !["xls", "xlsx", "csv"].includes(ext || "")
        )
          return false;
        if (
          selectedType === "MEDIA" &&
          !["png", "jpg", "jpeg", "svg", "webp"].includes(ext || "")
        )
          return false;
        if (
          selectedType === "ARCHIVE" &&
          !["zip", "rar", "tar", "gz"].includes(ext || "")
        )
          return false;
      }

      // Filter by classification
      if (selectedClassification !== "ALL") {
        if (doc.classification !== selectedClassification) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "date_asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "size_desc") {
        return (b.size || 0) - (a.size || 0);
      }
      return 0;
    });
  }, [documents, activeWorkspaceId, searchQuery, selectedType, selectedClassification, sortBy]);

  // Handle select all
  const handleToggleSelectAll = () => {
    if (selectedDocIds.size === filteredDocuments.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(filteredDocuments.map((d) => d.id)));
    }
  };

  const handleToggleSelectDoc = (id: string) => {
    const next = new Set(selectedDocIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedDocIds(next);
  };

  // Handle generate share link
  const handleCreateShareLink = async () => {
    if (!shareDoc) return;
    try {
      const link = await onShareDocument(shareDoc, shareRole, shareExpiryHours);
      setGeneratedShareLink(link);
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="document-explorer-container">
      {/* Top Header Bar */}
      <div className="explorer-header-row">
        <div>
          <h2 className="explorer-title">Encrypted Documents Vault</h2>
          <p className="explorer-subtitle">
            All files are hashed with SHA-256 and stored with zero-trust company isolation.
          </p>
        </div>

        <div className="explorer-header-actions">
          <button
            type="button"
            className="enterprise-btn-primary"
            onClick={() => {
              setModalWorkspaceId(activeWorkspaceId);
              setModalError("");
              setModalFile(null);
              setModalSha256("");
              setUploadModalOpen(true);
            }}
          >
            <UploadCloud size={16} />
            <span>Upload Secure Document</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Controls Bar */}
      <div className="explorer-controls-bar">
        {/* Search Input */}
        <div className="explorer-search-field">
          <Search size={16} className="search-field-icon" />
          <input
            type="text"
            placeholder="Filter by document name or SHA-256 hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="explorer-filter-group">
          {/* File Type Filter */}
          <div className="custom-select-wrapper">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="explorer-select"
            >
              <option value="ALL">All File Types</option>
              <option value="PDF">PDF Documents</option>
              <option value="SPREADSHEET">Spreadsheets (XLS, CSV)</option>
              <option value="MEDIA">Images & Media</option>
              <option value="ARCHIVE">Archives (ZIP, TAR)</option>
            </select>
          </div>

          {/* Classification Filter */}
          <div className="custom-select-wrapper">
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="explorer-select"
            >
              <option value="ALL">All Classifications</option>
              <option value="Confidential">Confidential</option>
              <option value="Restricted">Restricted</option>
              <option value="Internal">Internal</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="custom-select-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="explorer-select"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="size_desc">File Size (Largest)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <Layers size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Items Action Bar */}
      {selectedDocIds.size > 0 && (
        <div className="selected-actions-banner">
          <span className="selected-count-label">
            {selectedDocIds.size} document{selectedDocIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="selected-buttons">
            <button
              type="button"
              className="banner-action-btn"
              onClick={() => {
                const first = documents.find((d) => selectedDocIds.has(d.id));
                if (first) onDownloadDocument(first);
              }}
            >
              <Download size={14} /> Download Selected
            </button>
            <button
              type="button"
              className="banner-action-btn btn-danger"
              onClick={() => {
                selectedDocIds.forEach((id) => {
                  const doc = documents.find((d) => d.id === id);
                  if (doc) onDeleteDocument(doc);
                });
                setSelectedDocIds(new Set());
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              type="button"
              className="banner-clear-btn"
              onClick={() => setSelectedDocIds(new Set())}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Documents Table View */}
      {viewMode === "table" ? (
        <div className="enterprise-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      filteredDocuments.length > 0 &&
                      selectedDocIds.size === filteredDocuments.length
                    }
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th className="th-doc-name">Document Name</th>
                <th className="th-hash">SHA-256 Checksum</th>
                <th className="th-size">File Size</th>
                <th className="th-classification">Classification</th>
                <th className="th-status">Security Status</th>
                <th className="th-date">Uploaded Date</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty-cell">
                    <div className="empty-state-box">
                      <div className="empty-icon-wrap">
                        <FileText size={36} />
                      </div>
                      <h3>No documents found</h3>
                      <p>
                        {searchQuery
                          ? `No documents matching "${searchQuery}"`
                          : "Upload confidential documents to this company workspace to get started."}
                      </p>
                      <button
                        type="button"
                        className="enterprise-btn-primary"
                        onClick={() => {
                          setModalWorkspaceId(activeWorkspaceId);
                          setUploadModalOpen(true);
                        }}
                      >
                        <UploadCloud size={15} />
                        <span>Upload First Document</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const isSelected = selectedDocIds.has(doc.id);
                  const isCopied = copiedHash === doc.sha256;

                  return (
                    <tr
                      key={doc.id}
                      className={`table-row ${isSelected ? "row-selected" : ""}`}
                    >
                      <td className="td-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectDoc(doc.id)}
                        />
                      </td>

                      {/* File Name & Icon */}
                      <td className="td-doc-name">
                        <div className="doc-name-cell">
                          <div className="doc-icon-wrap">
                            {getFileIcon(doc.name)}
                          </div>
                          <div className="doc-meta-wrap">
                            <span
                              className="doc-filename"
                              onClick={() => setPreviewDoc(doc)}
                              title={doc.name}
                            >
                              {doc.name}
                            </span>
                            <span className="doc-storage-path">
                              {truncateHash(doc.storage_path, 12, 10)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SHA-256 Hash with 1-click copy */}
                      <td className="td-hash">
                        <div
                          className="hash-copy-pill"
                          onClick={() => handleCopyHash(doc.sha256)}
                          title="Click to copy SHA-256 hash"
                        >
                          <span className="hash-code">
                            {truncateHash(doc.sha256, 8, 6)}
                          </span>
                          <span className="hash-copy-icon">
                            {isCopied ? (
                              <Check size={12} className="text-emerald" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </span>
                        </div>
                      </td>

                      {/* File Size */}
                      <td className="td-size">
                        <span className="file-size-text">
                          {formatBytes(doc.size || 245000)}
                        </span>
                      </td>

                      {/* Classification Badge */}
                      <td className="td-classification">
                        <span
                          className={`classification-badge badge-${(
                            doc.classification || "Confidential"
                          ).toLowerCase()}`}
                        >
                          <Shield size={11} />
                          <span>{doc.classification || "Confidential"}</span>
                        </span>
                      </td>

                      {/* Security Status */}
                      <td className="td-status">
                        {doc.shared ? (
                          <span className="status-badge badge-shared" title="Active share link generated">
                            <Share2 size={11} />
                            <span>Shared ({doc.share_role || "viewer"})</span>
                          </span>
                        ) : (
                          <span className="status-badge badge-isolated" title="Encrypted and isolated in workspace">
                            <ShieldCheck size={11} />
                            <span>Encrypted</span>
                          </span>
                        )}
                      </td>

                      {/* Upload Date */}
                      <td className="td-date">
                        <span className="date-text">
                          {formatDate(doc.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="td-actions">
                        <div className="row-action-buttons">
                          <button
                            type="button"
                            className="action-icon-btn"
                            onClick={() => setPreviewDoc(doc)}
                            title="Preview file details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="action-icon-btn"
                            onClick={() => onDownloadDocument(doc)}
                            title="Download verified document"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            type="button"
                            className="action-icon-btn"
                            onClick={() => {
                              setShareDoc(doc);
                              setGeneratedShareLink(null);
                              setShareCopied(false);
                            }}
                            title="Share with role restrictions"
                          >
                            <Share2 size={15} />
                          </button>

                          {doc.shared && (
                            <button
                              type="button"
                              className="action-icon-btn btn-warning"
                              onClick={() => onRevokeShare(doc)}
                              title="Revoke active share link"
                            >
                              <Lock size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            className="action-icon-btn btn-danger"
                            onClick={() => onDeleteDocument(doc)}
                            title="Delete document"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setUploadModalOpen(false);
          }}
        >
          <div className="enterprise-modal upload-modal">
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-header-icon icon-emerald">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Upload Confidential Document</h3>
                  <span className="modal-subtitle">
                    SHA-256 cryptographic verification & company data isolation
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setUploadModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="modal-form">
              {/* Workspace Selector */}
              <div className="form-group">
                <label className="form-label">Destination Workspace</label>
                <select
                  value={modalWorkspaceId}
                  onChange={(e) => setModalWorkspaceId(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select company workspace...</option>
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Isolated Vault)
                    </option>
                  ))}
                </select>
                <span className="form-hint">
                  Data will be isolated strictly within this company workspace boundary.
                </span>
              </div>

              {/* Classification Selector */}
              <div className="form-group">
                <label className="form-label">Security Classification</label>
                <div className="classification-pills">
                  {(["Confidential", "Restricted", "Internal"] as const).map(
                    (cls) => (
                      <button
                        key={cls}
                        type="button"
                        className={`classification-pill-btn ${
                          modalClassification === cls ? "active" : ""
                        }`}
                        onClick={() => setModalClassification(cls)}
                      >
                        <Shield size={13} />
                        <span>{cls}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* File Dropzone */}
              <div className="form-group">
                <label className="form-label">Document File (Max 10 MB)</label>
                <label className="dropzone-box">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="dropzone-input"
                    required
                  />
                  <div className="dropzone-content">
                    <UploadCloud size={32} className="dropzone-icon" />
                    <span className="dropzone-main-text">
                      {modalFile ? modalFile.name : "Click to browse or drop file here"}
                    </span>
                    <span className="dropzone-sub-text">
                      {modalFile
                        ? `${formatBytes(modalFile.size)} · Ready for encryption`
                        : "PDF, DOCX, XLSX, Images, Secrets up to 10 MB"}
                    </span>
                  </div>
                </label>
              </div>

              {/* Live Hash Calculation Feedback */}
              {modalCalculatingHash && (
                <div className="hash-computing-box">
                  <span className="spinner-sm" />
                  <span>Computing SHA-256 cryptographic digest...</span>
                </div>
              )}

              {modalSha256 && (
                <div className="sha256-verified-box">
                  <div className="sha-box-header">
                    <ShieldCheck size={14} className="text-emerald" />
                    <span>Calculated SHA-256 Checksum:</span>
                  </div>
                  <div className="sha-hash-string">{modalSha256}</div>
                </div>
              )}

              {modalError && (
                <div className="modal-error-alert">
                  <AlertCircle size={15} />
                  <span>{modalError}</span>
                </div>
              )}

              {uploadMessage && (
                <div className="modal-status-alert">
                  <Check size={15} />
                  <span>{uploadMessage}</span>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="enterprise-btn-secondary"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="enterprise-btn-primary"
                  disabled={isUploading || modalCalculatingHash || !modalFile}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner-sm" />
                      <span>Encrypting & Storing...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Upload & Sign to Vault</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Document Modal */}
      {previewDoc && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewDoc(null);
          }}
        >
          <div className="enterprise-modal preview-modal">
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-header-icon icon-blue">
                  {getFileIcon(previewDoc.name)}
                </div>
                <div>
                  <h3 className="modal-title">{previewDoc.name}</h3>
                  <span className="modal-subtitle">Document Metadata & Verification</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewDoc(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="preview-modal-body">
              <div className="preview-meta-grid">
                <div className="meta-card">
                  <span className="meta-label">Classification</span>
                  <span className="meta-value text-emerald">
                    <Shield size={13} /> {previewDoc.classification || "Confidential"}
                  </span>
                </div>

                <div className="meta-card">
                  <span className="meta-label">File Size</span>
                  <span className="meta-value">
                    {formatBytes(previewDoc.size || 245000)}
                  </span>
                </div>

                <div className="meta-card">
                  <span className="meta-label">Uploaded Date</span>
                  <span className="meta-value">
                    {formatDate(previewDoc.created_at)}
                  </span>
                </div>

                <div className="meta-card">
                  <span className="meta-label">Encryption Standard</span>
                  <span className="meta-value">AES-256-GCM + SHA-256</span>
                </div>
              </div>

              {/* Cryptographic SHA-256 Checksum Card */}
              <div className="cryptographic-proof-card">
                <div className="proof-header">
                  <ShieldCheck size={16} className="text-emerald" />
                  <span>Immutable SHA-256 Cryptographic Digest</span>
                </div>
                <div className="proof-hash-display">
                  <code>{previewDoc.sha256}</code>
                  <button
                    type="button"
                    className="copy-btn-inline"
                    onClick={() => handleCopyHash(previewDoc.sha256)}
                  >
                    {copiedHash === previewDoc.sha256 ? (
                      <Check size={14} className="text-emerald" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="proof-caption">
                  This SHA-256 hash uniquely verifies the integrity of this document. Any alteration to the file byte stream will immediately invalidate this checksum.
                </p>
              </div>

              {/* Storage Path Info */}
              <div className="storage-info-row">
                <span className="label">Storage Location:</span>
                <code className="path-code">{previewDoc.storage_path}</code>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="enterprise-btn-secondary"
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="enterprise-btn-primary"
                onClick={() => {
                  onDownloadDocument(previewDoc);
                  setPreviewDoc(null);
                }}
              >
                <Download size={15} />
                <span>Download Verified File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Document Modal */}
      {shareDoc && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShareDoc(null);
          }}
        >
          <div className="enterprise-modal share-modal">
            <div className="modal-header">
              <div className="modal-header-info">
                <div className="modal-header-icon icon-purple">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Share Secure Document</h3>
                  <span className="modal-subtitle">
                    Generate temporary tokenized link for {shareDoc.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShareDoc(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="share-modal-body">
              {/* Permission Role */}
              <div className="form-group">
                <label className="form-label">Access Permission Level</label>
                <div className="role-options-grid">
                  <div
                    className={`role-select-box ${shareRole === "viewer" ? "active" : ""}`}
                    onClick={() => setShareRole("viewer")}
                  >
                    <div className="role-box-top">
                      <Eye size={16} />
                      <span className="role-title">Viewer</span>
                    </div>
                    <span className="role-desc">Can preview and read document in browser only</span>
                  </div>

                  <div
                    className={`role-select-box ${shareRole === "editor" ? "active" : ""}`}
                    onClick={() => setShareRole("editor")}
                  >
                    <div className="role-box-top">
                      <Download size={16} />
                      <span className="role-title">Download Allowed</span>
                    </div>
                    <span className="role-desc">Can preview and download encrypted binary</span>
                  </div>
                </div>
              </div>

              {/* Expiration Timer */}
              <div className="form-group">
                <label className="form-label">Link Expiration Timer</label>
                <select
                  value={shareExpiryHours}
                  onChange={(e) => setShareExpiryHours(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={1}>Expires in 1 Hour (Strict)</option>
                  <option value={24}>Expires in 24 Hours (Standard)</option>
                  <option value={72}>Expires in 3 Days</option>
                  <option value={168}>Expires in 7 Days (Maximum)</option>
                </select>
              </div>

              {/* Generated Share Link Output */}
              {generatedShareLink ? (
                <div className="generated-link-box">
                  <span className="link-box-label">Your Secure Access Link</span>
                  <div className="link-input-row">
                    <input
                      type="text"
                      readOnly
                      value={generatedShareLink}
                      className="link-input"
                    />
                    <button
                      type="button"
                      className="enterprise-btn-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedShareLink);
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2000);
                      }}
                    >
                      {shareCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{shareCopied ? "Copied!" : "Copy Link"}</span>
                    </button>
                  </div>
                  <span className="link-hint">
                    This link incorporates a cryptographic signed token and expires in {shareExpiryHours} hours.
                  </span>
                </div>
              ) : (
                <div className="generate-cta-box">
                  <p className="cta-note">
                    All document shares are logged to the ProofChain immutable ledger and can be revoked at any time.
                  </p>
                  <button
                    type="button"
                    className="enterprise-btn-primary w-full"
                    onClick={handleCreateShareLink}
                  >
                    <Sparkles size={15} />
                    <span>Generate Cryptographic Share Link</span>
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="enterprise-btn-secondary"
                onClick={() => setShareDoc(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
