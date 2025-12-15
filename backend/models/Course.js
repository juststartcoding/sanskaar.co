const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  type: { type: String, enum: ['video', 'practice', 'quiz', 'reading'], required: true },
  content: String,
  videoUrl: String
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    english: { type: String, required: true },
    hindi: { type: String, required: true },
    sanskrit: String
  },
  slug: { type: String, required: true, unique: true },
  description: {
    english: { type: String, required: true },
    hindi: { type: String, required: true }
  },
  instructor: {
    name: { type: String, required: true },
    bio: String,
    image: String,
    credentials: [String]
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    required: true
  },
  duration: {
    weeks: { type: Number, required: true },
    hoursPerWeek: { type: Number, required: true }
  },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  thumbnail: { type: String, required: true },
  category: {
    type: String,
    enum: ['Sanskrit Grammar', 'Vedic Chanting', 'Spoken Sanskrit', 'Sanskrit for Kids', 'Literature', 'Philosophy'],
    required: true
  },
  modules: [moduleSchema],
  enrolledStudents: { type: Number, default: 0 },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  featured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  requirements: [String],
  learningOutcomes: [String]
}, { timestamps: true });

// Index for search
courseSchema.index({ 'title.english': 'text', 'description.english': 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ featured: 1 });

module.exports = mongoose.model('Course', courseSchema);
