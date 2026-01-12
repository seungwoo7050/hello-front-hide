export interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isPinned: boolean
  color: NoteColor
  createdAt: string
  updatedAt: string
}

export type NoteColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'

export interface NoteFormValues {
  title: string
  content: string
  category: string
  tags: string
  color: NoteColor
}

export interface NotesFilter {
  search: string
  category: string | null
  tag: string | null
  sortBy: SortOption
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'title-asc'
  | 'title-desc'
  | 'updated'
