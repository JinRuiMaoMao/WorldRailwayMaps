/**
 * 离线快导：WebCodecs + mp4-muxer 流式写盘，避免整片囤在内存把 C 盘/页面文件撑爆。
 */
import { Muxer, StreamTarget, FileSystemWritableFileStreamTarget } from 'mp4-muxer';

export const EXPORT_PRESETS = {
  '1080p': { id: '1080p', width: 1920, height: 1080, label: '1080p' },
  '720p': { id: '720p', width: 1280, height: 720, label: '720p' },
};

export function canExportVideo() {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

export function resolveExportPreset(id) {
  return EXPORT_PRESETS[id] || EXPORT_PRESETS['1080p'];
}

export function applyExportViewport(width, height) {
  const demo = document.getElementById('demo');
  if (!demo) return;
  const w = Math.max(640, width | 0);
  const h = Math.max(360, height | 0);
  demo.style.setProperty('--export-w', `${w}px`);
  demo.style.setProperty('--export-h', `${h}px`);
  const fit = Math.min(
    Math.max(120, window.innerWidth - 12) / w,
    Math.max(120, window.innerHeight - 12) / h,
    1
  );
  demo.style.setProperty('--export-fit', `scale(${fit})`);
}

export function clearExportViewport() {
  const demo = document.getElementById('demo');
  if (!demo) return;
  demo.style.removeProperty('--export-w');
  demo.style.removeProperty('--export-h');
  demo.style.removeProperty('--export-fit');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function blitPane(rootEl, selector, ctx, rootRect, sx, sy) {
  rootEl.querySelectorAll(selector).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (r.right < rootRect.left || r.left > rootRect.right || r.bottom < rootRect.top || r.top > rootRect.bottom) return;
    if (el.tagName === 'IMG' && (!el.complete || !el.naturalWidth)) return;
    if (el.tagName === 'CANVAS' && (!el.width || !el.height)) return;
    try {
      ctx.drawImage(
        el,
        (r.left - rootRect.left) * sx,
        (r.top - rootRect.top) * sy,
        r.width * sx,
        r.height * sy
      );
    } catch {
      /* tainted */
    }
  });
}

function isPainted(el) {
  if (!el || el.hidden) return false;
  if (el.id === 'toast' && !el.classList.contains('show')) return false;
  if (el.id === 'city-lines' && !el.classList.contains('in')) return false;
  const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false;
  return true;
}

const HUD_FONT = '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif';

function hudPos(el, rootRect, sx, sy) {
  const r = el.getBoundingClientRect();
  return {
    x: (r.left - rootRect.left) * sx,
    y: (r.top - rootRect.top) * sy,
    w: r.width * sx,
    h: r.height * sy,
  };
}

function paintToastHud(ctx, width, s, hud) {
  const label = hud?.title?.trim();
  if (!label) return;
  ctx.font = `500 ${Math.round(17 * s)}px ${HUD_FONT}`;
  const tw = ctx.measureText(label).width;
  const h = 36 * s;
  const x = 22 * s;
  const y = 18 * s;
  const w = tw + 46 * s;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = hud.color || '#888';
  ctx.arc(x + 16 * s, y + h / 2, 5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 28 * s, y + h / 2);
}

