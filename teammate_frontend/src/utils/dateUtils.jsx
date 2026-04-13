export const formatDateTime = (dateString) => {
  if (!dateString) return 'Time Pending';
  
  const date = new Date(dateString);
  // If we got a garbage date or Epoch 0, return a cleaner fallback
  if (isNaN(date.getTime()) || date.getFullYear() <= 1970) return 'Recent History';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-'); // Standardization Fix 4
};

export const hoursLeftForApproval = (createdAt, hoursWindow = 24) => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const end = created + hoursWindow * 60 * 60 * 1000;
  const diff = Math.max(0, end - now);
  return Math.ceil(diff / (60 * 60 * 1000));
};

export const getCountdownLabel = (deadline) => {
  if (!deadline) return null;
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end - now;

  if (diffMs <= 0) return 'Expired';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m left to object`;
  }
  return `${minutes}m left to object`;
};
