import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const testUserSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		userType: {
			type: String,
			enum: ['HACKER', 'JUDGE', 'ORGANIZER'],
			required: true,
		},
		team: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
		},
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.testUser || mongoose.model('testUser', testUserSchema);
