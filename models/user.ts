import mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const USER_TYPES = ['HACKER', 'JUDGE', 'ORGANIZER'];

export const UserSchema = new Schema(
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
		image: {
			type: String,
		},
		userType: {
			type: String,
			enum: USER_TYPES,
		},
		team: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
		},
		test: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.User || mongoose.model('User', UserSchema);
