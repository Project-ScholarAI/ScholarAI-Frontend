'use client';
import { useRef, useEffect, useState } from 'react';
import { defaultVideo } from '@/utils/videoBackgrounds';

interface VideoBackgroundProps {
    children: React.ReactNode;
}

export default function VideoBackground({ children }: VideoBackgroundProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [parallax, setParallax] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5;
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            // Normalize mouse position to range [-1, 1]
            const x = (e.clientX / innerWidth) * 2 - 1;
            const y = (e.clientY / innerHeight) * 2 - 1;
            setParallax({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Parallax strength (adjust for more/less movement)
    const PARALLAX_STRENGTH = 30; // px

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{
                    transform: `translate3d(${parallax.x * PARALLAX_STRENGTH}px, ${parallax.y * PARALLAX_STRENGTH}px, 0) scale(1.05)`,
                    transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
            >
                <source src={defaultVideo} type="video/mp4" />
            </video>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
} 