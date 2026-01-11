/**
 * 회원가입 페이지 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { AuthProvider } from '../../features/auth';
import { Register } from './Register';
import { resetAuthState } from '../../mocks/handlers/auth';

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/notes" element={<div>노트 페이지</div>} />
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Register 페이지', () => {
  beforeEach(() => {
    localStorage.clear();
    resetAuthState();
  });

  describe('렌더링', () => {
    it('회원가입 폼이 표시된다', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument();
      });

      expect(screen.getByLabelText('이름')).toBeInTheDocument();
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
    });

    it('로그인 링크가 표시된다', async () => {
      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument();
      });
    });
  });

  describe('폼 유효성 검증', () => {
    it('빈 이름으로 제출하면 에러가 표시된다', async () => {
      const user = userEvent.setup();
      renderRegister();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '회원가입' }));

      expect(screen.getByText('이름을 입력해주세요.')).toBeInTheDocument();
    });

    it('짧은 이름이면 에러가 표시된다', async () => {
      const user = userEvent.setup();
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText('이름')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('이름'), '가');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      expect(screen.getByText('이름은 2자 이상이어야 합니다.')).toBeInTheDocument();
    });

    it('비밀번호가 일치하지 않으면 에러가 표시된다', async () => {
      const user = userEvent.setup();
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('이름'), '테스트 사용자');
      await user.type(screen.getByLabelText('이메일'), 'new@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'different123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
    });
  });

  describe('회원가입 기능', () => {
    it('올바른 정보로 회원가입하면 노트 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText('이름')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('이름'), '새 사용자');
      await user.type(screen.getByLabelText('이메일'), 'new@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'newpassword123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'newpassword123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(screen.getByText('노트 페이지')).toBeInTheDocument();
      });
    });

    it('이미 존재하는 이메일로 회원가입하면 에러가 표시된다', async () => {
      const user = userEvent.setup();
      renderRegister();

      await waitFor(() => {
        expect(screen.getByLabelText('이름')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('이름'), '테스트 사용자');
      await user.type(screen.getByLabelText('이메일'), 'test@example.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
      });
    });
  });
});
