import { useState, useCallback, useEffect, useRef } from 'react';
import { User } from '../types';

export interface CallState {
  callId: string | null;
  status: 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';
  callType: 'audio' | 'video';
  remoteUser: User | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  incomingCall: {
    callId: string;
    fromUser: User;
    type: 'audio' | 'video';
  } | null;
}

export const useCall = (currentUser: User | null, socket: any) => {
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    status: 'idle',
    callType: 'video',
    remoteUser: null,
    localStream: null,
    remoteStream: null,
    incomingCall: null,
  });

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize media streams
  const getMediaStream = useCallback(
    async (callType: 'audio' | 'video') => {
      try {
        const constraints = {
          audio: true,
          video: callType === 'video' ? { width: 1280, height: 720 } : false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setCallState((prev) => ({ ...prev, localStream: stream }));
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        return stream;
      } catch (error) {
        console.error('Error accessing media:', error);
        return null;
      }
    },
    []
  );

  // Initiate a call to a specific user
  const initiateCall = useCallback(
    async (receiverId: string, callType: 'audio' | 'video' = 'video') => {
      if (!socket || !currentUser) return;

      setCallState((prev) => ({ ...prev, status: 'connecting', callType }));

      const stream = await getMediaStream(callType);
      if (!stream) {
        setCallState((prev) => ({ ...prev, status: 'idle' }));
        return;
      }

      // Send call initiation to backend
      socket.emit('call_initiate', {
        receiver_id: receiverId,
        type: callType,
      });
    },
    [socket, currentUser, getMediaStream]
  );

  // Answer an incoming call
  const answerCall = useCallback(async () => {
    if (!callState.incomingCall || !socket) return;

    const stream = await getMediaStream(callState.incomingCall.type);
    if (!stream) return;

    socket.emit('call_answer', {
      call_id: callState.incomingCall.callId,
    });

    setCallState((prev) => ({
      ...prev,
      callId: prev.incomingCall?.callId || null,
      status: 'connecting',
      remoteUser: prev.incomingCall?.fromUser || null,
      incomingCall: null,
    }));
  }, [callState.incomingCall, socket, getMediaStream]);

  // Reject an incoming call
  const rejectCall = useCallback(() => {
    if (!callState.incomingCall || !socket) return;

    socket.emit('call_reject', {
      call_id: callState.incomingCall.callId,
    });

    setCallState((prev) => ({
      ...prev,
      incomingCall: null,
    }));
  }, [callState.incomingCall, socket]);

  // End active call
  const endCall = useCallback(() => {
    if (!callState.callId || !socket) return;

    socket.emit('call_end', {
      call_id: callState.callId,
    });

    // Stop media streams
    if (callState.localStream) {
      callState.localStream.getTracks().forEach((track) => track.stop());
    }
    if (callState.remoteStream) {
      callState.remoteStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setCallState({
      callId: null,
      status: 'idle',
      callType: 'video',
      remoteUser: null,
      localStream: null,
      remoteStream: null,
      incomingCall: null,
    });
  }, [callState.callId, callState.localStream, callState.remoteStream, socket]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('call_incoming', (data: any) => {
      setCallState((prev) => ({
        ...prev,
        incomingCall: {
          callId: data.call_id,
          fromUser: data.from_user,
          type: data.type,
        },
      }));
    });

    socket.on('call_answered', (data: any) => {
      setCallState((prev) => ({
        ...prev,
        status: 'active',
        remoteUser: data.user,
      }));
    });

    socket.on('call_rejected', (data: any) => {
      setCallState({
        callId: null,
        status: 'idle',
        callType: 'video',
        remoteUser: null,
        localStream: null,
        remoteStream: null,
        incomingCall: null,
      });
    });

    socket.on('call_ended', (data: any) => {
      if (callState.localStream) {
        callState.localStream.getTracks().forEach((track) => track.stop());
      }
      if (callState.remoteStream) {
        callState.remoteStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      setCallState({
        callId: null,
        status: 'idle',
        callType: 'video',
        remoteUser: null,
        localStream: null,
        remoteStream: null,
        incomingCall: null,
      });
    });

    socket.on('call_error', (data: any) => {
      console.error('Call error:', data.error);
      if (callState.localStream) {
        callState.localStream.getTracks().forEach((track) => track.stop());
      }
      setCallState({
        callId: null,
        status: 'idle',
        callType: 'video',
        remoteUser: null,
        localStream: null,
        remoteStream: null,
        incomingCall: null,
      });
    });

    return () => {
      socket.off('call_incoming');
      socket.off('call_answered');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('call_error');
    };
  }, [socket, callState.localStream, callState.remoteStream]);

  return {
    callState,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    localVideoRef,
    remoteVideoRef,
  };
};
