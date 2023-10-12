import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const ReportSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
	},
});

// prevent recompilation of model if it already exists
export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
