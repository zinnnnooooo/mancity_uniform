// ==========================================================================
// UNI:CITY — login.js
// 소셜 로그인 UI & 상태 관리
//
// ★ 실제 SDK 연동은 TODO 주석 위치에 구현하세요.
//   임의 API Key / 인증 토큰은 이 파일에 없습니다.
// ==========================================================================

'use strict';

// --------------------------------------------------------------------------
// 1. AUTH MANAGER — localStorage 기반 사용자 상태 관리
// --------------------------------------------------------------------------

const AUTH_STORAGE_KEY = 'unicity_user';

const AuthManager = {

  /**
   * 현재 로그인된 사용자 정보를 반환합니다.
   * @returns {Object|null} 사용자 객체 또는 null
   */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  },

  /**
   * 사용자 정보를 localStorage에 저장합니다.
   * provider + uid 조합으로 사용자를 구분하여
   * 동일 이메일이라도 다른 provider면 별개 계정으로 처리합니다.
   * @param {Object} userObj
   */
  setUser(userObj) {
    if (!userObj || !userObj.uid || !userObj.provider) {
      console.warn('[AuthManager] setUser: uid와 provider가 필요합니다.');
      return;
    }
    const normalized = {
      uid: userObj.uid,                        // "google_abc123" 형태 권장
      provider: userObj.provider,              // "google" | "kakao" | "apple"
      name: userObj.name || null,
      email: userObj.email || null,
      profileImage: userObj.profileImage || null,
      isLoggedIn: true,
      authToken: userObj.authToken || null,    // 실제 토큰 (SDK 연동 후 채울 것)
      isAppleRelayEmail: userObj.isAppleRelayEmail || false,
      loggedInAt: Date.now(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  },

  /**
   * 로그아웃: 사용자 정보를 localStorage에서 제거합니다.
   */
  clearUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  /**
   * 로그인 여부를 반환합니다.
   * @returns {boolean}
   */
  isLoggedIn() {
    const user = this.getUser();
    return !!(user && user.isLoggedIn);
  },
};

// 전역에 노출 (script.js 등에서 재사용 가능)
window.AuthManager = AuthManager;


// --------------------------------------------------------------------------
// 2. 개별 소셜 로그인 핸들러 (provider별로 분리)
// --------------------------------------------------------------------------

/**
 * Google 로그인 처리
 * @returns {Promise<Object>} 사용자 정보 객체
 *
 * TODO: 실제 Google OAuth 2.0 또는 Firebase Auth SDK를 연동하세요.
 *       - 방법 A (Firebase):  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
 *       - 방법 B (Google API): window.google.accounts.id.initialize(...)
 */
async function handleGoogleLogin() {
  // TODO: Google SDK 초기화 확인
  // if (!window.google) throw new Error('Google SDK가 로드되지 않았습니다.');

  // TODO: 실제 Google 로그인 팝업 호출
  // const result = await firebase.auth().signInWithPopup(googleProvider);
  // const { uid, displayName, email, photoURL } = result.user;

  // ── 실제 SDK 연동 전까지 이 함수는 실행되지 않습니다 ──
  throw new Error('TODO: Google SDK를 연동해주세요.');
}

/**
 * Kakao 로그인 처리
 * @returns {Promise<Object>} 사용자 정보 객체
 *
 * TODO: Kakao JavaScript SDK를 연동하세요.
 *       1. index.html에 <script src="https://developers.kakao.com/sdk/js/kakao.js"> 추가
 *       2. Kakao.init('YOUR_APP_KEY') 호출 (실제 앱 키 필요)
 *       3. Kakao.Auth.loginWithKakaoAccount() 호출
 *
 * ※ Apple과 달리 Kakao는 항상 실제 이메일을 반환합니다.
 */
async function handleKakaoLogin() {
  // TODO: Kakao SDK 초기화 확인
  // if (!window.Kakao) throw new Error('Kakao SDK가 로드되지 않았습니다.');
  // if (!Kakao.isInitialized()) Kakao.init('YOUR_KAKAO_APP_KEY');

  // TODO: 실제 Kakao 로그인 호출
  // return new Promise((resolve, reject) => {
  //   Kakao.Auth.loginWithKakaoAccount({
  //     success: async (authObj) => {
  //       const profile = await Kakao.API.request({ url: '/v2/user/me' });
  //       resolve({
  //         uid: `kakao_${profile.id}`,
  //         provider: 'kakao',
  //         name: profile.kakao_account?.profile?.nickname || null,
  //         email: profile.kakao_account?.email || null,
  //         profileImage: profile.kakao_account?.profile?.profile_image_url || null,
  //         authToken: authObj.access_token,
  //       });
  //     },
  //     fail: reject,
  //   });
  // });

  throw new Error('TODO: Kakao SDK를 연동해주세요.');
}

/**
 * Apple 로그인 처리
 * @returns {Promise<Object>} 사용자 정보 객체
 *
 * TODO: Sign in with Apple (Web)을 연동하세요.
 *       1. Apple Developer에서 Service ID 등록
 *       2. <script src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"> 추가
 *       3. AppleID.auth.init({ ... }) 호출
 *
 * ※ Apple 비공개 Relay 이메일 처리:
 *    Apple은 사용자가 이메일 숨기기를 선택하면
 *    "abc@privaterelay.appleid.com" 형태의 Relay 이메일을 전달합니다.
 *    이 경우 isAppleRelayEmail: true 로 표시하고 uid는 Apple sub(고유ID)를 사용합니다.
 */
async function handleAppleLogin() {
  // TODO: Apple SDK 초기화 확인
  // if (!window.AppleID) throw new Error('Apple SDK가 로드되지 않았습니다.');

  // TODO: 실제 Apple 로그인 요청
  // const response = await AppleID.auth.signIn();
  // const { id_token, authorization: { code } } = response;
  //
  // // JWT decode로 사용자 정보 추출 (서버사이드 검증 권장)
  // const payload = JSON.parse(atob(id_token.split('.')[1]));
  // const email = payload.email || null;
  // const isRelay = email ? email.endsWith('@privaterelay.appleid.com') : false;
  //
  // return {
  //   uid: `apple_${payload.sub}`,
  //   provider: 'apple',
  //   name: response.user?.name
  //     ? `${response.user.name.firstName || ''} ${response.user.name.lastName || ''}`.trim()
  //     : null,
  //   email,
  //   profileImage: null,
  //   authToken: code,
  //   isAppleRelayEmail: isRelay,
  // };

  throw new Error('TODO: Sign in with Apple SDK를 연동해주세요.');
}


// --------------------------------------------------------------------------
// 3. 에러 분류 헬퍼
// --------------------------------------------------------------------------

/**
 * 로그인 에러를 사용자에게 보여줄 메시지로 변환합니다.
 * @param {Error} err
 * @param {string} provider
 * @returns {string} 메시지
 */
function getLoginErrorMessage(err, provider) {
  const providerName = { google: 'Google', kakao: '카카오', apple: 'Apple' }[provider] || provider;

  if (!err) return `${providerName} 로그인 중 오류가 발생했습니다.`;

  const msg = err.message || '';

  // 사용자가 팝업을 닫은 경우
  if (
    msg.includes('popup-closed') ||
    msg.includes('cancelled') ||
    msg.includes('cancel') ||
    msg.includes('user_cancelled_login') ||
    msg.includes('1000') // Kakao 취소 코드
  ) {
    return `${providerName} 로그인이 취소되었습니다.`;
  }

  // 네트워크 오류
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('NetworkError')) {
    return '네트워크 오류가 발생했습니다. 연결을 확인해주세요.';
  }

  // SDK 미연동 (개발 단계)
  if (msg.startsWith('TODO:')) {
    return `현재 ${providerName} 로그인은 준비 중입니다.\n(SDK 연동 필요)`;
  }

  // 같은 이메일, 다른 provider
  if (msg.includes('account-exists-with-different-credential')) {
    return '이미 다른 방법으로 가입된 이메일입니다. 다른 로그인 방법을 시도해보세요.';
  }

  return `${providerName} 로그인 중 오류가 발생했습니다.`;
}


