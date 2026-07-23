"use client";

import { Stars, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  MathUtils,
  SRGBColorSpace,
  type Group,
} from "three";

import styles from "./atlas.module.css";

function Earth({ reduceMotion }: Readonly<{ reduceMotion: boolean }>) {
  const group = useRef<Group>(null);
  const {
    earthMap,
    normalMap,
    specularMap,
    lightsMap,
  } = useTexture({
    earthMap: "/images/earth-atmos-2048.jpg",
    normalMap: "/images/earth-normal-2048.jpg",
    specularMap: "/images/earth-specular-2048.jpg",
    lightsMap: "/images/earth-lights-2048.png",
  });

  useEffect(() => {
    earthMap.colorSpace = SRGBColorSpace;
    lightsMap.colorSpace = SRGBColorSpace;
  }, [earthMap, lightsMap]);

  useFrame((state, delta) => {
    if (!group.current || reduceMotion) return;
    group.current.rotation.y += delta * 0.045;
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      0.12 + state.pointer.y * 0.05,
      0.025,
    );
    group.current.rotation.z = MathUtils.lerp(
      group.current.rotation.z,
      -0.11 - state.pointer.x * 0.035,
      0.025,
    );
  });

  return (
    <group ref={group} rotation={[0.12, -1.35, -0.11]}>
      <mesh>
        <sphereGeometry args={[2.12, 96, 96]} />
        <meshStandardMaterial
          map={earthMap}
          normalMap={normalMap}
          roughnessMap={specularMap}
          normalScale={[0.7, 0.7]}
          color="#dff7ff"
          emissive="#051936"
          emissiveIntensity={0.34}
          metalness={0.08}
          roughness={0.66}
        />
      </mesh>

      <mesh scale={1.004}>
        <sphereGeometry args={[2.12, 96, 96]} />
        <meshBasicMaterial
          map={lightsMap}
          transparent
          opacity={0.84}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.018}>
        <sphereGeometry args={[2.12, 42, 42]} />
        <meshBasicMaterial
          color="#5ce7ff"
          transparent
          opacity={0.13}
          wireframe
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.09}>
        <sphereGeometry args={[2.12, 64, 64]} />
        <meshBasicMaterial
          color="#13cfff"
          side={BackSide}
          transparent
          opacity={0.11}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[1.05, 0.14, 0.28]}>
        <torusGeometry args={[2.6, 0.009, 8, 220]} />
        <meshBasicMaterial
          color="#f42bd0"
          transparent
          opacity={0.62}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[1.48, -0.42, -0.28]}>
        <torusGeometry args={[2.82, 0.006, 8, 220]} />
        <meshBasicMaterial
          color="#55ecff"
          transparent
          opacity={0.44}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function AtlasCanvas() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 43 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            gl.domElement.style.display = "none";
          });
        }}
      >
        <ambientLight intensity={1.35} color="#7fcfff" />
        <directionalLight position={[-2.5, 2.8, 4.8]} intensity={3.2} color="#ffffff" />
        <pointLight position={[4, 1, 3]} intensity={52} color="#00c8ff" distance={12} />
        <pointLight position={[-4, -1.5, 2]} intensity={42} color="#ff2bc2" distance={12} />
        <pointLight position={[0, -4, 1]} intensity={30} color="#ffb347" distance={10} />
        <Earth reduceMotion={reduceMotion} />
        <Stars radius={52} depth={30} count={760} factor={1.8} saturation={0.42} fade speed={0.18} />
      </Canvas>
    </div>
  );
}
