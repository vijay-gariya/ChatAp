import React from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import { User } from '../../types';

interface CallNotificationProps {
  incomingCall: {
    callId: string;
    fromUser: User;
    type: 'audio' | 'video';
  } | null;
  onAnswer: () => void;
  onReject: () => void;
}

export const CallNotification: React.FC<CallNotificationProps> = ({
  incomingCall,
  onAnswer,
  onReject,
}) => {
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-center mb-6">
          <img
            src={incomingCall.fromUser.avatar}
            alt={incomingCall.fromUser.username}
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-500"
          />
          <h2 className="text-2xl font-bold text-white mb-2">
            {incomingCall.fromUser.username}
          </h2>
          <p className="text-slate-300">
            {incomingCall.type === 'video' ? 'Video call' : 'Audio call'} incoming...
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onReject}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            Reject
          </button>
          <button
            onClick={onAnswer}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {incomingCall.type === 'video' ? (
              <Video className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            Answer
          </button>
        </div>
      </div>
    </div>
  );
};
