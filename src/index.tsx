import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ModalProvider } from "./component/modal"
import { StoreProvider } from "./component/store"
import { AdminPage } from "./pages/AdminPage"
import { DesignCompare } from "./pages/DesignCompare"
import { ShowcaseInvitation } from "./pages/ShowcaseInvitation"
import { SHOWCASE_DESIGNS, type ShowcaseDesign } from "./showcaseDesigns"

const isAdminPage = window.location.pathname
  .replace(/\/$/, "")
  .endsWith("/admin")
const searchParams = new URLSearchParams(window.location.search)
// 시안은 로컬 개발 환경에서만 열고, 배포 사이트에서는 기본 청첩장을 표시합니다.
const previewsEnabled = import.meta.env.DEV
const isDesignCompare = previewsEnabled && searchParams.get("compare") === "1"
const design = previewsEnabled ? searchParams.get("design") : null
if (!previewsEnabled && (searchParams.has("compare") || searchParams.has("design"))) {
  const url = new URL(window.location.href)
  url.searchParams.delete("compare")
  url.searchParams.delete("design")
  if (url.hash.startsWith("#design-")) url.hash = ""
  window.history.replaceState(null, "", url)
}
const previewDesigns = [
  "paper",
  "cinema",
  "editorial",
  "aurora",
  "letter",
  "ivory",
  "ink",
  "rose-garden",
  "pink-editorial",
  "ribbon-note",
  "berry-noir",
  ...SHOWCASE_DESIGNS,
]

// 시안 URL에서만 디자인을 바꿉니다. 기본 청첩장 및 QR 주소는 그대로 유지됩니다.
if (
  !isAdminPage &&
  !isDesignCompare &&
  design &&
  previewDesigns.includes(design)
) {
  document.documentElement.dataset.design = design
}

// 애플리케이션의 루트 요소를 가져와서 렌더링을 시작합니다.
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    {/* 모달 상태 관리를 위한 Provider */}
    <ModalProvider>
      {/* 전역 상태 관리를 위한 Provider */}
      <StoreProvider>
        {isAdminPage ? (
          <AdminPage />
        ) : isDesignCompare ? (
          <DesignCompare />
        ) : design && SHOWCASE_DESIGNS.includes(design as ShowcaseDesign) ? (
          <ShowcaseInvitation design={design as ShowcaseDesign} />
        ) : (
          <App />
        )}
      </StoreProvider>
    </ModalProvider>
  </React.StrictMode>,
)
