import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiBriefcase, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';
import { FiSettings } from 'react-icons/fi';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.gradients.primary};
  padding: ${theme.spacing.xxl} ${theme.spacing.md};
  padding-top: 100px;
`;

const LoginCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
  width: 100%;
  max-width: 500px;
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.lg};
  text-align: center;

  h1 {
    font-size: 32px;
    margin-bottom: ${theme.spacing.xs};
    background: ${theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    color: ${theme.colors.text.secondary};
  }
`;

const TabContainer = styled.div`
  display: flex;
  padding: 0 ${theme.spacing.xl};
  gap: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: ${theme.spacing.md} 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.active ? theme.colors.primary : theme.colors.text.secondary};
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};

  svg {
    font-size: 20px;
  }

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const Form = styled.form`
  padding: ${theme.spacing.xl};
`;

const InputGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: ${theme.spacing.md};
    color: ${theme.colors.text.light};
    font-size: 18px;
  }

  input {
    width: 100%;
    padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 42px;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    font-size: 15px;
    transition: all 0.2s ease;

    &:focus {
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px ${theme.colors.primary}20;
    }
  }
`;

const ForgotPassword = styled(Link)`
  display: block;
  text-align: right;
  font-size: 14px;
  color: ${theme.colors.primary};
  margin-top: ${theme.spacing.xs};

  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.gradients.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: ${theme.spacing.lg} 0 ${theme.spacing.md};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: ${theme.colors.text.light};
  font-size: 14px;
  margin: ${theme.spacing.md} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.border};
  }

  &::before {
    margin-right: ${theme.spacing.md};
  }

  &::after {
    margin-left: ${theme.spacing.md};
  }
`;

const SocialButton = styled(motion.button)`
  width: 100%;
  padding: ${theme.spacing.md};
  background: white;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 15px;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.lg};
  font-size: 15px;
  color: ${theme.colors.text.secondary};

  a {
    color: ${theme.colors.primary};
    font-weight: 600;
    margin-left: ${theme.spacing.xs};

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error}10;
  color: ${theme.colors.error};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  margin-bottom: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.error}30;
`;

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('job_seeker');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, activeTab);

    if (result.success) {
      navigate(`/${result.userType}/dashboard`);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Container>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <h1>Welcome Back</h1>
          <p>Login to continue your journey with HIRELINK</p>
        </Header>

        <TabContainer>
          <Tab
            active={activeTab === 'job_seeker'}
            onClick={() => setActiveTab('job_seeker')}
          >
            <FiUser /> Job Seeker
          </Tab>
          <Tab
            active={activeTab === 'employer'}
            onClick={() => setActiveTab('employer')}
          >
            <FiBriefcase /> Employer
          </Tab>
          
        </TabContainer>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <Label>Email Address</Label>
            <InputWrapper>
              <FiMail />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <InputWrapper>
              <FiLock />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputWrapper>
            <ForgotPassword to="/forgot-password">
              Forgot password?
            </ForgotPassword>
          </InputGroup>

          <button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
          {loading ? 'Logging in...' : 
          activeTab === 'job_seeker' ? 'Login as Job Seeker' : 
          'Login as Employer'}
          </button>

          <div>
            <Divider>OR</Divider>
            <SocialButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" />
              Continue with Google
            </SocialButton>
          </div>


          <RegisterLink>
            Don't have an account?
            <Link to="/register">Sign up</Link>
          </RegisterLink>
        </Form>
      </LoginCard>
    </Container>
  );
};

export default LoginPage;