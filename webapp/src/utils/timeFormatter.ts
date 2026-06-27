/**
 * Utility functions for formatting time and durations in a user-friendly Persian (RTL) format.
 */

export const toPersianDigits = (str: string | number): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (w) => farsiDigits[parseInt(w)]);
};

interface DurationFormatOptions {
  includeRemainingSuffix?: boolean; // If true, appends "باقی‌مانده" (remaining)
  unitType?: 'hours' | 'minutes' | 'seconds'; // The input unit type, defaults to 'hours'
}

/**
 * Formats a duration value into a natural human-readable Persian string.
 * Supports decimal hours, minutes, and seconds input.
 */
export function formatPersianDuration(value: number, options: DurationFormatOptions = {}): string {
  const { includeRemainingSuffix = true, unitType = 'hours' } = options;

  let totalMinutes = 0;
  let isLessThanOneMinute = false;

  if (unitType === 'hours') {
    totalMinutes = Math.round(value * 60);
    isLessThanOneMinute = value > 0 && totalMinutes < 1;
  } else if (unitType === 'minutes') {
    totalMinutes = Math.round(value);
    isLessThanOneMinute = value > 0 && totalMinutes < 1;
  } else if (unitType === 'seconds') {
    totalMinutes = Math.round(value / 60);
    isLessThanOneMinute = value > 0 && value < 60;
  }

  if (totalMinutes <= 0 && !isLessThanOneMinute) {
    return includeRemainingSuffix ? "هیچ زمان ضبطی باقی نمانده است" : "۰ دقیقه";
  }

  if (isLessThanOneMinute) {
    return includeRemainingSuffix ? "کمتر از ۱ دقیقه باقی‌مانده" : "کمتر از ۱ دقیقه";
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  let result = '';
  if (h > 0 && m > 0) {
    result = `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه`;
  } else if (h > 0) {
    result = `${toPersianDigits(h)} ساعت`;
  } else {
    result = `${toPersianDigits(m)} دقیقه`;
  }

  if (includeRemainingSuffix) {
    return `${result} باقی‌مانده`;
  }
  return result;
}
