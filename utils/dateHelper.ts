import { DateRange } from '../types.ts';

export const formatDateForApi = (date: Date, format: 'datetime' | 'date', isEnd: boolean = false): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  if (format === 'date') {
    return `${yyyy}-${mm}-${dd}`;
  }

  const time = isEnd ? '23:59:59' : '00:00:00';
  return `${yyyy}-${mm}-${dd} ${time}`;
};

export const calculateReportDates = (dateFormat: 'datetime' | 'date'): DateRange[] => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  const ranges: DateRange[] = [];

  // If it's Monday (1), we want Friday through Sunday as ONE range
  if (dayOfWeek === 1) {
    // Friday Start
    const friday = new Date(today);
    friday.setDate(today.getDate() - 3);

    // Sunday End
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - 1);

    ranges.push({
      label: 'Weekend Report (Fri-Sun)',
      startDate: formatDateForApi(friday, dateFormat),
      endDate: formatDateForApi(sunday, dateFormat, true)
    });
  } else {
    // Standard Daily Run (Yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    ranges.push({
      label: 'Daily Report (Yesterday)',
      startDate: formatDateForApi(yesterday, dateFormat),
      endDate: formatDateForApi(yesterday, dateFormat, true)
    });
  }

  return ranges;
};