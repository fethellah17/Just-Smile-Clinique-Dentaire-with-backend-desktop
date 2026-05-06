// API configuration and service functions
const API_BASE_URL = 'http://localhost:3000/api';

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Try to get detailed error from server
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = errorData.details 
        ? `${errorData.error}: ${errorData.details}` 
        : errorData.error || `HTTP ${response.status}`;
      
      console.error(`❌ API Error [${endpoint}]:`, {
        status: response.status,
        error: errorData,
      });
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Category API functions
export const categoryApi = {
  getAll: () => apiFetch<any[]>('/categories'),
  
  getById: (id: string) => apiFetch<any>(`/categories/${id}`),
  
  create: (category: any) => apiFetch<any>('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  }),
  
  update: (id: string, updates: any) => apiFetch<any>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiFetch<{ message: string }>(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Patient API functions
export const patientApi = {
  getAll: () => apiFetch<any[]>('/patients'),
  
  getById: (id: string) => apiFetch<any>(`/patients/${id}`),
  
  create: (patient: any) => apiFetch<any>('/patients', {
    method: 'POST',
    body: JSON.stringify(patient),
  }),
  
  update: (id: string, updates: any) => apiFetch<any>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiFetch<{ message: string }>(`/patients/${id}`, {
    method: 'DELETE',
  }),
};

// Rendez-vous API functions
export const rendezVousApi = {
  // Get active appointments (archived = 0)
  getAll: () => apiFetch<any[]>('/rendez-vous'),
  
  // Get archived appointments (archived = 1)
  getHistory: () => apiFetch<any[]>('/rendez-vous/history'),
  
  getById: (id: string) => apiFetch<any>(`/rendez-vous/${id}`),
  
  create: (rendezVous: any) => apiFetch<any>('/rendez-vous', {
    method: 'POST',
    body: JSON.stringify(rendezVous),
  }),
  
  update: (id: string, updates: any) => apiFetch<any>(`/rendez-vous/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiFetch<{ message: string }>(`/rendez-vous/${id}`, {
    method: 'DELETE',
  }),
  
  archiveByDate: (date: string) => apiFetch<{ message: string; count: number; date: string }>('/rendez-vous/archive-day', {
    method: 'PUT',
    body: JSON.stringify({ date }),
  }),
  
  getDashboardStats: () => apiFetch<{
    totalPatients: number;
    todayAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
  }>('/rendez-vous/stats/dashboard'),
};

// Passages Directs API functions
export const passageDirectApi = {
  getAll: () => apiFetch<any[]>('/passages-directs'),
  
  getById: (id: string) => apiFetch<any>(`/passages-directs/${id}`),
  
  create: (passage: any) => apiFetch<any>('/passages-directs', {
    method: 'POST',
    body: JSON.stringify(passage),
  }),
  
  update: (id: string, updates: any) => apiFetch<any>(`/passages-directs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  delete: (id: string) => apiFetch<{ message: string }>(`/passages-directs/${id}`, {
    method: 'DELETE',
  }),
};

// Check if API is online
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/health');
    return response.ok;
  } catch {
    return false;
  }
}

// Auth API functions
export const authApi = {
  login: (email: string, password: string) => apiFetch<{ success: boolean; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  updatePassword: (email: string, oldPassword: string, newPassword: string) => 
    apiFetch<{ success: boolean; message: string }>('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify({ email, oldPassword, newPassword }),
    }),
  
  resetPassword: (email: string, recoveryCode: string) => 
    apiFetch<{ success: boolean; message: string; defaultPassword: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, recoveryCode }),
    }),
};
