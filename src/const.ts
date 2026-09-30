import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/ko"

// dayjs 설정: UTC 및 타임존 플러그인 확장, 한국어 로캘 설정
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("ko")

export { dayjs }

/**
 * 예식 일시 설정
 * Asia/Seoul 타임존 기준으로 설정합니다.
 */
export const WEDDING_DATE = dayjs.tz("2027-01-16 15:40", "Asia/Seoul")

/**
 * 예식 일시 포맷
 * 분이 0이면 분을 생략하고, 그 외에는 표시합니다.
 * 예: 2024년 8월 24일 토요일 오후 1시
 */
export const WEDDING_DATE_FORMAT = `YYYY년 MMMM D일 dddd A h시${WEDDING_DATE.minute() === 0 ? "" : " m분"}`

/**
 * 예식 당월 휴무일 (달력 표시용)
 * 예: 8월 15일 광복절
 */
export const HOLIDAYS: number[] = []

/**
 * 예식 장소 명칭
 */
export const LOCATION = "카리스호텔 15층 벨라지오 가든홀"

/**
 * 예식 장소 상세 주소
 */
export const LOCATION_ROAD_ADDRESS = "인천 계양구 계양대로 28"
export const LOCATION_PARCEL_ADDRESS = "인천 계양구 작전동 428-2"
export const LOCATION_ADDRESS =
  `${LOCATION_ROAD_ADDRESS} (${LOCATION_PARCEL_ADDRESS})`

/**
 * 카카오톡 공유 시 사용할 위치 정보 주소
 * 필요에 따라 LOCATION과 다르게 설정할 수 있습니다.
 */
export const SHARE_ADDRESS = LOCATION_ROAD_ADDRESS

/**
 * 카카오톡 공유 시 표시될 위치 제목
 */
export const SHARE_ADDRESS_TITLE = LOCATION

/**
 * 축하 화환 주문 안내에 사용할 외부 상품 페이지
 */
export const WREATH_ORDER_URL =
  "https://smartstore.naver.com/honeyflowershop/products/4865184709"

/**
 * 지도 서비스(네이버, 카카오)에 사용할 좌표 [경도, 위도]
 */
export const WEDDING_HALL_POSITION = [126.72258238031, 37.526303002436]

// 신부 정보 설정
export const BRIDE_FULLNAME = "홍혜선"
export const BRIDE_FIRSTNAME = "혜선"
export const BRIDE_TITLE = "장녀"
export const BRIDE_FATHER = "홍준호"
export const BRIDE_MOTHER = "김삼숙"

/**
 * 신부측 연락처 및 계좌 정보
 */
export const BRIDE_INFO = [
  {
    relation: "신부",
    name: BRIDE_FULLNAME,
    phone: "010-9441-4281",
    account: "카카오뱅크 3333-17-8440114",
  },
  {
    relation: "신부 아버지",
    name: BRIDE_FATHER,
    phone: "010-4021-5381",
    account: "기업은행 566-010-862-01-011",
  },
  {
    relation: "신부 어머니",
    name: BRIDE_MOTHER,
    phone: "010-5658-3015",
    account: "신한은행 110-327-117920",
  },
]

// 신랑 정보 설정
export const GROOM_FULLNAME = "이재훈"
export const GROOM_FIRSTNAME = "재훈"
export const GROOM_TITLE = "장남"
export const GROOM_FATHER = "이관희"
export const GROOM_MOTHER = "오은숙"

/**
 * 신랑측 연락처 및 계좌 정보
 */
export const GROOM_INFO = [
  {
    relation: "신랑",
    name: GROOM_FULLNAME,
    phone: "010-9148-3042",
    account: "토스뱅크 1000-0830-4760",
  },
  {
    relation: "신랑 아버지",
    name: GROOM_FATHER,
    phone: "010-9761-6961",
    account: "농협은행 115-12-021110",
  },
  {
    relation: "신랑 어머니",
    name: GROOM_MOTHER,
    phone: "010-6345-6961",
    account: "NH농협 115-12-157526",
  },
]
