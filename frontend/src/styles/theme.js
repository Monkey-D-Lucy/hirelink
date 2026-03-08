export const theme = {
  colors: {
    primary: '#2A2A5A',      // Deep purple/navy from logo
    secondary: '#F5A623',     // Orange/gold accent from logo
    accent: '#4A90E2',        // Blue accent
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: {
      primary: '#1E1E1E',
      secondary: '#6B7280',
      light: '#9CA3AF',
      inverse: '#FFFFFF'
    },
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #2A2A5A 0%, #4A2A5A 100%)',
    secondary: 'linear-gradient(135deg, #F5A623 0%, #FFB347 100%)',
    card: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)'
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    large: '0 10px 15px rgba(0,0,0,0.1)',
    hover: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
    round: '50%'
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
    h1: '48px',
    h2: '40px',
    h3: '32px',
    h4: '24px',
    h5: '20px',
    h6: '16px',
    body: '16px',
    small: '14px'
  },
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '1024px',
    lg: '1200px',
    xl: '1440px'
  }
};