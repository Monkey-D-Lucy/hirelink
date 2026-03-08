import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBriefcase, FiMapPin, FiClock, FiDollarSign,
  FiBookmark, FiX, FiEye
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

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto ${theme.spacing.xl};

  h1 {
    font-size: 32px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
  }
`;

const JobsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
`;

const JobCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.small};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.medium};
  }
`;

const CompanyLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: ${theme.spacing.md};
`;

const JobTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: ${theme.spacing.xs};
`;

const CompanyName = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: ${theme.spacing.md};
`;

const JobDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  font-size: 13px;
  color: ${theme.colors.text.light};

  span {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
  }
`;

const RemoveButton = styled(motion.button)`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  color: ${theme.colors.text.light};
  font-size: 18px;
  padding: ${theme.spacing.xs};

  &:hover {
    color: ${theme.colors.error};
  }
`;

const ViewButton = styled(motion.button)`
  width: 100%;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.primary}10;
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};

  &:hover {
    background: ${theme.colors.primary}20;
  }
`;

const NoJobs = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  max-width: 1200px;
  margin: 0 auto;

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
    margin-bottom: ${theme.spacing.lg};
  }

  a {
    display: inline-block;
    background: ${theme.gradients.primary};
    color: white;
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    border-radius: ${theme.borderRadius.medium};
    font-weight: 500;
  }
`;

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await API.get('/jobs/saved');
      setJobs(res.data.jobs || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setLoading(false);
    }
  };

  const handleRemove = async (jobId, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/jobs/saved/${jobId}`);
      setJobs(jobs.filter(job => job.job_id !== jobId));
      toast.success('Job removed from saved');
    } catch (error) {
      toast.error('Error removing job');
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
      <Header>
        <h1>Saved Jobs</h1>
        <p>Jobs you've saved for later</p>
      </Header>

      {jobs.length === 0 ? (
        <NoJobs>
          <FiBookmark />
          <h3>No saved jobs yet</h3>
          <p>Browse jobs and save the ones you're interested in</p>
          <Link to="/jobs">Browse Jobs</Link>
        </NoJobs>
      ) : (
        <JobsGrid>
          <AnimatePresence>
            {jobs.map((job, index) => (
              <JobCard
                key={job.job_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => window.location.href = `/job/${job.job_id}`}
              >
                <RemoveButton
                  onClick={(e) => handleRemove(job.job_id, e)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </RemoveButton>

                <CompanyLogo>
                  {job.company_name?.[0] || 'H'}
                </CompanyLogo>
                <JobTitle>{job.title}</JobTitle>
                <CompanyName>{job.company_name}</CompanyName>
                
                <JobDetails>
                  <span><FiMapPin /> {job.location || 'Remote'}</span>
                  {job.salary_min && (
                    <span><FiDollarSign /> ₹{job.salary_min.toLocaleString()}</span>
                  )}
                </JobDetails>

                <ViewButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiEye /> View Job
                </ViewButton>
              </JobCard>
            ))}
          </AnimatePresence>
        </JobsGrid>
      )}
    </Container>
  );
};

export default SavedJobs;