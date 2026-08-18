/* ==========================================================================
   UNI:CITY — uni_list.js
   상품 카드 렌더링 + 시즌/유니폼 탭 필터 (더미 데이터 기반 최소 구현)
   ========================================================================== */

(function () {
  /* ---- 킷 컬러 프리셋 (플레이스홀더 이미지 대신 사용) --------------------- */
  const KIT = {
    home: { color: "#6cabdd", glow: "#264a68" },
    away: { color: "#e7c65b", glow: "#1b1c20" },
    third: { color: "#f4f4f4", glow: "#3a1f28" },
    keeper: { color: "#c8ff3d", glow: "#20242b" },
    special: { color: "#eef1f4", glow: "#242a33" },
    specialB: { color: "#8fb7e0", glow: "#1c2636" },
    cream: { color: "#e8dcc4", glow: "#2a2620" },
    retro: { color: "#e4d94f", glow: "#141414" },
    edition: { color: "#7fa8d6", glow: "#1a2536" },
  };

  const TYPE_LABEL = {
    home: "홈 레플리카 유니폼",
    away: "어웨이 레플리카 유니폼",
    third: "써드 레플리카 유니폼",
    keeper: "키퍼 홈 레플리카 유니폼",
    special: "스페셜 유니폼",
    edition: "에디션 유니폼",
  };

  /* ---- 26/27 시즌 신상품 (탭과 무관하게 항상 고정 노출) ------------------- */
  const NEW_ARRIVALS = [
    { type: "home", kit: "home", season: "26/27 season", name: "홈 레플리카 유니폼", price: 129000, badge: "BEST" },
    { type: "away", kit: "away", season: "26/27 season", name: "어웨이 레플리카 유니폼", price: 129000, badge: "NEW" },
    { type: "third", kit: "third", season: "26/27 season", name: "써드 레플리카 유니폼", price: 129000, badge: "NEW" },
    { type: "keeper", kit: "keeper", season: "26/27 season", name: "키퍼 레플리카 유니폼", price: 129000, badge: "NEW" },
  ];

  /* ---- 시즌별 상품 데이터 (더미) ------------------------------------------ */
  const SEASON_PRODUCTS = {
    "26/27": [
      { type: "home", kit: "home", price: 129000, badge: "BEST" },
      { type: "away", kit: "away", price: 129000, badge: "NEW" },
      { type: "third", kit: "third", price: 129000, badge: "NEW" },
      { type: "keeper", kit: "keeper", price: 129000, badge: "NEW" },
    ],
    "25/26": [
      { type: "home", kit: "home", price: 148000, badge: "BEST" },
      { type: "away", kit: "away", price: 109000, badge: null },
      { type: "third", kit: "third", price: 95000, badge: null },
      { type: "keeper", kit: "keeper", price: 64000, badge: null },
    ],
    "24/25": [
      { type: "home", kit: "home", price: 152000, badge: "BEST" },
      { type: "away", kit: "away", price: 112000, badge: null },
      { type: "third", kit: "third", price: 96000, badge: null },
      { type: "keeper", kit: "keeper", price: 65000, badge: null },
    ],
    "23/24": [
      { type: "home", kit: "home", price: 155000, badge: "BEST" },
      { type: "away", kit: "away", price: 115000, badge: "BEST" },
      { type: "third", kit: "third", price: 98000, badge: null },
      { type: "keeper", kit: "keeper", price: 67000, badge: null },
      { type: "special", kit: "special", name: "2024 스페셜 유니폼", price: 175000, badge: "NEW" },
      {
        type: "special",
        kit: "specialB",
        name: "스페셜 레플리카 유니폼",
        season: "26/27 season",
        price: 170000,
        badge: "NEW",
      },
    ],
  };

  /* ---- 인기 유니폼 (탭과 무관, 가로 스크롤) -------------------------------- */
  const POPULAR = [
    { type: "edition", kit: "cream", season: "24/25 season", name: "오아시스 콜라보 유니폼", price: 215000 },
    { type: "edition", kit: "retro", season: "98/99 season", name: "레트로 유니폼", price: 110000 },
    { type: "edition", kit: "edition", season: "21/22 season", name: "9320 스페셜 유니폼", price: 350000 },
  ];

  const SEASONS = ["26/27", "25/26", "24/25", "23/24"];
  const TYPES = [
    { key: "all", label: "전체" },
    { key: "home", label: "홈" },
    { key: "away", label: "어웨이" },
    { key: "third", label: "서드" },
    { key: "edition", label: "에디션" },
  ];

  /* ---- 렌더 헬퍼 ----------------------------------------------------------- */
  function formatPrice(price) {
    return "₩" + price.toLocaleString("ko-KR");
  }

  function productCardHTML(product) {
    const kit = KIT[product.kit] || KIT.home;
    const badgeHTML = product.badge
      ? `<span class="product-badge product-badge--${product.badge === "BEST" ? "best" : "new"}">${product.badge}</span>`
      : "";
    const name = product.name || TYPE_LABEL[product.type] || "유니폼";
    const season = product.season || "";

    return `
      <article class="product-card">
        <div class="product-media" style="--kit-color:${kit.color}; --kit-glow:${kit.glow};">
          ${badgeHTML}
          <svg class="product-jersey" viewBox="0 0 100 100"><use href="#icon-jersey" /></svg>
        </div>
        <p class="product-season">${season}</p>
        <p class="product-name">${name}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
      </article>
    `;
  }

  function renderGrid(el, products) {
    el.innerHTML = products.map(productCardHTML).join("");
  }

  /* ---- 탭 렌더 + 상태 ------------------------------------------------------- */
  let currentSeason = "23/24";
  let currentType = "all";

  function renderProductGrid() {
    const list = SEASON_PRODUCTS[currentSeason] || [];
    const filtered = currentType === "all" ? list : list.filter((p) => p.type === currentType);
    const withSeasonLabel = filtered.map((p) => ({
      ...p,
      season: p.season || currentSeason + " season",
    }));
    renderGrid(document.getElementById("productGrid"), withSeasonLabel);
  }

  function renderSeasonTabs() {
    const wrap = document.getElementById("seasonTabs");
    wrap.innerHTML = SEASONS.map(
      (s) =>
        `<button type="button" class="pill${s === currentSeason ? " is-active" : ""}" data-season="${s}" role="tab" aria-selected="${s === currentSeason}">${s}</button>`
    ).join("");

    wrap.querySelectorAll(".pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentSeason = btn.dataset.season;
        renderSeasonTabs();
        renderProductGrid();
      });
    });
  }

  function renderTypeTabs() {
    const wrap = document.getElementById("typeTabs");
    wrap.innerHTML = TYPES.map(
      (t) =>
        `<button type="button" class="pill${t.key === currentType ? " is-active" : ""}" data-type="${t.key}" role="tab" aria-selected="${t.key === currentType}">${t.label}</button>`
    ).join("");

    wrap.querySelectorAll(".pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentType = btn.dataset.type;
        renderTypeTabs();
        renderProductGrid();
      });
    });
  }

  /* ---- 초기화 --------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderGrid(document.getElementById("newArrivalsGrid"), NEW_ARRIVALS);
    renderSeasonTabs();
    renderTypeTabs();
    renderProductGrid();
    renderGrid(document.getElementById("popularRow"), POPULAR);
  });
})();
