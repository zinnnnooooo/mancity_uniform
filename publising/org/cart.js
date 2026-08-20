/* ============================================================
   UNI:CITY — cart.js
   장바구니 데이터 렌더링 / 개별 삭제(✕) / 전체·개별 선택 동기화 /
   선택 삭제 / 수량 조절 / 결제 예정 금액 실시간 재계산
   ============================================================ */

function initCartPage() {
  const FREE_SHIPPING_THRESHOLD = 200000;
  const SHIPPING_FEE = 3000;

  let cartItems = [];
  try {
    cartItems = JSON.parse(localStorage.getItem('unicity_cart')) || [];
  } catch (e) {
    cartItems = [];
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

  if (!cartListEl) return;

  function getProductData(productId) {
    let list = [];
    if (typeof PRODUCTS !== 'undefined') {
      list = PRODUCTS;
    } else if (typeof window.PRODUCTS !== 'undefined') {
      list = window.PRODUCTS;
    }
    return list.find((p) => p.id === productId) || null;
  }

  function saveCartToStorage() {
    localStorage.setItem('unicity_cart', JSON.stringify(cartItems));
  }

  function formatPrice(n) {
    return Number(n || 0).toLocaleString('ko-KR') + '원';
  }

  function optionText(item, season) {
    const seasonStr = season ? `${season} SEASON | ` : '';
    const sizeStr = item.option && item.option.size ? item.option.size : 'FREE';
    const markingStr = item.option && item.option.marking ? item.option.marking : 'No marking';
    const patchStr = item.option && item.option.patch ? item.option.patch : 'No patch';
    return `${seasonStr}SIZE ${sizeStr} | ${markingStr} | ${patchStr}`;
  }

  function itemLinePrice(item, basePrice) {
    const mFee = Number(item.markingFee) || 0;
    const pFee = Number(item.patchFee) || 0;
    return (Number(basePrice) + mFee + pFee) * Number(item.qty);
  }

  function renderList() {
    if (!cartItems || cartItems.length === 0) {
      // 상하단 여백을 슬림하게 조정 (기존 80px -> 36px)
      cartListEl.innerHTML = `
        <div class="cart-empty" style="padding: 36px 16px 28px; text-align: center; color: rgba(255, 255, 255, 0.45); font-size: 13.5px; line-height: 1.5;">
          <p style="margin: 0;">장바구니에 담긴 상품이 없습니다.</p>
        </div>`;
      return;
    }

    cartListEl.innerHTML = cartItems
      .map((item, index) => {
        const product = getProductData(item.id) || {
          name: '유니시티 레플리카 유니폼',
          image: '../../img/uniform_31.png',
          season: '26/27',
          price: 189000
        };

        const displayName = product.season && !product.name.includes(product.season)
          ? `${product.season} 시즌 ${product.name}`
          : product.name;

        const itemSubtotal = itemLinePrice(item, product.price);

        return `
        <div class="cart-item" data-index="${index}">
          <label class="cart-checkbox cart-item__checkbox">
            <input type="checkbox" class="js-item-check" ${item.checked !== false ? 'checked' : ''} />
            <span class="cart-checkbox__box"></span>
          </label>
          <div class="cart-item__thumb">
            ${product.image ? `<img src="${product.image}" alt="${displayName}" onerror="this.src='../../img/uniform_31.png'" />` : ''}
          </div>
          <div class="cart-item__body">
            <div class="cart-item__head">
              <p class="cart-item__name">${displayName}</p>
              <button type="button" class="cart-item__remove-btn js-item-remove" aria-label="상품 삭제">✕</button>
            </div>
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

  function renderSummary() {
    const checkedItems = cartItems.filter((item) => item.checked !== false);

    let productSum = 0;
    let markingSum = 0;
    let patchSum = 0;

    checkedItems.forEach((item) => {
      const product = getProductData(item.id) || { price: 189000 };
      productSum += Number(product.price) * Number(item.qty);
      markingSum += (Number(item.markingFee) || 0) * Number(item.qty);
      patchSum += (Number(item.patchFee) || 0) * Number(item.qty);
    });

    const subtotal = productSum + markingSum + patchSum;
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || checkedItems.length === 0;
    const shippingFee = (checkedItems.length === 0 || isFreeShipping) ? 0 : SHIPPING_FEE;

    if (sumProductEl) sumProductEl.textContent = formatPrice(productSum);
    if (sumMarkingEl) sumMarkingEl.textContent = `+${formatPrice(markingSum)}`;
    if (sumPatchEl) sumPatchEl.textContent = `+${formatPrice(patchSum)}`;
    if (sumShippingEl) {
      if (checkedItems.length === 0) {
        sumShippingEl.textContent = '0원';
      } else {
        sumShippingEl.textContent = isFreeShipping
          ? '무료 (20만원 이상 구매 시 무료 배송)'
          : `${formatPrice(shippingFee)} (20만원 이상 구매 시 무료 배송)`;
      }
    }
    if (sumTotalEl) sumTotalEl.textContent = formatPrice(subtotal + shippingFee);
    if (btnCheckout) btnCheckout.textContent = `총 ${checkedItems.length}개 상품 구매하기`;
    if (checkAllEl) checkAllEl.checked = cartItems.length > 0 && cartItems.every((item) => item.checked !== false);
  }

  function renderAll() {
    renderList();
    renderSummary();
    if (typeof updateCartBadgeCount === 'function') {
      updateCartBadgeCount();
    }
  }

  cartListEl.onclick = function (e) {
    const cardEl = e.target.closest('.cart-item');
    if (!cardEl) return;
    const index = Number(cardEl.dataset.index);
    const item = cartItems[index];
    if (!item) return;

    if (e.target.closest('.js-item-remove')) {
      cartItems.splice(index, 1);
      saveCartToStorage();
      renderAll();
      return;
    }

    if (e.target.closest('.js-qty-minus')) {
      if (item.qty > 1) {
        item.qty -= 1;
        saveCartToStorage();
        renderAll();
      }
    } else if (e.target.closest('.js-qty-plus')) {
      item.qty += 1;
      saveCartToStorage();
      renderAll();
    }
  };

  cartListEl.onchange = function (e) {
    if (!e.target.classList.contains('js-item-check')) return;
    const cardEl = e.target.closest('.cart-item');
    if (!cardEl) return;
    const index = Number(cardEl.dataset.index);
    if (cartItems[index]) {
      cartItems[index].checked = e.target.checked;
      saveCartToStorage();
      renderSummary();
    }
  };

  if (checkAllEl) {
    checkAllEl.onchange = function () {
      const isChecked = checkAllEl.checked;
      cartItems = cartItems.map((item) => ({ ...item, checked: isChecked }));
      saveCartToStorage();
      renderAll();
    };
  }

  if (btnDeleteSelected) {
    btnDeleteSelected.onclick = function () {
      const hasChecked = cartItems.some((item) => item.checked !== false);
      if (!hasChecked) {
        alert('삭제할 상품을 선택해 주세요.');
        return;
      }
      cartItems = cartItems.filter((item) => !item.checked);
      saveCartToStorage();
      renderAll();
    };
  }

  if (btnBack) {
    btnBack.onclick = function (e) {
      e.preventDefault();
      if (typeof window.loadUniformListPage === 'function') {
        window.loadUniformListPage();
      } else if (typeof goBack === 'function') {
        goBack('uni_list.html');
      } else {
        window.history.back();
      }
    };
  }

  if (btnCart) {
    btnCart.onclick = function (e) {
      e.preventDefault();
      try {
        cartItems = JSON.parse(localStorage.getItem('unicity_cart')) || [];
      } catch (err) {
        cartItems = [];
      }
      renderAll();
    };
  }

  // 구매하기 (모바일 내부 프레임 결제 화면 전환)
  if (btnCheckout) {
    btnCheckout.onclick = function (e) {
      e.preventDefault();
      const checkedItems = cartItems.filter((item) => item.checked !== false);
      if (checkedItems.length === 0) {
        alert('구매할 상품을 선택해 주세요.');
        return;
      }
      if (typeof window.loadCheckoutPage === 'function') {
        window.loadCheckoutPage();
      } else {
        window.location.href = 'index.html';
      }
    };
  }

  renderAll();
}

window.initCartPage = initCartPage;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('cart.html') || document.getElementById('cartList')) {
      initCartPage();
    }
  });
} else {
  if (window.location.pathname.endsWith('cart.html') || document.getElementById('cartList')) {
    initCartPage();
  }
}