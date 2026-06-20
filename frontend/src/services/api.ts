import axios from 'axios';

// Unified Ingress or local multi-port configurations
const PORTS = {
  auth: '5001',
  user: '5002',
  diet: '5003',
  workout: '5004',
  chat: '5005',
  progress: '5006',
  exercise: '8001',
  food: '8002'
};

const getBaseUrl = (service: keyof typeof PORTS) => {
  return `/api/${service}`;
};

// Axios instances mapping
const createInstance = (service: keyof typeof PORTS) => {
  const instance = axios.create({
    baseURL: getBaseUrl(service)
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

const authApi = createInstance('auth');
const userApi = createInstance('user');
const dietApi = createInstance('diet');
const workoutApi = createInstance('workout');
const chatApi = createInstance('chat');
const progressApi = createInstance('progress');
const exerciseApi = createInstance('exercise');

export const api = {
  auth: {
    register: (email: string, password: string) => authApi.post('/register', { email, password }),
    login: (email: string, password: string) => authApi.post('/login', { email, password }),
    refreshToken: (token: string) => authApi.post('/refresh-token', { token }),
    forgotPassword: (email: string) => authApi.post('/forgot-password', { email }),
    verifyOtp: (email: string, otp: string) => authApi.post('/verify-otp', { email, otp })
  },
  profile: {
    get: () => userApi.get('/profile'),
    create: (data: any) => userApi.post('/profile', data),
    update: (data: any) => userApi.put('/profile', data)
  },
  diet: {
    getLatest: () => dietApi.get('/'),
    generate: (data: { height: number; weight: number; age: number; gender: string; activityLevel: string; fitnessGoal: string }) => dietApi.post('/generate', data),
    substitute: (mealName: string, currentItem: string) => dietApi.post('/substitute', { mealName, currentItem })
  },
  workout: {
    getLatest: () => workoutApi.get('/'),
    generate: (type: 'home' | 'gym', goal: string) => workoutApi.post('/generate', { type, goal })
  },
  chat: {
    getHistory: () => chatApi.get('/'),
    askCoach: (message: string) => chatApi.post('/', { message }),
    clearHistory: () => chatApi.delete('/')
  },
  progress: {
    getHistory: () => progressApi.get('/'),
    log: (weight: number, height: number) => progressApi.post('/', { weight, height }),
    predict: (goal: string) => progressApi.get(`/predict?goal=${goal}`)
  },
  exercise: {
    getHistory: (userId: string) => exerciseApi.get(`/exercise/history/${userId}`),
    analyze: (userId: string, exercise: string, file: File) => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('exercise', exercise);
      formData.append('file', file);
      return exerciseApi.post('/analyze-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    uploadLiveSession: (userId: string, exercise: string, file: File, repCount: number, formAccuracy: number, feedback: string) => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('exercise', exercise);
      formData.append('file', file);
      formData.append('rep_count', repCount.toString());
      formData.append('form_accuracy', formAccuracy.toString());
      formData.append('feedback', feedback);
      return exerciseApi.post('/upload-live-session', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  }
};
