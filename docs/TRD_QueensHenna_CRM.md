# TRD – 퀸즈헤나 고객관리 웹앱
Technical Requirements Document

## 1. 시스템 개요
퀸즈헤나 고객관리 웹앱은 고객관리, 예약관리, 시술기록, 고객별 염색약 잔량 관리, 매출 관리, 문자 발송, 백업 기능을 제공하는 내부 운영용 웹 시스템이다.

사용자는 원장님(owner)과 앱관리자(admin) 두 명이다.

---

## 2. 시스템 아키텍처

브라우저
→ Next.js 웹앱 (프론트 + 서버)
→ API / Server Actions
→ Prisma ORM
→ PostgreSQL Database
→ 파일 저장 (서버 디스크)

---

## 3. 기술 스택

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Next.js API Routes / Server Actions
- Node.js LTS
- Prisma ORM

### Database
- PostgreSQL

### File Storage
- 서버 로컬 파일 저장
- DB에는 파일 경로 저장

### Authentication
- Session 기반 로그인
- Role 기반 권한관리 (owner, admin)

### Backup
- PostgreSQL Dump
- Upload Folder Backup

---

## 4. 사용자 권한

| Role | 권한 |
|------|------|
| owner | 고객, 예약, 시술, 매출, 문자 |
| admin | 모든 기능 + 설정 + 백업 |

---

## 5. 주요 모듈

1. 인증 모듈
2. 고객관리 모듈
3. 예약관리 모듈
4. 시술기록 모듈
5. 염색약관리 모듈
6. 재고/잔량 계산 모듈
7. 매출통계 모듈
8. 문자발송 모듈
9. 파일 업로드 모듈
10. 백업/복원 모듈
11. 설정 모듈

---

## 6. 데이터베이스 스키마 (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────
// 사용자
// ──────────────────────────────
model User {
  id           Int      @id @default(autoincrement())
  name         String   @db.VarChar(50)
  role         Role     @default(OWNER)
  loginId      String   @unique @db.VarChar(50) @map("login_id")
  passwordHash String   @map("password_hash")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")

  backups Backup[]

  @@map("users")
}

enum Role {
  OWNER
  ADMIN
}

// ──────────────────────────────
// 고객
// ──────────────────────────────
model Customer {
  id               Int       @id @default(autoincrement())
  name             String    @db.VarChar(50)
  phone            String    @db.VarChar(20)
  birthDate        DateTime? @map("birth_date") @db.Date
  memo             String?   @db.Text
  profileImagePath String?   @map("profile_image_path") @db.VarChar(500)
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  reservations   Reservation[]
  treatments     Treatment[]
  recipes        CustomerRecipe[]
  dyeStocks      CustomerDyeStock[]

  @@map("customers")
}

// ──────────────────────────────
// 예약
// ──────────────────────────────
model Reservation {
  id         Int               @id @default(autoincrement())
  customerId Int               @map("customer_id")
  reservedAt DateTime          @map("reserved_at")
  status     ReservationStatus @default(RESERVED)
  memo       String?           @db.Text
  createdAt  DateTime          @default(now()) @map("created_at")
  updatedAt  DateTime          @updatedAt @map("updated_at")

  customer Customer @relation(fields: [customerId], references: [id])

  @@map("reservations")
}

enum ReservationStatus {
  RESERVED   // 예약완료
  VISITED    // 방문완료
  CANCELLED  // 취소
  NO_SHOW    // 노쇼
  WAITING    // 대기
}

// ──────────────────────────────
// 시술 종류
// ──────────────────────────────
model TreatmentType {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  basePrice Int      @default(0) @map("base_price")
  isActive  Boolean  @default(true) @map("is_active")

  treatments Treatment[]

  @@map("treatment_types")
}

