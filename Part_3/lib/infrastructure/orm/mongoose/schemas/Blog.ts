import mongoose from '../mongoose';

const schema = new mongoose.Schema({
  title: String,
  description: String,
  main_image: {
    type: String,
  },
  additional_images: {
    type: [String],
    required: false,
    default: null,
  },
  date_time: String,
  reference:String
}, { timestamps: true });

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

export default mongoose.model('Blog', schema);
