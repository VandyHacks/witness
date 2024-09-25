import mongoose, { Schema } from 'mongoose';

const TeamSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			validate: {
				// check for commas since we export to csv
				validator: (n: string) => !n.includes(','),
				message: 'Please do not include commas in your team name.',
			},
		},
		joinCode: {
			type: String,
			required: false,
			unique: true,
		},
		devpost: {
			type: String,
		},
		members: {
			type: [Schema.Types.ObjectId],
			ref: 'User',
			required: false,
			validate: {
				// check team size
				validator: (arr: Array<Schema.Types.ObjectId>) => arr.length <= 4,
				message: 'Max team size is 4 members.',
			},
		},
		scores: { type: [Schema.Types.ObjectId], ref: 'Scores', required: false },
		locationNum: { type: Number, reqiured: false },
	},
	{
		timestamps: false,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
