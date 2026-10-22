const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const moduleExports={};
new Function('exports',ts.transpileModule(fs.readFileSync('frontend/src/lib/atmosphere.ts','utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
}).outputText)(moduleExports);
const {conditions,daylight,localDay,palettes}=moduleExports;
test('weather codes select rain, frozen precipitation, fog and storms',()=>{
  for(const code of [0,1])assert.equal(conditions(code),'clear');
  for(const code of [2,3,45,48])assert.equal(conditions(code),'cloud');
  for(const code of [51,53,55,56,57,61,63,65,66,67,80,81,82])assert.equal(conditions(code),'rain');
  for(const code of [71,73,75,77,85,86])assert.equal(conditions(code),'snow');
  for(const code of [95,96,99])assert.equal(conditions(code),'storm');
});
test('sunrise and sunset switch without waiting for another weather fetch',()=>{
  const rise=[100000,186400],set=[140000,226400];
  assert.equal(daylight(99999,rise,set,true),false);
  assert.equal(daylight(100000,rise,set,false),true);
  assert.equal(daylight(140000,rise,set,true),false);
  assert.equal(daylight(186400,rise,set,false),true);
  assert.equal(daylight(226400,rise,set,true),false);
  assert.equal(daylight(500000,rise,set,true),true);
});
test('offline fallback follows the visitor clock',()=>{
  assert.equal(localDay(new Date(2026,9,21,12)),true);
  assert.equal(localDay(new Date(2026,9,21,23)),false);
});
test('each condition has distinct, valid day and night dither colours',()=>{
  for(const kind of ['clear','cloud','rain','snow','storm']){
    assert.match(palettes[kind+'-day'],/^#[0-9a-f]{6}$/);
    assert.match(palettes[kind+'-night'],/^#[0-9a-f]{6}$/);
    assert.notEqual(palettes[kind+'-day'],palettes[kind+'-night']);
  }
});
