import { Outlet } from "react-router-dom";
import Nav from "@/components/Nav";
import { TodosProvider } from "@/context/TodosContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { C, ff } from "@/styles/tokens";

/** 모든 페이지 공통 레이아웃: 상단 Nav + 본문(Outlet) */
export default function AppLayout() {
  return (
    <TodosProvider>
      <SidebarProvider>
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: C.pageBg, fontFamily: ff }}>
          <Nav />
          <Outlet />
        </div>
      </SidebarProvider>
    </TodosProvider>
  );
}
