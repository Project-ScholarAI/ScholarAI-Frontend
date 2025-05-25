'use client';
import { useEffect, useState } from 'react';
import { defaultBackground, backgroundStyles } from '@/utils/videoBackgrounds';

interface VideoBackgroundProps {
    children: React.ReactNode;
    backgroundId?: string;
}

export default function VideoBackground({ children, backgroundId }: VideoBackgroundProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Inject background styles into the document head
        const styleElement = document.createElement('style');
        styleElement.textContent = backgroundStyles;
        document.head.appendChild(styleElement);

        return () => {
            // Cleanup styles when component unmounts
            if (document.head.contains(styleElement)) {
                document.head.removeChild(styleElement);
            }
        };
    }, []);

    const background = defaultBackground; // Using default background (now the image)

    // Create style object for image backgrounds
    const backgroundStyle = background.type === 'image' && background.backgroundImage
        ? { backgroundImage: `url(${background.backgroundImage})` }
        : {};

    return (
        <div
            className={`relative min-h-screen w-full overflow-hidden background-container ${background.className}`}
            style={backgroundStyle}
        >
            {/* Image background overlay for better text readability */}
            {background.type === 'image' && (
                <div className="image-background" style={backgroundStyle} />
            )}

            {/* Dynamic overlay based on background type */}
            {background.overlay && (
                <div className={`absolute inset-0 ${background.overlay}`} />
            )}

            {/* Enhanced floating elements for visual depth */}
            {mounted && (
                <>
                    {/* Floating geometric elements */}
                    <div className="floating-element" />
                    <div className="floating-element" />
                    <div className="floating-element" />
                    <div className="floating-element" />

                    {/* Subtle glow effects */}
                    <div className="glow-element" />
                    <div className="glow-element" />

                    {/* Animated particles for ScholarAI theme */}
                    <div className="absolute inset-0">
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full bg-primary/10 animate-pulse"
                                style={{
                                    width: `${2 + Math.random() * 4}px`,
                                    height: `${2 + Math.random() * 4}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${4 + Math.random() * 3}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Brain/Neural network inspired connections */}
                    <div className="absolute inset-0">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={`line-${i}`}
                                className="absolute bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                                style={{
                                    width: `${100 + Math.random() * 200}px`,
                                    height: '1px',
                                    left: `${Math.random() * 80}%`,
                                    top: `${Math.random() * 80}%`,
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                    animation: `float ${10 + Math.random() * 10}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 5}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Research-themed floating icons effect */}
                    <div className="absolute inset-0">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={`icon-${i}`}
                                className="absolute w-8 h-8 opacity-5 text-primary"
                                style={{
                                    left: `${10 + Math.random() * 80}%`,
                                    top: `${10 + Math.random() * 80}%`,
                                    animation: `float ${15 + Math.random() * 10}s ease-in-out infinite`,
                                    animationDelay: `${Math.random() * 8}s`
                                }}
                            >
                                {/* Simple geometric shapes representing research elements */}
                                <div className="w-full h-full border border-current rounded-sm transform rotate-45" />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Subtle vignette effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/20" />

            {/* Content with enhanced backdrop blur */}
            <div className="relative z-10 backdrop-blur-[0.5px]">
                {children}
            </div>
        </div>
    );
} 