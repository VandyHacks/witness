import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const UserSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		image: {
			type: String,
		},
		userType: {
			type: String,
			enum: ['HACKER', 'JUDGE', 'ORGANIZER'],
		},
		team: {
			type: { type: Schema.Types.ObjectId, ref: 'Team' },
		},
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.User || mongoose.model('User', UserSchema);
