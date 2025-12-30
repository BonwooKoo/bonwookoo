# 🗺️ NDJSON 데이터 사용 가이드

## ✅ 완료된 것

NDJSON 파일(`clustered_k6.ndjson`)이 자동으로 연동되었습니다!

### 파일 정보:
- **위치:** `assets/data/clustered_k6.ndjson`
- **크기:** 28MB
- **거리 수:** 130,265개 세그먼트
- **형식:** Newline Delimited GeoJSON
- **좌표계:** WGS84 (EPSG:4326)
- **속성:**
  - `uid`: 고유 ID
  - `cluster`: 클러스터 번호 ('1', '2', '3', '4', '5', '6')
  - `geometry`: LineString (거리 형태)

---

## 🚀 사용 방법

### 자동 로딩 (현재 설정)

**조건:** Tileset ID가 설정되지 않았을 때 자동으로 NDJSON 로드

```javascript
// config.js에서:
const MAPBOX_CONFIG = {
  accessToken: 'pk.eyJ...',  // 토큰만 있음
  tilesetId: 'YOUR_TILESET_ID'  // 기본값 그대로
};
```

**동작:**
1. 대시보드 접속
2. `clustered_k6.ndjson` 자동 로드 (약 2-5초)
3. GeoJSON으로 변환
4. 지도에 표시
5. 클러스터별 색상 적용

---

## 🎨 데이터 구조

### NDJSON 형식:
```json
{"type":"Feature","properties":{"uid":1,"cluster":"3"},"geometry":{"type":"LineString","coordinates":[[127.0007941,37.5266153],[127.0010851,37.5267068]]}}
{"type":"Feature","properties":{"uid":2,"cluster":"1"},"geometry":{"type":"LineString","coordinates":[[127.0012345,37.5267890],[127.0015678,37.5268901]]}}
...
```

### 자동 변환 후 (GeoJSON):
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "uid": 1,
        "cluster": "3"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [[127.0007941,37.5266153], [127.0010851,37.5267068]]
      }
    },
    ...
  ]
}
```

---

## ⚙️ 두 가지 사용 옵션

### 옵션 1: NDJSON 직접 사용 (현재 설정) ✅

**장점:**
- ✅ 설정 간단 (파일만 있으면 됨)
- ✅ Mapbox Studio 불필요
- ✅ 무료 (Mapbox API 호출 없음)

**단점:**
- ⚠️ 초기 로딩 느림 (28MB 다운로드)
- ⚠️ 메모리 사용량 높음
- ⚠️ 대용량 데이터에는 비효율적

**사용 방법:**
1. `clustered_k6.ndjson`을 `assets/data/`에 유지
2. `config.js`에서 `tilesetId`는 기본값 유지
3. 끝! 자동으로 작동함

---

### 옵션 2: Mapbox Tileset 사용 (권장)

**장점:**
- ✅ 빠른 로딩 (타일 기반)
- ✅ 메모리 효율적
- ✅ 대용량 데이터 최적화
- ✅ 줌 레벨별 최적화

**단점:**
- ⚠️ Mapbox 계정 필요
- ⚠️ 업로드 과정 필요 (10분)

**사용 방법:**

#### 1단계: NDJSON → Tileset 변환

```bash
# Mapbox Studio에서 직접 업로드
# 1. https://studio.mapbox.com/tilesets/ 접속
# 2. "New tileset" 클릭
# 3. clustered_k6.ndjson 업로드
# 4. 처리 대기 (5-10분)
```

#### 2단계: Tileset ID 설정

```javascript
// config.js
const MAPBOX_CONFIG = {
  accessToken: 'pk.eyJ...',
  tilesetId: 'username.clustered-k6-abc123'  // ← 여기 업데이트
};
```

#### 3단계: Source Layer 확인

Mapbox Studio에서 tileset 열어서 **source-layer 이름** 확인:
- 보통: `clustered_k6` (파일명)
- 다를 경우 `map.js`에서 수정 필요

---

## 🔍 트러블슈팅

### 문제: 지도에 거리가 안 보여요

**확인 사항:**
```bash
# 1. NDJSON 파일 존재 확인
ls -lh assets/data/clustered_k6.ndjson
# 출력: -rw-r--r--  28MB  clustered_k6.ndjson

# 2. 브라우저 콘솔 확인 (F12)
# "Loading NDJSON data..." 메시지 확인
# "Loaded 130265 street segments" 확인
```

### 문제: 로딩이 너무 느려요

**해결 방법:**
1. **Mapbox Tileset 사용** (위 옵션 2)
2. 또는 데이터 축소:
   ```python
   # Python으로 샘플링
   import random

   with open('clustered_k6.ndjson') as f:
       lines = f.readlines()

   # 10% 샘플링
   sample = random.sample(lines, len(lines) // 10)

   with open('clustered_k6_sample.ndjson', 'w') as f:
       f.writelines(sample)
   ```

### 문제: 메모리 부족 에러

**증상:**
- 브라우저 느려짐
- "Out of memory" 에러
- 탭 크래시

**해결:**
→ **반드시 Mapbox Tileset 사용** (옵션 2)

---

## 📊 성능 비교

| 방법 | 초기 로딩 | 메모리 | 줌/팬 속도 | 권장 |
|------|----------|--------|-----------|------|
| NDJSON (현재) | 5-10초 | ~200MB | 보통 | 테스트용 |
| Tileset | <1초 | ~50MB | 빠름 | 프로덕션 |

**130,265개 세그먼트 기준**

---

## ✨ 현재 설정 요약

```
✅ NDJSON 파일 있음: assets/data/clustered_k6.ndjson
✅ 자동 로딩 설정됨: map.js
✅ 클러스터 색상 매핑: 6가지 색상
✅ 인터랙션 준비됨: 클릭 → 클러스터 정보
```

**다음 단계:**
1. 테스트: `python3 -m http.server 8000`
2. 브라우저: http://localhost:8000/cluster-dashboard.html
3. 확인: 거리가 색상별로 표시되는지
4. (선택) 성능 개선 필요 시 Tileset으로 전환

---

## 🎯 빠른 테스트

```bash
# 1. 서버 시작
cd /Users/haeseungsung/Desktop/vibe/bonwoo/bonwookoo
python3 -m http.server 8000

# 2. 브라우저 열기
open http://localhost:8000/cluster-dashboard.html

# 3. 콘솔 확인 (F12)
# 예상 출력:
# > Loading NDJSON data...
# > Loaded 130265 street segments
# > (지도에 거리 표시됨)
```

---

## 📚 관련 문서

- **전체 설정:** [CLUSTER_DASHBOARD_SETUP.md](CLUSTER_DASHBOARD_SETUP.md)
- **빠른 시작:** [DASHBOARD_QUICK_START.md](DASHBOARD_QUICK_START.md)
- **보안:** [SECURE_SETUP_GUIDE.md](SECURE_SETUP_GUIDE.md)

---

## 🎉 완료!

NDJSON 파일이 자동으로 연동되었습니다!

**현재 상태:**
- ✅ 130,265개 거리 세그먼트 준비됨
- ✅ 6개 클러스터 색상 매핑 완료
- ✅ 자동 로딩 설정됨
- ✅ 클릭 인터랙션 준비됨

**바로 테스트 가능합니다!** 🚀