// --------------------------------------------------------------------------
// 4. LOGIN PAGE UI 컨트롤러
// --------------------------------------------------------------------------

let loginPageEl = null;  // .login-page-content DOM 참조

/**
 * 로그인 페이지 초기화 — script.js loadLoginPage()에서 호출됩니다.
 * @param {Object} [options]
 * @param {Function} [options.onLoginSuccess]  로그인 성공 시 콜백
 * @param {Function} [options.onLogout]        로그아웃 시 콜백
 * @param {Function} [options.onGuest]         비회원 둘러보기 시 콜백
 */
function initLoginPage(options = {}) {
  loginPageEl = document.querySelector('.login-page-content');
  if (!loginPageEl) {
    console.warn('[initLoginPage] .login-page-content 를 찾을 수 없습니다.');
    return;
  }

  const {
    onLoginSuccess = null,
    onLogout = null,
    onGuest = null,
  } = options;

  // 현재 로그인 상태에 따라 뷰 전환
  _renderViewState();

  // ── 소셜 로그인 버튼 이벤트 ──────────────────────────────────────────────
  const socialBtns = loginPageEl.querySelectorAll('.login-social-btn[data-provider]');
  socialBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const provider = btn.dataset.provider;
      await _runSocialLogin(provider, onLoginSuccess);
    });
  });

  // ── 비회원 둘러보기 ──────────────────────────────────────────────────────
  const guestBtn = loginPageEl.querySelector('#btnLoginGuest');
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      if (typeof onGuest === 'function') {
        onGuest();
      }
    });
  }

  // ── 로그인 후 마이페이지 이동 ────────────────────────────────────────────
  const myPageBtn = loginPageEl.querySelector('#btnGoMyPage');
  if (myPageBtn) {
    myPageBtn.addEventListener('click', () => {
      if (typeof window.loadMyPage === 'function') {
        window.loadMyPage();
      }
    });
  }

  // ── 로그아웃 ────────────────────────────────────────────────────────────
  const logoutBtn = loginPageEl.querySelector('#btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AuthManager.clearUser();
      _renderViewState();
      if (typeof onLogout === 'function') {
        onLogout();
      }
      // 장바구니 Badge 갱신
      if (typeof window.updateCartBadgeCount === 'function') {
        window.updateCartBadgeCount();
      }
    });
  }
}

