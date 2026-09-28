import { Map } from "./map"
import CarIcon from "../../icons/car-icon.svg?react"
import BusIcon from "../../icons/bus-icon.svg?react"
import { LazyDiv } from "../lazyDiv"
import { LOCATION, LOCATION_ADDRESS } from "../../const"

/**
 * 오시는 길 정보를 표시하는 컴포넌트입니다.
 * 지도와 대중교통, 자가용 이용 방법을 안내합니다.
 *
 * @returns {JSX.Element} 오시는 길 섹션
 */
export const Location = () => {
  return (
    <>
      {/* 지도 및 주소 섹션 */}
      <LazyDiv className="card location">
        <h2 className="english">Location</h2>
        <div className="addr">
          {LOCATION}
          <div className="detail">{LOCATION_ADDRESS}</div>
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
          </div>
        </div>
      </LazyDiv>
    </>
  )
}
