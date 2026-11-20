import React from 'react';
import { Play, Pause } from 'lucide-react';

/**
 * Scene Controls & Timeline HUD
 * Allows users to inspect specific scenes, pause the animation, or view timeline progress
 */
export default function HeroSceneControls({
    sceneIndex,
    isPlaying,
    togglePlayPause,
    jumpToScene,
    isReducedMotion,
}) {
    if (isReducedMotion) return null;

    const scenes = [
        { index: 0, label: '01 DRIFT' },
        { index: 1, label: '02 EXPLODED 3D' },
        { index: 2, label: '03 CALLOUTS' },
    ];

    return (
        <div className="hero-scene-controls">
            {/* Play/Pause Button */}
            <button
                type="button"
                className="hero-control-btn play-pause-btn"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
                aria-label={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
            >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            {/* Scene Selectors */}
            <div className="hero-scene-tabs">
                {scenes.map(s => (
                    <button
                        key={s.index}
                        type="button"
                        className={`hero-scene-tab ${sceneIndex === s.index ? 'tab-active' : ''}`}
                        onClick={() => jumpToScene(s.index)}
                    >
                        <span className="scene-tab-dot" />
                        <span className="scene-tab-label">{s.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
