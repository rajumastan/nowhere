const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');
const sanitizeHtml = require('sanitize-html');

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));
      
      user.online = true;
      user.lastSeen = new Date();
      await user.save();
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    
    socket.join(`user:${socket.user._id}`);
    
    socket.broadcast.emit('user-presence', {
      userId: socket.user._id,
      online: true
    });
    
    socket.on('join-channel', async ({ serverId, channelId }) => {
      socket.leaveAll();
      socket.join(`server:${serverId}:channel:${channelId}`);
      socket.join(`user:${socket.user._id}`);
      console.log(`${socket.user.username} joined channel ${channelId}`);
    });
    
    socket.on('send-message', async (data) => {
      try {
        const sanitizedContent = sanitizeHtml(data.content, {
          allowedTags: [],
          allowedAttributes: {}
        });
        
        let message;
        
        if (data.serverId && data.channelId) {
          message = new Message({
            content: sanitizedContent,
            sender: socket.user._id,
            server: data.serverId,
            channelId: data.channelId,
            isDM: false
          });
          
          await message.save();
          message = await Message.findById(message._id).populate('sender', 'username');
          
          io.to(`server:${data.serverId}:channel:${data.channelId}`).emit('new-message', message);
        } else if (data.participants && data.participants.length === 1) {
          const otherUserId = data.participants[0];
          message = new Message({
            content: sanitizedContent,
            sender: socket.user._id,
            participants: [socket.user._id, otherUserId],
            isDM: true
          });
          
          await message.save();
          message = await Message.findById(message._id).populate('sender', 'username');
          
          io.to(`user:${socket.user._id}`).emit('new-message', message);
          io.to(`user:${otherUserId}`).emit('new-message', message);
        }
      } catch (err) {
        console.error('Send message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    socket.on('typing', (data) => {
      if (data.serverId && data.channelId) {
        socket.to(`server:${data.serverId}:channel:${data.channelId}`).emit('user-typing', {
          userId: socket.user._id,
          username: socket.user.username
        });
      } else if (data.toUserId) {
        socket.to(`user:${data.toUserId}`).emit('user-typing', {
          userId: socket.user._id,
          username: socket.user.username
        });
      }
    });
    
    socket.on('disconnect', async () => {
      try {
        if (socket.user) {
          const user = await User.findById(socket.user._id);
          if (user) {
            user.online = false;
            user.lastSeen = new Date();
            await user.save();
            
            socket.broadcast.emit('user-presence', {
              userId: user._id,
              online: false,
              lastSeen: user.lastSeen
            });
          }
        }
        console.log('User disconnected');
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    });
  });
}

module.exports = setupSocket;