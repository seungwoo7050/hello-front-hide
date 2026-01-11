import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, formValuesToCreateRequest, formValuesToUpdateRequest } from '../../api/notes';
import type { Note, NoteFormValues } from './types';
import type { NotesQueryParams } from '../../api/notes';

// Query Keys
export const notesKeys = {
  all: ['notes'] as const,
  lists: () => [...notesKeys.all, 'list'] as const,
  list: (params?: NotesQueryParams) => [...notesKeys.lists(), params] as const,
  details: () => [...notesKeys.all, 'detail'] as const,
  detail: (id: string) => [...notesKeys.details(), id] as const,
};

// 노트 목록 조회 훅
export function useNotesQuery(params?: NotesQueryParams) {
  return useQuery({
    queryKey: notesKeys.list(params),
    queryFn: () => notesApi.getAll(params),
  });
}

// 단일 노트 조회 훅
export function useNoteQuery(id: string) {
  return useQuery({
    queryKey: notesKeys.detail(id),
    queryFn: () => notesApi.getById(id),
    enabled: !!id,
  });
}

// 노트 생성 훅
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: NoteFormValues) => {
      const request = formValuesToCreateRequest(values);
      return notesApi.create(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
}

// 노트 수정 훅
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<NoteFormValues> }) => {
      const request = formValuesToUpdateRequest(values);
      return notesApi.update(id, request);
    },
    onMutate: async ({ id, values }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() });
      
      const previousNotes = queryClient.getQueryData<Note[]>(notesKeys.list());
      
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(notesKeys.list(), (old) =>
          old?.map((note) => {
            if (note.id !== id) return note;
            
            const updatedNote: Note = {
              ...note,
              updatedAt: new Date().toISOString(),
            };
            
            if (values.title !== undefined) updatedNote.title = values.title;
            if (values.content !== undefined) updatedNote.content = values.content;
            if (values.category !== undefined) updatedNote.category = values.category;
            if (values.color !== undefined) updatedNote.color = values.color;
            if (values.tags !== undefined) {
              updatedNote.tags = values.tags.split(',').map((t) => t.trim()).filter(Boolean);
            }
            
            return updatedNote;
          })
        );
      }
      
      return { previousNotes };
    },
    onError: (_err, _variables, context) => {
      // 에러 시 롤백
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.list(), context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
}

// 노트 삭제 훅
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onMutate: async (id) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() });
      
      const previousNotes = queryClient.getQueryData<Note[]>(notesKeys.list());
      
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(notesKeys.list(), (old) =>
          old?.filter((note) => note.id !== id)
        );
      }
      
      return { previousNotes };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.list(), context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
}

// 핀 토글 훅
export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.togglePin(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() });
      
      const previousNotes = queryClient.getQueryData<Note[]>(notesKeys.list());
      
      if (previousNotes) {
        queryClient.setQueryData<Note[]>(notesKeys.list(), (old) =>
          old?.map((note) =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
          )
        );
      }
      
      return { previousNotes };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.list(), context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
    },
  });
}
