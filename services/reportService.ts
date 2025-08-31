// This service uses the SheetJS library
import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an Excel file, with optional custom headers.
 * @param data The array of data to export.
 * @param fileName The desired name of the file (without extension).
 * @param sheetName The name of the worksheet inside the Excel file.
 * @param headerOptions Optional configuration for custom headers.
 */
export const exportToExcel = <T extends object>(
  data: Array<T>,
  fileName: string,
  sheetName: string,
  headerOptions?: { mainHeader: string; subHeader: string }
): void => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    console.error("Export to Excel failed: Data array is empty or null.");
    return;
  }

  try {
    const finalData: unknown[][] = [];
    const headers = Object.keys(data[0]);
    const merges: XLSX.Range[] = [];

    // Add custom headers if provided
    if (headerOptions && headers.length > 0) {
      finalData.push([headerOptions.mainHeader]);
      finalData.push([headerOptions.subHeader]);
      finalData.push([]); // Spacer row
      
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
      merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } });
    }

    // Add column headers from the data keys
    finalData.push(headers);
    
    // Add data rows
    const dataAsArray = data.map((row) =>
      headers.map((header) => (row as Record<string, unknown>)[header])
    );
    finalData.push(...dataAsArray);

    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    if (merges.length > 0) {
      worksheet['!merges'] = merges;
    }

    // Auto-fit columns
    const colWidths: XLSX.ColInfo[] = headers.map((_, i) => {
      // Get the length of all cells in the column, including custom headers
      const columnData = finalData.map((row) => row[i]);
      const maxLength = Math.max(
        ...columnData
          .filter((cell) => cell !== null && cell !== undefined) // filter out null/undefined
          .map((cell) => String(cell).length)
      );
      return { wch: maxLength + 2 };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Gagal mengekspor data ke Excel. Silakan cek konsol untuk detailnya.");
  }
};
