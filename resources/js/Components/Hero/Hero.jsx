import React, { useRef, useEffect, Suspense, lazy } from 'react';
import HeroVideo from './HeroVideo';
import HeroContent from './HeroContent';
import HeroSceneControls from './HeroSceneControls';
import { useHeroTimeline } from './useHeroTimeline';
import './Hero.scss';

// Lazy-load the 3D WebGL scene to keep the initial homepage render ultra-fast and lightweight
const HeroScene = lazy(() => import('./HeroScene'));

/**
 * AUTO PARTS Homepage Hero – Cinematic 3D Automotive Experience
 * Enhances the hero into a 3-scene cinematic sequence:
 * Scene 1: Car Drift Video (opening background) - 100% clean drift without exploded visuals
 * Scene 2: Exploded Automotive Transformation (Three.js 3D mechanical assembly)
 * Scene 3: Interactive Parts Identification HUD Callouts (Brakes, Wheels, Turbos, Intake, Exhaust, Suspension)
 */
export default function Hero({ banner = null }) {
    const heroSectionRef = useRef(null);

    const {
        sceneIndex,
        isPlaying,
        hoveredCallout,
        isReducedMotion,
        isVisible,
        setIsVisible,
        explosionProgress,
        revealedCallouts,
        togglePlayPause,
        setHoveredCallout,
        jumpToScene,
    } = useHeroTimeline();

    // IntersectionObserver to pause rendering when hero is offscreen
    useEffect(() => {
        const el = heroSectionRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [setIsVisible]);

    return (
        <section
            ref={heroSectionRef}
            className={`home-hero scene-mode-${sceneIndex}`}
            aria-label="Cinematic Performance Automotive Hero"
        >
            {/* Scene 1: Cinematic Automotive Drift Video Layer */}
            <HeroVideo
                sceneIndex={sceneIndex}
                isVisible={isVisible}
                isPlaying={isPlaying}
                isReducedMotion={isReducedMotion}
            />

            {/* Content & 3D Interactive Stage */}
            <div className="container">
                <div className="home-hero-inner">
                    {/* Left Column: Brand Content, Headings & CTAs */}
                    <HeroContent
                        banner={banner}
                        sceneIndex={sceneIndex}
                    />

                    {/* Right Column: 3D Exploded View & Interactive Parts HUD */}
                    <div className="home-hero-visual-stage">
                        <Suspense fallback={<div className="hero-scene-loading-placeholder" aria-hidden="true" />}>
                            <HeroScene
                                sceneIndex={sceneIndex}
                                explosionProgress={explosionProgress}
                                revealedCallouts={revealedCallouts}
                                hoveredCallout={hoveredCallout}
                                setHoveredCallout={setHoveredCallout}
                                isVisible={isVisible}
                                isPlaying={isPlaying}
                                isReducedMotion={isReducedMotion}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>

            {/* Scene Controls & Timeline Navigation */}
            <HeroSceneControls
                sceneIndex={sceneIndex}
                isPlaying={isPlaying}
                togglePlayPause={togglePlayPause}
                jumpToScene={jumpToScene}
                isReducedMotion={isReducedMotion}
            />
        </section>
    );
}
