/* ============================================================
   UNI:CITY — checkout.js
   ============================================================ */

function initCheckoutPage() {
  const FREE_SHIPPING_THRESHOLD = 200000;
  const SHIPPING_FEE = 3000;

  let cartItems = [];
  try {
    cartItems = JSON.parse(localStorage.getItem('unicity_cart')) || [];
  } catch (e) {
    cartItems = [];
  }

  let orderItems = cartItems.filter((item) => item.checked !== false);
  if (orderItems.length === 0) orderItems = cartItems;

  const coItemListEl = document.getElementById('coItemList');
  const coItemCountEl = document.getElementById('coItemCount');
  const coSumProductEl = document.getElementById('coSumProduct');
  const coSumMarkingEl = document.getElementById('coSumMarking');
  const coSumPatchEl = document.getElementById('coSumPatch');
  const coSumShippingEl = document.getElementById('coSumShipping');
  const coSumTotalEl = document.getElementById('coSumTotal');
  const btnPayEl = document.getElementById('btnPay');
  const btnBackEl = document.getElementById('btnBack');
  const btnToggleItemsEl = document.getElementById('btnToggleItems');
  const checkAgreeEl = document.getElementById('checkAgree');
  const paymentGridEl = document.getElementById('paymentGrid');

  const deliveryReqDropdown = document.getElementById('deliveryReqDropdown');
  const deliveryReqTrigger = document.getElementById('deliveryReqTrigger');
  const deliveryReqText = document.getElementById('deliveryReqText');
  const deliveryReqMenu = document.getElementById('deliveryReqMenu');

  const successModal = document.getElementById('successModal');
  const modalOrderNo = document.getElementById('modalOrderNo');
  const modalPrice = document.getElementById('modalPrice');
  const btnConfirmSuccess = document.getElementById('btnConfirmSuccess');

  function getProductData(productId) {
    let list = [];
    if (typeof PRODUCTS !== 'undefined') {
      list = PRODUCTS;
    } else if (typeof window.PRODUCTS !== 'undefined') {
      list = window.PRODUCTS;
    }
    return list.find((p) => p.id === productId) || null;
  }

  function formatPrice(n) {
    return Number(n || 0).toLocaleString('ko-KR') + '원';
  }

  function renderOrderItems() {
    if (coItemCountEl) coItemCountEl.textContent = orderItems.length;

    if (!coItemListEl) return;

    if (orderItems.length === 0) {
      coItemListEl.innerHTML = `
        <div style="padding: 24px 0; text-align: center; color: rgba(255,255,255,0.4); font-size: 13px;">
          주문할 상품이 없습니다.
        </div>`;
      return;
    }

    coItemListEl.innerHTML = orderItems
      .map((item) => {
        const product = getProductData(item.id) || {
          name: '유니시티 레플리카 유니폼',
          image: '../../img/uniform_31.png',
          season: '26/27',
          price: 189000
        };

        const displayName = product.season && !product.name.includes(product.season)
          ? `${product.season} 시즌 ${product.name}`
          : product.name;

        const sizeStr = item.option && item.option.size ? item.option.size : 'FREE';
        const markingStr = item.option && item.option.marking ? item.option.marking : 'No marking';
        const patchStr = item.option && item.option.patch ? item.option.patch : 'No patch';
        const optText = `SIZE ${sizeStr} | ${markingStr} | ${patchStr}`;

        const unitTotal = (Number(product.price) + (Number(item.markingFee) || 0) + (Number(item.patchFee) || 0)) * Number(item.qty);

        return `
          <div class="co-item-card">
            <div class="co-item__thumb">
              <img src="${product.image || '../../img/uniform_31.png'}" alt="${displayName}" onerror="this.src='../../img/uniform_31.png'" />
            </div>
            <div class="co-item__info">
              <h3 class="co-item__name">${displayName}</h3>
              <p class="co-item__opt">${optText}</p>
              <div class="co-item__meta">
                <span class="co-item__qty">수량 ${item.qty}개</span>
                <span class="co-item__price">${formatPrice(unitTotal)}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function calculateSummary() {
    let productSum = 0;
    let markingSum = 0;
    let patchSum = 0;

    orderItems.forEach((item) => {
      const product = getProductData(item.id) || { price: 189000 };
      productSum += Number(product.price) * Number(item.qty);
      markingSum += (Number(item.markingFee) || 0) * Number(item.qty);
      patchSum += (Number(item.patchFee) || 0) * Number(item.qty);
    });

    const subtotal = productSum + markingSum + patchSum;
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || orderItems.length === 0;
    const shippingFee = (orderItems.length === 0 || isFreeShipping) ? 0 : SHIPPING_FEE;
    const totalAmount = subtotal + shippingFee;

    if (coSumProductEl) coSumProductEl.textContent = formatPrice(productSum);
    if (coSumMarkingEl) coSumMarkingEl.textContent = `+${formatPrice(markingSum)}`;
    if (coSumPatchEl) coSumPatchEl.textContent = `+${formatPrice(patchSum)}`;
    if (coSumShippingEl) {
      if (orderItems.length === 0) {
        coSumShippingEl.textContent = '0원';
      } else {
        coSumShippingEl.textContent = isFreeShipping ? '0원 (무료배송)' : formatPrice(shippingFee);
      }
    }
    if (coSumTotalEl) coSumTotalEl.textContent = formatPrice(totalAmount);
    if (btnPayEl) btnPayEl.textContent = `${formatPrice(totalAmount)} 결제하기`;

    return totalAmount;
  }

  if (deliveryReqTrigger) {
    deliveryReqTrigger.onclick = function (e) {
      e.stopPropagation();
      deliveryReqDropdown.classList.toggle('is-open');
    };
  }

  if (deliveryReqMenu) {
    deliveryReqMenu.onclick = function (e) {
      const item = e.target.closest('.co-dropdown__item');
      if (!item) return;
      deliveryReqMenu.querySelectorAll('.co-dropdown__item').forEach((el) => el.classList.remove('is-selected'));
      item.classList.add('is-selected');
      if (deliveryReqText) deliveryReqText.textContent = item.dataset.val;
      deliveryReqDropdown.classList.remove('is-open');
    };
  }

  document.addEventListener('click', () => {
    if (deliveryReqDropdown) deliveryReqDropdown.classList.remove('is-open');
  });

  if (btnToggleItemsEl) {
    btnToggleItemsEl.onclick = function () {
      const isExpanded = btnToggleItemsEl.getAttribute('aria-expanded') === 'true';
      btnToggleItemsEl.setAttribute('aria-expanded', !isExpanded);
      if (coItemListEl) coItemListEl.style.display = isExpanded ? 'none' : 'flex';
    };
  }

  if (paymentGridEl) {
    paymentGridEl.onclick = function (e) {
      const btn = e.target.closest('.co-pay-btn');
      if (!btn) return;
      paymentGridEl.querySelectorAll('.co-pay-btn').forEach((el) => el.classList.remove('is-active'));
      btn.classList.add('is-active');
    };
  }

  if (btnBackEl) {
    btnBackEl.onclick = function (e) {
      e.preventDefault();
      if (typeof window.loadCartPage === 'function') {
        window.loadCartPage();
      } else if (typeof goBack === 'function') {
        goBack('cart.html');
      } else {
        window.history.back();
      }
    };
  }

  if (btnPayEl) {
    btnPayEl.onclick = function (e) {
      e.preventDefault();
      if (orderItems.length === 0) {
        alert('결제할 주문 상품이 없습니다.');
        return;
      }
      if (checkAgreeEl && !checkAgreeEl.checked) {
        alert('주문 상품 정보 및 결제 조건에 동의해 주세요.');
        return;
      }

      const finalPrice = calculateSummary();
      const randomOrderNo = `MC${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (modalOrderNo) modalOrderNo.textContent = randomOrderNo;
      if (modalPrice) modalPrice.textContent = formatPrice(finalPrice);

      const remainingCart = cartItems.filter((item) => item.checked === false);
      localStorage.setItem('unicity_cart', JSON.stringify(remainingCart));

      if (successModal) successModal.classList.add('is-open');
    };
  }

  if (btnConfirmSuccess) {
    btnConfirmSuccess.onclick = function (e) {
      e.preventDefault();
      if (successModal) successModal.classList.remove('is-open');
      if (typeof window.loadMyPage === 'function') {
        window.loadMyPage();
      } else {
        window.location.href = 'mypage.html';
      }
    };
  }

  renderOrderItems();
  calculateSummary();
}

window.initCheckoutPage = initCheckoutPage;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('checkout.html') || document.getElementById('coItemList')) {
      initCheckoutPage();
    }
  });
} else {
  if (window.location.pathname.endsWith('checkout.html') || document.getElementById('coItemList')) {
    initCheckoutPage();
  }
}