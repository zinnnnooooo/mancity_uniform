/* ============================================================
   UNI:CITY — cart.js
   더미 장바구니 데이터 렌더링 / 전체·개별 선택 동기화 /
   선택 삭제 / 수량 조절 / 결제 예정 금액 실시간 재계산
   (필드명은 product_detail.html에서 넘어오는 데이터와 동일하게 설계)
   ============================================================ */

(function () {
  const FREE_SHIPPING_THRESHOLD = 200000; // 20만원 이상 무료배송
  const SHIPPING_FEE = 3000; // 무료배송 조건 미충족 시 배송비(가정값)

  // ---- 더미 장바구니 데이터 ----
  let cartItems = [
    {
      id: 'city-home-2627',
      name: '2026/27 시즌 홈 레플리카 유니폼',
      thumbnail: 'placeholder-jersey',
      option: { size: 'L', marking: 'AGUERO 10', patch: 'PL PATCH' },
      price: 189000,
      markingFee: 15000,
      patchFee: 8000,
      qty: 1,
      checked: true,
    },
    {
      id: 'city-away-2526',
      name: '2025/26 시즌 어웨이 레플리카 유니폼',
      thumbnail: 'placeholder-jersey',
      option: { size: 'M', marking: 'No marking', patch: 'No patch' },
      price: 179000,
      markingFee: 0,
      patchFee: 0,
      qty: 2,
      checked: true,
    },
    {
      id: 'city-retro-1968',
      name: '1968 레트로 유니폼',
      thumbnail: 'placeholder-jersey',
      option: { size: 'XL', marking: 'HAALAND 9', patch: 'No patch' },
      price: 159000,
      markingFee: 15000,
      patchFee: 0,
      qty: 1,
      checked: false,
    },
  ];

  const cartListEl = document.getElementById('cartList');
  const checkAllEl = document.getElementById('checkAll');
  const btnDeleteSelected = document.getElementById('btnDeleteSelected');
  const sumProductEl = document.getElementById('sumProduct');
  const sumMarkingEl = document.getElementById('sumMarking');
  const sumPatchEl = document.getElementById('sumPatch');
  const sumShippingEl = document.getElementById('sumShipping');
  const sumTotalEl = document.getElementById('sumTotal');
  const btnCheckout = document.getElementById('btnCheckout');
  const btnBack = document.getElementById('btnBack');
  const btnCart = document.getElementById('btnCart');

  function formatPrice(n) {
    return n.toLocaleString('ko-KR') + '원';
  }

  function optionText(item) {
    return `SIZE ${item.option.size} | ${item.option.marking} | ${item.option.patch}`;
  }

  function itemLinePrice(item) {
    return (item.price + item.markingFee + item.patchFee) * item.qty;
  }

  // ---- 리스트 렌더링 ----
  function renderList() {
    if (cartItems.length === 0) {
      cartListEl.innerHTML = '<p class="cart-empty">장바구니가 비어 있습니다.</p>';
      return;
    }

    cartListEl.innerHTML = cartItems
      .map(
        (item, index) => `
        <div class="cart-item" data-index="${index}">
          <label class="cart-checkbox cart-item__checkbox">
            <input type="checkbox" class="js-item-check" ${item.checked ? 'checked' : ''} />
            <span class="cart-checkbox__box"></span>
          </label>
          <div class="cart-item__thumb"></div>
          <div class="cart-item__body">
            <p class="cart-item__name">${item.name}</p>
            <p class="cart-item__option">${optionText(item)}</p>
            <div class="cart-item__footer">
              <div class="cart-item__qty">
                <button type="button" class="cart-item__qty-btn js-qty-minus" aria-label="수량 감소">−</button>
                <span class="cart-item__qty-value">${String(item.qty).padStart(2, '0')}</span>
                <button type="button" class="cart-item__qty-btn js-qty-plus" aria-label="수량 증가">+</button>
              </div>
              <span class="cart-item__price">${formatPrice(itemLinePrice(item))}</span>
            </div>
          </div>
        </div>`
      )
      .join('');
  }

  // ---- 결제 예정 금액 재계산 (체크된 항목 기준) ----
  function renderSummary() {
    const checkedItems = cartItems.filter((item) => item.checked);

    const productSum = checkedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const markingSum = checkedItems.reduce((acc, item) => acc + item.markingFee * item.qty, 0);
    const patchSum = checkedItems.reduce((acc, item) => acc + item.patchFee * item.qty, 0);
    const subtotal = productSum + markingSum + patchSum;

    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
    const shippingFee = isFreeShipping ? 0 : SHIPPING_FEE;

    sumProductEl.textContent = formatPrice(productSum);
    sumMarkingEl.textContent = `+${formatPrice(markingSum)}`.replace('+0원', '+0원');
    sumPatchEl.textContent = `+${formatPrice(patchSum)}`;
    sumShippingEl.textContent = isFreeShipping
      ? '무료 (20만원 이상 구매 시 무료 배송)'
      : `${formatPrice(shippingFee)} (20만원 이상 구매 시 무료 배송)`;
    sumTotalEl.textContent = formatPrice(subtotal + shippingFee);

    btnCheckout.textContent = `총 ${checkedItems.length}개 상품 구매하기`;

    // 전체 선택 체크박스 상태 동기화
    checkAllEl.checked = cartItems.length > 0 && cartItems.every((item) => item.checked);
  }

  function renderAll() {
    renderList();
    renderSummary();
  }

  // ---- 개별 체크박스 / 수량 조절 (이벤트 위임) ----
  cartListEl.addEventListener('click', function (e) {
    const cardEl = e.target.closest('.cart-item');
    if (!cardEl) return;
    const index = Number(cardEl.dataset.index);
    const item = cartItems[index];

    if (e.target.classList.contains('js-qty-minus')) {
      if (item.qty > 1) item.qty -= 1;
      renderAll();
    } else if (e.target.classList.contains('js-qty-plus')) {
      item.qty += 1;
      renderAll();
    }
  });

  cartListEl.addEventListener('change', function (e) {
    if (!e.target.classList.contains('js-item-check')) return;
    const cardEl = e.target.closest('.cart-item');
    const index = Number(cardEl.dataset.index);
    cartItems[index].checked = e.target.checked;
    renderSummary();
  });

  // ---- 전체 선택 ----
  checkAllEl.addEventListener('change', function () {
    cartItems = cartItems.map((item) => ({ ...item, checked: checkAllEl.checked }));
    renderAll();
  });

  // ---- 선택 삭제 ----
  btnDeleteSelected.addEventListener('click', function () {
    cartItems = cartItems.filter((item) => !item.checked);
    renderAll();
  });

  // ---- 상단 뒤로가기 / 장바구니 아이콘 ----
  btnBack.addEventListener('click', function () {
    goBack('uni_list.html');
  });

  btnCart.addEventListener('click', function () {
    // 이미 장바구니 화면이므로 새로고침 성격의 렌더만 재수행
    renderAll();
  });

  // ---- 구매하기 ----
  btnCheckout.addEventListener('click', function () {
    const checkedItems = cartItems.filter((item) => item.checked);
    console.log('[UNI:CITY] 구매하기:', checkedItems);
  });

  // ---- 초기 렌더 ----
  renderAll();
})();
