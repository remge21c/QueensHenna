'use server'

import { createClient } from '@/lib/supabase/server'
import { getRoleFromUser } from '@/lib/auth/roles'
import { uploadBackupToDrive, verifyFolderAccess, extractFolderId } from '@/lib/google/drive'
import { getSetting, setSetting } from '@/lib/settings/appSettings'
import { getAllTableData } from '@/lib/backup/getData'
import { format } from 'date-fns'

async function requireOwner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || getRoleFromUser(user) !== 'owner') {
    throw new Error('권한이 없습니다.')
  }
  return user
}

export async function getBackupStatus() {
  await requireOwner()
  const config = await getSetting<{ folderId: string; folderName?: string }>('backup.google_drive')
  const lastRun = await getSetting<{ at: string; filename: string; fileId?: string }>('backup.last_run')
  const token = await getSetting<string>('google_drive_token')
  
  return { 
    config,
    lastRun,
    isConnected: !!token 
  }
}



export async function testDriveConnection(folderIdInput: string) {
  await requireOwner()
  const folderId = extractFolderId(folderIdInput)
  if (!folderId) {
    return { success: false as const, error: '폴더 ID 또는 URL을 입력하세요.' }
  }
  const result = await verifyFolderAccess(folderId)
  if (!result.ok) {
    return { success: false as const, error: result.error, folderId }
  }
  return { success: true as const, folderId, folderName: result.name }
}

export async function saveBackupConfig(folderIdInput: string) {
  const user = await requireOwner()
  const folderId = extractFolderId(folderIdInput)
  if (!folderId) {
    return { success: false as const, error: '폴더 ID를 입력하세요.' }
  }

  const verify = await verifyFolderAccess(folderId)
  if (!verify.ok) {
    return { success: false as const, error: verify.error }
  }

  await setSetting('backup.google_drive', { folderId, folderName: verify.name }, user.id)
  return { success: true as const, folderId, folderName: verify.name }
}

export async function disconnectGoogleDrive() {
  const user = await requireOwner()
  // 토큰을 null로 만들거나 삭제
  await setSetting('google_drive_token', null, user.id)
  return { success: true as const }
}

export async function triggerManualBackup() {
  await requireOwner()

  const token = await getSetting<string>('google_drive_token')
  if (!token) {
    return { success: false as const, error: 'Google 계정이 연결되지 않았습니다.' }
  }

  const config = await getSetting<{ folderId: string }>('backup.google_drive')
  if (!config?.folderId) {
    return { success: false as const, error: '먼저 Google Drive 폴더 ID를 저장하세요.' }
  }

  try {
    const data = await getAllTableData()
    const filename = `queens-henna-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    const uploaded = await uploadBackupToDrive(config.folderId, filename, {
      exportedAt: new Date().toISOString(),
      tables: data,
    })

    await setSetting('backup.last_run', {
      at: new Date().toISOString(),
      filename,
      fileId: uploaded.id ?? undefined,
    })

    return {
      success: true as const,
      filename,
      webViewLink: uploaded.webViewLink ?? null,
    }
  } catch (e: any) {
    return { success: false as const, error: e?.message ?? '백업 중 오류 발생' }
  }
}
