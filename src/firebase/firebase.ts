import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { FIREBASE_CONFIG, FIREBASE_ENABLED } from "../env"

/** Firebase가 설정된 경우에만 앱을 초기화합니다. */
const app = FIREBASE_ENABLED
  ? getApps().length
    ? getApp()
    : initializeApp(FIREBASE_CONFIG)
  : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

export const requireFirebase = () => {
  if (!auth || !db) {
    throw new Error("Firebase 환경변수가 설정되지 않았습니다.")
  }
  return { auth, db }
}
