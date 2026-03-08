import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiMail, FiPhone, FiMapPin,
  FiDownload, FiEye, FiStar, FiCalendar,
  FiCheckCircle, FiXCircle, FiClock,
  FiMessageSquare, FiFileText
} from 'react-icons/fi';
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
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const Header = styled.div`
  max-width: 1400px;
  margin: 0 auto ${theme.spacing.xl};

  h1 {
    font-size: 28px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
  }
`;

const JobInfo = styled.div`
  max-width: 1400px;
  margin: 0 auto ${theme.spacing.xl};
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.small};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};

  h2 {
    font-size: 20px;
    color: ${theme.colors.text.primary};
  }

  p {
    color: ${theme.colors.text.secondary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
  }
`;

const StatsGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto ${theme.spacing.xl};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.small};

  h3 {
    font-size: 28px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
  }
`;

const FilterTabs = styled.div`
  max-width: 1400px;
  margin: 0 auto ${theme.spacing.xl};
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const FilterTab = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${props => props.active ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? theme.colors.primary : theme.colors.background};
  }
`;

const ApplicantsList = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const ApplicantCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.small};
`;

const ApplicantHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
`;

const ApplicantInfo = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  flex: 1;
`;

const ApplicantAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.round};
  background: ${theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
`;

const ApplicantDetails = styled.div`
  flex: 1;

  h3 {
    font-size: 18px;
    margin-bottom: ${theme.spacing.xs};
  }

  h4 {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
    margin-bottom: ${theme.spacing.sm};
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};

  span {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    color: ${theme.colors.text.light};
    font-size: 13px;

    svg {
      font-size: 14px;
    }
  }
`;

const StatusSelect = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: ${props => {
    switch(props.value) {
      case 'shortlisted': return theme.colors.success + '10';
      case 'rejected': return theme.colors.error + '10';
      case 'reviewed': return theme.colors.accent + '10';
      default: return theme.colors.background;
    }
  }};
  color: ${props => {
    switch(props.value) {
      case 'shortlisted': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'reviewed': return theme.colors.accent;
      default: return theme.colors.text.primary;
    }
  }};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  margin: ${theme.spacing.md} 0;
`;

const SkillTag = styled.span`
  background: ${theme.colors.background};
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
`;

const CoverLetter = styled.div`
  background: ${theme.colors.background};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  margin: ${theme.spacing.md} 0;
  font-style: italic;
  color: ${theme.colors.text.secondary};
  border-left: 3px solid ${theme.colors.primary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  transition: all 0.2s ease;

  ${props => {
    switch(props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: white;
          &:hover { background: ${theme.colors.primary}dd; }
        `;
      case 'success':
        return `
          background: ${theme.colors.success};
          color: white;
          &:hover { background: ${theme.colors.success}dd; }
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning};
          color: white;
          &:hover { background: ${theme.colors.warning}dd; }
        `;
      case 'error':
        return `
          background: ${theme.colors.error};
          color: white;
          &:hover { background: ${theme.colors.error}dd; }
        `;
      default:
        return `
          background: ${theme.colors.background};
          color: ${theme.colors.text.secondary};
          border: 1px solid ${theme.colors.border};
          &:hover { background: ${theme.colors.border}; }
        `;
    }
  }}
`;

const ResumeViewer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
`;

const ResumeContent = styled(motion.div)`
  background: white;
  border-radius: ${theme.borderRadius.large};
  width: 90%;
  max-width: 1000px;
  height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ResumeHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    font-size: 18px;
  }

  button {
    color: ${theme.colors.text.light};
    font-size: 24px;

    &:hover {
      color: ${theme.colors.error};
    }
  }
`;

const ResumeFrame = styled.iframe`
  flex: 1;
  width: 100%;
  border: none;
`;

const NoApplicants = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};

  svg {
    font-size: 60px;
    color: ${theme.colors.text.light};
    margin-bottom: ${theme.spacing.lg};
  }

  h3 {
    font-size: 20px;
    margin-bottom: ${theme.spacing.sm};
  }

  p {
    color: ${theme.colors.text.secondary};
  }
