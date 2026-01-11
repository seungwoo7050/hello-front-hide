import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../components/ui';
import { FormDemo } from './FormDemo';

const renderFormDemo = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <FormDemo />
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('FormDemo', () => {
  it('페이지 제목을 렌더링한다', () => {
    renderFormDemo();
    
    expect(screen.getByRole('heading', { name: /Form \+ Validation/i, level: 1 })).toBeInTheDocument();
  });

  it('토스트 알림 섹션을 렌더링한다', () => {
    renderFormDemo();
    
    expect(screen.getByRole('heading', { name: /Toast 알림/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '성공' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '오류' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '경고' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '정보' })).toBeInTheDocument();
  });

  it('문의 폼 섹션을 렌더링한다', () => {
    renderFormDemo();
    
    expect(screen.getByRole('heading', { name: /문의 폼/i, level: 2 })).toBeInTheDocument();
  });

  it('폼 필드들을 렌더링한다', () => {
    renderFormDemo();
    
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText(/문의 유형/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/메시지/i)).toBeInTheDocument();
    expect(screen.getByText(/새로운 소식과 업데이트/i)).toBeInTheDocument();
  });

  it('토스트 버튼 클릭 시 토스트가 표시된다', async () => {
    const user = userEvent.setup();
    renderFormDemo();
    
    await user.click(screen.getByRole('button', { name: '성공' }));
    
    expect(screen.getByText('작업이 성공적으로 완료되었습니다.')).toBeInTheDocument();
  });

  it('폼 유효성 검사가 동작한다', async () => {
    const user = userEvent.setup();
    renderFormDemo();
    
    // 이름 필드에 포커스 후 blur로 touched 상태 만들기
    const nameInput = screen.getByLabelText(/이름/i);
    await user.click(nameInput);
    await user.tab(); // blur
    
    // 유효성 검사 에러 메시지가 표시되어야 함
    expect(screen.getByText('이름을 입력해주세요')).toBeInTheDocument();
  });

  it('초기화 버튼이 dirty 상태에서만 활성화된다', async () => {
    const user = userEvent.setup();
    renderFormDemo();
    
    const resetButton = screen.getByRole('button', { name: '초기화' });
    expect(resetButton).toBeDisabled();
    
    // 폼에 입력
    await user.type(screen.getByLabelText(/이름/i), '테스트');
    
    expect(resetButton).not.toBeDisabled();
  });

  it('카테고리 선택 옵션들이 있다', () => {
    renderFormDemo();
    
    const select = screen.getByLabelText(/문의 유형/i);
    expect(select).toBeInTheDocument();
    
    expect(screen.getByRole('option', { name: '일반 문의' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '기술 지원' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '피드백' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '제휴 문의' })).toBeInTheDocument();
  });

  it('메시지 필드에 글자 수 카운터가 표시된다', () => {
    renderFormDemo();
    
    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });
});
