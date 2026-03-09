import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBriefcase, FiMapPin, FiClock, FiUsers,
  FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiCopy, FiMoreVertical, FiPlus, FiX, FiSave
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
  flex-wrap: wrap;
  gap: ${theme.spacing.md};

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
  transition: ${theme.transitions.base};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.primary};
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
  background: ${props => props.$active ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.$active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? theme.colors.primary : theme.colors.background};
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
  border-left: 4px solid ${props => props.$active ? theme.colors.success : theme.colors.border};
`;

const JobHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const JobTitle = styled.div`
  flex: 1;

  h3 {
    font-size: 18px;
    margin-bottom: ${theme.spacing.xs};
    cursor: pointer;
    color: ${theme.colors.primary};

    &:hover {
      color: ${theme.colors.secondary};
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
  background: ${props => props.$active ? theme.colors.success + '20' : theme.colors.error + '20'};
  color: ${props => props.$active ? theme.colors.success : theme.colors.error};
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
  flex-wrap: wrap;
  margin-top: ${theme.spacing.md};
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
    switch(props.$variant) {
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
          border: 1px solid ${theme.colors.border};
          &:hover { background: ${theme.colors.border}; }
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
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  text-align: left;
  color: ${props => props.$delete ? theme.colors.error : theme.colors.text.primary};
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 14px;

  &:hover {
    background: ${theme.colors.background};
  }
`;

const NoJobs = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  max-width: 600px;
  margin: 0 auto;

  svg {
    font-size: 60px;
    color: ${theme.colors.text.light};
    margin-bottom: ${theme.spacing.lg};
  }

  h3 {
    font-size: 24px;
    margin-bottom: ${theme.spacing.sm};
    color: ${theme.colors.text.primary};
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
    font-weight: 600;
    transition: ${theme.transitions.base};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.primary};
    }
  }
`;

// Edit Modal Components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
`;

const ModalContent = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};

  h2 {
    font-size: 24px;
    color: ${theme.colors.primary};
  }

  button {
    color: ${theme.colors.text.light};
    font-size: 24px;

    &:hover {
      color: ${theme.colors.error};
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }

  input, textarea, select {
    width: 100%;
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    font-size: 15px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
`;

const SaveButton = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.gradients.primary};
  color: white;
  border-radius: ${theme.borderRadius.medium};
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: transparent;
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 600;

  &:hover {
    background: ${theme.colors.background};
  }
`;

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
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
      setLoading(true);
      const res = await API.get('/jobs/my-jobs');
      const jobsData = res.data.jobs || res.data || [];
      setJobs(jobsData);
      
      const newStats = {
        total: jobsData.length,
        active: jobsData.filter(j => j.is_active).length,
        expired: jobsData.filter(j => !j.is_active || new Date(j.expiry_date) < new Date()).length,
        totalApplicants: jobsData.reduce((sum, job) => sum + (job.applications_count || 0), 0)
      };
      setStats(newStats);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
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

  const handleEditClick = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      job_type: job.job_type || 'full_time',
      expiry_date: job.expiry_date ? job.expiry_date.split('T')[0] : ''
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await API.put(`/jobs/${editingJob.job_id}`, editFormData);
      
      // Update local state
      setJobs(jobs.map(job => 
        job.job_id === editingJob.job_id ? { ...job, ...editFormData } : job
      ));
      
      toast.success('Job updated successfully');
      setEditingJob(null);
    } catch (error) {
      toast.error('Error updating job');
    } finally {
      setSaving(false);
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

  const handleViewApplicants = (jobId) => {
    navigate(`/employer/applicants/${jobId}`);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          Loading jobs...
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

      {jobs.length > 0 && (
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
              $active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All Jobs
            </FilterTab>
            <FilterTab
              $active={activeFilter === 'active'}
              onClick={() => setActiveFilter('active')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Active
            </FilterTab>
            <FilterTab
              $active={activeFilter === 'expired'}
              onClick={() => setActiveFilter('expired')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Expired
            </FilterTab>
          </FilterTabs>
        </>
      )}

      <JobsList>
        <AnimatePresence>
          {filteredJobs.length === 0 ? (
            <NoJobs>
              <FiBriefcase />
              <h3>No jobs posted yet</h3>
              <p>Post your first job to start receiving applications</p>
              <Link to="/employer/post-job">Post a Job</Link>
            </NoJobs>
          ) : (
            filteredJobs.map((job, index) => (
              <JobCard
                key={job.job_id}
                $active={job.is_active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <JobHeader>
                  <JobTitle>
                    <h3 onClick={() => handleViewApplicants(job.job_id)}>
                      {job.title}
                    </h3>
                    <p>Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                  </JobTitle>
                  <StatusBadge $active={job.is_active}>
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
                    $variant="view"
                    onClick={() => handleViewApplicants(job.job_id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiUsers /> View Applicants
                  </ActionButton>
                  <ActionButton
                    $variant="edit"
                    onClick={() => handleEditClick(job)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiEdit2 /> Edit
                  </ActionButton>
                  <ActionButton
                    $variant="toggle"
                    onClick={() => handleToggleStatus(job.job_id, job.is_active)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {job.is_active ? <FiEyeOff /> : <FiEye />}
                    {job.is_active ? 'Deactivate' : 'Activate'}
                  </ActionButton>
                  <ActionButton
                    $variant="delete"
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
                    <DropdownItem $delete onClick={() => handleDeleteJob(job.job_id)}>
                      <FiTrash2 /> Delete
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </JobCard>
            ))
          )}
        </AnimatePresence>
      </JobsList>

      {/* Edit Job Modal */}
      <AnimatePresence>
        {editingJob && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingJob(null)}
          >
            <ModalContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>Edit Job</h2>
                <button onClick={() => setEditingJob(null)}>
                  <FiX />
                </button>
              </ModalHeader>

              <FormGroup>
                <label>Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  placeholder="e.g., Senior Software Engineer"
                />
              </FormGroup>

              <FormGroup>
                <label>Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="4"
                  placeholder="Describe the role, responsibilities..."
                />
              </FormGroup>

              <FormGroup>
                <label>Requirements</label>
                <textarea
                  name="requirements"
                  value={editFormData.requirements}
                  onChange={handleEditChange}
                  rows="3"
                  placeholder="List the required qualifications..."
                />
              </FormGroup>

              <FormGroup>
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditChange}
                  placeholder="e.g., Mumbai, Remote"
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>Min Salary</label>
                  <input
                    type="number"
                    name="salary_min"
                    value={editFormData.salary_min}
                    onChange={handleEditChange}
                    placeholder="Min"
                  />
                </FormGroup>
                <FormGroup>
                  <label>Max Salary</label>
                  <input
                    type="number"
                    name="salary_max"
                    value={editFormData.salary_max}
                    onChange={handleEditChange}
                    placeholder="Max"
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <label>Job Type</label>
                <select
                  name="job_type"
                  value={editFormData.job_type}
                  onChange={handleEditChange}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={editFormData.expiry_date}
                  onChange={handleEditChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormGroup>

              <ModalActions>
                <CancelButton
                  onClick={() => setEditingJob(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </CancelButton>
                <SaveButton
                  onClick={handleEditSave}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </SaveButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ManageJobs;