import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Scene 2 & 3: Three.js 3D Automotive Exploded View
 * Realistic mechanical performance assembly separating into individual components
 */
export default function HeroExplodedView({
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
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

        // AUTO PARTS Signature Orange Rim Light (#F36B16)
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
