import mongoose, { Schema } from 'mongoose';

const HackathonSchema = new Schema({
	HACKATHON_START: { type: String, required: true }, // MM/DD/YYYY hh:mm A
	HACKATHON_END: { type: String, required: true }, // MM/DD/YYYY hh:mm A
	JUDGING_START: { type: String, required: true }, // MM/DD/YYYY hh:mm A
	JUDGING_END: { type: String, required: true }, // MM/DD/YYYY hh:mm A
	JUDGING_DURATION: { type: Number, required: true },
	JUDGING_TIME_PER_TEAM: { type: Number, required: true },
	ON_CALL_DEV: { type: String, required: true },
});

// prevent recompilation of model if it already exists
export default mongoose.models.Hackathon || mongoose.model('Hackathon', HackathonSchema);
