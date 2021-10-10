import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ScheduleSchema = new Schema(
	{
		team: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Team',
		},
		judges: {
			type: [Schema.Types.ObjectId],
			required: true,
			ref: 'User',
		},
		zoom: {
			type: String,
			required: true,
		},
		time: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
