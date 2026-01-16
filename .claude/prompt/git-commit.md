# Git Commit (린트 검사 후 커밋)

변경사항을 커밋해라. 커밋 전 반드시 린트 에러를 확인하고, 에러가 있으면 수정해라.

## 실행

```bash
# staged 파일만 커밋 (기본)
git add <파일들>
./scripts/commit.sh "커밋 메시지"

# 모든 변경사항 커밋 (-a 옵션)
./scripts/commit.sh -a "커밋 메시지"
```

또는 수동으로:

```bash
# 1. 린트 검사
npm run lint

# 2. 타입 검사
npx tsc --noEmit

# 3. 에러 없으면 커밋
git add <파일들>
git commit -m "커밋 메시지"
```

## 예상 결과

- 린트 에러 검사 (에러 시 중단)
- 타입 에러 검사 (에러 시 중단)
- staged된 파일만 commit (또는 -a 옵션 시 모든 파일)
- 커밋 메시지는 한글 또는 영어로 작성 (변경 내용 요약)
