import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { Member } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Mandatory SCOPES declaration as required by workspace-integration skill
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Lazy Firebase initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  webViewLink?: string;
}

/**
 * Initialize Google Auth state listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Access token is memory-only; needs user login interaction to acquire Drive scope
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in using Google Auth Popup to acquire Drive access token
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không nhận được mã truy cập (access token) từ Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Lỗi đăng nhập Google Drive:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get the in-memory cached access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out from Google Auth and invalidate in-memory token
 */
export const googleSignOut = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * List existing family tree backups saved in user's Google Drive
 */
export const listDriveBackups = async (token: string): Promise<DriveFileInfo[]> => {
  try {
    const q = encodeURIComponent("name contains 'GiaPha_HoDao' and trashed = false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink)&orderBy=modifiedTime desc&pageSize=30`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Lỗi tải danh sách file (${res.status})`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('listDriveBackups error:', err);
    throw err;
  }
};

/**
 * Search for the primary master sync file on Google Drive
 */
export const findMasterDriveFile = async (token: string): Promise<DriveFileInfo | null> => {
  try {
    const q = encodeURIComponent("name = 'GiaPha_HoDao_DuLieu_Chinh.json' and trashed = false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=1`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (err) {
    console.warn('findMasterDriveFile warning:', err);
    return null;
  }
};

/**
 * Save genealogy data to Google Drive.
 * Fixed multipart boundary formatting according to RFC 2046 & Google Drive API v3 specs.
 */
export const saveToDrive = async (
  token: string,
  members: Member[],
  options?: {
    customFileName?: string;
    fileIdToUpdate?: string;
    isSnapshotBackup?: boolean;
  }
): Promise<DriveFileInfo> => {
  const isSnapshot = options?.isSnapshotBackup;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;

  const fileName =
    options?.customFileName ||
    (isSnapshot
      ? `GiaPha_HoDao_BanLuu_${dateStr}_${timeStr}.json`
      : 'GiaPha_HoDao_DuLieu_Chinh.json');

  const fileContent = JSON.stringify(members, null, 2);

  // If updating an existing file directly via PATCH media upload (simple, no multipart needed)
  if (options?.fileIdToUpdate) {
    const patchUrl = `https://www.googleapis.com/upload/drive/v3/files/${options.fileIdToUpdate}?uploadType=media`;
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: fileContent
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Không thể cập nhật tệp tin trên Google Drive (${res.status})`);
    }

    const updated = await res.json();
    return updated;
  }

  // Create new file via standard multipart/related request
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Dữ liệu Gia Phả Họ Đào (${members.length} thành viên) - Lưu lúc ${now.toLocaleString('vi-VN')}`
  };

  const boundary = '-------ho_dao_drive_boundary_' + Date.now();

  // RFC 2046: First boundary MUST NOT have a leading \r\n
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    fileContent +
    `\r\n--${boundary}--`;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Không thể tạo tệp tin trên Google Drive (${res.status})`);
  }

  return await res.json();
};

/**
 * High-level helper: Sync the master file to Google Drive.
 * Checks if 'GiaPha_HoDao_DuLieu_Chinh.json' exists. If so, updates it.
 * If not, creates it. This prevents creating duplicate files on each auto-sync.
 */
export const syncMasterFileToDrive = async (
  token: string,
  members: Member[]
): Promise<DriveFileInfo> => {
  const existingMaster = await findMasterDriveFile(token);
  if (existingMaster?.id) {
    return await saveToDrive(token, members, {
      fileIdToUpdate: existingMaster.id,
      isSnapshotBackup: false
    });
  } else {
    return await saveToDrive(token, members, {
      isSnapshotBackup: false
    });
  }
};

/**
 * Load and parse genealogy JSON from Google Drive
 */
export const readFromDrive = async (token: string, fileId: string): Promise<Member[]> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Không thể đọc tệp từ Google Drive (mã lỗi: ${res.status})`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0 || !data[0].fullName) {
    throw new Error('Nội dung tệp Google Drive không đúng cấu trúc dữ liệu gia phả.');
  }

  return data;
};

/**
 * Fetch the latest master or latest backup from user's Google Drive.
 * Returns the parsed members array and file info if found.
 */
export const fetchLatestDriveMaster = async (
  token: string
): Promise<{ members: Member[]; file: DriveFileInfo } | null> => {
  try {
    // 1. Try to find the master sync file
    let targetFile = await findMasterDriveFile(token);

    // 2. If master file not found, check the most recent backup
    if (!targetFile) {
      const allFiles = await listDriveBackups(token);
      if (allFiles.length > 0) {
        targetFile = allFiles[0];
      }
    }

    if (!targetFile?.id) {
      return null;
    }

    const members = await readFromDrive(token, targetFile.id);
    return { members, file: targetFile };
  } catch (err) {
    console.error('fetchLatestDriveMaster error:', err);
    return null;
  }
};

/**
 * Delete a backup file from Google Drive
 */
export const deleteFromDrive = async (token: string, fileId: string): Promise<boolean> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Không thể xóa tệp tin trên Google Drive');
  }

  return true;
};
