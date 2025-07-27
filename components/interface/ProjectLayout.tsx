"use client"

import React, { useState } from "react"
import { ProjectSidebar } from "./ProjectSidebar"
import { ChatPanel } from "@/components/layout/ChatPanel"
import { cn } from "@/lib/utils/cn"
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"

type Props = {
    children: React.ReactNode
    projectId: string
}

export function ProjectLayout({ children, projectId }: Props) {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const isMobile = useIsMobile()
    const isTablet = useIsTablet()

    // Auto-collapse sidebar on mobile/tablet
    const shouldCollapseSidebar = isMobile || isTablet

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Project-specific Sidebar - Hidden on mobile, collapsible on tablet */}
            {!isMobile && (
                <ProjectSidebar
                    projectId={projectId}
                    collapsed={shouldCollapseSidebar ? true : sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={cn(
                        "transition-all duration-300",
                        shouldCollapseSidebar && "w-16",
                        !shouldCollapseSidebar && sidebarCollapsed && "w-16",
                        !shouldCollapseSidebar && !sidebarCollapsed && "w-72"
                    )}
                />
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            {isMobile && (
                <div className={cn(
                    "fixed left-0 top-0 h-full z-50 transition-transform duration-300 lg:hidden",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <ProjectSidebar
                        projectId={projectId}
                        collapsed={false}
                        onToggle={() => setSidebarOpen(false)}
                        className="w-72"
                    />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </div>

            {/* Chat Panel - Full screen on mobile, side panel on larger screens */}
            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                isMobile={isMobile}
            />
        </div>
    )
} 