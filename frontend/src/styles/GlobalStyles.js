import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text.primary};
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.bold};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: ${theme.transitions.base};

    &:hover {
      color: ${theme.colors.secondary};
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }

  .btn-primary {
    background: ${theme.gradients.button.primary};
    color: white;
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.medium};
    font-weight: ${theme.typography.fontWeight.semibold};
    transition: ${theme.transitions.base};

    &:hover {
      background: ${theme.gradients.button.primaryHover};
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.primary};
    }
  }

  .btn-secondary {
    background: ${theme.gradients.button.secondary};
    color: white;
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.medium};
    font-weight: ${theme.typography.fontWeight.semibold};

    &:hover {
      background: ${theme.gradients.button.secondaryHover};
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.secondary};
    }
  }
`;

export default GlobalStyles;