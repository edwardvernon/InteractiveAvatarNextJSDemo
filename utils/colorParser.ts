// Common color mappings
const COLOR_MAP: Record<string, string> = {
  // Basic colors
  red: "#FF0000",
  blue: "#0000FF",
  green: "#00FF00",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#808080",
  grey: "#808080",
  brown: "#A52A2A",
  
  // Extended colors
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  lime: "#00FF00",
  navy: "#000080",
  teal: "#008080",
  silver: "#C0C0C0",
  gold: "#FFD700",
  indigo: "#4B0082",
  violet: "#EE82EE",
  turquoise: "#40E0D0",
  coral: "#FF7F50",
  salmon: "#FA8072",
  crimson: "#DC143C",
  maroon: "#800000",
  olive: "#808000",
  aqua: "#00FFFF",
  fuchsia: "#FF00FF",
  lavender: "#E6E6FA",
  beige: "#F5F5DC",
  mint: "#3EB489",
  ivory: "#FFFFF0",
  pearl: "#F8F8FF",
};

// Patterns to match color change commands
const COLOR_PATTERNS = [
  /(?:change|make|turn|set|switch|paint|color)\s+(?:the\s+)?circle\s+(?:to\s+)?(\w+)/i,
  /(?:the\s+)?circle\s+(?:should\s+be|to)\s+(\w+)/i,
  /(\w+)\s+circle(?:\s+please)?/i,
  /(?:can\s+you\s+)?(?:please\s+)?(?:make|change|turn)\s+(?:it|the\s+circle)\s+(\w+)/i,
  /^(\w+)$/i, // Just the color name
];

export interface ColorCommand {
  detected: boolean;
  color?: string;
  colorName?: string;
}

export function parseColorCommand(message: string): ColorCommand {
  const normalizedMessage = message.toLowerCase().trim();
  
  for (const pattern of COLOR_PATTERNS) {
    const match = normalizedMessage.match(pattern);
    if (match && match[1]) {
      const colorName = match[1].toLowerCase();
      const color = COLOR_MAP[colorName];
      
      if (color) {
        return {
          detected: true,
          color,
          colorName,
        };
      }
    }
  }
  
  // Check if the message contains any color name even without a pattern
  const words = normalizedMessage.split(/\s+/);
  for (const word of words) {
    if (COLOR_MAP[word]) {
      return {
        detected: true,
        color: COLOR_MAP[word],
        colorName: word,
      };
    }
  }
  
  return { detected: false };
}

// Helper function to get a random color
export function getRandomColor(): string {
  const colors = Object.values(COLOR_MAP);
  return colors[Math.floor(Math.random() * colors.length)];
}

// Helper function to validate hex color
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}
