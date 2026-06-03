export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  roomId: string;
  timestamp: Date;
  type: 'text' | 'system';
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  participants: User[];
  messages: Message[];
  createdAt: Date;
  isPrivate: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChatState {
  currentRoom: ChatRoom | null;
  rooms: ChatRoom[];
  messages: Message[];
  users: User[];
  typingUsers: string[];
}

export interface AppState {
  auth: AuthState;
  chat: ChatState;
}