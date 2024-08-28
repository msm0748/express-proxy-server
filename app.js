const express = require('express');
const proxy = require('express-http-proxy');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 8000;
app.use(cors());

// SSL 인증서와 개인 키 파일 경로
const sslOptions = {
  key: fs.readFileSync('./private.pem'),
  cert: fs.readFileSync('./public.pem'),
};

// 프록시할 대상 서버의 URL
const targetUrl = 'http://localhost:8080';

// 모든 요청을 프록시할 라우트 설정
app.use(
  '/',
  proxy(targetUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // 예를 들어, 헤더 추가
      proxyReqOpts.headers['X-Special-Header'] = 'foobar';
      return proxyReqOpts;
    },
    proxyResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      // 응답 데이터 수정 가능
      return proxyResData.toString('utf8') + '\n<!-- Proxy Footer -->';
    },
  })
);

// HTTPS 서버 시작
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Proxy server listening on port ${PORT}`);
});
