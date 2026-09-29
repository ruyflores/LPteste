/* =========================================================
   Glass Headline Hero (21st.dev), portado de React para JS puro.

   O título é um <h1> de verdade: cada palavra é um <span class="ghr-word">
   que o navegador posiciona com a fonte da página. O WebGL só "pinta" o
   vidro por cima, exatamente onde cada palavra ficou. Google, IAs, leitores
   de tela e seleção de texto continuam lendo texto comum.

   Marcação esperada:
   <section class="ghr-root" data-colors="#050505,#e10600,...">
     <canvas class="ghr-canvas" aria-hidden="true"></canvas>
     <div class="ghr-content"> ... <h1 class="ghr-title"><span class="ghr-word">...</span> ...</h1> ... </div>
   </section>

   Sem WebGL2, ou em renderizador por software (celular fraco, robôs de
   teste), o título aparece sólido sobre o degradê em CSS.
   Para forçar o efeito em testes: ?glass=force
   ========================================================= */
(function () {
  const DEFAULT_COLORS = ['#0D0A14', '#FF5A1F', '#FF9EC1', '#2F4CFF', '#FFE6B8'];

  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
    if (!m) return null;
    const v = parseInt(m[1], 16);
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
  }
  const paletteOf = (colors) => DEFAULT_COLORS.map((fb, i) => hexToRgb((colors || [])[i] || '') || hexToRgb(fb));
  const bevelPx = (fontPx, scale) => Math.max(2, fontPx * 0.075 * scale);
  const formed = (t, ms) => { const x = Math.min(Math.max(t / ms, 0), 1); return 1 - Math.pow(1 - x, 3); };
  const follow = (from, to, dt, rate) => to + (from - to) * Math.exp(-rate * dt);
  const orbit = (t) => [0.5 + 0.32 * Math.sin(t * 0.37), 0.56 + 0.16 * Math.sin(t * 0.53 + 1.1)];

  const FORM_MS = 1100;
  const DOME = 3;
  const IDLE_S = 2.5;
  const SLOW_FRAME_S = 0.05;
  const SLOW_FRAMES = 8;
  const CRAWL_FRAME_S = 0.15;

  const VERT = `#version 300 es
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
  const HEAD = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
`;

  const FIELD = HEAD + `uniform float u_time;
uniform float u_aspect;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;
uniform float u_octaves;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 turn = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    if (float(i) >= u_octaves) break;
    v += a * noise(p);
    p = turn * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vec2(vUv.x * u_aspect, vUv.y) * 1.2;
  float t = u_time * 0.06;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p + 3.5 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm(p + 3.0 * r);

  vec3 col = u_c0;
  col = mix(col, u_c3, smoothstep(0.25, 0.72, q.x) * 0.9);
  col = mix(col, u_c1, smoothstep(0.34, 0.74, f));
  col = mix(col, u_c2, smoothstep(0.42, 0.8, r.y) * 0.8);
  col = mix(col, u_c4, smoothstep(0.55, 0.9, f * r.x * 1.8) * 0.7);

  float bands = 0.5 + 0.5 * sin((f * 7.0 + r.x * 3.0) * 3.14159);
  col *= mix(0.86, 1.1, smoothstep(0.2, 0.8, bands));

  vec2 g = (vUv - vec2(0.5, 0.56)) / vec2(0.5, 0.2);
  col += u_c4 * 0.07 * exp(-dot(g, g));

  col *= mix(0.42, 1.0, smoothstep(0.02, 0.62, vUv.y));
  vec2 s = (vUv - vec2(0.5, 0.33)) / vec2(0.32, 0.13);
  col *= 1.0 - 0.4 * exp(-dot(s, s));
  o = vec4(col, 1.0);
}`;

  const BLUR = HEAD + `uniform sampler2D u_src;
uniform vec2 u_step;
uniform float u_radius;
uniform float u_read;
uniform float u_write;
float pick(vec4 t) {
  return u_read < 0.5 ? smoothstep(0.06, 1.0, t.r) : u_read < 1.5 ? t.r : t.b;
}
void main() {
  float sigma = max(u_radius * 0.5, 0.5);
  float sum = 0.0;
  float weights = 0.0;
  for (int i = -24; i <= 24; i++) {
    float x = float(i) * u_radius / 24.0;
    float w = exp(-0.5 * x * x / (sigma * sigma));
    sum += pick(texture(u_src, vUv + u_step * x)) * w;
    weights += w;
  }
  vec4 here = texture(u_src, vUv);
  float blurred = sum / weights;
  o = vec4(u_write < 0.5 ? blurred : here.r, here.g, u_write < 0.5 ? here.b : blurred, 1.0);
}`;

  const GLASS = HEAD + `uniform sampler2D u_field;
uniform sampler2D u_height;
uniform vec2 u_htexel;
uniform float u_bevel;
uniform float u_aspect;
uniform vec2 u_light;
uniform float u_glass;
uniform float u_form;
uniform vec2 u_res;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float bevel(vec2 p) {
  vec4 t = texture(u_height, p);
  float x = clamp((t.r - 0.5) * 2.0, 0.0, 1.0);
  float edge = sqrt(1.0 - (1.0 - x) * (1.0 - x));
  float dome = clamp((t.b - 0.5) * 2.0, 0.0, 1.0);
  return edge * 0.8 + dome * 0.45;
}

void main() {
  vec2 uv = vUv;
  vec2 hv = texture(u_height, uv).rg;
  float inside = smoothstep(0.08, 0.92, hv.g) * u_glass * u_form;

  vec2 dx = vec2(u_htexel.x * 2.0, 0.0);
  vec2 dy = vec2(0.0, u_htexel.y * 2.0);
  float tl = bevel(uv - dx + dy);
  float tc = bevel(uv + dy);
  float tr = bevel(uv + dx + dy);
  float ml = bevel(uv - dx);
  float mr = bevel(uv + dx);
  float bl = bevel(uv - dx - dy);
  float bc = bevel(uv - dy);
  float br = bevel(uv + dx - dy);
  vec2 grad = vec2((tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl), (tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br)) / 16.0 * u_bevel;
  vec3 n = normalize(vec3(-grad * 0.9, 1.0));

  vec2 toLight = (u_light - uv) * vec2(u_aspect, 1.0);
  vec3 L = normalize(vec3(toLight, 0.45));
  vec3 halfway = normalize(L + vec3(0.0, 0.0, 1.0));
  float facing = max(dot(n, halfway), 0.0);
  float pin = pow(facing, 160.0);
  float sheen = pow(facing, 24.0);
  float rim = pow(1.0 - n.z, 2.0);
  float studio = smoothstep(-0.7, 0.7, n.y);

  vec2 bend = -n.xy * 0.05 * u_form * vec2(1.0 / u_aspect, 1.0);
  vec3 through = vec3(
    texture(u_field, uv + bend * 0.84).r,
    texture(u_field, uv + bend).g,
    texture(u_field, uv + bend * 1.18).b);
  vec2 ld = normalize(toLight + 1e-5);
  float gather = rim * max(dot(normalize(n.xy + 1e-5), -ld), 0.0);
  vec3 glass = through * 0.86 + 0.06
    + rim * mix(0.28, 0.72, studio)
    + sheen * 0.16 + pin * 1.3
    + gather * vec3(1.0, 0.93, 0.82) * 0.55;
  float lip = smoothstep(0.42, 0.5, hv.r) * (1.0 - smoothstep(0.5, 0.6, hv.r));
  glass *= 1.0 - 0.28 * lip;

  vec2 away = normalize(toLight + 1e-5) * vec2(1.0 / u_aspect, 1.0);
  float shade = texture(u_height, uv + away * 0.012).r;
  vec3 bg = texture(u_field, uv).rgb;
  bg *= 1.0 - 0.32 * smoothstep(0.1, 0.7, shade) * u_glass;

  vec3 col = mix(bg, glass, inside);
  col += (hash(floor(uv * u_res)) - 0.5) * 0.018;
  o = vec4(col, 1.0);
}`;

  // Renderizadores por software não aguentam o efeito (a própria versão
  // original avisa que eles travam a página). Nesses casos, fica o fallback.
  function isSoftwareRenderer(gl) {
    let name = '';
    try {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      name = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    } catch (e) { /* sem informação: segue */ }
    return /swiftshader|llvmpipe|software|basic render/i.test(String(name));
  }

  function mount(root) {
    const canvas = root.querySelector('.ghr-canvas');
    const titleEl = root.querySelector('.ghr-title');
    if (!canvas || !titleEl) return;

    const palette = paletteOf((root.dataset.colors || '').split(','));
    const force = /[?&]glass=force/.test(location.search);
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl) return;
    if (!force && isSoftwareRenderer(gl)) return;
    const floatTargets = !!gl.getExtension('EXT_color_buffer_float');

    let disposed = false;
    let raf = 0;
    let last = 0;
    let time = 0;
    let inView = true;
    let lite = false;
    let judged = 0;
    let slow = 0;
    const light = { x: 0.5, y: 0.56 };
    const pointer = { x: 0.5, y: 0.56, at: -1e9 };
    let readyAt = -1;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
      return s;
    };
    const program = (frag) => {
      const prog = gl.createProgram();
      const v = shader(gl.VERTEX_SHADER, VERT);
      const f = shader(gl.FRAGMENT_SHADER, frag);
      gl.attachShader(prog, v);
      gl.attachShader(prog, f);
      gl.bindAttribLocation(prog, 0, 'a_position');
      gl.linkProgram(prog);
      gl.deleteShader(v);
      gl.deleteShader(f);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(prog));
      const u = {};
      const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl.getActiveUniform(prog, i);
        if (info) u[info.name.replace(/^u_/, '')] = gl.getUniformLocation(prog, info.name);
      }
      return { prog, u };
    };

    const makeTarget = (w, h, precise) => {
      const tex = gl.createTexture();
      const fbo = gl.createFramebuffer();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (precise && floatTargets) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fbo, w, h };
    };
    const dropTarget = (t) => { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo); } };

    let P;
    let field = null;
    let blurA = null;
    let blurB = null;
    let maskTex = null;
    let bevel = 4;

    const run = (p, dst, u) => {
      gl.useProgram(p.prog);
      let unit = 0;
      for (const k in u) {
        const loc = p.u[k];
        if (!loc) continue;
        const v = u[k];
        if (typeof v === 'number') gl.uniform1f(loc, v);
        else if (Array.isArray(v)) {
          if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
          else gl.uniform3f(loc, v[0], v[1], v[2]);
        } else {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, v);
          gl.uniform1i(loc, unit++);
        }
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fbo : null);
      gl.viewport(0, 0, dst ? dst.w : canvas.width, dst ? dst.h : canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Máscara do título: branco sobre preto, exatamente onde o navegador pôs
    // cada palavra; depois vira mapa de relevo na GPU. Só é refeita quando
    // o layout muda de fato.
    let built = '';
    const buildMask = () => {
      if (!field) return;
      const box = root.getBoundingClientRect();
      const scale = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(box.width * scale));
      const h = Math.max(1, Math.round(box.height * scale));
      const spans = [...titleEl.querySelectorAll('.ghr-word')];
      const rects = spans.map((s) => s.getBoundingClientRect());
      const cs = getComputedStyle(titleEl);
      const upper = cs.textTransform === 'uppercase';
      const layout = [w, h, scale, cs.font, cs.letterSpacing]
        .concat(spans.map((s, i) => s.textContent + '@' + Math.round(rects[i].left - box.left) + ',' + Math.round(rects[i].top - box.top)))
        .join('|');
      if (layout === built) return;
      built = layout;

      const cnv = document.createElement('canvas');
      cnv.width = w;
      cnv.height = h;
      const c = cnv.getContext('2d');
      c.fillStyle = '#000';
      c.fillRect(0, 0, w, h);
      const fontPx = parseFloat(cs.fontSize) || 64;
      c.setTransform(scale, 0, 0, scale, 0, 0);
      c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      if ('letterSpacing' in c) c.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      c.fillStyle = '#fff';
      c.textBaseline = 'alphabetic';
      spans.forEach((span, i) => {
        const raw = span.textContent || '';
        const text = upper ? raw.toLocaleUpperCase('pt-BR') : raw;
        const ascent = c.measureText(text).fontBoundingBoxAscent || fontPx * 0.8;
        c.fillText(text, rects[i].left - box.left, rects[i].top - box.top + ascent);
      });
      if (!maskTex) maskTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cnv);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      if (!blurA || blurA.w !== w || blurA.h !== h) {
        dropTarget(blurA);
        dropTarget(blurB);
        blurA = makeTarget(w, h, true);
        blurB = makeTarget(w, h, true);
      }
      bevel = bevelPx(fontPx, scale);
      run(P.blur, blurA, { src: maskTex, step: [1 / w, 0], radius: bevel, read: 0, write: 0 });
      run(P.blur, blurB, { src: blurA.tex, step: [0, 1 / h], radius: bevel, read: 1, write: 0 });
      run(P.blur, blurA, { src: blurB.tex, step: [1 / w, 0], radius: bevel * DOME, read: 1, write: 1 });
      run(P.blur, blurB, { src: blurA.tex, step: [0, 1 / h], radius: bevel * DOME, read: 2, write: 1 });
    };

    const size = () => {
      const dpr = lite ? 0.65 : Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const fs = lite ? 0.25 : 0.4;
      const fw = Math.max(1, Math.round(w * fs));
      const fh = Math.max(1, Math.round(h * fs));
      if (!field || field.w !== fw || field.h !== fh) {
        dropTarget(field);
        field = makeTarget(fw, fh, false);
      }
      buildMask();
    };

    const draw = () => {
      if (!field || !blurB) return;
      const aspect = canvas.width / canvas.height;
      run(P.field, field, { time, aspect, octaves: lite ? 3 : 5, c0: palette[0], c1: palette[1], c2: palette[2], c3: palette[3], c4: palette[4] });
      run(P.glass, null, {
        field: field.tex,
        height: blurB.tex,
        htexel: [1 / blurB.w, 1 / blurB.h],
        bevel,
        aspect,
        light: [light.x, light.y],
        glass: 1,
        form: reduceMq.matches || readyAt < 0 ? 1 : formed(performance.now() - readyAt, FORM_MS),
        res: [canvas.width, canvas.height],
      });
    };

    const animating = () => inView && !document.hidden && !reduceMq.matches;
    const frame = (now) => {
      raf = 0;
      if (disposed) return;
      const raw = (now - last) / 1000;
      last = now;
      const dt = Math.min(raw, 0.1);
      // vigia de desempenho: aparelho lento passa para o modo leve
      if (!lite && judged < 40 && animating()) {
        judged += 1;
        if (judged > 3 && raw > SLOW_FRAME_S) slow += raw > CRAWL_FRAME_S ? 3 : 1;
        if (slow >= SLOW_FRAMES) { lite = true; size(); }
      }
      if (animating()) time += dt;
      const idle = (now - pointer.at) / 1000 > IDLE_S;
      const [tx, ty] = idle && animating() ? orbit(time) : [pointer.x, pointer.y];
      light.x = follow(light.x, tx, dt, idle ? 1.2 : 7);
      light.y = follow(light.y, ty, dt, idle ? 1.2 : 7);
      draw();
      const catching = Math.abs(light.x - tx) + Math.abs(light.y - ty) > 0.0015;
      const visible = inView && !document.hidden;
      const forming = readyAt >= 0 && performance.now() - readyAt < FORM_MS;
      if (visible && (animating() || catching || forming)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const rebuild = () => { if (!disposed) { buildMask(); kick(); } };

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      disposed = true;
      root.dataset.glass = 'false';
    });

    try {
      P = { field: program(FIELD), blur: program(BLUR), glass: program(GLASS) };
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      size();
    } catch (e) {
      return;
    }
    root.dataset.glass = 'true';
    readyAt = performance.now();
    kick();

    let pending = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => { if (!disposed) { size(); kick(); } });
    }).observe(root);
    if (document.fonts) document.fonts.ready.then(rebuild);
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) kick(); }).observe(root);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
    if (reduceMq.addEventListener) reduceMq.addEventListener('change', kick);

    root.addEventListener('pointermove', (e) => {
      const r = root.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = 1 - (e.clientY - r.top) / r.height;
      pointer.at = performance.now();
      kick();
    });
  }

  // Liga o efeito só depois que a página carregou e o navegador ficou livre:
  // o título já está na tela como texto, o vidro chega por cima.
  function start() {
    const go = () => document.querySelectorAll('.ghr-root').forEach(mount);
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1500 });
    else setTimeout(go, 300);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
