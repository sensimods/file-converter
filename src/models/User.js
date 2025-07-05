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
      select: false // never return in queries unless you .select('+password')
    }

    // ⤴︎ add more user fields here if you need them
  },
  { timestamps: true }
)

// ────────────────────────────────────────────
// Hash pw on save
// ────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Convenient instance helper (optional)
UserSchema.methods.matchPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

/**
 * getUserModel ­— always returns the compiled model.
 * Prevents “Cannot overwrite model once compiled” during hot-reload.
 */
export default function getUserModel () {
  return mongoose.models.User || mongoose.model('User', UserSchema)
}
