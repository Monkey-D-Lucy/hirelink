import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBriefcase, FiMapPin, FiClock, FiUsers,
  FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiCopy, FiMoreVertical, FiPlus
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
  max-width: 1400px;
  margin: 0 auto ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;

  div {
    h1 {
      font-size: 32px;
      color: ${theme.colors.primary};
      margin-bottom: ${theme.spacing.xs};
    }

    p {
      color: ${theme.colors.text.secondary};
    }
  }
`;

const PostJobButton = styled(Link)`
  background: ${theme.gradients.primary};
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
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
    font-size: 32px;
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

const JobsList = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const JobCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.small};
  position: relative;
`;

const JobHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
`;

const JobTitle = styled.div`
  h3 {
    font-size: 18px;
    margin-bottom: ${theme.spacing.xs};
    cursor: pointer;

    &:hover {
      color: ${theme.colors.primary};
    }
  }

  p {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
  }
`;

const StatusBadge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.active ? theme.colors.success + '20' : theme.colors.error + '20'};
  color: ${props => props.active ? theme.colors.success : theme.colors.error};
`;

const JobMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.text.light};
  font-size: 13px;

  svg {
    font-size: 16px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;

  span {
    display: block;
    font-size: 20px;
    font-weight: 600;
    color: ${theme.colors.primary};
  }

  small {
    color: ${theme.colors.text.light};
    font-size: 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
`;

const ActionButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  transition: all 0.2s ease;

  ${props => {
    switch(props.variant) {
      case 'edit':
        return `
          background: ${theme.colors.primary}10;
          color: ${theme.colors.primary};
          &:hover { background: ${theme.colors.primary}20; }
        `;
      case 'view':
        return `
          background: ${theme.colors.accent}10;
          color: ${theme.colors.accent};
          &:hover { background: ${theme.colors.accent}20; }
        `;
      case 'delete':
        return `
          background: ${theme.colors.error}10;
          color: ${theme.colors.error};
          &:hover { background: ${theme.colors.error}20; }
        `;
      case 'toggle':
        return `
          background: ${theme.colors.background};
          color: ${theme.colors.text.secondary};
          &:hover { background: ${theme.colors.border}; }
        `;
      default:
        return `
          background: ${theme.colors.background};
          color: ${theme.colors.text.secondary};
          &:hover { background: ${theme.colors.border}; }
        `;
    }
  }}
`;

const MenuButton = styled(motion.button)`
  position: absolute;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  color: ${theme.colors.text.light};
  font-size: 20px;
  padding: ${theme.spacing.xs};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 50px;
  right: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.large};
  overflow: hidden;
  z-index: 10;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  text-align: left;
  color: ${theme.colors.text.primary};
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background: ${theme.colors.background};
  }

  ${props => props.delete && `
    color: ${theme.colors.error};
  `}
