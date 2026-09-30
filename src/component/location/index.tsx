import { useEffect, useRef, useState } from "react"
import { Map } from "./map"
import CarIcon from "../../icons/car-icon.svg?react"
import BusIcon from "../../icons/bus-icon.svg?react"
import { LazyDiv } from "../lazyDiv"
import {
  LOCATION,
  LOCATION_PARCEL_ADDRESS,
  LOCATION_ROAD_ADDRESS,
} from "../../const"

/**
 * 오시는 길 정보를 표시하는 컴포넌트입니다.
 * 지도와 대중교통, 자가용 이용 방법을 안내합니다.
 *
 * @returns {JSX.Element} 오시는 길 섹션
 */
export const Location = () => {
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copying" | "copied" | "failed"
  >("idle")
  const addressRef = useRef<HTMLSpanElement>(null)
  const statusTimeout = useRef<number | null>(null)
  const clipboardTimeout = useRef<number | null>(null)
  const copyAttempt = useRef(0)

  useEffect(
    () => () => {
      if (statusTimeout.current !== null) clearTimeout(statusTimeout.current)
      if (clipboardTimeout.current !== null) clearTimeout(clipboardTimeout.current)
    },
    [],
  )

  /** Clipboard API를 사용할 수 없는 모바일 브라우저에서 선택 영역을 복사합니다. */
  const copySelectedAddress = () => {
    const address = addressRef.current
    const selection = window.getSelection()
    if (!address || !selection) return false

    const range = document.createRange()
    range.selectNodeContents(address)
    selection.removeAllRanges()
    selection.addRange(range)

    let copied = false
    try {
      copied = document.execCommand("copy")
    } catch {
      // 복사가 막힌 경우 선택 영역을 유지해 방문자가 직접 복사할 수 있게 합니다.
    }

    if (copied) selection.removeAllRanges()
    return copied
  }

  /** 도로명 주소를 복사하고 결과를 화면에 알립니다. */
  const copyAddress = () => {
    const attempt = ++copyAttempt.current
    if (statusTimeout.current !== null) clearTimeout(statusTimeout.current)
    if (clipboardTimeout.current !== null) clearTimeout(clipboardTimeout.current)
    setCopyStatus("copying")

    const finish = (copied: boolean) => {
      if (attempt !== copyAttempt.current) return
      setCopyStatus(copied ? "copied" : "failed")
      if (copied) {
        statusTimeout.current = window.setTimeout(() => {
          if (attempt === copyAttempt.current) setCopyStatus("idle")
        }, 3000)
      }
    }

    if (!navigator.clipboard?.writeText) {
      finish(copySelectedAddress())
      return
    }

    // 응답이 멈춘 브라우저에서도 방문자가 직접 주소를 복사할 수 있게 안내합니다.
    clipboardTimeout.current = window.setTimeout(() => {
      clipboardTimeout.current = null
      if (attempt !== copyAttempt.current) return
      copySelectedAddress()
      finish(false)
    }, 4000)

    try {
      // 사용자 터치 이벤트 안에서 바로 호출해야 iOS Safari의 복사 권한이 유지됩니다.
      navigator.clipboard.writeText(LOCATION_ROAD_ADDRESS).then(
        () => {
          if (clipboardTimeout.current === null || attempt !== copyAttempt.current)
            return
          clearTimeout(clipboardTimeout.current)
          clipboardTimeout.current = null
          finish(true)
        },
        () => {
          if (clipboardTimeout.current === null || attempt !== copyAttempt.current)
            return
          clearTimeout(clipboardTimeout.current)
          clipboardTimeout.current = null
          finish(copySelectedAddress())
        },
      )
    } catch {
      if (clipboardTimeout.current !== null) clearTimeout(clipboardTimeout.current)
      clipboardTimeout.current = null
      finish(copySelectedAddress())
    }
  }

  return (
    <>
      {/* 지도 및 주소 섹션 */}
      <LazyDiv className="card location">
        <h2 className="english">Location</h2>
        <div className="addr">
          <div className="venue-name">{LOCATION}</div>
          <div className="detail">
            <span className="road-address" ref={addressRef}>
              {LOCATION_ROAD_ADDRESS}
            </span>
            <span className="parcel-address">({LOCATION_PARCEL_ADDRESS})</span>
          </div>
          <button
            type="button"
            className="copy-address"
            onClick={copyAddress}
            aria-label={
              copyStatus === "copied" ? "도로명 주소 복사 완료" : "도로명 주소 복사"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="8" y="8" width="11" height="11" rx="1.5" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
            {copyStatus === "copied"
              ? "복사 완료"
              : copyStatus === "failed"
                ? "다시 복사"
                : "도로명 주소 복사"}
          </button>
          <span className="copy-status" role="status" aria-live="polite">
            {copyStatus === "copying" && "주소를 복사하는 중입니다…"}
            {copyStatus === "copied" && "도로명 주소가 복사되었습니다."}
            {copyStatus === "failed" &&
              "자동 복사가 확인되지 않았습니다. 위 주소를 길게 눌러 복사해 주세요."}
          </span>
        </div>
        <Map />
      </LazyDiv>

      {/* 대중교통 및 자가용 안내 섹션 */}
      <LazyDiv className="card location">
        {/* 대중교통 안내 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <BusIcon className="transportation-icon" />
          </div>
          <div className="heading">대중교통</div>
          <div />
          <div className="content">
            * 지하철
            <br />
            인천 지하철 <b>작전역 4번 출구</b> 하차
            <br />
            → 도보 5분
            <br />1호선 부평역 / 7호선 부평구청역에서
            <br />인천지하철 계양·귤현 방향으로 환승
          </div>
          <div />
          <div className="content">
            * 버스
            <br />
            - 시외버스: 부천 88, 김포 90
            <br />
            - 시내버스: 30, 86
            <br />
            - 광역버스: 5000, 1500, 9500
            <br />
            - 마을버스: 583, 584-1, 588, 590, 585
          </div>
        </div>

        {/* 자가용 안내 */}
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <CarIcon className="transportation-icon" />
          </div>
          <div className="heading">자가용</div>
          <div />
          <div className="content">
            경인고속도로 → 부평 I.C에서 우회전 50m
            <br />
            내비게이션에서 <b>카리스호텔</b>을 검색해 주세요.
            <div className="parking-guide">
              <div className="subheading">주차 안내</div>
              웨딩홀 주차장과 계산중앙교회 주차장(무료) 또는 홈플러스
              작전점 주차장(2시간 무료)을 이용하실 수 있습니다.
            </div>
          </div>
        </div>
      </LazyDiv>
    </>
  )
}
