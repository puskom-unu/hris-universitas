import { z } from 'zod';

export const leaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, 'Pegawai wajib dipilih dari daftar pencarian'),
    leaveType: z.string().min(1, 'Jenis cuti wajib dipilih'),
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
    endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
    reason: z.string().min(1, 'Alasan wajib diisi'),
    document: z.any().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    path: ['endDate'],
    message: 'Tanggal selesai tidak boleh sebelum tanggal mulai',
  });

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

