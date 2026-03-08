import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text.primary};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: ${theme.spacing.md};
  }

  a {
    text-decoration: none;
    color: ${theme.colors.primary};
    transition: color 0.2s ease;

    &:hover {
      color: ${theme.colors.secondary};
    }
  }

  button {
    font-family: inherit;
    border: none;
    background: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: ${theme.typography.body};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.text.light};
    border-radius: ${theme.borderRadius.small};

    &:hover {
      background: ${theme.colors.text.secondary};
    }
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Utility classes */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }

  .text-center {
    text-align: center;
  }

  .text-primary {
    color: ${theme.colors.primary};
  }

  .text-secondary {
    color: ${theme.colors.secondary};
  }

  .text-success {
    color: ${theme.colors.success};
  }

  .text-warning {
    color: ${theme.colors.warning};
  }

  .text-error {
    color: ${theme.colors.error};
  }

  .bg-primary {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.text.inverse};
  }

  .bg-secondary {
    background-color: ${theme.colors.secondary};
    color: ${theme.colors.text.inverse};
  }

  .bg-surface {
    background-color: ${theme.colors.surface};
    box-shadow: ${theme.shadows.small};
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .gap-sm {
    gap: ${theme.spacing.sm};
  }

  .gap-md {
    gap: ${theme.spacing.md};
  }

  .gap-lg {
    gap: ${theme.spacing.lg};
  }

  .p-sm {
    padding: ${theme.spacing.sm};
  }

  .p-md {
    padding: ${theme.spacing.md};
  }

  .p-lg {
    padding: ${theme.spacing.lg};
  }

  .m-sm {
    margin: ${theme.spacing.sm};
  }

  .m-md {
    margin: ${theme.spacing.md};
  }

  .m-lg {
    margin: ${theme.spacing.lg};
  }

  .rounded-sm {
    border-radius: ${theme.borderRadius.small};
  }

  .rounded-md {
    border-radius: ${theme.borderRadius.medium};
  }

  .rounded-lg {
    border-radius: ${theme.borderRadius.large};
  }

  .rounded-full {
    border-radius: ${theme.borderRadius.round};
  }

  .shadow-sm {
    box-shadow: ${theme.shadows.small};
  }

  .shadow-md {
    box-shadow: ${theme.shadows.medium};
  }

  .shadow-lg {
    box-shadow: ${theme.shadows.large};
  }
`;

export default GlobalStyles;