import { utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { differenceInMinutes } from 'date-fns';

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

// คืนค่าเป็นวันที่ เดือน (ภาษาไทย) และปี พ.ศ.
export function getLocalToThaiDate(start, fallbackTimezone) {
  if (!start?.datetime) return '';

  const tz = start.timezone || fallbackTimezone;
  const dateObj = utcToZonedTime(new Date(start.datetime), tz);

  const thMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const day = dateObj.getDate();
  const month = thMonths[dateObj.getMonth()];
  const year = dateObj.getFullYear() + 543; // แปลงเป็น พ.ศ.

  return `${day} ${month} ${year}`;
}

// คืนค่าระยะเวลาเป็น "X ชั่วโมง Y นาที"
export function getDurationString(start, end, fallbackTimezone) {
    if (!start?.datetime || !end?.datetime) return '';

    const tzStart = start.timezone || fallbackTimezone;
    const tzEnd = end.timezone || fallbackTimezone;

    const startDate = utcToZonedTime(new Date(start.datetime), tzStart);
    const endDate = utcToZonedTime(new Date(end.datetime), tzEnd);

    const totalMinutes = differenceInMinutes(endDate, startDate);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} นาที`;
    if (minutes === 0) return `${hours} ชั่วโมง`;
    return `${hours} ชั่วโมง ${minutes} นาที`;
    }
