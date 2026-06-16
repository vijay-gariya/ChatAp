import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { User } from '../../types';

interface VideoCallProps {
  remoteUser: User | null;
  callType: 'audio' | 'video';
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onEndCall: () => void;
  isMuted?: boolean;
  isVideoOff?: boolean;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  remoteUser,
  callType,
  localVideoRef,
  remoteVideoRef,
  onEndCall,
  isMuted = false,
  isVideoOff = false,
  onToggleMute,
  onToggleVideo,
}) => {
  if (!remoteUser) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote video - main display */}
      <div className="flex-1 relative bg-black">
        {callType === 'video' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <img
              src={remoteUser.avatar}
              alt={remoteUser.username}
              className="w-32 h-32 rounded-full mb-4 border-4 border-blue-500"
            />
            <p className="text-white text-2xl font-bold">{remoteUser.username}</p>
            <p className="text-slate-400 mt-2">Audio call in progress</p>
          </div>
        )}

        {/* Local video - PiP */}
        {callType === 'video' && (
          <div className="absolute bottom-4 right-4 w-24 h-32 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-flip"
            />
          </div>
        )}

        {/* Call info */}
        <div className="absolute top-4 left-4 text-white">
          <h2 className="text-xl font-bold">{remoteUser.username}</h2>
          <p className="text-sm text-slate-300">
            {callType === 'video' ? 'Video call' : 'Audio call'}
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-slate-900 border-t border-slate-700 p-4 sm:p-6 flex justify-center gap-3 sm:gap-4 flex-wrap">
        {callType === 'audio' && onToggleMute && (
          <button
            onClick={onToggleMute}
            className={`p-3 sm:p-4 rounded-full transition-colors ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>
        )}

        {callType === 'video' && (
          <>
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                className={`p-3 sm:p-4 rounded-full transition-colors ${
                  isMuted
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </button>
            )}

            {onToggleVideo && (
              <button
                onClick={onToggleVideo}
                className={`p-3 sm:p-4 rounded-full transition-colors ${
                  isVideoOff
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={isVideoOff ? 'Turn video on' : 'Turn video off'}
              >
                {isVideoOff ? (
                  <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </button>
            )}
          </>
        )}

        <button
          onClick={onEndCall}
          className="bg-red-600 hover:bg-red-700 text-white p-3 sm:p-4 rounded-full transition-colors flex items-center gap-2"
          title="End call"
        >
          <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
