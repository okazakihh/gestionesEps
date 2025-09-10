// Script simple para probar la conexión al backend
console.log('Testing API connection...');

const API_URL = 'http://localhost:8080/api/api/auth/login';
const loginData = {
  email: 'admin@ipsdemo.co',
  password: 'admin123'
};

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Login successful:', data);
  if (data.success) {
    console.log('🎉 JWT Token:', data.data.accessToken.substring(0, 50) + '...');
    console.log('👤 User:', data.data.user.name);
  }
})
.catch(error => {
  console.error('❌ Login failed:', error);
});