`;

const NoJobs = styled.div`
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

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalApplicants: 0
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [activeFilter, jobs]);

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs/my-jobs');
      setJobs(res.data);
      
      const newStats = {
        total: res.data.length,
        active: res.data.filter(j => j.is_active).length,
        expired: res.data.filter(j => !j.is_active || new Date(j.expiry_date) < new Date()).length,
        totalApplicants: res.data.reduce((sum, job) => sum + (job.applications_count || 0), 0)
      };
      setStats(newStats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const filterJobs = () => {
    if (activeFilter === 'all') {
      setFilteredJobs(jobs);
    } else if (activeFilter === 'active') {
      setFilteredJobs(jobs.filter(j => j.is_active));
    } else if (activeFilter === 'expired') {
      setFilteredJobs(jobs.filter(j => !j.is_active));
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      await API.put(`/jobs/${jobId}`, { is_active: !currentStatus });
      setJobs(jobs.map(job => 
        job.job_id === jobId ? { ...job, is_active: !currentStatus } : job
      ));
      toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Error updating job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(job => job.job_id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      toast.error('Error deleting job');
    }
  };

  const handleDuplicateJob = async (job) => {
    try {
      const duplicateData = {
        ...job,
        title: `${job.title} (Copy)`,
        is_active: false
      };
      delete duplicateData.job_id;
      delete duplicateData.created_at;
      delete duplicateData.applications_count;

      await API.post('/jobs', duplicateData);
      toast.success('Job duplicated successfully');
      fetchJobs();
    } catch (error) {
      toast.error('Error duplicating job');
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
        <div>
          <h1>Manage Jobs</h1>
          <p>View and manage your job postings</p>
        </div>
        <PostJobButton to="/employer/post-job">
          <FiPlus /> Post New Job
        </PostJobButton>
      </Header>

      {jobs.length > 0 ? (
        <>
          <StatsGrid>
            <StatCard>
              <h3>{stats.total}</h3>
              <p>Total Jobs</p>
            </StatCard>
            <StatCard>
              <h3>{stats.active}</h3>
              <p>Active</p>
            </StatCard>
            <StatCard>
              <h3>{stats.expired}</h3>
              <p>Expired</p>
            </StatCard>
            <StatCard>
              <h3>{stats.totalApplicants}</h3>
              <p>Total Applicants</p>
            </StatCard>
          </StatsGrid>

          <FilterTabs>
            <FilterTab
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All Jobs
            </FilterTab>
            <FilterTab
              active={activeFilter === 'active'}
              onClick={() => setActiveFilter('active')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Active
            </FilterTab>
            <FilterTab
              active={activeFilter === 'expired'}
              onClick={() => setActiveFilter('expired')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Expired
            </FilterTab>
          </FilterTabs>

          <JobsList>
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobHeader>
                    <JobTitle>
                      <h3 onClick={() => navigate(`/employer/applicants/${job.job_id}`)}>
                        {job.title}
                      </h3>
                      <p>Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                    </JobTitle>
                    <StatusBadge active={job.is_active}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </JobHeader>

                  <JobMeta>
                    <MetaItem>
                      <FiMapPin /> {job.location || 'Remote'}
                    </MetaItem>
                    <MetaItem>
                      <FiBriefcase /> {job.job_type?.replace('_', ' ')}
                    </MetaItem>
                    <MetaItem>
                      <FiClock /> Expires: {new Date(job.expiry_date).toLocaleDateString()}
                    </MetaItem>
                  </JobMeta>

                  <StatsRow>
                    <StatItem>
                      <span>{job.applications_count || 0}</span>
                      <small>Applicants</small>
                    </StatItem>
                    <StatItem>
                      <span>{job.views_count || 0}</span>
                      <small>Views</small>
                    </StatItem>
                  </StatsRow>

                  <ActionButtons>
                    <ActionButton
                      variant="view"
                      onClick={() => navigate(`/employer/applicants/${job.job_id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiUsers /> View Applicants
                    </ActionButton>
                    <ActionButton
                      variant="edit"
                      onClick={() => navigate(`/employer/edit-job/${job.job_id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiEdit2 /> Edit
                    </ActionButton>
                    <ActionButton
                      variant="toggle"
                      onClick={() => handleToggleStatus(job.job_id, job.is_active)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {job.is_active ? <FiEyeOff /> : <FiEye />}
                      {job.is_active ? 'Deactivate' : 'Activate'}
                    </ActionButton>
                    <ActionButton
                      variant="delete"
                      onClick={() => handleDeleteJob(job.job_id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiTrash2 /> Delete
                    </ActionButton>
                  </ActionButtons>

                  <MenuButton
                    onClick={() => setOpenMenuId(openMenuId === job.job_id ? null : job.job_id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiMoreVertical />
                  </MenuButton>

                  {openMenuId === job.job_id && (
                    <DropdownMenu
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <DropdownItem onClick={() => handleDuplicateJob(job)}>
                        <FiCopy /> Duplicate
                      </DropdownItem>
                      <DropdownItem delete onClick={() => handleDeleteJob(job.job_id)}>
                        <FiTrash2 /> Delete
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </JobCard>
              ))}
            </AnimatePresence>
          </JobsList>
        </>
      ) : (
        <NoJobs>
          <FiBriefcase />
          <h3>No jobs posted yet</h3>
          <p>Post your first job to start receiving applications</p>
          <Link to="/employer/post-job">Post a Job</Link>
        </NoJobs>
      )}
    </Container>
  );
};

export default ManageJobs;