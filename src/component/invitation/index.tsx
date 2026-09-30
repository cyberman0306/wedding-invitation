import { Fragment } from "react/jsx-runtime"
import {
  BRIDE_FULLNAME,
  BRIDE_INFO,
  BRIDE_FATHER,
  BRIDE_MOTHER,
  GROOM_FULLNAME,
  GROOM_INFO,
  GROOM_FATHER,
  GROOM_MOTHER,
  GROOM_TITLE,
  BRIDE_TITLE,
} from "../../const"
import { Modal } from "../modal"
import { Button } from "../button"
import { LazyDiv } from "../lazyDiv"
import PhoneIcon from "../../icons/phone-flip-icon.svg?react"
import EnvelopeIcon from "../../icons/envelope-icon.svg?react"
import { useState } from "react"

/**
 * 초대 메시지와 혼주 정보, 연락하기 기능을 제공하는 컴포넌트입니다.
 *
 * @returns {JSX.Element} 모시는 글 섹션
 */
export const Invitation = () => {
  const contactModalState = useState(false)
  return (
    <>
      <LazyDiv className="card invitation" observerRootMargin="0px 0px -25% 0px">
        <h2 className="english">Invitation</h2>

        <div className="break" />

        {/* 초대 문구 */}
        <div className="content">한 해를 여는 1월의 설렘으로</div>
        <div className="content">저희 두 사람이 하나가 되려 합니다.</div>
        <div className="break" />
        <div className="content">새해의 첫 소망처럼 간절한 마음으로</div>
        <div className="content">서로의 삶을 빛내며 살아가겠습니다.</div>
        <div className="break" />
        <div className="content">저희의 새로운 여정에</div>
        <div className="content">귀한 시간을 내어 주신다면</div>
        <div className="content">영원히 감사한 마음으로 간직하겠습니다.</div>

        <div className="break" />

        {/* 혼주 및 신랑 정보 */}
        <div className="name">
          {GROOM_FATHER} · {GROOM_MOTHER}
          <span className="relation">
            의 <span className="relation-name">{GROOM_TITLE}</span>
          </span>{" "}
          {GROOM_FULLNAME}
        </div>
        {/* 혼주 및 신부 정보 */}
        <div className="name">
          {BRIDE_FATHER} · {BRIDE_MOTHER}
          <span className="relation">
            의 <span className="relation-name">{BRIDE_TITLE}</span>
          </span>{" "}
          {BRIDE_FULLNAME}
        </div>

        <div className="break" />

        <Button
          onClick={() => {
            contactModalState[1](true)
          }}
        >
          연락하기
        </Button>
      </LazyDiv>

      {/* 연락처 정보 모달 */}
      <Modal
        modalState={contactModalState}
        className="contact-modal"
        closeOnClickBackground={true}
      >
        <div className="header">
          <div className="title-group">
            <div className="title">축하 인사 전하기</div>
            <div className="subtitle">
              전화, 문자메세지로 축하 인사를 전해보세요.
            </div>
          </div>
        </div>

        <div className="content">
          {/* 신랑측 연락처 */}
          <div className="contact-info">
            {GROOM_INFO.filter(({ phone }) => !!phone).map(
              ({ relation, name, phone }) => (
                <Fragment key={relation}>
                  <div className="relation">{relation}</div>
                  <div>{name}</div>
                  <div>
                    {/* 전화 걸기 */}
                    <PhoneIcon
                      className="flip icon"
                      onClick={() => {
                        window.open(`tel:${phone}`, "_self")
                      }}
                    />
                    {/* 문자 보내기 */}
                    <EnvelopeIcon
                      className="icon"
                      onClick={() => {
                        window.open(`sms:${phone}`, "_self")
                      }}
                    />
                  </div>
                </Fragment>
              ),
            )}
          </div>
          {/* 신부측 연락처 */}
          <div className="contact-info">
            {BRIDE_INFO.filter(({ phone }) => !!phone).map(
              ({ relation, name, phone }) => (
                <Fragment key={relation}>
                  <div className="relation">{relation}</div>
                  <div>{name}</div>
                  <div>
                    <PhoneIcon
                      className="flip icon"
                      onClick={() => {
                        window.open(`tel:${phone}`, "_self")
                      }}
                    />
                    <EnvelopeIcon
                      className="icon"
                      onClick={() => {
                        window.open(`sms:${phone}`, "_self")
                      }}
                    />
                  </div>
                </Fragment>
              ),
            )}
          </div>
        </div>
        <div className="footer">
          <Button
            buttonStyle="style2"
            className="bg-light-grey-color text-dark-color"
            onClick={() => contactModalState[1](false)}
          >
            닫기
          </Button>
        </div>
      </Modal>
    </>
  )
}
