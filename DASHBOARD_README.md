# 🗺️ Seoul Street Cluster Dashboard

## 개요 (Overview)

서울 가로망의 형태적 특성을 6개 클러스터로 분류하고 인터랙티브하게 탐색할 수 있는 대시보드입니다.

Interactive dashboard for exploring Seoul's street network grouped into 6 morphological clusters.

---

## 🎯 완성된 기능 (What's Built)

### 1. 새로운 대시보드 페이지
- **파일:** `cluster-dashboard.html`
- **경로:** landingimage2 클릭 → 대시보드로 이동
- **특징:** 팝업이 아닌 완전히 새로운 페이지

### 2. Mapbox 인터랙티브 지도
- 서울 중심으로 초기화
- GPKG 데이터를 Mapbox tileset으로 렌더링
- 6개 클러스터를 각각 다른 색상으로 표시

### 3. 클러스터별 색상 코드
```javascript
Cluster 1: #4ECDC4 (청록색)
Cluster 2: #FF6B6B (적색)
Cluster 3: #4A90E2 (청색)
Cluster 4: #E94B9E (분홍색)
Cluster 5: #A8E063 (녹색)
Cluster 6: #FFD93D (황색)
```

### 4. 인터랙션 기능
- ✅ 거리(LineString) 클릭 → 클러스터 정보 표시
- ✅ 클릭한 거리 하이라이트
- ✅ 우측 패널에 클러스터 정보 표시
- ✅ Radar chart 이미지 표시
- ✅ 클러스터 특성 설명 (EN/KO)
- ✅ 거리 이름 표시 (데이터에 포함된 경우)

### 5. UI 컴포넌트
- 🔙 Back to Home 버튼
- 🌐 언어 토글 (EN/KO)
- 🗺️ 지도 헤더 (제목 + 설명)
- 📊 범례 (6개 클러스터)
- 📱 우측 정보 패널
- 🔄 로딩 오버레이

---

## 📁 생성된 파일 구조

```
/
├── cluster-dashboard.html              ← 대시보드 페이지
├── CLUSTER_DASHBOARD_SETUP.md          ← 상세 설정 가이드
├── DASHBOARD_QUICK_START.md            ← 빠른 시작 가이드
├── DASHBOARD_README.md                 ← 이 파일
│
├── assets/
│   ├── css/
│   │   └── dashboard.css               ← 대시보드 전용 스타일
│   │
│   ├── js/
│   │   └── dashboard/
│   │       └── map.js                  ← Mapbox 로직 (여기에 토큰 입력!)
│   │
│   ├── images/
│   │   └── clusters/                   ← 여기에 radar chart 이미지 넣기!
│   │       ├── README.md               ← 이미지 가이드
│   │       ├── cluster1.png            ← 추가 필요
│   │       ├── cluster2.png            ← 추가 필요
│   │       ├── cluster3.png            ← 추가 필요
│   │       ├── cluster4.png            ← 추가 필요
│   │       ├── cluster5.png            ← 추가 필요
│   │       └── cluster6.png            ← 추가 필요
│   │
│   └── data/                           ← (선택사항) GeoJSON 사용 시
│       ├── README.md
│       └── seoul-streets.geojson       ← GPKG 변환 파일
```

---

## ⚙️ 설정 방법

### 필수 3단계:

#### 1. Radar Chart 이미지 추가
```bash
# 6개 PNG 파일을 여기에 복사:
assets/images/clusters/cluster1.png
assets/images/clusters/cluster2.png
assets/images/clusters/cluster3.png
assets/images/clusters/cluster4.png
assets/images/clusters/cluster5.png
assets/images/clusters/cluster6.png
```

#### 2. Mapbox Token 추가
```javascript
// assets/js/dashboard/map.js 파일 열기
// Line 24:
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'; // ← 여기에 토큰 붙여넣기
```

토큰 받기: https://account.mapbox.com/

#### 3. GPKG 업로드 (두 가지 방법 중 선택)

**방법 A: Mapbox Tileset (권장)**
1. https://studio.mapbox.com/tilesets/ 접속
2. "New tileset" 클릭
3. GPKG 파일 업로드
4. Tileset ID 복사 (예: `username.abc123`)
5. `map.js` Line 27에 붙여넣기

**방법 B: GeoJSON (간단하지만 느림)**
1. GPKG를 GeoJSON으로 변환
2. `assets/data/seoul-streets.geojson` 에 저장
3. `map.js` 수정 (가이드 참조)

---

## 🧪 테스트

```bash
cd /Users/haeseungsung/Desktop/vibe/bonwoo/bonwookoo
python3 -m http.server 8000
```

브라우저에서:
1. http://localhost:8000 → 홈페이지
2. landingimage2 클릭 → 대시보드로 이동
3. 거리 클릭 → 클러스터 정보 확인

