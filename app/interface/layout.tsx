'use client'

import { usePathname } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { SettingsProvider } from '@/contexts/SettingsContext'

export default function InterfaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isProjectRoute = pathname.includes('/projects/')

    return (
        <SettingsProvider>
            <ProtectedRoute>
                {isProjectRoute ? (
                    children
                ) : (
                    <MainLayout>
                        {children}
                    </MainLayout>
                )}
            </ProtectedRoute>
        </SettingsProvider>
    )
} 