import { Cover } from "../component/cover"
import "./designCompare.scss"

const invitationUrl = import.meta.env.BASE_URL

const designs = [
  {
    id: "paper",
    number: "01",
    name: "입체 팝업북",
    shortName: "종이",
    description: "겹친 종이와 빛의 그림자로 여는 초대",
    url: `${invitationUrl}?design=paper`,
  },
  {
    id: "cinema",
    number: "02",
    name: "시네마틱 에디토리얼",
    shortName: "영화",
    description: "한 장면처럼 펼쳐지는 우리의 이야기",
    url: `${invitationUrl}?design=cinema`,
  },
  {
    id: "editorial",
    number: "03",
    name: "모던 타이포",
    shortName: "타이포",
    description: "글자와 여백으로 완성한 대담한 초대장",
    url: `${invitationUrl}?design=editorial`,
  },
  {
    id: "aurora",
    number: "04",
    name: "오로라 글래스",
    shortName: "오로라",
    description: "밤의 빛과 투명한 유리처럼 반짝이는 장면",
    url: `${invitationUrl}?design=aurora`,
  },
  {
    id: "letter",
    number: "05",
    name: "봉인된 편지",
    shortName: "편지",
    description: "한 장의 손편지를 펼치듯 전하는 마음",
    url: `${invitationUrl}?design=letter`,
  },
  {
    id: "blush",
    number: "06",
    name: "블러시 골드",
    shortName: "분홍",
    description: "현재 청첩장 · 은은한 분홍과 골드",
    url: invitationUrl,
  },
  {
    id: "ivory",
    number: "07",
    name: "아이보리 샴페인",
    shortName: "아이보리",
    description: "따뜻한 아이보리와 차분한 골드",
    url: `${invitationUrl}?design=ivory`,
  },
  {
    id: "ink",
    number: "08",
    name: "화이트 앤 잉크",
    shortName: "잉크",
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
        번호를 누르거나 아래로 넘기며 여덟 가지 표지를 비교해 보세요.
        <br />각 시안의 전체보기에서는 사진, 지도, 방명록까지 기존 청첩장을
        그대로 볼 수 있습니다.
      </p>
      <a href={invitationUrl}>현재 청첩장으로 돌아가기</a>
    </header>

    <nav className="design-compare__picker" aria-label="디자인 시안 바로 보기">
      {designs.map(({ id, number, name, shortName }) => (
        <a
          href={`#design-${id}`}
          aria-label={`${number} ${name} 시안으로 이동`}
          key={id}
        >
          <span>{number}</span>
          <small>{shortName}</small>
        </a>
      ))}
    </nav>

    <div className="design-compare__list">
      {designs.map(({ id, number, name, description, url }) => (
        <section
          className="design-compare__sample"
          data-design={id}
          id={`design-${id}`}
          key={id}
        >
          <div className="design-compare__heading">
            <span className="design-compare__number">DESIGN {number}</span>
            <h2>{name}</h2>
            <p>{description}</p>
          </div>

          <div className="design-compare__paper">
            <Cover design={id} />
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
