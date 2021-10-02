import mongoose from 'mongoose';
import { HackerSchema } from './hacker';

const Schema = mongoose.Schema;

const TeamSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	members: {
		type: [HackerSchema],
		required: true,
		validate: {
			// check team size
			validator: (arr: Array<typeof HackerSchema>) => arr.length <= 4,
			message: 'Max team size is 4 members.',
		},
	},
	devpost: {
		type: String,
		required: true,
	},
	// add more stuff like judges
});

// prevent recompilation of model if it already exists
export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
