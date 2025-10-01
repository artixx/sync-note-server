import mongoose from 'mongoose'

const tabSchema = new mongoose.Schema({
  title: { type: String, default: 'New Tab' },
  content: { type: String, default: '' },
  updated: { type: Number, default: () => Date.now() },
})

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tabs: [tabSchema],
})

export const User = mongoose.model('User', userSchema)
