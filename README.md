# Antigravity - 차은우 팬사이트

Next.js와 NextAuth.js를 사용한 차은우 팬사이트입니다.

## 기능

- 구글 소셜 로그인
- 카카오 소셜 로그인
- 포트원(Portone) 결제 시스템
- 차은우 영상 보기
- 차은우 음원 듣기
- 응원 메시지 작성
- 관리자 페이지

## 설치 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example` 파일을 `.env.local`로 복사하고 필요한 값들을 입력하세요:

```bash
cp .env.local.example .env.local
```

### 3. NextAuth Secret 생성

터미널에서 다음 명령어를 실행하여 시크릿 키를 생성하세요:

```bash
openssl rand -base64 32
```

생성된 키를 `.env.local` 파일의 `NEXTAUTH_SECRET`에 입력하세요.

### 4. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션"
6. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/api/auth/callback/google` (개발)
   - `https://yourdomain.com/api/auth/callback/google` (프로덕션)
7. 생성된 Client ID와 Client Secret을 `.env.local`에 입력

### 5. Kakao OAuth 설정

1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 내 애플리케이션 만들기
3. 앱 설정 > 플랫폼 설정
   - Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000` (개발)
4. 제품 설정 > 카카오 로그인 활성화
5. Redirect URI 등록:
   - `http://localhost:3000/api/auth/callback/kakao` (개발)
   - `https://yourdomain.com/api/auth/callback/kakao` (프로덕션)
6. 동의항목 설정:
   - 필수: 닉네임, 프로필 사진
   - 선택: 이메일 (필요시)
7. REST API 키와 Client Secret을 `.env.local`에 입력

### 6. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
.
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth 설정
│   │   └── payment/
│   │       ├── verify/
│   │       │   └── route.ts      # 결제 검증 API
│   │       └── info/
│   │           └── route.ts      # 결제 정보 조회 API
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx          # 로그인 페이지
│   │   └── error/
│   │       └── page.tsx          # 에러 페이지
│   ├── payment/
│   │   ├── page.tsx              # 결제 페이지
│   │   └── success/
│   │       └── page.tsx          # 결제 성공 페이지
│   ├── components/
│   │   └── PaymentButton.tsx     # 결제 버튼 컴포넌트
│   └── page.tsx                  # 메인 페이지
├── types/
│   └── next-auth.d.ts            # NextAuth 타입 정의
├── .env.local.example            # 환경 변수 예시
├── next.config.js               # Next.js 설정
├── package.json                 # 의존성
└── tsconfig.json               # TypeScript 설정
```

## 주요 기술 스택

- **Next.js 14**: React 프레임워크
- **NextAuth.js**: 인증 라이브러리
- **포트원(Portone)**: 결제 시스템
- **TypeScript**: 타입 안정성
- **React**: UI 라이브러리

## 결제 기능 사용법

### 결제 버튼 컴포넌트 사용

```tsx
import PaymentButton from '@/app/components/PaymentButton'

<PaymentButton
  amount={10000}
  productName="상품명"
  customerName="구매자 이름"
  customerEmail="구매자 이메일"
  customerTel="구매자 전화번호"
  onSuccess={(response) => {
    console.log('결제 성공:', response)
  }}
  onError={(error) => {
    console.error('결제 실패:', error)
  }}
/>
```

### 결제 검증 API

결제 성공 후 자동으로 `/api/payment/verify`로 검증 요청이 전송됩니다.
서버에서 포트원 API를 통해 실제 결제 정보를 확인하고 검증합니다.

### 결제 정보 조회

```typescript
// GET /api/payment/info?imp_uid={imp_uid}&merchant_uid={merchant_uid}
const response = await fetch('/api/payment/info?imp_uid=imp_123&merchant_uid=merchant_456')
const data = await response.json()
```

## 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 프로젝트 연결
2. 환경 변수 설정:
   - Vercel 대시보드 > 프로젝트 설정 > Environment Variables
   - `.env.local`의 모든 변수 추가
3. 자동 배포 완료

### 다른 플랫폼

```bash
npm run build
npm start
```

## 문제 해결

### 로그인 오류

- OAuth 리디렉션 URI가 정확히 일치하는지 확인
- 환경 변수가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 빌드 오류

- TypeScript 타입 오류 확인
- 의존성 버전 확인
- `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`

## 라이선스

MIT

