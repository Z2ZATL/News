"use client";

import { Float, Line, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

import styles from "./atlas.module.css";

function OrbitSystem() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.035;
    group.current.rotation.x = state.pointer.y * 0.04;
    group.current.rotation.z = state.pointer.x * -0.04;
  });

  return (
    <group ref={group}>
      <Line
        points={[
          [-4, -0.7, 0],
          [-2.4, 1.3, -0.5],
          [0, 0.1, 0.2],
          [2.8, -1.1, -0.4],
          [4, 0.8, 0],
        ]}
        color="#2fbff2"
        transparent
        opacity={0.22}
        lineWidth={0.7}
      />
      <Float speed={0.65} rotationIntensity={0.3} floatIntensity={0.55}>
        <mesh position={[0, 0.1, 0]}>
          <icosahedronGeometry args={[1.05, 3]} />
          <meshStandardMaterial
            color="#07131b"
            emissive="#0090d0"
            emissiveIntensity={0.34}
            metalness={0.92}
            roughness={0.18}
            wireframe
          />
        </mesh>
      </Float>
      {([
        [-3.2, 0.9, -0.8],
        [3.1, -0.7, -0.4],
        [2.3, 1.45, -1.2],
        [-2.1, -1.35, -0.7],
      ] satisfies Array<readonly [number, number, number]>).map(([x, y, z], index) => (
        <Float key={`${x}-${y}`} speed={0.35 + index * 0.08} floatIntensity={0.35}>
          <mesh position={[x, y, z]}>
            <sphereGeometry args={[0.08 + index * 0.015, 20, 20]} />
            <meshBasicMaterial color={index % 2 === 0 ? "#ffffff" : "#2fbff2"} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export function AtlasCanvas() {
  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            gl.domElement.style.display = "none";
          });
        }}
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[2, 3, 4]} intensity={14} color="#2fbff2" />
        <OrbitSystem />
        <Stars radius={45} depth={24} count={420} factor={1.4} saturation={0} fade speed={0.2} />
      </Canvas>
    </div>
  );
}
