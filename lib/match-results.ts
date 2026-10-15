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

export const competitions=[
 {id:'ita.1',name:'Serie A',country:'Italia'},
 {id:'eng.1',name:'Premier League',country:'Inghilterra'},
 {id:'esp.1',name:'La Liga',country:'Spagna'},
 {id:'ger.1',name:'Bundesliga',country:'Germania'},
 {id:'fra.1',name:'Ligue 1',country:'Francia'},
 {id:'uefa.champions',name:'Champions League',country:'Europa'},
] as const;
export type Competition=typeof competitions[number]['id'];
export function validDateRange(from:string,to:string){
 const valid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
 if(!valid(from)||!valid(to))return false;
 const days=(Date.parse(to+'T00:00:00Z')-Date.parse(from+'T00:00:00Z'))/86400000;
 return days>=0&&days<=30;
}
export function scoreboardUrl(league:Competition,from:string,to:string){
 if(!competitions.some(c=>c.id===league)||!validDateRange(from,to))throw Error('Seleziona un periodo valido, massimo 31 giorni inclusi.');
 return `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${from.replaceAll('-','')}-${to.replaceAll('-','')}&limit=1000`;
}
export function parseScoreboard(input:unknown):FootballMatch[]{
 const object=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==='object'?v as Record<string,unknown>:{};
 const events=object(input).events;
 if(!Array.isArray(events))throw Error('Risposta della fonte non riconosciuta.');
 if(events.length>1000)throw Error('Troppi eventi nella risposta. Riduci il periodo.');
 const seen=new Set<number>();
 return events.map(value=>{
  const event=object(value);
  const competition=object(Array.isArray(event.competitions)?event.competitions[0]:undefined);
  const teams=Array.isArray(competition.competitors)?competition.competitors.map(object):[];
  const home=teams.find(t=>t.homeAway==='home')??{},away=teams.find(t=>t.homeAway==='away')??{};
  const homeName=object(home.team).displayName,awayName=object(away.team).displayName;
  const id=typeof event.id==='string'&&/^\d+$/.test(event.id)?Number(event.id):NaN;
  const competitionStatus=object(competition.status??event.status);
  const status=object(competitionStatus.type);
  if(!Number.isSafeInteger(id)||id<=0||seen.has(id)||typeof homeName!=='string'||!homeName.trim()||homeName.length>150||typeof awayName!=='string'||!awayName.trim()||awayName.length>150||typeof event.date!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(event.date)||!Number.isFinite(Date.parse(event.date))||typeof status.completed!=='boolean')throw Error('Dati partita incompleti.');
  seen.add(id);
  const descriptors=[status.name,status.description,status.detail,status.shortDetail].filter(v=>typeof v==='string').join(' ');
  const unsupported=/extra|penalt|\baet\b|\bpens?\b|shootout|cancel|postpon|abandon|suspend|forfeit|award/i.test(descriptors)||(typeof competitionStatus.period==='number'&&competitionStatus.period>2);
  const score=(v:unknown)=>typeof v==='string'&&/^\d{1,2}$/.test(v)?Number(v):typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=99?v:null;
  return {id,home:homeName,away:awayName,kickoff:event.date,finished:status.completed,homeGoals:unsupported?null:score(home.score),awayGoals:unsupported?null:score(away.score)};
 });
}
