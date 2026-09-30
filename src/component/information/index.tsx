import { useState } from "react"
import { BRIDE_INFO, GROOM_INFO, WREATH_ORDER_URL } from "../../const"
import { STATIC_ONLY } from "../../env"
import { Button } from "../button"
import { LazyDiv } from "../lazyDiv"
import { Modal } from "../modal"
import { AttendanceInfo } from "./attendance"

/**
 * 축의금 계좌번호 안내 컴포넌트입니다.
 * 신랑측, 신부측 계좌번호를 모달로 보여줍니다.
 */
export const Information2 = () => {
  const donationModalState = useState(false)
  const [isGroom, setIsGroom] = useState(true)

  return (
    <>
      <div className="info-card">
        <div className="label">마음 전하기</div>
        <div className="content">
          참석이 어려워 직접 축하해주지 못하는
          <br />
          분들을 위해 계좌번호를 기재하였습니다.
          <br />
          넓은 마음으로 양해 부탁드립니다.
        </div>

        <div className="break" />

        <Button
          style={{ width: "100%" }}
          onClick={() => {
            donationModalState[1](true)
            setIsGroom(true)
          }}
        >
          신랑측 계좌번호 보기
        </Button>
        <div className="break" />
        <Button
          style={{ width: "100%" }}
          onClick={() => {
            donationModalState[1](true)
            setIsGroom(false)
          }}
        >
          신부측 계좌번호 보기
        </Button>
      </div>

      {/* 계좌 정보 모달 */}
      <Modal
        modalState={donationModalState}
        className="donation-modal"
        closeOnClickBackground={true}
      >
        <div className="header">
          <div className="title">
            {isGroom ? "신랑측 계좌번호" : "신부측 계좌번호"}
          </div>
        </div>
        <div className="content">
          {(isGroom ? GROOM_INFO : BRIDE_INFO)
            .filter(({ account }) => !!account)
            .map(({ relation, name, account }) => (
              <div className="account-info" key={relation}>
                <div>
                  <div className="name">
                    <span className="relation">{relation}</span> {name}
                  </div>
                  <div>{account}</div>
                </div>
                <Button
                  className="copy-button"
                  onClick={async () => {
                    if (account) {
                      try {
                        // 계좌번호 복사 기능
                        await navigator.clipboard.writeText(account)
                        alert(account + "\n복사되었습니다.")
                      } catch {
                        alert("복사에 실패했습니다.")
                      }
                    }
                  }}
                >
                  복사하기
                </Button>
              </div>
            ))}
        </div>
        <div className="footer">
          <Button
            buttonStyle="style2"
            className="bg-light-grey-color text-dark-color"
            onClick={() => donationModalState[1](false)}
          >
            닫기
          </Button>
        </div>
      </Modal>
    </>
  )
}

/** 축하 화환을 보내고 싶은 하객에게 외부 주문 페이지를 안내합니다. */
const WreathInfo = () => (
  <div className="info-card wreath-card">
    <div className="label">축하 화환</div>
    <div className="content">
      꽃으로 축하의 마음을 전하고 싶으신 분께
      <br />
      화환 주문 페이지를 안내드립니다.
    </div>
    <div className="break" />
    <a
      className="wreath-link"
      href={WREATH_ORDER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="축하 화환 보내기, 네이버 스마트스토어 새 창에서 열기"
    >
      축하 화환 보내기 <span aria-hidden="true">↗</span>
    </a>
    <p className="wreath-note">
      네이버 스마트스토어로 이동합니다.
      <br />
      주문 시 결혼식용 화환과 배송지를 확인해 주세요.
    </p>
  </div>
)

/**
 * 정보 안내(축의금, 화환, 참석의사)를 통합하여 표시하는 컴포넌트입니다.
 *
 * @returns {JSX.Element} 정보 안내 섹션
 */
export const Information = () => {
  return (
    <LazyDiv className="card information">
      <h2 className="english">Information</h2>
      <Information2 />
      <WreathInfo />
      {/* 정적 보관 모드에서는 참석 의사 전달 기능을 제외합니다. */}
      {!STATIC_ONLY && <AttendanceInfo />}
    </LazyDiv>
  )
}
