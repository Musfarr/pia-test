import { useState } from 'react';
import { login } from '../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { SetLoginData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {

      try {
        const result = await login(email, password);
        console.log(result);

        if (result.status === true || result.status === "success") { // Be specific
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Login successful',
          });
          SetLoginData(result.data);
          navigate('/dashboard');
        }

        else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid credentials',
            text: result.message,
          });
        }

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid credentials',
          text: error.response.data.message,
        });
        console.log(error);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className='col-12 col-lg-6 d-flex justify-content-center justify-content-lg-start align-items-center mb-4 mb-lg-0'>
            
            <img src="sidebarlogo.svg" className='login-logo img-fluid' alt="" />
            {/* <h1>AI Voice Analytics</h1> */}
            
          </div>
          <div className="col-12 col-lg-6 d-flex justify-content-center align-items-center">
            <div className="card login-card">
              <div className="card-body p-5 ">
                <div className="text-center mb-4">
                  {/* <img src="favicon.ico" alt="" style={{ width: '2em' }} /> */}
                  {/* <i className="bi bi-headset" style={{ fontSize: '3rem', color: 'var(--navy-dark)' }}></i> */}
                  <h2 className="mt-3 fw-bold">AI Voice Analytics</h2>
                  <p className="text-muted">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-100">
                    Sign In
                  </button>
                </form>

                <div className="text-center mt-3">
                  <small className="text-muted">Powered by Convex Interactive</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
