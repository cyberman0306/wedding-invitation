import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { GUESTBOOK_MODE } from "../env"
import { requireFirebase } from "../firebase/firebase"

export const GUESTBOOK_RULES = {
  nameMaxLength: 20,
  messageMaxLength: 200,
} as const

export type GuestbookPost = {
  id: string
  name: string
  message: string
  createdAt: number
  hidden: boolean
}

export const GUESTBOOK_PAGE_SIZE = 5

export type GuestbookCursor = QueryDocumentSnapshot<DocumentData> | number | null

export type GuestbookPage = {
  posts: GuestbookPost[]
  nextCursor: GuestbookCursor
  hasMore: boolean
}

type ArchivePost = {
  id: string | number
  name: string
  message?: string
  content?: string
  createdAt?: number
  timestamp?: number
  hidden?: boolean
}

const fromFirestore = (
  id: string,
  data: {
    name?: unknown
    message?: unknown
    createdAt?: Timestamp | null
    hidden?: unknown
  },
): GuestbookPost => ({
  id,
  name: typeof data.name === "string" ? data.name : "",
  message: typeof data.message === "string" ? data.message : "",
  createdAt: data.createdAt?.seconds ?? Math.floor(Date.now() / 1000),
  hidden: data.hidden === true,
})

const loadArchive = async (): Promise<GuestbookPost[]> => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/guestbook.json`)
  if (!response.ok) throw new Error("보관된 방명록을 불러오지 못했습니다.")
  const posts = (await response.json()) as ArchivePost[]
  return posts
    .map((post) => ({
      id: String(post.id),
      name: post.name,
      message: post.message ?? post.content ?? "",
      createdAt: post.createdAt ?? post.timestamp ?? 0,
      hidden: post.hidden === true,
    }))
    .filter((post) => !post.hidden)
    .sort((a, b) => b.createdAt - a.createdAt)
}

let archivePostsPromise: Promise<GuestbookPost[]> | null = null

const getArchivePosts = () => {
  archivePostsPromise ??= loadArchive().catch((error) => {
    archivePostsPromise = null
    throw error
  })
  return archivePostsPromise
}

/** 현재 모드에 맞춰 방명록을 구독합니다. */
export const subscribeGuestbook = (
  onPosts: (posts: GuestbookPost[]) => void,
  onError: (error: Error) => void,
) => {
  if (GUESTBOOK_MODE === "archive") {
    getArchivePosts()
      .then((posts) => onPosts(posts.slice(0, 3)))
      .catch(onError)
    return () => undefined
  }

  const { db } = requireFirebase()
  const guestbookQuery = query(
    collection(db, "guestbook"),
    where("hidden", "==", false),
    orderBy("createdAt", "desc"),
    limit(3),
  )
  return onSnapshot(
    guestbookQuery,
    (snapshot) =>
      onPosts(
        snapshot.docs.map((item) => fromFirestore(item.id, item.data())),
      ),
    (error) => onError(error),
  )
}

/** 전체보기 모달에서 오래된 글을 커서 기준으로 한 페이지씩 읽습니다. */
export const getGuestbookPage = async (
  cursor: GuestbookCursor = null,
): Promise<GuestbookPage> => {
  if (GUESTBOOK_MODE === "archive") {
    const posts = await getArchivePosts()
    const start = typeof cursor === "number" ? cursor : 0
    const pagePosts = posts.slice(start, start + GUESTBOOK_PAGE_SIZE)
    const next = start + pagePosts.length
    return {
      posts: pagePosts,
      nextCursor: next,
      hasMore: next < posts.length,
    }
  }

  const { db } = requireFirebase()
  const constraints = [
    where("hidden", "==", false),
    orderBy("createdAt", "desc"),
    ...(cursor && typeof cursor !== "number" ? [startAfter(cursor)] : []),
    limit(GUESTBOOK_PAGE_SIZE + 1),
  ]
  const snapshot = await getDocs(query(collection(db, "guestbook"), ...constraints))
  const visibleDocs = snapshot.docs.slice(0, GUESTBOOK_PAGE_SIZE)

  return {
    posts: visibleDocs.map((item) => fromFirestore(item.id, item.data())),
    nextCursor: visibleDocs[visibleDocs.length - 1] ?? null,
    hasMore: snapshot.docs.length > GUESTBOOK_PAGE_SIZE,
  }
}

/** 방문자가 새 축하 메시지를 작성합니다. */
export const createGuestbookPost = async (name: string, message: string) => {
  if (GUESTBOOK_MODE !== "live") throw new Error("읽기 전용 방명록입니다.")
  const { db } = requireFirebase()
  await addDoc(collection(db, "guestbook"), {
    name,
    message,
    createdAt: serverTimestamp(),
    hidden: false,
  })
}

/** 관리자용 전체 방명록 구독입니다. */
export const subscribeAdminGuestbook = (
  onPosts: (posts: GuestbookPost[]) => void,
  onError: (error: Error) => void,
) => {
  const { db } = requireFirebase()
  return onSnapshot(
    query(collection(db, "guestbook"), orderBy("createdAt", "desc"), limit(500)),
    (snapshot) =>
      onPosts(
        snapshot.docs.map((item) => fromFirestore(item.id, item.data())),
      ),
    (error) => onError(error),
  )
}

export const isAdminUser = async (uid: string) => {
  const { db } = requireFirebase()
  const adminDocument = await getDoc(doc(db, "admins", uid))
  return adminDocument.exists() && adminDocument.data().role === "admin"
}

export const setGuestbookPostHidden = async (id: string, hidden: boolean) => {
  const { db } = requireFirebase()
  await updateDoc(doc(db, "guestbook", id), { hidden })
}

export const deleteGuestbookPost = async (id: string) => {
  const { db } = requireFirebase()
  await deleteDoc(doc(db, "guestbook", id))
}

/** Firebase 제거 전 저장할 정적 JSON 파일을 내려받습니다. */
export const downloadGuestbookArchive = (posts: GuestbookPost[]) => {
  // 정적 JSON은 누구나 직접 열 수 있으므로 숨김 글은 파일에 포함하지 않습니다.
  const archived = posts
    .filter((post) => !post.hidden)
    .map(({ id, name, message, createdAt }) => ({
      id,
      name,
      message,
      createdAt,
      hidden: false,
    }))
  const blob = new Blob([JSON.stringify(archived, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "guestbook.json"
  anchor.click()
  URL.revokeObjectURL(url)
}
