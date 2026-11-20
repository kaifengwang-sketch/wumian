
(() => {
  const ST = globalThis.Story;
  const KEY = { auto: 'wumian.auto.v1', album: 'wumian.album.v1', mute: 'wumian.mute.v1' };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* 存不了也照常玩 */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* 同上 */ } },
  };
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paras = (t) => esc(t).split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  const NAMES = { dou: '豆子', ayun: '阿芸', qin: '秦姐', tang: '小棠', chunni: '春妮' };
  const NOISE = ['村里还睡着', '有人醒了', '很多人醒了', '全村都醒了'];
  let S = null;
  let painted = '';
  let drawerOpen = false;

  // ---- 铃声：用 WebAudio 合成，不加载任何文件 ----
  const Sound = (() => {
    let ctx = null;
    let muted = store.get(KEY.mute) === '1';
    function ding(times = 1) {
      if (muted) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        for (let n = 0; n < times; n++) {
          const t0 = ctx.currentTime + n * 0.18;
          [[1, 0.5], [2.76, 0.22], [5.4, 0.12], [8.9, 0.05]].forEach(([mul, gain]) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 1180 * mul * (1 + n * 0.03);
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(gain * 0.35, t0 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2 / Math.sqrt(mul));
            o.connect(g).connect(ctx.destination);
            o.start(t0);
            o.stop(t0 + 2.4);
          });
        }
      } catch { /* 浏览器不支持就不响 */ }
    }
    return {
      ding,
      get muted() { return muted; },
      toggle() { muted = !muted; store.set(KEY.mute, muted ? '1' : '0'); if (!muted) ding(); },
    };
  })();

  function album() { try { return JSON.parse(store.get(KEY.album) || '[]'); } catch { return []; } }
  function addAlbum(id) { const a = album(); if (!a.includes(id)) { a.push(id); store.set(KEY.album, JSON.stringify(a)); } }
  function albumHTML() {
    const got = album();
    return `<h3>结局图鉴 · ${got.length} / ${ST.ENDING_ORDER.length}</h3><div class="slots">${ST.ENDING_ORDER.map((id) => {
      const e = ST.ENDINGS[id];
      return `<span class="slot${got.includes(id) ? ' got' : ''}">结局${e.num}　${got.includes(id) ? esc(e.title) : '？？？'}</span>`;
    }).join('')}</div>`;
  }

  function paintBg(key) {
    if (key === painted) return;
    painted = key;
    const cv = $('bg');
    cv.classList.add('fade');
    requestAnimationFrame(() => {
      Art.paint(cv, key);
      requestAnimationFrame(() => cv.classList.remove('fade'));
    });
  }

  function renderHud() {
    const left = ST.BUS - S.t;
    const late = left < 0;
    const leftText = late ? '头班车已经开走了' : `离头班车还有 ${Math.floor(left / 60)} 小时 ${left % 60} 分`;
    $('hud').innerHTML = `
      <span class="clock mono${late ? ' late' : ''}">${ST.hhmm(S.t)}<small>${leftText}</small></span>
      <span class="noise${S.alarm >= 3 ? ' hot' : ''}" title="${NOISE[S.alarm]}">${[0, 1, 2].map((i) => `<i class="${i < S.alarm ? 'on' : ''}"></i>`).join('')}<span>${NOISE[S.alarm]}</span></span>
      <span class="tools">
        <button class="tool" type="button" data-clues>线索 ${S.clues.length}</button>
        <button class="tool" type="button" data-undo ${S.hist.length ? '' : 'disabled'}>退一步</button>
        <button class="tool" type="button" data-mute>${Sound.muted ? '声音：关' : '声音：开'}</button>
      </span>`;
  }

  function renderPage() {
    const v = ST.view(S);
    if (v.mode === 'ending') {
      addAlbum(v.id);
      $('cap').innerHTML = `结局 ${v.num} / ${ST.ENDING_ORDER.length}`;
      $('page').innerHTML = `
        <p class="end-num">结局 ${v.num} · ${esc(v.tag)}</p>
        <h2 class="end-title">${esc(v.title)}</h2>
        <div class="txt">${paras(v.text)}</div>
        <div class="end-foot">
          <div class="album">${albumHTML()}</div>
          <div class="btns">
            <button class="primary" type="button" data-new>再来一次</button>
            <button class="ghost" type="button" data-undo>退一步，换个选择</button>
          </div>
          <p class="real">故事是虚构的，拐卖不是。现实中遇到或怀疑有人被拐卖，请拨打 110。</p>
        </div>`;
      return;
    }
    $('cap').innerHTML = `No.${esc(v.id)}<b>${esc(v.title)}</b>`;
    const withYou = Object.keys(NAMES).filter((k) => S.w[k]).map((k) => `<span>${NAMES[k]}</span>`).join('');
    const wrist = { on: '红绳还在', burned: '红绳烧掉了', cut: '红绳剪断了' }[S.string];
    $('page').innerHTML = `
      <div class="with">同行 ${withYou || '<span>只有你</span>'}<span class="wrist">${wrist}</span></div>
      ${v.note ? `<div class="note">${paras(v.note)}</div>` : ''}
      <div class="txt">${paras(v.text)}</div>
      <div class="choices">${v.choices.map((c, i) => `<button class="choice" type="button" data-choose="${i}"><span class="k">${'ABCDEFG'[i]}</span><span>${esc(c)}</span></button>`).join('')}</div>`;
  }

  function renderDrawer() {
    const d = $('drawer');
    d.hidden = !drawerOpen || !S;
    if (d.hidden) return;
    d.innerHTML = `<div class="drawer-in">
      <h2>线索本 <button class="tool" type="button" data-clues>收起</button></h2>
      <p class="hint">一路上你记下的事。哪些重要、说明了什么，要你自己判断。</p>
      <ol>${S.clues.map((c) => `<li>${esc(ST.CLUES[c])}</li>`).join('')}</ol>
    </div>`;
  }

  function render() {
    if (!S) {
      $('start').hidden = false;
      $('game').hidden = true;
      $('drawer').hidden = true;
      $('album').innerHTML = albumHTML();
      document.querySelector('[data-resume]').hidden = true;
      paintBg('room');
      return;
    }
    $('start').hidden = true;
    $('game').hidden = false;
    paintBg(ST.bgOf(S));
    renderHud();
    renderPage();
    renderDrawer();
    store.set(KEY.auto, JSON.stringify(S));
  }

  function top() { window.scrollTo({ top: 0, behavior: 'auto' }); }

  let armed = false;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if ('new' in d) {
      if (S && !S.ending && !armed && b.closest('#start') === null) {
        armed = true;
        b.textContent = '再点一次，重新开始';
        setTimeout(() => { armed = false; }, 3000);
        return;
      }
      armed = false;
      S = ST.newGame();
      drawerOpen = false;
      top();
    } else if ('resume' in d) {
      // 由 start() 设置 S，这里只渲染
    } else if (!S) return;
    else if ('choose' in d) {
      ST.choose(S, Number(d.choose));
      if (S.dinged) Sound.ding(S.alarm >= 3 ? 3 : 1);
      top();
    } else if ('undo' in d) { S = ST.undo(S); top(); }
    else if ('clues' in d) drawerOpen = !drawerOpen;
    else if ('mute' in d) Sound.toggle();
    else return;
    render();
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { const k = painted; painted = ''; paintBg(k || 'room'); }, 200);
  });

  function start(data) {
    if (data && data.S) S = data.S;
    else {
      try { const x = JSON.parse(store.get(KEY.auto) || 'null'); S = x && x.v === 1 && x.node ? x : null; } catch { S = null; }
    }
    render();
  }
  window.claude?.hot?.snapshot?.(() => ({ S }));
  if (window.claude?.hot?.ready) window.claude.hot.ready(start);
  else start(window.claude?.hot?.data ?? {});
})();
