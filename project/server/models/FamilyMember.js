import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyTree',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date
  },
  deathDate: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  photo: {
    type: String
  },
  biography: {
    type: String
  },
  father: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember'
  },
  mother: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember'
  },
  spouse: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember'
  }],
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('FamilyMember', familyMemberSchema);