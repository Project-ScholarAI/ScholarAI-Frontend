"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { ChatPanel } from "@/components/layout/ChatPanel"

type Props = {
  children: React.ReactNode
}

export function MainLayout({ children }: Props) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar onChatToggle={() => setIsChatOpen(!isChatOpen)} />
        <main className="flex-1 overflow-auto">{children}</main>
        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  )
}
