import 'server-only';

/* Turns a lean Mongoose document into the plain shapes in src/lib/types.ts:
   `_id` becomes `id`, ObjectIds become strings, Dates become ISO strings and
   Maps become objects. Everything handed to a component goes through here, so
   nothing that cannot cross the server/client boundary slips out. */

function isObjectId(v: unknown): v is { toHexString(): string } {
  return typeof v === 'object' && v !== null && (v as { _bsontype?: string })._bsontype === 'ObjectId';
}

function convert(value: unknown): unknown {
  if (value === null || value === undefined) return value ?? null;
  if (isObjectId(value)) return value.toHexString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Map) {
    return Object.fromEntries([...value.entries()].map(([k, v]) => [k, convert(v)]));
  }
  if (Array.isArray(value)) return value.map(convert);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k === '_id' ? 'id' : k] = convert(v);
    }
    return out;
  }
  return value;
}

export function serialize<T>(doc: unknown): T {
  return convert(doc) as T;
}

export function serializeAll<T>(docs: unknown[]): T[] {
  return docs.map((d) => serialize<T>(d));
}
