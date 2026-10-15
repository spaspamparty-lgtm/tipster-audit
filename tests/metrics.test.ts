import test from 'node:test';
import assert from 'node:assert/strict';
import {sampledDrawdown,costScenario} from '../lib/metrics.ts';
test('drawdown uses previous peaks and handles losses before first peak',()=>{
 assert.equal(sampledDrawdown([0,5,2,8,1,4]),7);
 assert.equal(sampledDrawdown([0,-2,-4,1]),4);
 assert.equal(sampledDrawdown([0,1,2]),0);
});
test('subscription cost can turn a positive sample into a loss',()=>{
 const result=costScenario(2,10,49)!;
 assert.equal(result.gross,20);assert.equal(result.net,-29);assert.equal(result.breakEvenStake,24.5);
 assert.equal(costScenario(2,10,0)!.net,20);
 assert.equal(costScenario(-2,10,49)!.breakEvenStake,null);
});
test('invalid and empty-input numeric equivalents cannot create an actionable scenario',()=>{
 for(const stake of [0,-1,NaN,Infinity])assert.equal(costScenario(5,stake,49),null);
 for(const fee of [-1,NaN,Infinity])assert.equal(costScenario(5,10,fee),null);
});
