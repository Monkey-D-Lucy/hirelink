import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiGlobe, FiMapPin, FiUsers,
  FiCalendar, FiBriefcase, FiCheckCircle,
  FiEdit2, FiSave, FiX
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { theme } from '../../styles/theme';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 100px ${theme.spacing.xl} ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: 100px ${theme.spacing.md} ${theme.spacing.md};
  }
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: ${theme.spacing.lg};
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const CompanyContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
`;

const CoverImage = styled.div`
  height: 250px;
  background: ${theme.gradients.primary};
  border-radius: ${theme.borderRadius.large} ${theme.borderRadius.large} 0 0;
  position: relative;
  overflow: hidden;
`;

const CompanyHeader = styled.div`
  background: ${theme.colors.surface};
  padding: 0 ${theme.spacing.xl} ${theme.spacing.xl};
  border-radius: 0 0 ${theme.borderRadius.large} ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.small};
  margin-bottom: ${theme.spacing.xl};
  position: relative;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${theme.spacing.xl};
  margin-top: -60px;
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const Logo = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 600;
  border: 4px solid ${theme.colors.surface};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CompanyTitle = styled.div`
  flex: 1;

  h1 {
    font-size: 32px;
    margin-bottom: ${theme.spacing.xs};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
  }

  h2 {
    font-size: 18px;
    color: ${theme.colors.text.secondary};
    font-weight: 500;
  }
`;

const VerificationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.success}10;
  color: ${theme.colors.success};
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 500;
`;

const EditButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${theme.colors.primary}10;
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const CompanyStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
  padding: ${theme.spacing.lg} 0;
  border-top: 1px solid ${theme.colors.border};
  border-bottom: 1px solid ${theme.colors.border};
`;

const StatItem = styled.div`
  text-align: center;

  span {
    display: block;
    font-size: 24px;
    font-weight: 600;
    color: ${theme.colors.primary};
  }

  small {
    color: ${theme.colors.text.light};
    font-size: 13px;
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  font-size: 14px;

  svg {
    color: ${theme.colors.primary};
  }

  a {
    color: ${theme.colors.primary};
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Section = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.small};
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text.primary};
`;

const Description = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
`;

const DetailItem = styled.div`
  label {
    display: block;
    font-size: 13px;
    color: ${theme.colors.text.light};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    font-weight: 500;
    color: ${theme.colors.text.primary};
  }
`;

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const res = await API.get('/companies/profile');
      setCompany(res.data.company);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching company profile:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <div className="loading-spinner" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton
        onClick={() => navigate('/employer/dashboard')}
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiArrowLeft /> Back to Dashboard
      </BackButton>

      <CompanyContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CoverImage />
        
        <CompanyHeader>
          <LogoSection>
            <Logo>
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.company_name} />
              ) : (
                company.company_name?.[0] || 'C'
              )}
            </Logo>

            <CompanyTitle>
              <h1>
                {company.company_name || 'Company Name'}
                {company.verified && (
                  <VerificationBadge>
                    <FiCheckCircle /> Verified
                  </VerificationBadge>
                )}
              </h1>
              <h2>{company.industry || 'Industry not specified'}</h2>
            </CompanyTitle>

            <EditButton
              onClick={() => navigate('/employer/profile')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiEdit2 /> Edit Company
            </EditButton>
          </LogoSection>

          <CompanyStats>
            <StatItem>
              <span>{company.jobs_count || 0}</span>
              <small>Jobs Posted</small>
            </StatItem>
            <StatItem>
              <span>{company.active_jobs || 0}</span>
              <small>Active Jobs</small>
            </StatItem>
            <StatItem>
              <span>{company.employees || company.size || 'N/A'}</span>
              <small>Employees</small>
            </StatItem>
          </CompanyStats>

          <CompanyInfo>
            {company.website && (
              <InfoItem>
                <FiGlobe />
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  {company.website}
                </a>
              </InfoItem>
            )}
            {company.headquarters && (
              <InfoItem>
                <FiMapPin /> {company.headquarters}
              </InfoItem>
            )}
            {company.founded_year && (
              <InfoItem>
                <FiCalendar /> Founded {company.founded_year}
              </InfoItem>
            )}
            {company.size && (
              <InfoItem>
                <FiUsers /> {company.size} employees
              </InfoItem>
            )}
          </CompanyInfo>
        </CompanyHeader>

        <Section>
          <SectionTitle>About Company</SectionTitle>
          <Description>
            {company.description || 'No description provided.'}
          </Description>
        </Section>

        <Section>
          <SectionTitle>Company Details</SectionTitle>
          <InfoGrid>
            <DetailItem>
              <label>Industry</label>
              <p>{company.industry || 'Not specified'}</p>
            </DetailItem>
            <DetailItem>
              <label>Company Size</label>
              <p>{company.size || 'Not specified'}</p>
            </DetailItem>
            <DetailItem>
              <label>Founded</label>
              <p>{company.founded_year || 'Not specified'}</p>
            </DetailItem>
            <DetailItem>
              <label>Headquarters</label>
              <p>{company.headquarters || 'Not specified'}</p>
            </DetailItem>
          </InfoGrid>
        </Section>
      </CompanyContainer>
    </Container>
  );
};

export default CompanyProfile;