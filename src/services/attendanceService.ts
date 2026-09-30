import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore"
import { requireFirebase } from "../firebase/firebase"

export type AttendanceInput = {
  side: "groom" | "bride"
  name: string
  meal: "yes" | "undecided" | "no"
  count: number
}

export type AttendanceResponse = AttendanceInput & {
  id: string
  createdAt: number
}

export const ATTENDANCE_PAGE_SIZE = 20

export type AttendanceCursor = QueryDocumentSnapshot<DocumentData> | null

export type AttendancePage = {
  responses: AttendanceResponse[]
  nextCursor: AttendanceCursor
  hasMore: boolean
}

const fromFirestore = (id: string, data: DocumentData): AttendanceResponse => ({
  id,
  side: data.side === "bride" ? "bride" : "groom",
  name: typeof data.name === "string" ? data.name : "",
  meal: data.meal === "yes" || data.meal === "no" ? data.meal : "undecided",
  count:
    typeof data.count === "number" && Number.isInteger(data.count)
      ? data.count
      : 0,
  createdAt: (data.createdAt as Timestamp | undefined)?.seconds ?? 0,
})

/** 참석 의사를 Firestore에 저장합니다. */
export const createAttendance = async (input: AttendanceInput) => {
  const { db } = requireFirebase()
  await addDoc(collection(db, "attendance"), {
    ...input,
    createdAt: serverTimestamp(),
  })
}

/** 관리자 화면에서 참석 의사를 최신순으로 한 페이지씩 읽습니다. */
export const getAttendancePage = async (
  cursor: AttendanceCursor = null,
): Promise<AttendancePage> => {
  const { db } = requireFirebase()
  const constraints = [
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(ATTENDANCE_PAGE_SIZE + 1),
  ]
  const snapshot = await getDocs(
    query(collection(db, "attendance"), ...constraints),
  )
  const pageDocs = snapshot.docs.slice(0, ATTENDANCE_PAGE_SIZE)

  return {
    responses: pageDocs.map((item) => fromFirestore(item.id, item.data())),
    nextCursor: pageDocs[pageDocs.length - 1] ?? null,
    hasMore: snapshot.docs.length > ATTENDANCE_PAGE_SIZE,
  }
}
