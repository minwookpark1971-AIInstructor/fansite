# 데이터베이스 설정 가이드

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정 생성
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. 리전 선택 (가장 가까운 리전 권장)
5. 프로젝트 생성 완료 대기 (약 2분)

### 2. 데이터베이스 연결 정보 확인

1. Supabase 대시보드 > Settings > Database
2. "Connection string" 섹션에서 "URI" 선택
3. 연결 문자열 복사 (예: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

### 3. 환경 변수 설정

`.env.local` 파일에 다음 추가:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

비밀번호를 실제 비밀번호로 교체하세요.

### 4. Prisma 설정

```bash
# Prisma Client 생성
npm run db:generate

# 데이터베이스에 스키마 적용
npm run db:push

# 또는 마이그레이션 사용 (프로덕션 권장)
npm run db:migrate
```

### 5. 시드 데이터 생성 (선택사항)

```bash
npm run db:seed
```

## Prisma Studio (데이터베이스 GUI)

데이터베이스를 시각적으로 관리할 수 있습니다:

```bash
npm run db:studio
```

브라우저에서 `http://localhost:5555`가 열립니다.

## 테이블 구조

### User (사용자)
- `id`: 고유 ID
- `email`: 이메일 (고유)
- `name`: 이름
- `image`: 프로필 이미지
- `orders`: 주문 목록 (관계)
- `cartItems`: 장바구니 아이템 (관계)

### Product (상품)
- `id`: 고유 ID
- `name`: 상품명 (고유)
- `description`: 설명
- `price`: 가격 (원 단위, 정수)
- `image`: 대표 이미지
- `images`: 이미지 배열
- `category`: 카테고리
- `stock`: 재고
- `rating`: 평점
- `reviews`: 리뷰 수
- `orderItems`: 주문 아이템 (관계)
- `cartItems`: 장바구니 아이템 (관계)

### Order (주문)
- `id`: 고유 ID
- `userId`: 사용자 ID (외래키)
- `impUid`: 포트원 결제 고유번호
- `merchantUid`: 주문번호 (고유)
- `status`: 주문 상태 (PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED)
- `totalAmount`: 총 결제 금액
- `shippingFee`: 배송비
- `shippingName`: 배송지 이름
- `shippingPhone`: 배송지 전화번호
- `shippingAddr`: 배송지 주소
- `shippingPostcode`: 배송지 우편번호
- `paymentMethod`: 결제 수단
- `paidAt`: 결제 완료 시간
- `shippedAt`: 배송 시작 시간
- `deliveredAt`: 배송 완료 시간
- `user`: 사용자 (관계)
- `orderItems`: 주문 상품 목록 (관계)

### OrderItem (주문 상품)
- `id`: 고유 ID
- `orderId`: 주문 ID (외래키)
- `productId`: 상품 ID (외래키)
- `quantity`: 수량
- `price`: 주문 당시 가격
- `order`: 주문 (관계)
- `product`: 상품 (관계)

### CartItem (장바구니 아이템)
- `id`: 고유 ID
- `userId`: 사용자 ID (외래키)
- `productId`: 상품 ID (외래키)
- `quantity`: 수량
- `user`: 사용자 (관계)
- `product`: 상품 (관계)
- `@@unique([userId, productId])`: 사용자별 상품 중복 방지

## 관계도

```
User
  ├── orders (1:N)
  │     └── Order
  │           └── orderItems (1:N)
  │                 └── OrderItem
  │                       └── product (N:1)
  │                             └── Product
  └── cartItems (1:N)
        └── CartItem
              └── product (N:1)
                    └── Product
```

## API 엔드포인트

### 주문 관리
- `GET /api/orders` - 주문 목록 조회
- `POST /api/orders` - 주문 생성
- `GET /api/orders/[id]` - 주문 상세 조회
- `PATCH /api/orders/[id]` - 주문 상태 업데이트

### 상품 관리
- `GET /api/products` - 상품 목록 조회
- `POST /api/products` - 상품 생성 (관리자)
- `GET /api/products/[id]` - 상품 상세 조회

## 주문 생성 플로우

1. 클라이언트: 장바구니에서 주문하기 클릭
2. 클라이언트: 결제 정보 입력 및 결제 진행
3. 클라이언트: 결제 완료 후 `/api/payment/verify` 호출
4. 서버: 결제 검증 및 `/api/orders` POST 요청
5. 서버: 주문 생성, 재고 차감, 장바구니 비우기
6. 서버: 주문 정보 반환

## 주문 상태 관리

- `PENDING`: 결제 대기
- `PAID`: 결제 완료
- `PROCESSING`: 주문 처리 중
- `SHIPPED`: 배송 중
- `DELIVERED`: 배송 완료
- `CANCELLED`: 취소됨 (재고 복구)
- `REFUNDED`: 환불됨

