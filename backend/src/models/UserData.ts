import mongoose, { Document, Schema } from 'mongoose';

export interface IUserData extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserDataSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
    },
  },
  { timestamps: true }
);

// Create compound index for efficient queries
UserDataSchema.index({ userId: 1, title: 1 });

export default mongoose.model<IUserData>('UserData', UserDataSchema); 