import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/admin/login', {
        email,
        password
      });

      const data = response.data;

      console.log(data);


      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      if (data.organization?.subdomain) {
        const { protocol, host } = window.location;
        let orgUrl;

        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          const port = host.includes(':') ? ':' + host.split(':')[1] : '';
          orgUrl = `${protocol}//${data.organization.subdomain}.localhost${port}`;
        } else {
          const baseDomain = host.split('.').slice(-2).join('.');
          orgUrl = `${protocol}//${data.organization.subdomain}.${baseDomain}`;
        }

        window.location.href = orgUrl;
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
      <div className="bg-white rounded-xl p-10 w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Organization Login</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Sign in to your organization account</p>

        {error && <div className="bg-red-100 text-red-700 px-3 py-3 rounded-md mb-5 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 box-border"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 box-border"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
