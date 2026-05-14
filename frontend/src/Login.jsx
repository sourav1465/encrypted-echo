import { useState } from 'react';
import axios from 'axios';

// NEW: Dynamic API URL for Vercel Deployment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      // NEW: Using dynamic API_URL
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: username,
        password: password
      });
      localStorage.setItem('token', response.data.token);
      setMessage('✅ Access Granted!');
      setTimeout(() => { window.location.href = '/dashboard'; }, 800);
    } catch (error) {
      setMessage('❌ Invalid Credentials');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes pan { from { background-position: 0 0; } to { background-position: 800px 800px; } }

          .login-wrapper {
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            display: flex; align-items: center; justify-content: center;
            background-color: #0f172a; 
            background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNDAwJyBoZWlnaHQ9JzQwMCcgdmlld0JveD0nMCAwIDQwMCA0MDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGcgZmlsbD0nIzM4YmRmOCcgZmlsbC1vcGFjaXR5PScwLjEnIGZvbnQtZmFtaWx5PSdBcmlhbCwgc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnPjx0ZXh0IHg9JzIwJyB5PSc1MCcgZm9udC1zaXplPScyNCc+4pyOPC90ZXh0Pjx0ZXh0IHg9JzE1MCcgeT0nNjAnIGZvbnQtc2l6ZT0nMjgnPiM8L3RleHQ+PHRleHQgeD0nMjgwJyB5PSc0MCcgZm9udC1zaXplPScyMic+8J+TljwvdGV4dD48dGV4dCB4PSczNTAnIHk9JzgwJyBmb250LXNpemU9JzIwJz5APC90ZXh0Pjx0ZXh0IHg9JzYwJyB5PScxNjAnIGZvbnQtc2l6ZT0nMjYnPvCfkaw8L3RleHQ+PHRleHQgeD0nMTgwJyB5PScxNDAnIGZvbnQtc2l6ZT0nMjAnPiZsdDsvJmd0OzwvdGV4dD48dGV4dCB4PSczMDAnIHk9JzE3MCcgZm9udC1zaXplPScyNCc+8J+SqDwvdGV4dD48dGV4dCB4PSc0MCcgeT0nMjcwJyBmb250LXNpemU9JzIyJz4iIjwvdGV4dD48dGV4dCB4PScxNDAnIHk9JzI4MCcgZm9udC1zaXplPScxOCc+4oyoPC90ZXh0Pjx0ZXh0IHg9JzI2MCcgeT0nMjYwJyBmb250LXNpemU9JzI2Jz7wn4OiPC90ZXh0Pjx0ZXh0IHg9JzM2MCcgeT0nMzAwJyBmb250LXNpemU9JzIwJz4jPC90ZXh0PjwvZz48L3N2Zz4=");
            animation: pan 60s linear infinite; font-family: 'Inter', sans-serif;
          }

          .glass-card {
            background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px);
            border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 28px;
            padding: 60px; width: 100%; max-width: 440px;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(56, 189, 248, 0.15);
            animation: fadeIn 0.8s ease-out; text-align: center;
          }

          h2 { color: #38bdf8; font-size: 32px; margin-bottom: 40px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
          
          .styled-input { 
            width: 100%; background: rgba(255, 255, 255, 0.08); 
            border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 14px; 
            padding: 16px 20px; color: white; font-size: 17px; 
            transition: all 0.3s ease; box-sizing: border-box; margin-bottom: 25px; 
          }
          .styled-input:focus { outline: none; border-color: #38bdf8; background: rgba(255, 255, 255, 0.12); box-shadow: 0 0 20px rgba(56, 189, 248, 0.4); }
          
          .login-btn { width: 100%; background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%); color: white; border: none; border-radius: 14px; padding: 18px; font-size: 17px; font-weight: 800; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 2px; margin-top: 15px; }
          .login-btn:hover { filter: brightness(1.15); transform: translateY(-3px); box-shadow: 0 12px 25px rgba(56, 189, 248, 0.5); }
          
          .password-container { position: relative; width: 100%; margin-bottom: 25px; }
          .password-container .styled-input { margin-bottom: 0; }
          
          .eye-btn { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 20px; opacity: 0.8; transition: opacity 0.2s; color: rgba(255,255,255,0.7); }
          .eye-btn:hover { opacity: 1; color: white; }
          
          .msg { margin-top: 30px; font-weight: 700; font-size: 15px; }
        `}
      </style>

      <div className="login-wrapper">
        <div className="glass-card">
          <h2>Encrypted Echo</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username" className="styled-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <div className="password-container">
              <input type={showPassword ? "text" : "password"} placeholder="Password" className="styled-input" style={{ paddingRight: '50px' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
            <button type="submit" className="login-btn">Secure Login</button>
          </form>
          <div className="msg" style={{ color: message.includes('❌') ? '#f43f5e' : '#10b981' }}>{message}</div>
          <div style={{ marginTop: '25px', fontSize: '15px', color: '#94a3b8' }}>
            New here? <a href="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>Create an account</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;