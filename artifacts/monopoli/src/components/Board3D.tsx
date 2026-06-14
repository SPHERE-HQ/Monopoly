import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { GameState, Tile } from "../game/types";
import { BOARD_TILES, GROUP_COLORS, PLAYER_COLORS, getTilePosition, getTileTextRotation } from "../game/board";

interface Board3DProps {
  gameState: GameState;
  isRolling: boolean;
  pawnPositions?: Record<number, number>;
}

function BoardBase() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[12.4, 0.1, 12.4]} />
        <meshStandardMaterial color="#fffde7" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[8.9, 0.01, 8.9]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>
      {([
        [0, 0, 6.15, 12.4, 0.02, 0.12],
        [0, 0, -6.15, 12.4, 0.02, 0.12],
        [6.15, 0, 0, 0.12, 0.02, 12.4],
        [-6.15, 0, 0, 0.12, 0.02, 12.4],
      ] as [number,number,number,number,number,number][]).map((d, i) => (
        <mesh key={i} position={[d[0], d[1], d[2]]}>
          <boxGeometry args={[d[3], d[4], d[5]]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <Text position={[0, 0.07, 0.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.65}
        color="#FFD700" fontWeight="bold" outlineWidth={0.04} outlineColor="#1b5e20">
        MONOPOLI
      </Text>
      <Text position={[0, 0.07, 1.35]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.22}
        color="#a5d6a7" outlineWidth={0.02} outlineColor="#1b5e20">
        🇮🇩 Edisi Indonesia
      </Text>
    </group>
  );
}

function TileMesh({ tile, onClick }: { tile: (typeof BOARD_TILES)[0]; onClick?: () => void }) {
  const pos = getTilePosition(tile.id);
  const groupColor = GROUP_COLORS[tile.group] || "#cccccc";
  const isCorner = ["go", "jail", "free-parking", "go-to-jail"].includes(tile.type);
  const size: [number, number, number] = isCorner ? [1.1, 0.09, 1.1] : [1.04, 0.07, 0.92];
  const textRotY = getTileTextRotation(tile.id);

  return (
    <group position={pos} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={isCorner ? groupColor : "#fafafa"} roughness={0.7} />
      </mesh>
      {tile.type === "property" && (
        <mesh position={[0, 0.048, -0.31]}>
          <boxGeometry args={[0.92, 0.008, 0.26]} />
          <meshStandardMaterial color={groupColor} emissive={groupColor} emissiveIntensity={0.25} />
        </mesh>
      )}
      {!isCorner && tile.type !== "property" && (
        <mesh position={[0, 0.047, -0.35]}>
          <boxGeometry args={[0.92, 0.006, 0.16]} />
          <meshStandardMaterial color={groupColor} emissive={groupColor} emissiveIntensity={0.35} />
        </mesh>
      )}
      {!isCorner && (
        <Text position={[0, 0.062, 0.06]} rotation={[-Math.PI / 2, 0, textRotY]}
          fontSize={0.108} color="#111111" maxWidth={0.82} lineHeight={1.15}
          textAlign="center" outlineWidth={0.008} outlineColor="#ffffff"
          anchorX="center" anchorY="middle" overflowWrap="break-word">
          {tile.name}
        </Text>
      )}
      {!isCorner && (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") && (
        <Text position={[0, 0.062, 0.34]} rotation={[-Math.PI / 2, 0, textRotY]}
          fontSize={0.082} color={groupColor} maxWidth={0.82}
          textAlign="center" outlineWidth={0.01} outlineColor="#ffffff"
          anchorX="center" anchorY="middle">
          {`M${tile.price}`}
        </Text>
      )}
      {isCorner && (
        <Text position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.17} color={tile.type === "go" || tile.type === "go-to-jail" ? "#e53935" : "#1a1a2e"}
          fontWeight="bold" outlineWidth={0.022} outlineColor="#ffffff"
          anchorX="center" anchorY="middle">
          {tile.type === "go" ? "GO"
            : tile.type === "jail" ? "PENJARA"
            : tile.type === "free-parking" ? "PARKIR\nGRATIS"
            : "KE\nPENJARA"}
        </Text>
      )}
    </group>
  );
}

// ── Rumah (1-2): kubus hijau pendek
// ── Apartemen (3-4): kubus biru sedang
// ── Hotel: kubus merah tinggi + antena emas
// ── Landmark: kubus emas tertinggi, berputar
function HousesMesh({ tile }: { tile: Tile }) {
  const pos = getTilePosition(tile.id);

  if (tile.landmark) return <LandmarkMesh pos={pos} />;
  if (tile.hotel)    return <HotelMesh pos={pos} />;
  if (!tile.houses)  return null;

  const isApt   = tile.houses >= 3;
  const count   = tile.houses;
  const h       = isApt ? 0.40 : 0.20;
  const w       = isApt ? 0.18 : 0.15;
  const color   = isApt ? "#3b82f6" : "#22c55e";
  const emissive = isApt ? "#1d4ed8" : "#15803d";
  const roofClr = isApt ? "#1e3a8a" : "#166534";

  return (
    <group position={pos}>
      {Array.from({ length: count }).map((_, i) => {
        const xOff = (i - (count - 1) / 2) * (w + 0.04);
        return (
          <group key={i} position={[xOff, 0, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow>
              <boxGeometry args={[w, h, w]} />
              <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} roughness={0.45} />
            </mesh>
            <mesh position={[0, h + 0.015, 0]}>
              <boxGeometry args={[w + 0.02, 0.03, w + 0.02]} />
              <meshStandardMaterial color={roofClr} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function HotelMesh({ pos }: { pos: [number, number, number] }) {
  const h = 0.58; const w = 0.30;
  return (
    <group position={pos}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, w]} />
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, h + 0.02, 0]}>
        <boxGeometry args={[w + 0.04, 0.04, w + 0.04]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
      </mesh>
      <mesh position={[0, h + 0.10, 0]}>
        <boxGeometry args={[0.03, 0.14, 0.03]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} metalness={1} roughness={0} />
      </mesh>
    </group>
  );
}

function LandmarkMesh({ pos }: { pos: [number, number, number] }) {
  const bodyRef  = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const h = 0.78; const w = 0.26;

  useFrame((_, delta) => {
    if (bodyRef.current)  bodyRef.current.rotation.y  += delta * 1.6;
    if (crownRef.current) crownRef.current.rotation.y -= delta * 2.2;
  });

  return (
    <group position={pos}>
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[w + 0.08, 0.05, w + 0.08]} />
        <meshStandardMaterial color="#B8860B" emissive="#DAA520" emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh ref={bodyRef} position={[0, h / 2 + 0.05, 0]} castShadow>
        <boxGeometry args={[w, h, w]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.7} metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh ref={crownRef} position={[0, h + 0.08, 0]}>
        <boxGeometry args={[w + 0.06, 0.06, w + 0.06]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFDD00" emissiveIntensity={2.0} metalness={1} roughness={0} />
      </mesh>
    </group>
  );
}

function PlayerPawn({ player, allPlayers, isMoving, overridePosition }: {
  player: GameState["players"][0];
  allPlayers: GameState["players"];
  isMoving: boolean;
  overridePosition?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const effectivePos = overridePosition ?? player.position;
  const pos = getTilePosition(effectivePos);
  const color = PLAYER_COLORS[player.color] || "#ffffff";

  const samePos = allPlayers.filter(p => {
    const ep = overridePosition !== undefined && p.id === player.id ? overridePosition : p.position;
    return ep === effectivePos && !p.bankrupt;
  });
  const idx = samePos.findIndex(p => p.id === player.id);
  const offsetX = (idx % 2) * 0.32 - 0.16;
  const offsetZ = Math.floor(idx / 2) * 0.32 - 0.16;
  const timeRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    if (isMoving) {
      const bounce = Math.abs(Math.sin(timeRef.current * 14)) * 0.40;
      groupRef.current.position.set(pos[0] + offsetX, pos[1] + 0.25 + bounce, pos[2] + offsetZ);
      groupRef.current.rotation.y += delta * 10;
    } else {
      const idle = Math.sin(timeRef.current * 2 + player.id) * 0.04;
      groupRef.current.position.set(pos[0] + offsetX, pos[1] + 0.25 + idle, pos[2] + offsetZ);
      groupRef.current.rotation.y += delta * 0.8;
    }
  });

  if (player.bankrupt) return null;

  return (
    <group ref={groupRef} position={[pos[0] + offsetX, pos[1] + 0.25, pos[2] + offsetZ]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.32, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.24, 0]} castShadow>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <coneGeometry args={[0.07, 0.12, 6]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.13, 0.18, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function AnimatedDie({ finalValue, offset, isRolling, seed }: {
  finalValue: number; offset: [number, number, number]; isRolling: boolean; seed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    t.current += delta;
    if (isRolling) {
      meshRef.current.rotation.x += delta * 18 * (seed % 2 ? 1 : -1);
      meshRef.current.rotation.z += delta * 14 * (seed % 3 ? 1 : -1);
      meshRef.current.rotation.y += delta * 10;
    } else {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 5);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 5);
    }
  });

  const dotPos: Record<number, [number, number, number][]> = {
    1: [[0,0,0]],
    2: [[-0.11,0.11,0],[0.11,-0.11,0]],
    3: [[-0.11,0.11,0],[0,0,0],[0.11,-0.11,0]],
    4: [[-0.11,0.11,0],[0.11,0.11,0],[-0.11,-0.11,0],[0.11,-0.11,0]],
    5: [[-0.11,0.11,0],[0.11,0.11,0],[0,0,0],[-0.11,-0.11,0],[0.11,-0.11,0]],
    6: [[-0.11,0.11,0],[0.11,0.11,0],[-0.11,0,0],[0.11,0,0],[-0.11,-0.11,0],[0.11,-0.11,0]],
  };

  return (
    <group position={offset}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.44, 0.44, 0.44]} />
        <meshStandardMaterial color="white" roughness={0.15} metalness={0.1} />
      </mesh>
      {!isRolling && (dotPos[finalValue] || []).map((dp, i) => (
        <mesh key={i} position={[dp[0], dp[1], 0.23]}>
          <sphereGeometry args={[0.046, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}

export default function Board3D({ gameState, isRolling, pawnPositions = {} }: Board3DProps) {
  const isMoving = gameState.phase === "moving";
  const currentPId = gameState.players[gameState.currentPlayerIndex]?.id;

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 14, 10], fov: 45 }}
        style={{ background: "linear-gradient(160deg, #e0f7fa 0%, #b2ebf2 25%, #e8f5e9 55%, #fff9c4 100%)" }}
      >
        <ambientLight intensity={1.2} color="#fff8f0" />
        <directionalLight position={[8, 18, 8]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} color="#fff5e0" />
        <directionalLight position={[-8, 10, -8]} intensity={0.6} color="#e0f0ff" />
        <pointLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
        <pointLight position={[6, 4, 6]} intensity={0.4} color="#ffe082" />
        <pointLight position={[-6, 4, -6]} intensity={0.4} color="#b3e5fc" />

        <BoardBase />

        {BOARD_TILES.map(tile => (
          <TileMesh key={tile.id} tile={tile} />
        ))}

        {gameState.tiles.map(tile => (
          <HousesMesh key={tile.id} tile={tile} />
        ))}

        {gameState.players.map(player => (
          <PlayerPawn
            key={player.id}
            player={player}
            allPlayers={gameState.players}
            isMoving={isMoving && player.id === currentPId}
            overridePosition={pawnPositions[player.id]}
          />
        ))}

        {gameState.lastRoll && (
          <group position={[0, 0.7, 0]}>
            <AnimatedDie finalValue={gameState.lastRoll[0]} offset={[-0.45, 0, 0]} isRolling={isRolling} seed={1} />
            <AnimatedDie finalValue={gameState.lastRoll[1]} offset={[0.45, 0, 0]} isRolling={isRolling} seed={2} />
          </group>
        )}

        <OrbitControls enablePan={false} minDistance={8} maxDistance={22}
          minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}
