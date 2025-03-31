import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description?: string;
  createdAt: Date;
}

const DepartmentSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Xahis olunur bir departament adi daxil edin'],
    trim: true,
    unique: true,
    maxlength: [50, 'Departament adi 50 simvoldan uzun ola bilmez']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Aciklama 500 simvoldan uzun ola bilmez']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IDepartment>('Department', DepartmentSchema); 