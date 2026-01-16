import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: string): { text: string; background: string; border: string } {
  switch (status) {
    case 'APPROVED':
      return { 
        text: 'text-emerald-700', 
        background: 'bg-emerald-50', 
        border: 'border-emerald-200' 
      };
    case 'PENDING':
      return { 
        text: 'text-amber-700', 
        background: 'bg-amber-50', 
        border: 'border-amber-200' 
      };
    case 'PAID':
      return { 
        text: 'text-blue-700', 
        background: 'bg-blue-50', 
        border: 'border-blue-200' 
      };
    case 'REJECTED':
      return { 
        text: 'text-red-700', 
        background: 'bg-red-50', 
        border: 'border-red-200' 
      };
    case 'UPCOMING':
      return { 
        text: 'text-blue-700', 
        background: 'bg-blue-50', 
        border: 'border-blue-200' 
      };
    case 'OVERDUE':
      return { 
        text: 'text-red-700', 
        background: 'bg-red-50', 
        border: 'border-red-200' 
      };
    case 'PROCESSING':
      return { 
        text: 'text-amber-700', 
        background: 'bg-amber-50', 
        border: 'border-amber-200' 
      };
    case 'AWAITING_PAYMENT':
      return { 
        text: 'text-purple-700', 
        background: 'bg-purple-50', 
        border: 'border-purple-200' 
      };
    default:
      return { 
        text: 'text-gray-700', 
        background: 'bg-gray-50', 
        border: 'border-gray-200' 
      };
  }
}
