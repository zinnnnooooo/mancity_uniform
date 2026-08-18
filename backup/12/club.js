/* ==========================================================================
   club.html 전용 JS (club.js)
   - 상단 뒤로가기 버튼 동작
   - 하단 CTA 버튼 클릭 시 uni_list.html로 이동
   - Heritage SVG 타임라인 (S커브 + Glow Point)
   ========================================================================== */

/* ──────────────────────────────────────────────
   Heritage 타임라인 SVG 렌더링
   - 각 연도 span의 실제 DOM 위치를 측정해 Glow Point Y를 연도 중앙에 정렬
   - S자 베지어 켡선으로 모든 포인트 연결
   ────────────────────────────────────────────── */
function drawHeritageSVG() {
  var svgEl = document.getElementById('ht-svg-timeline');
  var wrapEl = document.getElementById('ht-wrap');
  if (!svgEl || !wrapEl) return;

  var years = ['1880', '1937', '1968', '2012', '2023'];
  var wrapRect = wrapEl.getBoundingClientRect();
  var wrapScrollTop = wrapEl.scrollTop || 0;
  var totalH = wrapEl.offsetHeight;

  // 각 연도 span의 실제 Y 중앙값 측정
  var points = [];
  var containerW = wrapEl.offsetWidth;
  var centerX = containerW / 2;

  years.forEach(function(yr) {
    var el = document.getElementById('ht-year-' + yr);
    if (!el) return;
    var rect = el.getBoundingClientRect();
    // wrap 기준 상대 Y 값 (연도 텍스트의 실제 세로 중앙)
    var relTop = rect.top - wrapRect.top;
    var midY = relTop + rect.height / 2;
    points.push({ yr: yr, cx: centerX, cy: midY });
  });

  if (points.length < 2) return;

  // SVG 높이 설정 (맨 아래 포인트에서 20px 여유)
  var svgH = points[points.length - 1].cy + 20;
  svgEl.setAttribute('height', svgH);
  svgEl.style.height = svgH + 'px';

  // 포인트 간 X를 S커브로 휘어지도로 설정
  // 1880 → 중앙, 1937 → 우측, 1968 → 중앙, 2012 → 왼쪽, 2023 → 중앙
  var sway = containerW * 0.18; // 좌우 휘어지는 양
  var xOffsets = [0, sway, 0, -sway, 0];
  points.forEach(function(p, i) {
    p.cx = centerX + xOffsets[i];
  });

  // SVG 내용 초기화
  svgEl.innerHTML = '';

  // 정의에서 filter (glow) 설정
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML =
    '<filter id="ht-glow-line" x="-200%" y="-200%" width="500%" height="500%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    '</filter>' +
    '<filter id="ht-glow-dot" x="-300%" y="-300%" width="700%" height="700%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>' +
      '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    '</filter>';
  svgEl.appendChild(defs);

  // ---- S커브 path 생성 ----
  // 연속된 포인트를 자연스러운 브리지 켡선으로 연결
  function makeSCurve(pts) {
    if (pts.length < 2) return '';
    var d = 'M ' + pts[0].cx + ' ' + pts[0].cy;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i];
      var p1 = pts[i + 1];
      var dy = p1.cy - p0.cy;
      // 수직 방향으로만 제어점 설정 (자연스러운 S커브)
      var cp1x = p0.cx;
      var cp1y = p0.cy + dy * 0.45;
      var cp2x = p1.cx;
      var cp2y = p1.cy - dy * 0.45;
      d += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + p1.cx + ' ' + p1.cy;
    }
    return d;
  }

  var pathD = makeSCurve(points);

  // 외경 glow (넓게 퍼지는 빛)
  var pathGlow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathGlow.setAttribute('d', pathD);
  pathGlow.setAttribute('fill', 'none');
  pathGlow.setAttribute('stroke', 'rgba(108,171,221,0.25)');
  pathGlow.setAttribute('stroke-width', '18');
  pathGlow.setAttribute('stroke-linecap', 'round');
  svgEl.appendChild(pathGlow);

  // 중간 glow
  var pathMid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathMid.setAttribute('d', pathD);
  pathMid.setAttribute('fill', 'none');
  pathMid.setAttribute('stroke', 'rgba(108,171,221,0.55)');
  pathMid.setAttribute('stroke-width', '6');
  pathMid.setAttribute('stroke-linecap', 'round');
  svgEl.appendChild(pathMid);

  // 코어 Sky Blue 선
  var pathCore = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathCore.setAttribute('d', pathD);
  pathCore.setAttribute('fill', 'none');
  pathCore.setAttribute('stroke', '#6CABDD');
  pathCore.setAttribute('stroke-width', '2');
  pathCore.setAttribute('stroke-linecap', 'round');
  svgEl.appendChild(pathCore);

  // ---- Glow Point 생성 ----
  points.forEach(function(p) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // 외경 glow halo
    var halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    halo.setAttribute('cx', p.cx);
    halo.setAttribute('cy', p.cy);
    halo.setAttribute('r', '14');
    halo.setAttribute('fill', 'rgba(108,171,221,0.20)');
    g.appendChild(halo);

    // 중간 glow ring
    var ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', p.cx);
    ring.setAttribute('cy', p.cy);
    ring.setAttribute('r', '7');
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', '#6CABDD');
    ring.setAttribute('stroke-width', '2.5');
    ring.setAttribute('opacity', '0.85');
    g.appendChild(ring);

    // 코어 흰색 원
    var core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    core.setAttribute('cx', p.cx);
    core.setAttribute('cy', p.cy);
    core.setAttribute('r', '4');
    core.setAttribute('fill', '#ffffff');
    g.appendChild(core);

    svgEl.appendChild(g);
  });
}

function initClubPage() {
  var backBtn = document.getElementById("backBtn");
  if (backBtn) {
    if (!backBtn.dataset.bound) {
      backBtn.dataset.bound = 'true';
      backBtn.addEventListener("click", function () {
        if (typeof goBack === 'function') {
          goBack('index.html');
        } else {
          window.history.back();
        }
      });
    }
  }

  var ctaBtn = document.getElementById("ctaBtn");
  if (ctaBtn) {
    if (!ctaBtn.dataset.bound) {
      ctaBtn.dataset.bound = 'true';
      ctaBtn.addEventListener("click", function () {
        if (typeof navigateTo === 'function') {
          navigateTo("uni_list.html");
        } else {
          window.location.href = "uni_list.html";
        }
      });
    }
  }

  // SVG 타임라인 렌더링 (이미지 로드 후 실제 위치 측정을 위해 약간 도이 후 실행)
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      drawHeritageSVG();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Only auto-run if we are loaded directly on club.html
  if (window.location.pathname.endsWith('club.html')) {
    initClubPage();
  }
});
