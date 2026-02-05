// Generate initials from a name (e.g., "Priya Sharma" -> "PS")
export const getInitials = (name) => {
  if (!name) return '??';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Generate a consistent color based on a string (name)
// Returns a pleasant, muted color suitable for avatars
const avatarColors = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
];

export const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  
  // Generate a hash from the name to get a consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

// Get avatar style object for inline styling
export const getAvatarStyle = (name) => {
  return {
    backgroundColor: getAvatarColor(name),
    color: '#ffffff',
  };
};
