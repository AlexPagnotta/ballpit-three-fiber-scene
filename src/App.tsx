import { Canvas, useThree } from "@react-three/fiber";
import "./App.css";
import {
  RigidBody,
  Physics,
  CuboidCollider,
  InstancedRigidBodyProps,
  InstancedRigidBodies,
  RapierRigidBody,
} from "@react-three/rapier";
import { useControls } from "leva";
import { useMemo, useRef } from "react";
import { OrbitControls } from "@react-three/drei";

const SPHERES_COUNT = 15;
const SPHERE_RADIUS = 1;

const PANELS_GAP = SPHERE_RADIUS + 0.2;
const PANELS_THICKNESS = 4;
const PANELS_OFFSET = 100; // Needs to be more than spheres count, otherwise they will spawn ouside the panels

const Container = () => {
  const { viewport } = useThree();

  const panelsWidth = viewport.width / 2;
  const panelsHeight = viewport.height / 2;

  return (
    <>
      <RigidBody type="fixed" key={`${viewport.width}${viewport.height}`}>
        {/*Bottom*/}
        <CuboidCollider
          args={[
            panelsWidth,
            PANELS_THICKNESS,
            PANELS_THICKNESS * 2 + PANELS_GAP,
          ]}
          position={[0, -panelsHeight - PANELS_THICKNESS, 0]}
        />
        {/*Sides*/}
        <CuboidCollider
          args={[
            PANELS_THICKNESS,
            panelsHeight + PANELS_OFFSET,
            PANELS_THICKNESS * 2 + PANELS_GAP,
          ]}
          position={[-(panelsWidth + PANELS_THICKNESS), PANELS_OFFSET, 0]}
        />
        <CuboidCollider
          args={[
            PANELS_THICKNESS,
            panelsHeight + PANELS_OFFSET,
            PANELS_THICKNESS * 2 + PANELS_GAP,
          ]}
          position={[panelsWidth + PANELS_THICKNESS, PANELS_OFFSET, 0]}
        />
        {/*Panels*/}
        <CuboidCollider
          args={[panelsWidth, panelsHeight + PANELS_OFFSET, PANELS_THICKNESS]}
          position={[0, PANELS_OFFSET, PANELS_THICKNESS + PANELS_GAP]}
        />
        <CuboidCollider
          args={[panelsWidth, panelsHeight + PANELS_OFFSET, PANELS_THICKNESS]}
          position={[0, PANELS_OFFSET, -(PANELS_THICKNESS + PANELS_GAP)]}
        />
      </RigidBody>
    </>
  );
};

const InstancedSpheres = () => {
  const spheresRef = useRef<RapierRigidBody[]>(null);

  const { viewport } = useThree();

  const { restitution } = useControls("Spheres", {
    restitution: 0.5,
  });

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];

    const viewportWidth = viewport.width / 2;
    const viewportHeight = viewport.height / 2;

    // Calculate numbers of spheres that can fit horizontally
    const horizontalSpheres = Math.floor(viewportWidth / SPHERE_RADIUS);

    const sphereDiameter = SPHERE_RADIUS * 2;

    for (let i = 0; i < SPHERES_COUNT; i++) {
      instances.push({
        key: "instance_" + i,
        position: [
          (Math.random() - 0.5) * 2 * (horizontalSpheres / 2),
          viewportHeight + i * sphereDiameter + 4, // 4 is the offset over the viewport
          0,
        ],
      });
    }

    return instances;
  }, []);

  const onClick = (index: number) => {
    if (!spheresRef.current) return;

    const sphere = spheresRef.current[index];
    sphere.applyImpulse({ x: (Math.random() - 0.5) * 4, y: 50, z: 0 }, true);
  };

  return (
    <InstancedRigidBodies
      ref={spheresRef}
      instances={instances}
      colliders="ball"
      restitution={restitution}
      key={`${restitution}`}
    >
      <instancedMesh
        args={[undefined, undefined, SPHERES_COUNT]}
        count={SPHERES_COUNT}
        castShadow
        receiveShadow
        frustumCulled={false}
        onClick={({ instanceId }) => {
          if (instanceId !== undefined) onClick(instanceId);
        }}
      >
        <sphereGeometry args={[SPHERE_RADIUS, 32, 32]} />
        <meshStandardMaterial color="tomato" />
      </instancedMesh>
    </InstancedRigidBodies>
  );
};

const App = () => {
  const { debug, orbitControls } = useControls("Settings", {
    debug: false,
    orbitControls: false,
  });

  return (
    <Canvas
      shadows
      orthographic
      camera={{
        position: [0, 0, 50],
        zoom: 50,
      }}
    >
      {orbitControls && <OrbitControls />}

      <ambientLight intensity={1.5} />
      <directionalLight position={[-2, 2, 3]} intensity={1.5} castShadow />

      <Physics debug={debug}>
        <Container />
        <InstancedSpheres />
      </Physics>
    </Canvas>
  );
};

export default App;
