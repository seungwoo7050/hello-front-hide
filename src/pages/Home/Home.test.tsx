import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Home } from './Home';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Home', () => {
  it('히어로 섹션을 렌더링한다', () => {
    renderWithRouter(<Home />);
    expect(screen.getByRole('heading', { name: /Hello Front/i })).toBeInTheDocument();
  });

  it('히어로 설명을 표시한다', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/React \+ TypeScript 학습 여정/i)).toBeInTheDocument();
  });

  it('CTA 버튼들을 렌더링한다', () => {
    renderWithRouter(<Home />);
    expect(screen.getByRole('link', { name: /Playground 둘러보기/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /프로젝트 소개/i })).toBeInTheDocument();
  });

  it('기능 카드들을 렌더링한다', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('주요 기능')).toBeInTheDocument();
    expect(screen.getByText('UI Kit')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React Router')).toBeInTheDocument();
    expect(screen.getByText('반응형 디자인')).toBeInTheDocument();
    expect(screen.getByText('CSS Modules')).toBeInTheDocument();
    expect(screen.getByText('테스트')).toBeInTheDocument();
  });

  it('CTA 링크가 올바른 경로를 가진다', () => {
    renderWithRouter(<Home />);
    const playgroundLink = screen.getByRole('link', { name: /Playground 둘러보기/i });
    const aboutLink = screen.getByRole('link', { name: /프로젝트 소개/i });

    expect(playgroundLink).toHaveAttribute('href', '/playground');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });
});
