"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Sparkles, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { HeroBackground } from "./hero-background"

export function HeroSection() {
    const [text, setText] = useState("")
    const fullText = "Accelerate Your Research Journey"

    useEffect(() => {
        let i = 0
        const timer = setInterval(() => {
            setText(fullText.slice(0, i))
            i++
            if (i > fullText.length) {
                clearInterval(timer)
            }
        }, 100)

        return () => clearInterval(timer)
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <HeroBackground />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 backdrop-blur-sm">
                            <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse" />
                            AI-Powered Research Assistant
                        </Badge>
                    </motion.div>

                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl mb-6">
                        <span className="block">{text}</span>
                        <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient">
                            {text.length === fullText.length && <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                with AI
                            </motion.span>}
                        </span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
                    >
                        Transform how you discover, analyze, and synthesize academic papers with our intelligent AI agents.
                        From automated paper retrieval to gap analysis and contextual Q&A.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link href="/login">
                            <Button
                                size="lg"
                                className="group relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white border-0 shadow-2xl shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center">
                                    Start Researching
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </Link>

                        <Button
                            size="lg"
                            variant="outline"
                            className="group border-primary/30 bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                        >
                            <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            Watch Demo
                        </Button>
                    </motion.div>

                    {/* Floating metrics */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
                    >
                        {[
                            { value: "50K+", label: "Papers Analyzed" },
                            { value: "10x", label: "Faster Research" },
                            { value: "1000+", label: "Researchers" }
                        ].map((metric, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                className="text-center p-4 rounded-xl bg-background/20 backdrop-blur-sm border border-primary/20"
                            >
                                <div className="text-2xl font-bold text-primary">{metric.value}</div>
                                <div className="text-sm text-muted-foreground">{metric.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
} 