import { useState, useMemo } from 'react';
import type { Note, NoteFormValues, NoteColor } from '../../types';
import { formatDate } from '../../utils';
import { Button } from '../../../../components/ui';
import styles from './NoteEditor.module.css';

interface NoteEditorProps {
  note: Note | null;
  isEditing: boolean;
  onSave: (values: NoteFormValues) => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete?: (id: string) => void;
}

const colors: NoteColor[] = [
  'default',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
];

const defaultValues: NoteFormValues = {
  title: '',
  content: '',
  category: '',
  tags: '',
  color: 'default',
};

// 노트에서 폼 값 추출
function getFormValues(note: Note | null): NoteFormValues {
  if (!note) return defaultValues;
  return {
    title: note.title,
    content: note.content,
    category: note.category,
    tags: note.tags.join(', '),
    color: note.color,
  };
}

export function NoteEditor({
  note,
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: NoteEditorProps) {
  // 노트 ID를 키로 사용하여 초기 값 계산
  const initialValues = useMemo(() => getFormValues(note), [note]);
  const [formValues, setFormValues] = useState<NoteFormValues>(initialValues);
  
  // 노트가 변경될 때 폼 값 동기화 (useMemo로 계산된 값 사용)
  if (formValues !== initialValues && !isEditing) {
    setFormValues(initialValues);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: NoteColor) => {
    setFormValues((prev) => ({ ...prev, color }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formValues);
  };

  const handleDelete = () => {
    if (note && onDelete) {
      if (window.confirm('이 노트를 삭제하시겠습니까?')) {
        onDelete(note.id);
      }
    }
  };

  // 빈 상태 (노트가 선택되지 않고 편집 모드도 아닐 때)
  if (!note && !isEditing) {
    return (
      <div className={styles.editor}>
        <div className={styles.emptyState}>
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <h3 className={styles.emptyTitle}>노트를 선택하세요</h3>
          <p className={styles.emptyDescription}>
            왼쪽 목록에서 노트를 선택하거나
            <br />
            새 노트를 작성해보세요.
          </p>
        </div>
      </div>
    );
  }

  // 읽기 모드
  if (note && !isEditing) {
    return (
      <div className={styles.editor}>
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>노트 상세</h2>
          <div className={styles.headerActions}>
            <Button variant="ghost" size="small" onClick={onEdit}>
              수정
            </Button>
            <Button 
              variant="ghost" 
              size="small" 
              onClick={handleDelete}
            >
              삭제
            </Button>
          </div>
        </header>

        <div className={styles.form}>
          <h1 className={styles.titleInput} style={{ cursor: 'default' }}>
            {note.title || '제목 없음'}
          </h1>

          <div className={styles.contentWrapper}>
            <div
              className={styles.contentTextarea}
              style={{ 
                whiteSpace: 'pre-wrap', 
                cursor: 'default',
                overflow: 'auto',
              }}
            >
              {note.content || '내용 없음'}
            </div>
          </div>

          <div className={styles.metaSection}>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>카테고리</span>
              <span className={styles.fieldInput} style={{ background: 'transparent' }}>
                {note.category || '-'}
              </span>
            </div>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>태그</span>
              <span className={styles.fieldInput} style={{ background: 'transparent' }}>
                {note.tags.length > 0 ? note.tags.map((t) => `#${t}`).join(' ') : '-'}
              </span>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerInfo}>
            <div>생성: {formatDate(note.createdAt)}</div>
            <div>수정: {formatDate(note.updatedAt)}</div>
          </div>
        </footer>
      </div>
    );
  }

  // 편집/생성 모드
  return (
    <div className={styles.editor}>
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>
          {note ? '노트 수정' : '새 노트'}
        </h2>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          className={styles.titleInput}
          placeholder="제목을 입력하세요"
          value={formValues.title}
          onChange={handleChange}
          autoFocus
        />

        <div className={styles.contentWrapper}>
          <textarea
            name="content"
            className={styles.contentTextarea}
            placeholder="내용을 입력하세요..."
            value={formValues.content}
            onChange={handleChange}
          />
        </div>

        <div className={styles.metaSection}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="category">
              카테고리
            </label>
            <input
              type="text"
              id="category"
              name="category"
              className={styles.fieldInput}
              placeholder="예: 학습, 업무, 아이디어"
              value={formValues.category}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="tags">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              className={styles.fieldInput}
              placeholder="예: React, TypeScript, 프론트엔드"
              value={formValues.tags}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>색상</span>
          <div className={styles.colorPicker}>
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`${styles.colorOption} ${
                  formValues.color === color ? styles.selected : ''
                }`}
                data-color={color}
                onClick={() => handleColorChange(color)}
                aria-label={`색상: ${color}`}
                title={color}
              />
            ))}
          </div>
        </div>
      </form>

      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          {note && (
            <>수정 중: {note.title || '제목 없음'}</>
          )}
        </div>
        <div className={styles.footerActions}>
          <Button variant="ghost" onClick={onCancel}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            저장
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default NoteEditor;
