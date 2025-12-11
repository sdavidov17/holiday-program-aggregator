import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TestLogin() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = '/';
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Logged in!</h1>
        <p>Email: {session.user?.email}</p>
        <p>Role: {session.user?.role}</p>
        <button
          onClick={() => {
            window.location.href = '/admin/bmad-dashboard';
          }}
        >
          Go to BMAD Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Test Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
            />
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px' }}>
          Login
        </button>
      </form>
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <p>
          <strong>Test Credentials:</strong>
        </p>
        <p>Email: admin@test.com</p>
        <p>Password: Admin123!</p>
      </div>
    </div>
  );
}
