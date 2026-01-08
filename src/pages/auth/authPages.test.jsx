import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RegisterPage from './RegisterPage.jsx';
import LoginPage from './LoginPage.jsx';
import ForgotPasswordPage from './ForgotPasswordPage.jsx';
import { requestEmailOtp, verifyEmailOtp } from '@/services/firebase/emailOtp';

const navigateSpy = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateSpy,
    useLocation: () => ({ state: { from: '/profile' } })
  };
});

const signUp = vi.fn();
const signIn = vi.fn();
const resetPassword = vi.fn();
const checkUsernameAvailability = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuthOperations: () => ({
    signUp,
    signIn,
    resetPassword,
    checkUsernameAvailability,
    loading: false,
    error: null
  })
}));

vi.mock('@/utils/sound', () => ({
  playClick: vi.fn(),
  playHover: vi.fn()
}));

vi.mock('@/services/firebase/emailOtp', () => ({
  requestEmailOtp: vi.fn(),
  verifyEmailOtp: vi.fn()
}));

describe('Auth Pages', () => {
  const renderWithRouter = (ui) => render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {ui}
    </MemoryRouter>
  );

  beforeEach(() => {
    navigateSpy.mockClear();
    signUp.mockReset();
    signIn.mockReset();
    resetPassword.mockReset();
    checkUsernameAvailability.mockReset();
    requestEmailOtp.mockReset();
    verifyEmailOtp.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers a user and navigates to dashboard', async () => {
    signUp.mockResolvedValue({ success: true });
    checkUsernameAvailability.mockResolvedValue(true);
    requestEmailOtp.mockResolvedValue({ expiresAt: null });
    verifyEmailOtp.mockResolvedValue({ verified: true });

    renderWithRouter(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/choose a username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'test@example.com' }
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });
    await waitFor(() => {
      expect(checkUsernameAvailability).toHaveBeenCalledWith('testuser');
    });

    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));
    await waitFor(() => {
      expect(requestEmailOtp).toHaveBeenCalledWith('test@example.com');
    });

    fireEvent.change(await screen.findByPlaceholderText(/000000/i), {
      target: { value: '123456' }
    });
    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    fireEvent.change(await screen.findByPlaceholderText(/create a password/i), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), {
      target: { value: 'Password123!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      });
      expect(requestEmailOtp).toHaveBeenCalledWith('test@example.com');
      expect(verifyEmailOtp).toHaveBeenCalledWith('test@example.com', '123456');
      expect(navigateSpy).toHaveBeenCalledWith('/');
    });
  }, 15000);

  it('logs in with email and navigates to previous page', async () => {
    signIn.mockResolvedValue({ success: true });
    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.change(await screen.findByPlaceholderText(/password/i), {
      target: { value: 'Password123!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('test@example.com', 'Password123!');
      expect(navigateSpy).toHaveBeenCalledWith('/profile', { replace: true });
    });
  });

  it('sends reset email for valid address', async () => {
    resetPassword.mockResolvedValue({ success: true });
    renderWithRouter(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'reset@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith('reset@example.com');
    });
    expect(screen.getByText(/reset link sent/i)).toBeInTheDocument();
  });
});
