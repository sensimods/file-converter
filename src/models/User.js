// // import mongoose from 'mongoose';
// // import bcrypt from 'bcryptjs';

// // const UserSchema = new mongoose.Schema({
// //   email: {
// //     type: String,
// //     required: [true, 'Please provide an email address.'],
// //     unique: true,
// //     lowercase: true,
// //     trim: true,
// //     match: [/.+@.+\..+/, 'Please enter a valid email address.'],
// //   },
// //   password: {
// //     type: String,
// //     required: [true, 'Please provide a password.'],
// //     minlength: [6, 'Password must be at least 6 characters long.'],
// //     select: false, // Do not return password by default in queries
// //   },
// //   createdAt: {
// //     type: Date,
// //     default: Date.now,
// //   },
// // });

// // // Hash the password before saving the user
// // UserSchema.pre('save', async function(next) {
// //   if (!this.isModified('password')) {
// //     return next();
// //   }
// //   const salt = await bcrypt.genSalt(10);
// //   this.password = await bcrypt.hash(this.password, salt);
// //   next();
// // });

// // // Method to compare entered password with hashed password in DB
// // UserSchema.methods.matchPassword = async function(enteredPassword) {
// //   return await bcrypt.compare(enteredPassword, this.password);
// // };

// // export default function getUserModel() {
// //   if (mongoose.connection.models.User) {
// //     return mongoose.connection.models.User;
// //   }
// //   return mongoose.model('User', UserSchema);
// // }


// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const UserSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, 'Please provide an email address.'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/.+@.+\..+/, 'Please enter a valid email address.'],
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password.'],
//     minlength: [6, 'Password must be at least 6 characters long.'],
//     select: false, // Do not return password by default in queries
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Hash the password before saving the user
// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Method to compare entered password with hashed password in DB
// UserSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// export default function getUserModel() {
//   if (mongoose.connection.models.User) {
//     return mongoose.connection.models.User;
//   }
//   return mongoose.model('User', UserSchema);
// }

// document-pro/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  // Add other user-related fields if necessary
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords (optional, but good practice)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model.
// This pattern prevents Mongoose from trying to recompile the model
// if it's already been defined, which can happen during Next.js hot-reloading.
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
