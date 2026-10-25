export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  created_at?: string;
  created_by?: string;
  member_count?: number;
  role?: string;
}

export interface DocumentItem {
  id: string;
  workspace_id: string;
  uploaded_by: string;
  name: string;
  storage_path: string;
  sha256: string;
  created_at: string;
  size?: number; // size in bytes
  file_type?: string;
  classification?: "Confidential" | "Restricted" | "Internal" | "Public";
  shared?: boolean;
  share_token?: string;
  share_expires_at?: string;
  share_role?: "viewer" | "editor";
  download_count?: number;
}

export interface AuditLogEntry {
  id: string;
  block_index: number;
  timestamp: string;
  actor: string;
  actor_email: string;
  actor_role: string;
  action: "DOCUMENT_UPLOAD" | "DOCUMENT_PREVIEW" | "DOCUMENT_DOWNLOAD" | "SHARE_CREATED" | "SHARE_REVOKED" | "WORKSPACE_CREATED" | "AUTH_SIGN_IN" | "SECURITY_POLICY_UPDATE" | "SYSTEM_INITIALIZED";
  resource_name: string;
  resource_id?: string;
  workspace_id?: string;
  previous_hash: string;
  current_hash: string;
  ip_address: string;
  status: "SUCCESS" | "VERIFIED" | "ALERT";
}

export interface AccessDecision {
  id: string;
  timestamp: string;
  subject: string;
  role: string;
  action: string;
  resource: string;
  decision: "ALLOWED" | "DENIED" | "ELEVATED";
  risk_score: number; // 0 - 100
  reason: string;
  policy_matched: string;
  ip_address: string;
  mfa_verified: boolean;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "member" | "auditor";
  status: "active" | "invited" | "suspended";
  joined_at: string;
}

export interface SecuritySettings {
  enforce2FA: boolean;
  enforceSha256Verification: boolean;
  autoExpireSharesDays: number;
  restrictToCompanyDomain: boolean;
  ipWhitelistEnabled: boolean;
  tamperAlertsEnabled: boolean;
}
