import React from 'react';
// Autorskie ilustracje zastępcze – nie są zdjęciami mieszkań.
export function City({variant=0}){
 const palettes=[['#e2dfcf','#bbc8af','#a4b69a','#d3ae8c'],['#e4ddd4','#c5b9ac','#a6b7ab','#b3907b'],['#dce4df','#b5c7c6','#94afa6','#d4b89d']];
 const [sky,wall,tree,shade]=palettes[variant%3];
 return <svg aria-hidden="true" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
 <rect width="400" height="150" fill={sky}/><circle cx="315" cy="28" r="19" fill="#fbefcf"/>
 <g transform={'translate('+(-14*(variant%3))+',0)'} stroke="#5d7165" strokeWidth="1.2" strokeLinejoin="round">
 {[[-12,62,69,3],[54,38,93,4],[146,66,66,3],[213,49,102,4],[314,72,70,3],[384,51,56,3]].map(([x,y,w,n],i)=><g key={x}><path fill={i%2===0?wall:shade} d={`M${x} 137V${y}l${w*.72} -11 ${w*.28} 11V137Z`}/><path d={`M${x+w*.72} ${y-11}V137`} fill="none"/>{Array.from({length:n},(_,j)=>Array.from({length:3},(_,k)=><rect key={j+'-'+k} x={x+7+j*(w*.67/n)} y={y+8+k*20} width="8" height="11" fill="#f4efdf"/>))}</g>)}
 {[35,173,342].map((x,i)=><g key={x}><ellipse cx={x} cy={97+i*2} rx="16" ry="25" fill={tree}/><path d={`M${x} 103v36`} /></g>)}</g>
 <path d="M0 137h400v13H0z" fill="#adb8a7"/><path d="M0 141h400" stroke="#718577"/></svg>
}
export function Icon({name}){
 const paths={pin:<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>,filter:<><path d="M3 7h7m4 0h7M3 17h11m4 0h3"/><circle cx="12" cy="7" r="2"/><circle cx="16" cy="17" r="2"/></>,search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,profile:<><circle cx="12" cy="8" r="3.5"/><path d="M4 21a8 8 0 0 1 16 0"/></>,home:<><path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3Z"/></>};
 return <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
