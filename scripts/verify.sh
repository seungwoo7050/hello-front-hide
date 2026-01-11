#!/bin/bash
# 품질 게이트 검증 스크립트
# 순서대로 lint, test, build를 실행하고 하나라도 실패하면 비정상 종료

set -e

echo "🔍 품질 게이트 검증 시작..."
echo ""

echo "1️⃣ ESLint 검사 중..."
npm run lint
echo "✅ Lint PASS"
echo ""

echo "2️⃣ 테스트 실행 중..."
npm test -- --run
echo "✅ Test PASS"
echo ""

echo "3️⃣ 빌드 검증 중..."
npm run build
echo "✅ Build PASS"
echo ""

echo "🎉 모든 품질 게이트 통과!"
exit 0
