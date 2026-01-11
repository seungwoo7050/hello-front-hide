import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('textarea 요소를 렌더링한다', () => {
    render(<Textarea placeholder="입력하세요" />);
    
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });

  it('레이블을 렌더링한다', () => {
    render(<Textarea label="설명" />);
    
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
  });

  it('필수 필드 표시를 렌더링한다', () => {
    const { container } = render(<Textarea label="필수 입력" required />);
    
    const label = container.querySelector('label');
    expect(label?.className).toMatch(/required/);
  });

  it('에러 메시지를 표시한다', () => {
    render(<Textarea label="입력" error="에러가 발생했습니다" />);
    
    expect(screen.getByText('에러가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByLabelText('입력')).toHaveAttribute('aria-invalid', 'true');
  });

  it('도움말 텍스트를 표시한다', () => {
    render(<Textarea label="입력" helperText="도움말 텍스트입니다" />);
    
    expect(screen.getByText('도움말 텍스트입니다')).toBeInTheDocument();
  });

  it('에러가 있으면 도움말 대신 에러를 표시한다', () => {
    render(
      <Textarea 
        label="입력" 
        error="에러 메시지" 
        helperText="도움말 텍스트" 
      />
    );
    
    expect(screen.getByText('에러 메시지')).toBeInTheDocument();
    expect(screen.queryByText('도움말 텍스트')).not.toBeInTheDocument();
  });

  it('글자 수를 표시할 수 있다', () => {
    render(
      <Textarea 
        label="메시지" 
        showCharCount 
        maxLength={100}
        value="안녕하세요"
        onChange={() => {}}
      />
    );
    
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('입력 시 onChange가 호출된다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Textarea label="입력" onChange={handleChange} />);
    
    await user.type(screen.getByLabelText('입력'), '테스트');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('disabled 상태에서는 입력이 불가능하다', () => {
    render(<Textarea label="입력" disabled />);
    
    expect(screen.getByLabelText('입력')).toBeDisabled();
  });

  it('rows 속성으로 높이를 조절할 수 있다', () => {
    render(<Textarea label="입력" rows={10} />);
    
    expect(screen.getByLabelText('입력')).toHaveAttribute('rows', '10');
  });

  it('resize 속성을 지정할 수 있다', () => {
    render(<Textarea label="입력" resize="none" />);
    
    const textarea = screen.getByLabelText('입력');
    expect(textarea).toHaveStyle({ resize: 'none' });
  });

  it('추가 className을 적용할 수 있다', () => {
    const { container } = render(<Textarea className="custom-textarea" />);
    
    expect(container.firstChild).toHaveClass('custom-textarea');
  });
});
