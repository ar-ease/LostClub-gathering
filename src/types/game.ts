export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  players: Map<string, Player>;
  maxPlayers: number;
}

export interface GameState {
  currentRoom: string;
  players: Map<string, Player>;
}

export interface ServerToClientEvents {
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  playerMoved: (player: Player) => void;
  roomState: (players: Player[]) => void;
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string, player: Player) => void;
  leaveRoom: (roomId: string, playerId: string) => void;
  movePlayer: (player: Player) => void;
}