// ──────────────────────────────
// 시술 기록
// ──────────────────────────────
model Treatment {
  id              Int           @id @default(autoincrement())
  customerId      Int           @map("customer_id")
  treatmentTypeId Int           @map("treatment_type_id")
  treatedAt       DateTime      @map("treated_at")
  basePrice       Int           @default(0) @map("base_price")
  extraPrice      Int           @default(0) @map("extra_price")
  totalPrice      Int           @default(0) @map("total_price")
  paymentMethod   PaymentMethod @map("payment_method")
  memo            String?       @db.Text
  createdAt       DateTime      @default(now()) @map("created_at")

  customer      Customer            @relation(fields: [customerId], references: [id])
  treatmentType TreatmentType       @relation(fields: [treatmentTypeId], references: [id])
  dyeUsages     TreatmentDyeUsage[]

  @@map("treatments")
}

enum PaymentMethod {
  BANK_TRANSFER  // 계좌이체
  CASH           // 현금
  CARD           // 카드
}

// ──────────────────────────────
// 단위
// ──────────────────────────────
model DyeUnit {
  id       Int     @id @default(autoincrement())
  name     String  @unique @db.VarChar(20)
  isActive Boolean @default(true) @map("is_active")

  dyes              Dye[]
  recipes           CustomerRecipe[]
  dyeStocks         CustomerDyeStock[]
  treatmentDyeUsages TreatmentDyeUsage[]

  @@map("dye_units")
}

// ──────────────────────────────
// 염색약 종류
// ──────────────────────────────
model Dye {
  id            Int     @id @default(autoincrement())
  name          String  @db.VarChar(100)
  totalCapacity Float   @map("total_capacity")
  defaultUnitId Int     @map("default_unit_id")
  memo          String? @db.Text
  isActive      Boolean @default(true) @map("is_active")

  defaultUnit        DyeUnit              @relation(fields: [defaultUnitId], references: [id])
  recipes            CustomerRecipe[]
  dyeStocks          CustomerDyeStock[]
  treatmentDyeUsages TreatmentDyeUsage[]

  @@map("dyes")
}

// ──────────────────────────────
// 고객 기본 레시피
// ──────────────────────────────
model CustomerRecipe {
  id               Int     @id @default(autoincrement())
  customerId       Int     @map("customer_id")
  dyeId            Int     @map("dye_id")
  defaultUseAmount Float   @map("default_use_amount")
  unitId           Int     @map("unit_id")
  memo             String? @db.Text

  customer Customer @relation(fields: [customerId], references: [id])
  dye      Dye      @relation(fields: [dyeId], references: [id])
  unit     DyeUnit  @relation(fields: [unitId], references: [id])

  @@unique([customerId, dyeId])
  @@map("customer_recipes")
}

// ──────────────────────────────
// 고객 보유 염색약
// ──────────────────────────────
model CustomerDyeStock {
  id              Int            @id @default(autoincrement())
  customerId      Int            @map("customer_id")
  dyeId           Int            @map("dye_id")
  purchasedAmount Float          @map("purchased_amount")
  currentAmount   Float          @map("current_amount")
  unitId          Int            @map("unit_id")
  purchasedAt     DateTime       @map("purchased_at")
  status          DyeStockStatus @default(NORMAL)

  customer          Customer            @relation(fields: [customerId], references: [id])
  dye               Dye                 @relation(fields: [dyeId], references: [id])
  unit              DyeUnit             @relation(fields: [unitId], references: [id])
  treatmentDyeUsages TreatmentDyeUsage[]

  @@map("customer_dye_stocks")
}

enum DyeStockStatus {
  NORMAL    // 정상: 남은횟수 > 2
  CAUTION   // 주의: 남은횟수 <= 2
  WARNING   // 경고: 남은횟수 <= 1 (연락 필요)
  DEPLETED  // 소진: 남은횟수 <= 0
}

// ──────────────────────────────
// 시술 사용 염색약
// ──────────────────────────────
model TreatmentDyeUsage {
  id                 Int   @id @default(autoincrement())
  treatmentId        Int   @map("treatment_id")
  customerDyeStockId Int   @map("customer_dye_stock_id")
  dyeId              Int   @map("dye_id")
  usedAmount         Float @map("used_amount")
  unitId             Int   @map("unit_id")

  treatment        Treatment        @relation(fields: [treatmentId], references: [id])
  customerDyeStock CustomerDyeStock @relation(fields: [customerDyeStockId], references: [id])
  dye              Dye              @relation(fields: [dyeId], references: [id])
  unit             DyeUnit          @relation(fields: [unitId], references: [id])

  @@map("treatment_dye_usages")
}

