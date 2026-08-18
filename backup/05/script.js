// ==========================================================================
// UNI:CITY — 2단계
// 필요한 최소한의 인터랙션만 구현 (필터 탭 / 하단 내비게이션 활성 상태)
// ==========================================================================

// ----- 인기 유니폼 필터 탭 (Active 상태 전환) -----
document.querySelectorAll('.popular-uniform__filter').forEach((filter) => {
  filter.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    filter.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('is-active'));
    tab.classList.add('is-active');
  });
});

// ----- 하단 내비게이션 (Active 상태 전환) -----
document.querySelectorAll('.bottom-nav').forEach((nav) => {
  nav.addEventListener('click', (e) => {
    const item = e.target.closest('.bottom-nav__item');
    if (!item) return;
    nav.querySelectorAll('.bottom-nav__item').forEach((i) => i.classList.remove('is-active'));
    item.classList.add('is-active');
  });
});

// ----- 데스크톱 검색 폼 (페이지 이동 없이 제출 방지) -----
document.querySelectorAll('.dc-search__form').forEach((form) => {
  form.addEventListener('submit', (e) => e.preventDefault());
});
