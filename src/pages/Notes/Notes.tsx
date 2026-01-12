import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useNotesQuery,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useTogglePin,
} from '../../features/notes'
import { NoteList, NoteEditor } from '../../features/notes/components'
import type { Note, NoteFormValues, NotesFilter } from '../../features/notes'
import {
  extractAllCategories,
  extractAllTags,
} from '../../features/notes/utils'
import { useToast, Spinner } from '../../components/ui'
import styles from './Notes.module.css'

export function Notes() {
  const [filter, setFilter] = useState<NotesFilter>({
    search: '',
    category: null,
    tag: null,
    sortBy: 'newest',
  })
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const notesQuery = useNotesQuery({
    search: filter.search || undefined,
    category: filter.category || undefined,
    tag: filter.tag || undefined,
    sortBy: filter.sortBy,
  })

  const { mutateAsync: createNote } = useCreateNote()
  const { mutateAsync: updateNote } = useUpdateNote()
  const { mutateAsync: deleteNote } = useDeleteNote()
  const { mutateAsync: togglePin } = useTogglePin()

  const notes = useMemo(() => notesQuery.data ?? [], [notesQuery.data])
  const allTags = useMemo(() => extractAllTags(notes), [notes])
  const allCategories = useMemo(() => extractAllCategories(notes), [notes])

  const { success, error: showError } = useToast()

  useEffect(() => {
    if (!selectedNote) return

    const fresh = notes.find((note) => note.id === selectedNote.id)
    if (fresh) {
      // avoid synchronous setState inside effect
      queueMicrotask(() => setSelectedNote(fresh))
      return
    }

    if (!notesQuery.isLoading) {
      queueMicrotask(() => {
        setSelectedNote(null)
        setIsEditing(false)
      })
    }
  }, [notes, notesQuery.isLoading, selectedNote])

  useEffect(() => {
    if (notesQuery.isError) {
      showError('노트를 불러오지 못했습니다. 다시 시도해주세요.')
    }
  }, [notesQuery.isError, showError])

  const handleCreateNote = useCallback(() => {
    setSelectedNote(null)
    setIsEditing(true)
  }, [])

  const handleSave = useCallback(
    async (values: NoteFormValues) => {
      try {
        if (selectedNote) {
          const updated = await updateNote({ id: selectedNote.id, values })
          if (updated) {
            setSelectedNote(updated)
          }
          success('노트가 수정되었습니다')
        } else {
          const newNote = await createNote(values)
          if (newNote) {
            setSelectedNote(newNote)
          }
          success('새 노트가 생성되었습니다')
        }
        setIsEditing(false)
      } catch (error) {
        console.error(error)
        showError('저장에 실패했습니다')
      }
    },
    [selectedNote, updateNote, createNote, success, showError]
  )

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (!selectedNote) {
      setSelectedNote(null)
    }
  }, [selectedNote])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteNote(id)
        setSelectedNote(null)
        setIsEditing(false)
        success('노트가 삭제되었습니다')
      } catch (error) {
        console.error(error)
        showError('삭제에 실패했습니다')
      }
    },
    [deleteNote, success, showError]
  )

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note)
    setIsEditing(false)
  }, [])

  const handleTogglePin = useCallback(
    async (id: string) => {
      try {
        await togglePin(id)
      } catch (error) {
        console.error(error)
        showError('핀 상태 변경에 실패했습니다')
      }
    },
    [togglePin, showError]
  )

  const setSearch = useCallback((search: string) => {
    setFilter((prev) => ({ ...prev, search }))
  }, [])

  const setCategory = useCallback((category: string | null) => {
    setFilter((prev) => ({ ...prev, category }))
  }, [])

  const setTag = useCallback((tag: string | null) => {
    setFilter((prev) => ({ ...prev, tag }))
  }, [])

  const setSortBy = useCallback((sortBy: NotesFilter['sortBy']) => {
    setFilter((prev) => ({ ...prev, sortBy }))
  }, [])

  const clearFilter = useCallback(() => {
    setFilter({ search: '', category: null, tag: null, sortBy: 'newest' })
  }, [])

  if (notesQuery.isLoading) {
    return (
      <div className={styles.notesPage}>
        <div className={styles.loadingState}>
          <Spinner size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.notesPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>📝 노트</h1>
        <p className={styles.description}>
          아이디어를 기록하고 관리하세요. 카테고리와 태그로 정리할 수 있습니다.
        </p>
      </header>

      <div className={styles.content}>
        <div className={styles.listPanel}>
          <NoteList
            notes={notes}
            filter={filter}
            selectedNote={selectedNote}
            allCategories={allCategories}
            allTags={allTags}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDelete}
            onTogglePin={handleTogglePin}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onTagChange={setTag}
            onSortChange={setSortBy}
            onClearFilter={clearFilter}
            onCreateNote={handleCreateNote}
          />
        </div>

        <div
          className={`${styles.editorPanel} ${
            isEditing || selectedNote ? styles.visible : ''
          }`}
        >
          <NoteEditor
            note={selectedNote}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}

export default Notes
