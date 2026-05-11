import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { setSetting } from '@/lib/settings/appSettings'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing OAuth credentials in environment' }, { status: 500 })
  }

  const redirectUri = `${origin}/api/auth/google-drive/callback`

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    // refresh_token이 있으면 저장 (access_type='offline' & prompt='consent' 시 발급됨)
    if (tokens.refresh_token) {
      await setSetting('google_drive_token', tokens.refresh_token)
    } else {
      // 혹시라도 refresh_token이 오지 않았을 경우를 대비한 로직 (기존 저장된 토큰이 있는지 확인하거나 오류 처리)
      console.log('Warning: No refresh token received from Google OAuth.')
      // 일단 access_token이라도 일시적으로 사용 가능하도록 저장할 수도 있지만
      // 영구 백업용으로는 refresh_token이 필수이므로, 
      // 만약 refresh_token이 안 왔다면, 사용자가 "권한 삭제 후 다시 연결" 하도록 유도해야 할 수 있음.
    }

    return NextResponse.redirect(`${origin}/settings`)
  } catch (error: any) {
    console.error('Error exchanging code for token:', error)
    return NextResponse.json({ error: 'Failed to exchange token', details: error.message }, { status: 500 })
  }
}
