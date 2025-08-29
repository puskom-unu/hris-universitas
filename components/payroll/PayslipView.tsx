
import React from 'react';
import { Payslip } from '../../types';

interface PayslipViewProps {
  payslip: Payslip;
}

const PayslipView: React.FC<PayslipViewProps> = ({ payslip }) => {
  const earnings = payslip.items.filter(item => item.type === 'Earning');
  const deductions = payslip.items.filter(item => item.type === 'Deduction');

  const formatCurrency = (amount: number) => `IDR ${amount.toLocaleString('id-ID')}`;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 text-gray-900 dark:text-gray-200" id="payslip-content">
      <header className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Slip Gaji</h1>
          <p className="text-gray-500 dark:text-gray-400">UNUGHA CILACAP</p>
        </div>
        <div>
          <p><span className="font-semibold">Periode:</span> {payslip.period}</p>
          <p><span className="font-semibold">ID Pegawai:</span> {payslip.employeeId}</p>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Informasi Pegawai</h2>
        <p><span className="font-semibold w-32 inline-block">Nama:</span> {payslip.employeeName}</p>
      </section>

      <section className="mt-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1 dark:border-gray-700">Pendapatan</h3>
            <table className="w-full text-sm">
              <tbody>
                {earnings.map(item => (
                  <tr key={item.name}>
                    <td className="py-1">{item.name}</td>
                    <td className="py-1 text-right font-mono">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t dark:border-gray-700">
                  <td className="py-2">Total Pendapatan</td>
                  <td className="py-2 text-right font-mono">{formatCurrency(payslip.grossSalary)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-1 dark:border-gray-700">Potongan</h3>
            <table className="w-full text-sm">
              <tbody>
                {deductions.map(item => (
                  <tr key={item.name}>
                    <td className="py-1">{item.name}</td>
                    <td className="py-1 text-right font-mono">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t dark:border-gray-700">
                  <td className="py-2">Total Potongan</td>
                  <td className="py-2 text-right font-mono">{formatCurrency(payslip.totalDeductions)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      <footer className="mt-8 pt-4 border-t dark:border-gray-700">
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-bold">Gaji Bersih (Take Home Pay)</h3>
          <p className="text-xl font-bold font-mono text-green-600">{formatCurrency(payslip.netSalary)}</p>
        </div>
        <p className="text-xs text-center text-gray-500 mt-4">Ini adalah dokumen yang dibuat oleh komputer dan tidak memerlukan tanda tangan.</p>
      </footer>
    </div>
  );
};

export default PayslipView;
