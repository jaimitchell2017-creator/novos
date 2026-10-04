export interface NappManifest {
  format: "napp";
  formatVersion: 1;
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  category: string;
  author: string;
  permissions: string[];
  entry: "index.html";
  createdAt: string;
}

export interface NappFile {
  path: string;
  content: string;
}

export interface NappPackage {
  manifest: NappManifest;
  files: NappFile[];
}

export function makeNapp(input: Omit<NappManifest, "format" | "formatVersion" | "entry" | "createdAt">, html: string): NappPackage {
  return {
    manifest: { ...input, format: "napp", formatVersion: 1, entry: "index.html", createdAt: new Date().toISOString() },
    files: [{ path: "index.html", content: html }],
  };
}

export function validateNapp(pkg: unknown): { ok: true; value: NappPackage } | { ok: false; error: string } {
  if (!pkg || typeof pkg !== "object") return { ok: false, error: "The .napp file is not valid JSON." };
  const p = pkg as Partial<NappPackage>;
  if (!p.manifest || p.manifest.format !== "napp" || p.manifest.formatVersion !== 1) return { ok: false, error: "Unsupported NOVOS .napp format." };
  if (!p.manifest.name || !p.manifest.id || !p.manifest.entry) return { ok: false, error: "The .napp manifest is missing required fields." };
  if (!Array.isArray(p.manifest.permissions)) return { ok: false, error: "The permissions list is invalid." };
  if (!Array.isArray(p.files) || !p.files.some(f => f?.path === "index.html")) return { ok: false, error: "The package must contain index.html." };
  return { ok: true, value: p as NappPackage };
}

export function downloadNapp(pkg: NappPackage) {
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/vnd.novos.napp+json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${pkg.manifest.name.replace(/[^a-z0-9_-]+/gi, "-") || "NOVOS-App"}.napp`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function readNappFile(file: File): Promise<NappPackage> {
  const text = await file.text();
  const result = validateNapp(JSON.parse(text));
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

export function staticBugScan(code: string): string[] {
  const issues: string[] = [];
  const lines = code.split(/\r?\n/);
  lines.forEach((line, i) => {
    const n = i + 1;
    if (/new Date\([^)]*month\s*\+\s*2/i.test(line)) issues.push(`Line ${n}: suspicious month + 2 Date calculation.`);
    if (/\[[^\]]*\+\s*1\]/.test(line) && /month|displayMonth/i.test(line)) issues.push(`Line ${n}: suspicious month +1 array index.`);
    if (/innerHTML\s*=/.test(line)) issues.push(`Line ${n}: innerHTML can create injection bugs with untrusted data.`);
    if (/eval\s*\(/.test(line)) issues.push(`Line ${n}: eval() executes dynamic code and is unsafe for untrusted apps.`);
    if (/document\.write\s*\(/.test(line)) issues.push(`Line ${n}: document.write() can replace the document unexpectedly.`);
    if (/console\.log\s*\(/.test(line)) issues.push(`Line ${n}: console.log found; remove debug output for release builds.`);
  });
  try { new Function(code.replace(/<[^>]*>/g, "")); } catch (e) { issues.push(`Syntax: ${(e as Error).message}`); }
  return issues;
}
