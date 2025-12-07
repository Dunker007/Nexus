'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function NeuralNodes({ count = 200 }) {
    const ref = useRef<THREE.Points>(null);

    // Generate random positions for nodes
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return pos;
    }, [count]);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.05;
            ref.current.rotation.y = state.clock.elapsedTime * 0.08;

            // Pulse effect
            const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
            ref.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#00f5d4"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.8}
            />
        </Points>
    );
}

function ConnectionLines({ count = 50 }) {
    const ref = useRef<THREE.LineSegments>(null);

    const geometry = useMemo(() => {
        const positions = new Float32Array(count * 6);
        for (let i = 0; i < count; i++) {
            // Start point
            positions[i * 6] = (Math.random() - 0.5) * 8;
            positions[i * 6 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 6 + 2] = (Math.random() - 0.5) * 8;
            // End point
            positions[i * 6 + 3] = (Math.random() - 0.5) * 8;
            positions[i * 6 + 4] = (Math.random() - 0.5) * 8;
            positions[i * 6 + 5] = (Math.random() - 0.5) * 8;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geo;
    }, [count]);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.03;
            ref.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <lineSegments ref={ref} geometry={geometry}>
            <lineBasicMaterial color="#c77dff" transparent opacity={0.2} />
        </lineSegments>
    );
}

function FloatingOrb() {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
            ref.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshBasicMaterial color="#7b2ff7" transparent opacity={0.3} />
        </mesh>
    );
}

export default function NeuralNetwork() {
    return (
        <div className="neural-canvas">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <NeuralNodes count={300} />
                <ConnectionLines count={80} />
                <FloatingOrb />
            </Canvas>
        </div>
    );
}
