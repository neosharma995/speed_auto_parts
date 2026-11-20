import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage the coordinated automotive hero timeline:
 * Scene 1 (0s - 4.5s): Cinematic Car Drift Video
 * Scene 2 (4.5s - 8.5s): Exploded Automotive 3D Transformation
 * Scene 3 (8.5s - 14.5s): Interactive Parts Identification & Callouts
 * 14.5s+: Seamless transition loop back to Scene 1
 */
export function useHeroTimeline() {
    // 0: drift, 1: exploded, 2: callouts
    const [sceneIndex, setSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hoveredCallout, setHoveredCallout] = useState(null);
    const [isReducedMotion, setIsReducedMotion] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [explosionProgress, setExplosionProgress] = useState(0);
    const [revealedCallouts, setRevealedCallouts] = useState(new Set());

    const animFrameRef = useRef(null);
    const lastTimeRef = useRef(null);
    const timelineTimeRef = useRef(0);

    // Total sequence length in seconds
    const TOTAL_DURATION = 15.0;

    // Detect prefers-reduced-motion
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setIsReducedMotion(mediaQuery.matches);

        const handleChange = (e) => {
            setIsReducedMotion(e.matches);
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Timeline tick handler
    useEffect(() => {
        if (isReducedMotion) {
            // For reduced motion: show steady exploded scene with callouts, no fast loop
            setSceneIndex(2);
            setExplosionProgress(1.0);
            setRevealedCallouts(new Set(['brakes', 'wheels', 'turbos', 'intake', 'exhaust', 'suspension']));
            return;
        }

        if (!isPlaying || !isVisible) {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
            lastTimeRef.current = null;
            return;
        }

        const tick = (now) => {
            if (!lastTimeRef.current) {
                lastTimeRef.current = now;
            }
            const deltaSec = Math.min((now - lastTimeRef.current) / 1000, 0.1);
            lastTimeRef.current = now;

            // Increment time
            timelineTimeRef.current = (timelineTimeRef.current + deltaSec) % TOTAL_DURATION;
            const t = timelineTimeRef.current;

            // Determine Scene & Animation parameters based on timeline
            if (t < 4.5) {
                // Scene 1: Drift
                setSceneIndex(0);
                setExplosionProgress(0);
                setRevealedCallouts(new Set());
            } else if (t < 8.5) {
                // Scene 2: Exploded Transformation
                setSceneIndex(1);
                // Smooth ease in-out between 4.5s and 7.5s
                const explodeNorm = Math.min(Math.max((t - 4.5) / 3.0, 0), 1);
                // Cubic ease out
                const eased = 1 - Math.pow(1 - explodeNorm, 3);
                setExplosionProgress(eased);
                setRevealedCallouts(new Set());
            } else if (t < 14.0) {
                // Scene 3: Interactive Callouts
                setSceneIndex(2);
                setExplosionProgress(1.0);

                // Sequential callout reveal from 8.5s to 12.0s
                const calloutKeys = ['brakes', 'wheels', 'turbos', 'intake', 'exhaust', 'suspension'];
                const calloutTime = t - 8.5;
                const revealedCount = Math.min(Math.floor(calloutTime / 0.5) + 1, calloutKeys.length);
                const newSet = new Set(calloutKeys.slice(0, revealedCount));
                setRevealedCallouts(newSet);
            } else {
                // 14.0s - 15.0s: Transition back to Scene 1
                const resetNorm = (t - 14.0) / 1.0;
                setExplosionProgress(1 - resetNorm);
                if (resetNorm > 0.5) {
                    setSceneIndex(0);
                    setRevealedCallouts(new Set());
                }
            }

            animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);

        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [isPlaying, isVisible, isReducedMotion]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const jumpToScene = useCallback((index) => {
        if (index === 0) {
            timelineTimeRef.current = 0;
            setSceneIndex(0);
            setExplosionProgress(0);
            setRevealedCallouts(new Set());
        } else if (index === 1) {
            timelineTimeRef.current = 6.0;
            setSceneIndex(1);
            setExplosionProgress(0.7);
            setRevealedCallouts(new Set());
        } else if (index === 2) {
            timelineTimeRef.current = 9.5;
            setSceneIndex(2);
            setExplosionProgress(1.0);
            setRevealedCallouts(new Set(['brakes', 'wheels', 'turbos', 'intake', 'exhaust', 'suspension']));
        }
    }, []);

    return {
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
        currentTime: timelineTimeRef.current,
        totalDuration: TOTAL_DURATION,
    };
}
