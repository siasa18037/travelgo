import { Schema, model, models } from 'mongoose';

const userCredentialSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  credentialID: { type: String, required: true, unique: true },
  publicKey: { type: String, required: true },
  counter: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const UserCredential = models.UserCredential || model('UserCredential', userCredentialSchema);
export default UserCredential;
