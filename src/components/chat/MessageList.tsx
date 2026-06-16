import React, { useEffect, useRef } from 'react';
import { Message, User } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  typingUsers: string[];
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  typingUsers,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageBubbleClass = (message: Message) => {
    const isOwnMessage = message.userId === currentUser.id;
    return `max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
      isOwnMessage
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
        : 'bg-slate-700 text-white'
    }`;
  };

  const getMessageContainerClass = (message: Message) => {
    const isOwnMessage = message.userId === currentUser.id;
    return `flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message!</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isOwnMessage = message.userId === currentUser.id;
            
            return (
              <div key={message.id} className={getMessageContainerClass(message)}>
                <div className="flex items-end space-x-2 max-w-full">
                  {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {message.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    {!isOwnMessage && (
                      <div className="text-xs text-slate-400 mb-1 px-2">
                        {message.username}
                      </div>
                    )}
                    
                    <div className={getMessageBubbleClass(message)}>
                      <p className="break-words">{message.content}</p>
                    </div>
                    
                    <div className={`text-xs text-slate-500 mt-1 px-2 ${
                      isOwnMessage ? 'text-right' : 'text-left'
                    }`}>
                      {formatDistanceToNow(message.timestamp)}
                    </div>
                  </div>
                  
                  {isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 px-4">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <div className="bg-slate-700 text-slate-300 px-4 py-2 rounded-2xl text-sm">
                <span className="font-medium">{typingUsers.join(', ')}</span> {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            </div>
          )}
        </>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};