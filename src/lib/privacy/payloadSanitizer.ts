export function removeUndefinedFields<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)) as T;
}

export function hasUndefinedField(value: Record<string, unknown>): boolean {
  return Object.values(value).some((fieldValue) => fieldValue === undefined);
}
