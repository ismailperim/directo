export interface ServiceLink {
  name: string;
  url: string;
  healthy: boolean | null;
}

export interface ServiceEnvironment {
  name: string;
  links: ServiceLink[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  tags: string[];
  project: string;
  group: string;
  icon: string;
  repository?: string;
  environments: ServiceEnvironment[];
}

export interface ServicesResponse {
  services: Service[];
  count: number;
}

// Dynamic API base URL: works for localhost and network access
// In dev mode, uses Vite proxy (no explicit URL needed)
// In production, backend serves frontend from same origin
const API_BASE = import.meta.env.PROD 
  ? '' 
  : '';

export async function fetchServices(): Promise<Service[]> {
  const response = await fetch(`${API_BASE}/api/services`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.statusText}`);
  }
  
  const data: ServicesResponse = await response.json();
  return data.services;
}

export async function fetchEnvironments(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/services/meta/environments`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch environments: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.environments || [];
}
