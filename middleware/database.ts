import mongoose from 'mongoose';

const { DATABASE_URL } = process.env;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */

let cached = (global as any).mongoose;

if (!cached) {
	cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(overrideURL?: string | undefined) {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const options = {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			bufferCommands: false,
			autoIndex: true,
		};

		cached.promise = mongoose.connect(overrideURL || (DATABASE_URL as string), options).then(mongoose => {
			return mongoose;
		});
	}
	cached.conn = await cached.promise;
	return cached.conn;
}

export default dbConnect;
