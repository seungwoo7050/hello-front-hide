import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('메시지를 렌더링한다', () => {
    render(<Toast id="test-1" message="테스트 메시지" onClose={() => {}} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
  });

  it('타이틀이 있으면 표시한다', () => {
    render(<Toast id="test-2" message="메시지" title="제목" onClose={() => {}} />);
    
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('메시지')).toBeInTheDocument();
  });

  it('success 타입 토스트를 렌더링한다', () => {
    render(<Toast id="test-3" message="성공!" type="success" onClose={() => {}} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('error 타입 토스트를 렌더링한다', () => {
    render(<Toast id="test-4" message="오류!" type="error" onClose={() => {}} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('warning 타입 토스트를 렌더링한다', () => {
    render(<Toast id="test-5" message="경고!" type="warning" onClose={() => {}} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('info 타입 토스트를 렌더링한다', () => {
    render(<Toast id="test-6" message="정보!" type="info" onClose={() => {}} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Toast id="test-7" message="메시지" onClose={onClose} closable duration={0} />);
    
    const closeButton = screen.getByRole('button', { name: /닫기/i });
    await user.click(closeButton);
    
    // 애니메이션 시간 대기 (200ms)
    await new Promise(resolve => setTimeout(resolve, 250));
    
    expect(onClose).toHaveBeenCalledWith('test-7');
  });

  it('closable이 false면 닫기 버튼이 없다', () => {
    render(<Toast id="test-8" message="메시지" onClose={() => {}} closable={false} />);
    
    expect(screen.queryByRole('button', { name: /닫기/i })).not.toBeInTheDocument();
  });

  it('duration 후에 자동으로 닫힌다', async () => {
    const onClose = vi.fn();
    
    render(<Toast id="test-9" message="메시지" duration={3000} onClose={onClose} />);
    
    expect(onClose).not.toHaveBeenCalled();
    
    // duration 타이머
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    
    // 애니메이션 타이머 (200ms)
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    
    expect(onClose).toHaveBeenCalledWith('test-9');
  });

  it('duration이 0이면 자동으로 닫히지 않는다', async () => {
    const onClose = vi.fn();
    
    render(<Toast id="test-10" message="메시지" duration={0} onClose={onClose} />);
    
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });
    
    expect(onClose).not.toHaveBeenCalled();
  });
});
