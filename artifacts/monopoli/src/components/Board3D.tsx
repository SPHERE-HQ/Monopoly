import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { GameState, Tile } from "../game/types";
import { BOARD_TILES, GROUP_COLORS, PLAYER_COLORS, getTilePosition, getTileTextRotation } from "../game/board";

interface Board3DProps {
  gameState: GameState;
  isRolling: boolean;
  onTileClick?: (tileId: number) => void;
}

function BoardBase() {
  return (
    <group>
      {/* Outer board surface — cream/white */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[12.4, 0.1, 12.4]} />
        <meshStandardMaterial color="#fffde7" roughness={0.8} />
      </mesh>
      {/* Inner center — bright green felt */}
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[8.9, 0.01, 8.9]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>
      {/* Border frame — gold */}
      {[
        [0, 0, 6.15] as [number,number,number],
        [0, 0, -6.15] as [number,number,number],
        [6.15, 0, 0] as [number,number,number],
        [-6.15, 0, 0] as [number,number,number],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={i < 2 ? [12.4, 0.02, 0.12] : [0.12, 0.02, 12.4]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <Text
        position={[0, 0.07, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.65}
        color="#FFD700"
        fontWeight="bold"
        outlineWidth={0.04}
        outlineColor="#1b5e20"
      >
        MONOPOLI
      </Text>
      <Text
        position={[0, 0.07, 1.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.22}
        color="#a5d6a7"
        outlineWidth={0.02}
        outlineColor="#1b5e20"
      >
        🇮🇩 Edisi Indonesia
      </Text>
    </group>
  );
}

/* Decide if text should be dark or light based on tile background */
function needsDarkText(color: string): boolean {
  const bright = ["#fdd835", "#29b6f6", "#fb8c00", "#fffde7", "#ef9a9a", "#ff8f00", "#00acc1"];
  return bright.includes(color);
}

function TileMesh({ tile, onClick }: { tile: (typeof BOARD_TILES)[0]; onClick?: () => void }) {
  const pos = getTilePosition(tile.id);
  const groupColor = GROUP_COLORS[tile.group] || "#cccccc";
  const isCorner = ["go", "jail", "free-parking", "go-to-jail"].includes(tile.type);

  const size: [number, number, number] = isCorner ? [1.1, 0.09, 1.1] : [1.04, 0.07, 0.92];

  const textRotY = getTileTextRotation(tile.id);
  const useDark = needsDarkText(groupColor);
  const textColor = useDark ? "#1a1a1a" : "#ffffff";

  const displayName = tile.name;

  return (
    <group position={pos} onClick={onClick}>
      {/* Tile body — white/cream base for readability */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={isCorner ? groupColor : "#fafafa"} roughness={0.7} />
      </mesh>

      {/* Color band on top for property tiles */}
      {tile.type === "property" && (
        <mesh position={[0, 0.048, -0.31]}>
          <boxGeometry args={[0.92, 0.008, 0.26]} />
          <meshStandardMaterial color={groupColor} emissive={groupColor} emissiveIntensity={0.25} />
        </mesh>
      )}

      {/* Colored accent strip for non-corner special tiles */}
      {!isCorner && tile.type !== "property" && (
        <mesh position={[0, 0.047, -0.35]}>
          <boxGeometry args={[0.92, 0.006, 0.16]} />
          <meshStandardMaterial color={groupColor} emissive={groupColor} emissiveIntensity={0.35} />
        </mesh>
      )}

      {/* Tile name text — clear, dark on white body */}
      {!isCorner && (
        <Text
          position={[0, 0.062, 0.06]}
          rotation={[-Math.PI / 2, 0, textRotY]}
          fontSize={0.108}
          color="#111111"
          maxWidth={0.82}
          lineHeight={1.15}
          textAlign="center"
          outlineWidth={0.008}
          outlineColor="#ffffff"
          anchorX="center"
          anchorY="middle"
          overflowWrap="break-word"
        >
          {displayName}
        </Text>
      )}

      {/* Price label below name for buyable tiles */}
      {!isCorner && (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") && (
        <Text
          position={[0, 0.062, 0.34]}
          rotation={[-Math.PI / 2, 0, textRotY]}
          fontSize={0.082}
          color={groupColor}
          maxWidth={0.82}
          textAlign="center"
          outlineWidth={0.01}
          outlineColor="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`M${tile.price}`}
        </Text>
      )}

      {/* Corner labels */}
      {isCorner && (
        <Text
          position={[0, 0.062, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.17}
          color={tile.type === "go" ? "#e53935" : tile.type === "go-to-jail" ? "#e53935" : "#1a1a2e"}
          fontWeight="bold"
          outlineWidth={0.022}
          outlineColor="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {tile.type === "go" ? "GO"
            : tile.type === "jail" ? "PENJARA"
            : tile.type === "free-parking" ? "PARKIR\nGRATIS"
            : "KE\nPENJARA"}
        </Text>
      )}
    </group>
  );
}

function HousesMesh({ tile }: { tile: Tile }) {
  const pos = getTilePosition(tile.id);

  if (tile.landmark) return <LandmarkMesh pos={pos} />;

  if (tile.hotel) {
    return (
      <group position={[pos[0], pos[1], pos[2]]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.38, 0.26, 0.38]} />
          <meshStandardMaterial color="#cc0000" emissive="#ff3300" emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.34, 0]} castShadow>
          <coneGeometry args={[0.22, 0.16, 4]} />
          <meshStandardMaterial color="#990000" emissive="#cc2200" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
        </mesh>
      </group>
    );
  }

  if (tile.houses === 0) return null;

  const count = tile.houses;
  return (
    <group position={[pos[0], pos[1], pos[2]]}>
      {Array.from({ length: count }).map((_, i) => {
        const xOff = (i - (count - 1) / 2) * 0.22;
        return (
          <group key={i} position={[xOff, 0, 0]}>
            <mesh position={[0, 0.1, 0]} castShadow>
              <boxGeometry args={[0.16, 0.14, 0.16]} />
              <meshStandardMaterial color="#00cc44" emissive="#00ff66" emissiveIntensity={0.3} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.21, 0]} castShadow>
              <coneGeometry args={[0.12, 0.11, 4]} />
              <meshStandardMaterial color="#006622" emissive="#009933" emissiveIntensity={0.25} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function LandmarkMesh({ pos }: { pos: [number, number, number] }) {
  const starRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (starRef.current) starRef.current.rotation.y += delta * 1.8;
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.9;
  });

  return (
    <group position={[pos[0], pos[1], pos[2]]}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.1, 8]} />
        <meshStandardMaterial color="#B8860B" emissive="#DAA520" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.14, 0.52, 6]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.7} metalness={0.9} roughness={0.1} />
      </mesh>
      {[0.18, 0.35, 0.52].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.1, 0.015, 6, 16]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} metalness={1} roughness={0} />
        </mesh>
      ))}
      <mesh position={[0, 0.65, 0]} castShadow>
        <coneGeometry args={[0.1, 0.18, 4]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFAA00" emissiveIntensity={0.9} metalness={1} roughness={0} />
      </mesh>
      <mesh ref={starRef} position={[0, 0.82, 0]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFDD00" emissiveIntensity={2.5} metalness={1} roughness={0} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.55, 0]}>
        <torusGeometry args={[0.18, 0.012, 8, 24]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1.8} metalness={1} roughness={0} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function PlayerPawn({
  player, allPlayers, isMoving,
}: {
  player: GameState["players"][0];
  allPlayers: GameState["players"];
  isMoving: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pos = getTilePosition(player.position);
  const color = PLAYER_COLORS[player.color] || "#ffffff";
  const samePos = allPlayers.filter(p => p.position === player.position && !p.bankrupt);
  const idx = samePos.findIndex(p => p.id === player.id);
  const offsetX = (idx % 2) * 0.32 - 0.16;
  const offsetZ = Math.floor(idx / 2) * 0.32 - 0.16;
  const timeRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    if (isMoving) {
      const bounce = Math.abs(Math.sin(timeRef.current * 12)) * 0.35;
      groupRef.current.position.y = pos[1] + 0.25 + bounce;
      groupRef.current.rotation.y += delta * 8;
    } else {
      const idle = Math.sin(timeRef.current * 2 + player.id) * 0.04;
      groupRef.current.position.y = pos[1] + 0.25 + idle;
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

function AnimatedDie({ finalValue, offset, isRolling, rollSeed }: {
  finalValue: number; offset: [number, number, number]; isRolling: boolean; rollSeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    if (isRolling) {
      meshRef.current.rotation.x += delta * 18 * (rollSeed % 2 === 0 ? 1 : -1);
      meshRef.current.rotation.z += delta * 14 * (rollSeed % 3 === 0 ? 1 : -1);
      meshRef.current.rotation.y += delta * 10;
    } else {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 5);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 5);
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
        <boxGeometry args={[0.44, 0.44, 0.44]} />
        <meshStandardMaterial color="white" roughness={0.15} metalness={0.1} />
      </mesh>
      {!isRolling && (dotPositions[finalValue] || []).map((dp, i) => (
        <mesh key={i} position={[dp[0], dp[1], 0.23]}>
          <sphereGeometry args={[0.046, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}

export default function Board3D({ gameState, isRolling, onTileClick }: Board3DProps) {
  const isMoving = gameState.phase === "moving";

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 14, 10], fov: 45 }}
        style={{
          background: "linear-gradient(160deg, #e0f7fa 0%, #b2ebf2 25%, #e8f5e9 55%, #fff9c4 100%)",
        }}
      >
        {/* Bright, cheerful lighting */}
        <ambientLight intensity={1.2} color="#fff8f0" />
        <directionalLight
          position={[8, 18, 8]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          color="#fff5e0"
        />
        <directionalLight position={[-8, 10, -8]} intensity={0.6} color="#e0f0ff" />
        <pointLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
        <pointLight position={[6, 4, 6]}  intensity={0.4} color="#ffe082" />
        <pointLight position={[-6, 4, -6]} intensity={0.4} color="#b3e5fc" />

        <BoardBase />

        {BOARD_TILES.map(tile => (
          <TileMesh key={tile.id} tile={tile} onClick={() => onTileClick?.(tile.id)} />
        ))}

        {gameState.tiles.map(tile => (
          <HousesMesh key={tile.id} tile={tile} />
        ))}

        {gameState.players.map(player => (
          <PlayerPawn
            key={player.id}
            player={player}
            allPlayers={gameState.players}
            isMoving={isMoving && player.id === gameState.players[gameState.currentPlayerIndex].id}
          />
        ))}

        {gameState.lastRoll && (
          <group position={[0, 0.7, 0]}>
            <AnimatedDie finalValue={gameState.lastRoll[0]} offset={[-0.45, 0, 0]} isRolling={isRolling} rollSeed={1} />
            <AnimatedDie finalValue={gameState.lastRoll[1]} offset={[0.45, 0, 0]} isRolling={isRolling} rollSeed={2} />
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
