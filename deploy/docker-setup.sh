#!/bin/bash
# 서버 초기 설정 스크립트 (Docker 환경)
# 사용법: ./deploy/docker-setup.sh

set -e

echo "=== Calendar Docker 환경 설정 ==="

# 1. Docker 네트워크 생성
if ! docker network ls | grep -q "funq-network"; then
    echo "Creating funq-network..."
    docker network create funq-network
else
    echo "funq-network already exists"
fi

# 2. GitHub Container Registry 로그인 안내
echo ""
echo "=== GHCR 로그인 필요 시 ==="
echo "echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin"

# 3. pm2 프로세스 정리 안내
echo ""
echo "=== pm2 프로세스 정리 (필요 시) ==="
echo "pm2 stop calendar && pm2 delete calendar && pm2 save"

# 4. Docker 실행
echo ""
echo "=== Docker 실행 ==="
echo "docker compose -f docker-compose.prod.yml pull"
echo "docker compose -f docker-compose.prod.yml up -d"
