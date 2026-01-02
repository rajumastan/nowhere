const express = require('express');
const router = express.Router();
const Server = require('../models/Server');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    const server = new Server({
      name,
      owner: req.user._id,
      members: [req.user._id],
      channels: [{ name: 'general' }, { name: 'random' }]
    });
    
    await server.save();
    
    await User.findByIdAndUpdate(req.user._id, {
      $push: { servers: server._id }
    });
    
    res.status(201).json(server);
  } catch (err) {
    console.error('Create server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const servers = await Server.find({ members: req.user._id });
    res.json(servers);
  } catch (err) {
    console.error('Get servers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    
    if (!server.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member' });
    }
    
    res.json(server);
  } catch (err) {
    console.error('Get server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;