"use client";
import { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";
import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import ProfileMenu from "@/components/ProfileMenu";
import { LayoutControls } from "./_components/sidebar/layout-controls";
import { SearchDialog } from "./_components/sidebar/search-dialog";
import { ThemeSwitcher } from "./_components/sidebar/theme-switcher";
import { Toaster } from 'sonner'
import { ChatBot } from '@/components/chatbot'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar variant="inset" collapsible="icon" />
        <SidebarInset
          data-content-layout="centered"
          className={cn(
            "data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl",
            "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto",
          )}
        >
          <header className="flex h-12 shrink-0 items-center gap-2 border-b">
            <div className="flex w-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-1 lg:gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                <SearchDialog />
              </div>
              <div className="flex items-center gap-2">
                <LayoutControls />
                <ThemeSwitcher themeMode="light" />
                <ProfileMenu />
              </div>
            </div>
          </header>
          <div className="h-full p-4 md:p-6">{children}</div>
        </SidebarInset>
        
        {/* Gelişmiş N8N ChatBot */}
        <ChatBot 
          webhookUrl={process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/0ea9790e-2e24-44d1-b435-3c6e9c31e5cb/chat'}
          webhookConfig={{
            method: 'POST',
            headers: {
              'Accept': 'application/json',
            }
          }}
          mode="window"
          showWelcomeScreen={false}
          chatInputKey="chatInput"
          chatSessionKey="sessionId"
          loadPreviousSession={true}
          defaultLanguage="tr"
          initialMessages={[
            "Merhaba! Ben AI asistanınızım.",
            "Dashboard'da size nasıl yardımcı olabilirim?"
          ]}
          allowFileUploads={true}
          allowedFilesMimeTypes="image/*,application/pdf,text/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          userId="Cuneyt"
        />
        <Toaster />
      </SidebarProvider>
    </AuthGuard>
  );
}