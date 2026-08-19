// ==========================================================================
// UNI:CITY — login.js
// 소셜 로그인 UI & 상태 관리
//
// ★ Google 로그인: Firebase Authentication (signInWithPopup + GoogleAuthProvider)
//   Kakao / Apple: 기존 스타브유지
// ==========================================================================

'use strict';

// --------------------------------------------------------------------------
// 0. Firebase 초기화 — window.ENV 값을 사용 (`env.js`가 먼저 로드되어 있어야 동작)
// --------------------------------------------------------------------------

/** Firebase 앱 싱글턴 인스턴스 */
let _firebaseApp = null;
let _firebaseAuth = null;

/**
 * Firebase를 초기화하고 auth 인스턴스를 반환합니다.
 * 이미 초기화되어 있으면 기존 인스턴스를 리턴합니다.
 * @returns {firebase.auth.Auth|null}
 */
function _getFirebaseAuth() {
  if (_firebaseAuth) return _firebaseAuth;

  if (typeof firebase === 'undefined') {
    console.error('[Firebase] firebase SDK가 로드되지 않았습니다. index.html의 스크립트 순서를 확인하세요.');
    return null;
  }

  const env = window.ENV;
  if (!env || !env.FIREBASE_API_KEY) {
    console.error('[Firebase] window.ENV 또는 FIREBASE_API_KEY가 없습니다. env.js를 확인하세요.');
    return null;
  }

  try {
    // 이미 초기화된 앱이 있으면 재사용
    const existingApps = firebase.apps;
    if (existingApps && existingApps.length > 0) {
      _firebaseApp = existingApps[0];
    } else {
      _firebaseApp = firebase.initializeApp({
        apiKey:            env.FIREBASE_API_KEY,
        authDomain:        env.FIREBASE_AUTH_DOMAIN,
        projectId:         env.FIREBASE_PROJECT_ID,
        storageBucket:     env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
        appId:             env.FIREBASE_APP_ID,
        measurementId:     env.FIREBASE_MEASUREMENT_ID,
      });
    }
    _firebaseAuth = firebase.auth();
    console.log('[Firebase] 초기화 성공 ✔');
    return _firebaseAuth;
  } catch (err) {
    console.error('[Firebase] 초기화 실패:', err);
    return null;
  }
}

// --------------------------------------------------------------------------
// Firebase onAuthStateChanged — 새로고침 후 로그인 상태 유지
// 로그인 페이지가 마운트되었을 때 호출됨
// --------------------------------------------------------------------------

/**
 * Firebase 인증 상태를 구독하여 localStorage와 동기화합니다.
 * 로그인 페이지를 initLoginPage()로 열었을 때만 리스너를 등록합니다.
 * @param {Function} onAlreadySignedIn - Firebase 사용자가 이미 로그인된 상태일 때 콜백
 */
function _setupAuthStateObserver(onAlreadySignedIn) {
  const auth = _getFirebaseAuth();
  if (!auth) return;

  auth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      // Firebase에 로그인된 사용자가 있음
      const existingUser = AuthManager.getUser();
      if (!existingUser || !existingUser.isLoggedIn) {
        // localStorage에 없는 경우 동기화
        const userData = {
          uid:          firebaseUser.uid,
          provider:     'google',
          name:         firebaseUser.displayName || 'Google 사용자',
          email:        firebaseUser.email || null,
          profileImage: firebaseUser.photoURL || null,
        };
        AuthManager.setUser(userData);
      }

      if (typeof onAlreadySignedIn === 'function') {
        onAlreadySignedIn(AuthManager.getUser());
      }
    } else {
      // Firebase에 로그인된 사용자가 없음 — Google 로그인 사용자는 localStorage도 정리
      const existingUser = AuthManager.getUser();
      if (existingUser && existingUser.provider === 'google') {
        AuthManager.clearUser();
      }
    }
  });
}

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
 * Google 로그인 처리 — Firebase Authentication (signInWithPopup + GoogleAuthProvider)
 * window.ENV의 Firebase 설정값만 사용합니다. GOOGLE_CLIENT_ID는 사용하지 않습니다.
 * @returns {Promise<Object>} 사용자 정보 객체
 */
