import { useEffect, useState } from "react"
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
          <div className="guestbook-message">첫 번째 축하 메시지를 남겨주세요.</div>
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
        <Button onClick={() => listModalState[1](true)}>
          방명록 전체보기
        </Button>
      </LazyDiv>

      <Modal
        modalState={writeModalState}
        className="write-guestbook-modal"
        closeOnClickBackground={false}
      >
        <WriteGuestbookForm onClose={() => writeModalState[1](false)} />
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

const WriteGuestbookForm = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  return (
    <form
      className="form"
      onSubmit={async (event) => {
        event.preventDefault()
        const trimmedName = name.trim()
        const trimmedMessage = message.trim()
        if (!trimmedName || !trimmedMessage) {
          alert("이름과 축하 메시지를 입력해 주세요.")
          return
        }

        setLoading(true)
        try {
          await createGuestbookPost(trimmedName, trimmedMessage)
          alert("방명록이 작성되었습니다.")
          onClose()
        } catch {
          alert("방명록 작성에 실패했습니다. 잠시 후 다시 시도해 주세요.")
        } finally {
          setLoading(false)
        }
      }}
    >
      <div className="header">
        <div className="title-group">
          <div className="title">방명록 작성하기</div>
          <div className="subtitle">두 사람에게 축하의 마음을 전해 주세요.</div>
        </div>
      </div>
      <div className="content">
        이름
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={GUESTBOOK_RULES.nameMaxLength}
          disabled={loading}
          placeholder={`이름을 ${GUESTBOOK_RULES.nameMaxLength}자 이내로 입력해 주세요.`}
        />
        내용
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={GUESTBOOK_RULES.messageMaxLength}
          disabled={loading}
          placeholder={`축하 메시지를 ${GUESTBOOK_RULES.messageMaxLength}자 이내로 입력해 주세요.`}
        />
      </div>
      <div className="footer">
        <Button buttonStyle="style2" disabled={loading} type="submit">
          저장하기
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
            disabled={loading || !(page + 1 < pages.length || currentPage?.hasMore)}
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
