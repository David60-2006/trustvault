import type { AuditLogEntry } from "../types";

export async function calculateSHA256(data: ArrayBuffer | string): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === "string") {
    buffer = new TextEncoder().encode(data).buffer as ArrayBuffer;
  } else {
    buffer = data;
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function truncateHash(hash?: string, front = 8, back = 6): string {
  if (!hash) return "—";
  if (hash.length <= front + back) return hash;
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
}

export async function verifyHashChain(
  blocks: AuditLogEntry[]
): Promise<{ valid: boolean; brokenAt?: number; totalChecked: number }> {
  if (!blocks || blocks.length === 0) {
    return { valid: true, totalChecked: 0 };
  }

  // Sort ascending by block_index so verification always traverses from genesis to head
  const sorted = [...blocks].sort((a, b) => a.block_index - b.block_index);

  for (let i = 0; i < sorted.length; i++) {
    const block = sorted[i];
    
    // Check previous hash linkage
    if (i > 0) {
      const prevBlock = sorted[i - 1];
      if (block.previous_hash !== prevBlock.current_hash) {
        return { valid: false, brokenAt: block.block_index, totalChecked: i };
      }
    }

    // Verify block's own SHA-256 hash
    const blockData = `${block.block_index}|${block.previous_hash}|${block.timestamp}|${block.action}|${block.actor}|${block.resource_name}`;
    const calculatedHash = await calculateSHA256(blockData);
    
    // Verify cryptographic integrity
    if (block.current_hash && block.current_hash !== calculatedHash) {
      return { valid: false, brokenAt: block.block_index, totalChecked: i };
    }
  }

  return { valid: true, totalChecked: sorted.length };
}
