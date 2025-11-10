/**
 * Cloudflare Pages Functions - 암호 보호 미들웨어
 *
 * 이 함수는 모든 HTML 페이지 요청에 대해 암호 인증을 요구합니다.
 * 정적 파일(CSS, JS, 이미지 등)은 인증 없이 통과합니다.
 *
 * 환경 변수 설정 필요:
 * - PASSWORD: 사이트 접근 암호
 */

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 정적 파일(확장자가 있고 .html이 아닌 경우) 바로 통과
  const hasExtension = pathname.includes('.');
  const isHtml = pathname.endsWith('.html') || pathname === '/' || !hasExtension;

  if (hasExtension && !isHtml) {
    return next();
  }

  // 쿠키 확인 - 이미 인증된 사용자
  const cookies = request.headers.get('Cookie') || '';
  if (cookies.includes('siteauth=ok')) {
    return next();
  }

  // POST 요청 처리 - 암호 확인
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const password = formData.get('password');

      // 환경 변수가 설정되어 있는지 확인
      if (!env.PASSWORD) {
        return new Response('Server configuration error', { status: 500 });
      }

      // 암호 확인
      if (password === env.PASSWORD) {
        // 인증 성공 - 쿠키 설정 후 리다이렉트
        const response = Response.redirect(url.toString(), 303);
        response.headers.set(
          'Set-Cookie',
          'siteauth=ok; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800'
        ); // 7일간 유효
        return response;
      } else {
        // 암호 오류
        return new Response(
          generateLoginPage(url.pathname, true),
          {
            status: 401,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          }
        );
      }
    } catch (error) {
      return new Response('Invalid request', { status: 400 });
    }
  }

  // GET 요청 - 로그인 페이지 표시
  return new Response(
    generateLoginPage(url.pathname, false),
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }
  );
}

/**
 * 로그인 페이지 HTML 생성
 */
function generateLoginPage(path, hasError) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔒 보안 인증 - AI로 개발을 가속하기</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans KR', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .password-container {
            background: white;
            padding: 50px 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 450px;
            width: 100%;
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .lock-icon {
            font-size: 60px;
            margin-bottom: 20px;
            display: inline-block;
            animation: bounce 1s ease infinite;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        h2 {
            font-family: 'Noto Serif KR', serif;
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 28px;
            font-weight: 700;
        }

        .subtitle {
            color: #7f8c8d;
            margin-bottom: 35px;
            font-size: 15px;
            line-height: 1.6;
        }

        form {
            margin-top: 30px;
        }

        .input-group {
            position: relative;
            margin-bottom: 25px;
        }

        input[type="password"] {
            width: 100%;
            padding: 18px 20px;
            font-size: 16px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            font-family: 'Noto Sans KR', sans-serif;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }

        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        button {
            width: 100%;
            padding: 18px;
            font-size: 17px;
            font-weight: 600;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-family: 'Noto Sans KR', sans-serif;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
        }

        button:active {
            transform: translateY(0);
        }

        .error-message {
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            border: 1px solid #fcc;
            animation: shake 0.5s;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }

        .info-box {
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            padding: 20px;
            border-radius: 12px;
            margin-top: 30px;
            font-size: 13px;
            color: #555;
            line-height: 1.8;
            border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .info-box strong {
            color: #667eea;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
        }

        @media (max-width: 480px) {
            .password-container {
                padding: 35px 25px;
            }

            h2 {
                font-size: 24px;
            }

            .lock-icon {
                font-size: 50px;
            }
        }
    </style>
</head>
<body>
    <div class="password-container">
        <div class="lock-icon">🔒</div>
        <h2>보안 인증</h2>
        <p class="subtitle">
            문서를 열람하려면 암호를 입력해주세요<br>
            인증 후 7일간 유효합니다
        </p>

        ${hasError ? '<div class="error-message">❌ 암호가 올바르지 않습니다. 다시 시도해주세요.</div>' : ''}

        <form method="POST" action="${path}">
            <div class="input-group">
                <input
                    type="password"
                    name="password"
                    placeholder="암호를 입력하세요"
                    required
                    autofocus
                    autocomplete="off"
                >
            </div>
            <button type="submit">🔓 확인</button>
        </form>

        <div class="info-box">
            <strong>📚 AI로 개발을 가속하기</strong>
            룰과 구조로 배우는 협업의 기술<br>
            학습용 요약 자료
        </div>
    </div>
</body>
</html>`;
}
