import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const EventSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	gcid: {
		type: String,
		required: false,
		unique: true,
	},
	startTime: {
		type: Date,
		required: true,
	},
	endTime: {
		type: Date,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
});

// prevent recompilation of model if it already exists
export default mongoose.models.Event || mongoose.model('Event', EventSchema);
