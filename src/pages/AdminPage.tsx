import { useEffect, useState, type FormEvent } from "react"
import {
  inMemoryPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"
import { dayjs } from "../const"
import { auth } from "../firebase/firebase"
import {
  ATTENDANCE_PAGE_SIZE,
  getAttendancePage,
  type AttendanceCursor,
  type AttendancePage,
} from "../services/attendanceService"
import {
  deleteGuestbookPost,
  downloadGuestbookArchive,
  isAdminUser,
  setGuestbookPostHidden,
  subscribeAdminGuestbook,
  type GuestbookPost,
} from "../services/guestbookService"
import "./admin.scss"

/** Firebase Authentication 기반 방명록·참석 의사 관리자 페이지입니다. */
export const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState<"guestbook" | "attendance">(
    "guestbook",
  )
  const [posts, setPosts] = useState<GuestbookPost[]>([])
  const [error, setError] = useState("")
  const [attendancePage, setAttendancePage] = useState<AttendancePage>({
    responses: [],
    nextCursor: null,
    hasMore: false,
  })
  const [attendanceCursors, setAttendanceCursors] = useState<
    AttendanceCursor[]
  >([null])
  const [attendancePageIndex, setAttendancePageIndex] = useState(0)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState("")

  useEffect(() => {
    if (!auth) {
      setError("Firebase 환경변수가 설정되지 않았습니다.")
      setChecking(false)
      return
    }
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      setAuthorized(false)
      setChecking(true)
      setPosts([])
      setActiveTab("guestbook")
      setAttendancePage({ responses: [], nextCursor: null, hasMore: false })
      setAttendanceCursors([null])
      setAttendancePageIndex(0)
      setAttendanceError("")
      setError("")
      if (nextUser) {
        try {
          setAuthorized(await isAdminUser(nextUser.uid))
        } catch {
          setError("관리자 권한을 확인하지 못했습니다.")
        }
      }
      setChecking(false)
    })
  }, [])

  useEffect(() => {
    if (!authorized) return
    try {
      return subscribeAdminGuestbook(setPosts, () =>
        setError("방명록을 불러오지 못했습니다."),
      )
    } catch {
      setError("방명록을 불러오지 못했습니다.")
      return undefined
    }
  }, [authorized])

  useEffect(() => {
    if (!authorized || activeTab !== "attendance") return
    let active = true
    setAttendanceLoading(true)
    setAttendanceError("")
    getAttendancePage(attendanceCursors[attendancePageIndex])
      .then((page) => {
        if (active) setAttendancePage(page)
      })
      .catch(() => {
        if (active) setAttendanceError("참석 의사 내역을 불러오지 못했습니다.")
      })
      .finally(() => {
        if (active) setAttendanceLoading(false)
      })
    return () => {
      active = false
    }
  }, [authorized, activeTab, attendanceCursors, attendancePageIndex])

  if (checking)
    return <main className="admin-page">권한을 확인하고 있습니다.</main>
  if (!user) return <AdminLogin error={error} />

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <h1>청첩장 관리</h1>
          <p>{user.email}</p>
        </div>
        <button type="button" onClick={() => auth && signOut(auth)}>
          로그아웃
        </button>
      </div>

      {!authorized ? (
        <p className="admin-error">
          이 계정에는 관리자 권한이 없습니다. Firestore의 admins 컬렉션에 UID
          문서를 등록해 주세요.
        </p>
      ) : (
        <>
          <nav className="admin-tabs" aria-label="관리 항목">
            <button
              type="button"
              aria-pressed={activeTab === "guestbook"}
              onClick={() => setActiveTab("guestbook")}
            >
              방명록
            </button>
            <button
              type="button"
              aria-pressed={activeTab === "attendance"}
              onClick={() => setActiveTab("attendance")}
            >
              참석 의사
            </button>
          </nav>

          {activeTab === "guestbook" ? (
            <section aria-label="방명록 관리">
              <div className="admin-toolbar">
                <span>불러온 방명록 {posts.length}개</span>
                <button
                  type="button"
                  onClick={() => downloadGuestbookArchive(posts)}
                >
                  guestbook.json 내려받기
                </button>
              </div>
              {error && <p className="admin-error">{error}</p>}
              <div className="admin-posts">
                {posts.map((post) => (
                  <article
                    className={post.hidden ? "hidden" : ""}
                    key={post.id}
                  >
                    <div className="admin-post-heading">
                      <strong>{post.name}</strong>
                      <time>
                        {dayjs.unix(post.createdAt).format("YYYY-MM-DD HH:mm")}
                      </time>
                    </div>
                    <p>{post.message}</p>
                    <div className="admin-actions">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await setGuestbookPostHidden(post.id, !post.hidden)
                          } catch {
                            alert("상태 변경에 실패했습니다.")
                          }
                        }}
                      >
                        {post.hidden ? "다시 표시" : "숨기기"}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={async () => {
                          if (!window.confirm("이 방명록을 영구 삭제할까요?"))
                            return
                          try {
                            await deleteGuestbookPost(post.id)
                          } catch {
                            alert("삭제에 실패했습니다.")
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section aria-label="참석 의사 내역">
              <div className="admin-toolbar">
                <span>
                  {attendancePageIndex + 1}페이지 · 페이지당 최대{" "}
                  {ATTENDANCE_PAGE_SIZE}건
                </span>
                <button
                  type="button"
                  disabled={attendanceLoading}
                  onClick={() => {
                    setAttendancePageIndex(0)
                    setAttendanceCursors([null])
                  }}
                >
                  새로고침
                </button>
              </div>
              {attendanceError && (
                <p className="admin-error" role="alert">
                  {attendanceError}
                </p>
              )}
              {attendanceError ? null : attendanceLoading ? (
                <p role="status">참석 의사를 불러오는 중입니다.</p>
              ) : attendancePage.responses.length === 0 ? (
                <p className="admin-empty">접수된 참석 의사가 없습니다.</p>
              ) : (
                <div className="admin-posts">
                  {attendancePage.responses.map((response) => (
                    <article key={response.id}>
                      <div className="admin-post-heading">
                        <strong>{response.name}</strong>
                        <time>
                          {response.createdAt
                            ? dayjs
                                .unix(response.createdAt)
                                .format("YYYY-MM-DD HH:mm")
                            : "접수 시간 없음"}
                        </time>
                      </div>
                      <dl className="admin-attendance-details">
                        <div>
                          <dt>구분</dt>
                          <dd>
                            {response.side === "groom" ? "신랑 측" : "신부 측"}
                          </dd>
                        </div>
                        <div>
                          <dt>식사</dt>
                          <dd>
                            {response.meal === "yes"
                              ? "예정"
                              : response.meal === "undecided"
                                ? "미정"
                                : "불참"}
                          </dd>
                        </div>
                        <div>
                          <dt>입력 인원</dt>
                          <dd>{response.count}명</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              )}
              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={attendanceLoading || attendancePageIndex === 0}
                  onClick={() => setAttendancePageIndex((index) => index - 1)}
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled={
                    attendanceLoading ||
                    Boolean(attendanceError) ||
                    !attendancePage.hasMore ||
                    !attendancePage.nextCursor
                  }
                  onClick={() => {
                    if (!attendancePage.nextCursor) return
                    setAttendanceCursors((cursors) => [
                      ...cursors.slice(0, attendancePageIndex + 1),
                      attendancePage.nextCursor,
                    ])
                    setAttendancePageIndex((index) => index + 1)
                  }}
                >
                  다음
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

const AdminLogin = ({ error }: { error: string }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState(error)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!auth) {
      setLoginError("Firebase 환경변수가 설정되지 않았습니다.")
      return
    }
    setLoading(true)
    setLoginError("")
    try {
      // 관리자 인증 토큰을 브라우저 저장소에 남기지 않습니다.
      await setPersistence(auth, inMemoryPersistence)
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setLoginError("이메일 또는 비밀번호를 확인해 주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-page admin-login">
      <form onSubmit={submit}>
        <h1>관리자 로그인</h1>
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {loginError && <p className="admin-error">{loginError}</p>}
        <button type="submit" disabled={loading}>
          로그인
        </button>
        <a href={import.meta.env.BASE_URL}>청첩장으로 돌아가기</a>
      </form>
    </main>
  )
}
