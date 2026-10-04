import { useState } from 'react';
export default function Calculator(){
 const [display,setDisplay]=useState('0');
 const press=(v:string)=>{ if(v==='C') return setDisplay('0'); if(v==='⌫') return setDisplay(x=>x.length>1?x.slice(0,-1):'0'); if(v==='='){try{const clean=display.replace(/[^0-9+\-*/().% ]/g,''); setDisplay(String(Function('return '+clean)()))}catch{setDisplay('Error')} return;} setDisplay(x=>x==='0'&&/\d/.test(v)?v:x+v)};
 const keys=['7','8','9','/','4','5','6','*','1','2','3','-','0','.','+','%','C','⌫','='];
 return <div className="h-full p-5 flex flex-col gap-4 text-white"><div className="rounded-2xl bg-black/30 p-5 text-right text-3xl font-mono min-h-20 break-all">{display}</div><div className="grid grid-cols-4 gap-2 flex-1">{keys.map(k=><button key={k} onClick={()=>press(k)} className="rounded-xl bg-white/5 border border-cyan-500/10 hover:bg-cyan-500/15 text-lg">{k}</button>)}</div></div>
}
