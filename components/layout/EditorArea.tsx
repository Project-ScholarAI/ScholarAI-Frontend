"use client"

import type React from "react"
import { useState } from "react"
import {
    MessageSquare,
    X,
    Plus,
    ChevronDown,
    FileText,
    File,
    Image,
    Code,
    Search,
    Settings,
    Command
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { WelcomeScreen } from "@/components/layout/WelcomeScreen"

type Tab = {
    id: string
    name: string
    type: 'pdf' | 'doc' | 'md' | 'txt' | 'code'
    path: string
    isActive: boolean
    isDirty: boolean
}

type Props = {
    children: React.ReactNode
    onChatToggle: () => void
}

const getFileIcon = (type: Tab['type']) => {
    switch (type) {
        case 'pdf':
            return <FileText className="h-4 w-4 text-red-400" />
        case 'doc':
            return <File className="h-4 w-4 text-blue-400" />
        case 'md':
            return <FileText className="h-4 w-4 text-green-400" />
        case 'code':
            return <Code className="h-4 w-4 text-yellow-400" />
        default:
            return <File className="h-4 w-4 text-gray-400" />
    }
}

export function EditorArea({ children, onChatToggle }: Props) {
    const [tabs, setTabs] = useState<Tab[]>([])

    const closeTab = (tabId: string) => {
        setTabs(tabs.filter(tab => tab.id !== tabId))
    }

    const setActiveTab = (tabId: string) => {
        setTabs(tabs.map(tab => ({ ...tab, isActive: tab.id === tabId })))
    }

    const addSampleTabs = () => {
        setTabs([
            {
                id: '1',
                name: 'Research Paper.pdf',
                type: 'pdf',
                path: '/documents/research-paper.pdf',
                isActive: true,
                isDirty: false
            },
            {
                id: '2',
                name: 'Notes.md',
                type: 'md',
                path: '/documents/notes.md',
                isActive: false,
                isDirty: true
            },
            {
                id: '3',
                name: 'Analysis.doc',
                type: 'doc',
                path: '/documents/analysis.doc',
                isActive: false,
                isDirty: false
            }
        ])
    }

    // Show welcome screen if no tabs are open
    if (tabs.length === 0) {
        return (
            <div className="flex flex-col h-full bg-[#1e1e1e]">
                {/* Top Toolbar */}
                <div className="flex items-center justify-between h-12 px-4 bg-[#2d2d30] border-b border-[#3e3e42]">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]">
                            <Command className="h-4 w-4 mr-1" />
                            <span className="text-xs">Cmd+P</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]">
                            <Search className="h-4 w-4 mr-1" />
                            <span className="text-xs">Search</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]"
                            onClick={addSampleTabs}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="text-xs">Open Sample</span>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]"
                            onClick={onChatToggle}
                        >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span className="text-xs">Chat</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Welcome Screen */}
                <WelcomeScreen />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between h-12 px-4 bg-[#2d2d30] border-b border-[#3e3e42]">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]">
                        <Command className="h-4 w-4 mr-1" />
                        <span className="text-xs">Cmd+P</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]">
                        <Search className="h-4 w-4 mr-1" />
                        <span className="text-xs">Search</span>
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]"
                        onClick={onChatToggle}
                    >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-xs">Chat</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-300 hover:bg-[#3e3e42]">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center bg-[#252526] border-b border-[#3e3e42] min-h-[35px]">
                <div className="flex items-center flex-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 border-r border-[#3e3e42] cursor-pointer group min-w-0 max-w-[200px]",
                                tab.isActive
                                    ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]"
                                    : "bg-[#252526] text-gray-300 hover:bg-[#2d2d30]"
                            )}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {getFileIcon(tab.type)}
                            <span className="text-sm truncate flex-1">
                                {tab.name}
                                {tab.isDirty && <span className="text-orange-400 ml-1">●</span>}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-[#3e3e42] rounded-sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    closeTab(tab.id)
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 ml-2 text-gray-400 hover:bg-[#3e3e42] hover:text-white"
                        onClick={addSampleTabs}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 bg-[#1e1e1e] overflow-hidden">
                {children}
            </div>
        </div>
    )
} 