export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // 정적 파일은 그냥 통과
  if (url.pathname.includes('.') && !url.pathname.endsWith('.html')) {
    return next();
  }

  // 쿠키 확인
  const cookies = request.headers.get('Cookie') || '';
  const hasAuth = cookies.includes('siteauth=ok');

  // POST 요청 - 암호 확인
  let errorMessage = '';
  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const password = formData.get('password');

      // 환경변수 확인
      if (!env || !env.PASSWORD) {
        errorMessage = '서버 설정 오류: 환경변수가 설정되지 않았습니다.';
      } else if (password === env.PASSWORD) {
        // 원래 요청한 페이지로 리다이렉트 - 쿠키 포함
        return new Response(null, {
          status: 302,
          headers: {
            'Location': url.origin + '/',
            'Set-Cookie': 'siteauth=ok; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800'
          }
        });
      } else {
        errorMessage = '비밀번호가 올바르지 않습니다.';
      }
    } catch (e) {
      errorMessage = '오류가 발생했습니다: ' + e.message;
    }
  }

  // 인증된 경우 원래 페이지 보여주기
  if (hasAuth) {
    return next();
  }

  // 인증 안된 경우 로그인 폼 표시
  return new Response(`
<!DOCTYPE html>
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
            text-align: left;
        }

        label {
            display: block;
            margin-bottom: 10px;
            color: #555;
            font-weight: 600;
            font-size: 14px;
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
            margin-top: 20px;
            font-size: 14px;
            border: 1px solid #fcc;
            animation: shake 0.5s;
            display: ${errorMessage ? 'block' : 'none'};
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

        <form method="POST">
            <div class="input-group">
                <label for="password">암호</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="암호를 입력하세요"
                    required
                    autofocus
                    autocomplete="off"
                >
            </div>
            <button type="submit">🔓 확인</button>
            ${errorMessage ? `<div class="error-message">❌ ${errorMessage}</div>` : ''}
        </form>

        <div class="info-box">
            <strong>📚 AI로 개발을 가속하기</strong>
            룰과 구조로 배우는 협업의 기술<br>
            학습용 요약 자료
        </div>
    </div>
</body>
</html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
