import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit2, FiSave, FiX, FiCamera, FiMapPin,
  FiBriefcase, FiMail, FiPhone, FiLink,
  FiGithub, FiLinkedin, FiAward, FiBookOpen,
  FiUpload, FiCheckCircle, FiEye, FiDownload,
  FiPlus, FiTrash2
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

const ProfileContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
`;

const CoverImage = styled.div`
  height: 200px;
  background: ${theme.gradients.primary};
  border-radius: ${theme.borderRadius.large} ${theme.borderRadius.large} 0 0;
  position: relative;
`;

const ProfileHeader = styled.div`
  background: ${theme.colors.surface};
  padding: 0 ${theme.spacing.xl} ${theme.spacing.xl};
  border-radius: 0 0 ${theme.borderRadius.large} ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.small};
  margin-bottom: ${theme.spacing.xl};
  position: relative;
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${theme.spacing.xl};
  margin-top: -50px;
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: ${theme.borderRadius.round};
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

const AvatarOverlay = styled(motion.label)`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.round};
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid ${theme.colors.surface};

  input {
    display: none;
  }

  &:hover {
    background: ${theme.colors.primary}dd;
  }
`;

const ProfileTitle = styled.div`
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
    margin-bottom: ${theme.spacing.sm};
  }
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

  &:hover {
    background: ${theme.colors.primary}20;
  }
`;

const ProfileStats = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
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

const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};

  span {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    color: ${theme.colors.text.secondary};
    font-size: 14px;
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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};

  h3 {
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    color: ${theme.colors.text.primary};
  }
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const SkillTag = styled.span`
  background: ${theme.colors.primary}10;
  color: ${theme.colors.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const ExperienceItem = styled.div`
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};

  h4 {
    font-size: 16px;
    margin-bottom: ${theme.spacing.xs};
  }

  h5 {
    color: ${theme.colors.text.secondary};
    font-size: 14px;
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.light};
    font-size: 13px;
    margin-bottom: ${theme.spacing.sm};
  }
`;

const CertificateCard = styled.div`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const CertificateInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 16px;
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    color: ${theme.colors.text.secondary};
    font-size: 13px;
    margin-bottom: ${theme.spacing.xs};
  }

  small {
    color: ${theme.colors.text.light};
    font-size: 11px;
    font-family: monospace;
  }
`;

const EditForm = styled(motion.div)`
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

const EditCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;

  h3 {
    font-size: 20px;
    margin-bottom: ${theme.spacing.lg};
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

const FormActions = styled.div`
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

const ResumeUpload = styled.div`
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primary}10;
  }

  input {
    display: none;
  }

  svg {
    font-size: 40px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.md};
  }

  p {
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }

  small {
    color: ${theme.colors.text.light};
    font-size: 12px;
  }
`;

const ProfileStrength = styled.div`
  margin-bottom: ${theme.spacing.lg};

  h4 {
    font-size: 14px;
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }
`;

const StrengthBar = styled.div`
  height: 8px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
  margin-bottom: ${theme.spacing.sm};
`;

const StrengthFill = styled.div`
  height: 100%;
  width: ${props => props.$percentage || 0}%;
  background: ${theme.gradients.primary};
  border-radius: ${theme.borderRadius.small};
  transition: width 0.3s ease;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const ActionButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: ${theme.colors.primary}10;
  color: ${theme.colors.primary};

  &:hover {
    background: ${theme.colors.primary}20;
  }
