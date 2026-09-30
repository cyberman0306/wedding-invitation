import { BGEffect } from "../component/bgEffect"
import { Calendar } from "../component/calendar"
import { Gallery } from "../component/gallery"
import { GuestBook } from "../component/guestbook"
import { Information } from "../component/information"
import { Invitation } from "../component/invitation"
import { Location } from "../component/location"
import { MusicPlayer } from "../component/musicPlayer"
import { ShareButton } from "../component/shareButton"
import { ShowcaseHero } from "../component/showcaseHero"
import type { ShowcaseDesign } from "../showcaseDesigns"

/** 새로운 표지와 편집형 본문에 기존 청첩장 기능을 연결합니다. */
export const ShowcaseInvitation = ({ design }: { design: ShowcaseDesign }) => (
  <div className={`showcase showcase--${design}`}>
    {design !== "afterglow" && <BGEffect />}
    <MusicPlayer />
    <main className="showcase__page">
      <ShowcaseHero design={design} />
      <div className="showcase__body">
        <div className="showcase__chapter-index">
          01 <span>THE INVITATION</span>
        </div>
        <Invitation />
        <div className="showcase__chapter-index">
          02 <span>THE DAY</span>
        </div>
        <Calendar />
        <Gallery />
        <div className="showcase__chapter-index">
          03 <span>THE PLACE</span>
        </div>
        <Location />
        <div className="showcase__chapter-index">
          04 <span>WITH LOVE</span>
        </div>
        <Information />
        <GuestBook />
        <ShareButton />
      </div>
    </main>
  </div>
)
