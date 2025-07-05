import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false          // never return hashes by default
    }
  },
  { timestamps: true }
)

// hash pw on save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// instance helper
UserSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// ← function wrapper prevents model re-compilation during hot-reload
export default function getUserModel () {
  if (mongoose.connection.models.User) return mongoose.connection.models.User
  return mongoose.model('User', UserSchema)
}
