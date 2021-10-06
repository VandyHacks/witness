import mongoose from 'mongoose';
import { UserSchema } from './user';

const Schema = mongoose.Schema;

const TeamSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		joinCode: {
			type: String,
			required: true,
			unique: true,
		},
		devpost: {
			type: String,
			required: true,
		},
		members: {
			type: [UserSchema],
			required: true,
			validate: {
				// check team size
				validator: (arr: Array<typeof UserSchema>) => arr.length <= 4,
				message: 'Max team size is 4 members.',
			},
		},
		scores: { type: [Schema.Types.ObjectId], ref: 'Scores' },
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
