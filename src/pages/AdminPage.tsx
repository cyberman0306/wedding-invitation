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
  downloadAttendanceCsv,
  getAttendancePage,
  type AttendanceCursor,
  type AttendancePage,
} from "../services/attendanceService"
import {
  ADMIN_GUESTBOOK_PAGE_SIZE,
  deleteGuestbookPost,
  downloadGuestbookArchive,
  getAdminGuestbookPage,
  isAdminUser,
  setGuestbookPostHidden,
  type AdminGuestbookCursor,
  type AdminGuestbookPage,
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
  const [error, setError] = useState("")
  const [guestbookPage, setGuestbookPage] = useState<AdminGuestbookPage>({
    posts: [],
    nextCursor: null,
    hasMore: false,
  })
  const [guestbookCursors, setGuestbookCursors] = useState<
    AdminGuestbookCursor[]
  >([null])
  const [guestbookPageIndex, setGuestbookPageIndex] = useState(0)
  const [guestbookRefreshKey, setGuestbookRefreshKey] = useState(0)
  const [guestbookLoading, setGuestbookLoading] = useState(false)
  const [guestbookError, setGuestbookError] = useState("")
  const [guestbookExporting, setGuestbookExporting] = useState(false)
  const [guestbookExportProgress, setGuestbookExportProgress] = useState(0)
  const [guestbookExportStatus, setGuestbookExportStatus] = useState("")
  const [guestbookExportError, setGuestbookExportError] = useState(false)
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
  const [attendanceExporting, setAttendanceExporting] = useState(false)
  const [attendanceExportProgress, setAttendanceExportProgress] = useState(0)
  const [attendanceExportStatus, setAttendanceExportStatus] = useState("")
  const [attendanceExportError, setAttendanceExportError] = useState(false)

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
      setGuestbookPage({ posts: [], nextCursor: null, hasMore: false })
      setGuestbookCursors([null])
      setGuestbookPageIndex(0)
      setGuestbookError("")
      setGuestbookExportStatus("")
      setGuestbookExportError(false)
      setActiveTab("guestbook")
      setAttendancePage({ responses: [], nextCursor: null, hasMore: false })
      setAttendanceCursors([null])
      setAttendancePageIndex(0)
      setAttendanceError("")
      setAttendanceExportStatus("")
      setAttendanceExportError(false)
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
    if (!authorized || activeTab !== "guestbook") return
    let active = true
    setGuestbookLoading(true)
    setGuestbookError("")
    getAdminGuestbookPage(guestbookCursors[guestbookPageIndex])
      .then((page) => {
        if (active) setGuestbookPage(page)
      })
      .catch(() => {
        if (active) setGuestbookError("방명록을 불러오지 못했습니다.")
      })
      .finally(() => {
        if (active) setGuestbookLoading(false)
      })
    return () => {
      active = false
    }
  }, [
    authorized,
    activeTab,
    guestbookCursors,
    guestbookPageIndex,
    guestbookRefreshKey,
  ])

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
                <span>
                  방명록 {guestbookPageIndex + 1}페이지 · 페이지당 최대{" "}
                  {ADMIN_GUESTBOOK_PAGE_SIZE}건
                </span>
                <button
                  type="button"
                  disabled={guestbookLoading}
                  onClick={() => {
                    setGuestbookPageIndex(0)
                    setGuestbookCursors([null])
                  }}
                >
                  새로고침
                </button>
                <button
                  type="button"
                  disabled={guestbookExporting}
                  onClick={async () => {
                    setGuestbookExporting(true)
                    setGuestbookExportProgress(0)
                    setGuestbookExportStatus("")
                    setGuestbookExportError(false)
                    try {
                      const count = await downloadGuestbookArchive(
                        setGuestbookExportProgress,
                      )
                      setGuestbookExportStatus(
                        `공개 방명록 ${count}개를 저장했습니다. 숨김 글은 제외됩니다.`,
                      )
                    } catch {
                      setGuestbookExportError(true)
                      setGuestbookExportStatus(
                        "전체 방명록 저장에 실패했습니다. 파일은 생성되지 않았습니다.",
                      )
                    } finally {
                      setGuestbookExporting(false)
                    }
                  }}
                >
                  공개 방명록 전체 JSON 저장
                </button>
              </div>
              <p className="admin-note">
                새 글은 새로고침 후 표시됩니다. JSON 저장은 현재 페이지와
                관계없이 공개 방명록 전체를 가져옵니다. 결혼식 후 최종 보관
                시에는 마지막 글 정리를 마치고 Firestore 쓰기를 차단한 다음
                저장하세요.
              </p>
              {guestbookExporting && (
                <p role="status">방명록 {guestbookExportProgress}건 확인 중…</p>
              )}
              {guestbookExportStatus && !guestbookExporting && (
                <p
                  className={guestbookExportError ? "admin-error" : undefined}
                  role={guestbookExportError ? "alert" : "status"}
                >
                  {guestbookExportStatus}
                </p>
              )}
              {guestbookError && (
                <p className="admin-error" role="alert">
                  {guestbookError}
                </p>
              )}
              {guestbookError ? null : guestbookLoading ? (
                <p role="status">방명록을 불러오는 중입니다.</p>
              ) : guestbookPage.posts.length === 0 ? (
                <p className="admin-empty">이 페이지에 방명록이 없습니다.</p>
              ) : (
                <div className="admin-posts">
                  {guestbookPage.posts.map((post) => (
                    <article
                      className={post.hidden ? "hidden" : ""}
                      key={post.id}
                    >
                      <div className="admin-post-heading">
                        <strong>{post.name}</strong>
                        <time>
                          {dayjs
                            .unix(post.createdAt)
                            .format("YYYY-MM-DD HH:mm")}
                        </time>
                      </div>
                      <p>{post.message}</p>
                      <div className="admin-actions">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await setGuestbookPostHidden(
                                post.id,
                                !post.hidden,
                              )
                              setGuestbookRefreshKey((key) => key + 1)
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
                              if (
                                guestbookPage.posts.length === 1 &&
                                !guestbookPage.hasMore &&
                                guestbookPageIndex > 0
                              ) {
                                setGuestbookPageIndex((index) => index - 1)
                                setGuestbookCursors((cursors) =>
                                  cursors.slice(0, -1),
                                )
                              } else {
                                setGuestbookRefreshKey((key) => key + 1)
                              }
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
              )}
              <div className="admin-pagination">
                <button
                  type="button"
                  disabled={guestbookLoading || guestbookPageIndex === 0}
                  onClick={() => setGuestbookPageIndex((index) => index - 1)}
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled={
                    guestbookLoading ||
                    Boolean(guestbookError) ||
                    !guestbookPage.hasMore ||
                    !guestbookPage.nextCursor
                  }
                  onClick={() => {
                    if (!guestbookPage.nextCursor) return
                    setGuestbookCursors((cursors) => [
                      ...cursors.slice(0, guestbookPageIndex + 1),
                      guestbookPage.nextCursor,
                    ])
                    setGuestbookPageIndex((index) => index + 1)
                  }}
                >
                  다음
                </button>
              </div>
            </section>
          ) : (
            <section aria-label="참석 의사 접수 내역">
              <div className="admin-toolbar">
                <span>
                  참석 의사 {attendancePageIndex + 1}페이지 · 페이지당 최대{" "}
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
                <button
                  type="button"
                  disabled={attendanceExporting}
                  onClick={async () => {
                    setAttendanceExporting(true)
                    setAttendanceExportProgress(0)
                    setAttendanceExportStatus("")
                    setAttendanceExportError(false)
                    try {
                      const count = await downloadAttendanceCsv(
                        setAttendanceExportProgress,
                      )
                      setAttendanceExportStatus(
                        `참석 의사 응답 ${count}건을 CSV로 저장했습니다.`,
                      )
                    } catch {
                      setAttendanceExportError(true)
                      setAttendanceExportStatus(
                        "참석 의사 전체 저장에 실패했습니다. 파일은 생성되지 않았습니다.",
                      )
                    } finally {
                      setAttendanceExporting(false)
                    }
                  }}
                >
                  참석 의사 전체 CSV 저장
                </button>
              </div>
              <p className="admin-note">
                제출된 응답 내역입니다. 같은 분이 다시 제출하면 별도 건으로
                표시되며, 실제 방문 완료 기록은 아닙니다. 새 응답은 새로고침 후
                표시됩니다.
              </p>
              {attendanceExporting && (
                <p role="status">
                  참석 의사 {attendanceExportProgress}건 확인 중…
                </p>
              )}
              {attendanceExportStatus && !attendanceExporting && (
                <p
                  className={attendanceExportError ? "admin-error" : undefined}
                  role={attendanceExportError ? "alert" : "status"}
                >
                  {attendanceExportStatus}
                </p>
              )}
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
                                : "식사 안 함"}
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
