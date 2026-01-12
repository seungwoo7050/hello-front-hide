import { http, HttpResponse, delay } from 'msw'
import type { Note, NoteColor } from '../../features/notes/types'
import { API_DELAY } from '../../api/client'

// 메모리 내 노트 저장소
let notes: Note[] = [
  {
    id: 'mock-1',
    title: 'React 학습 메모',
    content: `React의 핵심 개념들을 정리했습니다.

## 컴포넌트
- 함수형 컴포넌트를 권장
- Props로 데이터 전달
- 단방향 데이터 흐름

## 훅 (Hooks)
- useState: 상태 관리
- useEffect: 사이드 이펙트
- useContext: 컨텍스트 접근`,
    category: '학습',
    tags: ['React', 'JavaScript', '프론트엔드'],
    isPinned: true,
    color: 'blue',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock-2',
    title: 'TypeScript 타입 정리',
    content: `자주 사용하는 TypeScript 타입 패턴들입니다.

- Generic 타입: \`<T>\`
- Union 타입: \`A | B\`
- Intersection 타입: \`A & B\``,
    category: '학습',
    tags: ['TypeScript', '프론트엔드'],
    isPinned: false,
    color: 'purple',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'mock-3',
    title: '주간 할일 목록',
    content: `이번 주에 완료해야 할 작업들:

- [ ] 프로젝트 문서 작성
- [ ] 코드 리뷰 진행
- [ ] 테스트 코드 추가`,
    category: '할일',
    tags: ['업무', '계획'],
    isPinned: false,
    color: 'yellow',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

// 노트 ID 생성기
let nextId = 4
function generateId(): string {
  return `mock-${nextId++}`
}

export const notesHandlers = [
  // 모든 노트 조회
  http.get('/api/notes', async ({ request }) => {
    await delay(API_DELAY)

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const category = url.searchParams.get('category')
    const tag = url.searchParams.get('tag')
    const sortBy = url.searchParams.get('sortBy') || 'newest'

    let result = [...notes]

    // 검색
    if (search) {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(search) ||
          note.content.toLowerCase().includes(search) ||
          note.tags.some((t) => t.toLowerCase().includes(search))
      )
    }

    // 카테고리 필터
    if (category) {
      result = result.filter((note) => note.category === category)
    }

    // 태그 필터
    if (tag) {
      result = result.filter((note) => note.tags.includes(tag))
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'title-asc':
          return a.title.localeCompare(b.title, 'ko')
        case 'title-desc':
          return b.title.localeCompare(a.title, 'ko')
        case 'updated':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        default:
          return 0
      }
    })

    // 고정된 노트를 상단으로
    const pinned = result.filter((n) => n.isPinned)
    const unpinned = result.filter((n) => !n.isPinned)

    return HttpResponse.json([...pinned, ...unpinned])
  }),

  // 단일 노트 조회
  http.get('/api/notes/:id', async ({ params }) => {
    await delay(API_DELAY)

    const note = notes.find((n) => n.id === params.id)

    if (!note) {
      return HttpResponse.json(
        { message: '노트를 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return HttpResponse.json(note)
  }),

  // 노트 생성
  http.post('/api/notes', async ({ request }) => {
    await delay(API_DELAY)

    const body = (await request.json()) as {
      title: string
      content: string
      category: string
      tags: string[]
      color: string
    }

    const now = new Date().toISOString()
    const newNote: Note = {
      id: generateId(),
      title: body.title,
      content: body.content,
      category: body.category,
      tags: body.tags,
      isPinned: false,
      color: body.color as NoteColor,
      createdAt: now,
      updatedAt: now,
    }

    notes = [newNote, ...notes]

    return HttpResponse.json(newNote, { status: 201 })
  }),

  // 노트 수정
  http.patch('/api/notes/:id', async ({ params, request }) => {
    await delay(API_DELAY)

    const index = notes.findIndex((n) => n.id === params.id)

    if (index === -1) {
      return HttpResponse.json(
        { message: '노트를 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const body = (await request.json()) as Partial<Note>

    notes[index] = {
      ...notes[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(notes[index])
  }),

  // 노트 삭제
  http.delete('/api/notes/:id', async ({ params }) => {
    await delay(API_DELAY)

    const index = notes.findIndex((n) => n.id === params.id)

    if (index === -1) {
      return HttpResponse.json(
        { message: '노트를 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    notes = notes.filter((n) => n.id !== params.id)

    return HttpResponse.json({ id: params.id })
  }),

  // 핀 토글
  http.patch('/api/notes/:id/pin', async ({ params }) => {
    await delay(API_DELAY)

    const index = notes.findIndex((n) => n.id === params.id)

    if (index === -1) {
      return HttpResponse.json(
        { message: '노트를 찾을 수 없습니다', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    notes[index] = {
      ...notes[index],
      isPinned: !notes[index].isPinned,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(notes[index])
  }),
]

// 테스트용 유틸리티
export function resetNotes() {
  notes = [
    {
      id: 'mock-1',
      title: 'React 학습 메모',
      content: 'React의 핵심 개념들',
      category: '학습',
      tags: ['React', 'JavaScript'],
      isPinned: true,
      color: 'blue',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'mock-2',
      title: 'TypeScript 타입 정리',
      content: 'TypeScript 타입 패턴',
      category: '학습',
      tags: ['TypeScript'],
      isPinned: false,
      color: 'purple',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ]
  nextId = 3
}
