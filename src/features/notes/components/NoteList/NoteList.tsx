import type { Note, NotesFilter, SortOption } from '../../types'
import { NoteCard } from '../NoteCard'
import { Button } from '../../../../components/ui'
import styles from './NoteList.module.css'

interface NoteListProps {
  notes: Note[]
  filter: NotesFilter
  selectedNote: Note | null
  allCategories: string[]
  allTags: string[]
  onSelectNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  onTogglePin: (id: string) => void
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string | null) => void
  onTagChange: (tag: string | null) => void
  onSortChange: (sortBy: SortOption) => void
  onClearFilter: () => void
  onCreateNote: () => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'updated', label: '수정순' },
  { value: 'title-asc', label: '제목 (가나다)' },
  { value: 'title-desc', label: '제목 (역순)' },
]

export function NoteList({
  notes,
  filter,
  selectedNote,
  allCategories,
  allTags,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
  onSearchChange,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onClearFilter,
  onCreateNote,
}: NoteListProps) {
  const hasActiveFilter =
    filter.search || filter.category || filter.tag || filter.sortBy !== 'newest'

  return (
    <div className={styles.noteList}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          노트 <span className={styles.count}>({notes.length})</span>
        </h2>
        <Button variant="primary" size="small" onClick={onCreateNote}>
          + 새 노트
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="노트 검색..."
            value={filter.search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={filter.category || ''}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            aria-label="카테고리 필터"
          >
            <option value="">모든 카테고리</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={filter.tag || ''}
            onChange={(e) => onTagChange(e.target.value || null)}
            aria-label="태그 필터"
          >
            <option value="">모든 태그</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={filter.sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="정렬"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              type="button"
              className={styles.clearFilter}
              onClick={onClearFilter}
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {notes.length === 0 ? (
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 12h6M12 9v6" />
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <h3 className={styles.emptyTitle}>
              {filter.search || filter.category || filter.tag
                ? '검색 결과가 없습니다'
                : '노트가 없습니다'}
            </h3>
            <p className={styles.emptyDescription}>
              {filter.search || filter.category || filter.tag
                ? '다른 검색어나 필터를 시도해보세요'
                : '새 노트를 작성해보세요!'}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNote?.id === note.id}
                onSelect={onSelectNote}
                onDelete={onDeleteNote}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteList
