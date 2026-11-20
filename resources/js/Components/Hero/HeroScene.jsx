import React, { useState, useCallback } from 'react';
import HeroExplodedView from './HeroExplodedView';
import HeroCallouts from './HeroCallouts';

/**
 * Scene 2 & 3 Coordinator:
 * Renders 3D Exploded mechanical assembly and connects interactive HUD callouts
 */
export default function HeroScene({
    sceneIndex,
    explosionProgress,
    revealedCallouts,
    hoveredCallout,
    setHoveredCallout,
    isVisible,
    isPlaying = true,
    isReducedMotion,
}) {
    const [screenPositions, setScreenPositions] = useState(null);

    const handlePositionsUpdate = useCallback((positions) => {
        setScreenPositions(positions);
    }, []);

    return (
        <div className={`hero-scene-stage scene-active-${sceneIndex >= 1 ? 'true' : 'false'}`}>
            {/* 3D WebGL Exploded Mechanical Assembly */}
            <HeroExplodedView
                sceneIndex={sceneIndex}
                explosionProgress={explosionProgress}
                hoveredCallout={hoveredCallout}
                isVisible={isVisible}
                isPlaying={isPlaying}
                isReducedMotion={isReducedMotion}
                onPositionsUpdate={handlePositionsUpdate}
            />

            {/* Interactive Parts Identification HUD Callouts */}
            <HeroCallouts
                sceneIndex={sceneIndex}
                revealedCallouts={revealedCallouts}
                hoveredCallout={hoveredCallout}
                setHoveredCallout={setHoveredCallout}
                screenPositions={screenPositions}
            />
        </div>
    );
}
