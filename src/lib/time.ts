// IST timezone utilities for trading hours
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

export const getCurrentIST = (): Date => {
  return toZonedTime(new Date(), IST_TIMEZONE);
};

export const formatIST = (date: Date, formatString: string = 'dd MMM yyyy HH:mm:ss'): string => {
  return formatInTimeZone(date, IST_TIMEZONE, formatString);
};

export const parseISTString = (dateString: string): Date => {
  return toZonedTime(parseISO(dateString), IST_TIMEZONE);
};

// Trading hours validation
export const isMarketOpen = (): boolean => {
  const now = getCurrentIST();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Market open: 9:15 AM to 3:30 PM IST
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  
  return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
};

export const isEntryAllowed = (): boolean => {
  const now = getCurrentIST();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // No new entries after 3:10 PM IST
  const entryCloseTime = 15 * 60 + 10; // 3:10 PM
  
  return timeInMinutes < entryCloseTime && isMarketOpen();
};

export const isSquareOffTime = (): boolean => {
  const now = getCurrentIST();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Square off at 3:15 PM IST
  const squareOffTime = 15 * 60 + 15; // 3:15 PM
  
  return timeInMinutes >= squareOffTime;
};

export const getMarketStatus = (): {
  isOpen: boolean;
  entryAllowed: boolean;
  squareOffTime: boolean;
  nextStateTime: string;
} => {
  const isOpen = isMarketOpen();
  const entryAllowed = isEntryAllowed();
  const squareOffTime = isSquareOffTime();
  
  let nextStateTime = '';
  if (!isOpen) {
    nextStateTime = 'Market opens at 9:15 AM IST';
  } else if (!entryAllowed && !squareOffTime) {
    nextStateTime = 'No new entries - Square off at 3:15 PM IST';
  } else if (squareOffTime) {
    nextStateTime = 'Market closes at 3:30 PM IST';
  }
  
  return {
    isOpen,
    entryAllowed,
    squareOffTime,
    nextStateTime
  };
};

export const generateCorrelationId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};