import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { GameState } from "../game/types";
import { BOARD_TILES, GROUP_COLORS, PLAYER_COLORS, getTilePosition, getTileTextRotation } from "../game/board";

interface Board3DProps {
  gameState: GameState;
  isRolling: boolean;
  onTileClick?: (tileId: number) => void;
}

function BoardBase() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 12]} />
        <meshStandardMaterial color="#e8f5e9" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[8.8, 0.01, 8.8]} />
        <meshStandardMaterial color="#1a472a" />
      </mesh>
      <Text
        position={[0, 0.06, 0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.55}
        color="#FFD700"
        fontWeight="bold"
        outlineWidth={0.03}
        outlineColor="#1a1a2e"
      >
        MONOPOLI
      </Text>
      <Text
        position={[0, 0.06, 1.3]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.18}
        color="#90EE90"
      >
        Edisi Indonesia
      </Text>
    </group>
  );
}

function TileMesh({
  tile,
  onClick,
}: {
  tile: (typeof BOARD_TILES)[0];
  onClick?: () => void;
}) {
  const pos = getTilePosition(tile.id);
  const color = GROUP_COLORS[tile.group] || "#cccccc";
  const isCorner =
    tile.type === "go" ||
    tile.type === "jail" ||
    tile.type === "free-parking" ||
    tile.type === "go-to-jail";
  const size: [number, number, number] = isCorner
    ? [1.1, 0.08, 1.1]
    : [1.0, 0.06, 0.9];

  const textRotY = getTileTextRotation(tile.id);
  const shortName = (tile as any).shortName || tile.name.slice(0, 7);

  return (
    <group position={pos} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Color strip for properties */}
      {tile.type === "property" && (
        <mesh position={[0, 0.042, 0]}>
          <boxGeometry args={[0.88, 0.005, 0.22]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Tile name label */}
      {!isCorner && (
        <Text
          position={[0, 0.055, 0]}
          rotation={[-Math.PI / 2, 0, textRotY]}
          fontSize={0.095}
          color="#ffffff"
          maxWidth={0.85}
          textAlign="center"
          outlineWidth={0.015}
          outlineColor="#000000"
          anchorX="center"
          anchorY="middle"
        >
          {shortName}
        </Text>
      )}

      {/* Corner labels */}
      {isCorner && (
        <Text
          position={[0, 0.055, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.14}
          color="#FFD700"
          fontWeight="bold"
          outlineWidth={0.02}
          outlineColor="#000000"
          anchorX="center"
          anchorY="middle"
        >
          {tile.name === "GO"
            ? "GO"
            : tile.name === "Penjara"
            ? "🔒 PENJARA"
            : tile.name === "Parkir Gratis"
            ? "🅿 PARKIR"
            : "KE\nPENJARA"}
        </Text>
      )}
    </group>
  );
}

function HousesMesh({ tile }: { tile: (typeof BOARD_TILES)[0] }) {
  const pos = getTilePosition(tile.id);
  if (tile.houses === 0 && !tile.hotel) return null;

  if (tile.hotel) {
    return (
      <mesh position={[pos[0], pos[1] + 0.2, pos[2]]}>
        <boxGeometry args={[0.35, 0.28, 0.35]} />
        <meshStandardMaterial
          color="#cc0000"
          emissive="#ff0000"
          emissiveIntensity={0.4}
        />
      </mesh>
    );
  }

  const houses = [];
  for (let i = 0; i < tile.houses; i++) {
    houses.push(
      <mesh
        key={i}
        position={[pos[0] + (i - (tile.houses - 1) / 2) * 0.22, pos[1] + 0.14, pos[2]]}
      >
        <boxGeometry args={[0.16, 0.18, 0.16]} />
        <meshStandardMaterial
          color="#00aa00"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
    );
  }
  return <>{houses}</>;
}

function PlayerPawn({
  player,
  allPlayers,
  isMoving,
}: {
  player: GameState["players"][0];
  allPlayers: GameState["players"];
  isMoving: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pos = getTilePosition(player.position);
  const color = PLAYER_COLORS[player.color] || "#ffffff";

  const samePos = allPlayers.filter(
    (p) => p.position === player.position && !p.bankrupt
  );
  const idx = samePos.findIndex((p) => p.id === player.id);
  const offsetX = (idx % 2) * 0.32 - 0.16;
  const offsetZ = Math.floor(idx / 2) * 0.32 - 0.16;

  const timeRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    if (isMoving) {
      // Excited bounce + spin when moving
      const bounce = Math.abs(Math.sin(timeRef.current * 12)) * 0.35;
      groupRef.current.position.y = pos[1] + 0.25 + bounce;
      groupRef.current.rotation.y += delta * 8;
    } else {
      // Gentle idle float
      const idle = Math.sin(timeRef.current * 2 + player.id) * 0.04;
      groupRef.current.position.y = pos[1] + 0.25 + idle;
      groupRef.current.rotation.y += delta * 0.8;
    }
  });

  if (player.bankrupt) return null;

  return (
    <group
      ref={groupRef}
      position={[pos[0] + offsetX, pos[1] + 0.25, pos[2] + offsetZ]}
    >
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.32, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* Crown/hat */}
      <mesh position={[0, 0.37, 0]}>
        <coneGeometry args={[0.07, 0.12, 6]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.6} />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.13, 0.18, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// Animated rolling die
function AnimatedDie({
  finalValue,
  offset,
  isRolling,
  rollSeed,
}: {
  finalValue: number;
  offset: [number, number, number];
  isRolling: boolean;
  rollSeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const rollingRef = useRef(isRolling);

  useEffect(() => {
    rollingRef.current = isRolling;
    if (isRolling) timeRef.current = 0;
  }, [isRolling]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    if (rollingRef.current) {
      // Fast spin during roll
      meshRef.current.rotation.x += delta * 18 * (rollSeed % 2 === 0 ? 1 : -1);
      meshRef.current.rotation.z += delta * 14 * (rollSeed % 3 === 0 ? 1 : -1);
      meshRef.current.rotation.y += delta * 10;
    } else {
      // Slowly settle
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        0,
        delta * 5
      );
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        0,
        delta * 5
      );
    }
  });

  const dotPositions: Record<number, [number, number, number][]> = {
    1: [[0, 0, 0]],
    2: [[-0.11, 0.11, 0], [0.11, -0.11, 0]],
    3: [[-0.11, 0.11, 0], [0, 0, 0], [0.11, -0.11, 0]],
    4: [[-0.11, 0.11, 0], [0.11, 0.11, 0], [-0.11, -0.11, 0], [0.11, -0.11, 0]],
    5: [[-0.11, 0.11, 0], [0.11, 0.11, 0], [0, 0, 0], [-0.11, -0.11, 0], [0.11, -0.11, 0]],
    6: [[-0.11, 0.11, 0], [0.11, 0.11, 0], [-0.11, 0, 0], [0.11, 0, 0], [-0.11, -0.11, 0], [0.11, -0.11, 0]],
  };

  return (
    <group position={offset}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial
          color="white"
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {!isRolling &&
        (dotPositions[finalValue] || []).map((dp, i) => (
          <mesh key={i} position={[dp[0], dp[1], 0.22]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
    </group>
  );
}

export default function Board3D({
  gameState,
  isRolling,
  onTileClick,
}: Board3DProps) {
  const isMoving = gameState.phase === "moving";

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 14, 10], fov: 45 }}
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[0, 8, 0]} intensity={0.6} color="#fff9e6" />
        <pointLight position={[0, 5, 0]} intensity={0.3} color="#4fc3f7" />

        <BoardBase />

        {BOARD_TILES.map((tile) => (
          <TileMesh
            key={tile.id}
            tile={tile}
            onClick={() => onTileClick?.(tile.id)}
          />
        ))}

        {gameState.tiles.map((tile) => (
          <HousesMesh key={tile.id} tile={tile} />
        ))}

        {gameState.players.map((player) => (
          <PlayerPawn
            key={player.id}
            player={player}
            allPlayers={gameState.players}
            isMoving={
              isMoving &&
              player.id === gameState.players[gameState.currentPlayerIndex].id
            }
          />
        ))}

        {/* Animated dice in center */}
        {gameState.lastRoll && (
          <group position={[0, 0.6, 0]}>
            <AnimatedDie
              finalValue={gameState.lastRoll[0]}
              offset={[-0.4, 0, 0]}
              isRolling={isRolling}
              rollSeed={1}
            />
            <AnimatedDie
              finalValue={gameState.lastRoll[1]}
              offset={[0.4, 0, 0]}
              isRolling={isRolling}
              rollSeed={2}
            />
          </group>
        )}

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={22}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