window.initLoginPage = initLoginPage;


// --------------------------------------------------------------------------
// 5. 소셜 로그인 실행 (공통 플로우)
// --------------------------------------------------------------------------

let _isProcessing = false;  // 중복 클릭 방지 플래그

/**
 * 소셜 로그인 공통 실행 함수
 * @param {string} provider  "google" | "kakao" | "apple"
 * @param {Function|null} onLoginSuccess
 */
async function _runSocialLogin(provider, onLoginSuccess) {
  if (_isProcessing) return;
  _isProcessing = true;

  const socialBtns = loginPageEl
    ? loginPageEl.querySelectorAll('.login-social-btn')
    : [];

  try {
    // 로딩 UI 시작
    _setLoadingState(true, provider, socialBtns);
    _hideMessage();

    // ── provider별 로그인 함수 분기 ──────────────────────────────────────
    let userData;
    if (provider === 'google') {
      userData = await handleGoogleLogin();
    } else if (provider === 'kakao') {
      userData = await handleKakaoLogin();
    } else if (provider === 'apple') {
      userData = await handleAppleLogin();
    } else {
      throw new Error(`알 수 없는 provider: ${provider}`);
    }

    // 로그인 성공 처리
    AuthManager.setUser(userData);
    _renderViewState();

    // Apple relay 이메일 안내
    if (userData.isAppleRelayEmail) {
      _showMessage(
        'Apple이 이메일을 비공개로 설정했습니다. 일부 기능이 제한될 수 있습니다.',
        'info'
      );
    }

    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(userData);
    }

    // 장바구니 Badge 갱신
    if (typeof window.updateCartBadgeCount === 'function') {
      window.updateCartBadgeCount();
    }

  } catch (err) {
    console.error(`[${provider} login] 오류:`, err);
    const message = getLoginErrorMessage(err, provider);
    _showMessage(message, 'error');

  } finally {
    _isProcessing = false;
    _setLoadingState(false, provider, socialBtns);
  }
}


// --------------------------------------------------------------------------
// 6. UI 헬퍼
// --------------------------------------------------------------------------

/**
 * 로그인 상태에 따라 뷰를 전환합니다.
 */
