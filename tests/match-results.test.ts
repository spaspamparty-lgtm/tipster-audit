import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMatches,matchOutcome,type FootballMatch,type Market} from '../lib/match-results.ts';
const match:FootballMatch={id:1,home:'Home',away:'Away',kickoff:'2026-09-01T12:00:00Z',finished:true,homeGoals:2,awayGoals:1};
test('supported markets settle on full-time score, including draws and goalless games',()=>{
 for(const m of ['home','over25','bttsYes'] as Market[])assert.equal(matchOutcome(match,m),'won');
 for(const m of ['draw','away','under25','bttsNo'] as Market[])assert.equal(matchOutcome(match,m),'lost');
 const draw={...match,homeGoals:0,awayGoals:0};
 for(const m of ['draw','under25','bttsNo'] as Market[])assert.equal(matchOutcome(draw,m),'won');
 assert.equal(matchOutcome({...match,homeGoals:0,awayGoals:1},'away'),'won');
});
test('no settlement for unfinished or missing final scores',()=>{
 assert.equal(matchOutcome({...match,finished:false},'home'),'pending');
 assert.equal(matchOutcome({...match,homeGoals:null},'home'),'unavailable');
});
test('parser uses full-time resultTypeID 2, never half-time',()=>{
 const record={matchID:1,team1:{teamName:'A'},team2:{teamName:'B'},matchDateTimeUTC:match.kickoff,matchIsFinished:true,matchResults:[{resultTypeID:1,pointsTeam1:1,pointsTeam2:0},{resultTypeID:2,pointsTeam1:1,pointsTeam2:2}]};
 const [parsed]=parseMatches([record]);assert.equal(parsed.awayGoals,2);assert.equal(matchOutcome(parsed,'away'),'won');
 const [missing]=parseMatches([{...record,matchResults:[record.matchResults[0]]}]);assert.equal(matchOutcome(missing,'home'),'unavailable');
 const [invalid]=parseMatches([{...record,matchResults:[{resultTypeID:2,pointsTeam1:-1,pointsTeam2:2}]}]);assert.equal(invalid.homeGoals,null);
 assert.throws(()=>parseMatches({}));assert.throws(()=>parseMatches([{}]));assert.throws(()=>parseMatches([{...record,matchDateTimeUTC:'invalid'}]));
});

import {parseScoreboard,scoreboardUrl,validDateRange} from '../lib/match-results.ts';
const event=(scoreHome='2',scoreAway='1',status={completed:true,name:'STATUS_FULL_TIME',description:'Full Time',detail:'FT'},period=2)=>({id:'123',date:'2026-09-01T12:00:00Z',competitions:[{status:{type:status,period},competitors:[{homeAway:'away',score:scoreAway,team:{displayName:'Away'}},{homeAway:'home',score:scoreHome,team:{displayName:'Home'}}]}]});
test('ESPN parser maps home/away independently of array order and rejects extra time',()=>{
 const [m]=parseScoreboard({events:[event()]});assert.equal(matchOutcome(m,'home'),'won');
 const aet=event('3','2',{completed:true,name:'STATUS_FINAL_AET',description:'Final - AET',detail:'AET'},3);
 assert.equal(matchOutcome(parseScoreboard({events:[aet]})[0],'over25'),'unavailable');
 const abandoned=event('1','0',{completed:true,name:'STATUS_ABANDONED',description:'Abandoned',detail:'Abandoned'});
 assert.equal(matchOutcome(parseScoreboard({events:[abandoned]})[0],'home'),'unavailable');
 const missing=event('','1');assert.equal(parseScoreboard({events:[missing]})[0].homeGoals,null);
 assert.throws(()=>parseScoreboard({events:[event(),event()]}));assert.throws(()=>parseScoreboard({}));
});
test('date range and destination are bounded; no arbitrary URL or league can be fetched',()=>{
 assert.equal(validDateRange('2026-09-01','2026-10-01'),true);
 assert.equal(validDateRange('2026-09-01','2026-10-02'),false);
 assert.equal(validDateRange('2026-09-02','2026-09-01'),false);
 assert.equal(validDateRange('2026-02-30','2026-03-01'),false);
 assert.match(scoreboardUrl('ita.1','2026-09-01','2026-09-02'),/ita\.1\/scoreboard\?dates=20260901-20260902/);
 assert.throws(()=>scoreboardUrl('unknown' as never,'2026-09-01','2026-09-02'));
});
