
// 背景“老照片”：每个场景用 canvas 画一张，再做褪色、颗粒、划痕和暗角
const Art = (() => {
  function rng(seed) {
    let t = seed >>> 0;
    return () => {
      t = (t + 0x6d2b79f5) >>> 0;
      let x = Math.imul(t ^ (t >>> 15), t | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (str) => [...str].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  let grainTile = null;
  function grain() {
    if (grainTile) return grainTile;
    const c = document.createElement('canvas');
    c.width = c.height = 180;
    const g = c.getContext('2d'), img = g.createImageData(180, 180);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 46;
    }
    g.putImageData(img, 0, 0);
    grainTile = c;
    return c;
  }

  // ---- 画画用的小零件 ----
  function vgrad(g, w, h, stops, y0 = 0, y1 = h) {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
    g.fillStyle = gr;
    g.fillRect(0, y0, w, y1 - y0);
  }
  function glow(g, x, y, r, color, a = 1) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, color);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = a;
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
    g.globalAlpha = 1;
  }
  function moon(g, x, y, r) {
    glow(g, x, y, r * 5, 'rgba(210,225,230,0.28)');
    g.fillStyle = '#dfe6e3';
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  function ridge(g, w, base, amp, color, R, step = 8) {
    const p = R() * 9, f = 0.004 + R() * 0.006;
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, 9999);
    for (let x = 0; x <= w + step; x += step) g.lineTo(x, base - Math.abs(Math.sin(x * f + p)) * amp - Math.sin(x * f * 3.1 + p) * amp * 0.25);
    g.lineTo(w + step, 9999);
    g.closePath();
    g.fill();
  }
  function fog(g, w, y, hh, a) {
    const gr = g.createLinearGradient(0, y - hh, 0, y + hh);
    gr.addColorStop(0, 'rgba(190,200,200,0)');
    gr.addColorStop(0.5, `rgba(190,200,200,${a})`);
    gr.addColorStop(1, 'rgba(190,200,200,0)');
    g.fillStyle = gr;
    g.fillRect(0, y - hh, w, hh * 2);
  }
  function house(g, x, base, bw, bh, color, lit) {
    g.fillStyle = color;
    g.fillRect(x, base - bh, bw, bh);
    g.beginPath();
    g.moveTo(x - bw * 0.12, base - bh);
    g.lineTo(x + bw / 2, base - bh - bw * 0.32);
    g.lineTo(x + bw * 1.12, base - bh);
    g.closePath();
    g.fill();
    if (lit) {
      glow(g, x + bw * 0.5, base - bh * 0.55, bw * 0.7, lit, 0.55);
      g.fillStyle = lit;
      g.fillRect(x + bw * 0.38, base - bh * 0.7, bw * 0.24, bh * 0.28);
    }
  }
  function bell(g, x, y, s, color = '#b89a52') {
    g.strokeStyle = 'rgba(0,0,0,0.6)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y - s * 2);
    g.lineTo(x, y - s * 0.8);
    g.stroke();
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(x - s * 0.9, y + s * 0.6);
    g.quadraticCurveTo(x - s * 0.8, y - s, x, y - s);
    g.quadraticCurveTo(x + s * 0.8, y - s, x + s * 0.9, y + s * 0.6);
    g.closePath();
    g.fill();
    glow(g, x - s * 0.2, y - s * 0.2, s * 2.2, 'rgba(230,200,120,0.35)');
  }
  function person(g, x, base, hh, color, hair) {
    g.fillStyle = color;
    const hw = hh * 0.13;
    g.beginPath();
    g.arc(x, base - hh + hw, hw, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(x - hw * 1.1, base - hh + hw * 2.2);
    g.lineTo(x + hw * 1.1, base - hh + hw * 2.2);
    g.lineTo(x + hw * 1.6, base);
    g.lineTo(x - hw * 1.6, base);
    g.closePath();
    g.fill();
    if (hair) g.fillRect(x - hw, base - hh + hw, hw * 2, hh * 0.32);
  }
  function tree(g, x, base, hh, color) {
    g.fillStyle = color;
    g.fillRect(x - hh * 0.02, base - hh * 0.5, hh * 0.04, hh * 0.5);
    g.beginPath();
    g.moveTo(x, base - hh);
    g.lineTo(x + hh * 0.22, base - hh * 0.35);
    g.lineTo(x - hh * 0.22, base - hh * 0.35);
    g.closePath();
    g.fill();
  }
  function flames(g, cx, base, wid, hh, R) {
    glow(g, cx, base - hh * 0.4, wid * 1.6, 'rgba(255,140,40,0.55)');
    for (let i = 0; i < 26; i++) {
      const x = cx + (R() - 0.5) * wid, fh = hh * (0.3 + R() * 0.7), fw = wid * (0.05 + R() * 0.08);
      g.fillStyle = R() < 0.5 ? 'rgba(255,170,60,0.75)' : 'rgba(255,90,30,0.7)';
      g.beginPath();
      g.moveTo(x - fw, base);
      g.quadraticCurveTo(x - fw * 0.6, base - fh * 0.6, x + (R() - 0.5) * fw, base - fh);
      g.quadraticCurveTo(x + fw * 0.6, base - fh * 0.6, x + fw, base);
      g.closePath();
      g.fill();
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = 'rgba(255,200,120,0.8)';
      g.fillRect(cx + (R() - 0.5) * wid * 1.6, base - hh - R() * hh, 1.5, 1.5);
    }
  }
  function village(g, w, h, R, lit) {
    const horizon = h * 0.46;
    vgrad(g, w, h, ['#0b1016', '#18222a', '#25303a'], 0, horizon);
    moon(g, w * 0.78, h * 0.12, Math.min(w, h) * 0.035);
    ridge(g, w, horizon - h * 0.06, h * 0.12, '#141b22', R);
    ridge(g, w, horizon, h * 0.05, '#0e1419', R);
    vgrad(g, w, h, ['#1b1d1c', '#0c0d0d'], horizon, h);
    // 两排房子往远处收
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < 6; i++) {
        const k = 1 - i * 0.14, bw = w * 0.2 * k, bh = h * 0.16 * k;
        const base = horizon + h * 0.32 * k * k;
        const x = side === 0 ? w * 0.5 - w * 0.06 - bw - w * 0.36 * k * k : w * 0.5 + w * 0.06 + w * 0.36 * k * k;
        const l = lit && R() < lit ? 'rgba(255,170,80,0.85)' : null;
        house(g, x, base, bw, bh, '#0d0f10', l);
        bell(g, side === 0 ? x + bw : x, base - bh * 0.9, Math.max(2, 5 * k));
      }
    }
    glow(g, w * 0.5, horizon - h * 0.01, h * 0.06, 'rgba(255,200,120,0.6)');
    g.fillStyle = 'rgba(255,215,150,0.9)';
    g.fillRect(w * 0.5 - 2, horizon - h * 0.015, 4, 4);
  }

  // ---- 场景 ----
  const S = {
    room(g, w, h, R) {
      vgrad(g, w, h, ['#08090a', '#111315', '#0a0b0c']);
      const ww = Math.min(w * 0.6, 360), wh = ww * 0.8, x = (w - ww) / 2, y = h * 0.1;
      const gr = g.createLinearGradient(0, y, 0, y + wh);
      gr.addColorStop(0, '#2b3a44');
      gr.addColorStop(1, '#45525a');
      g.fillStyle = gr;
      g.fillRect(x, y, ww, wh);
      g.save();
      g.beginPath();
      g.rect(x, y, ww, wh);
      g.clip();
      moon(g, x + ww * 0.75, y + wh * 0.25, ww * 0.06);
      ridge(g, w, y + wh * 0.75, wh * 0.2, '#1a2329', R, 6);
      person(g, x + ww * 0.3, y + wh * 1.05, wh * 0.45, '#0b0d0e', false);
      g.restore();
      g.fillStyle = '#1b1612';
      g.fillRect(x - 12, y - 12, ww + 24, 12);
      g.fillRect(x - 12, y + wh, ww + 24, 14);
      g.fillRect(x - 12, y, 12, wh);
      g.fillRect(x + ww, y, 12, wh);
      for (let i = 1; i <= 6; i++) {
        const bx = x + (ww / 7) * i;
        g.fillStyle = '#060606';
        g.fillRect(bx - 3, y, 6, wh);
        g.fillStyle = 'rgba(160,180,190,0.18)';
        g.fillRect(bx - 3, y, 1.5, wh);
      }
      glow(g, w / 2, y + wh + h * 0.12, ww, 'rgba(120,150,170,0.18)');
      g.strokeStyle = 'rgba(200,200,200,0.18)';
      g.lineWidth = 0.7;
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(Math.cos(i * 0.22) * 90, Math.sin(i * 0.22) * 90);
        g.stroke();
      }
      for (let r = 20; r < 90; r += 16) {
        g.beginPath();
        g.arc(0, 0, r, 0, Math.PI / 2 * 0.9);
        g.stroke();
      }
    },
    village(g, w, h, R) { village(g, w, h, R, 0.08); },
    alarm(g, w, h, R) {
      village(g, w, h, R, 0.9);
      for (let i = 0; i < 9; i++) person(g, w * (0.3 + R() * 0.4), h * (0.6 + R() * 0.25), h * (0.12 + R() * 0.06), '#070808', true);
      g.globalCompositeOperation = 'soft-light';
      g.fillStyle = 'rgba(200,40,30,0.5)';
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'source-over';
    },
    cellar(g, w, h, R) {
      g.fillStyle = '#050505';
      g.fillRect(0, 0, w, h);
      g.save();
      g.globalAlpha = 0.5;
      const gr = g.createLinearGradient(w * 0.4, 0, w * 0.6, h * 0.6);
      gr.addColorStop(0, 'rgba(190,210,220,0.9)');
      gr.addColorStop(1, 'rgba(190,210,220,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(w * 0.42, 0);
      g.lineTo(w * 0.47, 0);
      g.lineTo(w * 0.7, h * 0.62);
      g.lineTo(w * 0.5, h * 0.62);
      g.closePath();
      g.fill();
      g.restore();
      for (let i = 0; i < 60; i++) {
        g.fillStyle = `rgba(220,220,210,${0.2 + R() * 0.5})`;
        g.fillRect(w * 0.45 + R() * w * 0.2, R() * h * 0.6, 1.2, 1.2);
      }
      g.fillStyle = 'rgba(150,170,180,0.25)';
      g.beginPath();
      g.ellipse(w * 0.44, h * 0.08, w * 0.05, h * 0.035, 0, 0, Math.PI * 2);
      g.fill();
    },
    shed(g, w, h, R) {
      vgrad(g, w, h, ['#16120e', '#0d0b09']);
      for (let x = 0; x < w; x += 22 + R() * 10) {
        g.fillStyle = `rgba(${60 + R() * 30},${45 + R() * 20},${30},0.5)`;
        g.fillRect(x, 0, 2, h);
      }
      const dw = Math.min(w * 0.42, 240), dx = (w - dw) / 2, dy = h * 0.12, dh = h * 0.42;
      g.fillStyle = '#030303';
      g.fillRect(dx, dy, dw, dh);
      for (let i = 0; i < 80; i++) {
        g.strokeStyle = `rgba(${150 + R() * 60},${120 + R() * 40},60,0.35)`;
        g.beginPath();
        const sx = dx + R() * dw, sy = dy + dh * (0.6 + R() * 0.4);
        g.moveTo(sx, sy);
        g.lineTo(sx + (R() - 0.5) * 30, sy - R() * 12);
        g.stroke();
      }
      g.fillStyle = '#2a2018';
      g.save();
      g.translate(dx + dw, dy);
      g.rotate(0.35);
      g.fillRect(0, 0, dw * 0.55, dh);
      g.restore();
      bell(g, w / 2, dy - 14, 8);
      g.fillStyle = '#3a2b1d';
      g.fillRect(dx - 30, dy + dh * 0.45, dw + 60, 8);
    },
    shrine(g, w, h, R) {
      vgrad(g, w, h, ['#0e0907', '#1a100b', '#0a0706']);
      for (let row = 0; row < 4; row++) {
        for (let i = 0; i < 9; i++) {
          const mx = w * 0.08 + i * w * 0.105, my = h * 0.05 + row * h * 0.075;
          g.fillStyle = `rgba(${200 + R() * 30},${190 + R() * 20},${160 + R() * 20},${0.16 + R() * 0.1})`;
          g.fillRect(mx, my, w * 0.07, h * 0.055);
        }
      }
      const cx = w / 2, base = h * 0.5, sh = h * 0.34;
      glow(g, cx, base - sh * 0.4, sh, 'rgba(255,170,90,0.35)');
      g.fillStyle = '#5a1712';
      g.beginPath();
      g.moveTo(cx - sh * 0.38, base);
      g.lineTo(cx - sh * 0.24, base - sh * 0.62);
      g.lineTo(cx + sh * 0.24, base - sh * 0.62);
      g.lineTo(cx + sh * 0.38, base);
      g.closePath();
      g.fill();
      g.fillStyle = '#c9b48f';
      g.beginPath();
      g.ellipse(cx, base - sh * 0.78, sh * 0.13, sh * 0.17, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,240,210,0.25)';
      g.beginPath();
      g.ellipse(cx - sh * 0.03, base - sh * 0.82, sh * 0.05, sh * 0.08, -0.3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#2a0b08';
      g.fillRect(cx - sh * 0.3, base - sh * 0.2, sh * 0.6, sh * 0.06);
      glow(g, cx, base + sh * 0.1, sh * 0.5, 'rgba(255,190,90,0.7)');
      g.fillStyle = '#ffd38a';
      g.beginPath();
      g.ellipse(cx, base + sh * 0.06, 5, 11, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#6b5124';
      g.fillRect(cx - 18, base + sh * 0.1, 36, 10);
    },
    masks(g, w, h, R) {
      vgrad(g, w, h, ['#120c09', '#0a0706']);
      const cols = Math.max(4, Math.round(w / 90)), cw = w / cols;
      for (let row = 0; row < 6; row++) {
        for (let i = 0; i < cols; i++) {
          const x = i * cw + cw * 0.15, y = h * 0.04 + row * h * 0.09, mw = cw * 0.7, mh = h * 0.075;
          const hot = row === 5 && i === Math.floor(cols / 2);
          g.fillStyle = hot ? 'rgba(235,225,200,0.6)' : `rgba(${190 + R() * 40},${180 + R() * 30},${150 + R() * 20},${0.14 + R() * 0.14})`;
          g.fillRect(x, y, mw, mh);
          g.fillStyle = 'rgba(30,20,15,0.55)';
          g.fillRect(x + mw * 0.28, y + mh * 0.35, mw * 0.1, mh * 0.08);
          g.fillRect(x + mw * 0.62, y + mh * 0.35, mw * 0.1, mh * 0.08);
          g.fillRect(x + mw * 0.4, y + mh * 0.7, mw * 0.2, mh * 0.05);
        }
      }
      glow(g, w / 2, h * 0.62, h * 0.25, 'rgba(255,170,90,0.25)');
    },
    fire(g, w, h, R) {
      vgrad(g, w, h, ['#1a0a05', '#3a1408', '#120805']);
      const base = h * 0.52;
      g.fillStyle = '#0a0503';
      g.beginPath();
      g.moveTo(w * 0.25, base);
      g.lineTo(w * 0.25, base - h * 0.16);
      g.lineTo(w * 0.5, base - h * 0.27);
      g.lineTo(w * 0.75, base - h * 0.16);
      g.lineTo(w * 0.75, base);
      g.closePath();
      g.fill();
      flames(g, w * 0.5, base, w * 0.6, h * 0.36, R);
      for (let i = 0; i < 7; i++) person(g, w * (0.1 + R() * 0.8), h * (0.66 + R() * 0.12), h * 0.12, '#050302', R() < 0.5);
      g.fillStyle = 'rgba(60,40,30,0.4)';
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.ellipse(w * (0.35 + R() * 0.3), h * (0.05 + R() * 0.15), w * 0.25, h * 0.05, 0, 0, Math.PI * 2);
        g.fill();
      }
    },
    ditch(g, w, h, R) {
      vgrad(g, w, h, ['#0b0f12', '#141a1c']);
      g.fillStyle = '#0a0b0b';
      g.fillRect(0, h * 0.08, w * 0.62, h * 0.48);
      const dx = w * 0.18, dy = h * 0.24, dw = w * 0.16, dh = h * 0.32;
      g.fillStyle = '#020202';
      g.fillRect(dx, dy, dw, dh);
      person(g, dx + dw * 0.5, dy + dh, dh * 0.62, '#111414', false);
      glow(g, dx + dw * 0.62, dy + dh * 0.47, 22, 'rgba(255,120,40,0.8)');
      g.fillStyle = '#ff8a3a';
      g.fillRect(dx + dw * 0.62, dy + dh * 0.47, 3, 3);
      g.fillStyle = '#0e1012';
      g.fillRect(w * 0.7, h * 0.12, w * 0.3, h * 0.44);
      g.fillStyle = 'rgba(150,170,170,0.25)';
      g.fillRect(w * 0.78, h * 0.22, w * 0.1, h * 0.08);
      vgrad(g, w, h, ['#151513', '#0b0b0a'], h * 0.56, h);
      for (let i = 0; i < 30; i++) {
        g.fillStyle = `rgba(160,180,190,${0.05 + R() * 0.1})`;
        g.fillRect(R() * w, h * 0.58 + R() * h * 0.3, 20 + R() * 60, 1);
      }
    },
    grave(g, w, h, R) {
      vgrad(g, w, h, ['#0d1215', '#1c2428', '#2a3135'], 0, h * 0.5);
      moon(g, w * 0.22, h * 0.1, Math.min(w, h) * 0.03);
      ridge(g, w, h * 0.42, h * 0.08, '#141a1d', R);
      g.fillStyle = '#0c0f10';
      g.beginPath();
      g.moveTo(0, h * 0.6);
      g.quadraticCurveTo(w * 0.5, h * 0.36, w, h * 0.5);
      g.lineTo(w, h);
      g.lineTo(0, h);
      g.closePath();
      g.fill();
      for (let i = 0; i < 14; i++) {
        const x = R() * w, y = h * (0.5 + R() * 0.2), r = 12 + R() * 18;
        g.fillStyle = '#16191a';
        g.beginPath();
        g.ellipse(x, y, r, r * 0.45, 0, Math.PI, 0);
        g.fill();
        g.fillStyle = '#2a2a26';
        g.fillRect(x + r * 0.3, y - r * 1.4, 2, r * 1.2);
        bell(g, x + r * 0.3 + 1, y - r * 0.7, 3);
      }
      g.fillStyle = '#090b0c';
      g.fillRect(w * 0.7, h * 0.33, w * 0.08, h * 0.1);
      g.fillRect(w * 0.82, h * 0.31, w * 0.09, h * 0.12);
      for (let i = 0; i < 4; i++) {
        const x = w * (0.72 + i * 0.05), y = h * (0.325 - (i % 2) * 0.02);
        g.fillStyle = '#050505';
        g.beginPath();
        g.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2);
        g.fill();
        g.fillRect(x + 3, y - 6, 3, 4);
      }
      fog(g, w, h * 0.55, h * 0.08, 0.25);
    },
    chase(g, w, h, R) {
      vgrad(g, w, h, ['#090b0d', '#141719']);
      for (let i = 0; i < 18; i++) tree(g, R() * w, h * (0.5 + R() * 0.15), h * (0.3 + R() * 0.25), '#060707');
      for (let i = 0; i < 12; i++) {
        const t = i / 11, x = w * (0.15 + t * 0.7), y = h * (0.72 - t * 0.3);
        glow(g, x, y, 28, 'rgba(255,140,50,0.7)');
        g.fillStyle = '#ffb860';
        g.fillRect(x - 1.5, y - 3, 3, 5);
        person(g, x + 10, y + h * 0.1, h * 0.09, '#040404', i % 2 === 0);
      }
      fog(g, w, h * 0.62, h * 0.1, 0.18);
    },
    hut(g, w, h, R) {
      vgrad(g, w, h, ['#0b0f12', '#1a2125'], 0, h * 0.5);
      ridge(g, w, h * 0.5, h * 0.08, '#0d1113', R);
      for (let i = 0; i < 10; i++) tree(g, R() * w, h * 0.52, h * (0.2 + R() * 0.2), '#070909');
      const hx = w * 0.32, hb = h * 0.52, hw = w * 0.36, hh = h * 0.16;
      house(g, hx, hb, hw, hh, '#0f0d0b', 'rgba(255,180,90,0.85)');
      g.fillStyle = '#050505';
      g.beginPath();
      g.ellipse(hx - 22, hb - 6, 16, 7, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(hx - 34, hb - 11, 6, 0, Math.PI * 2);
      g.fill();
      vgrad(g, w, h, ['#0c0d0d', '#060606'], hb, h);
    },
    cliff(g, w, h, R) { cliffScene(g, w, h, R, false); },
    cliffFire(g, w, h, R) { cliffScene(g, w, h, R, true); },
    dawn(g, w, h, R) {
      vgrad(g, w, h, ['#2c3a48', '#7d8f98', '#d7c2a0'], 0, h * 0.45);
      glow(g, w * 0.7, h * 0.42, h * 0.3, 'rgba(255,220,170,0.5)');
      ridge(g, w, h * 0.4, h * 0.06, '#47525a', R);
      g.fillStyle = '#2b3530';
      g.fillRect(0, h * 0.44, w, h);
      for (let i = 0; i < 16; i++) {
        g.strokeStyle = `rgba(${90 + i * 2},${110 + i * 2},90,0.55)`;
        g.lineWidth = 3;
        g.beginPath();
        const y = h * 0.46 + i * h * 0.03;
        g.moveTo(-10, y + 10);
        g.quadraticCurveTo(w * 0.5, y - 14 + (i % 3) * 4, w + 10, y + 6);
        g.stroke();
      }
      for (let i = 0; i < 8; i++) house(g, w * (0.55 + i * 0.05), h * 0.445, w * 0.04, h * 0.02, '#3a4245', null);
      fog(g, w, h * 0.44, h * 0.04, 0.35);
    },
    town(g, w, h, R) {
      vgrad(g, w, h, ['#3a4650', '#8a9196', '#b9ad98'], 0, h * 0.5);
      ridge(g, w, h * 0.34, h * 0.08, '#4c565c', R);
      for (let i = 0; i < 7; i++) house(g, i * w * 0.15 - 10, h * 0.5, w * 0.13, h * 0.12, '#262a2c', R() < 0.3 ? 'rgba(255,220,160,0.7)' : null);
      g.fillStyle = '#1b1d1e';
      g.fillRect(0, h * 0.5, w, h);
      const bx = w * 0.3, by = h * 0.43, bw = w * 0.42, bh = h * 0.1;
      g.fillStyle = '#5d6b62';
      g.fillRect(bx, by, bw, bh);
      g.fillStyle = '#c8d0c6';
      for (let i = 0; i < 6; i++) g.fillRect(bx + 8 + i * (bw - 16) / 6, by + bh * 0.15, (bw - 16) / 6 - 4, bh * 0.35);
      g.fillStyle = '#0d0f0f';
      g.beginPath();
      g.arc(bx + bw * 0.2, by + bh, bh * 0.22, 0, Math.PI * 2);
      g.arc(bx + bw * 0.8, by + bh, bh * 0.22, 0, Math.PI * 2);
      g.fill();
      glow(g, bx + bw, by + bh * 0.7, 40, 'rgba(255,230,170,0.8)');
      g.fillStyle = '#d9d2bf';
      g.fillRect(w * 0.82, h * 0.33, 4, h * 0.17);
      g.fillRect(w * 0.79, h * 0.33, w * 0.08, h * 0.035);
    },
  };
  function cliffScene(g, w, h, R, burning) {
    vgrad(g, w, h, ['#1e2a35', '#4b5a66', '#7d817d', '#2a3034', '#101315'], 0, h);
    g.fillStyle = '#121618';
    g.beginPath();
    g.moveTo(w * 0.55, 0);
    for (let y = 0; y <= h; y += 20) g.lineTo(w * (0.5 + R() * 0.06), y);
    g.lineTo(w, h);
    g.lineTo(w, 0);
    g.closePath();
    g.fill();
    fog(g, w, h * 0.7, h * 0.18, 0.4);
    const y0 = h * 0.36;
    g.strokeStyle = '#3b2e22';
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(-10, y0 + 30);
    g.lineTo(w * 0.56, y0);
    g.stroke();
    g.lineWidth = 1.5;
    g.strokeStyle = '#6b5a45';
    g.beginPath();
    g.moveTo(-10, y0 + 6);
    g.quadraticCurveTo(w * 0.25, y0 + 2, w * 0.56, y0 - 24);
    g.stroke();
    for (let i = 0; i < 9; i++) {
      const x = i * w * 0.065;
      g.fillStyle = '#2a2018';
      g.fillRect(x, y0 + 30 - (x / (w * 0.56)) * 30, 3, 22);
    }
    if (burning) flames(g, w * 0.12, y0 + 26, w * 0.24, h * 0.16, R);
    else for (let i = 0; i < 6; i++) glow(g, w * (0.02 + i * 0.03), y0 + 20 - i * 2, 20, 'rgba(255,140,50,0.55)');
  }

  const TONE = { fire: 'rgba(255,120,40,0.35)', cliffFire: 'rgba(255,120,40,0.3)', alarm: 'rgba(180,40,30,0.3)', dawn: 'rgba(255,220,170,0.25)', town: 'rgba(255,220,170,0.25)', shrine: 'rgba(200,120,60,0.3)', masks: 'rgba(200,140,80,0.3)' };

  function paint(cv, key) {
    if (!cv) return;
    const w = window.innerWidth, h = Math.max(window.innerHeight, 480);
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = rng(hash(key));
    // 文字那一页会盖住屏幕下半截，所以场景只画在上面六成，下面渐暗收进纸里
    const sh = Math.round(h * 0.6);
    g.fillStyle = '#0b0a09';
    g.fillRect(0, 0, w, h);
    g.save();
    g.beginPath();
    g.rect(0, 0, w, sh);
    g.clip();
    (S[key] || S.village)(g, w, sh, R);
    g.restore();
    const fade = g.createLinearGradient(0, sh * 0.8, 0, sh);
    fade.addColorStop(0, 'rgba(11,10,9,0)');
    fade.addColorStop(1, 'rgba(11,10,9,1)');
    g.fillStyle = fade;
    g.fillRect(0, sh * 0.8, w, sh * 0.2);
    // 褪色、偏色
    g.globalCompositeOperation = 'saturation';
    g.globalAlpha = 0.6;
    g.fillStyle = 'hsl(0,0%,50%)';
    g.fillRect(0, 0, w, h);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'soft-light';
    g.fillStyle = TONE[key] || 'rgba(120,140,150,0.25)';
    g.fillRect(0, 0, w, h);
    // 颗粒
    g.globalCompositeOperation = 'overlay';
    g.fillStyle = g.createPattern(grain(), 'repeat');
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
    // 划痕和灰点
    for (let i = 0; i < 5; i++) {
      g.fillStyle = `rgba(230,225,210,${0.04 + R() * 0.08})`;
      g.fillRect(R() * w, 0, 1, h * (0.3 + R() * 0.7));
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(230,225,210,${R() * 0.25})`;
      g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2);
    }
    // 暗角
    const v = g.createRadialGradient(w / 2, h * 0.35, Math.min(w, h) * 0.2, w / 2, h * 0.45, Math.max(w, h) * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.85)');
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
  }
  return { paint };
})();
