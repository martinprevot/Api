import mongoose from 'mongoose';

const Photo = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'albums',
      required: true
    }
  },
  {
    collection: 'photos',
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

export default Photo;
