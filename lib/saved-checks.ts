import {markets,matchOutcome,competitions,type FootballMatch,type Market} from './match-results.ts';
export const CHECKS_KEY='tipster-audit.match-checks.v1';
export type CheckRevision={match:FootballMatch;fetchedAt:string};
export type SavedCheck={id:string;source:'openligadb'|'espn';league:string;season:number;market:Market;match:FootballMatch;savedAt:string;fetchedAt:string;revisions?:CheckRevision[]};
export const checkId=(season:number,matchId:number,market:Market,league='bl1',source='openligadb')=>`${source}:${league}:${season}:${matchId}:${market}`;
export function serializeChecks(checks:SavedCheck[]){return JSON.stringify({version:1,kind:'tipster-audit-match-checks',checks},null,2)}
export function parseCheckFile(text:string):SavedCheck[]{
 if(text.length>2_000_000)throw Error('File troppo grande: massimo 2 MB.');
 const root=JSON.parse(text);
 if(!root||root.version!==1||root.kind!=='tipster-audit-match-checks'||!Array.isArray(root.checks)||root.checks.length>1000)throw Error('Backup non riconosciuto o oltre 1.000 controlli.');
 const date=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(x)&&Number.isFinite(Date.parse(x));
 const name=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=150;
 const score=(x:unknown)=>x===null||(typeof x==='number'&&Number.isInteger(x)&&x>=0&&x<=100);
 function snapshot(m:FootballMatch){
  if(!m||!Number.isSafeInteger(m.id)||m.id<=0||!name(m.home)||!name(m.away)||!date(m.kickoff)||typeof m.finished!=='boolean'||!score(m.homeGoals)||!score(m.awayGoals))throw Error('Snapshot partita non valido. Nessun dato è stato modificato.');
  return {id:m.id,home:m.home,away:m.away,kickoff:m.kickoff,finished:m.finished,homeGoals:m.homeGoals,awayGoals:m.awayGoals};
 }
 const seen=new Set<string>();
 return root.checks.map((r:SavedCheck)=>{
  const m=snapshot(r?.match);
  if(!r||!((r.source==='openligadb'&&r.league==='bl1')||(r.source==='espn'&&competitions.some(c=>c.id===r.league)))||!Number.isInteger(r.season)||r.season<2000||r.season>2100||!markets.some(v=>v.id===r.market)||!date(r.savedAt)||!date(r.fetchedAt)||(r.id!==checkId(r.season,m.id,r.market,r.league,r.source)&&!(r.source==='openligadb'&&r.id===`bl1:${r.season}:${m.id}:${r.market}`))||seen.has(checkId(r.season,m.id,r.market,r.league,r.source)))throw Error('Il backup contiene controlli non validi o duplicati. Nessun dato è stato modificato.');
  const canonicalId=checkId(r.season,m.id,r.market,r.league,r.source);seen.add(canonicalId);
  if(r.revisions!==undefined&&(!Array.isArray(r.revisions)||r.revisions.length>50))throw Error('Cronologia revisioni non valida.');
  const revisions=(r.revisions??[]).map(v=>{if(!v||!date(v.fetchedAt)||v.match?.id!==m.id)throw Error('Revisione non valida.');return {match:snapshot(v.match),fetchedAt:v.fetchedAt}});
  return {id:canonicalId,source:r.source,league:r.league,season:r.season,market:r.market,match:m,savedAt:r.savedAt,fetchedAt:r.fetchedAt,revisions};
 });
}
/** Import is additive. Existing records always win; never overwrite user snapshots. */
export function mergeChecks(existing:SavedCheck[],incoming:SavedCheck[]){
 const ids=new Set(existing.map(r=>r.id)),added:SavedCheck[]=[];
 for(const item of incoming)if(!ids.has(item.id)){ids.add(item.id);added.push(item)}
 if(existing.length+added.length>1000)throw Error('Limite di 1.000 controlli raggiunto. Esporta un backup prima di continuare.');
 return {checks:[...existing,...added],added:added.length,kept:incoming.length-added.length};
}
export function refreshChecks(existing:SavedCheck[],matches:FootballMatch[],league:string,fetchedAt:string){
 let updated=0;
 const checks=existing.map(c=>{
  const match=matches.find(m=>c.source==='espn'&&c.league===league&&m.id===c.match.id);
  if(!match||JSON.stringify(match)===JSON.stringify(c.match))return c;
  if((c.revisions?.length??0)>=50)throw Error('Limite di 50 revisioni raggiunto: nessun controllo è stato aggiornato.');
  updated++;
  return {...c,match:{...match},fetchedAt,revisions:[...(c.revisions??[]),{match:c.match,fetchedAt:c.fetchedAt}]};
 });
 return {checks,updated};
}
export function checkSummary(checks:SavedCheck[]){
 const outcomes=checks.map(c=>matchOutcome(c.match,c.market));
 const wins=outcomes.filter(o=>o==='won').length,losses=outcomes.filter(o=>o==='lost').length;
 return {total:checks.length,wins,losses,pending:outcomes.filter(o=>o==='pending').length,unavailable:outcomes.filter(o=>o==='unavailable').length,winRate:wins+losses?wins/(wins+losses)*100:null};
}