// ──────────────────────────────
// 문자 템플릿
// ──────────────────────────────
model MessageTemplate {
  id        Int     @id @default(autoincrement())
  name      String  @db.VarChar(100)
  content   String  @db.Text
  type      MessageType
  isActive  Boolean @default(true) @map("is_active")

  @@map("message_templates")
}

enum MessageType {
  RESERVATION_CONFIRM  // 예약 확인
  VISIT_REMINDER       // 방문 전 안내
  DYE_LOW              // 염색약 부족 안내
  REVISIT_SUGGEST      // 재방문 권장
  CUSTOM               // 개별 문자
}

// ──────────────────────────────
// 시스템 설정
// ──────────────────────────────
model SystemSetting {
  id    Int    @id @default(autoincrement())
  key   String @unique @db.VarChar(100)
  value String @db.Text

  @@map("system_settings")
}

// ──────────────────────────────
// 백업 이력
// ──────────────────────────────
model Backup {
  id        Int          @id @default(autoincrement())
  type      BackupType
  filePath  String       @map("file_path") @db.VarChar(500)
  createdAt DateTime     @default(now()) @map("created_at")
  createdBy Int          @map("created_by")
  status    BackupStatus @default(SUCCESS)

  creator User @relation(fields: [createdBy], references: [id])

  @@map("backups")
}

enum BackupType {
  MANUAL
  AUTO
}

enum BackupStatus {
  SUCCESS
  FAILED
}

// ──────────────────────────────
// 시스템 로그
// ──────────────────────────────
model SystemLog {
  id        Int      @id @default(autoincrement())
  level     LogLevel
  module    String   @db.VarChar(50)
  message   String   @db.Text
  detail    String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  @@map("system_logs")
}

enum LogLevel {
  INFO
  WARN
  ERROR
}
```

---

## 7. 핵심 비즈니스 로직

### 시술 등록 시 처리
1. 시술기록 저장
2. 사용 염색약 기록 저장
3. 고객 보유 염색약 잔량 차감
4. 남은 사용 횟수 계산
5. 부족 상태 판단
6. 고객 최근 방문일 업데이트
7. 고객 누적 매출 업데이트

### 남은 횟수 계산
남은횟수 = 현재잔량 / 1회 사용량

---

## 8. 예약 시스템
- 예약 시간 10분 단위
- 예약 시간 겹침 허용
- 겹치는 예약은 경고 표시
- 예약 상태 관리

---

## 9. 파일 업로드
저장 위치:
/public/uploads/customers/
/public/uploads/treatments/

---

## 10. 백업 시스템
- DB 백업
- 업로드 파일 백업
- 수동/자동 백업
- 복원 기능

---

## 11. 배포 구조
Linux Server
- Node.js
- Next.js App
- PostgreSQL
- Upload Folder
- Backup Folder

---

## 12. API 엔드포인트

### 인증
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/auth/login` | 로그인 | public |
| POST | `/api/auth/logout` | 로그아웃 | all |
| GET | `/api/auth/me` | 현재 사용자 정보 | all |

### 고객관리
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/customers` | 고객 목록 (검색/페이징) | all |
| GET | `/api/customers/:id` | 고객 상세 | all |
| POST | `/api/customers` | 고객 등록 | all |
| PUT | `/api/customers/:id` | 고객 수정 | all |
| DELETE | `/api/customers/:id` | 고객 삭제 | admin |
| POST | `/api/customers/:id/profile-image` | 프로필 사진 업로드 | all |

### 예약관리
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/reservations` | 예약 목록 (날짜 필터) | all |
| GET | `/api/reservations/:id` | 예약 상세 | all |
| POST | `/api/reservations` | 예약 등록 | all |
| PUT | `/api/reservations/:id` | 예약 수정 | all |
| PATCH | `/api/reservations/:id/status` | 예약 상태 변경 | all |

