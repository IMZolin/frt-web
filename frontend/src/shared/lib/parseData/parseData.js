import { format, parseISO } from 'date-fns';
import { isToday } from 'date-fns';

export const parseData = (createdAt) => {
  if (isToday(parseISO(createdAt))) {
    return format(parseISO(createdAt), 'HH:mm');
  } else {
    return format(parseISO(createdAt), 'dd.MM.yyyy');
  }
};
