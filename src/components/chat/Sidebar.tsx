import React from 'react';
import { Hash, Users, Settings, LogOut, Plus } from 'lucide-react';
import { ChatRoom, User } from '../../types';

interface SidebarProps {
  user: User;
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  onRoomChange: (roomId: string) => void;
  onLogout: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  rooms,
  currentRoom,
  onRoomChange,
  onLogout,
  isMobile = false,
  isOpen = true,
  onClose,
}) => {
  if (isMobile && !isOpen) return null;

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      

      <div className={`${
        isMobile 
          ? 'fixed left-0 top-0 h-full z-50 transform transition-transform duration-300' + (isOpen ? ' translate-x-0' : ' -translate-x-full')
          : 'relative'
      } w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col`}>
        
        {/* User Profile */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user.avatar || `https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150`}
                alt={user.username}
                className="w-12 h-12 rounded-full ring-2 ring-green-500"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{user.username}</h3>
              <p className="text-green-400 text-sm">Online</p>
            </div>
          </div>
        </div>

        {/* Chat Rooms */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-slate-300 font-medium text-sm uppercase tracking-wider">
                Chat Rooms
              </h4>
              <button className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    onRoomChange(room.id);
                    if (isMobile && onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all ${
                    currentRoom?.id === room.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Hash className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{room.name}</div>
                    {room.description && (
                      <div className="text-sm opacity-75 truncate">{room.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-700">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
              <Users className="w-5 h-5" />
              <span>Members</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};