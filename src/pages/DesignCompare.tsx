import { Cover } from "../component/cover"
import "./designCompare.scss"

const invitationUrl = import.meta.env.BASE_URL

const designs = [
  {
    id: "blush",
    number: "01",
    name: "블러시 골드",
    description: "현재 청첩장 · 은은한 분홍과 골드",
    url: invitationUrl,
  },
  {
    id: "ivory",
    number: "02",
    name: "아이보리 샴페인",
    description: "따뜻한 아이보리와 차분한 골드",
    url: `${invitationUrl}?design=ivory`,
  },
  {
    id: "ink",
    number: "03",
    name: "화이트 앤 잉크",
    description: "선명한 흑백 대비와 작은 골드 포인트",
    url: `${invitationUrl}?design=ink`,
  },
] as const

/**
 * 신랑·신부가 디자인을 한 화면에서 비교하는 시안 페이지입니다.
 * 실제 청첩장은 전체보기 링크마다 한 번만 실행되므로 방명록과 지도 요청이 중복되지 않습니다.
 */
export const DesignCompare = () => (
  <main className="design-compare">
    <header className="design-compare__intro">
      <span className="design-compare__eyebrow">
        Wedding invitation · design review
      </span>
      <h1>우리의 청첩장, 어떤 분위기가 좋을까요?</h1>
      <p>
        아래로 넘기며 세 가지 표지를 비교해 보세요.
        <br />각 시안의 전체보기에서는 사진, 지도, 방명록까지 기존 청첩장을
        그대로 볼 수 있습니다.
      </p>
      <a href={invitationUrl}>현재 청첩장으로 돌아가기</a>
    </header>

    <div className="design-compare__list">
      {designs.map(({ id, number, name, description, url }) => (
        <section className="design-compare__sample" data-design={id} key={id}>
          <div className="design-compare__heading">
            <span className="design-compare__number">DESIGN {number}</span>
            <h2>{name}</h2>
            <p>{description}</p>
          </div>

          <div className="design-compare__paper">
            <Cover />
            <div className="design-compare__invitation">
              <span>Invitation</span>
              <p>
                한 해를 여는 1월의 설렘으로
                <br />
                저희 두 사람이 하나가 되려 합니다.
              </p>
            </div>
          </div>

          <a
            className="design-compare__open"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {id === "blush" ? "현재 청첩장 전체보기" : `${name} 전체보기`}
            <span aria-hidden="true">↗</span>
          </a>
        </section>
      ))}
    </div>

    <p className="design-compare__footer">
      디자인 시안은 같은 청첩장의 색과 화면 구성만 다릅니다.
      <br />
      기존 청첩장 주소와 QR코드는 바뀌지 않습니다.
    </p>
  </main>
)
