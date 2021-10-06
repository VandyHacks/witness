import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ScoresSchema = new Schema({
	team: { 
        type: Schema.Types.ObjectId, 
        required: true, ref: 'Team' 
    },
	judge: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' },
	technicalAbility: { type: Number, min: 0, max: 7, required: true },
	creativity: { type: Number, min: 0, max: 7, required: true },
	utility: { type: Number, min: 0, max: 7, required: true },
	presentation: { type: Number, min: 0, max: 7, required: true },
	wowfactor: { type: Number, min: 0, max: 7, required: true },
	comments: { type: String, required: true },
	feedback: { type: String, required: true },
});

// prevent recompilation of model if it already exists
export default mongoose.models.Scores || mongoose.model('Scores', ScoresSchema);
