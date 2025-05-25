"use client"

import { useState, useEffect } from "react"
import {
    GitBranch,
    Wifi,
    WifiOff,
    CheckCircle,
    AlertCircle,
    Clock,
    Zap,
    Brain,
    FileText
} from "lucide-react"
import { cn } from "@/lib/utils/cn"

type Props = {
    className?: string
}

export function StatusBar({ className }: Props) {
    const [isOnline, setIsOnline] = useState(true)
    const [aiStatus, setAiStatus] = useState<'ready' | 'processing' | 'offline'>('ready')
    const [documentsCount, setDocumentsCount] = useState(3)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const getAiStatusIcon = () => {
        switch (aiStatus) {
            case 'ready':
                return <CheckCircle className="h-3 w-3 text-green-400" />
            case 'processing':
                return <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />
            case 'offline':
                return <AlertCircle className="h-3 w-3 text-red-400" />
        }
    }

    const getAiStatusText = () => {
        switch (aiStatus) {
            case 'ready':
                return 'AI Ready'
            case 'processing':
                return 'AI Processing...'
            case 'offline':
                return 'AI Offline'
        }
    }

    return (
        <div className={cn(
            "flex items-center justify-between h-6 px-3 bg-[#007acc] text-white text-xs border-t border-[#005a9e]",
            className
        )}>
            {/* Left side */}
            <div className="flex items-center gap-4">
                {/* Connection Status */}
                <div className="flex items-center gap-1">
                    {isOnline ? (
                        <Wifi className="h-3 w-3" />
                    ) : (
                        <WifiOff className="h-3 w-3" />
                    )}
                    <span>{isOnline ? 'Connected' : 'Offline'}</span>
                </div>

                {/* AI Status */}
                <div className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    {getAiStatusIcon()}
                    <span>{getAiStatusText()}</span>
                </div>

                {/* Document Count */}
                <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{documentsCount} documents</span>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Git Branch */}
                <div className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    <span>main</span>
                </div>

                {/* Current Time */}
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Version */}
                <div className="text-white/70">
                    ScholarAI v1.0.0
                </div>
            </div>
        </div>
    )
} 