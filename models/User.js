const mongoose = require('mongoose')
const schema = mongoose.Schema
const UserSchema = new schema(
    {
      firstName: {type: String, required: true},
      lastName: {type: String, required: true},
      dateOfBirth: {type: Date},
      gender: {type: String, enum: ['M','F'], default: 'M'},
      address: {type: String},
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: {type: String, required: true}
    },
    { timestamps: true }
)
module.exports = mongoose.model('User', UserSchema, 'users')