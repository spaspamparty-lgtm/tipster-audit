import test from 'node:test';
import assert from 'node:assert/strict';
import {checkId,parseCheckFile,serializeChecks,mergeChecks,checkSummary,refreshChecks,type SavedCheck} from '../lib/saved-checks.ts';
const record:SavedCheck={id:checkId(2026,1,'over25','ita.1','espn'),source:'espn',league:'ita.1',season:2026,market:'over25',match:{id:1,home:'Home',away:'Away',kickoff:'2026-09-01T12:00:00Z',finished:false,homeGoals:null,awayGoals:null},savedAt:'2026-09-01T10:00:00Z',fetchedAt:'2026-09-01T09:59:00Z'};
test('backup roundtrip retains source data, timestamps and revisions',()=>{
 const parsed=parseCheckFile(serializeChecks([record]));assert.deepEqual(parsed,[{...record,revisions:[]}]);
 const updated=refreshChecks(parsed,[{...record.match,finished:true,homeGoals:2,awayGoals:1}],'ita.1','2026-09-01T14:00:00Z');
 assert.equal(updated.updated,1);assert.equal(updated.checks[0].savedAt,record.savedAt);assert.deepEqual(updated.checks[0].revisions,[{match:record.match,fetchedAt:record.fetchedAt}]);
 assert.deepEqual(checkSummary(updated.checks),{total:1,wins:1,losses:0,pending:0,unavailable:0,winRate:100});
 assert.equal(refreshChecks(updated.checks,[updated.checks[0].match],'ita.1','2026-09-01T15:00:00Z').updated,0);
 assert.equal(refreshChecks(parsed,[{...record.match,finished:true}],'eng.1','2026-09-01T14:00:00Z').updated,0);
 assert.equal(parseCheckFile(serializeChecks(updated.checks))[0].revisions?.length,1);
});
test('imports preserve existing records and refuse malformed or duplicated data',()=>{
 const changed={...record,match:{...record.match,home:'Changed'}};
 assert.equal(mergeChecks([record],[changed]).checks[0].match.home,'Home');
 assert.equal(mergeChecks([],[record,record]).added,1);
 assert.throws(()=>parseCheckFile(serializeChecks([record,record])));
 assert.throws(()=>parseCheckFile(serializeChecks([{...record,market:'script' as never}])));
 assert.throws(()=>parseCheckFile(serializeChecks([{...record,match:{...record.match,homeGoals:-1}}])));
 assert.throws(()=>parseCheckFile(serializeChecks([{...record,savedAt:'not a date'}])));
 assert.throws(()=>parseCheckFile('null'));
 assert.equal(checkSummary([]).winRate,null);
 assert.equal(checkSummary([record]).pending,1);
});
