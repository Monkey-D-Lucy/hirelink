import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiMapPin, FiBriefcase, FiDollarSign, 
  FiClock, FiFilter, FiX, FiBookmark, FiBookOpen 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { theme } from '../../styles/theme';

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

  h1 {
    font-size: 32px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
  }
`;

const SearchSection = styled.div`
  max-width: 1400px;
  margin: 0 auto ${theme.spacing.xl};
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;

  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const SearchBar = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: ${theme.spacing.md};
    color: ${theme.colors.text.light};
    font-size: 20px;
  }

  input {
    width: 100%;
    padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 48px;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    font-size: 16px;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px ${theme.colors.primary}20;
    }
  }
`;

const FilterButton = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.active ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-weight: 500;
  transition: all 0.2s ease;

  svg {
    font-size: 18px;
  }

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const FiltersPanel = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto ${theme.spacing.xl};
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.medium};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
`;

const FilterGroup = styled.div`
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }

  select {
    width: 100%;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    font-size: 14px;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }
`;

const RangeInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  input {
    flex: 1;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
    }
  }

  span {
    color: ${theme.colors.text.light};
  }
`;

const ClearFilters = styled.button`
  color: ${theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
  text-decoration: underline;
  margin-top: ${theme.spacing.sm};

  &:hover {
    color: ${theme.colors.secondary};
  }
`;

const JobsGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
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

    .save-button {
      opacity: 1;
    }
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
  color: ${theme.colors.text.primary};
`;

const CompanyName = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: ${theme.spacing.md};
`;

const JobDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm} ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  font-size: 13px;
  color: ${theme.colors.text.light};

  span {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
  }
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

const SkillTag = styled.span`
  background: ${theme.colors.background};
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
`;

const JobFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
`;

const PostedDate = styled.span`
  color: ${theme.colors.text.light};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const SaveButton = styled(motion.button)`
  color: ${props => props.saved ? theme.colors.secondary : theme.colors.text.light};
  font-size: 20px;
  opacity: ${props => props.saved ? 1 : 0.5};
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.secondary};
    opacity: 1;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.text.light};

  svg {
    font-size: 60px;
    margin-bottom: ${theme.spacing.lg};
    opacity: 0.5;
  }

  h3 {
    font-size: 20px;
    margin-bottom: ${theme.spacing.sm};
  }

  p {
    margin-bottom: ${theme.spacing.lg};
  }

  button {
    background: ${theme.gradients.primary};
    color: white;
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    border-radius: ${theme.borderRadius.medium};
    font-weight: 500;

    &:hover {
      opacity: 0.9;
    }
  }
`;

const Pagination = styled.div`
  max-width: 1400px;
  margin: ${theme.spacing.xl} auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
