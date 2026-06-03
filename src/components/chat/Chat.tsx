import React, { useState } from 'react';
import { User } from '../../types';
import { useChat } from '../../hooks/useChat';
import { Sidebar } from './Sidebar';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatProps {
  user: User;
  onLogout: () => void;
}

export const Chat: React.FC<ChatProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    currentRoom,
    rooms,
    typingUsers,
    joinRoom,
    sendMessage,
    startTyping,
    getCurrentRoomMessages,
  } = useChat(user);

  const messages = getCurrentRoomMessages();

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          user={user}
          rooms={rooms}
          currentRoom={currentRoom}
          onRoomChange={joinRoom}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar
        user={user}
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomChange={joinRoom}
        onLogout={onLogout}
        isMobile
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            <ChatHeader
              room={currentRoom}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              showMenuButton
            />
            <MessageList
              messages={messages}
              currentUser={user}
              typingUsers={typingUsers}
            />
            <MessageInput
              onSendMessage={sendMessage}
              onStartTyping={startTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-lg font-medium mb-2">Select a room to start chatting</p>
              <p className="text-sm">Choose a chat room from the sidebar to begin your conversation.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};