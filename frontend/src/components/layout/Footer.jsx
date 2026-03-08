import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';
import { theme } from '../../styles/theme';

const FooterContainer = styled.footer`
  background: ${theme.colors.primary};
  color: white;
  margin-top: auto;
  padding: ${theme.spacing.xl} 0 ${theme.spacing.lg};
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.xl};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  h4 {
    color: ${theme.colors.secondary};
    margin-bottom: ${theme.spacing.lg};
    font-size: 18px;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: ${theme.spacing.sm};
  }

  a {
    color: rgba(255, 255, 255, 0.8);
    transition: color 0.2s ease;

    &:hover {
      color: ${theme.colors.secondary};
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};

  a {
    width: 40px;
    height: 40px;
    border-radius: ${theme.borderRadius.round};
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;

    &:hover {
      background: ${theme.colors.secondary};
      color: ${theme.colors.primary};
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h4>HIRELINK</h4>
          <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
            Connecting talent with opportunity. Find your dream job or hire the perfect candidate.
          </p>
          <SocialLinks>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FiGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FiLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FiTwitter />
            </a>
            <a href="mailto:contact@hirelink.com">
              <FiMail />
            </a>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <h4>For Job Seekers</h4>
          <ul>
            <li><Link to="/jobs">Browse Jobs</Link></li>
            <li><Link to="/seeker/dashboard">Dashboard</Link></li>
            <li><Link to="/seeker/profile">Profile</Link></li>
            <li><Link to="/seeker/applications">Applications</Link></li>
            <li><Link to="/seeker/saved-jobs">Saved Jobs</Link></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h4>For Employers</h4>
          <ul>
            <li><Link to="/employer/dashboard">Dashboard</Link></li>
            <li><Link to="/employer/post-job">Post a Job</Link></li>
            <li><Link to="/employer/manage-jobs">Manage Jobs</Link></li>
            <li><Link to="/employer/applicants">Applicants</Link></li>
            <li><Link to="/employer/company">Company Profile</Link></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h4>Support</h4>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </FooterSection>
      </FooterContent>

      <Copyright>
        &copy; {new Date().getFullYear()} HIRELINK. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;