import React from 'react';
import { Hash, Users, Phone, Video, MoreVertical, Menu } from 'lucide-react';
import { ChatRoom } from '../../types';

interface ChatHeaderProps {
  room: ChatRoom;
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
  onVideoCall?: () => void;
  onAudioCall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  onToggleSidebar,
  showMenuButton = false,
  onVideoCall,
  onAudioCall,
}) => {
  return (
    <div className="border-b border-slate-700 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showMenuButton && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{room.name}</h2>
              {room.description && (
                <p className="text-sm text-slate-400">{room.description}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onAudioCall && (
            <button 
              onClick={onAudioCall}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
              title="Audio call"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}
          {onVideoCall && (
            <button 
              onClick={onVideoCall}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
              title="Video call"
            >
              <Video className="w-5 h-5" />
            </button>
          )}
          <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};