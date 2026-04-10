export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const hoursLeftForApproval = (createdAt, hoursWindow = 24) => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const end = created + hoursWindow * 60 * 60 * 1000;
  const diff = Math.max(0, end - now);
  return Math.ceil(diff / (60 * 60 * 1000));
};