function paintYearHud(ctx, width, height, s, hud) {
  if (!hud) return;
  const place = hud.place || '';
  const km = hud.km || '';
  const year = hud.year || '';
  const date = hud.date || '';
  const x = 22 * s;
  const gapPlace = place ? 22 * s : 0;
  const gapKm = km ? 52 * s : 0;
  const gapYear = year ? 90 * s : 0;
  const gapDate = date ? 32 * s : 0;
  let y = height - 36 * s - gapPlace - gapKm - gapYear - gapDate;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (place) {
    ctx.font = `600 ${Math.round(16 * s)}px ${HUD_FONT}`;
    ctx.fillStyle = '#5a5a5a';
    ctx.fillText(place, x, y);
    y += gapPlace;
  }
  if (km) {
    ctx.font = `700 ${Math.round(40 * s)}px ${HUD_FONT}`;
    ctx.fillStyle = '#3a3a3a';
    ctx.fillText(km, x, y);
    const kw = ctx.measureText(km).width;
    ctx.font = `400 ${Math.round(14 * s)}px ${HUD_FONT}`;
    ctx.fillStyle = '#6a6a6a';
    ctx.fillText('kilometre', x + kw + 10 * s, y + 20 * s);
    y += gapKm;
  }
  if (year) {
    ctx.font = `700 ${Math.round(86 * s)}px ${HUD_FONT}`;
    ctx.fillStyle = '#2f2f2f';
    ctx.fillText(year, x, y);
    const yw = ctx.measureText(year).width;
    ctx.font = `600 ${Math.round(28 * s)}px ${HUD_FONT}`;
    ctx.fillStyle = '#444';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('年', x + yw + 10 * s, y + 70 * s);
    ctx.textBaseline = 'top';
    y += gapYear;
  }
  if (date) {
    ctx.font = `600 ${Math.round(24 * s)}px ${HUD_FONT}`;
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText(date, x, y);
  }
}

function paintMapLabels(rootEl, ctx, rootRect, sx, sy) {
  const s = Math.min(sx, sy);
  const named = new Set();

  rootEl.querySelectorAll('.st-label').forEach((el) => {
    const r = el.getBoundingClientRect();
    const x = (r.left - rootRect.left) * sx;
    const y = (r.top - rootRect.top) * sy;
    const dot = el.querySelector('.st-dot');
    const nameEl = el.querySelector('.st-name');
    const name = nameEl?.textContent?.trim() || '';
    if (name) {
      if (named.has(name)) return;
      named.add(name);
    }
    const color = getComputedStyle(dot || el).getPropertyValue('--c').trim() || '#888';
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, 3.4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.2 * s;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    if (!name || !nameEl) return;
    const nr = nameEl.getBoundingClientRect();
    const nx = (nr.left - rootRect.left) * sx;
    const ny = (nr.top - rootRect.top) * sy;
    const nw = nr.width * sx;
    const nh = nr.height * sy;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(nx, ny, nw, nh);
    ctx.fillStyle = '#1a242c';
    ctx.font = `600 ${Math.round(11 * s)}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(name, nx + 5 * s, ny + nh / 2);
  });

  rootEl.querySelectorAll('.city-label').forEach((el) => {
    const r = el.getBoundingClientRect();
    const x = (r.left - rootRect.left) * sx;
    const y = (r.top - rootRect.top) * sy;
    ctx.beginPath();
    ctx.fillStyle = '#7ec8ff';
    ctx.arc(x, y, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    const span = el.querySelector('span');
    const name = span?.textContent?.trim();
    if (!name) return;
    ctx.font = `600 ${Math.round(12 * s)}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(name).width;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(x + 8 * s, y - 9 * s, tw + 10 * s, 16 * s);
    ctx.fillStyle = '#1a242c';
    ctx.fillText(name, x + 13 * s, y);
  });
}

function paintStage(rootEl, ctx, width, height) {
  const host = rootEl.querySelector('.leaflet-host') || rootEl.querySelector('.leaflet-container');
  ctx.fillStyle = host ? getComputedStyle(host).backgroundColor || '#d8e2ea' : '#d8e2ea';
  ctx.fillRect(0, 0, width, height);

  const rootRect = rootEl.getBoundingClientRect();
  const sx = width / Math.max(1, rootRect.width);
  const sy = height / Math.max(1, rootRect.height);

  blitPane(rootEl, '.leaflet-tile-pane img.leaflet-tile:not(.leaflet-tile-error)', ctx, rootRect, sx, sy);
  blitPane(rootEl, '.leaflet-overlay-pane canvas', ctx, rootRect, sx, sy);
  paintMapLabels(rootEl, ctx, rootRect, sx, sy);
  const s = Math.min(sx, sy);
  const hud = typeof rootEl._exportHud === 'function' ? rootEl._exportHud() : rootEl._exportHud;
  paintToastHud(ctx, width, s, hud);
  paintYearHud(ctx, width, height, s, hud);
}

