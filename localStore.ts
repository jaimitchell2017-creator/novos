export interface LocalAccount {
  email: string;
  username: string;
  createdAt: string;
  isAdmin: boolean;
}

const ACCOUNTS_KEY = "novos_accounts";
const SESSION_KEY = "novos_session";

export function getAccounts(): LocalAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); } catch { return []; }
}

export function saveAccounts(accounts: LocalAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function createOrLoginAccount(email: string, username: string): LocalAccount {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 24) || "User";
  const accounts = getAccounts();
  const existing = accounts.find(a => a.email === normalizedEmail);
  if (existing) {
    const updated = { ...existing, username: cleanUsername };
    saveAccounts(accounts.map(a => a.email === normalizedEmail ? updated : a));
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    return updated;
  }
  const account: LocalAccount = {
    email: normalizedEmail,
    username: cleanUsername,
    createdAt: new Date().toISOString(),
    // The first local account owns this NOVOS installation.
    isAdmin: accounts.length === 0,
  };
  saveAccounts([...accounts, account]);
  localStorage.setItem(SESSION_KEY, JSON.stringify(account));
  return account;
}

export function loadSession(): LocalAccount | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

export function clearSession() { localStorage.removeItem(SESSION_KEY); }
