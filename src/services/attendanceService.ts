import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { requireFirebase } from "../firebase/firebase"

export type AttendanceInput = {
  side: "groom" | "bride"
  name: string
  meal: "yes" | "undecided" | "no"
  count: number
}

/** 참석 의사를 Firestore에 저장합니다. */
export const createAttendance = async (input: AttendanceInput) => {
  const { db } = requireFirebase()
  await addDoc(collection(db, "attendance"), {
    ...input,
    createdAt: serverTimestamp(),
  })
}
