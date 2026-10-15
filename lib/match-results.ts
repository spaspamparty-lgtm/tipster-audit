export type FootballMatch={id:number;home:string;away:string;kickoff:string;finished:boolean;homeGoals:number|null;awayGoals:number|null};
export type Market='home'|'draw'|'away'|'over25'|'under25'|'bttsYes'|'bttsNo';
export const markets:{id:Market;label:string}[]=[{id:'home',label:'1 · Vittoria casa'},{id:'draw',label:'X · Pareggio'},{id:'away',label:'2 · Vittoria ospite'},{id:'over25',label:'Over 2.5 gol'},{id:'under25',label:'Under 2.5 gol'},{id:'bttsYes',label:'Entrambe segnano · Sì'},{id:'bttsNo',label:'Entrambe segnano · No'}];
export function matchOutcome(match:FootballMatch,market:Market):'won'|'lost'|'pending'|'unavailable'{
 if(!match.finished)return 'pending';
 if(match.homeGoals===null||match.awayGoals===null)return 'unavailable';
 const h=match.homeGoals,a=match.awayGoals;
 const win={home:h>a,draw:h===a,away:a>h,over25:h+a>2.5,under25:h+a<2.5,bttsYes:h>0&&a>0,bttsNo:h===0||a===0}[market];
 return win?'won':'lost';
}
/** Provider result type 2 is the full-time result, not half-time or interim score. */
export function parseMatches(input:unknown):FootballMatch[]{
 if(!Array.isArray(input)||input.length>1000)throw Error('Formato della risposta non supportato.');
 return input.map((value:unknown)=>{
  if(!value||typeof value!=='object')throw Error('Partita non valida.');
  const r=value as Record<string,unknown>,t1=r.team1 as Record<string,unknown>|undefined,t2=r.team2 as Record<string,unknown>|undefined;
  if(!Number.isSafeInteger(r.matchID)||!t1||!t2||typeof t1.teamName!=='string'||typeof t2.teamName!=='string'||typeof r.matchDateTimeUTC!=='string'||!Number.isFinite(Date.parse(r.matchDateTimeUTC))||typeof r.matchIsFinished!=='boolean')throw Error('Dati partita incompleti.');
  const final=Array.isArray(r.matchResults)?r.matchResults.find(v=>v&&v.resultTypeID===2):undefined;
  const score=(n:unknown):number|null=>typeof n==='number'&&Number.isInteger(n)&&n>=0?n:null;
  return {id:r.matchID as number,home:t1.teamName,away:t2.teamName,kickoff:r.matchDateTimeUTC,finished:r.matchIsFinished,homeGoals:score(final?.pointsTeam1),awayGoals:score(final?.pointsTeam2)};
 });
}
export function seasonNow(date=new Date()){return date.getUTCMonth()>=6?date.getUTCFullYear():date.getUTCFullYear()-1}
