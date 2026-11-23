import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Link } from '@inertiajs/react';
import {
    Disc,
    Zap,
    Flame,
    Wind,
    GitCommit,
    ChevronRight,
    ArrowRight,
    ShieldCheck,
    Play,
    Pause,
    Car,
} from 'lucide-react';
import * as THREE from 'three';
import VehicleFinder from './VehicleFinder';
import '../../scss/Hero.scss';

// ============================================================================
// Callout Definitions
// ============================================================================
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

import useHeroTimeline from '../useHeroTimeline';
export { useHeroTimeline };

// ============================================================================
// Component: HeroVideo (Scene 1 Background)
// ============================================================================
export function HeroVideo({ sceneIndex, isVisible, isReducedMotion, isPlaying = true }) {
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
                poster="/assets/images/hero/automotive-poster.webp"
                onLoadedData={handleLoadedData}
                onError={handleError}
            >
                {/* Desktop and High-Res Viewport */}
                <source
                    src="/assets/videos/automotive-drift.webm"
                    type="video/webm"
                    media="(min-width: 768px)"
                />
                <source
                    src="/assets/videos/automotive-drift.mp4"
                    type="video/mp4"
                    media="(min-width: 768px)"
                />

                {/* Mobile Optimized Viewport */}
                <source
                    src="/assets/videos/automotive-drift-mobile.mp4"
                    type="video/mp4"
                />

                {/* Fallback Image */}
                <img
                    src="/assets/images/hero/automotive-poster.webp"
                    alt="SPEED AUTOS PARTS High Performance Drift Showcase"
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

// ============================================================================
// Component: HeroContent (Brand Content & Left Column)
// ============================================================================
export function HeroContent({ banner = null, sceneIndex = 0 }) {
    const eyebrow = banner?.eyebrow || 'PERFORMANCE PARTS FOR DRIVERS';
    const description = banner?.subtitle || 'Premium automotive spare parts for street, track, and garage builds.';
    const ctaText = banner?.button_text || 'Shop Performance';
    const ctaLink = banner?.button_link || '/shop';

    return (
        <div className="home-hero-content">
            {/* Eyebrow */}
            <div className="home-hero-eyebrow">
                <img src="/assets/icons/heading-stripe.webp" alt="" className="hero-eyebrow-stripe" />
                <span>{eyebrow}</span>
            </div>

            {/* Main Brand Heading */}
            <h1 className="home-hero-heading">
                <span className="heading-white">BUILD</span>
                <span className="heading-orange">UPGRADE</span>
                <span className="heading-white">PERFORM</span>
            </h1>

            {/* Description */}
            <p className="home-hero-desc">
                {description}
            </p>

            {/* CTA Action Buttons */}
            <div className="home-hero-cta-group">
                <Link
                    href={ctaLink}
                    className="hero-btn hero-primary-btn"
                >
                    <span>{ctaText}</span>
                    <ArrowRight size={17} />
                </Link>

                <Link
                    href="/vehicle-finder"
                    className="hero-btn hero-secondary-btn"
                >
                    <Car size={17} />
                    <span>Find By Vehicle</span>
                </Link>
            </div>
        </div>
    );
}

// ============================================================================
// Component: HeroSceneControls (Scene Navigation & Carousel Dots)
// ============================================================================
export function HeroSceneControls({
    sceneIndex,
    isPlaying,
    togglePlayPause,
    jumpToScene,
    isReducedMotion,
}) {
    if (isReducedMotion) return null;

    const scenes = [
        { index: 0, label: 'Drift Showcase' },
        { index: 1, label: 'Exploded 3D View' },
        { index: 2, label: 'Performance HUD' },
    ];

    return (
        <div className="hero-scene-controls" aria-label="Hero Scene Controls">
            <div className="hero-carousel-dots" role="tablist">
                {scenes.map(s => (
                    <button
                        key={s.index}
                        type="button"
                        className={`hero-dot-btn ${sceneIndex === s.index ? 'active' : ''}`}
                        onClick={() => jumpToScene(s.index)}
                        title={s.label}
                        aria-label={s.label}
                        aria-selected={sceneIndex === s.index}
                        role="tab"
                    />
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Component: HeroExplodedView (Three.js 3D WebGL Assembly)
// ============================================================================
export function HeroExplodedView({
    sceneIndex,
    explosionProgress = 0,
    hoveredCallout = null,
    isVisible = true,
    isPlaying = true,
    isReducedMotion = false,
    onPositionsUpdate = null,
}) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const partsGroupRef = useRef(null);
    const animFrameRef = useRef(null);
    const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    // Component group references for explosion animation
    const partRefs = useRef({
        wheels: [],
        brakes: [],
        suspension: [],
        intake: null,
        turbos: [],
        exhaust: null,
        engine: null,
        chassis: null,
    });

    // Material references for interactive hover highlight
    const highlightMatsRef = useRef({
        brakes: [],
        wheels: [],
        turbos: [],
        intake: [],
        exhaust: [],
        suspension: [],
    });

    // 1. Initialize Three.js Scene
    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera - isometric perspective for precision engineering look
        const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
        camera.position.set(7.5, 3.8, 8.5);
        camera.lookAt(0.2, 0.2, 0);
        cameraRef.current = camera;

        // WebGL Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting System
        // Soft charcoal ambient
        const ambientLight = new THREE.AmbientLight(0x22262d, 2.0);
        scene.add(ambientLight);

        // Key light (cool automotive white)
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
        keyLight.position.set(12, 16, 10);
        keyLight.castShadow = true;
        scene.add(keyLight);

        // SPEED AUTOS PARTS Signature Orange Rim Light (#F36B16)
        const orangeRimLight = new THREE.DirectionalLight(0xf36b16, 3.8);
        orangeRimLight.position.set(-14, 8, -6);
        scene.add(orangeRimLight);

        // Subtle warm fill from below/side
        const orangeFillLight = new THREE.PointLight(0xf36b16, 1.8, 25);
        orangeFillLight.position.set(0, -3, 2);
        scene.add(orangeFillLight);

        // Top studio softbox
        const topLight = new THREE.DirectionalLight(0xdde8f5, 1.5);
        topLight.position.set(0, 15, 0);
        scene.add(topLight);

        // 2. Build Automotive Components Group
        const rootGroup = new THREE.Group();
        // Slight default rotation for dramatic angle
        rootGroup.rotation.y = -Math.PI * 0.18;
        rootGroup.rotation.x = Math.PI * 0.04;
        scene.add(rootGroup);
        partsGroupRef.current = rootGroup;

        // Reset part refs
        partRefs.current = {
            wheels: [],
            brakes: [],
            suspension: [],
            intake: null,
            turbos: [],
            exhaust: null,
            engine: null,
            chassis: null,
        };
        highlightMatsRef.current = {
            brakes: [],
            wheels: [],
            turbos: [],
            intake: [],
            exhaust: [],
            suspension: [],
        };

        // Shared High-End Automotive Materials
        const darkCarbonMat = new THREE.MeshStandardMaterial({
            color: 0x18181a,
            roughness: 0.35,
            metalness: 0.85,
        });

        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.15,
            metalness: 0.95,
        });

        const gunmetalMat = new THREE.MeshStandardMaterial({
            color: 0x2e3138,
            roughness: 0.3,
            metalness: 0.9,
        });

        const brandOrangeMat = new THREE.MeshStandardMaterial({
            color: 0xf36b16,
            roughness: 0.25,
            metalness: 0.6,
            emissive: 0xf36b16,
            emissiveIntensity: 0.15,
        });

        const orangeTurboMat = new THREE.MeshStandardMaterial({
            color: 0xf36b16,
            roughness: 0.3,
            metalness: 0.8,
            emissive: 0xf36b16,
            emissiveIntensity: 0.5,
        });

        const tireRubberMat = new THREE.MeshStandardMaterial({
            color: 0x121214,
            roughness: 0.85,
            metalness: 0.1,
        });

        const rotorMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.22,
            metalness: 0.92,
        });

        // Track materials for hover highlight
        highlightMatsRef.current.brakes.push(brandOrangeMat);
        highlightMatsRef.current.wheels.push(gunmetalMat);
        highlightMatsRef.current.turbos.push(orangeTurboMat);

        // ==========================================
        // COMPONENT 1: Tubular Chassis & Aero Frame
        // ==========================================
        const chassisGroup = new THREE.Group();
        const mainFloorGeo = new THREE.BoxGeometry(4.2, 0.12, 1.9);
        const mainFloor = new THREE.Mesh(mainFloorGeo, darkCarbonMat);
        chassisGroup.add(mainFloor);

        const railGeo = new THREE.BoxGeometry(4.4, 0.2, 0.15);
        const railL = new THREE.Mesh(railGeo, gunmetalMat);
        railL.position.set(0, 0.1, 0.9);
        const railR = new THREE.Mesh(railGeo, gunmetalMat);
        railR.position.set(0, 0.1, -0.9);
        chassisGroup.add(railL, railR);

        const cageTubes = new THREE.Group();
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.3, metalness: 0.8 });
        const aPillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), tubeMat);
        aPillarL.rotation.z = Math.PI * 0.22;
        aPillarL.position.set(-0.3, 0.8, 0.8);
        const aPillarR = aPillarL.clone();
        aPillarR.position.set(-0.3, 0.8, -0.8);
        cageTubes.add(aPillarL, aPillarR);

        const roofBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 1.6), tubeMat);
        roofBar.position.set(0.4, 1.45, 0);
        cageTubes.add(roofBar);
        chassisGroup.add(cageTubes);

        rootGroup.add(chassisGroup);
        partRefs.current.chassis = chassisGroup;

        // ==========================================
        // COMPONENT 2: V8 Twin-Turbo Engine Block
        // ==========================================
        const engineGroup = new THREE.Group();
        engineGroup.position.set(-0.7, 0.35, 0);

        const blockGeo = new THREE.BoxGeometry(1.1, 0.6, 0.8);
        const engineBlock = new THREE.Mesh(blockGeo, gunmetalMat);
        engineGroup.add(engineBlock);

        const headGeo = new THREE.BoxGeometry(0.9, 0.25, 0.4);
        const headL = new THREE.Mesh(headGeo, darkCarbonMat);
        headL.position.set(0, 0.32, 0.3);
        headL.rotation.x = Math.PI * 0.15;
        const headR = new THREE.Mesh(headGeo, darkCarbonMat);
        headR.position.set(0, 0.32, -0.3);
        headR.rotation.x = -Math.PI * 0.15;
        engineGroup.add(headL, headR);

        const pulleyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24);
        pulleyGeo.rotateZ(Math.PI / 2);
        const p1 = new THREE.Mesh(pulleyGeo, brandOrangeMat);
        p1.position.set(-0.58, 0.15, 0);
        const p2 = new THREE.Mesh(pulleyGeo, chromeMat);
        p2.position.set(-0.58, 0.32, 0.22);
        const p3 = new THREE.Mesh(pulleyGeo, chromeMat);
        p3.position.set(-0.58, 0.32, -0.22);
        engineGroup.add(p1, p2, p3);

        rootGroup.add(engineGroup);
        partRefs.current.engine = engineGroup;

        // ==========================================
        // COMPONENT 3: Cold Air Intake System
        // ==========================================
        const intakeGroup = new THREE.Group();
        intakeGroup.position.set(-0.7, 0.75, 0);

        const plenumGeo = new THREE.BoxGeometry(0.8, 0.22, 0.5);
        const plenum = new THREE.Mesh(plenumGeo, darkCarbonMat);
        intakeGroup.add(plenum);

        const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16);
        pipeGeo.rotateX(Math.PI / 2);
        const intakePipeL = new THREE.Mesh(pipeGeo, chromeMat);
        intakePipeL.position.set(-0.25, 0.1, 0.55);
        intakePipeL.rotation.y = Math.PI * 0.12;
        const intakePipeR = new THREE.Mesh(pipeGeo, chromeMat);
        intakePipeR.position.set(-0.25, 0.1, -0.55);
        intakePipeR.rotation.y = -Math.PI * 0.12;
        intakeGroup.add(intakePipeL, intakePipeR);

        const filterGeo = new THREE.ConeGeometry(0.18, 0.45, 24);
        filterGeo.rotateZ(Math.PI / 2);
        const filterL = new THREE.Mesh(filterGeo, brandOrangeMat);
        filterL.position.set(-0.6, 0.1, 0.75);
        const filterR = new THREE.Mesh(filterGeo, brandOrangeMat);
        filterR.position.set(-0.6, 0.1, -0.75);
        intakeGroup.add(filterL, filterR);

        highlightMatsRef.current.intake.push(brandOrangeMat, chromeMat);
        rootGroup.add(intakeGroup);
        partRefs.current.intake = intakeGroup;

        // ==========================================
        // COMPONENT 4: Twin High-Boost Turbochargers
        // ==========================================
        const turbos = [];
        [-0.55, 0.55].forEach((zPos) => {
            const turboGroup = new THREE.Group();
            turboGroup.position.set(-0.6, 0.28, zPos);

            const turbineGeo = new THREE.TorusGeometry(0.18, 0.09, 16, 24, Math.PI * 1.6);
            const turbine = new THREE.Mesh(turbineGeo, orangeTurboMat);
            turbine.rotation.y = Math.PI / 2;
            turboGroup.add(turbine);

            const compGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.16, 20);
            compGeo.rotateZ(Math.PI / 2);
            const comp = new THREE.Mesh(compGeo, chromeMat);
            comp.position.set(0.12, 0, 0);
            turboGroup.add(comp);

            turbos.push(turboGroup);
            rootGroup.add(turboGroup);
        });
        partRefs.current.turbos = turbos;

        // ==========================================
        // COMPONENT 5: T304 Stainless Exhaust System
        // ==========================================
        const exhaustGroup = new THREE.Group();
        exhaustGroup.position.set(0.8, 0.05, 0);

        const pipeL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 16), chromeMat);
        pipeL.rotation.z = Math.PI / 2;
        pipeL.position.set(0, 0, 0.3);
        const pipeR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 16), chromeMat);
        pipeR.rotation.z = Math.PI / 2;
        pipeR.position.set(0, 0, -0.3);
        exhaustGroup.add(pipeL, pipeR);

        const mufflerGeo = new THREE.BoxGeometry(0.65, 0.22, 0.35);
        const mufL = new THREE.Mesh(mufflerGeo, gunmetalMat);
        mufL.position.set(1.4, 0.05, 0.4);
        const mufR = new THREE.Mesh(mufflerGeo, gunmetalMat);
        mufR.position.set(1.4, 0.05, -0.4);
        exhaustGroup.add(mufL, mufR);

        const tipGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 20);
        tipGeo.rotateZ(Math.PI / 2);
        const tipMat = new THREE.MeshStandardMaterial({
            color: 0x223355,
            roughness: 0.2,
            metalness: 0.95,
            emissive: 0xf36b16,
            emissiveIntensity: 0.25,
        });
        highlightMatsRef.current.exhaust.push(tipMat, chromeMat);

        [-0.5, -0.32, 0.32, 0.5].forEach(z => {
            const tip = new THREE.Mesh(tipGeo, tipMat);
            tip.position.set(1.85, 0.05, z);
            exhaustGroup.add(tip);
        });

        rootGroup.add(exhaustGroup);
        partRefs.current.exhaust = exhaustGroup;

        // ==========================================
        // COMPONENT 6, 7 & 8: Wheels, Brakes & Suspension (4 Corners)
        // ==========================================
        const corners = [
            { id: 'FL', x: -1.45, z: 1.15, isFront: true, isLeft: true },
            { id: 'FR', x: -1.45, z: -1.15, isFront: true, isLeft: false },
            { id: 'RL', x: 1.45, z: 1.15, isFront: false, isLeft: true },
            { id: 'RR', x: 1.45, z: -1.15, isFront: false, isLeft: false },
        ];

        corners.forEach(corner => {
            // Suspension
            const suspGroup = new THREE.Group();
            suspGroup.position.set(corner.x, 0.35, corner.z * 0.7);

            const damperGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 16);
            const damper = new THREE.Mesh(damperGeo, chromeMat);
            suspGroup.add(damper);

            const springMat = brandOrangeMat;
            highlightMatsRef.current.suspension.push(springMat);
            for (let ring = -3; ring <= 3; ring++) {
                const ringGeo = new THREE.TorusGeometry(0.09, 0.02, 10, 20);
                ringGeo.rotateX(Math.PI / 2);
                const springRing = new THREE.Mesh(ringGeo, springMat);
                springRing.position.y = ring * 0.08;
                suspGroup.add(springRing);
            }
            rootGroup.add(suspGroup);
            partRefs.current.suspension.push({ group: suspGroup, basePos: suspGroup.position.clone(), signZ: corner.isLeft ? 1 : -1 });

            // Brakes
            const brakeGroup = new THREE.Group();
            brakeGroup.position.set(corner.x, 0.25, corner.z * 0.95);

            const rotorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32);
            rotorGeo.rotateX(Math.PI / 2);
            const rotor = new THREE.Mesh(rotorGeo, rotorMat);
            brakeGroup.add(rotor);

            const hatGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.07, 24);
            hatGeo.rotateX(Math.PI / 2);
            const hat = new THREE.Mesh(hatGeo, gunmetalMat);
            brakeGroup.add(hat);

            const caliperGeo = new THREE.BoxGeometry(0.18, 0.28, 0.14);
            const caliper = new THREE.Mesh(caliperGeo, brandOrangeMat);
            caliper.position.set(0.24, 0.18, 0);
            brakeGroup.add(caliper);

            rootGroup.add(brakeGroup);
            partRefs.current.brakes.push({ group: brakeGroup, basePos: brakeGroup.position.clone(), signZ: corner.isLeft ? 1 : -1 });

            // Performance Wheels
            const wheelGroup = new THREE.Group();
            wheelGroup.position.set(corner.x, 0.25, corner.z);

            const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.32, 32);
            tireGeo.rotateX(Math.PI / 2);
            const tire = new THREE.Mesh(tireGeo, tireRubberMat);
            wheelGroup.add(tire);

            const rimGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.33, 24);
            rimGeo.rotateX(Math.PI / 2);
            const rim = new THREE.Mesh(rimGeo, gunmetalMat);
            wheelGroup.add(rim);

            for (let sp = 0; sp < 5; sp++) {
                const spokeAngle = (sp / 5) * Math.PI * 2;
                const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.34), chromeMat);
                spoke.rotation.z = spokeAngle;
                wheelGroup.add(spoke);
            }

            rootGroup.add(wheelGroup);
            partRefs.current.wheels.push({ group: wheelGroup, basePos: wheelGroup.position.clone(), signZ: corner.isLeft ? 1 : -1 });
        });

        // 3. Mouse Movement Tracking for Parallax
        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;
            mousePosRef.current.targetX = relX * 0.4;
            mousePosRef.current.targetY = -relY * 0.25;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // 4. Handle Window Resize
        const handleResize = () => {
            if (!container || !renderer || !camera) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
                renderer.dispose();
            }
        };
    }, []);

    // 2. Animation Loop & Exploded Motion
    useEffect(() => {
        if (!isVisible) return;

        const container = mountRef.current;
        const camera = cameraRef.current;
        const rootGroup = partsGroupRef.current;
        const renderer = rendererRef.current;
        if (!container || !camera || !rootGroup || !renderer) return;

        let frameCount = 0;

        const animate = () => {
            // If paused and not reduced motion, render static frame and continue loop without advancing frameCount
            if (!isPlaying) {
                renderer.render(sceneRef.current, camera);
                animFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            frameCount++;

            // Mouse parallax damping
            const m = mousePosRef.current;
            m.x += (m.targetX - m.x) * 0.05;
            m.y += (m.targetY - m.y) * 0.05;

            // Camera subtle floating motion
            const floatOffset = Math.sin(frameCount * 0.02) * 0.08;
            camera.position.y = 3.8 + floatOffset + m.y;
            camera.position.x = 7.5 + m.x * 2.0;
            camera.lookAt(0.2, 0.2, 0);

            // Slow ambient rotation of assembly
            rootGroup.rotation.y = -Math.PI * 0.18 + Math.sin(frameCount * 0.008) * 0.06;

            // Apply Exploded Component Offsets based on explosionProgress (0.0 to 1.0)
            const factor = explosionProgress;

            // Wheels slide outward laterally
            partRefs.current.wheels.forEach(w => {
                w.group.position.z = w.basePos.z + w.signZ * (factor * 1.5);
                w.group.position.y = w.basePos.y + factor * 0.1;
            });

            // Brakes offset
            partRefs.current.brakes.forEach(b => {
                b.group.position.z = b.basePos.z + b.signZ * (factor * 0.85);
                b.group.position.y = b.basePos.y + factor * 0.2;
            });

            // Suspension expands
            partRefs.current.suspension.forEach(s => {
                s.group.position.z = s.basePos.z + s.signZ * (factor * 0.45);
                s.group.position.y = s.basePos.y + factor * 0.4;
            });

            // Cold Air Intake lifts
            if (partRefs.current.intake) {
                partRefs.current.intake.position.y = 0.75 + factor * 0.9;
                partRefs.current.intake.position.x = -0.7 - factor * 0.35;
            }

            // Twin Turbos separate outwards with glowing boost heat
            partRefs.current.turbos.forEach((t, idx) => {
                const side = idx === 0 ? -1 : 1;
                t.position.z = side * (0.55 + factor * 0.7);
                t.position.y = 0.28 + factor * 0.35;
            });

            // Exhaust glides downward and rearward
            if (partRefs.current.exhaust) {
                partRefs.current.exhaust.position.x = 0.8 + factor * 1.2;
                partRefs.current.exhaust.position.y = 0.05 - factor * 0.3;
            }

            // Interactive Callout Emissive Highlights
            const turboMat = highlightMatsRef.current.turbos[0];
            if (turboMat) {
                const isHovered = hoveredCallout === 'turbos';
                turboMat.emissiveIntensity = isHovered ? 1.4 : (0.4 + Math.sin(frameCount * 0.06) * 0.15);
            }

            const brakeMat = highlightMatsRef.current.brakes[0];
            if (brakeMat) {
                const isHovered = hoveredCallout === 'brakes';
                brakeMat.emissiveIntensity = isHovered ? 0.8 : 0.15;
            }

            const exhaustTipMat = highlightMatsRef.current.exhaust[0];
            if (exhaustTipMat) {
                const isHovered = hoveredCallout === 'exhaust';
                exhaustTipMat.emissiveIntensity = isHovered ? 0.9 : 0.25;
            }

            // Render 3D Frame
            renderer.render(sceneRef.current, camera);

            // Project 3D Component Anchor Positions to 2D Screen Space
            if (onPositionsUpdate && frameCount % 2 === 0) {
                const w = container.clientWidth;
                const h = container.clientHeight;

                const getScreenPos = (obj) => {
                    if (!obj) return { x: w * 0.5, y: h * 0.5 };
                    const worldPos = new THREE.Vector3();
                    obj.getWorldPosition(worldPos);
                    worldPos.project(camera);
                    return {
                        x: (worldPos.x * 0.5 + 0.5) * w,
                        y: (-(worldPos.y * 0.5) + 0.5) * h,
                    };
                };

                const positions = {
                    brakes: getScreenPos(partRefs.current.brakes[0]?.group),
                    wheels: getScreenPos(partRefs.current.wheels[0]?.group),
                    turbos: getScreenPos(partRefs.current.turbos[0]),
                    intake: getScreenPos(partRefs.current.intake),
                    exhaust: getScreenPos(partRefs.current.exhaust),
                    suspension: getScreenPos(partRefs.current.suspension[0]?.group),
                };

                onPositionsUpdate(positions);
            }

            animFrameRef.current = requestAnimationFrame(animate);
        };

        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [isVisible, isPlaying, explosionProgress, hoveredCallout, onPositionsUpdate]);

    // ONLY visible when sceneIndex >= 1 (Scene 2 Exploded 3D or Scene 3 Callouts)
    // In Scene 0 (Drift), it is strictly hidden with opacity: 0 and visibility: hidden
    const isSceneActive = sceneIndex >= 1;

    return (
        <div
            ref={mountRef}
            className={`hero-exploded-canvas-container ${isSceneActive ? 'scene-visible' : 'scene-hidden'}`}
            aria-hidden={!isSceneActive}
        />
    );
}

// ============================================================================
// Component: HeroCallouts (Scene 3 Interactive HUD Callouts)
// ============================================================================
export function HeroCallouts({
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

// ============================================================================
// Component: HeroScene (Scene 2 & 3 Coordinator)
// ============================================================================
export function HeroScene({
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

// ============================================================================
// Main Hero Component
// SPEED AUTOS PARTS Homepage Hero – Cinematic 3D Automotive Experience
// ============================================================================
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
        <div className="home-hero-wrapper">
            <div className="hero-unified-card">
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

                    {/* Content & 3D Interactive Stage inside inner container */}
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

                    {/* Slider dots: Position directly below hero content, horizontally centered */}
                    <HeroSceneControls
                        sceneIndex={sceneIndex}
                        isPlaying={isPlaying}
                        togglePlayPause={togglePlayPause}
                        jumpToScene={jumpToScene}
                        isReducedMotion={isReducedMotion}
                    />

                    {/* Bottom Right: Play / Pause Button for Video & 3D Animation */}
                    <button
                        type="button"
                        className="hero-play-pause-btn"
                        onClick={togglePlayPause}
                        aria-label={isPlaying ? 'Pause animation and video' : 'Play animation and video'}
                        title={isPlaying ? 'Pause animation' : 'Play animation'}
                    >
                        {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '2px' }} />}
                    </button>
                </section>

                {/* Attached Vehicle Finder: One thin subtle top separator spanning full width */}
                <VehicleFinder />
            </div>
        </div>
    );
}
