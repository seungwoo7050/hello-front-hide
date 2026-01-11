import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Main } from './Main';

describe('Main', () => {
  it('자식 요소를 렌더링한다', () => {
    render(
      <Main>
        <div data-testid="child">테스트 콘텐츠</div>
      </Main>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('테스트 콘텐츠')).toBeInTheDocument();
  });

  it('main 역할을 가진다', () => {
    render(<Main>콘텐츠</Main>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('추가 className을 적용할 수 있다', () => {
    render(<Main className="custom-class">콘텐츠</Main>);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('custom-class');
  });
});
