import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const ApplicationSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		preferredName: {
			type: String,
		},
		lastName: {
			type: String,
			reqired: true,
		},
		gender: {
			type: String,
			required: true,
		},
		dietaryRestrictions: {
			type: Array,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		dateOfBirth: {
			type: String,
			required: true,
		},
		school: {
			type: String,
			required: true,
		},
		major: {
			type: String,
			required: true,
		},
		graduationYear: {
			type: String,
			required: true,
		},
		race: {
			type: Array,
			required: true,
		},
		motivation: {
			type: Array,
			required: true,
		},
		applyTravelReimbursement: {
			type: Boolean,
			required: true,
		},
		volunteer: {
			type: Boolean,
			required: true,
		},
		address1: {
			type: String,
			required: true,
		},
		address2: {
			type: String,
		},
		city: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			required: true,
		},
		zip: {
			type: String,
			required: true,
		},
		shirtSize: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
