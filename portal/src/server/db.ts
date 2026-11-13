import 'server-only';
import mongoose from 'mongoose';

/* One connection per server process. Next.js reloads modules during
   development, so the connection lives on globalThis instead of in module
   scope; otherwise every edit would open another pool. */

const LOCAL_DEV_URI = 'mongodb://127.0.0.1:27017';
const DEFAULT_DB = 'gryc-portal';

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __grycMongo?: Cache };
const cached: Cache = (g.__grycMongo ??= { conn: null, promise: null });

export function databaseUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) return uri;
  if (process.env.NODE_ENV !== 'production') return LOCAL_DEV_URI;
  throw new Error(
    'MONGODB_URI is not set. Add the MongoDB Atlas connection string to the environment (see docs/atlas-setup.md).',
  );
}

/** "mongodb+srv://user:secret@cluster0.abc.mongodb.net" -> "cluster0.abc.mongodb.net", for messages. */
export function databaseHost(): string {
  try {
    return databaseUri().replace(/^mongodb(\+srv)?:\/\//, '').replace(/^[^@]*@/, '').split(/[/?]/)[0];
  } catch {
    return 'MongoDB';
  }
}

export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  cached.promise ??= mongoose
    .connect(databaseUri(), {
      dbName: process.env.MONGODB_DB?.trim() || DEFAULT_DB,
      bufferCommands: false,
      serverSelectionTimeoutMS: 6000,
    })
    .catch((err: unknown) => {
      cached.promise = null;
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(`Could not reach the database at ${databaseHost()}. ${reason}`);
    });
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDb(): Promise<void> {
  if (cached.conn) await cached.conn.disconnect();
  cached.conn = null;
  cached.promise = null;
}