### 시술기록
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/treatments` | 시술 목록 (날짜/고객 필터) | all |
| GET | `/api/treatments/:id` | 시술 상세 | all |
| POST | `/api/treatments` | 시술 등록 (잔량 차감 포함) | all |
| PUT | `/api/treatments/:id` | 시술 수정 | all |
| DELETE | `/api/treatments/:id` | 시술 삭제 (잔량 복원 포함) | admin |

### 고객 레시피
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/customers/:id/recipes` | 고객 레시피 목록 | all |
| POST | `/api/customers/:id/recipes` | 레시피 등록 | all |
| PUT | `/api/customers/:id/recipes/:recipeId` | 레시피 수정 | all |
| DELETE | `/api/customers/:id/recipes/:recipeId` | 레시피 삭제 | all |

### 염색약 관리
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/dyes` | 염색약 종류 목록 | all |
| POST | `/api/dyes` | 염색약 종류 등록 | admin |
| PUT | `/api/dyes/:id` | 염색약 종류 수정 | admin |
| GET | `/api/customers/:id/dye-stocks` | 고객 보유 염색약 목록 | all |
| POST | `/api/customers/:id/dye-stocks` | 염색약 구매 등록 | all |
| PUT | `/api/customers/:id/dye-stocks/:stockId` | 보유 염색약 수정 | all |

### 매출통계
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/stats/daily` | 일별 매출 | all |
| GET | `/api/stats/monthly` | 월별 매출 | all |
| GET | `/api/stats/by-customer` | 고객별 매출 | all |
| GET | `/api/stats/by-treatment-type` | 시술 종류별 매출 | all |
| GET | `/api/stats/by-payment-method` | 결제수단별 매출 | all |

### 문자발송
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/messages/send` | 문자 발송 | all |
| GET | `/api/messages/templates` | 템플릿 목록 | all |
| POST | `/api/messages/templates` | 템플릿 등록 | admin |
| PUT | `/api/messages/templates/:id` | 템플릿 수정 | admin |

### 대시보드
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/dashboard` | 대시보드 종합 데이터 | all |

### 설정
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/settings` | 설정 조회 | admin |
| PUT | `/api/settings` | 설정 변경 | admin |
| GET | `/api/treatment-types` | 시술 종류 목록 | all |
| POST | `/api/treatment-types` | 시술 종류 등록 | admin |
| PUT | `/api/treatment-types/:id` | 시술 종류 수정 | admin |
| GET | `/api/dye-units` | 단위 목록 | all |
| POST | `/api/dye-units` | 단위 등록 | admin |

### 백업
| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/backups` | 백업 이력 목록 | admin |
| POST | `/api/backups` | 수동 백업 실행 | admin |
| POST | `/api/backups/:id/restore` | 복원 실행 | admin |

---

## 13. 에러 처리 및 유효성 검증

### 에러 응답 형식
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "전화번호 형식이 올바르지 않습니다.",
    "details": [
      { "field": "phone", "message": "010-XXXX-XXXX 형식으로 입력해주세요." }
    ]
  }
}
```

### 에러 코드
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| `VALIDATION_ERROR` | 400 | 입력값 유효성 검증 실패 |
| `UNAUTHORIZED` | 401 | 로그인 필요 |
| `FORBIDDEN` | 403 | 권한 부족 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `CONFLICT` | 409 | 중복 데이터 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

### 유효성 검증 규칙

#### 고객
| 필드 | 규칙 |
|------|------|
| name | 필수, 1~50자 |
| phone | 필수, 정규식 `^01[016789]-?\d{3,4}-?\d{4}$` |
| birthDate | 선택, 유효한 날짜, 미래 날짜 불가 |
| profileImage | 선택, jpg/png/webp, 최대 5MB |

#### 예약
| 필드 | 규칙 |
|------|------|
| customerId | 필수, 존재하는 고객 |
| reservedAt | 필수, 10분 단위 시간 |
| status | 필수, ReservationStatus enum 값 |

#### 시술기록
| 필드 | 규칙 |
|------|------|
| customerId | 필수, 존재하는 고객 |
| treatmentTypeId | 필수, 존재하는 시술 종류 |
| basePrice | 필수, 0 이상 정수 |
| extraPrice | 선택, 0 이상 정수 |
| paymentMethod | 필수, PaymentMethod enum 값 |
| dyeUsages[].usedAmount | 필수, 0 초과, 현재 잔량 이하 |

#### 염색약 재고
| 필드 | 규칙 |
|------|------|
| dyeId | 필수, 존재하는 염색약 |
| purchasedAmount | 필수, 0 초과 |
| currentAmount | 잔량 차감 시 음수 불가 (0 미만이면 에러) |

#### 레시피
| 필드 | 규칙 |
|------|------|
| dyeId | 필수, 존재하는 염색약, 고객당 염색약 중복 불가 |
| defaultUseAmount | 필수, 0 초과 |

---

## 14. 보안 및 환경 변수

### 환경 변수 (.env)
```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/queens_henna"