async function handleGoogleLogin() {
  const auth = _getFirebaseAuth();
  if (!auth) {
    throw new Error('network_Firebase Auth를 초기화할 수 없습니다. 인터넷 연결 및 env.js를 확인해주세요.');
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  // 항상 계정 선택 화면을 표시
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await auth.signInWithPopup(provider);
    const firebaseUser = result.user;

    console.log('[Google 로그인] Firebase 인증 성공:', firebaseUser.uid);

    return {
      uid:          firebaseUser.uid,
      provider:     'google',
      name:         firebaseUser.displayName || 'Google 사용자',
      email:        firebaseUser.email || null,
      profileImage: firebaseUser.photoURL || null,
    };

  } catch (err) {
    // Firebase 에러 코드와 메시지를 콘솔에 정확히 출력
    console.error('[Google 로그인] Firebase 오류 코드:', err.code);
    console.error('[Google 로그인] Firebase 오류 메시지:', err.message);

    const code = err.code || '';

    // 팝업 닫기 / 취소
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/user-cancelled'
    ) {
      throw new Error('cancelled');
    }

    // 승인되지 않은 도메인
    if (code === 'auth/unauthorized-domain') {
      throw new Error('unauthorized-domain_이 도메인은 Firebase에 승인되지 않았습니다. Firebase 콘솔 → Authentication → 승인된 도메인에 등록해주세요.');
    }

    // 팝업 차단
    if (code === 'auth/popup-blocked') {
      throw new Error('popup-blocked_팝업이 차단되었습니다. 브라우저에서 팝업을 허용한 후 다시 시도해주세요.');
    }

    // 네트워크 오류
    if (code === 'auth/network-request-failed') {
      throw new Error('network_네트워크 오류가 발생했습니다.');
    }

    // 기타 Firebase 오류
    throw new Error(`firebase_${code}: ${err.message}`);
  }
}


/**
 * Kakao 로그인 처리
 *
 * Kakao.Auth.authorize()를 사용해 실제 카카오 로그인/동의 화면으로 이동합니다.
 * 인증 완료 후 KAKAO_REDIRECT_URI로 리다이렉트되며,
 * 해당 콜백 페이지에서 code를 받아 처리해야 합니다.
 *
 * ※ 이 함수는 호출 시 페이지를 이동(리다이렉트)시킵니다.
 *    Promise를 반환하지만 리다이렉트 이후 이 페이지는 종료됩니다.
 *
 * TODO (서버 필요): 리다이렉트 URI에서 code를 받아
 *   카카오 토큰 발급 → 사용자 정보 조회 → AuthManager.setUser() 호출.
 *   순수 프론트엔드에서는 code를 클라이언트 Secret 없이 교환할 수 없으므로
 *   서버 연동 시 구현하세요.
 *
 * @returns {Promise<never>} — 리다이렉트 발생, resolve/reject 없음
 */
async function handleKakaoLogin() {
  // Kakao SDK 로드 여부 확인
  if (typeof Kakao === 'undefined') {
    throw new Error('network_Kakao SDK가 로드되지 않았습니다. 인터넷 연결을 확인해주세요.');
  }

  // 환경변수 확인
  const jsKey      = (window.ENV && window.ENV.KAKAO_JAVASCRIPT_KEY) || '';
  const redirectUri = (window.ENV && window.ENV.KAKAO_REDIRECT_URI)   || '';

  if (!jsKey || jsKey.includes('YOUR_KAKAO_JAVASCRIPT_KEY')) {
    throw new Error('CONFIG:env.js의 KAKAO_JAVASCRIPT_KEY를 카카오 개발자 콘솔에서 발급받은 JavaScript 키로 교체하세요.');
  }
  if (!redirectUri || redirectUri.includes('YOUR_KAKAO_REDIRECT_URI')) {
    throw new Error('CONFIG:env.js의 KAKAO_REDIRECT_URI를 카카오 개발자 콘솔에 등록한 Redirect URI로 교체하세요.');
  }

  // Kakao SDK 초기화 (중복 초기화 방지)
  if (!Kakao.isInitialized()) {
    Kakao.init(jsKey);
  }

  // 실제 카카오 로그인/동의 화면으로 리다이렉트
  // ※ 이 이후 코드는 실행되지 않습니다 (페이지 이동)
  Kakao.Auth.authorize({
    redirectUri,
    scope: 'profile_nickname,account_email,profile_image',
  });

  // 리다이렉트 중 — Promise는 resolve/reject되지 않음
  return new Promise(() => {});
}


