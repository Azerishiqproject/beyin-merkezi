import mongoose, { Document, Schema } from 'mongoose';

export interface IEvaluation extends Document {
  userId: mongoose.Types.ObjectId;
  evaluationNumber: number; // 1, 2, or 3
  evaluatedBy: mongoose.Types.ObjectId;
  evaluationDate: Date;
  
  // Evaluation criteria (each scored from 1-10)
  davamiyyet: number;
  isguzarKeyfiyetler: number;
  streseDavamliliq: number;
  ascImici: number;
  qavramaMenimseme: number;
  ixtisasBiliyi: number;
  muhendisEtikasi: number;
  komandaIleIslemeBacarigi: number;
  
  // Average score calculated from all criteria
  averageScore: number;
  
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    evaluationNumber: {
      type: Number,
      required: [true, 'Evaluation number is required'],
      min: 1,
      max: 3,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Evaluator ID is required'],
    },
    evaluationDate: {
      type: Date,
      default: Date.now,
    },
    
    // Evaluation criteria
    davamiyyet: {
      type: Number,
      required: [true, 'Davamiyyet score is required'],
      min: 1,
      max: 10,
    },
    isguzarKeyfiyetler: {
      type: Number,
      required: [true, 'İşgüzar keyfiyyətlər score is required'],
      min: 1,
      max: 10,
    },
    streseDavamliliq: {
      type: Number,
      required: [true, 'Stresə davamlılıq score is required'],
      min: 1,
      max: 10,
    },
    ascImici: {
      type: Number,
      required: [true, 'ASC imici score is required'],
      min: 1,
      max: 10,
    },
    qavramaMenimseme: {
      type: Number,
      required: [true, 'Qavrama mənimsəmə score is required'],
      min: 1,
      max: 10,
    },
    ixtisasBiliyi: {
      type: Number,
      required: [true, 'İxtisas biliyi score is required'],
      min: 1,
      max: 10,
    },
    muhendisEtikasi: {
      type: Number,
      required: [true, 'Mühəndis etikası score is required'],
      min: 1,
      max: 10,
    },
    komandaIleIslemeBacarigi: {
      type: Number,
      required: [true, 'Komanda ilə işləmə bacarığı score is required'],
      min: 1,
      max: 10,
    },
    
    // Average score will be calculated automatically
    averageScore: {
      type: Number,
      min: 1,
      max: 10,
    },
    
    comments: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Calculate average score before saving
EvaluationSchema.pre<IEvaluation>('save', function(next) {
  // Log the criteria values for debugging
  console.log('Calculating average score with criteria:', {
    davamiyyet: this.davamiyyet,
    isguzarKeyfiyetler: this.isguzarKeyfiyetler,
    streseDavamliliq: this.streseDavamliliq,
    ascImici: this.ascImici,
    qavramaMenimseme: this.qavramaMenimseme,
    ixtisasBiliyi: this.ixtisasBiliyi,
    muhendisEtikasi: this.muhendisEtikasi,
    komandaIleIslemeBacarigi: this.komandaIleIslemeBacarigi
  });
  
  const scores = [
    this.davamiyyet,
    this.isguzarKeyfiyetler,
    this.streseDavamliliq,
    this.ascImici,
    this.qavramaMenimseme,
    this.ixtisasBiliyi,
    this.muhendisEtikasi,
    this.komandaIleIslemeBacarigi
  ];
  
  const sum = scores.reduce((acc, score) => acc + score, 0);
  const average = parseFloat((sum / scores.length).toFixed(2));
  
  console.log(`Average score calculation: ${sum} / ${scores.length} = ${average}`);
  this.averageScore = average;
  
  next();
});

// Create compound index for efficient queries
EvaluationSchema.index({ userId: 1, evaluationNumber: 1 }, { unique: true });

export default mongoose.model<IEvaluation>('Evaluation', EvaluationSchema); 