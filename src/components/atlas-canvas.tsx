"use client";

import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  AdditiveBlending,
  BackSide,
  MathUtils,
  SRGBColorSpace,
  Vector3,
  type Group,
} from "three";

import {
  coordinatesToPosition,
  isPositionVisibleFromCamera,
} from "@/lib/atlas-geo";
import type { AtlasMapNode, AtlasScreenPosition } from "@/lib/atlas-types";

import styles from "./atlas.module.css";

function Earth({
  animate,
  nodes,
  onReady,
  onPositions,
  paused,
}: Readonly<{
  animate: boolean;
  nodes: AtlasMapNode[];
  onReady: () => void;
  onPositions: (positions: AtlasScreenPosition[]) => void;
  paused: boolean;
}>) {
  const group = useRef<Group>(null);
  const announcedReady = useRef(false);
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
    const earth = group.current;
    if (!earth) return;

    if (!announcedReady.current) {
      announcedReady.current = true;
      onReady();
    }

    if (animate && !paused) {
      earth.rotation.y += delta * 0.055;
      earth.rotation.x = MathUtils.lerp(
        earth.rotation.x,
        0.12 + state.pointer.y * 0.05,
        0.025,
      );
      earth.rotation.z = MathUtils.lerp(
        earth.rotation.z,
        -0.11 - state.pointer.x * 0.035,
        0.025,
      );
    }

    earth.updateWorldMatrix(true, false);
    onPositions(
      nodes.map((node) => {
        const worldPosition = new Vector3(...coordinatesToPosition(node.latitude, node.longitude));
        worldPosition.applyMatrix4(earth.matrixWorld);
        const visible = isPositionVisibleFromCamera(
          [worldPosition.x, worldPosition.y, worldPosition.z],
          [state.camera.position.x, state.camera.position.y, state.camera.position.z],
        );
        const projected = worldPosition.clone().project(state.camera);
        return {
          id: node.id,
          visible,
          x: MathUtils.clamp((projected.x + 1) * 50, 4, 96),
          y: MathUtils.clamp((1 - projected.y) * 50, 7, 93),
        };
      }),
    );
  });

  return (
    <group ref={group} rotation={[0.12, 1.65, -0.11]}>
      <mesh>
        <sphereGeometry args={[2.12, 64, 64]} />
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
        <sphereGeometry args={[2.12, 64, 64]} />
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

      <mesh scale={1.045}>
        <sphereGeometry args={[2.12, 64, 64]} />
        <meshBasicMaterial
          color="#13cfff"
          side={BackSide}
          transparent
          opacity={0.055}
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

export function AtlasCanvas({
  animate,
  nodes,
  onReady,
  onPositions,
  onUnavailable,
  paused,
}: Readonly<{
  animate: boolean;
  nodes: AtlasMapNode[];
  onReady: () => void;
  onPositions: (positions: AtlasScreenPosition[]) => void;
  onUnavailable: () => void;
  paused: boolean;
}>) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas
        aria-hidden="true"
        dpr={[1, 1.25]}
        frameloop={animate ? "always" : "demand"}
        camera={{ position: [0, 0, 7], fov: 43 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("aria-hidden", "true");
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            gl.domElement.style.display = "none";
            onUnavailable();
          });
        }}
      >
        <ambientLight intensity={1.35} color="#7fcfff" />
        <directionalLight position={[-2.5, 2.8, 4.8]} intensity={3.2} color="#ffffff" />
        <pointLight position={[4, 1, 3]} intensity={52} color="#00c8ff" distance={12} />
        <pointLight position={[-4, -1.5, 2]} intensity={42} color="#ff2bc2" distance={12} />
        <pointLight position={[0, -4, 1]} intensity={30} color="#ffb347" distance={10} />
        <Earth
          animate={animate}
          nodes={nodes}
          onPositions={onPositions}
          onReady={onReady}
          paused={paused || dragging}
        />
        <OrbitControls
          dampingFactor={0.08}
          enableDamping
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI - 0.35}
          minPolarAngle={0.35}
          onEnd={() => {
            setDragging(false);
          }}
          onStart={() => {
            setDragging(true);
          }}
          rotateSpeed={1.15}
        />
        <Stars radius={52} depth={30} count={560} factor={1.8} saturation={0.42} fade speed={0} />
      </Canvas>
    </div>
  );
}
