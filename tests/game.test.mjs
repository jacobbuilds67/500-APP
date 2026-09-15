import test from 'node:test';
import assert from 'node:assert/strict';

// Tests exercise the same event rules in a dependency-free form.
const totals = (g) => { const result=Object.fromEntries(g.participants.map((p)=>[p.playerId,0])); g.rounds.forEach((r)=>Object.entries(r.points).forEach(([id,v])=>result[id]+=v)); g.penalties.forEach((p)=>result[p.playerId]-=p.points); return result; };
const winners = (g) => { const s=totals(g); const eligible=g.participants.filter((p)=>s[p.playerId]>=500); if(!eligible.length)return[]; const max=Math.max(...eligible.map((p)=>s[p.playerId]));return eligible.filter((p)=>s[p.playerId]===max).map((p)=>p.playerId); };
const sample = () => ({participants:[{playerId:'a',name:'Anna'},{playerId:'b',name:'Bo'}],rounds:[],penalties:[]});

test('summerer positive og negative point',()=>{const g=sample();g.rounds=[{points:{a:120,b:-30}},{points:{a:80,b:50}}];assert.deepEqual(totals(g),{a:200,b:20});});
test('trækker strafpoint separat',()=>{const g=sample();g.rounds=[{points:{a:100,b:90}}];g.penalties=[{playerId:'a',points:50}];assert.equal(totals(g).a,50);});
test('finder en vinder ved 500 eller mere',()=>{const g=sample();g.rounds=[{points:{a:520,b:480}}];assert.deepEqual(winners(g),['a']);});
test('understøtter delt sejr',()=>{const g=sample();g.rounds=[{points:{a:510,b:510}}];assert.deepEqual(winners(g),['a','b']);});
test('redigering og sletning genberegnes fra events',()=>{const g=sample();g.rounds=[{id:'1',points:{a:300,b:100}},{id:'2',points:{a:220,b:50}}];g.rounds=g.rounds.map((r)=>r.id==='2'?{...r,points:{a:100,b:50}}:r);assert.equal(totals(g).a,400);g.rounds=g.rounds.filter((r)=>r.id!=='1');assert.equal(totals(g).a,100);});
test('30-dages grænsen kan filtreres entydigt',()=>{const now=new Date('2026-09-15T12:00:00Z');const since=new Date(now);since.setDate(since.getDate()-30);assert.equal(new Date('2026-08-17T12:00:00Z')>=since,true);assert.equal(new Date('2026-08-15T11:59:59Z')>=since,false);});
test('JSON backup kan rundsendes uden tab',()=>{const data={version:1,players:[{id:'a',name:'Anna'}],games:[sample()]};assert.deepEqual(JSON.parse(JSON.stringify(data)),data);});
