import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const JudgingSessionSchema = new Schema({
	team: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Team',
	},
	judge: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	time: {
		type: String,
		required: true,
	},
});

// prevent recompilation of model if it already exists
export default mongoose.models.JudgingSession || mongoose.model('JudgingSession', JudgingSessionSchema);
