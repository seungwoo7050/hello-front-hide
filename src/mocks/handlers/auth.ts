/**
 * 인증 API MSW 핸들러
 */
import { http, HttpResponse, delay } from 'msw';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../../features/auth/types';

/** 테스트용 사용자 데이터 */
interface StoredUser extends User {
  password: string;
}

let users: StoredUser[] = [
  {
    id: 'user-1',
    email: 'test@example.com',
    password: 'password123',
    name: '테스트 사용자',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

let currentUserId: string | null = null;

/** 테스트용 리셋 함수 */
export function resetAuthState(): void {
  users = [
    {
      id: 'user-1',
      email: 'test@example.com',
      password: 'password123',
      name: '테스트 사용자',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ];
  currentUserId = null;
}

/** 토큰 생성 */
function generateToken(): string {
  return `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** 사용자 응답 생성 (비밀번호 제외) */
function toUserResponse(user: StoredUser): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export const authHandlers = [
  // 로그인
  http.post('/api/auth/login', async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as LoginRequest;
    const { email, password } = body;

    const user = users.find((u) => u.email === email);

    if (!user || user.password !== password) {
      return HttpResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    currentUserId = user.id;

    const response: AuthResponse = {
      user: toUserResponse(user),
      tokens: {
        accessToken: generateToken(),
        refreshToken: generateToken(),
      },
    };

    return HttpResponse.json(response);
  }),

  // 회원가입
  http.post('/api/auth/register', async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as RegisterRequest;
    const { email, password, name } = body;

    // 이메일 중복 체크
    if (users.some((u) => u.email === email)) {
      return HttpResponse.json(
        { message: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    currentUserId = newUser.id;

    const response: AuthResponse = {
      user: toUserResponse(newUser),
      tokens: {
        accessToken: generateToken(),
        refreshToken: generateToken(),
      },
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // 로그아웃
  http.post('/api/auth/logout', async () => {
    await delay(100);
    currentUserId = null;
    return HttpResponse.json({ message: '로그아웃되었습니다.' });
  }),

  // 현재 사용자 정보
  http.get('/api/auth/me', async ({ request }) => {
    await delay(200);

    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!currentUserId) {
      return HttpResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = users.find((u) => u.id === currentUserId);

    if (!user) {
      return HttpResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(toUserResponse(user));
  }),

  // 토큰 갱신
  http.post('/api/auth/refresh', async ({ request }) => {
    await delay(200);

    const body = (await request.json()) as { refreshToken: string };

    if (!body.refreshToken) {
      return HttpResponse.json(
        { message: '리프레시 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!currentUserId) {
      return HttpResponse.json(
        { message: '인증이 만료되었습니다.' },
        { status: 401 }
      );
    }

    const user = users.find((u) => u.id === currentUserId);

    if (!user) {
      return HttpResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const response: AuthResponse = {
      user: toUserResponse(user),
      tokens: {
        accessToken: generateToken(),
        refreshToken: generateToken(),
      },
    };

    return HttpResponse.json(response);
  }),
];
