import { useEffect, useMemo, useState } from "react"
import { dayjs } from "../../const"
import { GUESTBOOK_MODE } from "../../env"
import {
  createGuestbookPost,
  GUESTBOOK_RULES,
  subscribeGuestbook,
  type GuestbookPost,
} from "../../services/guestbookService"
import { Button } from "../button"
import { LazyDiv } from "../lazyDiv"
import { Modal } from "../modal"

const POSTS_PER_PAGE = 5

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
        <GuestbookList posts={posts} onClose={() => listModalState[1](false)} />
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

const GuestbookList = ({
  posts,
  onClose,
}: {
  posts: GuestbookPost[]
  onClose: () => void
}) => {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const pagePosts = useMemo(
    () => posts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE),
    [page, posts],
  )

  useEffect(() => {
    if (page >= totalPages) setPage(totalPages - 1)
  }, [page, totalPages])

  return (
    <>
      <div className="header">
        <div className="title">방명록 전체보기</div>
      </div>
      <div className="content">
        {pagePosts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
        {pagePosts.length === 0 && (
          <div className="guestbook-message">작성된 방명록이 없습니다.</div>
        )}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              type="button"
              className={`page${index === page ? " current" : ""}`}
              key={index}
              onClick={() => setPage(index)}
            >
              {index + 1}
            </button>
          ))}
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
