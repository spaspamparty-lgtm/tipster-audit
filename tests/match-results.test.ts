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
