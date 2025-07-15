// utils/dateLocal.js
import { utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { differenceInMinutes } from 'date-fns';
import React from 'react'; // ต้องมีสำหรับใช้ JSX ในฟังก์ชัน

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

// คืนสถานะเวลา: "ontime" หรือ "delay (x ชั่วโมง y นาที)"
export function getStatusTimeString(start, fallbackTimezone) {
  if (!start?.datetime) return '';

  const tzStart = start.timezone || fallbackTimezone;

  // 1. แปลง start.datetime (UTC) → local ของเวลานั้น
  const startDate = utcToZonedTime(new Date(start.datetime), tzStart);

  // 2. เวลา local ปัจจุบันของ client
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || fallbackTimezone;
  const nowDate = utcToZonedTime(new Date(), clientTimezone);

  // 3. คำนวณความต่างของเวลา
  const totalMinutes = differenceInMinutes(nowDate, startDate);

  // ✅ เงื่อนไขใหม่: เลตไม่เกิน 1 นาที → ยังถือว่า "On time"
  if (totalMinutes <= 1) {
    return { type: 'On time' };
  }

  // ถ้าเกิน 1 นาที → Delay
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return { type: 'Delay', time: `${minutes} นาที` };
  if (minutes === 0) return { type: 'Delay', time: `${hours} ชั่วโมง` };
  return { type: 'Delay', time: `${hours} ชั่วโมง ${minutes} นาที` };
}




export function getStatusEndTimeString(end, fallbackTimezone) {
  if (!end?.datetime) return null;

  const tzEnd = end.timezone || fallbackTimezone;
  const endDate = utcToZonedTime(new Date(end.datetime), tzEnd);

  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || fallbackTimezone;
  const nowDate = utcToZonedTime(new Date(), clientTimezone);

  const minutesLeft = differenceInMinutes(endDate, nowDate);

  if (minutesLeft > 0 && minutesLeft <= 15) {
    return <h6 className='mb-0 text-warning small'>(เหลือเวลา {minutesLeft} นาที)</h6>;
  }

  if (minutesLeft == 0 ) {
    return <h6 className='mb-0 text-warning small'>(ครบเวลาเเล้ว)</h6>;
  }

  if (minutesLeft < 0) {
    const overdue = Math.abs(minutesLeft);
    return <h6 className='mb-0 text-danger small'>(เกินมา {overdue} นาที)</h6>;
  }

  return null; // ไม่แสดงอะไร
}


export function getDatesListFromStartEnd(start, end) {
  // ตรวจสอบว่ามีข้อมูล datetime ครบถ้วนหรือไม่
  if (!start?.datetime || !end?.datetime) {
    return [];
  }

  const dates = [];
  const startDate = new Date(start.datetime);
  const endDate = new Date(end.datetime);

  // สร้าง Date object ใหม่สำหรับวนลูป เพื่อไม่ให้กระทบค่าเดิม
  let currentDate = new Date(startDate);

  // ปรับเวลาให้เป็นเที่ยงคืน (UTC) เพื่อให้เปรียบเทียบเฉพาะวันที่ได้ถูกต้อง
  currentDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);


  while (currentDate <= endDate) {
    // เพิ่มสำเนาของวันที่ปัจจุบันลงในอาร์เรย์
    dates.push(new Date(currentDate));
    // เลื่อนไปวันถัดไป
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
}