function _renderViewState() {
  if (!loginPageEl) return;

  const loginView = loginPageEl.querySelector('#loginView');
  const loggedinView = loginPageEl.querySelector('#loggedinView');
  const user = AuthManager.getUser();

  if (user && user.isLoggedIn) {
    // 로그인 후 뷰
    if (loginView)    loginView.hidden = true;
    if (loggedinView) loggedinView.hidden = false;
    _renderProfileCard(user);
  } else {
    // 로그인 전 뷰
    if (loginView)    loginView.hidden = false;
    if (loggedinView) loggedinView.hidden = true;
  }
}

/**
 * 로그인 후 프로필 카드를 채웁니다.
 * @param {Object} user
 */
function _renderProfileCard(user) {
  if (!loginPageEl) return;

  const nameEl    = loginPageEl.querySelector('#loginProfileName');
  const emailEl   = loginPageEl.querySelector('#loginProfileEmail');
  const initialEl = loginPageEl.querySelector('#loginProfileInitial');
  const avatarEl  = loginPageEl.querySelector('#loginProfileAvatar');
  const badgeEl   = loginPageEl.querySelector('#loginProfileBadge');

  if (nameEl)    nameEl.textContent = user.name || 'CITY FAN';
  if (emailEl) {
    if (user.email) {
      emailEl.textContent = user.isAppleRelayEmail
        ? `${user.email} (비공개 주소)`
        : user.email;
    } else {
      emailEl.textContent = '이메일 정보 없음';
    }
  }

  // 이니셜 설정
  if (initialEl) {
    const firstChar = (user.name || user.email || 'C').charAt(0).toUpperCase();
    initialEl.textContent = firstChar;
  }

  // 프로필 이미지가 있으면 img로 대체
  if (avatarEl && user.profileImage) {
    const img = document.createElement('img');
    img.src = user.profileImage;
    img.alt = `${user.name || 'User'} 프로필`;
    img.onerror = () => {
      img.remove();
      if (initialEl) initialEl.style.display = '';
    };
    if (initialEl) initialEl.style.display = 'none';
    avatarEl.appendChild(img);
  }

  // provider 뱃지
  if (badgeEl) {
    const providerLabels = {
      google: '🔵 Google',
      kakao:  '🟡 Kakao',
      apple:  '⚫ Apple',
    };
    badgeEl.textContent = providerLabels[user.provider] || user.provider;
    badgeEl.className = `login-profile__badge login-profile__badge--${user.provider}`;
  }
}

/**
 * 로딩 상태 UI를 적용/해제합니다.
 * @param {boolean} isLoading
 * @param {string} activeProvider
 * @param {NodeList} allBtns
 */
function _setLoadingState(isLoading, activeProvider, allBtns) {
  if (!loginPageEl) return;

  const overlay = loginPageEl.querySelector('#loginLoadingOverlay');
  const loadingText = loginPageEl.querySelector('#loginLoadingText');

  if (overlay) overlay.hidden = !isLoading;
  if (loadingText && isLoading) {
    const names = { google: 'Google', kakao: '카카오', apple: 'Apple' };
    loadingText.textContent = `${names[activeProvider] || ''}로 로그인 중...`;
  }

  allBtns.forEach((btn) => {
    if (btn.dataset.provider === activeProvider) {
      btn.classList.toggle('is-loading', isLoading);
    } else {
      btn.classList.toggle('is-disabled', isLoading);
    }
  });
}

/**
 * 에러/상태 메시지를 표시합니다.
 * @param {string} text
 * @param {'error'|'info'} type
 */
function _showMessage(text, type = 'error') {
  if (!loginPageEl) return;

  const msgEl   = loginPageEl.querySelector('#loginMessage');
  const textEl  = loginPageEl.querySelector('#loginMessageText');

  if (!msgEl || !textEl) return;

  textEl.textContent = text;
  msgEl.hidden = false;

  // info 타입은 파란색 계열
  if (type === 'info') {
    msgEl.style.background = 'rgba(108, 171, 221, 0.12)';
    msgEl.style.borderColor = 'rgba(108, 171, 221, 0.3)';
    const icon = msgEl.querySelector('.login-message__icon');
    if (icon) { icon.textContent = 'ℹ'; icon.style.color = '#6CABDD'; }
    if (textEl) textEl.style.color = '#6CABDD';
  }
}

/**
 * 에러/상태 메시지를 숨깁니다.
 */
function _hideMessage() {
  if (!loginPageEl) return;
  const msgEl = loginPageEl.querySelector('#loginMessage');
  if (msgEl) msgEl.hidden = true;
}
