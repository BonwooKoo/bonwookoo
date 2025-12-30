# 🔒 안전한 Mapbox Token 설정 가이드

## ⚠️ 중요: Token을 GitHub에 올리면 안 됩니다!

Mapbox token을 공개 저장소에 올리면:
- ❌ 누구나 당신의 token을 사용할 수 있음
- ❌ 타인이 무분별하게 사용 → 요금 폭탄
- ❌ Token 무효화 후 재발급 필요

**해결책:** `.gitignore`를 사용한 안전한 설정

---

## ✅ 안전한 설정 방법

### 1단계: config.js 파일 생성

```bash
cd /Users/haeseungsung/Desktop/vibe/bonwoo/bonwookoo/assets/js/dashboard
cp config.example.js config.js
```

### 2단계: config.js에 실제 토큰 입력

`config.js` 파일을 열고:

```javascript
const MAPBOX_CONFIG = {
  // 여기에 실제 토큰 입력
  accessToken: 'pk.eyJ1Ijo...실제토큰...',

  // GPKG 업로드 후 tileset ID 입력
  tilesetId: 'username.seoul-streets-abc123'
};
```

### 3단계: 확인 - config.js가 .gitignore에 있는지 체크

`.gitignore` 파일에 다음이 포함되어 있어야 합니다:

```
# Mapbox Token Configuration
config.js
mapbox-config.js
```

✅ 이미 추가되어 있습니다!

---

## 📂 파일 구조 설명

```
assets/js/dashboard/
  ├── config.example.js    ← GitHub에 올라감 (템플릿, 실제 토큰 없음)
  ├── config.js            ← GitHub에 올라가지 않음! (실제 토큰 포함)
  └── map.js               ← config.js를 불러와서 사용
```

---

## 🔍 동작 원리

### 1. config.js를 먼저 로드
```html
<!-- cluster-dashboard.html -->
<script src="assets/js/dashboard/config.js"></script>  ← 먼저!
<script src="assets/js/dashboard/map.js"></script>     ← 그 다음
```

### 2. map.js에서 MAPBOX_CONFIG 사용
```javascript
// map.js
mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;
const TILESET_ID = MAPBOX_CONFIG.tilesetId;
```

### 3. config.js가 없으면 친절한 에러 메시지 표시
```
⚠️ Configuration Missing

Please set up your Mapbox token:
1. Copy config.example.js to config.js
2. Add your Mapbox token to config.js
3. Refresh the page
```

---

## ✅ 설정 체크리스트

### 로컬 개발 (당신 컴퓨터):
- [ ] `config.js` 파일이 있음
- [ ] `config.js`에 실제 토큰 입력됨
- [ ] 대시보드가 정상 작동함

### GitHub에 Push 전:
- [ ] `.gitignore`에 `config.js` 포함됨
- [ ] `git status`로 확인 → `config.js`가 목록에 없어야 함
- [ ] `config.example.js`만 추가됨

---

## 🚀 GitHub에 안전하게 올리기

### 1. Git status 확인
```bash
git status
```

**올라가는 파일 확인:**
```
✅ config.example.js         (템플릿만, 토큰 없음)
✅ .gitignore                (config.js 무시 설정)
✅ cluster-dashboard.html
✅ map.js
❌ config.js                 (무시됨 - 안 올라감!)
```

### 2. Push
```bash
git add .
git commit -m "Add secure dashboard configuration"
git push origin main
```

---

## 🌐 GitHub Pages에서 동작시키기

**문제:** GitHub Pages는 서버가 없어서 환경 변수를 사용할 수 없습니다.

**해결책 2가지:**

### 방법 A: URL 제한 토큰 사용 (권장)

1. **Mapbox에서 새 토큰 생성**
   - https://account.mapbox.com/ 접속
   - "Create a token" 클릭

2. **URL Restrictions 설정**
   ```
   https://[your-username].github.io/*
   ```
   또는
   ```
   https://your-custom-domain.com/*
   ```

3. **이 토큰은 GitHub에 올려도 안전함**
   - 해당 URL에서만 작동
   - 다른 곳에서 사용 시 거부됨

4. **config.js를 GitHub에 포함**
   - `.gitignore`에서 `config.js` 제거
   - URL 제한 토큰 입력
   - Push!

### 방법 B: 프라이빗 저장소 사용

- GitHub Pro 계정으로 저장소를 Private으로 설정
- config.js 포함해서 push
- GitHub Pages는 여전히 작동

---

## 📋 빠른 설정 (3분)

### 로컬 개발용:
```bash
# 1. config 파일 생성
cd assets/js/dashboard
cp config.example.js config.js

# 2. config.js 열어서 토큰 입력 (에디터 사용)
# accessToken: 'pk.eyJ...'
# tilesetId: 'username.abc123'

# 3. 테스트
python3 -m http.server 8000
# http://localhost:8000/cluster-dashboard.html
```

### GitHub Pages 배포용:
```bash
# 방법 A: URL 제한 토큰 사용
# 1. Mapbox에서 URL 제한 토큰 생성
# 2. .gitignore에서 config.js 제거
# 3. config.js에 URL 제한 토큰 입력
# 4. Push

# 또는

# 방법 B: 프라이빗 저장소
# 1. GitHub 저장소를 Private으로 설정
# 2. config.js는 .gitignore에 유지
# 3. Push
```

---

## 🔧 트러블슈팅

### Q: config.js를 실수로 commit 했어요!
```bash
# 1. Commit 취소 (아직 push 안 했다면)
git reset HEAD~1

# 2. 이미 push 했다면
git rm --cached assets/js/dashboard/config.js
git commit -m "Remove config.js from repository"
git push

# 3. Mapbox에서 토큰 무효화 후 재발급
```

### Q: 대시보드에 에러 메시지가 떠요
→ `config.js` 파일이 있는지 확인
→ 파일 경로가 맞는지 확인: `assets/js/dashboard/config.js`

### Q: GitHub Pages에서 작동 안 해요
→ URL 제한 토큰을 사용했는지 확인
→ URL이 정확히 일치하는지 확인

---

## 📚 참고 자료

**Mapbox Token 보안:**
- https://docs.mapbox.com/help/troubleshooting/how-to-use-mapbox-securely/

**URL Restrictions 설정:**
- https://docs.mapbox.com/accounts/guides/tokens/

**GitHub 보안 Best Practices:**
- https://docs.github.com/en/code-security/getting-started/securing-your-repository

---

## ✨ 요약

### 로컬 개발:
1. ✅ `config.js` 생성 (`.gitignore`에 포함)
2. ✅ 실제 토큰 입력
3. ✅ GitHub에 push하지 않음

### GitHub Pages 배포:
1. ✅ URL 제한 토큰 생성
2. ✅ `config.js`를 commit에 포함
3. ✅ 해당 URL에서만 작동

**절대 하지 말 것:**
❌ 무제한 토큰을 공개 저장소에 올리기
❌ `.gitignore` 없이 config.js push
❌ Personal access token을 코드에 하드코딩

---

## 🎉 완료!

이제 안전하게 Mapbox를 사용할 수 있습니다! 🔒
