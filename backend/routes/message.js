const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');

router.get('/channel/:serverId/:channelId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      server: req.params.serverId,
      channelId: req.params.channelId,
      isDM: false
    })
    .populate('sender', 'username')
    .sort({ createdAt: 1 })
    .limit(100);
    
    res.json(messages);
  } catch (err) {
    console.error('Get channel messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dm/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      isDM: true,
      participants: { $all: [req.user._id, req.params.userId] }
    })
    .populate('sender', 'username')
    .sort({ createdAt: 1 })
    .limit(100);
    
    res.json(messages);
  } catch (err) {
    console.error('Get DM messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;