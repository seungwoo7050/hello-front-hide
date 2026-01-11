#!/bin/bash
# 스테이지 실행 및 로깅 스크립트
# 사용법: ./scripts/run_stage.sh <stage-number>

STAGE_NUM=$1

if [ -z "$STAGE_NUM" ]; then
    echo "❌ 스테이지 번호를 지정해주세요"
    echo "사용법: ./scripts/run_stage.sh <stage-number>"
    exit 1
fi

LOG_DIR="logs"
STATE_DIR="state"
LOG_FILE="$LOG_DIR/stage-$STAGE_NUM.log"

# 디렉토리 생성
mkdir -p "$LOG_DIR"
mkdir -p "$STATE_DIR"

echo "🚀 Stage $STAGE_NUM 실행 시작: $(date)" | tee "$LOG_FILE"
echo "" >> "$LOG_FILE"

# 품질 게이트 검증
echo "📋 품질 게이트 검증 중..." | tee -a "$LOG_FILE"
if ./scripts/verify.sh >> "$LOG_FILE" 2>&1; then
    echo "✅ 품질 게이트 통과" | tee -a "$LOG_FILE"
else
    echo "❌ 품질 게이트 실패" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" >> "$LOG_FILE"
echo "🏁 Stage $STAGE_NUM 완료: $(date)" | tee -a "$LOG_FILE"
