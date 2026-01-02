const API_BASE = 'http://localhost:3000/api';

function setToken(token) {
  localStorage.setItem('nowhere_token', token);
}

function getToken() {
  return localStorage.getItem('nowhere_token');
}

function clearToken() {
  localStorage.removeItem('nowhere_token');
}

async function register(username, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Registration failed');
  }
  
  const data = await res.json();
  setToken(data.token);
  return data;
}

async function login(emailOrUsername, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password })
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login failed');
  }
  
  const data = await res.json();
  setToken(data.token);
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const authModal = document.getElementById('auth-modal');
  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-title');
  const identifierInput = document.getElementById('au-identifier');
  const passwordInput = document.getElementById('au-password');
  const authSubmit = document.getElementById('auth-submit');
  const authToggle = document.getElementById('auth-toggle');
  
  let isLogin = true;
  
  const token = getToken();
  if (token) {
    authModal.style.display = 'none';
    if (window.__nowhere_onAuth) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      window.__nowhere_onAuth(token, { id: decoded.userId });
    }
  } else {
    authModal.style.display = 'flex';
  }
  
  function updateForm() {
    if (isLogin) {
      authTitle.textContent = 'Login';
      authSubmit.textContent = 'Login';
      authToggle.textContent = 'Switch to Register';
    } else {
      authTitle.textContent = 'Register';
      authSubmit.textContent = 'Register';
      authToggle.textContent = 'Switch to Login';
    }
  }
  
  authToggle.addEventListener('click', () => {
    isLogin = !isLogin;
    updateForm();
  });
  
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;
    
    if (!identifier || !password) {
      alert('Please fill all fields');
      return;
    }
    
    authSubmit.disabled = true;
    authSubmit.textContent = 'Please wait...';
    
    try {
      let data;
      if (isLogin) {
        data = await login(identifier, password);
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(identifier)) {
          const username = prompt('Please enter a username:');
          if (!username) {
            authSubmit.disabled = false;
            updateForm();
            return;
          }
          data = await register(username, identifier, password);
        } else {
          const email = prompt('Please enter your email:');
          if (!email) {
            authSubmit.disabled = false;
            updateForm();
            return;
          }
          data = await register(identifier, email, password);
        }
      }
      
      authModal.style.display = 'none';
      if (window.__nowhere_onAuth) {
        window.__nowhere_onAuth(data.token, data.user);
      }
    } catch (err) {
      alert(err.message);
      authSubmit.disabled = false;
      updateForm();
    }
  });
  
  updateForm();
});