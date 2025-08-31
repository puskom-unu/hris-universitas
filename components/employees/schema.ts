import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  nip: z.string().min(1, 'NIP wajib diisi'),
  position: z.string().min(1, 'Jabatan wajib dipilih'),
  unit: z.string().min(1, 'Unit wajib dipilih'),
  email: z.string().email('Format email tidak valid'),
  whatsappNumber: z
    .string()
    .min(1, 'Nomor WhatsApp wajib diisi')
    .regex(/^\d+$/, 'Format Nomor WhatsApp tidak valid. Harap masukkan angka saja.'),
  joinDate: z.string().min(1, 'Tanggal bergabung wajib diisi'),
  status: z.enum(['Active', 'Inactive']),
  bankName: z.string().min(1, 'Nama bank wajib diisi.'),
  accountNumber: z
    .string()
    .min(1, 'Nomor rekening wajib diisi.')
    .regex(/^\d+$/, 'Nomor rekening hanya boleh berisi angka.'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

