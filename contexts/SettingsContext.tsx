"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SettingsState {
    // Theme & Appearance
    theme: 'light' | 'dark'
    colorScheme: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
    layoutDensity: 'compact' | 'comfortable' | 'spacious'

    // UI Preferences
    sidebarCollapsed: boolean
    showBreadcrumbs: boolean
    showTooltips: boolean
    autoSave: boolean

    // Performance
    enableAnimations: boolean
    enableHoverEffects: boolean
    enableGlowEffects: boolean
    enableParticles: boolean

    // Accessibility
    highContrast: boolean
    largeText: boolean
    focusIndicators: boolean

    // Notifications
    soundEnabled: boolean
    desktopNotifications: boolean
    emailNotifications: boolean

    // Data & Privacy
    analyticsEnabled: boolean
    crashReporting: boolean
    telemetryEnabled: boolean
}

const defaultSettings: SettingsState = {
    theme: 'dark',
    colorScheme: 'blue',
    layoutDensity: 'comfortable',
    sidebarCollapsed: false,
    showBreadcrumbs: true,
    showTooltips: true,
    autoSave: true,
    enableAnimations: true,
    enableHoverEffects: true,
    enableGlowEffects: true,
    enableParticles: true,
    highContrast: false,
    largeText: false,
    focusIndicators: true,
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    analyticsEnabled: true,
    crashReporting: true,
    telemetryEnabled: false
}

interface SettingsContextType {
    settings: SettingsState
    updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
    resetSettings: () => void
    saveSettings: () => void
    hasUnsavedChanges: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SettingsState>(defaultSettings)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Load settings from localStorage on mount
    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedSettings = localStorage.getItem('scholarai-settings')
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings)
                    setSettings({ ...defaultSettings, ...parsed })
                }
            } catch (error) {
                console.error('Error loading settings:', error)
            }
        }
        loadSettings()
    }, [])

    // Apply settings to DOM
    useEffect(() => {
        const root = document.documentElement

        // Apply theme
        root.setAttribute('data-theme', settings.theme)

        // Apply color scheme
        root.setAttribute('data-color-scheme', settings.colorScheme)

        // Apply layout density
        root.setAttribute('data-density', settings.layoutDensity)

        // Apply accessibility settings
        if (settings.highContrast) {
            root.classList.add('high-contrast')
        } else {
            root.classList.remove('high-contrast')
        }

        if (settings.largeText) {
            root.classList.add('large-text')
        } else {
            root.classList.remove('large-text')
        }

        // Apply performance settings
        if (!settings.enableAnimations) {
            root.classList.add('no-animations')
        } else {
            root.classList.remove('no-animations')
        }

        if (!settings.enableGlowEffects) {
            root.classList.add('no-glow')
        } else {
            root.classList.remove('no-glow')
        }

        if (!settings.enableParticles) {
            root.classList.add('no-particles')
        } else {
            root.classList.remove('no-particles')
        }
    }, [settings])



    const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setHasUnsavedChanges(true)

        // Apply settings immediately for performance-related settings
        if (key === 'enableGlowEffects' || key === 'enableAnimations' || key === 'enableParticles') {
            const root = document.documentElement

            if (key === 'enableGlowEffects') {
                if (!value) {
                    root.classList.add('no-glow')
                } else {
                    root.classList.remove('no-glow')
                }
            } else if (key === 'enableAnimations') {
                if (!value) {
                    root.classList.add('no-animations')
                } else {
                    root.classList.remove('no-animations')
                }
            } else if (key === 'enableParticles') {
                if (!value) {
                    root.classList.add('no-particles')
                } else {
                    root.classList.remove('no-particles')
                }
            }
        }
    }

    const saveSettings = () => {
        try {
            localStorage.setItem('scholarai-settings', JSON.stringify(settings))
            setHasUnsavedChanges(false)
        } catch (error) {
            console.error('Error saving settings:', error)
        }
    }

    const resetSettings = () => {
        setSettings(defaultSettings)
        setHasUnsavedChanges(true)
    }

    const value: SettingsContextType = {
        settings,
        updateSetting,
        resetSettings,
        saveSettings,
        hasUnsavedChanges
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
} 