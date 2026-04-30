import { auth } from '../auth/Auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get the current Firebase ID token
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Make an authenticated API request
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * API Service for tasks
 */
export const taskAPI = {
  // Get all tasks for the authenticated user
  async getTasks(search?: string): Promise<any> {
    const url = new URL(`${API_BASE_URL}/tasks`);
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await authenticatedFetch(`/tasks?${url.searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  // Create a new task
  async createTask(taskData: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    due_date?: string | null;
  }): Promise<any> {
    const response = await authenticatedFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  },

  // Update task status
  async updateTaskStatus(taskId: string, status: string): Promise<any> {
    const response = await authenticatedFetch('/tasks/status', {
      method: 'PUT',
      body: JSON.stringify({ taskId, status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task status');
    }
    return response.json();
  },

  // Update full task
  async updateTask(taskId: string, taskData: any): Promise<any> {
    const response = await authenticatedFetch('/tasks', {
      method: 'PUT',
      body: JSON.stringify({ taskId, ...taskData }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<any> {
    const response = await authenticatedFetch('/tasks', {
      method: 'DELETE',
      body: JSON.stringify({ taskId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || 'Failed to delete task');
    }
    return response.json();
  },

  // Get all accessible tasks (owned + shared)
  async getAccessibleTasks(search?: string): Promise<any> {
    const url = new URL(`${API_BASE_URL}/tasks/accessible`);
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await authenticatedFetch(`/tasks/accessible?${url.searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch accessible tasks');
    }
    return response.json();
  },

  // Share a task with another user
  async shareTask(taskId: string, email: string, permission: string = 'view'): Promise<any> {
    const response = await authenticatedFetch('/tasks/share', {
      method: 'POST',
      body: JSON.stringify({ taskId, email, permission }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || 'Failed to share task');
    }
    return response.json();
  },

  // Unshare a task
  async unshareTask(taskId: string, email: string): Promise<any> {
    const response = await authenticatedFetch('/tasks/unshare', {
      method: 'POST',
      body: JSON.stringify({ taskId, email }),
    });
    if (!response.ok) {
      throw new Error('Failed to unshare task');
    }
    return response.json();
  },

  // Get all shares for a task
  async getTaskShares(taskId: string): Promise<any> {
    const response = await authenticatedFetch(`/tasks/shares?taskId=${taskId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch task shares');
    }
    return response.json();
  },
};

/**
 * API Service for analytics
 */
export const analyticsAPI = {
  async getTaskStats(): Promise<any> {
    const response = await authenticatedFetch('/analytics/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch task stats');
    }
    return response.json();
  },

  async getStatusBreakdown(): Promise<any> {
    const response = await authenticatedFetch('/analytics/status-breakdown');
    if (!response.ok) {
      throw new Error('Failed to fetch status breakdown');
    }
    return response.json();
  },

  async getPriorityBreakdown(): Promise<any> {
    const response = await authenticatedFetch('/analytics/priority-breakdown');
    if (!response.ok) {
      throw new Error('Failed to fetch priority breakdown');
    }
    return response.json();
  },

  async getCompletionTrends(days?: number): Promise<any> {
    const url = new URL(`${API_BASE_URL}/analytics/completion-trends`);
    if (days) {
      url.searchParams.append('days', days.toString());
    }
    const response = await authenticatedFetch(
      `/analytics/completion-trends?${url.searchParams.toString()}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch completion trends');
    }
    return response.json();
  },

  async getPerformanceMetrics(): Promise<any> {
    const response = await authenticatedFetch('/analytics/performance-metrics');
    if (!response.ok) {
      throw new Error('Failed to fetch performance metrics');
    }
    return response.json();
  },

  async getTeamPerformance(): Promise<any> {
    const response = await authenticatedFetch('/analytics/team-performance');
    if (!response.ok) {
      throw new Error('Failed to fetch team performance');
    }
    return response.json();
  },
};

/**
 * API Service for authentication
 */
export const authAPI = {
  async registerUser(): Promise<any> {
    const response = await authenticatedFetch('/auth/register', {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to register user');
    }
    return response.json();
  },

  async getCurrentUser(): Promise<any> {
    const response = await authenticatedFetch('/auth/me');
    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }
    return response.json();
  },
};
