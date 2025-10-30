// Types pour les événements Socket.io

export interface PositionUpdatePayload {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp?: string | Date;
}

export interface PositionUpdatedEvent {
  technicianId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
  _id: string;
}

export interface SocketData {
  userId: string;
  role?: string;
}

// Événements côté serveur
export interface ServerToClientEvents {
  "position:updated": (data: PositionUpdatedEvent) => void;
  "position:confirmed": (data: PositionUpdatedEvent) => void;
  "position:latest": (position: any) => void;
  "position:my-latest": (position: any) => void;
  "position:my-live": (position: any) => void;
  "error": (error: { message: string }) => void;
}

// Événements côté client
export interface ClientToServerEvents {
  "position:update": (payload: PositionUpdatePayload) => void;
  "position:get-latest": (technicianId: string) => void;
  "position:get-my-latest": () => void;
  "position:get-my-live": () => void;
}

export interface InterServerEvents {
  // Événements entre serveurs (si clustering)
}