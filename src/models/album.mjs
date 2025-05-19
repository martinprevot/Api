import mongoose from 'mongoose';

const Album = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'photos',
        required: false
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      required: false
    }
  },
  {
    collection: 'albums',
    minimize: false,
    versionKey: false
  }
).set('toJSON', {
  transform: (doc, ret) => {
    const retUpdated = ret;
    retUpdated.id = ret._id;

    delete retUpdated._id;

    return retUpdated;
  }
});

export default Album;
