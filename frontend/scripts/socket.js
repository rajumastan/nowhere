const API_ORIGIN = 'http://localhost:3000';
let socket = null;

function connectSocket(token) {
  if (!token) throw new Error('Token required');
  
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(API_ORIGIN, {
    auth: { token },
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('new-message', (message) => {
    if (window.__nowhere_onMessage) {
      window.__nowhere_onMessage(message);
    }
  });
  
  socket.on('user-typing', (info) => {
    if (window.__nowhere_onTyping) {
      window.__nowhere_onTyping(info);
    }
  });
  
  socket.on('user-presence', (presence) => {
    if (window.__nowhere_onPresence) {
      window.__nowhere_onPresence(presence);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
  
  return socket;
}

function joinChannel(serverId, channelId) {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('join-channel', { serverId, channelId });
}

function sendMessage(data) {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('send-message', data);
}

function typing(data) {
  if (!socket) throw new Error('Socket not connected');
  socket.emit('typing', data);
}

window.__nowhere_socket = {
  connectSocket,
  joinChannel,
  sendMessage,
  typing
};