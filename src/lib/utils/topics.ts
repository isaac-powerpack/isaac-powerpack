export function isValidString(value: string | undefined): value is string {
  return value != undefined && value.trim() !== "";
}
