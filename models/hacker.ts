import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// dummy schema for use with Vaken's existing db
const HackerSchema = new Schema({}, { strict: false });

// prevent recompilation of model if it already exists
export const Hacker = mongoose.models.Hacker || mongoose.model('Hacker', HackerSchema, 'Hackers');
