const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response;
};

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }).then(res => res.json()),

  register: (userData: { name: string; email: string; password: string }) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }).then(res => res.json()),

  getCurrentUser: () =>
    apiCall('/auth/me').then(res => res.json())
};

export const treeAPI = {
  getAllTrees: () =>
    apiCall('/trees').then(res => res.json()),

  createTree: (treeData: { name: string; description?: string }) =>
    apiCall('/trees', {
      method: 'POST',
      body: JSON.stringify(treeData)
    }).then(res => res.json()),

  getTree: (treeId: string) =>
    apiCall(`/trees/${treeId}`).then(res => res.json()),

  addCollaborator: (treeId: string, data: { email: string; permissions?: string }) =>
    apiCall(`/trees/${treeId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(res => res.json()),

  mergeTrees: (targetTreeId: string, sourceTreeId: string) =>
    apiCall(`/trees/${targetTreeId}/merge/${sourceTreeId}`, {
      method: 'POST'
    }).then(res => res.json())
};

export const memberAPI = {
  getTreeMembers: (treeId: string) =>
    apiCall(`/members/tree/${treeId}`).then(res => res.json()),

  createMember: (memberData: any) =>
    apiCall('/members', {
      method: 'POST',
      body: JSON.stringify(memberData)
    }).then(res => res.json()),

  updateMember: (memberId: string, memberData: any) =>
    apiCall(`/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    }).then(res => res.json()),

  deleteMember: (memberId: string) =>
    apiCall(`/members/${memberId}`, {
      method: 'DELETE'
    }).then(res => res.json())
};