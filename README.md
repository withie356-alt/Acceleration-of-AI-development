# 🔒 AI로 개발을 가속하기 - 보안 인증 버전

> 룰과 구조로 배우는 협업의 기술 - 학습용 요약 자료

Cloudflare Pages와 Functions를 활용한 **서버 사이드 암호 보호** 기능이 적용된 웹 문서입니다.

---

## ✨ 주요 특징

- 🔐 **서버 사이드 인증**: Cloudflare Functions를 통한 안전한 암호 보호
- 🍪 **쿠키 기반 세션**: 한 번 로그인하면 7일간 유효
- 🎨 **아름다운 UI**: 그라디언트 배경과 애니메이션 효과
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- 🖨️ **PDF 저장 기능**: 브라우저에서 바로 PDF로 저장 가능

---

## 🚀 Cloudflare Pages 배포 방법

### 1. GitHub 저장소 준비

이 저장소를 포크하거나 클론합니다.

```bash
git clone https://github.com/withie356-alt/Acceleration-of-AI-development.git
```

### 2. Cloudflare Pages 프로젝트 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. GitHub 저장소 선택: `Acceleration-of-AI-development`
4. 빌드 설정:
   - **Framework preset**: None
   - **Build command**: (비워둠)
   - **Build output directory**: `/`

### 3. 환경 변수 설정 (중요!)

프로젝트 생성 후 **Settings** → **Environment variables** 메뉴에서:

```
변수명: PASSWORD
값: 원하는_암호_입력 (예: mySecurePassword123)
환경: Production (및 Preview - 선택사항)
```

⚠️ **주의**: 이 암호가 실제 사이트 접근 암호가 됩니다!

### 4. 배포 완료!

- 자동으로 배포가 시작됩니다
- 배포 완료 후 제공된 URL로 접속
- 설정한 암호를 입력하면 문서 열람 가능

---

## 🔧 로컬 개발 환경

### Wrangler를 사용한 로컬 테스트

```bash
# Wrangler 설치
npm install -g wrangler

# 로컬 개발 서버 실행
wrangler pages dev .

# 환경 변수와 함께 실행
wrangler pages dev . --binding PASSWORD=test1234
```

로컬에서 `http://localhost:8788` 접속

---

## 📂 프로젝트 구조

```
Acceleration-of-AI-development/
├── functions/
│   └── [[path]].js          # Cloudflare Functions - 암호 보호 로직
├── index.html                # 메인 HTML 문서
└── README.md                 # 이 문서
```

### `functions/[[path]].js` 설명

- **동적 라우팅**: 모든 경로에 대해 실행
- **정적 파일 통과**: CSS, JS, 이미지는 인증 없이 로드
- **쿠키 검증**: `siteauth=ok` 쿠키가 있으면 자동 인증
- **POST 처리**: 암호 입력 시 환경 변수와 비교
- **보안 쿠키**: HttpOnly, Secure, SameSite 플래그 적용

---

## 🔒 보안 기능

### 1. 서버 사이드 검증
- 클라이언트에서 암호가 노출되지 않음
- 환경 변수로 안전하게 관리

### 2. 쿠키 보안
```javascript
Set-Cookie: siteauth=ok;
  Path=/;
  HttpOnly;      // JavaScript 접근 불가
  Secure;        // HTTPS만 전송
  SameSite=Lax;  // CSRF 방지
  Max-Age=604800 // 7일간 유효
```

### 3. 정적 파일 최적화
- HTML만 인증 필요
- CSS, JS, 이미지는 자동 통과

---

## 🎨 커스터마이징

### 암호 변경

Cloudflare Dashboard → **Settings** → **Environment variables** → `PASSWORD` 수정

### 쿠키 유효 기간 변경

`functions/[[path]].js` 파일에서:

```javascript
Max-Age=604800  // 604800초 = 7일
// 원하는 초 단위로 변경 (예: 86400 = 1일)
```

### 디자인 변경

`index.html` 파일의 `<style>` 태그 내 CSS 수정

---

## 📖 사용 방법

### 처음 방문 시
1. 사이트 접속
2. 암호 입력 화면 표시
3. 설정된 암호 입력
4. 인증 성공 → 문서 열람

### 재방문 시
- 쿠키가 유효하면 바로 문서 열람
- 7일 후 또는 쿠키 삭제 시 재인증 필요

---

## 🆚 기존 방식과의 비교

| 항목 | 클라이언트 방식 (기존) | 서버 방식 (업그레이드) |
|------|----------------------|----------------------|
| 보안성 | ⚠️ 낮음 (소스 코드 노출) | ✅ 높음 (서버에서 검증) |
| 세션 유지 | ⚠️ 탭 닫으면 초기화 | ✅ 7일간 유지 |
| 암호 변경 | ⚠️ HTML 수정 필요 | ✅ 환경 변수만 변경 |
| 배포 | ✅ 간단 (단일 파일) | ✅ Cloudflare Pages |

---

## 🛠️ 문제 해결

### 암호를 입력했는데 계속 로그인 화면이 나와요
- 환경 변수 `PASSWORD`가 올바르게 설정되었는지 확인
- Cloudflare Pages 재배포 (Settings → Deployments → Retry deployment)

### 쿠키가 작동하지 않아요
- HTTPS로 접속하고 있는지 확인
- 브라우저 쿠키 설정이 허용되어 있는지 확인

### 로컬에서 테스트할 때 암호가 작동하지 않아요
```bash
wrangler pages dev . --binding PASSWORD=your_password_here
```
환경 변수를 명시적으로 전달해야 합니다.

---

## 📝 라이선스

본 문서는 「하용호 님과 함께하는 AI로 개발을 가속하기」 관련 강의 내용을 바탕으로 재구성한 학습용 요약 자료입니다.

---

## 🤝 기여

이슈나 개선 사항이 있다면 GitHub Issues를 통해 알려주세요!

---

## 📧 문의

프로젝트 관련 문의사항은 GitHub Issues를 이용해주세요.

---

**Made with ❤️ for secure documentation sharing**
