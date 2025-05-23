import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  type_user: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  phone: [
    {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      phone_number: {
        type: String,
        trim: true,
        default: '',
      },
    }
  ],
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=',
  },
  passport_number: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// ➕ เพิ่ม avatar จาก name อัตโนมัติ
userSchema.pre('save', function (next) {
  if (!this.avatar || this.avatar === 'https://ui-avatars.com/api/?name=') {
    const encodedName = encodeURIComponent(this.name || '');
    this.avatar = `https://ui-avatars.com/api/?name=${encodedName}`;
  }
  next();
});

const User = models.User || model('User', userSchema);
export default User;
