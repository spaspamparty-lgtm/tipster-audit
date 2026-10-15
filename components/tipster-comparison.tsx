'use client';
import {useState} from 'react';
import {ArrowRight, Scale, ShieldCheck} from 'lucide-react';
import {tipsters,yieldOf,type Tipster} from '@/lib/data';
import {costScenario,sampledDrawdown} from '@/lib/metrics';
const euros=(n:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);
export default function TipsterComparison({ids,onChange,onOpen}:{ids:string[];onChange:(ids:string[])=>void;onOpen:(t:Tipster)=>void}){
 const [stake,setStake]=useState('10');
 const [fees,setFees]=useState<Record<string,string>>({});
 const pair=ids.map(id=>tipsters.find(t=>t.id===id)!).filter(Boolean);
 function choose(index:number,id:string){const next=[...ids];const other=1-index;if(next[other]===id)next[other]=next[index];next[index]=id;onChange(next)}
 const validStake=stake.trim()!==''&&Number.isFinite(Number(stake))&&Number(stake)>0;
 return <section className="pair-workspace">
 <div className="panel pair-intro"><div><span className="eyebrow">PRIMA DI ABBONARTI · CONFRONTO</span><h2>Stesse regole. Due prospettive.</h2><p>Settembre 2026 · dati demo · stake fisso · un mese di abbonamento per ciascun profilo.</p></div><Scale size={30}/></div>
 <div className="pair-controls"><label>Valore comune di 1 unità (€)<input type="number" min="0.01" step="0.01" value={stake} onChange={e=>setStake(e.target.value)} inputMode="decimal"/></label><p>Lo stesso stake consente di confrontare i risultati. Il volume dei pronostici e le unità investite restano diversi. Il costo mensile è una tua ipotesi, non un prezzo verificato.</p></div>
 <div className="pair-grid">{pair.map((t,index)=>{const fee=fees[t.id]??'49';const scenario=validStake&&fee.trim()!==''?costScenario(t.profit,Number(stake),Number(fee)):null;return <article className="panel pair-card" key={index} style={{borderTopColor:t.color}}>
 <div className="pair-title"><span className="avatar" style={{color:t.color,background:t.color+'12'}}>{t.initials}</span><label><span className="eyebrow">TIPSTER {index+1}</span><select aria-label={`Tipster ${index+1}`} value={t.id} onChange={e=>choose(index,e.target.value)}>{tipsters.map(option=><option value={option.id} key={option.id}>{option.name}</option>)}</select></label></div>
 <div className="pair-context"><span>{t.sport} · {t.market}</span><span className="badge muted">{t.status}</span></div>
 <div className="pair-yield"><span>Yield sullo stake</span><strong style={{color:t.color}}>+{yieldOf(t).toFixed(2)}%</strong><small>Profitto / unità investite · campione demo</small></div>
 <dl className="pair-metrics"><div><dt>Profitto teorico</dt><dd>+{t.profit.toFixed(2)} u</dd></div><div><dt>Pronostici risolti</dt><dd>{t.picks}</dd></div><div><dt>Win rate</dt><dd>{(t.wins/t.picks*100).toFixed(1)}%</dd></div><div><dt>Quota media demo</dt><dd>{t.odds.toFixed(2)}</dd></div><div><dt>Unità investite</dt><dd>{t.picks} u</dd></div><div><dt>Drawdown sui 15 punti demo</dt><dd>{sampledDrawdown(t.series).toFixed(2)} u</dd></div><div><dt>Drawdown completo / perdite consecutive</dt><dd>Non calcolabili</dd></div></dl>
 <div className="pair-evidence"><ShieldCheck size={16}/><p><b>Nessuna evidenza indipendente reale.</b> {t.status==='Evidenza demo'?'Il badge simula una revisione: non certifica questo profilo.':'Fonte originale e timestamp indipendenti non disponibili.'}</p></div>
 <div className="pair-cost"><label htmlFor={'compare-fee-'+t.id}>Costo abbonamento ipotizzato (€ / mese)</label><input id={'compare-fee-'+t.id} type="number" min="0" step="0.01" inputMode="decimal" value={fee} onChange={e=>setFees(f=>({...f,[t.id]:e.target.value}))}/><div className="pair-net" aria-live="polite">{scenario?<><span>Risultato dopo il costo</span><strong className={scenario.net>=0?'positive':'negative'}>{euros(scenario.net)}</strong><small>{euros(scenario.gross)} prima del costo − {euros(scenario.fee)} per un mese</small></>:<p role="alert">Inserisci uno stake positivo e un costo non negativo validi.</p>}</div></div>
 <button className="button" onClick={()=>onOpen(t)}>Esamina il profilo <ArrowRight size={14}/></button>
 </article>})}</div>
 <div className="pair-disclaimer"><b>Nessun vincitore automatico.</b> Sport, mercati e volumi diversi limitano il confronto. Il drawdown è riferito soltanto ai punti campionati, non all’intero storico. Le simulazioni escludono commissioni, tasse, variazioni di quota e pronostici saltati; lo stake non indica il capitale necessario. Dati passati fittizi, nessuna previsione di rendimento.</div>
 </section>
}
