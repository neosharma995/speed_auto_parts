import React, { useRef, useEffect, useState } from 'react';

/**
 * Scene 1: Cinematic Automotive Video Background
 * High-performance dark sports car drifting through track corner with tire smoke
 */
export default function HeroVideo({ sceneIndex, isVisible, isReducedMotion, isPlaying = true }) {
    const videoRef = useRef(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Controlled Play / Pause management
        if (isVisible && isPlaying && !isReducedMotion) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay policy prevented playback
                });
            }
        } else {
            video.pause();
        }
    }, [isVisible, isPlaying, isReducedMotion]);

    const handleLoadedData = () => {
        setHasLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
    };

    // Calculate background opacity based on active scene
    // In Scene 0 (drift): 100% visible, sharp
    // In Scene 1 & 2 (exploded 3D & callouts): dimmed to let 3D take full focus
    const videoOpacityClass = sceneIndex === 0 ? 'video-drift-active' : 'video-drift-dimmed';

    return (
        <div className={`hero-video-container ${videoOpacityClass}`}>
            <video
                ref={videoRef}
                className="hero-video-element"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/assets/hero/images/automotive-poster.webp"
                onLoadedData={handleLoadedData}
                onError={handleError}
            >
                {/* Desktop and High-Res Viewport */}
                <source
                    src="/assets/hero/videos/automotive-drift.webm"
                    type="video/webm"
                    media="(min-width: 768px)"
                />
                <source
                    src="/assets/hero/videos/automotive-drift.mp4"
                    type="video/mp4"
                    media="(min-width: 768px)"
                />

                {/* Mobile Optimized Viewport */}
                <source
                    src="/assets/hero/videos/automotive-drift-mobile.mp4"
                    type="video/mp4"
                />

                {/* Fallback Image */}
                <img
                    src="/assets/hero/images/automotive-poster.webp"
                    alt="AUTO PARTS High Performance Drift Showcase"
                    className="hero-video-fallback"
                />
            </video>

            {/* Cinematic dark color grading overlays with subtle orange light accents */}
            <div className="hero-video-grading-overlay" />
            <div className="hero-video-orange-lens-flare" />
            <div className="hero-video-vignette" />
        </div>
    );
}
