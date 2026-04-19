// Thin indirection layer. Swap mock for real Go/Chi endpoints by replacing
// each function body with a `fetch` call against the documented routes:
//
//   POST /mcp/:serverId
//   GET  /v1/challenge/:requestId
//   POST /v1/verify
//   GET  /v1/dashboard/summary
//   GET  /v1/dashboard/receipts

import { receipts, requests, servers, summary, tools } from "./mock/data";
import type {
  DashboardSummary,
  PaymentRequest,
  Receipt,
  Server,
  ToolPricing,
} from "./mock/types";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async getServers(): Promise<Server[]> {
    await delay();
    return servers;
  },
  async getServer(id: string): Promise<Server | undefined> {
    await delay();
    return servers.find((s) => s.id === id);
  },
  async getTools(serverId?: string): Promise<ToolPricing[]> {
    await delay();
    return serverId ? tools.filter((t) => t.serverId === serverId) : tools;
  },
  async getReceipts(serverId?: string): Promise<Receipt[]> {
    await delay();
    return serverId ? receipts.filter((r) => r.serverId === serverId) : receipts;
  },
  async getRequests(opts?: {
    serverId?: string;
    status?: PaymentRequest["status"];
  }): Promise<PaymentRequest[]> {
    await delay();
    let r = requests;
    if (opts?.serverId) r = r.filter((x) => x.serverId === opts.serverId);
    if (opts?.status) r = r.filter((x) => x.status === opts.status);
    return r;
  },
  async getRequest(id: string): Promise<PaymentRequest | undefined> {
    await delay();
    return requests.find((r) => r.id === id);
  },
  async getDashboardSummary(): Promise<DashboardSummary> {
    await delay();
    return summary;
  },
};

export const fmtUsdc = (n: number) =>
  `${n.toFixed(n < 0.01 ? 4 : n < 1 ? 3 : 2)} USDC`;

export const truncate = (s: string, head = 4, tail = 4) =>
  s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;

export const fmtRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
