

import { D1DatabaseSettings, R2StorageSettings } from '../types';
import { mockD1Settings, mockR2Settings, mockEmployees, mockPositions, mockUnits, mockLeaveTypes, mockPositionHistory } from '../data/mockData';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Fetches D1 settings from the mock backend.
 * Never returns the auth token.
 */
export const getD1Settings = async (): Promise<Omit<D1DatabaseSettings, 'authToken'>> => {
    await delay(500); // Simulate network latency
    console.log('[API Service] MOCK GET /api/settings/database');
    const { authToken, ...settingsWithoutToken } = mockD1Settings;
    return settingsWithoutToken;
};

/**
 * Saves D1 settings to the mock backend.
 */
export const saveD1Settings = async (settings: D1DatabaseSettings): Promise<{ message: string }> => {
    await delay(1000); // Simulate network latency
    console.log('[API Service] MOCK POST /api/settings/database with data:', settings);
    // In a real backend, the token would be encrypted here.
    // We update the mock data object directly.
    Object.assign(mockD1Settings, settings);
    return { message: 'Pengaturan berhasil disimpan.' };
};

/**
 * Tests the D1 connection using settings stored in the mock backend.
 */
export const testD1Connection = async (): Promise<{ success: boolean; message: string }> => {
    await delay(1500); // Simulate network latency
    console.log('[API Service] MOCK POST /api/settings/database/test');
    
    const { accountId, databaseId, authToken, enabled } = mockD1Settings;
    
    if (!enabled) {
        return { success: false, message: 'Gagal: Sinkronisasi harus diaktifkan untuk melakukan tes.' };
    }

    if (accountId && databaseId && authToken) {
        return { success: true, message: 'Koneksi ke database berhasil.' };
    } else {
        return { success: false, message: 'Gagal terhubung. Pastikan semua kredensial yang tersimpan benar.' };
    }
};

/**
 * Simulates seeding initial mock data to the D1 database.
 */
export const seedInitialDataToD1 = async (): Promise<{ success: boolean; message: string }> => {
    console.log('[API Service] MOCK POST /api/database/seed');
    
    if (!mockD1Settings.enabled) {
        return { success: true, message: 'Sinkronisasi nonaktif, proses penyalinan data dilewati.' };
    }

    try {
        await delay(500);
        console.log(`[API Service] Seeding ${mockEmployees.length} employees...`);
        await delay(500);
        console.log(`[API Service] Seeding ${mockPositions.length} positions...`);
        await delay(500);
        console.log(`[API Service] Seeding ${mockUnits.length} units...`);
        await delay(500);
        console.log(`[API Service] Seeding ${mockLeaveTypes.length} leave types...`);
        await delay(500);
        console.log(`[API Service] Seeding ${mockPositionHistory.length} position history records...`);
        
        return { success: true, message: '✓ Data contoh berhasil disalin ke Cloudflare D1!' };

    } catch (e) {
        console.error('[API Service] Seeding failed:', e);
        return { success: false, message: '✗ Gagal menyalin data contoh ke D1.' };
    }
};

/**
 * Fetches R2 settings from the mock backend.
 * Never returns the secret keys.
 */
export const getR2Settings = async (): Promise<Omit<R2StorageSettings, 'accessKeyId' | 'secretAccessKey'>> => {
    await delay(500);
    console.log('[API Service] MOCK GET /api/settings/storage');
    const { accessKeyId, secretAccessKey, ...safeSettings } = mockR2Settings;
    return safeSettings;
};

/**
 * Saves R2 settings to the mock backend.
 */
export const saveR2Settings = async (settings: R2StorageSettings): Promise<{ message: string }> => {
    await delay(1000);
    console.log('[API Service] MOCK POST /api/settings/storage with data:', settings);
    Object.assign(mockR2Settings, settings);
    return { message: 'Pengaturan penyimpanan berhasil disimpan.' };
};

/**
 * Tests the R2 connection using settings stored in the mock backend.
 */
export const testR2Connection = async (): Promise<{ success: boolean; message: string }> => {
    await delay(1500);
    console.log('[API Service] MOCK POST /api/settings/storage/test');
    
    const { enabled, accountId, bucketName, accessKeyId, secretAccessKey } = mockR2Settings;
    
    if (!enabled) {
        return { success: false, message: 'Gagal: Penyimpanan R2 harus diaktifkan untuk melakukan tes.' };
    }

    if (accountId && bucketName && accessKeyId && secretAccessKey) {
        return { success: true, message: 'Koneksi ke R2 Bucket berhasil.' };
    } else {
        return { success: false, message: 'Gagal terhubung. Pastikan semua kredensial R2 yang tersimpan benar.' };
    }
};


/**
 * Simulates the backend generating a secure, time-limited URL for uploading a file.
 * This is the recommended secure approach for file uploads.
 */
export const generatePresignedUrl = async (fileName: string, contentType: string): Promise<{ success: boolean; uploadUrl?: string; finalUrl?: string; message: string }> => {
    console.log(`[API Service] MOCK POST /api/storage/generate-upload-url for file: ${fileName}`);
    await delay(500); // Simulate backend processing

    if (!mockR2Settings.enabled) {
        return { success: false, message: 'Penyimpanan Objek R2 tidak diaktifkan.' };
    }
    
    // In a real backend, you'd use the Cloudflare SDK to generate this URL.
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s/g, '_')}`;
    const mockUploadUrl = `https://mock-presigned-upload-url.com/${uniqueFileName}?signature=...&expires=...`;
    const mockFinalUrl = `https://pub.mock-r2-bucket.dev/${uniqueFileName}`;

    console.log(`[API Service] Generated pre-signed URL: ${mockUploadUrl}`);
    return { 
        success: true, 
        uploadUrl: mockUploadUrl,
        finalUrl: mockFinalUrl,
        message: 'URL berhasil dibuat.' 
    };
};

/**
 * Simulates the frontend uploading a file directly to the R2 pre-signed URL.
 */
export const uploadFileWithPresignedUrl = async (uploadUrl: string, file: File): Promise<{ success: boolean; message: string }> => {
    console.log(`[API Service] MOCK PUT request to pre-signed URL for file: ${file.name}`);
    // In a real frontend, this would be:
    // await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    await delay(1200); // Simulate upload time based on file size if needed

    console.log(`[API Service] Mock file upload to ${uploadUrl} completed.`);
    return { success: true, message: 'File berhasil diunggah.' };
};
