import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiMapPin, FiBriefcase, FiDollarSign, 
  FiClock, FiCalendar, FiUsers, FiBookmark, 
  FiSend, FiCheckCircle, FiXCircle 
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

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const ContentGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.small};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const JobHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const CompanyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const CompanyLogo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
`;

const CompanyDetails = styled.div`
  h1 {
    font-size: 28px;
    margin-bottom: ${theme.spacing.xs};
  }

  h2 {
    font-size: 18px;
    color: ${theme.colors.text.secondary};
    font-weight: 500;
  }
`;

const JobMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg} 0;
  border-top: 1px solid ${theme.colors.border};
  border-bottom: 1px solid ${theme.colors.border};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    color: ${theme.colors.primary};
    font-size: 20px;
  }

  div {
    p:first-child {
      font-size: 14px;
      color: ${theme.colors.text.light};
      margin-bottom: ${theme.spacing.xs};
    }

    p:last-child {
      font-weight: 600;
    }
  }
`;

const Section = styled.div`
  margin: ${theme.spacing.xl} 0;

  h3 {
    font-size: 18px;
    margin-bottom: ${theme.spacing.md};
  }

  p {
    color: ${theme.colors.text.secondary};
    line-height: 1.6;
    white-space: pre-line;
  }
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const SkillTag = styled.span`
  background: ${theme.colors.background};
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
`;

const ActionCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.small};
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${props => props.primary ? theme.gradients.primary : 'transparent'};
  color: ${props => props.primary ? 'white' : theme.colors.primary};
  border: ${props => props.primary ? 'none' : `2px solid ${theme.colors.primary}`};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 600;
  margin: ${theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(ActionButton)`
  background: ${props => props.saved ? theme.colors.secondary : 'transparent'};
  color: ${props => props.saved ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border};
  margin-top: ${theme.spacing.sm};
