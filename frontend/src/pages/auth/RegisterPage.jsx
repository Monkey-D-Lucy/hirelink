import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.gradients.primary};
  padding: ${theme.spacing.xxl} ${theme.spacing.md};
  padding-top: 100px;
`;

const RegisterCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.large};
  width: 100%;
  max-width: 600px;
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
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.text.light};
    border-radius: ${theme.borderRadius.small};
  }
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

const TermsCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.lg} 0;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  label {
    font-size: 14px;
    color: ${theme.colors.text.secondary};

    a {
      color: ${theme.colors.primary};
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
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
  margin: ${theme.spacing.md} 0;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoginLink = styled.div`
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

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState('job_seeker');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    company_name: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      setLoading(false);
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
      user_type: activeTab,
      full_name: formData.full_name,
      phone: formData.phone,
      company_name: activeTab === 'employer' ? formData.company_name : undefined
    };

    const result = await register(userData);

    if (result.success) {
      navigate(`/${result.userType}/dashboard`);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Container>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <h1>Create Account</h1>
          <p>Join HIRELINK and start your journey</p>
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
            <Label>Full Name *</Label>
            <InputWrapper>
              <FiUser />
              <input
                type="text"
                name="full_name"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Email Address *</Label>
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
            <Label>Phone Number</Label>
            <InputWrapper>
              <FiPhone />
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </InputWrapper>
          </InputGroup>

          {activeTab === 'employer' && (
            <InputGroup>
            <Label>Company Name *</Label>
            <InputWrapper>
            <FiBriefcase />
            <input
              type="text"
              name="company_name"
              placeholder="Enter your company name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
            </InputWrapper>
            </InputGroup>
  )}

          <InputGroup>
            <Label>Password *</Label>
            <InputWrapper>
              <FiLock />
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Confirm Password *</Label>
            <InputWrapper>
              <FiLock />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <TermsCheckbox>
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </TermsCheckbox>

          <Button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating account...' : `Create ${activeTab === 'job_seeker' ? 'Job Seeker' : 'Employer'} Account`}
          </Button>

          <LoginLink>
            Already have an account?
            <Link to="/login">Sign in</Link>
          </LoginLink>
        </Form>
      </RegisterCard>
    </Container>
  );
};

export default RegisterPage;