# 세션
SESSION_SECRET="최소 32자 이상의 랜덤 문자열"

# 서버
NODE_ENV="development"  # development | production
PORT=3000

# 파일 업로드
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880  # 5MB (bytes)

# 백업
BACKUP_DIR="./backups"
AUTO_BACKUP_CRON="0 3 * * *"  # 매일 03시

# SMS (2차 개발 시 설정)
# SMS_PROVIDER="coolsms"
# SMS_API_KEY=""
# SMS_API_SECRET=""
# SMS_SENDER_NUMBER=""
```

### 인증 및 세션 관리
| 항목 | 설정 |
|------|------|
| 비밀번호 해싱 | bcrypt (salt rounds: 12) |
| 세션 저장소 | 서버 메모리 또는 DB 기반 (iron-session 사용) |
| 세션 만료 | 8시간 (영업 시간 기준) |
| 쿠키 설정 | `httpOnly: true`, `secure: true` (production), `sameSite: lax` |
| 로그인 실패 | 5회 연속 실패 시 5분 잠금 |

### 보안 정책
- 모든 API 요청에 세션 검증 미들웨어 적용
- Role 기반 접근 제어 미들웨어 (`requireRole('admin')`)
- 파일 업로드 시 MIME 타입 검증 + 확장자 화이트리스트
- SQL Injection 방지: Prisma ORM 파라미터 바인딩 사용
- XSS 방지: React 기본 이스케이프 + 사용자 입력 sanitize
- CSRF: SameSite 쿠키 + Origin 헤더 검증
- 환경 변수 파일(.env)은 .gitignore에 포함

---

## 15. 문자 발송 서비스

### SMS API 후보

| 서비스 | 특징 | 건당 비용 (SMS) |
|--------|------|----------------|
| CoolSMS | Node.js SDK 제공, 간편 연동, 소량 발송에 적합 | ~20원 |
| NHN Cloud (구 Toast) | 대규모 서비스 검증됨, 알림톡 지원 | ~9.9원 |
| Aligo | 저렴한 단가, REST API 제공 | ~8.4원 |
| Solapi | CoolSMS 후속, 카카오 알림톡 통합 | ~20원 |

### 추상화 인터페이스
서비스 변경에 유연하게 대응하기 위해 SMS 전송 로직을 추상화한다.

```typescript
// types/sms.ts
interface SmsProvider {
  sendSms(params: SendSmsParams): Promise<SmsResult>;
}

interface SendSmsParams {
  to: string;        // 수신번호
  content: string;   // 메시지 내용
  from?: string;     // 발신번호 (기본값: 환경변수)
}

interface SmsResult {
  success: boolean;
  messageId?: string;
  errorMessage?: string;
}
```

### 발송 정책
- 자동 발송: SystemSetting 테이블의 `auto_sms_enabled` 키로 ON/OFF 관리
- 발송 시간 제한: 08:00 ~ 21:00 (야간 발송 금지)
- 발송 로그: SystemLog 테이블에 발송 결과 기록
- 템플릿 변수: `{{고객명}}`, `{{예약일시}}`, `{{염색약명}}` 등 치환 지원

---

## 16. 개발 순서
1. DB 설계 (Prisma 스키마 작성 및 마이그레이션)
2. 인증 시스템
3. 고객관리
4. 시술/레시피/잔량
5. 예약
6. 매출
7. 대시보드
8. 업로드
9. 백업
10. 문자 API
