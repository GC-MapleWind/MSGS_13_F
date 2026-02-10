# 프론트엔드 Dockerfile - Multi-stage build

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY app/package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY app/ ./
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Nginx 설정 복사
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/build /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
