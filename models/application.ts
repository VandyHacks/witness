import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const ApplicationSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			reqired: true,
		},
		preferredName: {
			type: String,
			required: false,
		},
		gender: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			required: true,
		},
		phoneNumber: {
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
		levelOfStudy: {
			type: String,
			required: true,
		},
		graduationYear: {
			type: String,
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
		country: {
			type: String,
			required: true,
		},
		zip: {
			type: String,
			required: true,
		},
		race: {
			type: Array,
			required: true,
		},
		dietaryRestrictions: {
			type: Array,
			required: true,
		},
		accommodationNeeds: {
			type: String,
			required: false,
		},
		firstTime: {
			type: Boolean,
			required: true,
		},
		whyAttend: {
			type: String,
			required: true,
		},
		techIndustry: {
			type: String,
			required: true,
		},
		techStack: {
			type: String,
			required: true,
		},
		passion: {
			type: String,
			required: true,
		},
		motivation: {
			type: Array,
			required: true,
		},
		shirtSize: {
			type: String,
			required: true,
		},
		applyTravelReimbursement: {
			type: Boolean,
			required: false,
		},
		overnight: {
			type: Boolean,
			required: true,
		},
		prizeEligibility: {
			type: Boolean,
			required: true,
		},
		volunteer: {
			type: Boolean,
			required: true,
		},
		mlhComms: {
			type: Boolean,
		},
	},
	{
		timestamps: true,
	}
);

// prevent recompilation of model if it already exists
export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
