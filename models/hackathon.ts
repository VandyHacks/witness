import mongoose, { Schema } from 'mongoose';

const HackathonSchema = new Schema({
	HACKATHON_START: { type: String, required: true }, // MM/DD/YYYY hh:mm A
	HACKATHON_END: { type: String, required: true }, // MM/DD/YYYY hh:mm A
	JUDGING_START: { type: String, required: true }, // MM/DD/YYYY hh:mm A
	JUDGING_END: { type: String, required: true }, // MM/DD/YYYY hh:mm A
});

// prevent recompilation of model if it already exists
export default mongoose.models.Hackathon || mongoose.model('Hackathon', HackathonSchema);
