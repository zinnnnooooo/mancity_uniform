/* ============================================================
   UNI:CITY — product_detail.js
   상품 상세 화면 동작: 사이즈 선택 / 마킹·패치 가격 반영 / 수량 조절 /
   장바구니·바로구매 데이터 객체 구성(cart.html과 필드명 통일)
   ============================================================ */

(function () {
  // ---- 상품 데이터 (JS 객체로 정의) ----
  const product = {
    id: 'city-home-2627',
    name: '2026/27 시즌 홈 레플리카 유니폼',
    thumbnail: 'placeholder-jersey',
    basePrice: 189000,
  };

  // ---- 상태 ----
  const state = {
    size: 'L',
    markingFee: 0,
    markingLabel: 'No marking',
    patchFee: 0,
    patchLabel: 'No patch',
    qty: 1,
  };

  const priceEl = document.getElementById('productPrice');
  const sizeListEl = document.getElementById('sizeList');
  const markingSelectEl = document.getElementById('markingSelect');
  const patchSelectEl = document.getElementById('patchSelect');
  const qtyValueEl = document.getElementById('qtyValue');
  const qtyMinusBtn = document.getElementById('qtyMinus');
  const qtyPlusBtn = document.getElementById('qtyPlus');
  const btnAddCart = document.getElementById('btnAddCart');
  const btnBuyNow = document.getElementById('btnBuyNow');
  const btnBack = document.getElementById('btnBack');
  const btnCart = document.getElementById('btnCart');

  function formatPrice(n) {
    return n.toLocaleString('ko-KR') + '원';
  }

  function currentUnitPrice() {
    return product.basePrice + state.markingFee + state.patchFee;
  }

  function renderPrice() {
    priceEl.textContent = formatPrice(currentUnitPrice());
  }

  // ---- 사이즈 선택 ----
  sizeListEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.pd-size-btn');
    if (!btn) return;
    sizeListEl
      .querySelectorAll('.pd-size-btn')
      .forEach((el) => el.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.size = btn.dataset.size;
  });

  // ---- 선수 마킹 / 오피셜 패치 ----
  markingSelectEl.addEventListener('change', function () {
    state.markingFee = Number(markingSelectEl.value) || 0;
    state.markingLabel = markingSelectEl.options[markingSelectEl.selectedIndex].text;
    renderPrice();
  });

  patchSelectEl.addEventListener('change', function () {
    state.patchFee = Number(patchSelectEl.value) || 0;
    state.patchLabel = patchSelectEl.options[patchSelectEl.selectedIndex].text;
    renderPrice();
  });

  // ---- 수량 조절 (최소 1개) ----
  function renderQty() {
    qtyValueEl.textContent = state.qty;
  }

  qtyMinusBtn.addEventListener('click', function () {
    if (state.qty > 1) {
      state.qty -= 1;
      renderQty();
    }
  });

  qtyPlusBtn.addEventListener('click', function () {
    state.qty += 1;
    renderQty();
  });

  // ---- 장바구니 / 바로 구매: cart.html과 필드명을 통일한 데이터 객체 구성 ----
  function buildCartItem() {
    return {
      id: product.id,
      name: product.name,
      thumbnail: product.thumbnail,
      option: {
        size: state.size,
        marking: state.markingLabel,
        patch: state.patchLabel,
      },
      price: product.basePrice,
      markingFee: state.markingFee,
      patchFee: state.patchFee,
      qty: state.qty,
      checked: true,
    };
  }

  btnAddCart.addEventListener('click', function () {
    const item = buildCartItem();
    console.log('[UNI:CITY] 장바구니 담기:', item);
  });

  btnBuyNow.addEventListener('click', function () {
    const item = buildCartItem();
    console.log('[UNI:CITY] 바로 구매:', item);
  });

  // ---- 상단 뒤로가기 / 장바구니 아이콘 ----
  btnBack.addEventListener('click', function () {
    goBack('uni_list.html');
  });

  btnCart.addEventListener('click', function () {
    goTo('cart.html');
  });

  // ---- 초기 렌더 ----
  renderPrice();
  renderQty();
})();
