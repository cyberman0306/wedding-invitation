import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ModalProvider } from "./component/modal"
import { StoreProvider } from "./component/store"
import { AdminPage } from "./pages/AdminPage"
import { DesignCompare } from "./pages/DesignCompare"

const isAdminPage = window.location.pathname
  .replace(/\/$/, "")
  .endsWith("/admin")
const searchParams = new URLSearchParams(window.location.search)
const isDesignCompare = searchParams.get("compare") === "1"
const design = searchParams.get("design")

// 시안 URL에서만 디자인을 바꿉니다. 기본 청첩장 및 QR 주소는 그대로 유지됩니다.
if (
  !isAdminPage &&
  !isDesignCompare &&
  (design === "ivory" || design === "ink")
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
        ) : (
          <App />
        )}
      </StoreProvider>
    </ModalProvider>
  </React.StrictMode>,
)