function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function paintCityBadges(ctx, width, height, s) {
  const wrap = document.getElementById('city-lines');
  if (!wrap || wrap.hidden) return;
  const badges = [...wrap.querySelectorAll('.city-line-badge')];
  if (!badges.length) return;
  const h = 28 * s;
  const gap = 6 * s;
  const padX = 12 * s;
  ctx.font = `700 ${Math.round(11 * s)}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
  const widths = badges.map((b) => Math.max(24 * s, ctx.measureText(b.textContent.trim()).width + 14 * s));
  const total = widths.reduce((a, w) => a + w, 0) + gap * (badges.length - 1) + padX * 2;
  const x0 = (width - total) / 2;
  const y0 = height - 16 * s - h;
  roundRect(ctx, x0, y0, total, h, h / 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  let x = x0 + padX;
  ctx.textBaseline = 'middle';
  for (let i = 0; i < badges.length; i++) {
    const b = badges[i];
    const w = widths[i];
    const bh = 22 * s;
    const by = y0 + (h - bh) / 2;
    roundRect(ctx, x, by, w, bh, bh / 2);
    ctx.fillStyle = b.style.backgroundColor || '#888';
    ctx.fill();
    ctx.fillStyle = b.style.color || '#fff';
    ctx.fillText(b.textContent.trim(), x + w / 2 - ctx.measureText(b.textContent.trim()).width / 2, by + bh / 2);
    x += w + gap;
  }
}

function paintCityMinimap(ctx, width, s, boxEl, rootRect, sx, sy) {
  const box = boxEl || document.getElementById('city-minimap');
  const svg = document.getElementById('city-minimap-svg');
  if (!box || box.hidden || !svg) return;
  let mw = 120 * s;
  let mh = 92 * s;
  let mx = width - mw - 16 * s;
  let my = 16 * s;
  if (boxEl && rootRect) {
    const r = boxEl.getBoundingClientRect();
    mx = (r.left - rootRect.left) * sx;
    my = (r.top - rootRect.top) * sy;
    mw = r.width * sx;
    mh = r.height * sy;
  }
  roundRect(ctx, mx, my, mw, mh, 8 * s);
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.fill();
  const vb = (svg.getAttribute('viewBox') || '0 0 168 128').split(/\s+/).map(Number);
  const vw = vb[2] || 168;
  const vh = vb[3] || 128;
  const inset = 8 * s;
  const scale = Math.min((mw - inset * 2) / vw, (mh - inset * 2) / vh);
  const ox = mx + (mw - vw * scale) / 2;
  const oy = my + (mh - vh * scale) / 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2 * s;
  ctx.strokeStyle = '#888';
  for (const p of svg.querySelectorAll('path')) {
    const d = p.getAttribute('d') || '';
    ctx.beginPath();
    ctx.strokeStyle = p.getAttribute('stroke') || '#888';
    const cmds = d.match(/[ML][^ML]*/g) || [];
    for (const cmd of cmds) {
      const [x, y] = cmd
        .slice(1)
        .split(',')
        .map((n) => Number(n));
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const px = ox + x * scale;
      const py = oy + y * scale;
      if (cmd[0] === 'M') ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

async function openOpfsSink(suggestedName) {
  if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle('export-videos', { create: true });
    const name = String(suggestedName || `export-${Date.now()}.mp4`).replace(/[^\w.\-]+/g, '_');
    const file = await dir.getFileHandle(name, { create: true });
    const writable = await file.createWritable({ keepExistingData: false });
    return {
      mode: 'opfs',
      target: new FileSystemWritableFileStreamTarget(writable, { chunkSize: 8 * 1024 * 1024 }),
      async close() {
        await writable.close();
        const blob = await file.getFile();
        return { savedPath: null, blob };
      },
      abort: async () => {
        try {
          await writable.abort?.();
        } catch {
          try {
            await writable.close();
          } catch {
            /* ignore */
          }
        }
        try {
          await dir.removeEntry(name);
        } catch {
          /* ignore */
        }
      },
    };
  } catch (e) {
    console.warn('OPFS export sink failed', e);
    return null;
  }
}

async function openExportTarget(suggestedName) {
  const opfs = await openOpfsSink(suggestedName);
  if (opfs) return opfs;

  // 回退：按 position 写入，最后拼 Blob（muxer 会回写 moov，不能按到达顺序 concat）
  let buf = new Uint8Array(8 * 1024 * 1024);
  let size = 0;
  const ensure = (end) => {
    if (end <= buf.length) return;
    let next = buf.length;
    while (next < end) next *= 2;
    const grown = new Uint8Array(next);
    grown.set(buf);
    buf = grown;
  };
  return {
    mode: 'memory-chunks',
    target: new StreamTarget({
      chunked: true,
      chunkSize: 4 * 1024 * 1024,
      onData: (data, position) => {
        const pos = position | 0;
        const end = pos + data.byteLength;
        ensure(end);
        buf.set(data, pos);
        if (end > size) size = end;
      },
    }),
    async close() {
      const blob = new Blob([buf.subarray(0, size)], { type: 'video/mp4' });
      buf = new Uint8Array(0);
      size = 0;
      return { savedPath: null, blob };
    },
    abort: async () => {
      buf = new Uint8Array(0);
      size = 0;
    },
  };
}

function exportBitrate(width, height, fps) {
  const px = width * height;
  if (px >= 1920 * 1080) return fps >= 50 ? 20_000_000 : 12_000_000;
  if (px >= 1280 * 720) return fps >= 50 ? 10_000_000 : 6_000_000;
  return fps >= 50 ? 6_000_000 : 4_000_000;
}

async function pickAvcCodec(width, height, fps, bitrate) {
  const hi60 = fps >= 50;
  const codecs = hi60
    ? ['avc1.640032', 'avc1.64002A', 'avc1.4d002A', 'avc1.640028', 'avc1.4d0028', 'avc1.42001F']
    : ['avc1.640028', 'avc1.4d0028', 'avc1.42001F'];
  const hwModes = ['prefer-hardware', 'no-preference', 'prefer-software'];
  if (typeof VideoEncoder.isConfigSupported === 'function') {
    for (const hardwareAcceleration of hwModes) {
      for (const codec of codecs) {
        const probe = {
          codec,
          width,
          height,
          bitrate,
          framerate: fps,
          latencyMode: 'quality',
          avc: { format: 'avc' },
          hardwareAcceleration,
        };
        try {
          const { supported, config } = await VideoEncoder.isConfigSupported(probe);
          if (supported && config?.codec) {
            return {
              codec: config.codec,
              hardwareAcceleration: config.hardwareAcceleration || hardwareAcceleration,
            };
          }
        } catch {
          /* next */
        }
      }
    }
  }
  return { codec: codecs[0], hardwareAcceleration: 'prefer-hardware' };
}

/**
 * @param {{
 *   rootEl: HTMLElement,
 *   fps?: number,
 *   width?: number,
 *   height?: number,
 *   bitrate?: number,
 *   suggestedName?: string,
 *   beforePaint?: () => (void | Promise<void>),
 * }} opts
 */
export async function startOfflineExport(opts) {
  const {
    rootEl,
    fps = 30,
    suggestedName = `china-railway-${Date.now()}.mp4`,
    beforePaint,
  } = opts;
  if (!canExportVideo()) {
    throw new Error('当前浏览器不支持离线导出（需要 Chrome / Edge 的 WebCodecs）');
  }

  const sink = await openExportTarget(suggestedName);

  const presetW = Math.round(Number(opts.width) || 0) & ~1;
  const presetH = Math.round(Number(opts.height) || 0) & ~1;
  const width = presetW >= 640 ? presetW : 1920;
  const height = presetH >= 360 ? presetH : 1080;
  const bitrate = opts.bitrate || exportBitrate(width, height, fps);
  const picked = await pickAvcCodec(width, height, fps, bitrate);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

  const muxer = new Muxer({
    target: sink.target,
    video: {
      codec: 'avc',
      width,
      height,
      frameRate: fps,
    },
    // 常规 MP4（moov 在收尾写入）。fragmented 在部分播放器里 60fps 会一顿一顿
    fastStart: false,
  });

  let frameIndex = 0;
  let encoderError = null;
  let closed = false;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      encoderError = e;
      console.warn(e);
    },
  });

  const configure = (codec, extra = {}) => {
    encoder.configure({
      codec,
      width,
      height,
      bitrate,
      framerate: fps,
      latencyMode: 'quality',
      avc: { format: 'avc' },
      ...extra,
    });
  };

  try {
    configure(picked.codec, { hardwareAcceleration: picked.hardwareAcceleration });
  } catch {
    try {
      configure(picked.codec);
    } catch {
      configure('avc1.42001F', { bitrate: Math.min(bitrate, 6_000_000) });
    }
  }

  async function drainEncoder() {
    // 队列堆积会狂吃内存 → 页面文件打满 C 盘
    while (encoder.encodeQueueSize > 4) {
      await sleep(8);
      if (encoderError) throw encoderError;
    }
  }

  const frameDuration = Math.round(1_000_000 / fps);

  async function encodeFrame({ paint = true } = {}) {
    if (closed) return;
    if (encoderError) throw encoderError;
    await drainEncoder();
    if (paint) {
      if (beforePaint) await beforePaint();
      paintStage(rootEl, ctx, width, height);
    }
    const timestamp = Math.round((frameIndex * 1_000_000) / fps);
    const frame = new VideoFrame(canvas, {
      timestamp,
      duration: frameDuration,
      alpha: 'discard',
    });
    try {
      encoder.encode(frame, { keyFrame: frameIndex % (fps * 2) === 0 });
    } finally {
      frame.close();
    }
    frameIndex += 1;
    if (frameIndex % 8 === 0) await sleep(0);
  }

  /** 镜间停留：画面不变时只画一次，其余帧复用 */
  async function holdSeconds(durationSec) {
    const n = Math.max(1, Math.round(durationSec * fps));
    await encodeFrame({ paint: true });
    for (let i = 1; i < n; i++) await encodeFrame({ paint: false });
  }

  async function finish() {
    if (closed) return { blob: null, savedPath: null };
    closed = true;
    try {
      await encoder.flush();
      muxer.finalize();
    } finally {
      try {
        encoder.close();
      } catch {
        /* ignore */
      }
    }
    return sink.close();
  }

  async function abort() {
    if (closed) return;
    closed = true;
    try {
      encoder.close();
    } catch {
      /* ignore */
    }
    await sink.abort?.();
  }

  return {
    encodeFrame,
    holdSeconds,
    finish,
    abort,
    getFrameCount: () => frameIndex,
    fps,
    width,
    height,
    writeMode: sink.mode,
  };
}

export function downloadBlob(blob, filename) {
  if (!blob || blob.size <= 0) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/** 伸展总时长按全线长度估算（短线不少于约 3.2s，长线封顶 13s） */
export function growDurationSec(totalDistMeters, speed = 1) {
  return Math.min(13, Math.max(3.2, 2.6 + totalDistMeters / 2600)) / Math.max(speed, 0.35);
}

export function dwellSec(speed = 1) {
  return 1.1 / Math.max(speed, 0.35);
}