`;

const SimilarJobCard = styled.div`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateX(5px);
  }

  h4 {
    font-size: 16px;
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
    margin-bottom: ${theme.spacing.sm};
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: ${theme.spacing.lg};

  ${props => {
    switch(props.status) {
      case 'applied':
        return `
          background: ${theme.colors.success}10;
          color: ${theme.colors.success};
        `;
      case 'expired':
        return `
          background: ${theme.colors.error}10;
          color: ${theme.colors.error};
        `;
      default:
        return `
          background: ${theme.colors.primary}10;
          color: ${theme.colors.primary};
        `;
    }
  }}
`;

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await API.get(`/jobs/${id}`);
      setJob(res.data.job);
      setSimilarJobs(res.data.similarJobs || []);
      
      if (user) {
        setHasApplied(res.data.hasApplied || false);
        setIsSaved(res.data.isSaved || false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job:', error);
      setLoading(false);
      navigate('/jobs');
    }
  };

  // 🔴 FIX: Added default cover letter
  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.user_type !== 'job_seeker') {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      await API.post('/applications', {
        job_id: id,
        cover_letter: coverLetter.trim() || "I am very interested in this position and believe my skills align well with your requirements. I would love the opportunity to discuss how I can contribute to your team."
      });
      
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setShowApplicationForm(false);
      setCoverLetter('');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('You have already applied for this job');
      } else {
        console.error('Apply error:', error.response?.data);
        toast.error(error.response?.data?.message || 'Error submitting application');
      }
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await API.delete(`/jobs/saved/${id}`);
        setIsSaved(false);
        toast.success('Job removed from saved');
      } else {
        await API.post('/jobs/saved', { job_id: id });
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Error saving job');
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

  if (!job) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <h2>Job not found</h2>
          <BackButton onClick={() => navigate('/jobs')}>
            <FiArrowLeft /> Back to Jobs
          </BackButton>
        </div>
      </Container>
    );
  }

  const isJobExpired = new Date(job.expiry_date) < new Date();

  return (
    <Container>
      <BackButton
        onClick={() => navigate('/jobs')}
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiArrowLeft /> Back to Jobs
      </BackButton>

      <ContentGrid>
        <MainContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <JobHeader>
            <CompanyInfo>
              <CompanyLogo>
                {job.company_name?.[0] || 'H'}
              </CompanyLogo>
              <CompanyDetails>
                <h1>{job.title}</h1>
                <h2>{job.company_name}</h2>
              </CompanyDetails>
            </CompanyInfo>

            {hasApplied && (
              <StatusBadge status="applied">
                <FiCheckCircle /> Applied
              </StatusBadge>
            )}

            {isJobExpired && !hasApplied && (
              <StatusBadge status="expired">
                <FiXCircle /> Expired
              </StatusBadge>
            )}
          </JobHeader>

          <JobMeta>
            <MetaItem>
              <FiMapPin />
              <div>
                <p>Location</p>
                <p>{job.location || 'Remote'}</p>
              </div>
            </MetaItem>

            <MetaItem>
              <FiBriefcase />
              <div>
                <p>Job Type</p>
                <p>{job.job_type?.replace('_', ' ')}</p>
              </div>
            </MetaItem>

            {job.salary_min && (
              <MetaItem>
                <FiDollarSign />
                <div>
                  <p>Salary</p>
                  <p>₹{job.salary_min.toLocaleString()}
                    {job.salary_max && ` - ₹${job.salary_max.toLocaleString()}`}
                  </p>
                </div>
              </MetaItem>
            )}

            <MetaItem>
              <FiUsers />
              <div>
                <p>Applicants</p>
                <p>{job.applications_count || 0}</p>
              </div>
            </MetaItem>
          </JobMeta>

          <Section>
            <h3>Job Description</h3>
            <p>{job.description}</p>
          </Section>

          {job.responsibilities && (
            <Section>
              <h3>Responsibilities</h3>
              <p>{job.responsibilities}</p>
            </Section>
          )}

          {job.requirements && (
            <Section>
              <h3>Requirements</h3>
              <p>{job.requirements}</p>
            </Section>
          )}

          {job.skills_required && (
            <Section>
              <h3>Required Skills</h3>
              <SkillsContainer>
                {job.skills_required.split(',').map((skill, i) => (
                  <SkillTag key={i}>{skill.trim()}</SkillTag>
                ))}
              </SkillsContainer>
            </Section>
          )}

          {job.benefits && (
            <Section>
              <h3>Benefits</h3>
              <p>{job.benefits}</p>
            </Section>
          )}
        </MainContent>

        <Sidebar>
          <ActionCard>
            {!hasApplied && !isJobExpired && (
              <>
                {!showApplicationForm ? (
                  <ActionButton
                    primary
                    onClick={() => setShowApplicationForm(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!user || user.user_type !== 'job_seeker'}
                  >
                    <FiSend /> Apply Now
                  </ActionButton>
                ) : (
                  <div>
                    <textarea
                      placeholder="Write a cover letter (optional)"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows="4"
                      style={{
                        width: '100%',
                        padding: theme.spacing.md,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.borderRadius.medium,
                        marginBottom: theme.spacing.md,
                        fontFamily: 'inherit'
                      }}
                    />
                    <ActionButton
                      primary
                      onClick={handleApply}
                      disabled={applying}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </ActionButton>
                    <ActionButton
                      onClick={() => setShowApplicationForm(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </ActionButton>
                  </div>
                )}
              </>
            )}

            {user && (
              <SaveButton
                saved={isSaved}
                onClick={handleSaveJob}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiBookmark /> {isSaved ? 'Saved' : 'Save Job'}
              </SaveButton>
            )}

            {!user && (
              <p style={{ textAlign: 'center', color: theme.colors.text.light, fontize: '14px' }}>
                Please <a href="/login">login</a> to apply
              </p>
            )}
          </ActionCard>

          {similarJobs.length > 0 && (
            <ActionCard>
              <h3 style={{ marginBottom: theme.spacing.md }}>Similar Jobs</h3>
              {similarJobs.map(similarJob => (
                <SimilarJobCard
                  key={similarJob.job_id}
                  onClick={() => navigate(`/job/${similarJob.job_id}`)}
                >
                  <h4>{similarJob.title}</h4>
                  <p>{similarJob.company_name}</p>
                  <div style={{ display: 'flex', gap: theme.spacing.sm, fontSize: '13px', color: theme.colors.text.light }}>
                    <span><FiMapPin /> {similarJob.location || 'Remote'}</span>
                    <span><FiClock /> {new Date(similarJob.created_at).toLocaleDateString()}</span>
                  </div>
                </SimilarJobCard>
              ))}
            </ActionCard>
          )}

          <ActionCard>
            <h3 style={{ marginBottom: theme.spacing.md }}>Job Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <div>
                <p style={{ color: theme.colors.text.light, fontSize: '13px', marginBottom: theme.spacing.xs }}>
                  Posted Date
                </p>
                <p style={{ fontWeight: 500 }}>
                  {new Date(job.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p style={{ color: theme.colors.text.light, fontSize: '13px', marginBottom: theme.spacing.xs }}>
                  Application Deadline
                </p>
                <p style={{ fontWeight: 500 }}>
                  {new Date(job.expiry_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p style={{ color: theme.colors.text.light, fontSize: '13px', marginBottom: theme.spacing.xs }}>
                  Experience Required
                </p>
                <p style={{ fontWeight: 500 }}>
                  {job.experience_required ? `${job.experience_required}+ years` : 'Not specified'}
                </p>
              </div>
            </div>
          </ActionCard>
        </Sidebar>
      </ContentGrid>
    </Container>
  );
};

export default JobDetail;