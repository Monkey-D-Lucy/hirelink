import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
  
  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('register-user', userId);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendMessage = (data) => {
  if (socket) {
    socket.emit('send-message', data);
  }
};

export const markMessageRead = (messageId) => {
  if (socket) {
    socket.emit('mark-read', messageId);
  }
};

export const sendTyping = (receiverId, isTyping) => {
  if (socket) {
    socket.emit('typing', { receiverId, isTyping });
  }
};

export const onNewMessage = (callback) => {
  if (socket) {
    socket.on('new-message', callback);
  }
};

export const onMessageSent = (callback) => {
  if (socket) {
    socket.on('message-sent', callback);
  }
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user-typing', callback);
  }
};

export const onUserOnline = (callback) => {
  if (socket) {
    socket.on('user-online', callback);
  }
};