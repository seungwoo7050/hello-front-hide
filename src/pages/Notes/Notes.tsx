import { useCallback } from 'react';
import { usePersistedNotes } from '../../features/notes/usePersistedNotes';
import { NoteList, NoteEditor } from '../../features/notes/components';
import type { NoteFormValues } from '../../features/notes';
import { useToast } from '../../components/ui';
import styles from './Notes.module.css';

export function Notes() {
  const {
    filteredNotes,
    filter,
    selectedNote,
    isEditing,
    allTags,
    allCategories,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    setSearch,
    setCategory,
    setTag,
    setSortBy,
    selectNote,
    setIsEditing,
    clearFilter,
  } = usePersistedNotes();

  const { success, error: showError } = useToast();

  const handleCreateNote = useCallback(() => {
    selectNote(null);
    setIsEditing(true);
  }, [selectNote, setIsEditing]);

  const handleSave = useCallback(
    (values: NoteFormValues) => {
      try {
        if (selectedNote) {
          updateNote(selectedNote.id, values);
          success('노트가 수정되었습니다');
        } else {
          const newNote = createNote(values);
          selectNote(newNote);
          success('새 노트가 생성되었습니다');
        }
        setIsEditing(false);
      } catch {
        showError('저장에 실패했습니다');
      }
    },
    [selectedNote, updateNote, createNote, selectNote, setIsEditing, success, showError]
  );

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (!selectedNote) {
      selectNote(null);
    }
  }, [selectedNote, selectNote, setIsEditing]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteNote(id);
      success('노트가 삭제되었습니다');
    },
    [deleteNote, success]
  );

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
            notes={filteredNotes}
            filter={filter}
            selectedNote={selectedNote}
            allCategories={allCategories}
            allTags={allTags}
            onSelectNote={selectNote}
            onDeleteNote={handleDelete}
            onTogglePin={togglePin}
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
  );
}

export default Notes;
