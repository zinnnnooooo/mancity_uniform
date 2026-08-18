/* ============================================================
   UNI:CITY — cart.js
   장바구니 데이터 렌더링 / 전체·개별 선택 동기화 /
   선택 삭제 / 수량 조절 / 결제 예정 금액 실시간 재계산
   (products_data.js의 PRODUCTS 데이터와 연동하여 동적 노출)
   ============================================================ */

function initCartPage() {
  const FREE_SHIPPING_THRESHOLD = 200000; // 20만원 이상 무료배송
  const SHIPPING_FEE = 3000; // 무료배송 조건 미충족 시 배송비

  // Load from localStorage, fallback to default mockup items if never initialized
  let cartItems = JSON.parse(localStorage.getItem('unicity_cart'));
  if (!cartItems) {
    cartItems = [
      {
        id: 'uniform_31',
        option: { size: 'L', marking: 'AGUERO 10', patch: 'PL PATCH' },
        markingFee: 15000,
        patchFee: 8000,
        qty: 1,
        checked: true,
      },
      {
        id: 'uniform_35',
        option: { size: 'M', marking: 'No marking', patch: 'No patch' },
        markingFee: 0,
        patchFee: 0,
        qty: 2,
        checked: true,
      },
      {
        id: 'uniform_24',
        option: { size: 'XL', marking: 'HAALAND 9', patch: 'No patch' },
        markingFee: 15000,
        patchFee: 0,
        qty: 1,
        checked: false,
      },
    ];
    localStorage.setItem('unicity_cart', JSON.stringify(cartItems));
  }

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

  if (!cartListEl) return; // Exit if DOM not loaded yet

  // ---- products_data.js 연동 헬퍼 ----
  function getProductData(productId) {
    if (typeof PRODUCTS !== 'undefined') {
      return PRODUCTS.find((p) => p.id === productId) || null;
    }
    return null;
  }

  function saveCartToStorage() {
    localStorage.setItem('unicity_cart', JSON.stringify(cartItems));
  }

  function formatPrice(n) {
    return n.toLocaleString('ko-KR') + '원';
  }

  function optionText(item, season) {
    const seasonStr = season ? `${season} SEASON | ` : '';
    return `${seasonStr}SIZE ${item.option.size} | ${item.option.marking} | ${item.option.patch}`;
  }

  function itemLinePrice(item, basePrice) {
    return (basePrice + item.markingFee + item.patchFee) * item.qty;
  }

  // ---- 리스트 렌더링 ----
  function renderList() {
    if (cartItems.length === 0) {
      cartListEl.innerHTML = '<p class="cart-empty">장바구니가 비어 있습니다.</p>';
      return;
    }

    cartListEl.innerHTML = cartItems
      .map((item, index) => {
        const product = getProductData(item.id) || {
          name: '알 수 없는 상품',
          image: '',
          season: 'UNKNOWN',
          price: 0
        };

        const itemSubtotal = itemLinePrice(item, product.price);

        return `
        <div class="cart-item" data-index="${index}">
          <label class="cart-checkbox cart-item__checkbox">
            <input type="checkbox" class="js-item-check" ${item.checked ? 'checked' : ''} />
            <span class="cart-checkbox__box"></span>
          </label>
          <div class="cart-item__thumb">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" />` : ''}
          </div>
          <div class="cart-item__body">
            <p class="cart-item__name">${product.name}</p>
            <p class="cart-item__option">${optionText(item, product.season)}</p>
            <div class="cart-item__footer">
              <div class="cart-item__qty">
                <button type="button" class="cart-item__qty-btn js-qty-minus" aria-label="수량 감소">−</button>
                <span class="cart-item__qty-value">${String(item.qty).padStart(2, '0')}</span>
                <button type="button" class="cart-item__qty-btn js-qty-plus" aria-label="수량 증가">+</button>
              </div>
              <span class="cart-item__price">${formatPrice(itemSubtotal)}</span>
            </div>
          </div>
        </div>`;
      })
      .join('');
  }

  // ---- 결제 예정 금액 재계산 (체크된 항목 기준) ----
  function renderSummary() {
    const checkedItems = cartItems.filter((item) => item.checked);

    let productSum = 0;
    let markingSum = 0;
    let patchSum = 0;

    checkedItems.forEach((item) => {
      const product = getProductData(item.id) || { price: 0 };
      productSum += product.price * item.qty;
      markingSum += item.markingFee * item.qty;
      patchSum += item.patchFee * item.qty;
    });

    const subtotal = productSum + markingSum + patchSum;

    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
    const shippingFee = isFreeShipping ? 0 : SHIPPING_FEE;

    sumProductEl.textContent = formatPrice(productSum);
    sumMarkingEl.textContent = `+${formatPrice(markingSum)}`;
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
  if (!cartListEl.dataset.listenerBound) {
    cartListEl.dataset.listenerBound = 'true';
    cartListEl.addEventListener('click', function (e) {
      const cardEl = e.target.closest('.cart-item');
      if (!cardEl) return;
      const index = Number(cardEl.dataset.index);
      const item = cartItems[index];

      if (e.target.classList.contains('js-qty-minus')) {
        if (item.qty > 1) {
          item.qty -= 1;
          saveCartToStorage();
          renderAll();
        }
      } else if (e.target.classList.contains('js-qty-plus')) {
        item.qty += 1;
        saveCartToStorage();
        renderAll();
      }
    });

    cartListEl.addEventListener('change', function (e) {
      if (!e.target.classList.contains('js-item-check')) return;
      const cardEl = e.target.closest('.cart-item');
      const index = Number(cardEl.dataset.index);
      cartItems[index].checked = e.target.checked;
      saveCartToStorage();
      renderSummary();
    });
  }

  // ---- 전체 선택 ----
  if (checkAllEl && !checkAllEl.dataset.listenerBound) {
    checkAllEl.dataset.listenerBound = 'true';
    checkAllEl.addEventListener('change', function () {
      cartItems = cartItems.map((item) => ({ ...item, checked: checkAllEl.checked }));
      saveCartToStorage();
      renderAll();
    });
  }

  // ---- 선택 삭제 ----
  if (btnDeleteSelected && !btnDeleteSelected.dataset.listenerBound) {
    btnDeleteSelected.dataset.listenerBound = 'true';
    btnDeleteSelected.addEventListener('click', function () {
      cartItems = cartItems.filter((item) => !item.checked);
      saveCartToStorage();
      renderAll();
    });
  }

  // ---- 상단 뒤로가기 / 장바구니 아이콘 ----
  if (btnBack && !btnBack.dataset.listenerBound) {
    btnBack.dataset.listenerBound = 'true';
    btnBack.addEventListener('click', function () {
      if (typeof goBack === 'function') {
        goBack('uni_list.html');
      } else {
        window.history.back();
      }
    });
  }

  if (btnCart && !btnCart.dataset.listenerBound) {
    btnCart.dataset.listenerBound = 'true';
    btnCart.addEventListener('click', function () {
      renderAll();
    });
  }

  // ---- 구매하기 ----
  if (btnCheckout && !btnCheckout.dataset.listenerBound) {
    btnCheckout.dataset.listenerBound = 'true';
    btnCheckout.addEventListener('click', function () {
      const checkedItems = cartItems.filter((item) => item.checked);
      console.log('[UNI:CITY] 구매하기:', checkedItems);
    });
  }

  // ---- 초기 렌더 ----
  renderAll();
}

// 글로벌 노출
window.initCartPage = initCartPage;

// 단독 실행 시 즉시 호출
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('cart.html')) {
    initCartPage();
  }
});
