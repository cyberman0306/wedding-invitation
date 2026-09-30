import { useEffect, useRef, useState } from "react"
import { dayjs } from "../../const"
import { GUESTBOOK_MODE } from "../../env"
import {
  createGuestbookPost,
  getGuestbookPage,
  GUESTBOOK_RULES,
  subscribeGuestbook,
  type GuestbookPage,
  type GuestbookPost,
} from "../../services/guestbookService"
import { Button } from "../button"
import { LazyDiv } from "../lazyDiv"
import { Modal } from "../modal"

const Post = ({ post }: { post: GuestbookPost }) => (
  <div className="post">
    <div className="body">
      <div className="title">
        <div className="name">{post.name}</div>
        <div className="date">
          {dayjs.unix(post.createdAt).format("YYYY-MM-DD")}
        </div>
      </div>
      <div className="content">{post.message}</div>
    </div>
  </div>
)

/** Firebase 또는 정적 JSON을 이용하는 방명록 섹션입니다. */
export const GuestBook = () => {
  const [posts, setPosts] = useState<GuestbookPost[]>([])
  const [error, setError] = useState("")
  const writeModalState = useState(false)
  const listModalState = useState(false)
  const [writeBusy, setWriteBusy] = useState(false)

  useEffect(() => {
    try {
      return subscribeGuestbook(setPosts, () =>
        setError("방명록을 불러오지 못했습니다."),
      )
    } catch {
      setError("Firebase 연결 정보를 확인해 주세요.")
      return undefined
    }
  }, [])

  return (
    <>
      <LazyDiv className="card guestbook">
        <h2 className="english">Guest Book</h2>
        <div className="break" />

        {error && <div className="guestbook-message">{error}</div>}
        {!error && posts.length === 0 && (
          <div className="guestbook-message">
            첫 번째 축하 메시지를 남겨주세요.
          </div>
        )}
        {posts.slice(0, 3).map((post) => (
          <Post key={post.id} post={post} />
        ))}

        <div className="break" />
        {GUESTBOOK_MODE === "live" && (
          <>
            <Button onClick={() => writeModalState[1](true)}>
              방명록 작성하기
            </Button>
            <div className="break" />
          </>
        )}
        <Button onClick={() => listModalState[1](true)}>방명록 전체보기</Button>
      </LazyDiv>

      <Modal
        modalState={writeModalState}
        className="write-guestbook-modal"
        closeOnClickBackground={false}
        showCloseButton={!writeBusy}
      >
        <WriteGuestbookForm
          onClose={() => writeModalState[1](false)}
          onBusyChange={setWriteBusy}
        />
      </Modal>

      <Modal
        modalState={listModalState}
        className="guestbook-list-modal"
        closeOnClickBackground={true}
      >
        <GuestbookList onClose={() => listModalState[1](false)} />
      </Modal>
    </>
  )
}

