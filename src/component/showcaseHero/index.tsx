import {
  BRIDE_FULLNAME,
  GROOM_FULLNAME,
  LOCATION,
  WEDDING_DATE,
} from "../../const"
import { COVER_IMAGE, GALLERY_IMAGES } from "../../images"
import type { ShowcaseDesign } from "../../showcaseDesigns"

const date = WEDDING_DATE.format("YYYY.MM.DD")
const time = WEDDING_DATE.format("A h:mm")

/** 원본 커버와 DOM 구성을 공유하지 않는 독립형 표지 시안입니다. */
export const ShowcaseHero = ({ design }: { design: ShowcaseDesign }) => {
  if (design === "afterglow") {
    return (
      <header className="showcase-hero showcase-hero--afterglow">
        <img
          className="showcase-hero__full-image"
          src={GALLERY_IMAGES[2]}
          alt="신랑 신부의 웨딩 사진 시안"
        />
        <div className="afterglow__veil" />
        <div className="afterglow__topline">
          <span>THE WEDDING OF</span>
          <span>01 / 16 / 2027</span>
        </div>
        <div className="afterglow__headline" aria-label="Happily Ever After">
          <span>Happily</span>
          <span>Ever After</span>
        </div>
        <div className="afterglow__bottom">
          <span className="afterglow__rule" />
          <p>
            {GROOM_FULLNAME} <span aria-hidden="true">✳</span> {BRIDE_FULLNAME}
          </p>
          <small>
            {date} · {time}
            <br />
            {LOCATION}
          </small>
        </div>
      </header>
    )
  }

  if (design === "photo-diary") {
    return (
      <header className="showcase-hero showcase-hero--diary">
        <div className="diary__top">
          <span>J · H</span>
          <span>NO. 01 — OUR DAY</span>
        </div>
        <div className="diary__title">
          <span>THE</span>
          <strong>beautiful</strong>
          <span>BEGINNING.</span>
        </div>
        <div className="diary__collage">
          <figure className="diary__tile diary__tile--left">
            <img src={GALLERY_IMAGES[0]} alt="웨딩 사진 시안 1" />
            <figcaption>just us, always</figcaption>
          </figure>
          <figure className="diary__tile diary__tile--center">
            <img src={COVER_IMAGE} alt="웨딩 사진 시안 2" />
            <figcaption>love / 2027</figcaption>
          </figure>
          <figure className="diary__tile diary__tile--right">
            <img src={GALLERY_IMAGES[7]} alt="웨딩 사진 시안 3" />
            <figcaption>forever starts here</figcaption>
          </figure>
        </div>
        <div className="diary__footer">
          <span>
            {GROOM_FULLNAME} <i>&</i> {BRIDE_FULLNAME}
          </span>
          <span>
            {date}
            <br />
            {LOCATION}
          </span>
        </div>
      </header>
    )
  }

  return (
    <header className="showcase-hero showcase-hero--bluehour">
      <div className="bluehour__masthead">
        <span>WEDDING LETTER</span>
        <span>VOL. 01 / 2027</span>
      </div>
      <div className="bluehour__scene">
        <img src={GALLERY_IMAGES[8]} alt="신랑 신부의 웨딩 사진 시안" />
        <div className="bluehour__script">
          Our
          <br />
          <em>Wonderful</em>
          <br />
          Day
        </div>
        <span className="bluehour__corner">
          A DAY TO REMEMBER
          <br />
          FOREVER AND ALWAYS
        </span>
      </div>
      <div className="bluehour__date">
        <span>{date}</span>
        <span className="bluehour__spark">✳</span>
        <span>{time}</span>
      </div>
      <div className="bluehour__names">
        {GROOM_FULLNAME} <span>and</span> {BRIDE_FULLNAME}
      </div>
      <p className="bluehour__location">{LOCATION}</p>
    </header>
  )
}
