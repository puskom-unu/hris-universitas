import type { IRequest } from 'itty-router';
import { mockPayslips } from '../../../data/mockData';
import { json } from '../utils';

export const getPayslips = (request: IRequest) => {
  const period = new URL(request.url).searchParams.get('period');
  const list = period
    ? mockPayslips.filter((p) => p.period === period)
    : mockPayslips;
  return json(list);
};

export const generatePayroll = () =>
  json({ success: true, message: 'Payroll berhasil dibuat.' });
