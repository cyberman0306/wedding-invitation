import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ModalProvider } from "./component/modal"
import { StoreProvider } from "./component/store"
import { AdminPage } from "./pages/AdminPage"

const isAdminPage = window.location.pathname.replace(/\/$/, "").endsWith("/admin")

// 애플리케이션의 루트 요소를 가져와서 렌더링을 시작합니다.
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    {/* 모달 상태 관리를 위한 Provider */}
    <ModalProvider>
      {/* 전역 상태 관리를 위한 Provider */}
      <StoreProvider>
        {isAdminPage ? <AdminPage /> : <App />}
      </StoreProvider>
    </ModalProvider>
  </React.StrictMode>,
)
