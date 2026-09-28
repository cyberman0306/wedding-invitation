/**
 * 외부 SDK 및 데이터 모드 설정입니다.
 * Firebase Web Config는 공개 가능한 식별 정보이며 실제 권한은 Security Rules가 통제합니다.
 */
export const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? ""
export const KAKAO_SDK_JS_KEY = import.meta.env.VITE_KAKAO_SDK_JS_KEY ?? ""

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
}

export const GUESTBOOK_MODE =
  import.meta.env.VITE_GUESTBOOK_MODE === "archive" ? "archive" : "live"

export const STATIC_ONLY = import.meta.env.VITE_STATIC_ONLY === "true"

export const FIREBASE_ENABLED = Boolean(
  FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.authDomain &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.appId,
)
