// 穷举所有选择路径：检查每个结局都走得到、没有死胡同、没有报错，并统计各结局的路径数
import fs from 'node:fs';
const src = ['s1_story.js', 's2_story.js', 's3_story.js', 's4_end.js'].map((f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8')).join('\n');
new Function(src)();
const S = globalThis.Story;
const key = (s) => JSON.stringify({ ...s, hist: [], note: '', dinged: false, from: s.from });
const deep = new Set(), ends = {}, nodes = new Set(), times = {}, deadEnds = [];
let paths = 0, errors = 0;
const seen = new Set();
function walk(s, depth) {
  if (s.ending) { paths++; ends[s.ending.id] = (ends[s.ending.id] || 0) + 1; (times[s.ending.id] ||= []).push(s.ending.t); return; }
  const k = key(s);
  if (seen.has(k)) return;
  seen.add(k);
  nodes.add(s.node);
  let v;
  try { v = S.view(s); } catch (e) { errors++; console.log('VIEW ERROR at', s.node, e.message); return; }
  if (!v.choices.length) { deadEnds.push(s.node); return; }
  if (depth > 60) { deep.add(s.node); return; }
  v.choices.forEach((_, i) => {
    const c = JSON.parse(JSON.stringify(s));
    try { S.choose(c, i); } catch (e) { errors++; console.log('CHOOSE ERROR at', s.node, i, e.message); return; }
    walk(c, depth + 1);
  });
}
walk(S.newGame(), 0);
const all = Object.keys(S.N);
console.log('states explored:', seen.size, ' ending paths:', paths, ' errors:', errors);
console.log('loops deeper than 60 at:', deep.size ? [...deep].join(' ') : 'none');
console.log('dead ends:', deadEnds.length ? [...new Set(deadEnds)] : 'none');
console.log('nodes never reached:', all.filter((n) => !nodes.has(n)).join(' ') || 'none');
for (const id of S.ENDING_ORDER) {
  const t = times[id] || [];
  console.log(`  ${id} ${S.ENDINGS[id].title.padEnd(4, '　')} reached by ${String(ends[id] || 0).padStart(6)} distinct endings   arrive ${t.length ? S.hhmm(Math.min(...t)) + '–' + S.hhmm(Math.max(...t)) : '-'}`);
}
// 抽查：所有出现过的 clue 都有文本
const usedClues = [...src.matchAll(/clue\(s, '(\w+)'\)/g)].map((m) => m[1]);
console.log('clues missing text:', usedClues.filter((c) => !S.CLUES[c]).join(' ') || 'none');
