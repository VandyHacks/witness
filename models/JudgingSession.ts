import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const JudgingSessionSchema = new Schema({
	teamName: {
		type: String,
		required: true,
	},
	judgeName: {
		type: String,
		required: true,
	},
	time: {
		type: String,
		required: true,
	},
});

// prevent recompilation of model if it already exists
export default mongoose.models.JudgingSession || mongoose.model('JudgingSession', JudgingSessionSchema);
