import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// Tailwind CSS class utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in CFA Francs
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format numbers with thousand separators
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

// Format date strings
export function formatDate(dateString: string, formatString: string = 'dd/MM/yyyy'): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return 'Date invalide';
    return format(date, formatString, { locale: fr });
  } catch (error) {
    return 'Date invalide';
  }
}

// Format date with time
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, 'dd/MM/yyyy à HH:mm');
}

// Get relative time (e.g., "il y a 2 heures")
export function getRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return formatDate(dateString);
  } catch (error) {
    return 'Date invalide';
  }
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimal places
}

// Generate avatar initials
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// Generate random color for avatars
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  const index = name.length % colors.length;
  return colors[index];
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Burkina Faso format)
export function isValidPhone(phone: string): boolean {
  // Burkina Faso phone numbers: +2267xxxxxxx or 7xxxxxxx or 6xxxxxxx
  const phoneRegex = /^(\+226)?[6-7]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Format phone number for display
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('226')) {
    return `+226 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Status badge colors
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'badge-success',
    pending: 'badge-warning',
    completed: 'badge-info',
    cancelled: 'badge-danger',
    paid: 'badge-success',
    overdue: 'badge-danger',
    draft: 'badge-secondary',
  };
  
  return statusColors[status.toLowerCase()] || 'badge-secondary';
}

// Status translations
export function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    active: 'Actif',
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    paid: 'Payé',
    overdue: 'En retard',
    draft: 'Brouillon',
    admin: 'Administrateur',
    editor: 'Éditeur',
    image: 'Image',
    video: 'Vidéo',
    html: 'HTML',
  };
  
  return statusTexts[status.toLowerCase()] || status;
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Download file
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Validate required fields
export function validateRequired(value: any): string | null {
  if (value === null || value === undefined || value === '') {
    return 'Ce champ est requis';
  }
  return null;
}

// Parse JSON safely
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fallback;
  }
}

// Storage utilities
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      return fallback;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// URL utilities
export function buildUrl(base: string, params: Record<string, any>): string {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}