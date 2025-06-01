"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, ArrowRight, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navItems = [
        { href: "#features", label: "Features" },
        { href: "#demo", label: "Demo" },
        { href: "#pricing", label: "Pricing" },
        { href: "#about", label: "About" },
    ]

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5"
                    : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center space-x-3"
                    >
                        <div className="relative">
                            <Brain className="h-8 w-8 text-primary" />
                            <motion.div
                                className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full blur-md"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            ScholarAI
                        </span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item, index) => (
                            <motion.a
                                key={item.href}
                                href={item.href}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                className="relative text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                            >
                                {item.label}
                                <motion.div
                                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 w-0 group-hover:w-full transition-all duration-300"
                                />
                            </motion.a>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 border-0 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40">
                                <span className="relative z-10 flex items-center">
                                    Get Started
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100"
                                    transition={{ duration: 0.3 }}
                                />
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50"
                    >
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {navItems.map((item, index) => (
                                <motion.a
                                    key={item.href}
                                    href={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </motion.a>
                            ))}
                            <div className="pt-4 space-y-2">
                                <Link href="/login" className="block">
                                    <Button variant="outline" className="w-full">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/login" className="block">
                                    <Button className="w-full bg-gradient-to-r from-primary to-purple-600">
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
} 