import { useState, useCallback } from "react";

interface FSFile {
  name: string;
  kind: "file" | "directory";
  size?: number;
  modified?: Date;
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
}

const PLACES = ["Home", "Documents", "Downloads", "Desktop", "Pictures", "Music", "Videos"];

const DEMO_FILES: FSFile[] = [
  { name: "Welcome to NovOS.txt", kind: "file", size: 1024, modified: new Date() },
  { name: "Getting Started", kind: "directory" },
  { name: "Photos", kind: "directory" },
  { name: "NovOS Guide.pdf", kind: "file", size: 2048000, modified: new Date() },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function FileManager() {
  const [place, setPlace] = useState("Home");
  const [files, setFiles] = useState<FSFile[]>(DEMO_FILES);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [driveOpen, setDriveOpen] = useState(false);
  const [driveFiles, setDriveFiles] = useState<FSFile[]>([]);
  const [driveError, setDriveError] = useState("");

  const openDrive = useCallback(async () => {
    setDriveError("");
    try {
      const dirHandle = await (window as Window & { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker?.();
      if (!dirHandle) { setDriveError("File System Access API not supported in this browser."); return; }
      const entries: FSFile[] = [];
      for await (const [name, handle] of (dirHandle as FileSystemDirectoryHandle & AsyncIterable<[string, FileSystemHandle]>)) {
        entries.push({
          name,
          kind: handle.kind,
          handle: handle as FileSystemFileHandle | FileSystemDirectoryHandle,
        });
      }
      setDriveFiles(entries);
      setDriveOpen(true);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setDriveError("Could not open drive. Make sure you're using a supported browser (Chrome/Edge).");
      }
    }
  }, []);

  const downloadFile = useCallback(async (file: FSFile) => {
    if (!file.handle || file.handle.kind !== "file") return;
    try {
      const fileHandle = file.handle as FileSystemFileHandle;
      const f = await fileHandle.getFile();
      const url = URL.createObjectURL(f);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }, []);

  const currentFiles = driveOpen ? driveFiles : (place === "Home" ? DEMO_FILES : []);

  const fileIcon = (file: FSFile) => {
    if (file.kind === "directory") return "📁";
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "")) return "🖼️";
    if (["mp3", "wav", "flac", "m4a"].includes(ext ?? "")) return "🎵";
    if (["mp4", "mov", "avi", "mkv"].includes(ext ?? "")) return "🎬";
    if (["pdf"].includes(ext ?? "")) return "📄";
    if (["txt", "md"].includes(ext ?? "")) return "📝";
    if (["zip", "tar", "gz", "rar"].includes(ext ?? "")) return "📦";
    return "📄";
  };

  return (
    <div className="h-full flex text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-44 flex-shrink-0 border-r border-cyan-500/10 p-3 flex flex-col gap-1 overflow-y-auto os-scrollbar">
        <p className="text-white/30 text-[10px] tracking-widest uppercase mb-2 px-2">Places</p>
        {PLACES.map((p) => (
          <button
            key={p}
            onClick={() => { setPlace(p); setDriveOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left"
            style={{
              background: place === p && !driveOpen ? "rgba(0,229,255,0.1)" : "transparent",
              color: place === p && !driveOpen ? "#00e5ff" : "rgba(255,255,255,0.5)",
              border: place === p && !driveOpen ? "1px solid rgba(0,229,255,0.2)" : "1px solid transparent",
            }}
          >
            <span className="text-base">
              {p === "Home" ? "🏠" : p === "Documents" ? "📄" : p === "Downloads" ? "⬇️" : p === "Desktop" ? "🖥️" : p === "Pictures" ? "🖼️" : p === "Music" ? "🎵" : "🎬"}
            </span>
            <span>{p}</span>
          </button>
        ))}

        <div className="border-t border-white/10 my-2" />
        <p className="text-white/30 text-[10px] tracking-widest uppercase mb-2 px-2">Devices</p>
        <button
          onClick={openDrive}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left"
          style={{
            background: driveOpen ? "rgba(0,229,255,0.1)" : "transparent",
            color: driveOpen ? "#00e5ff" : "rgba(255,255,255,0.5)",
            border: driveOpen ? "1px solid rgba(0,229,255,0.2)" : "1px solid transparent",
          }}
        >
          <span className="text-base">💾</span>
          <span>Open Drive</span>
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-cyan-500/10 flex-shrink-0">
          <h2 className="font-semibold text-white/80 flex-1 text-sm">
            {driveOpen ? "💾 External Drive" : `${place}`}
          </h2>
          {driveOpen && (
            <button
              onClick={() => setDriveOpen(false)}
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              × Close Drive
            </button>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: viewMode === "grid" ? "rgba(0,229,255,0.15)" : "transparent", color: viewMode === "grid" ? "#00e5ff" : "rgba(255,255,255,0.3)" }}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: viewMode === "list" ? "rgba(0,229,255,0.15)" : "transparent", color: viewMode === "list" ? "#00e5ff" : "rgba(255,255,255,0.3)" }}
            >
              ☰
            </button>
          </div>
        </div>

        {driveError && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {driveError}
          </div>
        )}

        {/* Files */}
        <div className="flex-1 overflow-y-auto os-scrollbar p-4">
          {currentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
              <span className="text-5xl">📂</span>
              <p className="text-sm">This folder is empty</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {currentFiles.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setSelected(file.name === selected ? null : file.name)}
                  onDoubleClick={() => file.handle && downloadFile(file)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all group"
                  style={{
                    background: selected === file.name ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selected === file.name ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.05)"}`,
                  }}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{fileIcon(file)}</span>
                  <span className="text-white/70 text-[11px] text-center leading-tight line-clamp-2 break-all">{file.name}</span>
                  {file.size && <span className="text-white/30 text-[9px]">{formatSize(file.size)}</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {/* Header */}
              <div className="grid grid-cols-[auto_1fr_100px_100px] gap-4 px-3 py-2 text-white/30 text-[10px] uppercase tracking-wider">
                <span />
                <span>Name</span>
                <span>Size</span>
                <span>Modified</span>
              </div>
              {currentFiles.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setSelected(file.name === selected ? null : file.name)}
                  onDoubleClick={() => file.handle && downloadFile(file)}
                  className="grid grid-cols-[auto_1fr_100px_100px] gap-4 items-center px-3 py-2 rounded-xl text-left transition-all"
                  style={{
                    background: selected === file.name ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selected === file.name ? "rgba(0,229,255,0.3)" : "transparent"}`,
                  }}
                >
                  <span className="text-xl">{fileIcon(file)}</span>
                  <span className="text-white/70 text-sm truncate">{file.name}</span>
                  <span className="text-white/30 text-xs">{file.size ? formatSize(file.size) : "—"}</span>
                  <span className="text-white/30 text-xs">{file.modified?.toLocaleDateString() ?? "—"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-cyan-500/10 flex-shrink-0">
          <p className="text-white/30 text-xs">{currentFiles.length} items</p>
          {selected && <p className="text-cyan-400 text-xs">{selected} selected</p>}
          {driveOpen && <p className="text-white/30 text-xs ml-auto">Double-click a file to download it</p>}
        </div>
      </div>
    </div>
  );
}
