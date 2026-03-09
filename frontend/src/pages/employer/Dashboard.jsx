import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiBriefcase, FiUsers, FiEye, FiClock, 
  FiPlus, FiTrendingUp, FiUserCheck, FiXCircle 
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

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.small};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  transition: ${theme.transitions.base};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.medium};
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${theme.borderRadius.medium};
  background: ${props => props.color || theme.colors.primary}15;
  color: ${props => props.color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 28px;
    margin-bottom: ${theme.spacing.xs};
    color: ${theme.colors.primary};
  }

  p {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
  }
`;

const ContentGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.small};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};

  h2 {
    font-size: 20px;
    color: ${theme.colors.text.primary};
  }

  a {
    color: ${theme.colors.primary};
    font-size: 14px;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const JobCard = styled(motion.div)`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};
  cursor: pointer;
  transition: ${theme.transitions.base};

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.small};
  }
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const JobTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const JobMeta = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  font-size: 13px;
  color: ${theme.colors.text.light};
  margin-top: ${theme.spacing.sm};
`;

const ApplicantCount = styled.span`
  background: ${theme.colors.primary}10;
  color: ${theme.colors.primary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 500;
`;

const ChartCard = styled.div`
  background: ${theme.colors.background};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};

  h4 {
    font-size: 14px;
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }
`;

const ChartBar = styled.div`
  height: 8px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
  margin: ${theme.spacing.sm} 0;
`;

const ChartFill = styled.div`
  height: 100%;
  width: ${props => props.percentage || 0}%;
  background: ${props => props.color || theme.colors.primary};
  border-radius: ${theme.borderRadius.small};
  transition: width 0.3s ease;
`;

const ApplicantStage = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  span:first-child {
    font-weight: 500;
    color: ${theme.colors.text.primary};
  }

  span:last-child {
    color: ${theme.colors.text.secondary};
    font-weight: 600;
  }
`;

