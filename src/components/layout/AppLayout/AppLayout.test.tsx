import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

// 라우터 context가 필요한 컴포넌트를 위한 래퍼
const renderWithRouter = (
  ui: React.ReactElement,
  initialEntries: string[] = ['/']
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  );
};

describe('AppLayout', () => {
  it('헤더를 렌더링한다', () => {
    renderWithRouter(<AppLayout />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('사이드바를 렌더링한다', () => {
    renderWithRouter(<AppLayout showSidebar={true} />);
    expect(screen.getByRole('complementary', { name: '사이드바 네비게이션' })).toBeInTheDocument();
  });

  it('showSidebar가 false이면 사이드바를 렌더링하지 않는다', () => {
    renderWithRouter(<AppLayout showSidebar={false} />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('메인 영역을 렌더링한다', () => {
    renderWithRouter(<AppLayout />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('푸터를 렌더링한다', () => {
    renderWithRouter(<AppLayout showFooter={true} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('showFooter가 false이면 푸터를 렌더링하지 않는다', () => {
    renderWithRouter(<AppLayout showFooter={false} />);
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('모바일 메뉴 버튼으로 사이드바를 토글할 수 있다', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AppLayout />);

    const menuButton = screen.getByRole('button', { name: '메뉴 열기' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);
    expect(screen.getByRole('button', { name: '메뉴 닫기' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});
