"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Settings,
    Palette,
    Monitor,
    Zap,
    Eye,
    MousePointer,
    Clock,
    Sun,
    Moon,
    Monitor as MonitorIcon,
    Smartphone,
    Tablet,
    Palette as PaletteIcon,
    Eye as EyeIcon,
    Volume2,
    VolumeX,
    RotateCcw,
    Save,
    CheckCircle,
    AlertCircle,
    Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "@/contexts/SettingsContext"

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

export default function SettingsPage() {
    const { settings, updateSetting, resetSettings, saveSettings, hasUnsavedChanges } = useSettings()
    const { toast } = useToast()

    const handleSaveSettings = () => {
        saveSettings()
        toast({
            title: "Settings saved",
            description: "Your preferences have been saved successfully.",
        })
    }

    const handleResetSettings = () => {
        resetSettings()
        toast({
            title: "Settings reset",
            description: "Settings have been reset to defaults.",
        })
    }



    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 container mx-auto px-6 py-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient-primary flex items-center gap-3">
                                <Settings className="h-8 w-8 text-primary" />
                                Settings
                                <div
                                    className="w-4 h-4 rounded-full border border-primary/30 ml-2"
                                    style={{
                                        backgroundColor: {
                                            blue: 'hsl(221.2 83.2% 53.3%)',
                                            purple: 'hsl(262.1 83.3% 57.8%)',
                                            green: 'hsl(142.1 76.2% 36.3%)',
                                            orange: 'hsl(24.6 95% 53.1%)',
                                            pink: 'hsl(346.8 77.2% 49.8%)'
                                        }[settings.colorScheme]
                                    }}
                                />
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Customize your ScholarAI experience
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleResetSettings}
                                className="bg-background/40 backdrop-blur-xl border-primary/20"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button
                                onClick={handleSaveSettings}
                                disabled={!hasUnsavedChanges}
                                className="gradient-primary-to-accent hover:gradient-accent text-white"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Tabs defaultValue="appearance" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5 bg-background/40 backdrop-blur-xl border border-primary/10">
                            <TabsTrigger value="appearance" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                <span className="hidden sm:inline">Appearance</span>
                            </TabsTrigger>
                            <TabsTrigger value="interface" className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                <span className="hidden sm:inline">Interface</span>
                            </TabsTrigger>
                            <TabsTrigger value="performance" className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                <span className="hidden sm:inline">Performance</span>
                            </TabsTrigger>
                            <TabsTrigger value="accessibility" className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Accessibility</span>
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Notifications</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Appearance Settings */}
                        <TabsContent value="appearance" className="space-y-6">
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PaletteIcon className="h-5 w-5 text-primary" />
                                        Theme & Colors
                                    </CardTitle>
                                    <CardDescription>
                                        Customize the visual appearance of ScholarAI
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Theme</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Choose your preferred color theme
                                                </p>
                                            </div>
                                            <Select value={settings.theme} onValueChange={(value: 'light' | 'dark') => updateSetting('theme', value)}>
                                                <SelectTrigger className="w-48">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">
                                                        <div className="flex items-center gap-2">
                                                            <Sun className="h-4 w-4" />
                                                            Light
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="dark">
                                                        <div className="flex items-center gap-2">
                                                            <Moon className="h-4 w-4" />
                                                            Dark
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Color Scheme</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Choose your accent color
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground">Current:</span>
                                                    <div
                                                        className="w-3 h-3 rounded-full border border-primary/20"
                                                        style={{
                                                            backgroundColor: {
                                                                blue: 'hsl(221.2 83.2% 53.3%)',
                                                                purple: 'hsl(262.1 83.3% 57.8%)',
                                                                green: 'hsl(142.1 76.2% 36.3%)',
                                                                orange: 'hsl(24.6 95% 53.1%)',
                                                                pink: 'hsl(346.8 77.2% 49.8%)'
                                                            }[settings.colorScheme]
                                                        }}
                                                    />
                                                    <span className="text-xs font-medium capitalize">{settings.colorScheme}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {[
                                                    { name: 'blue', color: 'hsl(221.2 83.2% 53.3%)' },
                                                    { name: 'purple', color: 'hsl(262.1 83.3% 57.8%)' },
                                                    { name: 'green', color: 'hsl(142.1 76.2% 36.3%)' },
                                                    { name: 'orange', color: 'hsl(24.6 95% 53.1%)' },
                                                    { name: 'pink', color: 'hsl(346.8 77.2% 49.8%)' }
                                                ].map(({ name, color }) => (
                                                    <button
                                                        key={name}
                                                        onClick={() => updateSetting('colorScheme', name as any)}
                                                        className={`w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-110 ${settings.colorScheme === name
                                                            ? 'border-white shadow-lg scale-110 ring-2 ring-primary/30'
                                                            : 'border-transparent hover:border-white/50 hover:shadow-md'
                                                            }`}
                                                        style={{
                                                            backgroundColor: color
                                                        }}
                                                        title={`${name.charAt(0).toUpperCase() + name.slice(1)} color scheme`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Layout Density</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Adjust spacing and sizing
                                                </p>
                                            </div>
                                            <Select value={settings.layoutDensity} onValueChange={(value: 'compact' | 'comfortable' | 'spacious') => updateSetting('layoutDensity', value)}>
                                                <SelectTrigger className="w-48">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="compact">Compact</SelectItem>
                                                    <SelectItem value="comfortable">Comfortable</SelectItem>
                                                    <SelectItem value="spacious">Spacious</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-primary" />
                                        Animations & Effects
                                    </CardTitle>
                                    <CardDescription>
                                        Control motion and visual effects
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Glow Effects</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable glowing borders and shadows
                                                </p>
                                                {/* Preview of glow effects */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div
                                                        className={`w-4 h-4 rounded-full border transition-all duration-300 ${settings.enableGlowEffects
                                                                ? 'shadow-primary border-primary/30'
                                                                : 'shadow-none border-primary/20'
                                                            }`}
                                                        style={{
                                                            backgroundColor: {
                                                                blue: 'hsl(221.2 83.2% 53.3%)',
                                                                purple: 'hsl(262.1 83.3% 57.8%)',
                                                                green: 'hsl(142.1 76.2% 36.3%)',
                                                                orange: 'hsl(24.6 95% 53.1%)',
                                                                pink: 'hsl(346.8 77.2% 49.8%)'
                                                            }[settings.colorScheme]
                                                        }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        {settings.enableGlowEffects ? 'Glow enabled' : 'Glow disabled'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={settings.enableGlowEffects}
                                                onCheckedChange={(checked) => updateSetting('enableGlowEffects', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Interface Settings */}
                        <TabsContent value="interface" className="space-y-6">
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Monitor className="h-5 w-5 text-primary" />
                                        Interface Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        Customize how the interface behaves
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Auto-save</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Automatically save your work
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.autoSave}
                                                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Show Breadcrumbs</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Display navigation breadcrumbs
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.showBreadcrumbs}
                                                onCheckedChange={(checked) => updateSetting('showBreadcrumbs', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Show Tooltips</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Display helpful tooltips
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.showTooltips}
                                                onCheckedChange={(checked) => updateSetting('showTooltips', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Performance Settings */}
                        <TabsContent value="performance" className="space-y-6">
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-primary" />
                                        Performance Options
                                    </CardTitle>
                                    <CardDescription>
                                        Optimize for speed or visual quality
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Hover Effects</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable interactive hover animations
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.enableHoverEffects}
                                                onCheckedChange={(checked) => updateSetting('enableHoverEffects', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Particle Effects</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Show background particle animations
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.enableParticles}
                                                onCheckedChange={(checked) => updateSetting('enableParticles', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Accessibility Settings */}
                        <TabsContent value="accessibility" className="space-y-6">
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <EyeIcon className="h-5 w-5 text-primary" />
                                        Accessibility
                                    </CardTitle>
                                    <CardDescription>
                                        Make ScholarAI more accessible
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>High Contrast</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Increase contrast for better visibility
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.highContrast}
                                                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Large Text</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Increase text size for better readability
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.largeText}
                                                onCheckedChange={(checked) => updateSetting('largeText', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Focus Indicators</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Show clear focus indicators
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.focusIndicators}
                                                onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Settings */}
                        <TabsContent value="notifications" className="space-y-6">
                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Volume2 className="h-5 w-5 text-primary" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        Control how you receive notifications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Sound Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Play sounds for notifications
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.soundEnabled}
                                                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Desktop Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Show browser notifications
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.desktopNotifications}
                                                onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-background/40 backdrop-blur-xl border border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-primary" />
                                        Data & Privacy
                                    </CardTitle>
                                    <CardDescription>
                                        Control data collection and privacy settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Analytics</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Help improve ScholarAI with usage data
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.analyticsEnabled}
                                                onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Crash Reporting</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Send crash reports to help fix issues
                                                </p>
                                            </div>
                                            <Switch
                                                checked={settings.crashReporting}
                                                onCheckedChange={(checked) => updateSetting('crashReporting', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    )
} 