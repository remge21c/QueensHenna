import { google } from 'googleapis'
import { Readable } from 'stream'
import { getSetting } from '@/lib/settings/appSettings'

async function getDriveClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET is not configured.')
  }

  const refreshToken = await getSetting<string>('google_drive_token')
  if (!refreshToken) {
    throw new Error('Google 계정이 연결되지 않았습니다. 설정에서 Google 계정을 연결해주세요.')
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  return google.drive({ version: 'v3', auth: oauth2Client })
}

export async function uploadBackupToDrive(folderId: string, filename: string, data: object) {
  const drive = await getDriveClient()

  // 같은 이름 파일이 있으면 삭제 (주간 1파일 유지)
  const existing = await drive.files.list({
    q: `name='${filename.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
  })
  for (const file of existing.data.files ?? []) {
    if (file.id) await drive.files.delete({ fileId: file.id })
  }

  // 새 백업 파일 업로드
  const result = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: {
      mimeType: 'application/json',
      body: Readable.from(JSON.stringify(data, null, 2)),
    },
    fields: 'id, name, webViewLink',
  })

  return result.data
}

export async function verifyFolderAccess(folderId: string): Promise<
  { ok: true; name: string } | { ok: false; error: string }
> {
  // 진단 로깅
  console.log('═══════════════════════════════════════════')
  console.log('[Drive 진단] 요청 폴더 ID:', folderId)

  try {
    const drive = await getDriveClient()

    // 권한 검증 - 테스트 파일 생성 후 즉시 삭제
    const { data: created } = await drive.files.create({
      requestBody: { name: '.queenshenna-test', parents: [folderId] },
      media: { mimeType: 'text/plain', body: 'ok' },
      fields: 'id',
    })
    if (created.id) {
      await drive.files.delete({ fileId: created.id })
    }

    console.log('[Drive 진단] 쓰기 권한 검증 성공')
    console.log('═══════════════════════════════════════════')

    try {
      const { data } = await drive.files.get({ fileId: folderId, fields: 'name' })
      return { ok: true, name: data.name ?? 'QueensHenna' }
    } catch {
      return { ok: true, name: 'QueensHenna' }
    }
  } catch (e: any) {
    const status = e?.status ?? e?.code ?? ''
    const msg = e?.message ?? '알 수 없는 오류'
    console.log('[Drive 진단] 오류:', status, msg)
    console.log('═══════════════════════════════════════════')
    return { ok: false, error: `[${status}] ${msg}` }
  }
}

// URL이나 ID 형태에서 폴더 ID 추출
export function extractFolderId(input: string): string {
  const trimmed = input.trim()
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  return trimmed
}