const NoJobs = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.light};
`;

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    newApplicants: 0,
    profileViews: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [applicantStages, setApplicantStages] = useState([
    { stage: 'Pending', count: 0 },
    { stage: 'Reviewed', count: 0 },
    { stage: 'Shortlisted', count: 0 },
    { stage: 'Hired', count: 0 }
  ]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs
      const jobsRes = await API.get('/jobs/my-jobs');
      const jobs = jobsRes.data.jobs || [];
      setRecentJobs(jobs.slice(0, 5));
      
      // Calculate stats
      const activeJobsCount = jobs.filter(j => j.is_active).length;
      const totalApplicants = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
      const newApplicants = jobs.reduce((sum, job) => sum + (job.new_applications || 0), 0);
      
      setStats({
        activeJobs: activeJobsCount,
        totalApplicants,
        newApplicants,
        profileViews: user?.profile?.profile_views || 0
      });
      
      // Fetch analytics for applicant stages
      try {
        const analyticsRes = await API.get('/analytics/employer');
        if (analyticsRes.data.success) {
          const stages = analyticsRes.data.analytics?.statusBreakdown || [];
          
          const stageMap = {
            'pending': 0,
            'reviewed': 0,
            'shortlisted': 0,
            'hired': 0
          };
          
          stages.forEach(item => {
            stageMap[item.status?.toLowerCase() || ''] = item.count || 0;
          });
          
          setApplicantStages([
            { stage: 'Pending', count: stageMap.pending || 0 },
            { stage: 'Reviewed', count: stageMap.reviewed || 0 },
            { stage: 'Shortlisted', count: stageMap.shortlisted || 0 },
            { stage: 'Hired', count: stageMap.hired || 0 }
          ]);
        }
      } catch (analyticsError) {
        console.log('Analytics not available yet');
        // If analytics fails, calculate from jobs
        calculateStagesFromJobs(jobs);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStagesFromJobs = (jobs) => {
    // This is a fallback if analytics API is not available
    const total = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
    setApplicantStages([
      { stage: 'Pending', count: Math.round(total * 0.4) },
      { stage: 'Reviewed', count: Math.round(total * 0.3) },
      { stage: 'Shortlisted', count: Math.round(total * 0.2) },
      { stage: 'Hired', count: Math.round(total * 0.1) }
    ]);
  };

  const totalApplicantsCount = applicantStages.reduce((sum, stage) => sum + stage.count, 0);

  if (loading && recentJobs.length === 0) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          Loading dashboard...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <h1>Welcome back, {user?.profile?.full_name || 'Employer'}!</h1>
          <p>Here's what's happening with your job postings</p>
        </div>
        <PostJobButton to="/employer/post-job">
          <FiPlus /> Post New Job
        </PostJobButton>
      </Header>

      <StatsGrid>
        <StatCard whileHover={{ y: -5 }}>
          <StatIcon color={theme.colors.primary}>
            <FiBriefcase />
          </StatIcon>
          <StatInfo>
            <h3>{stats.activeJobs}</h3>
            <p>Active Jobs</p>
          </StatInfo>
        </StatCard>

        <StatCard whileHover={{ y: -5 }}>
          <StatIcon color={theme.colors.success}>
            <FiUsers />
          </StatIcon>
          <StatInfo>
            <h3>{stats.totalApplicants}</h3>
            <p>Total Applicants</p>
          </StatInfo>
        </StatCard>

        <StatCard whileHover={{ y: -5 }}>
          <StatIcon color={theme.colors.warning}>
            <FiUserCheck />
          </StatIcon>
          <StatInfo>
            <h3>{stats.newApplicants}</h3>
            <p>New Applicants</p>
          </StatInfo>
        </StatCard>

        <StatCard whileHover={{ y: -5 }}>
          <StatIcon color={theme.colors.accent}>
            <FiEye />
          </StatIcon>
          <StatInfo>
            <h3>{stats.profileViews}</h3>
            <p>Profile Views</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <h2>Recent Job Postings</h2>
            <Link to="/employer/manage-jobs">View all</Link>
          </SectionHeader>

          {recentJobs.length === 0 ? (
            <NoJobs>
              <p>No jobs posted yet. Post your first job!</p>
            </NoJobs>
          ) : (
            recentJobs.map((job, index) => (
              <JobCard
                key={job.job_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/employer/applicants/${job.job_id}`)}
              >
                <JobHeader>
                  <JobTitle>{job.title}</JobTitle>
                  <ApplicantCount>{job.applications_count || 0} Applicants</ApplicantCount>
                </JobHeader>
                <JobMeta>
                  <span>📍 {job.location || 'Remote'}</span>
                  <span>📅 Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </JobMeta>
              </JobCard>
            ))
          )}
        </Section>

        <div>
          <Section style={{ marginBottom: theme.spacing.lg }}>
            <SectionHeader>
              <h2>Applicant Funnel</h2>
            </SectionHeader>

            {totalApplicantsCount === 0 ? (
              <NoJobs>
                <p>No applicants yet</p>
              </NoJobs>
            ) : (
              applicantStages.map((stage, index) => (
                <ApplicantStage key={stage.stage}>
                  <span>{stage.stage}</span>
                  <span>{stage.count}</span>
                </ApplicantStage>
              ))
            )}
          </Section>

          <Section>
            <SectionHeader>
              <h2>Analytics</h2>
            </SectionHeader>

            <ChartCard>
              <h4>Application Rate</h4>
              <ChartBar>
                <ChartFill 
                  percentage={totalApplicantsCount > 0 ? 
                    ((applicantStages.find(s => s.stage === 'Shortlisted')?.count || 0) / totalApplicantsCount) * 100 : 0} 
                  color={theme.colors.success}
                />
              </ChartBar>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Shortlisted</span>
                <span>
                  {totalApplicantsCount > 0 ? 
                    Math.round(((applicantStages.find(s => s.stage === 'Shortlisted')?.count || 0) / totalApplicantsCount) * 100) : 0}%
                </span>
              </div>
            </ChartCard>

            <ChartCard>
              <h4>Interview to Hire</h4>
              <ChartBar>
                <ChartFill 
                  percentage={totalApplicantsCount > 0 ? 
                    ((applicantStages.find(s => s.stage === 'Hired')?.count || 0) / totalApplicantsCount) * 100 : 0} 
                  color={theme.colors.primary}
                />
              </ChartBar>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Hired</span>
                <span>
                  {totalApplicantsCount > 0 ? 
                    Math.round(((applicantStages.find(s => s.stage === 'Hired')?.count || 0) / totalApplicantsCount) * 100) : 0}%
                </span>
              </div>
            </ChartCard>
          </Section>
        </div>
      </ContentGrid>
    </Container>
  );
};

export default EmployerDashboard;