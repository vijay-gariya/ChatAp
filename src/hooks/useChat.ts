import { useState, useCallback, useEffect } from 'react';
import { ChatRoom, Message, User, ChatState } from '../types';

const mockRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'General',
    description: 'General discussion for everyone',
    participants: [],
    messages: [],
    createdAt: new Date(),
    isPrivate: false,
  },
  {
    id: '2',
    name: 'Random',
    description: 'Random conversations and fun',
    participants: [],
    messages: [],
    createdAt: new Date(),
    isPrivate: false,
  },
  {
    id: '3',
    name: 'Tech Talk',
    description: 'Discuss technology and programming',
    participants: [],
    messages: [],
    createdAt: new Date(),
    isPrivate: false,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey everyone! Welcome to the chat!',
    userId: '1',
    username: 'john_doe',
    roomId: '1',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text',
  },
  {
    id: '2',
    content: 'Thanks John! Excited to be here.',
    userId: '2',
    username: 'jane_smith',
    roomId: '1',
    timestamp: new Date(Date.now() - 3300000),
    type: 'text',
  },
  {
    id: '3',
    content: 'This chat app looks amazing!',
    userId: '1',
    username: 'john_doe',
    roomId: '1',
    timestamp: new Date(Date.now() - 1800000),
    type: 'text',
  },
];

export const useChat = (currentUser: User | null) => {
  const [chatState, setChatState] = useState<ChatState>({
    currentRoom: null,
    rooms: mockRooms,
    messages: mockMessages,
    users: [],
    typingUsers: [],
  });

  const joinRoom = useCallback((roomId: string) => {
    const room = chatState.rooms.find(r => r.id === roomId);
    if (room) {
      setChatState(prev => ({
        ...prev,
        currentRoom: room,
      }));
    }
  }, [chatState.rooms]);

  const sendMessage = useCallback((content: string) => {
    if (!currentUser || !chatState.currentRoom || !content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      userId: currentUser.id,
      username: currentUser.username,
      roomId: chatState.currentRoom.id,
      timestamp: new Date(),
      type: 'text',
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, [currentUser, chatState.currentRoom]);

  const startTyping = useCallback(() => {
    if (!currentUser) return;
    
    setChatState(prev => ({
      ...prev,
      typingUsers: [...prev.typingUsers.filter(u => u !== currentUser.username), currentUser.username],
    }));

    // Remove typing indicator after 3 seconds
    setTimeout(() => {
      setChatState(prev => ({
        ...prev,
        typingUsers: prev.typingUsers.filter(u => u !== currentUser?.username),
      }));
    }, 3000);
  }, [currentUser]);

  const getCurrentRoomMessages = useCallback(() => {
    if (!chatState.currentRoom) return [];
    return chatState.messages
      .filter(m => m.roomId === chatState.currentRoom?.id)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [chatState.currentRoom, chatState.messages]);

  useEffect(() => {
    // Auto-join the first room
    if (chatState.rooms.length > 0 && !chatState.currentRoom) {
      joinRoom(chatState.rooms[0].id);
    }
  }, [chatState.rooms, chatState.currentRoom, joinRoom]);

  return {
    ...chatState,
    joinRoom,
    sendMessage,
    startTyping,
    getCurrentRoomMessages,
  };
};