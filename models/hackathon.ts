import mongoose, { Schema } from 'mongoose';

const HackathonSchema = new Schema({
	HACKATHON_START: { type: Date, required: true, default: Date.now },
	HACKATHON_END: { type: Date, required: true, default: Date.now },
	JUDGING_START: { type: Date, required: true, default: Date.now },
	JUDGING_END: { type: Date, required: true, default: Date.now },
});

// prevent recompilation of model if it already exists
export default mongoose.models.Hackathon || mongoose.model('Hackathon', HackathonSchema);
