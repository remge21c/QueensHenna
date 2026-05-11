import { readFileSync, appendFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const filePath = process.argv[2]
if (!filePath) {
  console.error('사용법: node scripts/add-drive-key.mjs "C:\\경로\\key.json"')
  process.exit(1)
}

const absPath = resolve(filePath.replace(/^["']|["']$/g, ''))
if (!existsSync(absPath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${absPath}`)
  process.exit(1)
}

try {
  const key = JSON.parse(readFileSync(absPath, 'utf-8'))
  const line = `\nGOOGLE_SERVICE_ACCOUNT_KEY=${JSON.stringify(key)}`
  appendFileSync('.env.local', line + '\n')
  console.log('✅ .env.local에 추가 완료')
  console.log(`   프로젝트: ${key.project_id}`)
  console.log(`   계정:     ${key.client_email}`)
} catch (e) {
  console.error('❌ JSON 파싱 오류:', e.message)
}
