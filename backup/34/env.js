// ==========================================================================
// env.js — UNI:CITY 환경 변수 파일
//
// ✅ Firebase Web Config (FIREBASE_*)
//    클라이언트용 공개 설정값입니다. GitHub/Vercel 배포에 포함됩니다.
//    보안은 Firebase Console의 Authentication Rules / Firestore Rules로 제어합니다.
//
// ⚠️ Kakao / Apple 키는 아직 미발급 상태입니다.
//    발급 후 'YOUR_...' 부분을 교체하세요.
//
// [Kakao]   https://developers.kakao.com → 내 애플리케이션 → 앱 키 → JavaScript 키
// [Apple]   https://developer.apple.com → Certificates → Services IDs
// ==========================================================================

window.ENV = {
  // ── Firebase ─────────────────────────────────────────────
  FIREBASE_API_KEY: "AIzaSyBINdLEmuwBgIhdw1PbvLmRPI0OBoYDrBM",
  FIREBASE_AUTH_DOMAIN: "mancity-unifrom.firebaseapp.com",
  FIREBASE_PROJECT_ID: "mancity-unifrom",
  FIREBASE_STORAGE_BUCKET: "mancity-unifrom.firebasestorage.app",
  FIREBASE_MESSAGING_SENDER_ID: "14482301363",
  FIREBASE_APP_ID: "1:14482301363:web:1194bc1e55118e036f6bc6",
  FIREBASE_MEASUREMENT_ID: "G-EJH9CC0ZMW",

  // ── Kakao ────────────────────────────────────────────────
  KAKAO_JAVASCRIPT_KEY: "YOUR_KAKAO_JAVASCRIPT_KEY",
  KAKAO_REDIRECT_URI: "YOUR_KAKAO_REDIRECT_URI",

  // ── Apple ────────────────────────────────────────────────
  APPLE_CLIENT_ID: "YOUR_APPLE_CLIENT_ID",
  APPLE_REDIRECT_URI: "YOUR_APPLE_REDIRECT_URI"
};

