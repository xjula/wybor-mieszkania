import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {City,Icon} from './Art';
import './style.css';

const blank={name:'',location:'',price:'',minutes:''}, initial={location:'',max:'',time:''};
const cash=n=>n.toLocaleString('pl-PL')+' zł', points=n=>n.toLocaleString('pl-PL',{maximumFractionDigits:3});
const fold=s=>String(s||'').toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('ł','l');
async function api(path,method='GET',data){
 const r=await fetch('/api/'+path,{method,headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});
 if(!r.ok){const err=await r.json().catch(()=>({}));throw Error(typeof err.detail==='string'?err.detail:r.status===422?'Sprawdź wartości w formularzu.':'Nie udało się połączyć z API.');}return r.json();
}
function Modal({title,close,children}){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;el.showModal();return ()=>el.close();},[]);
 return <dialog ref={ref} aria-labelledby="modal-title" onCancel={close} onClick={e=>{if(e.target===ref.current)close();}}>
 <div className="dialoginner"><div className="dialoghead"><h2 id="modal-title">{title}</h2><button className="circle" aria-label="Zamknij" onClick={close}>×</button></div>{children}</div></dialog>;
}
function App(){
 const [s,setS]=useState(null),[draft,setDraft]=useState(initial),[query,setQuery]=useState(initial),[filters,setFilters]=useState(false);
 const [modal,setModal]=useState(''),[offer,setOffer]=useState(blank),[editId,setEditId]=useState(null),[pref,setPref]=useState({budget:500000,weight:70});
 const [tab,setTab]=useState('offers'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const results=useRef(null);
 async function load(){const data=await api('state');setS(data);return data;}
 async function run(fn){setError('');setBusy(true);try{await fn();}catch(e){setError(e.message);}finally{setBusy(false);}}
 useEffect(()=>{run(load);},[]);
 const view=(s?.offers||[]).filter(o=>fold(o.location).includes(fold(query.location.trim()))&&(!query.max||o.price<=Number(query.max))&&(!query.time||o.minutes<=Number(query.time)));
 function showOffer(o){setError('');setEditId(o?.id??null);setOffer(o?{name:o.name,location:o.location||'',price:o.price,minutes:o.minutes}:blank);setModal('offer');}
 function preferences(){if(!s)return;setError('');setPref({budget:s.budget,weight:s.weight});setModal('prefs');}
 function find(e){e.preventDefault();setQuery({...draft});setFilters(false);setTab('offers');results.current?.scrollIntoView({behavior:'smooth',block:'start'});}
 function saveOffer(e){e.preventDefault();run(async()=>{await api(editId===null?'offers':'offers/'+editId,editId===null?'POST':'PUT',{...offer,name:offer.name.trim(),location:offer.location.trim(),price:Number(offer.price),minutes:Number(offer.minutes)});
 await load();setModal('');setQuery(initial);setDraft(initial);setFilters(false);setTab('offers');results.current?.scrollIntoView();});}
 const close=()=>{if(!busy){setModal('');setError('');}};
 return <>
 <header><div className="bar"><a className="brand" href="#" aria-label="Twoje Mieszkanie — początek"><span className="logo"><Icon name="home"/></span>Twoje<span>Mieszkanie</span></a>
 <div className="actions"><button className="outline" onClick={()=>showOffer(null)}>＋ Dodaj ogłoszenie</button><button className="circle" title="Profil preferencji" aria-label="Otwórz profil preferencji" disabled={!s} onClick={preferences}><Icon name="profile"/></button></div></div></header>
 <main><section className="hero"><div className="eyebrow">NIERUCHOMOŚCI NA SPRZEDAŻ</div><h1>Znajdź swoje <em>mieszkanie.</em></h1><p>Wybierz lokalizację, porównaj oferty i sprawdź, która najlepiej odpowiada Twoim potrzebom.</p>
 <form onSubmit={find} className="searchform"><div className="searchbar"><label className="location"><Icon name="pin"/><span><small>Lokalizacja</small><input aria-label="Lokalizacja" placeholder="Miasto lub dzielnica" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})}/></span></label>
 <button type="button" className="filter" aria-expanded={filters} onClick={()=>setFilters(!filters)}><Icon name="filter"/> Filtry{(draft.max||draft.time)?' •':''}</button><button className="primary search"><Icon name="search"/>Szukaj</button></div>
 {filters&&<div className="filterpanel"><label>Cena do (zł)<input type="number" min="1" value={draft.max} onChange={e=>setDraft({...draft,max:e.target.value})}/></label><label>Dojazd do (min)<input type="number" min="0" value={draft.time} onChange={e=>setDraft({...draft,time:e.target.value})}/></label></div>}</form>
 </section>
 <section className="list" ref={results}><div className="sectionhead"><div><div className="eyebrow">TWOJA LISTA</div><h2>{tab==='offers'?'Mieszkania na sprzedaż':'Ranking dopasowania'}</h2></div><div className="switch">{[['offers','Ogłoszenia'],['ranking','Ranking SAW']].map(([t,label])=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{label}</button>)}</div></div>
 {!modal&&error&&<p role="alert">{error} <button onClick={()=>run(load)}>Spróbuj ponownie</button></p>}
 {!s&&!error&&<p>Wczytywanie ofert…</p>}
 {s&&tab==='offers'&&<><p className="summary">{view.length} z {s.offers.length} ofert{query.location.trim()&&' · '+query.location.trim()}{query.max&&' · do '+cash(+query.max)}{query.time&&' · do '+query.time+' min'} {(query.location||query.max||query.time)&&<button className="link" onClick={()=>{setDraft(initial);setQuery(initial);}}>Wyczyść wyszukiwanie</button>}</p>
 <div className="cards">{view.map(o=><article key={o.id}><div className="art"><City variant={o.id-1}/><span>Ilustracja</span></div><div className="pad"><small><Icon name="pin"/>{o.location||'Brak lokalizacji'}</small><h3>{o.name}</h3><strong className="price">{cash(o.price)}</strong><p>Dojazd: {o.minutes} min</p><div className="cardactions"><button className="link" onClick={()=>showOffer(o)}>Edytuj</button><button className="link" disabled={busy} onClick={()=>{if(confirm('Usunąć ofertę „'+o.name+'”?'))run(async()=>{await api('offers/'+o.id,'DELETE');await load();});}}>Usuń</button></div></div></article>)}</div>{!view.length&&<p>{s.offers.length?'Brak mieszkań pasujących do wyszukiwania.':'Nie masz jeszcze ogłoszeń. Dodaj pierwsze mieszkanie.'}</p>}</>}
 {s&&tab==='ranking'&&<div className="rank"><p>Ranking całej listy · Budżet {cash(s.budget)} · Cena {s.weight}% · Dojazd {100-s.weight}% <button className="link" onClick={preferences}>Zmień preferencje</button></p>
 {s.ranked.map(o=><details key={o.id}><summary>{o.place}. {o.name} <b>{points(o.score)} pkt</b></summary><p>Cena {cash(o.price)} · dojazd {o.minutes} min. Po normalizacji: {points(o.p)} × {s.weight}% + {points(o.t)} × {100-s.weight}% ≈ {points(o.score)}.</p></details>)}{!s.ranked.length&&<p>Brak ofert w budżecie.</p>}<h3>Pominięte oferty</h3>{s.excluded.length?s.excluded.map(o=><p key={o.id}>{o.name}: ponad budżet o {cash(o.excess)}.</p>):'Brak.'}</div>}
 </section></main><footer>Twoje Mieszkanie · Porównywarka ofert</footer>
 {modal&&<Modal close={close} title={modal==='prefs'?'Profil preferencji':editId===null?'Dodaj ogłoszenie':'Edytuj ogłoszenie'}>{error&&<p role="alert">{error}</p>}
 {modal==='prefs'?<form onSubmit={e=>{e.preventDefault();run(async()=>{await api('preferences','PUT',{budget:Number(pref.budget),weight:Number(pref.weight)});await load();setModal('');setTab('ranking');results.current?.scrollIntoView();});}}>
 <p>Te ustawienia wpływają na ranking wszystkich mieszkań.</p><label>Budżet maksymalny (zł)<input type="number" min="1" max="9999999999" required value={pref.budget} onChange={e=>setPref({...pref,budget:e.target.value})}/></label>
 <label>Waga ceny: {pref.weight}%<input type="range" value={pref.weight} onChange={e=>setPref({...pref,weight:+e.target.value})}/></label><p>Waga dojazdu: {100-pref.weight}%</p><button className="primary" disabled={busy}>Zastosuj preferencje</button></form>:
 <form onSubmit={saveOffer}>{[['name','Tytuł ogłoszenia'],['location','Lokalizacja (miasto lub dzielnica)'],['price','Cena (zł)'],['minutes','Dojazd (min)']].map(([k,label])=><label key={k}>{label}<input required={k!=='location'} maxLength={k==='name'?80:120} type={['price','minutes'].includes(k)?'number':'text'} min={k==='price'?1:0} max={k==='minutes'?1440:k==='price'?9999999999:undefined} value={offer[k]} onChange={e=>setOffer({...offer,[k]:e.target.value})}/></label>)}<button className="primary" disabled={busy}>Zapisz ogłoszenie</button></form>}</Modal>}
 </>;
}
createRoot(document.getElementById('root')).render(<App/>);