---

## 📊 데이터 요구사항

### GPKG 파일 구조:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| geometry | LineString | ✅ | WGS84 (EPSG:4326) |
| cluster | String/Number | ✅ | '1', '2', '3', '4', '5', '6' |
| name | String | ❌ | 거리 이름 (선택사항) |

### 중요 체크:
- ✅ `cluster` 필드가 있는지 확인
- ✅ 값이 1-6 범위인지 확인
- ✅ 좌표계가 WGS84인지 확인 (위경도)

---

## 🎨 커스터마이징

### 클러스터 색상 변경
`map.js` Line 36-43:
```javascript
const CLUSTER_COLORS = {
  '1': '#4ECDC4',  // ← 여기 색상 변경
  // ...
};
```

⚠️ 주의: `cluster-dashboard.html`의 범례 색상도 함께 변경!

### 클러스터 설명 수정
`map.js` Line 46-67:
```javascript
const CLUSTER_DESCRIPTIONS = {
  en: {
    '1': 'Your description...',
  },
  ko: {
    '1': '설명...',
  }
};
```

---

## 🌐 배포

```bash
git add .
git commit -m "Add Seoul cluster analysis dashboard"
git push origin main
```

GitHub Pages 자동 배포됨!

접속 URL:
```
https://[your-username].github.io/bonwookoo/cluster-dashboard.html
```

---

## 🔍 문제 해결

### 지도가 안 보여요
→ 브라우저 Console (F12) 확인
→ Mapbox 토큰 확인

### 거리가 안 보여요
→ Tileset ID 확인
→ source-layer 이름 확인

### Radar chart가 안 나와요
→ 이미지 파일 경로 확인
→ 파일명 정확히 일치하는지 확인 (cluster1.png)

### 클릭이 안 돼요
→ Console에서 에러 확인
→ layer ID가 'street-clusters'인지 확인

---

## 📚 문서 가이드

### 빠른 시작:
→ `DASHBOARD_QUICK_START.md` 읽기 (3분)

### 상세 설정:
→ `CLUSTER_DASHBOARD_SETUP.md` 읽기 (10분)

### Radar chart:
→ `assets/images/clusters/README.md` 읽기

### GeoJSON 사용:
→ `assets/data/README.md` 읽기

---

## ✨ 주요 기능

### 사용자 경험:
1. 홈페이지 landingimage2 클릭
2. 대시보드 페이지로 이동 (새 페이지, 팝업 아님)
3. 서울 전체 거리망을 클러스터별 색상으로 확인
4. 원하는 거리 클릭
5. 우측 패널에 해당 클러스터의 radar chart 표시
6. 특성 설명 읽기
7. 다른 거리 탐색 계속

### 접근성:
- ✅ 키보드 네비게이션
- ✅ 모바일 반응형
- ✅ 다국어 지원 (EN/KO)
- ✅ 로딩 상태 표시

---

## 🚀 다음 단계

### 완료된 것:
- ✅ 대시보드 페이지 구조
- ✅ Mapbox 통합
- ✅ 클러스터별 색상 코딩
- ✅ 인터랙티브 클릭 이벤트
- ✅ Radar chart 표시 시스템
- ✅ 언어 토글
- ✅ 반응형 디자인

### 해야 할 것:
1. Radar chart 이미지 6개 추가
2. Mapbox 토큰 추가
3. GPKG 업로드 → Tileset 생성
4. 로컬 테스트
5. GitHub에 push

---

## 💡 팁

### Mapbox Studio 사용 팁:
- Tileset 업로드 후 "Preview" 기능으로 데이터 확인 가능
- 필드 이름, 데이터 타입 확인 가능
- Source-layer 이름 확인 가능

### 개발 팁:
- 브라우저 Console (F12) 자주 확인
- Network 탭에서 tileset 로딩 확인
- Console.log로 cluster 값 확인

### 성능 팁:
- 큰 데이터셋은 반드시 Tileset 사용 (GeoJSON 대신)
- 이미지는 최적화된 PNG 사용 (400-600px)

---

## 📞 도움이 필요하면

1. Console 에러 메시지 확인
2. `CLUSTER_DASHBOARD_SETUP.md` 문제 해결 섹션 참조
3. Mapbox 공식 문서: https://docs.mapbox.com/

---

## 🎉 완성!

축하합니다! 이제 다음을 갖게 되었습니다:

✅ **인터랙티브 지도 대시보드**
✅ **클러스터별 시각화**
✅ **Radar chart 통합**
✅ **다국어 지원**
✅ **모바일 최적화**
✅ **GitHub Pages 배포 준비 완료**

**다음:** Radar chart를 추가하고 Mapbox를 설정하여 연구 결과를 생생하게 보여주세요! 🚀
