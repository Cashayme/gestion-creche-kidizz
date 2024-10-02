import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  config => {
    const username = localStorage.getItem('username')
    if (username) {
      config.headers['X-Auth'] = username
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default apiClient
