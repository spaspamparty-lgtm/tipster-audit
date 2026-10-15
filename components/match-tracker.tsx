'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ExternalLink,RefreshCw,Search,ShieldCheck,Target} from 'lucide-react';
import SavedChecks from './saved-checks';
import {competitions,matchOutcome,markets,parseScoreboard,scoreboardUrl,seasonNow,validDateRange,type Competition,type FootballMatch,type Market} from '@/lib/match-results';
const dateLabel=(value:string)=>new Intl.DateTimeFormat('it-IT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
const today=()=>new Date().toISOString().slice(0,10);
const fortnight=()=>new Date(Date.now()-13*86400000).toISOString().slice(0,10);
export default function MatchTracker(){
 const [league,setLeague]=useState<Competition>('ita.1');
 const [from,setFrom]=useState(fortnight),[to,setTo]=useState(today);
 const [range,setRange]=useState(()=>({from:fortnight(),to:today()}));
 const [query,setQuery]=useState(''),[status,setStatus]=useState('all'),[visible,setVisible]=useState(30);
 const [matches,setMatches]=useState<FootballMatch[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[formError,setFormError]=useState('');
 const [fetchedAt,setFetchedAt]=useState<string|null>(null),[loadedKey,setLoadedKey]=useState(''),[selectedId,setSelectedId]=useState<number|null>(null),[market,setMarket]=useState<Market>('over25'),[request,setRequest]=useState(0);
 const savedRef=useRef<{save:()=>void}>(null);
 const [saveMessage,setSaveMessage]=useState('');
 const seq=useRef(0),key=`${league}:${range.from}:${range.to}`;
 useEffect(()=>{
  const controller=new AbortController(),current=++seq.current;let timedOut=false;
  setLoading(true);setError('');setMatches([]);setSelectedId(null);setSaveMessage('');setFetchedAt(null);setLoadedKey('');setVisible(30);
  const timer=setTimeout(()=>{timedOut=true;controller.abort()},15000);
  (async()=>{try{
   const response=await fetch(scoreboardUrl(league,range.from,range.to),{signal:controller.signal,cache:'no-store'});
   if(!response.ok)throw Error(`La fonte ha risposto con errore ${response.status}.`);
   const data=parseScoreboard(await response.json());
   if(seq.current!==current||controller.signal.aborted)return;
   setMatches(data);setFetchedAt(new Date().toISOString());setLoadedKey(key);
  }catch(e){
   if(seq.current!==current||(controller.signal.aborted&&!timedOut))return;
   setError(timedOut?'La fonte non ha risposto entro 15 secondi. Riprova.':e instanceof Error&&e.message.startsWith('La fonte')?e.message:'Impossibile recuperare i risultati. La fonte o l’accesso dal browser potrebbe essere bloccato. Nessun dato demo è stato sostituito ai risultati.');
  }finally{clearTimeout(timer);if(seq.current===current)setLoading(false)}})();
  return()=>{clearTimeout(timer);controller.abort()};
 },[league,range.from,range.to,request,key]);
 const active=loadedKey===key?matches:[];
 const filtered=active.filter(m=>`${m.home} ${m.away}`.toLowerCase().includes(query.toLowerCase())&&(status==='all'||(status==='finished'?m.finished:!m.finished))).sort((a,b)=>Date.parse(b.kickoff)-Date.parse(a.kickoff));
 const selected=active.find(m=>m.id===selectedId),outcome=selected?matchOutcome(selected,market):null;
 const competition=competitions.find(c=>c.id===league)!;
 function apply(event:React.FormEvent){event.preventDefault();if(!validDateRange(from,to)){setFormError('Scegli date valide in ordine, per un massimo di 31 giorni inclusi.');return}setFormError('');setRange({from,to});setRequest(n=>n+1)}
 return <div className="match-tracker">
 <section className="panel match-intro"><div><span className="eyebrow">MATCH CHECK · RISULTATI DA FONTE ESTERNA</span><h2>Una partita. Un pronostico. Il suo esito.</h2><p>Serie A e grandi campionati europei: scegli la partita, al punteggio pensa la fonte.</p></div><Target size={32}/></section>
 <div className="match-steps"><span><b>01</b> Cerca partita</span><ArrowRight size={13}/><span><b>02</b> Scegli pronostico</span><ArrowRight size={13}/><span><b>03</b> Controlla e salva</span></div>
 <div className="match-source"><ShieldCheck size={19}/><div><b>Fonte sportiva: ESPN · {competition.name}</b><p>Feed pubblico senza chiavi private. ESPN non è la fonte ufficiale delle leghe: disponibilità, copertura e accesso dal browser dipendono dal fornitore. Nessuna verifica del tipster.</p></div><a href={`https://www.espn.com/soccer/scoreboard/_/league/${league}`} target="_blank" rel="noopener noreferrer">Visita fonte <ExternalLink size={12}/></a></div>
 <form className="panel competition-filters" onSubmit={apply}><label>Campionato<select aria-label="Campionato" value={league} onChange={e=>{setLeague(e.target.value as Competition);setQuery('')}}>{competitions.map(c=><option key={c.id} value={c.id}>{c.name} · {c.country}</option>)}</select></label><label>Dal<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Al<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><button className="button primary" type="submit" disabled={loading}><Search size={14}/>Cerca partite</button>{formError&&<p role="alert">{formError}</p>}<small>Periodo attivo: {range.from} → {range.to} · massimo 31 giorni per ricerca</small></form>
 <div className="match-layout"><section className="panel match-search-panel"><div className="panel-header"><div><h2>Trova la tua partita</h2><p>{competition.name} · {filtered.length} incontri trovati · orari locali del browser</p></div></div>
 <div className="match-filters"><label className="search"><Search size={16}/><input aria-label="Cerca squadra" placeholder="Cerca una squadra…" value={query} onChange={e=>{setQuery(e.target.value);setVisible(30)}}/></label><select aria-label="Stato partita" value={status} onChange={e=>{setStatus(e.target.value);setVisible(30)}}><option value="all">Tutte</option><option value="finished">Concluse</option><option value="pending">Non concluse</option></select><button className="button" onClick={()=>setRequest(n=>n+1)} disabled={loading}><RefreshCw size={14} className={loading?'spinning':''}/>{loading?'Caricamento…':'Aggiorna'}</button></div>
 {loading?<div className="match-empty" role="status"><RefreshCw size={22} className="spinning"/><h3>Recupero partite da ESPN…</h3><p>I risultati non vengono sostituiti con esempi inventati.</p></div>:error?<div className="match-empty error" role="alert"><h3>Risultati non disponibili</h3><p>{error}</p><button className="button" onClick={()=>setRequest(n=>n+1)}>Riprova</button><a className="text-link source-fallback" href={`https://www.espn.com/soccer/scoreboard/_/league/${league}`} target="_blank" rel="noopener noreferrer">Consulta direttamente la fonte <ExternalLink size={13}/></a></div>:<>
 <div className="match-list">{filtered.slice(0,visible).map(m=><button className={'match-row '+(selectedId===m.id?'chosen':'')} key={m.id} onClick={()=>{setSelectedId(m.id);setSaveMessage('')}}><div><small>{dateLabel(m.kickoff)}</small><b>{m.home} <span>vs</span> {m.away}</b><small>{m.finished?'Terminata secondo la fonte':'Non conclusa secondo la fonte'}</small></div><strong>{m.finished&&m.homeGoals!==null&&m.awayGoals!==null?`${m.homeGoals} – ${m.awayGoals}`:'—'}</strong></button>)}</div>
 {filtered.length===0&&<div className="match-empty"><h3>{active.length?'Nessuna partita corrisponde ai filtri':'Nessun incontro disponibile nel periodo'}</h3><p>{active.length?'Cambia squadra o stato.':'Prova un altro intervallo di date. Non tutti i giorni si giocano incontri e il calendario futuro può non essere disponibile.'}</p></div>}
 {filtered.length>visible&&<button className="button load-matches" onClick={()=>setVisible(v=>v+30)}>Mostra altre partite ({filtered.length-visible})</button>}</>}
 {fetchedAt&&<p className="match-footnote">Recuperato il {dateLabel(fetchedAt)} · {active.length} partite. Premi Aggiorna per una nuova lettura. La scelta viene azzerata dopo un aggiornamento.</p>}</section>
 <section className="panel match-slip"><div className="panel-header"><div><h2>Il tuo controllo esito</h2><p>Una simulazione, nessun pronostico pubblicato</p></div></div>{selected?<div className="match-slip-body"><span className="badge muted">ESPN · ID {selected.id}</span><h3>{selected.home}<span>vs</span>{selected.away}</h3><p>{dateLabel(selected.kickoff)}</p><label htmlFor="match-market">Pronostico da controllare<select id="match-market" value={market} onChange={e=>setMarket(e.target.value as Market)}>{markets.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
 <div className={'match-verdict '+outcome} aria-live="polite"><small>{outcome==='pending'?'IN ATTESA DEL RISULTATO FINALE':outcome==='unavailable'?'PUNTEGGIO ASSENTE O FORMATO NON SUPPORTATO':'ESITO CALCOLATO SUL RISULTATO DELLA FONTE'}</small><strong>{outcome==='won'?'Pronostico vinto':outcome==='lost'?'Pronostico perso':outcome==='pending'?'Partita non conclusa':'Non determinabile'}</strong><p>{outcome==='won'||outcome==='lost'?`Risultato finale: ${selected.homeGoals} – ${selected.awayGoals}. Mercato: ${markets.find(m=>m.id===market)?.label}.`:'Nessun esito senza un risultato finale supportato. Supplementari o rigori rilevati escludono il calcolo.'}</p></div>
 <button className="button primary save-selected" onClick={()=>savedRef.current?.save()}>Salva controllo nel mio storico</button>{saveMessage&&<p role="status" className="slip-feedback">{saveMessage}</p>}<a className="button" href={`https://www.espn.com/soccer/match/_/gameId/${selected.id}`} target="_blank" rel="noopener noreferrer">Apri partita sulla fonte <ExternalLink size={13}/></a><p className="match-footnote">Il momento della selezione non prova che il pronostico esistesse prima dell’evento. Per conservare il controllo usa “Salva partita selezionata” qui sotto.</p></div>:<div className="match-empty"><Target size={28}/><h3>Seleziona una partita</h3><p>Il punteggio finale e il mercato scelto determinano l’esito. Nessuna quota o stake da inserire.</p></div>}</section></div>
 <SavedChecks ref={savedRef} onMessage={setSaveMessage} availableMatches={active} match={selected} market={market} league={league} season={selected?seasonNow(new Date(selected.kickoff)):seasonNow()} fetchedAt={loadedKey===key?fetchedAt:null}/>
 <p className="match-footnote">Supportati 1X2, Over/Under 2.5 ed entrambe segnano nel calcio. Supplementari e rigori rilevati non vengono valutati. Mercati live, handicap e annullamenti dei bookmaker non sono gestiti. Nessun servizio a pagamento attivo. Il feed pubblico non ha garanzie contrattuali: per un prodotto commerciale servirà un fornitore con licenza e un backend.</p>
 </div>
}
