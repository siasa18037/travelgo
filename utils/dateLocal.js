import { utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

// คืน Date object ตามเวลาท้องถิ่นของ timezone ที่เลือก
export function getLocalDateObjFromUtc({ datetime, timezone }, fallbackTimezone) {
  if (!datetime) return null;
  const tz = timezone || fallbackTimezone;
  return utcToZonedTime(new Date(datetime), tz);
}

// คืน string dd/MM/yyyy สำหรับ select (เอา timezone จาก start.timezone ก่อน, ถ้าไม่มีค่อย fallback)
export function getLocalDateString(start, fallbackTimezone) {
  if (!start?.datetime) return '';
  const tz = start.timezone || fallbackTimezone;
  const dateObj = utcToZonedTime(new Date(start.datetime), tz);
  return format(dateObj, 'dd/MM/yyyy');
}

// คืน string HH:mm สำหรับ input time
export function getLocalTimeString(start, fallbackTimezone) {
  if (!start?.datetime) return '';
  const tz = start.timezone || fallbackTimezone;
  const dateObj = utcToZonedTime(new Date(start.datetime), tz);
  return format(dateObj, 'HH:mm');
}