import mongoose from 'mongoose';
import { ApplicationStatus } from '../types/database';
import { themeConstants } from '../theme/theme';
import { AccentColor, Theme } from '../theme/themeProvider';

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
		applicationStatus: {
			type: Number,
			default: ApplicationStatus.CREATED,
		},
		application: {
			type: Schema.Types.ObjectId,
			ref: 'Application',
		},
		nfcId: {
			type: String,
			unique: true,
			// https://stackoverflow.com/questions/7955040/mongodb-mongoose-unique-if-not-null
			sparse: true,
		},
		nfcPoints: {
			type: Number,
			default: 0,
		},
		eventsAttended: {
			type: [Schema.Types.ObjectId],
			ref: 'Event',
		},
		isJudgeCheckedIn: {
			type: Boolean,
			default: false,
		},
		settings: {
			baseTheme: {
				type: String,
				default: Theme.DARK,
			},
			accentColor: {
				type: String,
				default: AccentColor.MONOCHROME,
			},
		},
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.User || mongoose.model('User', UserSchema);