`;

const SeekerProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [uploadingCert, setUploadingCert] = useState(false);

  // FIXED: Fetch profile data from API with correct response handling
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await API.get('/users/profile');
        console.log('Profile API response:', res.data);
        
        // Your API returns { success: true, user: {...} }
        const userData = res.data.user || res.data;
        const profileData = userData.profile || userData;
        
        setProfile(profileData);
        setSkills(profileData.skills?.split(',').map(s => s.trim()).filter(s => s) || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user context if API fails
        if (user?.profile) {
          setProfile(user.profile);
          setSkills(user.profile.skills?.split(',').map(s => s.trim()).filter(s => s) || []);
        }
      }
    };
    
    fetchProfileData();
    fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const res = await API.get('/certificates');
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  // FIXED: Calculate profile strength with better checks
  const calculateProfileStrength = () => {
    let strength = 0;
    if (profile?.full_name && profile.full_name !== 'Your Name') strength += 10;
    if (profile?.headline && profile.headline !== 'Add a professional headline') strength += 10;
    if (profile?.about) strength += 15;
    if (skills.length > 0) strength += 15;
    if (profile?.resume_url) strength += 15;
    if (profile?.profile_pic_url) strength += 10;
    if (certificates.length > 0) strength += 15;
    return Math.min(100, strength);
  };

  const handleEdit = (section) => {
    const { user_type, ...profileWithoutType } = profile || {};
    setFormData(profileWithoutType);
    setEditing(section);
  };

  // FIXED: Handle save with correct response parsing
  const handleSave = async () => {
    setLoading(true);
    try {
      const { user_type, ...safeData } = formData;
      
      const updatedData = {
        ...safeData,
        skills: skills.join(', ')
      };
      
      console.log('Saving data:', updatedData);
      
      const res = await API.put('/users/profile', updatedData);
      console.log('Save response:', res.data);
      
      // Your API returns { success: true, user: {...} }
      const userData = res.data.user || res.data;
      const updatedProfile = userData.profile || userData;
      
      setProfile(updatedProfile);
      updateUser({ ...user, profile: updatedProfile });
      
      // Update skills from saved data
      const updatedSkills = updatedProfile.skills 
        ? updatedProfile.skills.split(',').map(s => s.trim()).filter(s => s)
        : skills;
      setSkills(updatedSkills);
      
      toast.success('Profile updated successfully');
      setEditing(null);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_pic', file);

    try {
      const res = await API.post('/users/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => ({ ...prev, profile_pic_url: res.data.url }));
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Upload error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error uploading image');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await API.post('/users/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => ({ ...prev, resume_url: res.data.url }));
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error(error.response?.data?.message || 'Error uploading resume');
    }
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const certFormData = new FormData();
    certFormData.append('certificate', file);
    certFormData.append('certificate_name', formData.certificate_name || 'My Certificate');
    certFormData.append('issuing_organization', formData.issuing_organization || '');
    certFormData.append('issue_date', formData.issue_date || '');

    setUploadingCert(true);
    try {
      const res = await API.post('/certificates', certFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        toast.success('Certificate uploaded successfully! SHA-256 hash generated.');
        fetchCertificates();
        setEditing(null);
      }
    } catch (error) {
      console.error('Certificate upload error:', error);
      toast.error(error.response?.data?.message || 'Error uploading certificate');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    
    try {
      await API.delete(`/certificates/${certId}`);
      toast.success('Certificate deleted');
      fetchCertificates();
    } catch (error) {
      toast.error('Error deleting certificate');
    }
  };

  const handleDownloadResume = () => {
    if (profile?.resume_url) {
      window.open(profile.resume_url, '_blank');
    }
  };

  return (
    <Container>
      <ProfileContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CoverImage />
        
        <ProfileHeader>
          <AvatarSection>
            <AvatarWrapper>
              <Avatar>
                {profile?.profile_pic_url ? (
                  <img src={profile.profile_pic_url} alt={profile?.full_name || 'User'} />
                ) : (
                  profile?.full_name?.[0]?.toUpperCase() || 'U'
                )}
              </Avatar>
              <AvatarOverlay
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                as="label"
              >
                <FiCamera />
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </AvatarOverlay>
            </AvatarWrapper>

            <ProfileTitle>
              <h1>
                {profile?.full_name || 'Your Name'}
                <EditButton
                  onClick={() => handleEdit('basic')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit2 /> Edit Profile
                </EditButton>
              </h1>
              <h2>{profile?.headline || 'Add a professional headline'}</h2>
            </ProfileTitle>
          </AvatarSection>

          <ProfileStrength>
            <h4>Profile Strength</h4>
            <StrengthBar>
              <StrengthFill $percentage={calculateProfileStrength()} />
            </StrengthBar>
          </ProfileStrength>

          <ProfileStats>
            <StatItem>
              <span>{profile?.profile_views || 0}</span>
              <small>Profile Views</small>
            </StatItem>
            <StatItem>
              <span>{profile?.applications_count || 0}</span>
              <small>Applications</small>
            </StatItem>
            <StatItem>
              <span>{profile?.saved_jobs_count || 0}</span>
              <small>Saved Jobs</small>
            </StatItem>
          </ProfileStats>

          <ContactInfo>
            {profile?.location && (
              <span><FiMapPin /> {profile.location}</span>
            )}
            {user?.email && (
              <span><FiMail /> {user.email}</span>
            )}
            {profile?.phone && (
              <span><FiPhone /> {profile.phone}</span>
            )}
            {profile?.linkedin_url && (
              <span><FiLinkedin /> <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a></span>
            )}
            {profile?.github_url && (
              <span><FiGithub /> <a href={profile.github_url} target="_blank" rel="noopener noreferrer">GitHub</a></span>
            )}
            {profile?.portfolio_url && (
              <span><FiLink /> <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">Portfolio</a></span>
            )}
          </ContactInfo>
        </ProfileHeader>

        <Section>
          <SectionHeader>
            <h3><FiBookOpen /> About</h3>
            <EditButton
              onClick={() => handleEdit('about')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiEdit2 /> Edit
            </EditButton>
          </SectionHeader>
          <p style={{ lineHeight: 1.6, color: theme.colors.text.secondary }}>
            {profile?.about || 'Add a brief description about yourself, your experience, and your career goals.'}
          </p>
        </Section>

        <Section>
          <SectionHeader>
            <h3><FiAward /> Skills</h3>
            <EditButton
              onClick={() => handleEdit('skills')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiEdit2 /> Edit
            </EditButton>
          </SectionHeader>
          <SkillsList>
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <SkillTag key={index}>{skill}</SkillTag>
              ))
            ) : (
              <p style={{ color: theme.colors.text.light }}>No skills added yet</p>
            )}
          </SkillsList>
        </Section>

        <Section>
          <SectionHeader>
            <h3><FiBriefcase /> Experience</h3>
            <EditButton
              onClick={() => handleEdit('experience')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiEdit2 /> Add Experience
            </EditButton>
          </SectionHeader>
          {profile?.experience && profile.experience.position ? (
            <ExperienceItem>
              <h4>{profile.experience.position}</h4>
              <h5>{profile.experience.company}</h5>
              <p>{profile.experience.duration}</p>
              <p style={{ color: theme.colors.text.secondary }}>{profile.experience.description}</p>
            </ExperienceItem>
          ) : (
            <p style={{ color: theme.colors.text.light }}>No experience added yet</p>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <h3><FiAward /> Certificates & Badges</h3>
            <EditButton
              onClick={() => handleEdit('certificate')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus /> Add Certificate
            </EditButton>
          </SectionHeader>
          
          {certificates.length > 0 ? (
            certificates.map((cert) => (
              <CertificateCard key={cert.certificate_id}>
                <CertificateInfo>
                  <h4>{cert.certificate_name}</h4>
                  <p>Issued by: {cert.issuing_organization || 'Not specified'}</p>
                  <p>Issue Date: {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'Not specified'}</p>
                  <small>SHA-256: {cert.certificate_hash?.substring(0, 32)}...</small>
                </CertificateInfo>
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                  <ActionButton
                    onClick={() => window.open(`/certificates/verify/${cert.certificate_hash}`, '_blank')}
                  >
                    <FiEye /> Verify
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDeleteCertificate(cert.certificate_id)}
                  >
                    <FiTrash2 /> Delete
                  </ActionButton>
                </div>
              </CertificateCard>
            ))
          ) : (
            <p style={{ color: theme.colors.text.light }}>No certificates added yet. Add your certifications to build trust!</p>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <h3><FiUpload /> Resume</h3>
          </SectionHeader>
          {profile?.resume_url ? (
            <div>
              <p style={{ color: theme.colors.success, marginBottom: theme.spacing.md }}>
                <FiCheckCircle /> Resume uploaded
              </p>
              <ActionButtons>
                <ActionButton
                  onClick={() => window.open(profile.resume_url, '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEye /> View
                </ActionButton>
                <ActionButton
                  onClick={handleDownloadResume}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiDownload /> Download
                </ActionButton>
              </ActionButtons>
            </div>
          ) : (
            <ResumeUpload as="label">
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
              <FiUpload />
              <p>Upload your resume</p>
              <small>PDF, DOC, DOCX (Max 5MB)</small>
            </ResumeUpload>
          )}
        </Section>
      </ProfileContainer>

      <AnimatePresence>
        {editing && (
          <EditForm
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditing(null)}
          >
            <EditCard
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                {editing === 'basic' && 'Edit Basic Information'}
                {editing === 'about' && 'Edit About'}
                {editing === 'skills' && 'Edit Skills'}
                {editing === 'experience' && 'Edit Experience'}
                {editing === 'certificate' && 'Add Certificate'}
              </h3>
              
              {editing === 'basic' && (
                <>
                  <FormGroup>
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={formData?.full_name || ''}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Headline</label>
                    <input
                      type="text"
                      value={formData?.headline || ''}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="e.g., Senior Software Engineer at Google"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Location</label>
                    <input
                      type="text"
                      value={formData?.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Mumbai, India"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData?.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData?.linkedin_url || ''}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>GitHub URL</label>
                    <input
                      type="url"
                      value={formData?.github_url || ''}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Portfolio URL</label>
                    <input
                      type="url"
                      value={formData?.portfolio_url || ''}
                      onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    />
                  </FormGroup>
                </>
              )}

              {editing === 'about' && (
                <FormGroup>
                  <label>About</label>
                  <textarea
                    value={formData?.about || ''}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows="6"
                  />
                </FormGroup>
              )}

              {editing === 'skills' && (
                <>
                  <SkillsList>
                    {skills.map((skill, index) => (
                      <SkillTag key={index}>
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          style={{ 
                            marginLeft: theme.spacing.xs, 
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <FiX size={14} />
                        </button>
                      </SkillTag>
                    ))}
                  </SkillsList>
                  <FormGroup>
                    <label>Add New Skill</label>
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g., React, Python, SQL"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <SaveButton
                        type="button"
                        onClick={handleAddSkill}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ padding: theme.spacing.sm }}
                      >
                        Add
                      </SaveButton>
                    </div>
                  </FormGroup>
                  <p style={{ fontSize: '12px', color: theme.colors.text.light, marginTop: theme.spacing.md }}>
                    Note: Don't forget to click "Save Changes" to save your skills
                  </p>
                </>
              )}

              {editing === 'experience' && (
                <>
                  <FormGroup>
                    <label>Position</label>
                    <input
                      type="text"
                      value={formData?.experience?.position || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData?.experience, position: e.target.value }
                      })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Company</label>
                    <input
                      type="text"
                      value={formData?.experience?.company || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData?.experience, company: e.target.value }
                      })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Duration</label>
                    <input
                      type="text"
                      value={formData?.experience?.duration || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData?.experience, duration: e.target.value }
                      })}
                      placeholder="e.g., 2020 - Present"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Description</label>
                    <textarea
                      value={formData?.experience?.description || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData?.experience, description: e.target.value }
                      })}
                      rows="4"
                    />
                  </FormGroup>
                </>
              )}

              {editing === 'certificate' && (
                <>
                  <FormGroup>
                    <label>Certificate Name *</label>
                    <input
                      type="text"
                      value={formData?.certificate_name || ''}
                      onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                      placeholder="e.g., JavaScript Certification"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Issuing Organization</label>
                    <input
                      type="text"
                      value={formData?.issuing_organization || ''}
                      onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                      placeholder="e.g., Google, Microsoft"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Issue Date</label>
                    <input
                      type="date"
                      value={formData?.issue_date || ''}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Certificate File *</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={handleCertificateUpload}
                      disabled={uploadingCert}
                    />
                    {uploadingCert && (
                      <small style={{ color: theme.colors.primary, display: 'block', marginTop: theme.spacing.xs }}>
                        Uploading and generating SHA-256 hash...
                      </small>
                    )}
                    <small style={{ color: theme.colors.text.light, display: 'block', marginTop: theme.spacing.xs }}>
                      PDF, JPG, PNG (Max 5MB) - SHA-256 hash will be generated for verification
                    </small>
                  </FormGroup>
                </>
              )}

              <FormActions>
                <CancelButton
                  onClick={() => setEditing(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </CancelButton>
                {editing !== 'certificate' && (
                  <SaveButton
                    onClick={handleSave}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                  </SaveButton>
                )}
              </FormActions>
            </EditCard>
          </EditForm>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default SeekerProfile;