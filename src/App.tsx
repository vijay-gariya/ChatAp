import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Chat } from './components/chat/Chat';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && !socketRef.current) {
      // Initialize socket connection
      socketRef.current = io('http://localhost:5000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      socketRef.current.on('connect_error', (error: any) => {
        console.error('Connection error:', error);
      });
    }

    return () => {
      if (socketRef.current && !isAuthenticated) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user]);

  if (isAuthenticated && user) {
    return <Chat user={user} onLogout={logout} socket={socketRef.current} />;
  }

  return showRegister ? (
    <RegisterForm
      onRegister={register}
      onSwitchToLogin={() => setShowRegister(false)}
      isLoading={isLoading}
    />
  ) : (
    <LoginForm
      onLogin={login}
      onSwitchToRegister={() => setShowRegister(true)}
      isLoading={isLoading}
    />
  );
}

export default App;