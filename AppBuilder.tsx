import { useCallback, useRef, useState } from "react";
import { OSApp, OSUser } from "../types";
import { downloadNapp, makeNapp, readNappFile, staticBugScan, NappPackage } from "../lib/napp";
import JSZip from "jszip";

const CATEGORIES = ["Productivity", "Entertainment", "Utilities", "Developer", "Social", "Education"];
const ICONS = ["🎮","📊","🎵","📰","🌤️","🧮","🎨","📸","🗺️","💬","📅","🔬","🏋️","🍕","✈️","💰","🎯","🧩","🤖","⚡","🌈","🛸"];
const PERMISSIONS = ["internet", "camera", "microphone", "notifications", "local-files", "location", "usb", "fullscreen"];
const STARTER_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{margin:0;background:#050a14;color:#e2f0ff;font-family:system-ui;min-height:100vh;display:grid;place-items:center}.app{text-align:center;padding:2rem}h1{color:#00e5ff}</style></head><body><main class="app"><h1>My NOVOS App</h1><p>Edit this code or ask NOVOS AI to build it.</p></main></body></html>`;

type Props = { user: OSUser; onPublish: (app: OSApp) => void };

export default function AppBuilder({ user, onPublish }: Props) {
  const [tab, setTab] = useState<"create"|"import"|"repo"|"ai">("create");
  const [appName, setAppName] = useState(""); const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Utilities"); const [icon, setIcon] = useState("🤖");
  const [code, setCode] = useState(STARTER_HTML); const [permissions, setPermissions] = useState<string[]>(["internet"]);
  const [aiPrompt, setAiPrompt] = useState(""); const [aiLoading, setAiLoading] = useState(false); const [message, setMessage] = useState("");
  const [scan, setScan] = useState<string[]>([]); const fileRef = useRef<HTMLInputElement>(null); const repoRef = useRef<HTMLInputElement>(null);

  const publish = useCallback(() => {
    if (!appName.trim()) { setMessage("Give your app a name first."); return; }
    const id = `app-${Date.now()}`;
    const app: OSApp = { id, name: appName.trim(), icon, description: description.trim() || "A NOVOS .napp application", category, builtIn:false, type:"html", code, installed:true, version:"1.0.0", author:user.username, rating:5, downloads:0, permissions, packageFormat:"napp" };
    onPublish(app); setMessage("✓ Published locally to this NOVOS App Store.");
  }, [appName,icon,description,category,code,user.username,onPublish,permissions]);

  const exportPackage = () => {
    const pkg = makeNapp({ id:`com.novos.${appName.toLowerCase().replace(/[^a-z0-9]+/g,"-") || "app"}`, name:appName || "NOVOS App", version:"1.0.0", description:description || "NOVOS application", icon, category, author:user.username, permissions }, code);
    downloadNapp(pkg); setMessage("✓ .napp package exported.");
  };

  const importNapp = async (file?: File) => {
    if (!file) return;
    try { const pkg = await readNappFile(file); setAppName(pkg.manifest.name); setDescription(pkg.manifest.description); setIcon(pkg.manifest.icon); setCategory(pkg.manifest.category); setPermissions(pkg.manifest.permissions); setCode(pkg.files.find(f=>f.path==="index.html")!.content); setScan(staticBugScan(pkg.files.map(f=>f.content).join("\n"))); setTab("create"); setMessage(`✓ Imported ${pkg.manifest.name}.`); }
    catch(e) { setMessage(`Import failed: ${(e as Error).message}`); }
  };

  const importRepo = async (file?: File) => {
    if (!file) return;
    try {
      const zip = await JSZip.loadAsync(file); const names = Object.keys(zip.files).filter(n=>!zip.files[n].dir);
      const htmlName = names.find(n=>/(^|\/)index\.html$/i.test(n));
      let html = ""; if (htmlName) html = await zip.files[htmlName].async("string");
      const textFiles = names.filter(n=>/\.(js|jsx|ts|tsx|html|css|json|md)$/i.test(n)).slice(0,200);
      const combined:string[]=[]; for (const n of textFiles) { try { combined.push(`// ${n}\n${await zip.files[n].async("string")}`); } catch {} }
      setCode(html || STARTER_HTML); setScan(staticBugScan(combined.join("\n"))); setAppName((htmlName?.split("/").slice(-2,-1)[0] || "Imported NOVOS App").replace(/[-_]/g," "));
      setDescription(`Imported repository with ${names.length} files. ${htmlName ? "index.html detected." : "No index.html detected; review before publishing."}`); setTab("create"); setMessage(`✓ Repository imported. ${names.length} files scanned.`);
    } catch(e) { setMessage(`Repository import failed: ${(e as Error).message}`); }
  };

  const generateWithLocalAI = useCallback(async () => {
    if (!aiPrompt.trim()) return setMessage("Describe the app you want NOVOS AI Builder to create.");
    setAiLoading(true); setMessage("Loading the local NOVOS AI Builder model…");
    try {
      const { pipeline } = await import("@huggingface/transformers");
      const generator = await pipeline("text-generation","onnx-community/SmolLM2-135M-Instruct-ONNX",{dtype:"q4",device:"wasm"});
      const prompt = `Create a complete single-file HTML app. Return only HTML. Requirements: ${aiPrompt}`;
      const out:any = await generator([{role:"user",content:prompt}],{max_new_tokens:220,temperature:.4,do_sample:true});
      const text = Array.isArray(out) ? String(out[0]?.generated_text || out[0]?.text || "") : String(out);
      const html = text.match(/<!DOCTYPE html>[\s\S]*/i)?.[0] || text.match(/<html[\s\S]*/i)?.[0] || text;
      setCode(html.trim()); setAppName(appName || aiPrompt.slice(0,30)); setMessage("✓ Local model generated a draft. Run the bug scan before publishing."); setTab("create");
    } catch(e) { setMessage(`Local AI error: ${(e as Error).message}. NOVOS is still running.`); }
    finally { setAiLoading(false); }
  }, [aiPrompt,appName]);

  return <div className="h-full flex flex-col text-white">
    <div className="p-4 border-b border-cyan-500/10 flex-shrink-0"><div className="flex justify-between gap-3"><div><h1 className="text-xl font-bold" style={{fontFamily:"'Orbitron',sans-serif"}}>NOVOS App Builder</h1><p className="text-white/35 text-xs">Local-first · .napp · repository import · bug scan · AI Builder</p></div><div className="text-xs text-cyan-300/70">@{user.username}</div></div>
      <div className="flex gap-1 mt-3 flex-wrap">{[["create","Build"],["import","Import .napp"],["repo","GitHub ZIP"],["ai","NOVOS AI"]].map(([id,label])=><button key={id} onClick={()=>setTab(id as any)} className={`px-3 py-1.5 rounded-xl text-xs ${tab===id?"bg-cyan-500/20 text-cyan-300":"bg-white/5 text-white/50"}`}>{label}</button>)}</div></div>
    {message && <div className="mx-4 mt-3 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">{message}</div>}
    {tab==="create" && <div className="flex-1 overflow-auto p-4 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <div className="space-y-3"><input value={appName} onChange={e=>setAppName(e.target.value)} placeholder="App name" className="os-input w-full"/><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={3} className="os-input w-full resize-none"/>
      <select value={category} onChange={e=>setCategory(e.target.value)} className="os-input w-full bg-[#08142b]">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
      <div><div className="text-[10px] text-white/40 uppercase mb-2">Icon</div><div className="grid grid-cols-6 gap-1">{ICONS.map(i=><button key={i} onClick={()=>setIcon(i)} className={`p-2 rounded-lg ${icon===i?"bg-cyan-500/20":"bg-white/5"}`}>{i}</button>)}</div></div>
      <div><div className="text-[10px] text-white/40 uppercase mb-2">Permissions</div>{PERMISSIONS.map(p=><label key={p} className="flex items-center gap-2 text-xs text-white/60 py-1"><input type="checkbox" checked={permissions.includes(p)} onChange={e=>setPermissions(v=>e.target.checked?[...v,p]:v.filter(x=>x!==p))}/>{p}</label>)}</div>
      <div className="flex gap-2"><button onClick={publish} className="flex-1 os-btn-primary">Publish</button><button onClick={exportPackage} className="px-3 rounded-xl bg-white/10 border border-white/10">Export .napp</button></div>
      <button onClick={()=>setScan(staticBugScan(code))} className="w-full px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/20 text-violet-200 text-xs">🪲 AI/static bug scan</button></div>
      <div className="min-h-[420px] flex flex-col"><textarea value={code} onChange={e=>setCode(e.target.value)} className="flex-1 min-h-[350px] bg-black/30 border border-cyan-500/10 rounded-2xl p-4 font-mono text-xs outline-none resize-none" spellCheck={false}/>{scan.length>0&&<div className="mt-3 p-3 rounded-xl bg-black/30 text-xs whitespace-pre-wrap">{scan.map((x,i)=><div key={i} className="mb-1 text-amber-200">⚠️ {x}</div>)}</div>}</div>
    </div>}
    {tab==="import" && <ImportPanel label="Choose a .napp file" accept=".napp,application/json" onFile={importNapp} inputRef={fileRef}/>} 
    {tab==="repo" && <ImportPanel label="Choose a GitHub repository ZIP" accept=".zip" onFile={importRepo} inputRef={repoRef}/>} 
    {tab==="ai" && <div className="flex-1 p-6 overflow-auto"><div className="max-w-2xl mx-auto glass-card rounded-3xl p-6"><h2 className="text-lg font-bold">🤖 NOVOS AI App Builder</h2><p className="text-white/40 text-sm mt-1">Runs the open model locally in your browser. It is a code generator, not a magical proof of correctness.</p><textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} rows={6} placeholder="Example: make a calculator with history, keyboard support and a clear button" className="os-input w-full mt-4 resize-none"/><button disabled={aiLoading} onClick={generateWithLocalAI} className="os-btn-primary mt-3 w-full">{aiLoading?"Generating locally…":"Build app with local AI"}</button></div></div>}
  </div>;
}

function ImportPanel({label,accept,onFile,inputRef}:{label:string;accept:string;onFile:(f?:File)=>void;inputRef:React.RefObject<HTMLInputElement|null>}) {
  return <div className="flex-1 grid place-items-center p-6"><div className="glass-card rounded-3xl p-8 text-center max-w-lg w-full"><div className="text-5xl mb-4">📦</div><h2 className="text-xl font-bold">{label}</h2><p className="text-white/40 text-sm mt-2">Everything stays on this device until you choose to publish or export it.</p><input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e=>onFile(e.target.files?.[0])}/><button onClick={()=>inputRef.current?.click()} className="os-btn-primary mt-5">Choose file</button></div></div>;
}
