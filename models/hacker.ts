import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// dummy schema for use with Vaken's existing db
export const HackerSchema = new Schema({}, { strict: false });

// use vaken db for hacker info
const vakenDB = mongoose.connection.useDb('vaken');

// prevent recompilation of model if it already exists
export default mongoose.models.Hacker || vakenDB.model('Hacker', HackerSchema, 'Hackers');