`;

const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedResume, setSelectedResume] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  useEffect(() => {
    filterApplicants();
  }, [activeFilter, applicants]);

  const fetchApplicants = async () => {
    try {
      const res = await API.get(`/applications/job/${jobId}`);
      setApplicants(res.data.applicants || []);
      setJob(res.data.job);
      
      const newStats = {
        total: res.data.applicants?.length || 0,
        pending: res.data.applicants?.filter(a => a.status === 'pending').length || 0,
        shortlisted: res.data.applicants?.filter(a => a.status === 'shortlisted').length || 0,
        rejected: res.data.applicants?.filter(a => a.status === 'rejected').length || 0
      };
      setStats(newStats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setLoading(false);
    }
  };

  const filterApplicants = () => {
    if (activeFilter === 'all') {
      setFilteredApplicants(applicants);
    } else {
      setFilteredApplicants(applicants.filter(a => a.status === activeFilter));
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await API.put(`/applications/${applicationId}/status`, { status: newStatus });
      setApplicants(applicants.map(app =>
        app.application_id === applicationId ? { ...app, status: newStatus } : app
      ));
      toast.success(`Application ${newStatus}`);
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleScheduleInterview = (applicant) => {
    // Implement interview scheduling modal
    toast.success('Interview scheduling feature coming soon!');
  };

  const handleSendMessage = (applicant) => {
    navigate(`/messages?user=${applicant.user_id}`);
  };

  const handleViewResume = (resumeUrl) => {
    if (resumeUrl) {
      setSelectedResume(resumeUrl);
    } else {
      toast.error('No resume uploaded');
    }
  };

  const handleDownloadResume = async (resumeUrl, applicantName) => {
    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${applicantName}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error downloading resume');
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
        onClick={() => navigate('/employer/manage-jobs')}
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiArrowLeft /> Back to Jobs
      </BackButton>

      {job && (
        <Header>
          <h1>Applicants for {job.title}</h1>
          <p>{job.company_name} • {job.location || 'Remote'}</p>
        </Header>
      )}

      {applicants.length > 0 ? (
        <>
          <StatsGrid>
            <StatCard>
              <h3>{stats.total}</h3>
              <p>Total Applicants</p>
            </StatCard>
            <StatCard>
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </StatCard>
            <StatCard>
              <h3>{stats.shortlisted}</h3>
              <p>Shortlisted</p>
            </StatCard>
            <StatCard>
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </StatCard>
          </StatsGrid>

          <FilterTabs>
            <FilterTab
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All
            </FilterTab>
            <FilterTab
              active={activeFilter === 'pending'}
              onClick={() => setActiveFilter('pending')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pending
            </FilterTab>
            <FilterTab
              active={activeFilter === 'reviewed'}
              onClick={() => setActiveFilter('reviewed')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reviewed
            </FilterTab>
            <FilterTab
              active={activeFilter === 'shortlisted'}
              onClick={() => setActiveFilter('shortlisted')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Shortlisted
            </FilterTab>
            <FilterTab
              active={activeFilter === 'rejected'}
              onClick={() => setActiveFilter('rejected')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Rejected
            </FilterTab>
          </FilterTabs>

          <ApplicantsList>
            <AnimatePresence>
              {filteredApplicants.map((applicant, index) => (
                <ApplicantCard
                  key={applicant.application_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ApplicantHeader>
                    <ApplicantInfo>
                      <ApplicantAvatar>
                        {applicant.full_name?.[0] || 'U'}
                      </ApplicantAvatar>
                      <ApplicantDetails>
                        <h3>{applicant.full_name}</h3>
                        <h4>{applicant.headline || 'Professional'}</h4>
                        <ContactInfo>
                          {applicant.email && (
                            <span><FiMail /> {applicant.email}</span>
                          )}
                          {applicant.phone && (
                            <span><FiPhone /> {applicant.phone}</span>
                          )}
                          {applicant.location && (
                            <span><FiMapPin /> {applicant.location}</span>
                          )}
                          <span>
                            <FiCalendar /> Applied {new Date(applicant.applied_date).toLocaleDateString()}
                          </span>
                        </ContactInfo>
                      </ApplicantDetails>
                    </ApplicantInfo>

                    <StatusSelect
                      value={applicant.status}
                      onChange={(e) => handleStatusChange(applicant.application_id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </StatusSelect>
                  </ApplicantHeader>

                  {applicant.skills && (
                    <SkillsContainer>
                      {applicant.skills.split(',').map((skill, i) => (
                        <SkillTag key={i}>{skill.trim()}</SkillTag>
                      ))}
                    </SkillsContainer>
                  )}

                  {applicant.cover_letter && (
                    <CoverLetter>
                      "{applicant.cover_letter}"
                    </CoverLetter>
                  )}

                  <ActionButtons>
                    {applicant.resume_url && (
                      <>
                        <ActionButton
                          variant="primary"
                          onClick={() => handleViewResume(applicant.resume_url)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiEye /> View Resume
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleDownloadResume(applicant.resume_url, applicant.full_name)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiDownload /> Download
                        </ActionButton>
                      </>
                    )}
                    <ActionButton
                      onClick={() => handleScheduleInterview(applicant)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiCalendar /> Schedule Interview
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleSendMessage(applicant)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiMessageSquare /> Message
                    </ActionButton>
                  </ActionButtons>
                </ApplicantCard>
              ))}
            </AnimatePresence>
          </ApplicantsList>
        </>
      ) : (
        <NoApplicants>
          <FiFileText />
          <h3>No applicants yet</h3>
          <p>Check back later for applications</p>
        </NoApplicants>
      )}

      <AnimatePresence>
        {selectedResume && (
          <ResumeViewer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedResume(null)}
          >
            <ResumeContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ResumeHeader>
                <h3>Resume</h3>
                <button onClick={() => setSelectedResume(null)}>
                  <FiXCircle />
                </button>
              </ResumeHeader>
              <ResumeFrame src={selectedResume} title="Resume" />
            </ResumeContent>
          </ResumeViewer>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Applicants;