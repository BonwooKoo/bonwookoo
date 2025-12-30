# 🔒 Mapbox Token 보안 - 핵심 요약

## ❌ 절대 하지 말 것

```javascript
// ❌ 절대 이렇게 하지 마세요!
// map.js에 직접 토큰 입력 → GitHub에 올리면 위험!
mapboxgl.accessToken = 'pk.eyJ1Ijo...실제토큰...';
```

**위험:**
- 누구나 GitHub에서 토큰을 볼 수 있음
- 타인이 무단 사용 → 요금 폭탄 💸
- Token 무효화 필요

---

## ✅ 안전한 방법

### 로컬 개발 (당신 컴퓨터)

```bash
# 1. config 파일 생성
cd assets/js/dashboard
cp config.example.js config.js

# 2. config.js 편집 (실제 토큰 입력)
# 이 파일은 .gitignore에 포함되어 GitHub에 안 올라감!

# 3. Git 확인
git status
# config.js가 목록에 없으면 OK! ✅
```

**파일 구조:**
```
assets/js/dashboard/
  ├── config.example.js   ← GitHub에 올라감 (템플릿, 토큰 없음)
  ├── config.js           ← GitHub에 안 올라감! (실제 토큰)
  └── map.js              ← config.js를 불러와 사용
```

---

### GitHub Pages 배포

**방법 1: URL 제한 토큰 (추천) 🌟**

```bash
# 1. Mapbox에서 새 토큰 생성
# https://account.mapbox.com/ → Create a token

# 2. URL Restrictions 설정
# https://[your-username].github.io/*

# 3. 이 토큰은 공개해도 안전!
# → 해당 URL에서만 작동
# → 다른 곳에서 사용 시 거부됨

# 4. config.js를 커밋에 포함
# .gitignore에서 config.js 제거
git add config.js
git commit -m "Add URL-restricted token"
git push
```

**방법 2: Private Repository**
```bash
# GitHub Pro 계정 필요
# Settings → Change repository visibility → Private
# config.js는 .gitignore에 유지
```

---

## 📋 빠른 체크리스트

### 로컬에서 개발할 때:
- [x] `.gitignore`에 `config.js` 포함됨
- [x] `config.example.js` 파일만 커밋
- [x] `config.js`에 실제 토큰 입력
- [x] `git status`로 `config.js`가 안 보이는지 확인

### GitHub Pages 배포 시:
- [ ] **옵션 A**: URL 제한 토큰 생성 + config.js 커밋
- [ ] **옵션 B**: Private 저장소 사용

---

## 🚨 실수했을 때

### config.js를 실수로 commit 했다면:

```bash
# 1. 아직 push 안 했으면
git reset HEAD~1

# 2. 이미 push 했다면
git rm --cached assets/js/dashboard/config.js
git commit -m "Remove sensitive config"
git push

# 3. Mapbox에서 토큰 무효화
# https://account.mapbox.com/access-tokens/
# 해당 토큰 삭제 후 재발급
```

---

## 💡 동작 원리

```html
<!-- cluster-dashboard.html -->
<script src="assets/js/dashboard/config.js"></script>  ← 1. config 먼저 로드
<script src="assets/js/dashboard/map.js"></script>     ← 2. map.js가 config 사용
```

```javascript
// config.js (GitHub에 안 올라감)
const MAPBOX_CONFIG = {
  accessToken: 'pk.실제토큰',
  tilesetId: 'username.abc123'
};

// map.js (GitHub에 올라감)
mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;  // config에서 불러옴
const TILESET_ID = MAPBOX_CONFIG.tilesetId;
```

---

## 📚 자세한 가이드

- **종합 가이드:** [SECURE_SETUP_GUIDE.md](SECURE_SETUP_GUIDE.md)
- **빠른 시작:** [DASHBOARD_QUICK_START.md](DASHBOARD_QUICK_START.md)
- **Mapbox 공식 문서:** https://docs.mapbox.com/help/troubleshooting/how-to-use-mapbox-securely/

---

## ✨ 요약

| 상황 | 방법 | 안전성 |
|------|------|--------|
| 로컬 개발 | `config.js` (gitignore) | ✅ 완전 안전 |
| GitHub Pages (공개) | URL 제한 토큰 + commit | ✅ 안전 |
| GitHub Pages (비공개) | Private 저장소 | ✅ 안전 |
| ~~코드에 직접 입력~~ | ~~하드코딩~~ | ❌ **절대 금지** |

**핵심:** Token을 공개 저장소에 올리지 마세요! 🔒