/**
 * Apple 로그인 처리
 *
 * Sign in with Apple JS SDK를 사용해 팝업으로 Apple 인증 화면을 호출합니다.
 *
 * 성공 시 Apple은 { authorization: { id_token, code, state }, user? } 응답을 반환합니다.
 * id_token은 JWT로 sub(고유 ID), email, name을 포함합니다.
 *
 * ※ Apple 비공개 Relay 이메일:
 *    사용자가 이메일 숨기기를 선택하면 "abc@privaterelay.appleid.com" 형태의 주소가 옵니다.
 *    이 경우 isAppleRelayEmail: true로 표시합니다.
 *
 * TODO (서버 필요): id_token 서명 검증은 반드시 서버에서 수행하세요.
 *   프론트엔드에서 검증 없이 사용자 데이터를 신뢰하는 것은 보안 취약점입니다.
 *   현재 구현은 id_token 페이로드를 직접 파싱(비검증)합니다 — 데모/개발 전용.
 *
 * @returns {Promise<Object>} 사용자 정보 객체
 */
async function handleAppleLogin() {
  // Apple SDK 로드 여부 확인
  if (typeof AppleID === 'undefined') {
    throw new Error('network_Apple Sign In SDK가 로드되지 않았습니다. 인터넷 연결을 확인해주세요.');
  }

  // 환경변수 확인
  const clientId   = (window.ENV && window.ENV.APPLE_CLIENT_ID)   || '';
  const redirectUri = (window.ENV && window.ENV.APPLE_REDIRECT_URI) || '';

  if (!clientId || clientId.includes('YOUR_APPLE_CLIENT_ID')) {
    throw new Error('CONFIG:env.js의 APPLE_CLIENT_ID를 Apple Developer에서 발급받은 Service ID로 교체하세요.');
  }
  if (!redirectUri || redirectUri.includes('YOUR_APPLE_REDIRECT_URI')) {
    throw new Error('CONFIG:env.js의 APPLE_REDIRECT_URI를 Apple Developer에 등록한 Return URL로 교체하세요.');
  }

  // Apple Sign In 초기화
  AppleID.auth.init({
    clientId,
    scope:       'name email',
    redirectURI: redirectUri,
    state:       `unicity_${Date.now()}`,
    usePopup:    true,   // 팝업 방식 (리다이렉트 아님)
  });

  try {
    const response = await AppleID.auth.signIn();
    // response: { authorization: { id_token, code, state }, user? }

    const { id_token } = response.authorization;

    // id_token 페이로드 파싱 (Base64URL 디코딩 — 서명 미검증, 개발 전용)
    // TODO: 프로덕션에서는 반드시 서버에서 검증하세요.
    let payload = {};
    try {
      const base64Url = id_token.split('.')[1];
      const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      payload = JSON.parse(atob(base64));
    } catch {
      throw new Error('Apple id_token 파싱 실패');
    }

    const sub   = payload.sub || '';         // Apple 고유 사용자 ID
    const email = payload.email || null;
    const isRelayEmail = email ? email.endsWith('@privaterelay.appleid.com') : false;

    // user 객체는 최초 로그인 시만 포함됩니다
    const appleUser = response.user || {};
    const firstName = (appleUser.name && appleUser.name.firstName) || '';
    const lastName  = (appleUser.name && appleUser.name.lastName)  || '';
    const name      = [firstName, lastName].filter(Boolean).join(' ') || 'Apple 사용자';

    return {
      uid:             `apple_${sub}`,
      provider:        'apple',
      name,
      email,
      profileImage:    null,              // Apple은 프로필 이미지를 제공하지 않습니다
      authToken:       id_token,          // TODO: 서버에서 검증 후 사용
      appleCode:       response.authorization.code,  // 서버 토큰 교환용
      isAppleRelayEmail: isRelayEmail,
    };

  } catch (err) {
    // 사용자 취소 처리
    if (err && (err.error === 'popup_closed_by_user' || err.error === 'user_trigger_new_signin_flow')) {
      throw new Error('cancelled');
    }
    throw err;
  }
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

  // 네트워크 오류 (GIS SDK 미로드 포함)
  if (
    msg.startsWith('network_') ||
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('NetworkError')
  ) {
    return '네트워크 오류가 발생했습니다. 연결을 확인해주세요.';
  }

  // 환경변수 미설정 오류
  if (msg.startsWith('CONFIG:')) {
    return `⚙️ 설정 오류: ${msg.replace('CONFIG:', '').trim()}`;
  }

  // SDK 미연동 (개발 단계)
  if (msg.startsWith('TODO:')) {
    return `현재 ${providerName} 로그인은 준비 중입니다.\n(SDK 연동 필요)`;
  }

  // 같은 이메일, 다른 provider
  if (msg.includes('account-exists-with-different-credential')) {
    return '이미 다른 방법으로 가입된 이메일입니다. 다른 로그인 방법을 시도해보세요.';
  }

  // 팝업 차단
  if (msg.startsWith('popup-blocked_')) {
    return msg.replace('popup-blocked_', '');
  }

  // 승인되지 않은 도메인
  if (msg.startsWith('unauthorized-domain_')) {
    return msg.replace('unauthorized-domain_', '');
  }

  // Firebase 기타 오류
  if (msg.startsWith('firebase_')) {
    return `${providerName} 인증 오류가 발생했습니다.`;
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

  // ── 오버레이 클릭 (비회원 둘러보기와 동일 동작) ───────────────────────────
  const overlay = loginPageEl.querySelector('#loginOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      e.preventDefault();
      if (guestBtn) {
        guestBtn.click();
      } else if (typeof onGuest === 'function') {
        onGuest();
      }
    });
  }

  // ── Firebase 인증 상태 구독 (새로고침 후 로그인 유지) ─────────────────────
  // Firebase에 이미 로그인된 Google 사용자가 있으면 자동으로 성공 콜백 호출
  _setupAuthStateObserver((autoUser) => {
    _renderViewState();
    if (_isProcessing) {
      console.log('[AuthObserver] 활성 로그인 진행 중 - 즉시 리다이렉션 방지');
      return;
    }
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(autoUser);
    }
    if (typeof window.updateCartBadgeCount === 'function') {
      window.updateCartBadgeCount();
    }
  });

  // ── 로그아웃: Firebase signOut() + localStorage 정리 ────────────────────
  const logoutBtn = loginPageEl.querySelector('#btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      // Firebase signOut (Google 로그인 사용자)
      const auth = _getFirebaseAuth();
      if (auth) {
        try {
          await auth.signOut();
          console.log('[Firebase] 로그아웃 성공');
        } catch (signOutErr) {
          console.error('[Firebase] 로그아웃 실패:', signOutErr);
        }
      }
      // localStorage 정리
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

    // Apple relay 이메일 안내
    if (userData.isAppleRelayEmail) {
      _showMessage(
        'Apple이 이메일을 비공개로 설정했습니다. 일부 기능이 제한될 수 있습니다.',
        'info'
      );
    }

    _showTopToast(userData, onLoginSuccess);

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


/**
 * 로그인 성공 후 Top Toast 알림 표시 및 자동 종료 처리
 * @param {Object} userData
 * @param {Function} onLoginSuccess
 */
function _showTopToast(userData, onLoginSuccess) {
  // 기존 토스트 제거 (중복 방지)
  const existing = document.getElementById('loginTopToast');
  if (existing) existing.remove();

  // 토스트 엘리먼트 생성
  const toast = document.createElement('div');
  toast.id = 'loginTopToast';
  toast.className = 'login-top-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="login-top-toast__icon" aria-hidden="true">✓</div>
    <div>
      <p class="login-top-toast__text">로그인에 성공했습니다.</p>
    </div>
  `;

  // Mobile Preview 컨테이너에 추가 (position:absolute 기준점)
  const mobilePreview = document.querySelector('.mobile-preview');
  const mountTarget = mobilePreview || document.body;
  mountTarget.appendChild(toast);

  // 슬라이드 인 (다음 프레임에서 is-visible 추가)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });
  });

  // 1.8초 후 슬라이드 아웃 → onLoginSuccess 호출
  const hideDelay = 1800;
  const animDuration = 300;

  setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.classList.add('is-hiding');

    setTimeout(() => {
      toast.remove();
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(userData);
      }
    }, animDuration);
  }, hideDelay);
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
  // loginView는 항상 표시 (loggedinView 제거됨)
  if (loginView) loginView.hidden = false;
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
