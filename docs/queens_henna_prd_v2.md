# 퀸즈헤나 고객관리 웹앱 PRD v2

## 1. 프로젝트 개요
퀸즈헤나 염색 전문점의 원장님이 고객, 예약, 시술, 염색약 잔량, 매출을 통합 관리할 수 있는 내부용 웹앱을 만든다.

핵심 차별점은 고객별 기본 레시피 관리와 고객별 염색약 구매/잔량 관리이다.

---

## 2. 사용자
- 원장님
- 앱관리자

### 권한 구분
#### 원장님
- 고객 관리
- 예약 관리
- 시술 기록
- 고객별 기본 레시피 관리
- 고객별 염색약 구매/잔량 관리
- 매출 조회
- 문자 발송
- 프로필 사진 등록/조회

#### 앱관리자
- 전체 설정 관리
- 사용자 계정 관리
- 백업/복원 관리
- 시스템 점검
- 마스터 데이터 관리

---

## 3. 플랫폼
- 웹앱
- PC 우선 설계
- 반응형으로 모바일 조회 가능

---

## 4. 핵심 기능
1. 로그인
2. 고객관리
3. 예약관리
4. 시술기록 관리
5. 고객별 기본 레시피 관리
6. 고객별 염색약 구매/잔량 관리
7. 매출통계
8. 문자발송
9. 백업/복원
10. 설정

---

## 5. 메뉴 구조
1. 대시보드
2. 고객관리
3. 예약관리
4. 시술기록
5. 염색약관리
6. 문자발송
7. 매출통계
8. 설정
9. 백업관리

---

## 6. 기능 상세

### 6.1 로그인
- 사용자 ID/비밀번호 로그인
- 역할 기반 접근 제어 (Supabase Auth + RLS)
- 사용자 2명 계정 운영
  - 원장님
  - 앱관리자

### 6.2 대시보드
- 오늘 예약 목록
- 최근 시술 기록
- 오늘 매출
- 이번 달 매출
- 재방문 필요 고객
- 염색약 부족 고객
- 문자/전화 바로가기

### 6.3 고객관리
#### 기본 정보
- 이름
- 전화번호
- 생년월일
- 최근 방문일 (시술기록 기반 자동 반영)
- 메모
- 프로필 사진 (Supabase Storage 저장)

#### 고객 상세
- 기본 레시피
- 현재 보유 염색약 잔량
- 예상 남은 횟수
- 누적 방문 횟수
- 누적 매출
- 최근 시술 내역
- 최근 예약 내역
- 문자 보내기
- 전화하기

### 6.4 예약관리
#### 입력 항목
- 예약일
- 예약시간
- 고객명
- 상태
- 메모

#### 예약 정책
- 시작 시간 10분 단위
- 시간 겹침 허용
- 겹치는 예약은 경고 표시만 제공
- 실제 일정 조정은 원장님 판단

#### 예약 상태
- 예약완료
- 방문완료
- 취소
- 노쇼
- 대기

### 6.5 시술기록
#### 입력 항목
- 시술일시
- 고객명
- 시술 종류
- 기본 금액
- 추가 금액
- 총 금액 자동 계산
- 결제수단 (계좌이체 / 현금 / 카드)
- 메모

#### 사용 염색약 입력
- 염색약 종류
- 사용량
- 단위

#### 저장 시 자동 처리
- 고객 최근 방문일 업데이트
- 누적 방문 횟수 반영
- 누적 매출 반영
- 고객 보유 염색약 잔량 차감
- 남은 횟수 재계산
- 부족 시 경고 생성

### 6.6 고객별 기본 레시피
- 고객별 기본 염색약 조합 저장
- 시술 등록 시 기본 레시피 불러오기 가능
- 이번 시술에만 수정 가능

#### 저장 항목
- 염색약 종류
- 1회 기본 사용량
- 단위
- 메모

### 6.7 염색약관리
#### 염색약 종류 마스터
- 염색약명
- 전체 용량
- 기본 단위
- 메모

#### 고객별 보유 염색약
- 고객명
- 염색약명
- 구매 총량
- 현재 잔량
- 1회 사용량
- 예상 남은 횟수
- 상태

#### 상태 기준
- 정상: 남은횟수 > 2
- 주의: 남은횟수 <= 2
- 경고: 남은횟수 <= 1 (연락 필요)
- 소진: 남은횟수 <= 0

### 6.8 문자발송
- 예약 확인 문자
- 방문 전 안내 문자
- 염색약 부족 안내 문자
- 재방문 권장 문자
- 개별 문자

#### 발송 방식
- 자동 발송 설정 가능
- 수동 발송 가능
- 문자 서비스 업체는 추후 결정 (Supabase Edge Functions로 연동 예정)

### 6.9 매출통계
- 일 매출
- 월 매출
- 전체 매출
- 고객별 매출
- 시술 종류별 매출
- 결제수단별 매출

### 6.10 설정
- 시술 종류 관리
- 시술 기본 금액 관리
- 예약 시작 간격 설정
- 염색약 단위 관리
- 문자 템플릿 관리
- 자동 문자 ON/OFF

### 6.11 백업관리
- 수동 백업: 전체 데이터를 JSON 형식으로 내보내기
- 자동 백업: 주기적으로 JSON 파일 생성 및 Supabase Storage 저장
- 백업 파일 목록 조회
- 복원: 백업 JSON 파일을 업로드하여 데이터 복원
- 마지막 백업 시각 표시

> **구현 방식:** Supabase 플랫폼 백업 기능 대신, 앱 레벨에서 전체 데이터를 JSON으로 내보내고 가져오는 방식으로 구현한다. 별도 인프라 의존 없이 단순하게 유지한다.

