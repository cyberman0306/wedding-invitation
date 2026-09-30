import {
  addDoc,
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  type DocumentData,
  type QueryConstraint,
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
const ATTENDANCE_EXPORT_BATCH_SIZE = 250

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

/** 스프레드시트가 수식으로 해석할 수 있는 입력값을 텍스트로 고정합니다. */
const csvCell = (input: string | number) => {
  const value = String(input)
  const firstCode = value.charCodeAt(0)
  const startsWithControl =
    firstCode <= 0x20 || (firstCode >= 0x7f && firstCode <= 0x9f)
  const text =
    startsWithControl ||
    /^[\s\u200B-\u200F\u202A-\u202E\u2060\uFEFF=+@-]/.test(value)
      ? `'${value}`
      : value
  return `"${text.replaceAll('"', '""')}"`
}

const koreanDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  hourCycle: "h23",
})

const formatKoreanDate = (seconds: number) => {
  if (!seconds) return "접수 시간 없음"
  const parts = Object.fromEntries(
    koreanDateFormatter
      .formatToParts(new Date(seconds * 1000))
      .map(({ type, value }) => [type, value]),
  )
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
}

/** 관리자용 참석 의사 전체를 순차 조회하여 CSV로 내려받습니다. */
export const downloadAttendanceCsv = async (
  onProgress?: (processedCount: number) => void,
): Promise<number> => {
  const { db } = requireFirebase()
  const responses: AttendanceResponse[] = []
  let cursor: AttendanceCursor = null

  // 문서 ID 순서는 createdAt이 누락된 옛 문서도 포함하며 별도 인덱스가 필요 없습니다.
  while (true) {
    const constraints: QueryConstraint[] = [
      orderBy(documentId()),
      ...(cursor ? [startAfter(cursor)] : []),
      limit(ATTENDANCE_EXPORT_BATCH_SIZE),
    ]
    const snapshot = await getDocs(
      query(collection(db, "attendance"), ...constraints),
    )
    responses.push(
      ...snapshot.docs.map((item) => fromFirestore(item.id, item.data())),
    )
    onProgress?.(responses.length)
    if (snapshot.docs.length < ATTENDANCE_EXPORT_BATCH_SIZE) break
    cursor = snapshot.docs[snapshot.docs.length - 1]
  }

  const rows = [
    [
      "문서 ID",
      "접수 일시 (한국시간)",
      "구분",
      "성함",
      "식사 여부",
      "입력 인원 (본인 포함)",
    ],
    ...responses.map((response) => [
      response.id,
      formatKoreanDate(response.createdAt),
      response.side === "groom" ? "신랑 측" : "신부 측",
      response.name,
      response.meal === "yes"
        ? "예정"
        : response.meal === "undecided"
          ? "미정"
          : "식사 안 함",
      response.count,
    ]),
  ]
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  )
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "attendance.csv"
  document.body.appendChild(anchor)
  try {
    anchor.click()
  } finally {
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return responses.length
}
