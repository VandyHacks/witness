import mongoose from 'mongoose';
import { USER_TYPES } from './user';

const Schema = mongoose.Schema;

export const PreAddSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		userType: {
			type: String,
			enum: USER_TYPES,
			required: true,
		},
		note: {
			type: String, // to add any details
		},
		addedBy: {
			type: String,
			required: true, // for now just name, but could link to user or remove altogether
		},
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.PreAdd || mongoose.model('PreAdd', PreAddSchema);