---

## 7. 데이터 구조

### users (Supabase Auth 연동)
- id (uuid, Supabase Auth user id)
- name
- role (owner / admin)
- is_active
- created_at

### customers
- id (uuid)
- name
- phone
- birth_date
- memo
- profile_image_path (Supabase Storage 경로)
- created_at
- updated_at

### reservations
- id (uuid)
- customer_id (→ customers)
- reserved_at
- status (예약완료 / 방문완료 / 취소 / 노쇼 / 대기)
- memo
- created_at
- updated_at

### treatment_types
- id (uuid)
- name
- base_price
- is_active

### treatments
- id (uuid)
- customer_id (→ customers)
- treatment_type_id (→ treatment_types)
- treated_at
- base_price
- extra_price
- total_price
- payment_method (계좌이체 / 현금 / 카드)
- memo
- created_at

### dye_types
- id (uuid)
- name
- total_capacity
- default_unit_id (→ units)
- memo
- is_active

### units
- id (uuid)
- name
- is_active

### customer_recipes
- id (uuid)
- customer_id (→ customers)
- dye_id (→ dye_types)
- default_use_amount
- unit_id (→ units)
- memo

### customer_dye_stocks
- id (uuid)
- customer_id (→ customers)
- dye_id (→ dye_types)
- purchased_amount
- current_amount
- unit_id (→ units)
- purchased_at
- status (정상 / 주의 / 경고 / 소진)

### treatment_dye_usages
- id (uuid)
- treatment_id (→ treatments)
- customer_dye_stock_id (→ customer_dye_stocks)
- dye_id (→ dye_types)
- used_amount
- unit_id (→ units)

### backup_history
- id (uuid)
- backup_type (manual / auto)
- file_path (Supabase Storage 경로)
- created_at
- created_by (→ users)
- status

---

## 8. 핵심 계산 로직

### 총금액
```
총금액 = 기본 금액 + 추가 금액
```

### 남은 예상 횟수
```
남은횟수 = 현재잔량 / 고객 기본 1회 사용량
```

### 경고 기준
- 남은횟수 > 2: 정상
- 남은횟수 <= 2: 주의
- 남은횟수 <= 1: 경고 (연락 필요)
- 남은횟수 <= 0: 소진

---

## 9. 화면 구성

### 화면 1. 로그인
- 로그인ID / 비밀번호 / 로그인 버튼

### 화면 2. 대시보드
- 오늘 예약 / 오늘 매출 / 월 매출 / 부족 고객 / 최근 시술

### 화면 3. 고객 목록
- 검색 / 고객 리스트 / 최근 방문일 / 경고 배지

### 화면 4. 고객 상세
- 기본 정보 / 프로필 사진 / 기본 레시피 / 보유 염색약 / 시술 내역 / 예약 내역 / 매출

### 화면 5. 예약관리
- 날짜별 목록 / 시간별 목록 / 겹침 경고 표시 / 예약 등록·수정

### 화면 6. 시술 등록
- 고객 선택 / 시술 종류 / 금액 입력 / 사용 염색약 입력 / 저장

### 화면 7. 염색약관리
- 염색약 종류 관리 / 고객별 잔량 조회

### 화면 8. 매출통계
- 기간 필터 / 통계 카드 / 고객별 매출 목록

### 화면 9. 설정
- 시술 종류 / 단위 / 문자 템플릿 / 자동 발송 설정

### 화면 10. 백업관리
- 백업 실행 / 백업 목록 / 복원 실행

---

## 10. MVP 우선순위

### 1차 개발
- 로그인/권한
- 고객관리
- 예약관리
- 시술기록
- 기본 레시피
- 고객별 염색약 잔량 관리
- 시술 종류/금액 관리
- 결제수단 관리
- 프로필 사진 업로드
- 기본 백업 (JSON 내보내기)

### 2차 개발
- 문자 발송 연동
- 자동 문자 설정
- 대시보드 고도화
- 매출 통계 고도화
- 백업 복원 개선

### 3차 개발
- 재구매 추천 자동화
- 사용량 패턴 분석
- 고급 검색/필터

---

## 11. 기술 스택

| 레이어 | 기술 |
|---|---|
| 프론트엔드 | Next.js (React) |
| DB | Supabase (PostgreSQL) |
| DB 클라이언트 | supabase-js (Prisma 미사용) |
| 인증 | Supabase Auth |
| 권한 제어 | Supabase RLS (Row Level Security) |
| 파일 저장 | Supabase Storage |
| 서버 로직 | Supabase Edge Functions |
| SMS 연동 | Edge Functions → SMS API (추후 선정) |
| 타입 생성 | supabase gen types typescript |

### supabase-js 사용 원칙
- ORM(Prisma) 미사용
- 모든 DB 쿼리는 supabase-js 클라이언트로 직접 처리
- 타입은 Supabase CLI로 자동 생성하여 사용
- 복잡한 집계 쿼리는 Supabase에서 View 또는 RPC(함수)로 처리

---

## 12. 결정 완료 사항
- 웹앱으로 개발
- 사용자 2명 (원장님, 앱관리자)
- DB: Supabase (PostgreSQL)
- DB 클라이언트: supabase-js (Prisma 미사용)
- 인증: Supabase Auth
- 파일 저장: Supabase Storage
- 백업: 앱 레벨 JSON 내보내기/가져오기 방식
- 문자 서비스: 추후 결정 후 Edge Functions로 연동
- 예약 시간: 10분 단위
- 겹치는 예약 허용, 경고만 표시
- 고객별 기본 레시피 지원
- 염색약은 고객이 한 번 구매하고 여러 번 나눠 쓰는 구조
