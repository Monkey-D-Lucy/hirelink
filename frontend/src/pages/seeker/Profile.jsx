import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit2, FiSave, FiX, FiCamera, FiMapPin,
  FiBriefcase, FiMail, FiPhone, FiLink,
  FiGithub, FiLinkedin, FiAward, FiBookOpen,
  FiGlobe, FiUpload, FiCheckCircle
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
  width: ${props => props.percentage}%;
  background: ${theme.gradients.primary};
  border-radius: ${theme.borderRadius.small};
  transition: width 0.3s ease;
`;

const SeekerProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user?.profile || {});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setProfile(user.profile);
      setSkills(user.profile.skills?.split(',').map(s => s.trim()) || []);
    }
  }, [user]);

  const calculateProfileStrength = () => {
    let strength = 0;
    if (profile.full_name) strength += 15;
    if (profile.headline) strength += 15;
    if (profile.about) strength += 20;
    if (skills.length > 0) strength += 20;
    if (profile.resume_url) strength += 15;
    if (profile.profile_pic_url) strength += 15;
    return strength;
  };

  const handleEdit = (section) => {
    setFormData(profile);
    setEditing(section);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        skills: skills.join(', ')
      };
      
      const res = await API.put('/users/profile', updatedData);
      updateUser({ ...user, profile: res.data.profile });
      setProfile(res.data.profile);
      toast.success('Profile updated successfully');
      setEditing(null);
    } catch (error) {
      toast.error('Error updating profile');
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
      const res = await API.post('/users/upload-profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, profile_pic_url: res.data.url });
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Error uploading image');
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
      setProfile({ ...profile, resume_url: res.data.url });
      toast.success('Resume uploaded successfully');
    } catch (error) {
      toast.error('Error uploading resume');
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
                {profile.profile_pic_url ? (
                  <img src={profile.profile_pic_url} alt={profile.full_name} />
                ) : (
                  profile.full_name?.[0] || 'U'
                )}
              </Avatar>
              <AvatarOverlay
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiCamera />
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </AvatarOverlay>
            </AvatarWrapper>

            <ProfileTitle>
              <h1>
                {profile.full_name || 'Your Name'}
                <EditButton
                  onClick={() => handleEdit('basic')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit2 /> Edit Profile
                </EditButton>
              </h1>
              <h2>{profile.headline || 'Add a professional headline'}</h2>
            </ProfileTitle>
          </AvatarSection>

          <ProfileStrength>
            <h4>Profile Strength</h4>
            <StrengthBar>
              <StrengthFill percentage={calculateProfileStrength()} />
            </StrengthBar>
          </ProfileStrength>

          <ProfileStats>
            <StatItem>
              <span>{profile.profile_views || 0}</span>
              <small>Profile Views</small>
            </StatItem>
            <StatItem>
              <span>{profile.applications_count || 0}</span>
              <small>Applications</small>
            </StatItem>
            <StatItem>
              <span>{profile.saved_jobs_count || 0}</span>
              <small>Saved Jobs</small>
            </StatItem>
          </ProfileStats>

          <ContactInfo>
            {profile.location && (
              <span><FiMapPin /> {profile.location}</span>
            )}
            {profile.email && (
              <span><FiMail /> {profile.email}</span>
            )}
            {profile.phone && (
              <span><FiPhone /> {profile.phone}</span>
            )}
            {profile.linkedin_url && (
              <span><FiLinkedin /> <a href={profile.linkedin_url} target="_blank">LinkedIn</a></span>
            )}
            {profile.github_url && (
              <span><FiGithub /> <a href={profile.github_url} target="_blank">GitHub</a></span>
            )}
            {profile.portfolio_url && (
              <span><FiLink /> <a href={profile.portfolio_url} target="_blank">Portfolio</a></span>
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
            {profile.about || 'Add a brief description about yourself, your experience, and your career goals.'}
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
          {profile.experience ? (
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
            <h3><FiUpload /> Resume</h3>
          </SectionHeader>
          {profile.resume_url ? (
            <div>
              <p style={{ color: theme.colors.success, marginBottom: theme.spacing.md }}>
                <FiCheckCircle /> Resume uploaded
              </p>
              <ActionButtons>
                <ActionButton
                  onClick={() => window.open(profile.resume_url)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEye /> View
                </ActionButton>
                <ActionButton
                  onClick={() => {/* Download resume */}}
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
          >
            <EditCard
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3>Edit {editing === 'basic' ? 'Basic Information' : 
                         editing === 'about' ? 'About' : 
                         editing === 'skills' ? 'Skills' : 'Experience'}</h3>
              
              {editing === 'basic' && (
                <>
                  <FormGroup>
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Headline</label>
                    <input
                      type="text"
                      value={formData.headline || ''}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="e.g., Senior Software Engineer at Google"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Mumbai, India"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.linkedin_url || ''}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>GitHub URL</label>
                    <input
                      type="url"
                      value={formData.github_url || ''}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Portfolio URL</label>
                    <input
                      type="url"
                      value={formData.portfolio_url || ''}
                      onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    />
                  </FormGroup>
                </>
              )}

              {editing === 'about' && (
                <FormGroup>
                  <label>About</label>
                  <textarea
                    value={formData.about || ''}
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
                          style={{ marginLeft: theme.spacing.xs, color: 'inherit' }}
                        >
                          <FiX />
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
                      >
                        Add
                      </SaveButton>
                    </div>
                  </FormGroup>
                </>
              )}

              {editing === 'experience' && (
                <>
                  <FormGroup>
                    <label>Position</label>
                    <input
                      type="text"
                      value={formData.experience?.position || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData.experience, position: e.target.value }
                      })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Company</label>
                    <input
                      type="text"
                      value={formData.experience?.company || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData.experience, company: e.target.value }
                      })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Duration</label>
                    <input
                      type="text"
                      value={formData.experience?.duration || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData.experience, duration: e.target.value }
                      })}
                      placeholder="e.g., 2020 - Present"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Description</label>
                    <textarea
                      value={formData.experience?.description || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData.experience, description: e.target.value }
                      })}
                      rows="4"
                    />
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
                <SaveButton
                  onClick={handleSave}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                </SaveButton>
              </FormActions>
            </EditCard>
          </EditForm>
        )}
      </AnimatePresence>
    </Container>
  );
};

// Styled components for action buttons (reused from Applicants page)
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

export default SeekerProfile;