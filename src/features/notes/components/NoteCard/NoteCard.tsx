import { memo, useCallback } from 'react';
import type { Note, NoteColor } from '../../types';
import { summarizeText, formatRelativeTime } from '../../utils';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onSelect?: (note: Note) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

const colorClasses: Record<NoteColor, string> = {
  default: styles.colorDefault,
  red: styles.colorRed,
  orange: styles.colorOrange,
  yellow: styles.colorYellow,
  green: styles.colorGreen,
  blue: styles.colorBlue,
  purple: styles.colorPurple,
  pink: styles.colorPink,
};

/**
 * NoteCard 내부 컴포넌트
 * React.memo로 감싸 불필요한 리렌더링 방지
 */
function NoteCardBase({
  note,
  isSelected = false,
  onSelect,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const handleClick = useCallback(() => {
    onSelect?.(note);
  }, [note, onSelect]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(note.id);
  }, [note.id, onDelete]);

  const handleTogglePin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin?.(note.id);
  }, [note.id, onTogglePin]);

  const cardClasses = [
    styles.noteCard,
    colorClasses[note.color],
    isSelected && styles.selected,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardClasses}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{note.title || '제목 없음'}</h3>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} ${note.isPinned ? styles.pinned : ''}`}
            onClick={handleTogglePin}
            aria-label={note.isPinned ? '고정 해제' : '고정'}
            title={note.isPinned ? '고정 해제' : '고정'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={note.isPinned ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L12 12" />
              <path d="M18 7L18 9C18 11 16 12 16 12L8 12C8 12 6 11 6 9L6 7" />
              <path d="M12 12L12 22" />
              <circle cx="12" cy="5" r="3" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.delete}`}
            onClick={handleDelete}
            aria-label="삭제"
            title="삭제"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </header>

      {note.content && (
        <p className={styles.content}>{summarizeText(note.content, 150)}</p>
      )}

      <footer className={styles.footer}>
        <div className={styles.meta}>
          {note.category && (
            <span className={styles.category}>{note.category}</span>
          )}
          <span>{formatRelativeTime(note.updatedAt)}</span>
        </div>
        
        {note.tags.length > 0 && (
          <div className={styles.tags}>
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className={styles.tag}>+{note.tags.length - 3}</span>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}

/**
 * NoteCard 컴포넌트
 * 메모이제이션 적용: note 객체나 isSelected가 변경될 때만 리렌더링
 */
export const NoteCard = memo(NoteCardBase, (prevProps, nextProps) => {
  // 커스텀 비교 함수: 특정 속성만 비교하여 불필요한 리렌더링 방지
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.color === nextProps.note.color &&
    prevProps.note.isPinned === nextProps.note.isPinned &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onTogglePin === nextProps.onTogglePin
  );
});

export default NoteCard;
