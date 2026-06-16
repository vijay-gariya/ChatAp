import React, { useState } from 'react';
import { Phone, Video } from 'lucide-react';
import { User } from '../../types';

interface CallActionsProps {
  user: User;
  onInitiateAudioCall: (userId: string) => void;
  onInitiateVideoCall: (userId: string) => void;
  isCallActive?: boolean;
}

export const CallActions: React.FC<CallActionsProps> = ({
  user,
  onInitiateAudioCall,
  onInitiateVideoCall,
  isCallActive = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  if (isCallActive) return null;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => {
            onInitiateAudioCall(user.id);
            setShowMenu(false);
          }}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          title="Start audio call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            onInitiateVideoCall(user.id);
            setShowMenu(false);
          }}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          title="Start video call"
        >
          <Video className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
