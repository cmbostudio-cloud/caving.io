# caving.io editing skill guide

이 문서는 다른 AI/개발자가 `caving.io`를 빠르게 수정하기 위한 작업 가이드입니다.

## 1) 프로젝트 구조
- `index.html`: UI 구조, 오버레이/패널/버튼 마크업
- `style.css`: 전체 스타일
- `game.js`: 게임 로직(맵 생성, 이동, 렌더링, 설정 저장)

## 2) 핵심 상수
- `MAP_SIZE`: 실제 월드 크기 (현재 30)
- `VIEW_SIZE`: 플레이어 중심 화면 크기 (현재 11)
- `MAP_W`, `MAP_H`: 월드 가로/세로

## 3) 렌더링 포인트
- 메인 맵 렌더: `render()`
- 뷰포트 계산: `getViewportBounds()`
- 미니맵 렌더: `renderMiniMap()`

## 4) 설정 추가/수정 방법
1. `loadSettings()` 기본값 추가
2. `saveSettings()`는 기존 JSON 저장 로직 그대로 사용
3. `index.html` 설정 모달에 토글 UI 추가
4. `applyLanguage()`에서 active 상태 동기화
5. 변경 시 `render()` 재호출

## 5) i18n 규칙
- 문자열은 `I18N.en`, `I18N.ko` 모두에 추가
- 텍스트 노드는 `data-i18n`을 사용

## 6) 맵 좌표 수정 규칙
- 하드코딩 좌표 대신 `MAP_W`, `MAP_H`, `MAP_MID_Y` 기반 계산 사용
- 맵 확장/축소 시 길이 끊기지 않도록 생성 로직의 범위값도 같이 수정

## 7) 변경 후 확인
- 문법 검사: `node --check game.js`
- 최소 수동 확인: 이동, 채굴, 층 이동, 설정 토글(특히 미니맵)
