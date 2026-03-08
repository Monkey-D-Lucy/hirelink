import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiBriefcase, FiMapPin, FiDollarSign, FiClock,
  FiPlus, FiX, FiSave, FiArrowLeft
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

const FormContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.medium};
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
  text-align: center;

  h1 {
    font-size: 32px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const FormSection = styled.div`
  h2 {
    font-size: 18px;
    margin-bottom: ${theme.spacing.lg};
    color: ${theme.colors.text.primary};
    padding-bottom: ${theme.spacing.sm};
    border-bottom: 2px solid ${theme.colors.primary}20;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }

  input, select, textarea {
    width: 100%;
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    font-size: 15px;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px ${theme.colors.primary}20;
    }

    &::placeholder {
      color: ${theme.colors.text.light};
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const SkillsContainer = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  min-height: 40px;
`;

const SkillTag = styled.span`
  background: ${theme.colors.primary}10;
  color: ${theme.colors.primary};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  button {
    color: ${theme.colors.text.light};
    font-size: 16px;
    display: flex;
    align-items: center;

    &:hover {
      color: ${theme.colors.error};
    }
  }
`;

const AddSkillInput = styled.div`
  display: flex;
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

  button {
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    background: ${theme.colors.primary};
    color: white;
    border-radius: ${theme.borderRadius.medium};
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    &:hover {
      background: ${theme.colors.primary}dd;
    }
  }
`;

const SalaryRange = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: ${theme.spacing.sm};
  align-items: center;

  span {
    color: ${theme.colors.text.light};
    font-size: 16px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};

  button {
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    border-radius: ${theme.borderRadius.medium};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    transition: all 0.2s ease;
  }
`;

const CancelButton = styled(motion.button)`
  background: transparent;
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border};

  &:hover {
    background: ${theme.colors.background};
  }
`;

const SubmitButton = styled(motion.button)`
  background: ${theme.gradients.primary};
  color: white;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error}10;
  color: ${theme.colors.error};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.error}30;
`;

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    location: '',
    job_type: 'full_time',
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    experience_required: '',
    expiry_date: '',
    skills_required: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.location) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.salary_min && formData.salary_max && 
        parseInt(formData.salary_min) > parseInt(formData.salary_max)) {
      setError('Minimum salary cannot be greater than maximum salary');
      setLoading(false);
      return;
    }

    try {
      const jobData = {
        ...formData,
        skills_required: skills.join(', ')
      };

      await API.post('/jobs', jobData);
      
      toast.success('Job posted successfully!');
      navigate('/employer/manage-jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      setError(error.response?.data?.message || 'Error posting job');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/employer/dashboard');
  };

  return (
    <Container>
      <BackButton
        onClick={() => navigate('/employer/dashboard')}
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiArrowLeft /> Back to Dashboard
      </BackButton>

      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <h1>Post a New Job</h1>
          <p>Fill in the details below to attract the best candidates</p>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormSection>
            <h2>Basic Information</h2>
            <FormGrid>
              <FormGroup>
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g., Mumbai, Remote, Hybrid"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Job Type *</label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  required
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Experience Required (years)</label>
                <input
                  type="number"
                  name="experience_required"
                  placeholder="e.g., 3"
                  value={formData.experience_required}
                  onChange={handleChange}
                  min="0"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          <FormSection>
            <h2>Compensation</h2>
            <FormGrid>
              <FormGroup>
                <label>Salary Range (per year)</label>
                <SalaryRange>
                  <input
                    type="number"
                    name="salary_min"
                    placeholder="Min"
                    value={formData.salary_min}
                    onChange={handleChange}
                    min="0"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    name="salary_max"
                    placeholder="Max"
                    value={formData.salary_max}
                    onChange={handleChange}
                    min="0"
                  />
                </SalaryRange>
              </FormGroup>

              <FormGroup>
                <label>Currency</label>
                <select
                  name="salary_currency"
                  value={formData.salary_currency}
                  onChange={handleChange}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </FormGroup>
            </FormGrid>
          </FormSection>

          <FormSection>
            <h2>Job Details</h2>
            <FormGroup>
              <label>Job Description *</label>
              <textarea
                name="description"
                placeholder="Describe the role, responsibilities, and ideal candidate..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Responsibilities</label>
              <textarea
                name="responsibilities"
                placeholder="List the key responsibilities..."
                value={formData.responsibilities}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <label>Requirements</label>
              <textarea
                name="requirements"
                placeholder="List the required qualifications and skills..."
                value={formData.requirements}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <label>Benefits</label>
              <textarea
                name="benefits"
                placeholder="List the benefits and perks..."
                value={formData.benefits}
                onChange={handleChange}
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <h2>Skills Required</h2>
            <SkillsContainer>
              <SkillsList>
                {skills.map((skill, index) => (
                  <SkillTag key={index}>
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)}>
                      <FiX />
                    </button>
                  </SkillTag>
                ))}
              </SkillsList>
              <AddSkillInput>
                <input
                  type="text"
                  placeholder="Add a skill (e.g., React, Python, SQL)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button type="button" onClick={handleAddSkill}>
                  <FiPlus /> Add
                </button>
              </AddSkillInput>
            </SkillsContainer>
          </FormSection>

          <FormSection>
            <h2>Application Deadline</h2>
            <FormGrid>
              <FormGroup>
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          <ActionButtons>
            <CancelButton
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </CancelButton>
            <SubmitButton
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiSave /> {loading ? 'Posting...' : 'Post Job'}
            </SubmitButton>
          </ActionButtons>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default PostJob; 