const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ChannelSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true },
  type: { type: String, default: 'text', enum: ['text', 'voice'] }
});

const ServerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  channels: [ChannelSchema],
}, { timestamps: true });

module.exports = mongoose.model('Server', ServerSchema);