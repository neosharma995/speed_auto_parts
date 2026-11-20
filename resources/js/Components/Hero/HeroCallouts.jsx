import React from 'react';
import { Link } from '@inertiajs/react';
import { Disc, Zap, Flame, Wind, GitCommit, ChevronRight } from 'lucide-react';

/**
 * Scene 3: Interactive Parts Identification HUD Callouts
 * Sequential technical callouts with orange indicator nodes and connector lines
 */
export const CALLOUT_DEFINITIONS = [
    {
        id: 'brakes',
        title: 'BRAKE ROTORS',
        spec: 'Slotted & Drilled Carbon-Ceramic',
        categorySlug: 'brakes',
        icon: Disc,
        // Default anchor positions (percentages for responsive fallback)
        defaultPos: { top: '38%', left: '74%' },
        targetPos: { x: '58%', y: '52%' },
    },
    {
        id: 'wheels',
        title: 'PERFORMANCE WHEELS',
        spec: 'Forged Monobloc & Track Rubber',
        categorySlug: 'tires',
        icon: Disc,
        defaultPos: { top: '72%', left: '76%' },
        targetPos: { x: '62%', y: '70%' },
    },
    {
        id: 'turbos',
        title: 'TURBOCHARGERS',
        spec: 'Twin Billet Impeller High Boost',
        categorySlug: 'intake',
        icon: Zap,
        defaultPos: { top: '16%', left: '52%' },
        targetPos: { x: '46%', y: '40%' },
    },
    {
        id: 'intake',
        title: 'AIR INTAKE',
        spec: 'High-Flow Cold Air Carbon Induction',
        categorySlug: 'intake',
        icon: Wind,
        defaultPos: { top: '12%', left: '26%' },
        targetPos: { x: '35%', y: '32%' },
    },
    {
        id: 'exhaust',
        title: 'EXHAUST SYSTEM',
        spec: 'T304 Stainless Steel Cat-Back',
        categorySlug: 'exhaust',
        icon: Flame,
        defaultPos: { top: '74%', left: '30%' },
        targetPos: { x: '42%', y: '65%' },
    },
    {
        id: 'suspension',
        title: 'SUSPENSION',
        spec: 'Inverted Monotube Track Coilovers',
        categorySlug: 'suspension',
        icon: GitCommit,
        defaultPos: { top: '44%', left: '16%' },
        targetPos: { x: '30%', y: '48%' },
    },
];

export default function HeroCallouts({
    sceneIndex,
    revealedCallouts,
    hoveredCallout,
    setHoveredCallout,
    screenPositions = null,
}) {
    // Only visible in Scene 2 & 3 (starts appearing in Scene 2, fully active in Scene 3)
    const isHudVisible = sceneIndex >= 1;

    return (
        <div className={`hero-callouts-overlay ${isHudVisible ? 'hud-active' : 'hud-hidden'}`}>
            {/* SVG Connector Lines Container */}
            <svg className="hero-callouts-svg-layer" width="100%" height="100%">
                <defs>
                    <linearGradient id="orangeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F36B16" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#F36B16" stopOpacity="0.15" />
                    </linearGradient>
                    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {CALLOUT_DEFINITIONS.map(item => {
                    const isRevealed = revealedCallouts.has(item.id);
                    const isHovered = hoveredCallout === item.id;
                    if (!isRevealed) return null;

                    return (
                        <g key={`line-${item.id}`} className={`connector-group ${isHovered ? 'connector-highlight' : ''}`}>
                            {/* Thin Orange Connector Line */}
                            <line
                                x1={item.defaultPos.left}
                                y1={item.defaultPos.top}
                                x2={item.targetPos.x}
                                y2={item.targetPos.y}
                                stroke="url(#orangeLineGrad)"
                                strokeWidth={isHovered ? '2' : '1.2'}
                                strokeDasharray={isHovered ? 'none' : '4 3'}
                                filter={isHovered ? 'url(#glowFilter)' : undefined}
                            />
                            {/* Target Node Dot at 3D component anchor */}
                            <circle
                                cx={item.targetPos.x}
                                cy={item.targetPos.y}
                                r={isHovered ? 4.5 : 3}
                                fill="#F36B16"
                                className="target-anchor-dot"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Interactive Callout Cards */}
            {CALLOUT_DEFINITIONS.map(item => {
                const isRevealed = revealedCallouts.has(item.id);
                const isHovered = hoveredCallout === item.id;
                const IconComponent = item.icon;

                return (
                    <div
                        key={item.id}
                        className={`hero-callout-card ${isRevealed ? 'card-revealed' : 'card-hidden'} ${isHovered ? 'card-hovered' : ''}`}
                        style={{
                            top: item.defaultPos.top,
                            left: item.defaultPos.left,
                        }}
                        onMouseEnter={() => setHoveredCallout(item.id)}
                        onMouseLeave={() => setHoveredCallout(null)}
                    >
                        {/* Orange Pulsing Node Indicator */}
                        <div className="callout-node-anchor">
                            <span className="callout-indicator-ping" />
                            <span className="callout-indicator-dot" />
                        </div>

                        {/* Interactive Link Card */}
                        <Link
                            href={`/shop?category=${item.categorySlug}`}
                            className="callout-content-box"
                            title={`Browse ${item.title}`}
                        >
                            <div className="callout-header-row">
                                <div className="callout-icon-badge">
                                    <IconComponent size={14} />
                                </div>
                                <span className="callout-title">{item.title}</span>
                                <ChevronRight size={14} className="callout-arrow" />
                            </div>
                            <span className="callout-spec-desc">{item.spec}</span>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
