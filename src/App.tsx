import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Chat } from './components/chat/Chat';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();

  if (isAuthenticated && user) {
    return <Chat user={user} onLogout={logout} />;
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