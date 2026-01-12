import type { Note } from './types'

// 초기 샘플 노트
export const sampleNotes: Note[] = [
  {
    id: 'sample-1',
    title: 'React 학습 메모',
    content: `React의 핵심 개념들을 정리했습니다.

## 컴포넌트
- 함수형 컴포넌트를 권장
- Props로 데이터 전달
- 단방향 데이터 흐름

## 훅 (Hooks)
- useState: 상태 관리
- useEffect: 사이드 이펙트
- useContext: 컨텍스트 접근
- useMemo/useCallback: 최적화`,
    category: '학습',
    tags: ['React', 'JavaScript', '프론트엔드'],
    isPinned: true,
    color: 'blue',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-2',
    title: 'TypeScript 타입 정리',
    content: `자주 사용하는 TypeScript 타입 패턴들입니다.

- Generic 타입: \`<T>\`
- Union 타입: \`A | B\`
- Intersection 타입: \`A & B\`
- Conditional 타입: \`T extends U ? X : Y\`
- Mapped 타입: \`{ [K in keyof T]: ... }\``,
    category: '학습',
    tags: ['TypeScript', '프론트엔드'],
    isPinned: false,
    color: 'purple',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-3',
    title: '주간 할일 목록',
    content: `이번 주에 완료해야 할 작업들:

- [ ] 프로젝트 문서 작성
- [ ] 코드 리뷰 진행
- [ ] 테스트 코드 추가
- [ ] 디자인 시스템 검토`,
    category: '할일',
    tags: ['업무', '계획'],
    isPinned: false,
    color: 'yellow',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sample-4',
    title: 'CSS Grid 레이아웃',
    content: `CSS Grid 기본 속성들:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
}
\`\`\`

유용한 패턴:
- auto-fill vs auto-fit
- minmax() 함수
- grid-area 명명`,
    category: '학습',
    tags: ['CSS', '프론트엔드'],
    isPinned: false,
    color: 'green',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'sample-5',
    title: '아이디어 메모',
    content: `새로운 프로젝트 아이디어:

1. 개인 대시보드 앱
2. 습관 트래커
3. 독서 기록 관리자

나중에 구현해볼 것들!`,
    category: '아이디어',
    tags: ['프로젝트', '브레인스토밍'],
    isPinned: false,
    color: 'pink',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
]
