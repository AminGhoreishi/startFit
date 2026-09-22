import { Suspense } from "react";
import { SidebarProvider } from "@/components/layout/admin/SidebarContext";
import AdminSidebar from "@/components/layout/admin/AdminSidebar";
import MainWrapper from "@/components/layout/admin/MainWrapper";
import AdminHeaderContainer from "@/components/layout/admin/AdminHeaderContainer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-neutral-950 overflow-x-hidden overflow-y-hidden" dir="rtl">
        <MainWrapper>
          <Suspense fallback={null}>
            <AdminHeaderContainer />
          </Suspense>
          <Suspense fallback={null}>{children}</Suspense>
        </MainWrapper>
        <Suspense fallback={null}>
          <AdminSidebar />
        </Suspense>
      </div>
    </SidebarProvider>
  );
}
