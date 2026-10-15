export type Tipster = {id:string;name:string;handle:string;initials:string;color:string;sport:string;market:string;status:'Evidenza demo'|'Dichiarato'|'Non verificato';picks:number;wins:number;profit:number;odds:number;series:number[]};
export const tipsters:Tipster[] = [
{id:'edge',name:'The Edge Lab',handle:'@theedgelab',initials:'EL',color:'#b2f17b',sport:'Calcio',market:'Asian Handicap',status:'Evidenza demo',picks:248,wins:148,profit:38.42,odds:1.94,series:[0,3,2,8,6,12,10,17,14,23,21,28,25,32,38.42]},
{id:'court',name:'Court Vision',handle:'@courtvision',initials:'CV',color:'#b7a4ff',sport:'Basket',market:'Over / Under',status:'Evidenza demo',picks:186,wins:108,profit:24.86,odds:1.96,series:[0,2,5,3,8,6,11,9,14,12,18,17,22,20,24.86]},
{id:'ace',name:'Ace Analytics',handle:'@aceanalytics',initials:'AA',color:'#88c9f7',sport:'Tennis',market:'Vincente',status:'Dichiarato',picks:214,wins:122,profit:19.68,odds:1.92,series:[0,4,2,6,4,9,7,12,10,15,12,17,15,21,19.68]},
{id:'value',name:'Value Theory',handle:'@valuetheory',initials:'VT',color:'#efbb82',sport:'Calcio',market:'1X2',status:'Non verificato',picks:152,wins:77,profit:12.34,odds:2.14,series:[0,-2,1,4,2,5,3,8,5,9,7,11,9,14,12.34]},
];
export const yieldOf=(t:Tipster)=>t.profit/t.picks*100;
export const predictions=[
{id:'TA-1048',tipster:'The Edge Lab',event:'Inter vs. Napoli',league:'Serie A · Calcio',pick:'Over 2.5',odds:1.85,date:'14 ott 2026 · 18:12',kickoff:'14 ott 2026 · 20:45',result:'Vinta',profit:0.85,status:'Evidenza demo'},
{id:'TA-1047',tipster:'Court Vision',event:'Celtics vs. Knicks',league:'NBA · Basket',pick:'Celtics −4.5',odds:1.92,date:'13 ott 2026 · 17:30',kickoff:'14 ott 2026 · 01:30',result:'Persa',profit:-1,status:'Evidenza demo'},
{id:'TA-1046',tipster:'Ace Analytics',event:'Sinner vs. Alcaraz',league:'ATP · Tennis',pick:'Over 22.5 giochi',odds:1.90,date:'13 ott 2026 · 10:08',kickoff:'13 ott 2026 · 15:00',result:'Vinta',profit:0.9,status:'Dichiarato'},
{id:'TA-1045',tipster:'Value Theory',event:'Arsenal vs. Chelsea',league:'Premier League · Calcio',pick:'Arsenal vincente',odds:2.10,date:'12 ott 2026 · 09:42',kickoff:'12 ott 2026 · 17:30',result:'Annullata',profit:0,status:'Non verificato'},
];
export const chartData=Array.from({length:15},(_,i)=>({day:['01','03','05','07','09','11','13','15','17','19','21','23','25','27','30'][i], ...Object.fromEntries(tipsters.map(t=>[t.id,t.series[i]]))}));
