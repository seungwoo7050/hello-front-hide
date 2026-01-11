import type { Note, SortOption } from './types';

// 고유 ID 생성
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// 날짜 포맷팅
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// 상대 시간 포맷팅
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return formatDate(d);
  } else if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return '방금 전';
  }
}

// 노트 검색
export function searchNotes(notes: Note[], query: string): Note[] {
  if (!query.trim()) return notes;
  
  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// 노트 정렬
export function sortNotes(notes: Note[], sortBy: SortOption): Note[] {
  const sorted = [...notes];
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'ko'));
    case 'updated':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    default:
      return sorted;
  }
}

// 카테고리별 필터링
export function filterByCategory(notes: Note[], category: string | null): Note[] {
  if (!category) return notes;
  return notes.filter((note) => note.category === category);
}

// 태그별 필터링
export function filterByTag(notes: Note[], tag: string | null): Note[] {
  if (!tag) return notes;
  return notes.filter((note) => note.tags.includes(tag));
}

// 모든 태그 추출
export function extractAllTags(notes: Note[]): string[] {
  const tagSet = new Set<string>();
  notes.forEach((note) => {
    note.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'ko'));
}

// 모든 카테고리 추출
export function extractAllCategories(notes: Note[]): string[] {
  const categorySet = new Set<string>();
  notes.forEach((note) => {
    if (note.category) {
      categorySet.add(note.category);
    }
  });
  return Array.from(categorySet).sort((a, b) => a.localeCompare(b, 'ko'));
}

// 텍스트 요약 (미리보기용)
export function summarizeText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
