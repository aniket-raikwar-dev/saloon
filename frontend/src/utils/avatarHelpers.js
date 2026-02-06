// Generate initials from a name (e.g., "Priya Sharma" -> "PS")
export const getInitials = (name) => {
  if (!name) return '??';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Generate a consistent color based on a string (name)
// Returns pleasant pink/feminine-themed colors suitable for a beauty app
const avatarColors = [
  '#e91e63', // Pink (Primary)
  '#f06292', // Pink Light
  '#ec407a', // Pink Medium
  '#c2185b', // Pink Dark
  '#ad1457', // Pink Darker
  '#d81b60', // Pink Rose
  '#f50057', // Pink Accent
  '#ff4081', // Pink Hot
  '#ab47bc', // Purple
  '#7b1fa2', // Purple Dark
  '#9c27b0', // Purple Medium
  '#ba68c8', // Purple Light
  '#ce93d8', // Lavender
  '#e1bee7', // Lavender Light
  '#ef5350', // Red Light
  '#ff7043', // Coral
  '#ff8a65', // Peach
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
