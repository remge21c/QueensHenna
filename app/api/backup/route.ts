import { NextRequest, NextResponse } from 'next/server'
import { getAllTableData } from '@/lib/backup/getData'
import { uploadBackupToDrive } from '@/lib/google/drive'
import { getSetting, setSetting } from '@/lib/settings/appSettings'
import { format } from 'date-fns'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function performBackup() {
  const token = await getSetting<string>('google_drive_token')
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Google 계정이 연동되지 않아 자동 백업을 실행할 수 없습니다.' },
      { status: 400 }
    )
  }

  const config = await getSetting<{ folderId: string }>('backup.google_drive')
  if (!config?.folderId) {
    return NextResponse.json(
      { success: false, error: '설정 페이지에서 폴더 ID를 먼저 입력하세요.' },
      { status: 400 }
    )
  }

  const data = await getAllTableData()
  const filename = `queens-henna-backup-${format(new Date(), 'yyyy-MM-dd')}.json`

  const uploaded = await uploadBackupToDrive(config.folderId, filename, {
    exportedAt: new Date().toISOString(),
    tables: data,
  })

  await setSetting('backup.last_run', {
    at: new Date().toISOString(),
    filename,
    fileId: uploaded.id,
  })

  return NextResponse.json({
    success: true,
    filename,
    fileId: uploaded.id,
    webViewLink: uploaded.webViewLink,
  })
}

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected) return false

  // Vercel Cron 자동 헤더 또는 수동 Authorization 헤더 모두 허용
  const headerSecret = request.headers.get('x-vercel-cron-secret')
  if (headerSecret === expected) return true

  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${expected}`) return true

  return false
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return await performBackup()
  } catch (e: any) {
    console.error('[backup] failed:', e)
    return NextResponse.json(
      { success: false, error: e?.message ?? '백업 중 오류 발생' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
