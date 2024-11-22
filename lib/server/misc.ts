import * as argon2 from "argon2";

export async function hashPassword(password: string) {
  return await argon2.hash(password);
}

export function isWithinDateRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

export function hasTimeConflict(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  );
}
