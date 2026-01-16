#!/bin/bash
#
# commit.sh
# 린트/타입 검사 후 git commit 수행
#
# 사용법:
#   ./scripts/commit.sh "커밋 메시지"           # staged 파일만 커밋
#   ./scripts/commit.sh -a "커밋 메시지"        # 모든 변경사항 커밋 (git add .)
#   ./scripts/commit.sh                         # 메시지 프롬프트
#

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Git Commit (with lint check)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 옵션 처리
ADD_ALL=false
COMMIT_MSG=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--all)
            ADD_ALL=true
            shift
            ;;
        -m)
            COMMIT_MSG="$2"
            shift 2
            ;;
        *)
            if [ -z "$COMMIT_MSG" ]; then
                COMMIT_MSG="$1"
            fi
            shift
            ;;
    esac
done

# 변경사항 확인
HAS_STAGED=$(git diff --cached --quiet; echo $?)
HAS_UNSTAGED=$(git diff --quiet; echo $?)
HAS_UNTRACKED=$(git ls-files --others --exclude-standard | head -1)

# staged 파일이 없고 -a 옵션도 없으면 안내
if [ "$HAS_STAGED" -eq 0 ] && [ "$ADD_ALL" = false ]; then
    if [ "$HAS_UNSTAGED" -ne 0 ] || [ -n "$HAS_UNTRACKED" ]; then
        echo -e "${YELLOW}staged된 파일이 없습니다.${NC}"
        echo -e "${YELLOW}먼저 git add <파일>로 커밋할 파일을 선택하거나,${NC}"
        echo -e "${YELLOW}-a 옵션으로 모든 파일을 커밋하세요.${NC}"
        echo ""
        echo -e "${BLUE}변경된 파일:${NC}"
        git status --short
        exit 1
    else
        echo -e "${YELLOW}커밋할 변경사항이 없습니다.${NC}"
        exit 0
    fi
fi

# 변경사항 표시
echo -e "\n${BLUE}[1/4] 커밋 대상 확인${NC}"
if [ "$ADD_ALL" = true ]; then
    echo -e "${YELLOW}모든 변경사항을 커밋합니다 (-a 옵션)${NC}"
    git status --short
else
    echo -e "${YELLOW}staged된 파일만 커밋합니다${NC}"
    git diff --cached --name-status
fi

# 린트 검사
echo -e "\n${BLUE}[2/4] 린트 검사 중...${NC}"
if npm run lint 2>&1; then
    echo -e "${GREEN}✓ 린트 검사 통과${NC}"
else
    echo -e "${RED}✗ 린트 에러 발견!${NC}"
    echo -e "${YELLOW}린트 에러를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi

# 타입 검사
echo -e "\n${BLUE}[3/4] 타입 검사 중...${NC}"
if npx tsc --noEmit 2>&1; then
    echo -e "${GREEN}✓ 타입 검사 통과${NC}"
else
    echo -e "${RED}✗ 타입 에러 발견!${NC}"
    echo -e "${YELLOW}타입 에러를 수정한 후 다시 시도하세요.${NC}"
    exit 1
fi

# 커밋 메시지 입력
if [ -z "$COMMIT_MSG" ]; then
    echo -e "\n${YELLOW}커밋 메시지를 입력하세요:${NC}"
    read -r COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        echo -e "${RED}커밋 메시지가 필요합니다.${NC}"
        exit 1
    fi
fi

# 커밋 수행
echo -e "\n${BLUE}[4/4] 커밋 중...${NC}"
if [ "$ADD_ALL" = true ]; then
    git add .
fi
git commit -m "$COMMIT_MSG"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ 커밋 완료!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