`;

const PageButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.medium};
  background: ${props => props.active ? theme.colors.primary : theme.colors.surface};
  color: ${props => props.active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.primary : theme.colors.background};
    border-color: ${theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const JobListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    salaryMin: '',
    salaryMax: '',
    experienceLevel: ''
  });

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [currentPage]);

  useEffect(() => {
    applyFilters();
  }, [filters, jobs]);

  const fetchJobs = async () => {
    try {
      const res = await API.get(`/jobs?page=${currentPage}&limit=12`);
      setJobs(res.data.jobs || []);
      setFilteredJobs(res.data.jobs || []);
      setTotalPages(res.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await API.get('/jobs/saved');
      const saved = new Set(res.data.map(job => job.job_id));
      setSavedJobs(saved);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => job.job_type === filters.jobType);
    }

    if (filters.salaryMin) {
      filtered = filtered.filter(job => 
        (job.salary_min || 0) >= parseInt(filters.salaryMin)
      );
    }

    if (filters.salaryMax) {
      filtered = filtered.filter(job => 
        (job.salary_max || Infinity) <= parseInt(filters.salaryMax)
      );
    }

    setFilteredJobs(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleSaveJob = async (jobId, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        await API.delete(`/jobs/saved/${jobId}`);
        savedJobs.delete(jobId);
      } else {
        await API.post('/jobs/saved', { job_id: jobId });
        savedJobs.add(jobId);
      }
      setSavedJobs(new Set(savedJobs));
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      salaryMin: '',
      salaryMax: '',
      experienceLevel: ''
    });
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
        <h1>Find Your Dream Job</h1>
        <p>Discover opportunities that match your skills and aspirations</p>
      </Header>

      <SearchSection>
        <SearchBar>
          <FiSearch />
          <input
            type="text"
            placeholder="Search by job title, company, or keywords..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          />
        </SearchBar>

        <FilterButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          active={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter /> Filters
        </FilterButton>
      </SearchSection>

      <AnimatePresence>
        {showFilters && (
          <FiltersPanel
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FilterGroup>
              <label>Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="bangalore">Bangalore</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="chennai">Chennai</option>
                <option value="pune">Pune</option>
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>Experience Level</label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
              >
                <option value="">Any Experience</option>
                <option value="0">Fresher (0-1 years)</option>
                <option value="2">Junior (1-3 years)</option>
                <option value="4">Mid-Level (3-5 years)</option>
                <option value="6">Senior (5+ years)</option>
                <option value="8">Lead (8+ years)</option>
              </select>
            </FilterGroup>

            <FilterGroup>
              <label>Salary Range (per year)</label>
              <RangeInput>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                />
              </RangeInput>
            </FilterGroup>

            <ClearFilters onClick={clearFilters}>
              Clear all filters
            </ClearFilters>
          </FiltersPanel>
        )}
      </AnimatePresence>

      {filteredJobs.length === 0 ? (
        <NoResults>
          <FiBookOpen />
          <h3>No jobs found</h3>
          <p>Try adjusting your search filters or check back later</p>
          <button onClick={clearFilters}>Clear Filters</button>
        </NoResults>
      ) : (
        <>
          <JobsGrid>
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/job/${job.job_id}`)}
                >
                  <CompanyLogo>
                    {job.company_name?.[0] || 'H'}
                  </CompanyLogo>
                  <JobTitle>{job.title}</JobTitle>
                  <CompanyName>{job.company_name}</CompanyName>
                  
                  <JobDetails>
                    <span>
                      <FiMapPin /> {job.location || 'Remote'}
                    </span>
                    <span>
                      <FiBriefcase /> {job.job_type?.replace('_', ' ')}
                    </span>
                    {job.salary_min && (
                      <span>
                        <FiDollarSign /> ₹{job.salary_min.toLocaleString()}
                        {job.salary_max && ` - ₹${job.salary_max.toLocaleString()}`}
                      </span>
                    )}
                  </JobDetails>

                  {job.skills_required && (
                    <SkillsContainer>
                      {job.skills_required.split(',').slice(0, 4).map((skill, i) => (
                        <SkillTag key={i}>{skill.trim()}</SkillTag>
                      ))}
                      {job.skills_required.split(',').length > 4 && (
                        <SkillTag>+{job.skills_required.split(',').length - 4}</SkillTag>
                      )}
                    </SkillsContainer>
                  )}

                  <JobFooter>
                    <PostedDate>
                      <FiClock /> {new Date(job.created_at).toLocaleDateString()}
                    </PostedDate>
                    {user && (
                      <SaveButton
                        className="save-button"
                        saved={savedJobs.has(job.job_id)}
                        onClick={(e) => handleSaveJob(job.job_id, e)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiBookmark />
                      </SaveButton>
                    )}
                  </JobFooter>
                </JobCard>
              ))}
            </AnimatePresence>
          </JobsGrid>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ‹
              </PageButton>
              
              {[...Array(totalPages)].map((_, i) => (
                <PageButton
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {i + 1}
                </PageButton>
              ))}

              <PageButton
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ›
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default JobListings;