const WriteGuestbookForm = ({
  onClose,
  onBusyChange,
}: {
  onClose: () => void
  onBusyChange: (busy: boolean) => void
}) => {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"write" | "confirm" | "success">("write")
  const [error, setError] = useState("")
  const postingRef = useRef(false)
  const stepHeadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (step !== "write") stepHeadingRef.current?.focus()
  }, [step])

  /** 최종 확인을 마친 글만 방명록에 게시합니다. */
  const publish = async () => {
    if (postingRef.current) return
    postingRef.current = true
    setLoading(true)
    onBusyChange(true)
    setError("")
    try {
      await createGuestbookPost(name.trim(), message.trim())
      setStep("success")
    } catch {
      setError("방명록을 게시하지 못했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      postingRef.current = false
      setLoading(false)
      onBusyChange(false)
    }
  }

  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault()
        if (step !== "write") return
        const trimmedName = name.trim()
        const trimmedMessage = message.trim()
        if (!trimmedName || !trimmedMessage) {
          setError("이름과 축하 메시지를 입력해 주세요.")
          return
        }
        setError("")
        setStep("confirm")
      }}
    >
      {step === "write" && (
        <>
          <div className="header">
            <div className="title-group">
              <div className="title">방명록 작성하기</div>
              <div className="subtitle">
                두 사람에게 축하의 마음을 전해 주세요.
              </div>
            </div>
          </div>
          <div className="content">
            이름
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError("")
              }}
              maxLength={GUESTBOOK_RULES.nameMaxLength}
              placeholder={`이름을 ${GUESTBOOK_RULES.nameMaxLength}자 이내로 입력해 주세요.`}
            />
            내용
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                setError("")
              }}
              maxLength={GUESTBOOK_RULES.messageMaxLength}
              placeholder={`축하 메시지를 ${GUESTBOOK_RULES.messageMaxLength}자 이내로 입력해 주세요.`}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="footer">
            <Button buttonStyle="style2" type="submit">
              내용 확인하기
            </Button>
            <Button
              buttonStyle="style2"
              type="button"
              className="bg-light-grey-color text-dark-color"
              onClick={onClose}
            >
              닫기
            </Button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          <div className="header">
            <div className="title-group">
              <div className="title" ref={stepHeadingRef} tabIndex={-1}>
                방명록을 게시할까요?
              </div>
              <div className="subtitle">
                이름과 내용을 한 번 더 확인해 주세요.
              </div>
            </div>
          </div>
          <div className="content confirmation-content">
            <p className="confirmation-note">
              게시 후에는 작성하신 분이 직접 수정하거나 삭제할 수 없습니다.
            </p>
            <div className="confirmation-preview">
              <div className="preview-name">{name.trim()}</div>
              <div className="preview-message">{message.trim()}</div>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="footer">
            <Button
              buttonStyle="style2"
              type="button"
              className="bg-light-grey-color text-dark-color"
              disabled={loading}
              onClick={() => {
                setError("")
                setStep("write")
              }}
            >
              다시 확인
            </Button>
            <Button
              buttonStyle="style2"
              type="button"
              disabled={loading}
              onClick={publish}
            >
              {loading ? "게시 중..." : "이대로 게시하기"}
            </Button>
          </div>
        </>
      )}

      {step === "success" && (
        <>
          <div className="header">
            <div className="title-group">
              <div className="title" ref={stepHeadingRef} tabIndex={-1}>
                마음을 전해주셔서 감사합니다
              </div>
            </div>
          </div>
          <div className="content confirmation-content">
            <p className="success-message">
              두 분에게 남겨주신 축하의 글을 소중히 간직하겠습니다.
            </p>
          </div>
          <div className="footer">
            <Button buttonStyle="style2" type="button" onClick={onClose}>
              닫기
            </Button>
          </div>
        </>
      )}
    </form>
  )
}

const GuestbookList = ({ onClose }: { onClose: () => void }) => {
  const [pages, setPages] = useState<GuestbookPage[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const currentPage = pages[page]

  useEffect(() => {
    let active = true
    getGuestbookPage()
      .then((firstPage) => {
        if (active) setPages([firstPage])
      })
      .catch(() => {
        if (active) setError("방명록을 불러오지 못했습니다.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const goToNextPage = async () => {
    if (!currentPage || loading) return
    if (page + 1 < pages.length) {
      setPage(page + 1)
      return
    }
    if (!currentPage.hasMore) return

    setLoading(true)
    setError("")
    try {
      const nextPage = await getGuestbookPage(currentPage.nextCursor)
      setPages((previous) => [...previous, nextPage])
      setPage(page + 1)
    } catch {
      setError("오래된 방명록을 불러오지 못했습니다. 다시 시도해 주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="header">
        <div className="title">방명록 전체보기</div>
      </div>
      <div className="content">
        {currentPage?.posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
        {loading && pages.length === 0 && (
          <div className="guestbook-message">방명록을 불러오는 중입니다.</div>
        )}
        {error && <div className="guestbook-message">{error}</div>}
        {!loading && !error && currentPage?.posts.length === 0 && (
          <div className="guestbook-message">작성된 방명록이 없습니다.</div>
        )}
        <div className="pagination" aria-label="방명록 페이지">
          <button
            type="button"
            className="page page-control"
            disabled={page === 0 || loading}
            onClick={() => setPage(page - 1)}
          >
            이전
          </button>
          {pages.map((_, index) => (
            <button
              type="button"
              className={`page${index === page ? " current" : ""}`}
              key={index}
              aria-current={index === page ? "page" : undefined}
              onClick={() => setPage(index)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            className="page page-control"
            disabled={
              loading || !(page + 1 < pages.length || currentPage?.hasMore)
            }
            onClick={goToNextPage}
          >
            다음
          </button>
        </div>
      </div>
      <div className="footer">
        <Button
          buttonStyle="style2"
          className="bg-light-grey-color text-dark-color"
          onClick={onClose}
        >
          닫기
        </Button>
      </div>
    </>
  )
}
