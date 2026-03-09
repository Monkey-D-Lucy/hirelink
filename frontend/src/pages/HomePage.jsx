import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiBriefcase, FiUsers, FiTrendingUp, FiShield, 
  FiAward, FiMessageCircle, FiSearch, FiFileText,
  FiCheckCircle, FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
`;

// Hero Section
const HeroSection = styled.section`
  background: ${theme.gradients.hero};
  padding: 160px ${theme.spacing.xl} 100px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: url('/pattern.svg') repeat;
    opacity: 0.1;
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.xxl};
  align-items: center;

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroLeft = styled(motion.div)`
  h1 {
    font-size: 54px;
    font-weight: ${theme.typography.fontWeight.extrabold};
    line-height: 1.2;
    margin-bottom: ${theme.spacing.lg};
    color: white;

    span {
      color: ${theme.colors.secondary};
      display: block;
    }

    @media (max-width: ${theme.breakpoints.md}) {
      font-size: 40px;
    }
  }

  p {
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: ${theme.spacing.xl};
    opacity: 0.9;
    max-width: 600px;

    @media (max-width: ${theme.breakpoints.lg}) {
      margin-left: auto;
      margin-right: auto;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;

  @media (max-width: ${theme.breakpoints.lg}) {
    justify-content: center;
  }
`;

const PrimaryButton = styled(Link)`
  background: ${theme.gradients.secondary};
  color: ${theme.colors.primary};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.pill};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: 16px;
  transition: ${theme.transitions.base};
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.secondary};
  }
`;

const SecondaryButton = styled(Link)`
  background: transparent;
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.pill};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: ${theme.transitions.base};
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    border-color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const HeroRight = styled(motion.div)`
  position: relative;

  img {
    width: 100%;
    max-width: 500px;
    border-radius: ${theme.borderRadius.xl};
    box-shadow: ${theme.shadows.xl};
  }
`;

// How It Works Section
const HowItWorksSection = styled.section`
  background: ${theme.gradients.primary};
  padding: ${theme.spacing.xxl} ${theme.spacing.xl};
  color: white;
`;

const HowItWorksContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto ${theme.spacing.xxl};

  h2 {
    font-size: 36px;
    color: white;
    margin-bottom: ${theme.spacing.md};
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 18px;
  }
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled(motion.div)`
  text-align: center;
  padding: ${theme.spacing.lg};
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.round};
  background: ${theme.colors.secondary};
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 auto ${theme.spacing.lg};
`;

const StepTitle = styled.h3`
  font-size: 20px;
  margin-bottom: ${theme.spacing.sm};
  color: white;
`;

const StepDesc = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.6;
`;

// CTA Section
const CTASection = styled.section`
  background: ${theme.gradients.secondary};
  padding: ${theme.spacing.xxl} ${theme.spacing.xl};
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;

  h2 {
    font-size: 36px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.md};
  }

  p {
    font-size: 18px;
    color: ${theme.colors.primary};
    opacity: 0.9;
    margin-bottom: ${theme.spacing.xl};
  }
`;

const CTAButton = styled(Link)`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.xxl};
  border-radius: ${theme.borderRadius.pill};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: 18px;
  transition: ${theme.transitions.base};
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.primary};
  }
`;

const HomePage = () => {
  const { user } = useAuth();

  const steps = [
    {
      number: '01',
      title: 'Create Profile',
      desc: 'Sign up and build your professional profile in minutes.'
    },
    {
      number: '02',
      title: 'Find Jobs',
      desc: 'Search through thousands of verified job listings.'
    },
    {
      number: '03',
      title: 'Apply Smartly',
      desc: 'Apply with one click and track your applications.'
    },
    {
      number: '04',
      title: 'Get Hired',
      desc: 'Connect with employers and land your dream job.'
    }
  ];

  return (
    <Container>
      <HeroSection>
        <HeroContent>
          <HeroLeft
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>
              Find Your Dream Job <span>With HireLink</span>
            </h1>
            <p>
              The intelligent platform that connects talented professionals with 
              top companies. Smart matching, verified opportunities, and career growth.
            </p>
            <ButtonGroup>
              <PrimaryButton to="/jobs">
                Find Jobs <FiArrowRight />
              </PrimaryButton>
              {!user && (
                <SecondaryButton to="/register">
                  Create Account
                </SecondaryButton>
              )}
            </ButtonGroup>
          </HeroLeft>
          <HeroRight
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Team collaboration"
            />
          </HeroRight>
        </HeroContent>
      </HeroSection>

      <HowItWorksSection>
        <HowItWorksContent>
          <SectionHeader>
            <h2>How It Works</h2>
            <p>Four simple steps to your next career opportunity</p>
          </SectionHeader>

          <StepsContainer>
            {steps.map((step, index) => (
              <StepCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDesc>{step.desc}</StepDesc>
              </StepCard>
            ))}
          </StepsContainer>
        </HowItWorksContent>
      </HowItWorksSection>

      <CTASection>
        <CTAContent>
          <h2>Ready to Start Your Journey?</h2>
          <p>Join HireLink today and take the next step in your career</p>
          <CTAButton to={user ? '/jobs' : '/register'}>
            Get Started Now <FiArrowRight />
          </CTAButton>
        </CTAContent>
      </CTASection>
    </Container>
  );
};

export default HomePage;