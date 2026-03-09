export const theme = {
  colors: {
    // Primary Brand Colors - From Your Logo
    primary: '#0A0A2A',        // Deep navy
    primaryLight: '#1A1A3A',    // Lighter navy
    primaryDark: '#050518',     // Darkest navy
    
    secondary: '#F5A623',       // Warm orange/gold
    secondaryLight: '#FFB347',   // Lighter orange
    secondaryDark: '#E59500',    // Darker orange
    
    accent: '#4A90E2',          // Complementary blue
    
    // Neutral Colors
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceHover: '#F1F5F9',
    
    // Text Colors
    text: {
      primary: '#1E293B',
      secondary: '#475569',
      light: '#64748B',
      inverse: '#FFFFFF',
      muted: '#94A3B8'
    },
    
    // UI Elements
    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #0A0A2A 0%, #1A1A3A 100%)',
    secondary: 'linear-gradient(135deg, #F5A623 0%, #FFB347 100%)',
    hero: 'linear-gradient(135deg, #0A0A2A 0%, #1A1A3A 70%, #F5A623 200%)',
    
    button: {
      primary: 'linear-gradient(135deg, #0A0A2A 0%, #1A1A3A 100%)',
      primaryHover: 'linear-gradient(135deg, #1A1A3A 0%, #2A2A5A 100%)',
      secondary: 'linear-gradient(135deg, #F5A623 0%, #FFB347 100%)',
      secondaryHover: 'linear-gradient(135deg, #FFB347 0%, #FFC374 100%)'
    }
  },
  
  shadows: {
    small: '0 2px 4px rgba(10, 10, 42, 0.05)',
    medium: '0 4px 6px -1px rgba(10, 10, 42, 0.1)',
    large: '0 10px 15px -3px rgba(10, 10, 42, 0.1)',
    hover: '0 20px 30px -10px rgba(245, 166, 35, 0.2)',
    primary: '0 10px 20px -5px rgba(10, 10, 42, 0.3)',
    secondary: '0 10px 20px -5px rgba(245, 166, 35, 0.3)'
  },
  
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
    round: '50%',
    pill: '9999px'
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  
  transitions: {
    base: 'all 0.2s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.3s ease'
  }
};