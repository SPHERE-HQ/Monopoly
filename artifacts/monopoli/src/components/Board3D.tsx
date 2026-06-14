import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { GameState } from "../game/types";
import { BOARD_TILES, GROUP_COLORS, PLAYER_COLORS, getTilePosition } from "../game/board";

interface Board3DProps {
  gameState: GameState;
  onTileClick?: (tileId: number) => void;
}

function BoardBase() {
  return (
    <group>
      {/* Board surface */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[12, 0.1, 12]} />
        <meshStandardMaterial color="#e8f5e9" />
      </mesh>
      {/* Center area */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[8.8, 0.01, 8.8]} />
        <meshStandardMaterial color="#c8e6c9" />
      </mesh>
      {/* Center text */}
      <Text
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#2d6a4f"
        fontWeight="bold"
      >
        MONOPOLI
      </Text>
    </group>
  );
}

function TileMesh({ tile, onClick }: { tile: typeof BOARD_TILES[0]; onClick?: () => void }) {
  const pos = getTilePosition(tile.id);
  const color = GROUP_COLORS[tile.group] || "#cccccc";
  const isCorner = tile.type === "go" || tile.type === "jail" || tile.type === "free-parking" || tile.type === "go-to-jail";
  const size: [number, number, number] = isCorner ? [1.1, 0.08, 1.1] : [1.0, 0.06, 0.9];

  return (
    <group position={pos} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Color strip for properties */}
      {tile.type === "property" && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.9, 0.01, 0.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  );
}

function HousesMesh({ tile }: { tile: typeof BOARD_TILES[0] }) {
  const pos = getTilePosition(tile.id);
  if (tile.houses === 0 && !tile.hotel) return null;

  if (tile.hotel) {
    return (
      <mesh position={[pos[0], pos[1] + 0.18, pos[2]]}>
        <boxGeometry args={[0.35, 0.25, 0.35]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.4} />
      </mesh>
    );
  }

  const houses = [];
  for (let i = 0; i < tile.houses; i++) {
    houses.push(
      <mesh key={i} position={[pos[0] + (i - 1.5) * 0.2, pos[1] + 0.12, pos[2]]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#00AA00" emissive="#00AA00" emissiveIntensity={0.3} />
      </mesh>
    );
  }
  return <>{houses}</>;
}

function PlayerPawn({ player, allPlayers }: { player: GameState["players"][0]; allPlayers: GameState["players"] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = getTilePosition(player.position);
  const color = PLAYER_COLORS[player.color] || "#ffffff";

  // Offset players on same tile
  const samePos = allPlayers.filter(p => p.position === player.position && !p.bankrupt);
  const idx = samePos.findIndex(p => p.id === player.id);
  const offsetX = (idx % 2) * 0.3 - 0.15;
  const offsetZ = Math.floor(idx / 2) * 0.3 - 0.15;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.5;
    }
  });

  if (player.bankrupt) return null;

  return (
    <group position={[pos[0] + offsetX, pos[1] + 0.25, pos[2] + offsetZ]}>
      {/* Body */}
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Dice3D({ values, position }: { values: [number, number]; position: [number, number, number] }) {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);

  const dotPositions: Record<number, [number, number, number][]> = {
    1: [[0, 0, 0]],
    2: [[-0.12, 0.12, 0], [0.12, -0.12, 0]],
    3: [[-0.12, 0.12, 0], [0, 0, 0], [0.12, -0.12, 0]],
    4: [[-0.12, 0.12, 0], [0.12, 0.12, 0], [-0.12, -0.12, 0], [0.12, -0.12, 0]],
    5: [[-0.12, 0.12, 0], [0.12, 0.12, 0], [0, 0, 0], [-0.12, -0.12, 0], [0.12, -0.12, 0]],
    6: [[-0.12, 0.12, 0], [0.12, 0.12, 0], [-0.12, 0, 0], [0.12, 0, 0], [-0.12, -0.12, 0], [0.12, -0.12, 0]],
  };

  return (
    <group position={position}>
      {/* Die 1 */}
      <group position={[-0.35, 0, 0]}>
        <mesh ref={meshRef1} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {(dotPositions[values[0]] || []).map((dp, i) => (
          <mesh key={i} position={[dp[0], dp[1], 0.21]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
      </group>
      {/* Die 2 */}
      <group position={[0.35, 0, 0]}>
        <mesh ref={meshRef2} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {(dotPositions[values[1]] || []).map((dp, i) => (
          <mesh key={i} position={[dp[0], dp[1], 0.21]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Board3D({ gameState, onTileClick }: Board3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 14, 10], fov: 45 }}
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#fff9e6" />

        <BoardBase />

        {/* Tiles */}
        {BOARD_TILES.map(tile => (
          <TileMesh
            key={tile.id}
            tile={tile}
            onClick={() => onTileClick?.(tile.id)}
          />
        ))}

        {/* Houses & Hotels */}
        {gameState.tiles.map(tile => (
          <HousesMesh key={tile.id} tile={tile} />
        ))}

        {/* Player pawns */}
        {gameState.players.map(player => (
          <PlayerPawn key={player.id} player={player} allPlayers={gameState.players} />
        ))}

        {/* Dice */}
        {gameState.lastRoll && (
          <Dice3D values={gameState.lastRoll} position={[0, 0.3, 0]} />
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
