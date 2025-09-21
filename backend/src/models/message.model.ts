import mongoose from 'mongoose';

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  readAt?: Date;
  edited?: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  edited: {
    type: Boolean,
    default: false
  },
  attachments: [String]
}, {
  timestamps: true
});

// Indexes for efficient querying of conversations
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

// Get conversation between two users
messageSchema.statics.getConversation = async function(userId1: string, userId2: string) {
  return this.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 }
    ]
  })
  .sort({ createdAt: 1 })
  .populate('sender', 'name avatarUrl')
  .populate('receiver', 'name avatarUrl');
};

export const Message = mongoose.model<IMessage>('Message', messageSchema);