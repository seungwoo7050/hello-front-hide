import { api } from './client';
import type { ApiResponse } from './client';
import type { Note, NoteFormValues } from '../features/notes/types';

// 노트 API 타입
export interface CreateNoteRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  color?: string;
  isPinned?: boolean;
}

export interface NotesQueryParams {
  search?: string;
  category?: string;
  tag?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

// 노트 API
export const notesApi = {
  // 모든 노트 조회
  getAll: (params?: NotesQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    
    const query = searchParams.toString();
    return api.get<Note[]>(`/notes${query ? `?${query}` : ''}`);
  },

  // 단일 노트 조회
  getById: (id: string) => api.get<Note>(`/notes/${id}`),

  // 노트 생성
  create: (data: CreateNoteRequest): Promise<ApiResponse<Note>> =>
    api.post<Note>('/notes', data),

  // 노트 수정
  update: (id: string, data: UpdateNoteRequest): Promise<ApiResponse<Note>> =>
    api.patch<Note>(`/notes/${id}`, data),

  // 노트 삭제
  delete: (id: string): Promise<ApiResponse<{ id: string }>> =>
    api.delete<{ id: string }>(`/notes/${id}`),

  // 핀 토글
  togglePin: (id: string): Promise<ApiResponse<Note>> =>
    api.patch<Note>(`/notes/${id}/pin`, {}),
};

// 폼 값을 API 요청 형식으로 변환
export function formValuesToCreateRequest(values: NoteFormValues): CreateNoteRequest {
  return {
    title: values.title,
    content: values.content,
    category: values.category,
    tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
    color: values.color,
  };
}

export function formValuesToUpdateRequest(values: Partial<NoteFormValues>): UpdateNoteRequest {
  const request: UpdateNoteRequest = {};
  
  if (values.title !== undefined) request.title = values.title;
  if (values.content !== undefined) request.content = values.content;
  if (values.category !== undefined) request.category = values.category;
  if (values.tags !== undefined) {
    request.tags = values.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  if (values.color !== undefined) request.color = values.color;
  
  return request;
}
