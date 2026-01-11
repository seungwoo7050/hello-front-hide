import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Sidebar', () => {
  it('네비게이션 링크를 렌더링한다', () => {
    renderWithRouter(<Sidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: /홈/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Playground/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /About/ })).toBeInTheDocument();
  });

  it('aria-label이 설정되어 있다', () => {
    renderWithRouter(<Sidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('complementary', { name: '사이드바 네비게이션' })).toBeInTheDocument();
  });

  it('링크 클릭 시 onClose를 호출한다', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    renderWithRouter(<Sidebar isOpen={true} onClose={handleClose} />);

    const homeLink = screen.getByRole('link', { name: /홈/ });
    await user.click(homeLink);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('커스텀 섹션을 렌더링할 수 있다', () => {
    const customSections = [
      {
        title: '커스텀',
        items: [{ path: '/custom', label: '커스텀 링크' }],
      },
    ];
    renderWithRouter(
      <Sidebar isOpen={true} onClose={vi.fn()} sections={customSections} />
    );

    expect(screen.getByText('커스텀')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '커스텀 링크' })).toBeInTheDocument();
  });

  it('오버레이가 렌더링된다', () => {
    const { container } = renderWithRouter(
      <Sidebar isOpen={true} onClose={vi.fn()} />
    );
    // 오버레이 div가 존재하는지 확인
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
