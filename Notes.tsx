import { useEffect, useState } from 'react';
export default function Notes(){
 const [text,setText]=useState(()=>localStorage.getItem('novos_notes')||'');
 useEffect(()=>{localStorage.setItem('novos_notes',text)},[text]);
 return <div className="h-full flex flex-col text-white"><div className="p-4 border-b border-cyan-500/10"><h2 className="font-bold text-lg">📝 Notes</h2><p className="text-white/35 text-xs">Saved automatically on this device.</p></div><textarea value={text} onChange={e=>setText(e.target.value)} className="flex-1 resize-none bg-transparent p-5 outline-none text-white/80" placeholder="Start writing..." /></div>
}
