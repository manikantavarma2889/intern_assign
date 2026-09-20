// Minimal `cn` helper compatible with the shadcn/rare-ui convention.
// Merges class-name inputs (strings, arrays, or objects) into a single space-
// separated string. Kept dependency-free — we don't need tailwind-merge here
// because our overrides are additive.
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: unknown };

function toClassList(value: ClassValue, out: string[]): void {
  if (!value) return;
  if (typeof value === 'string' || typeof value === 'number') {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) toClassList(v, out);
    return;
  }
  if (typeof value === 'object') {
    for (const key in value) {
      if (value[key]) out.push(key);
    }
  }
}

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) toClassList(input, out);
  return out.join(' ');
}
