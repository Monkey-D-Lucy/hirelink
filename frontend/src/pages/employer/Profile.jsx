import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit2, FiSave, FiX, FiCamera, FiMapPin,
  FiBriefcase, FiMail, FiPhone, FiLink,
  FiGlobe, FiUsers, FiCalendar, FiAward,
  FiCheckCircle, FiUpload
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
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CoverOverlay = styled(motion.label)`
  position: absolute;
  bottom: ${theme.spacing.md};
  right: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: ${theme.borderRadius.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  font-size: 14px;

  input {
    display: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
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
    margin-bottom: ${theme.spacing.xs};
  }
`;

const VerificationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.success}10;
  color: ${theme.colors.success};
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 500;
  margin-left: ${theme.spacing.sm};
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
  padding: ${theme.spacing.lg} 0;
  border-top: 1px solid ${theme.colors.border};
  border-bottom: 1px solid ${theme.colors.border};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
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

    a {
      color: ${theme.colors.primary};
      
      &:hover {
        text-decoration: underline;
      }
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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  label {
    display: block;
    font-size: 13px;
    color: ${theme.colors.text.light};
    margin-bottom: ${theme.spacing.xs};
  }

  p {
    font-weight: 500;
    color: ${theme.colors.text.primary};
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

const VerificationSection = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.small};
  border: 1px solid ${theme.colors.success}30;
`;

const VerificationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};

  svg {
    color: ${theme.colors.success};
    font-size: 24px;
  }

  h3 {
    font-size: 18px;
    color: ${theme.colors.success};
  }
`;

const UploadDocument = styled.div`
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

const EmployerProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user?.profile || {});
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user?.profile) {
      setProfile(user.profile);
      setCompany({
        company_name: user.profile.company_name,
        website: user.profile.website,
        description: user.profile.company_description,
        industry: user.profile.industry,
        size: user.profile.size,
        founded_year: user.profile.founded_year,
        headquarters: user.profile.headquarters
      });
    }
  }, [user]);

  const handleEdit = (section) => {
    if (section === 'personal') {
      setFormData({
        full_name: profile.full_name,
        designation: profile.designation,
        phone: profile.phone
      });
    } else if (section === 'company') {
      setFormData(company);
    }
    setEditing(section);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await API.put('/users/profile', formData);
      updateUser({ ...user, profile: res.data.profile });
      setProfile(res.data.profile);
      
      if (editing === 'company') {
        setCompany(formData);
      }
      
      toast.success('Profile updated successfully');
      setEditing(null);
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type === 'profile' ? 'profile_pic' : 'cover_image', file);

    try {
      const res = await API.post('/users/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (type === 'profile') {
        setProfile({ ...profile, profile_pic_url: res.data.url });
      } else {
        setProfile({ ...profile, cover_image_url: res.data.url });
      }
      
      toast.success(`${type === 'profile' ? 'Profile' : 'Cover'} picture updated`);
    } catch (error) {
      toast.error('Error uploading image');
    }
  };

  const handleVerificationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
      await API.post('/companies/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Verification document uploaded. Pending review.');
    } catch (error) {
      toast.error('Error uploading document');
    }
  };

  return (
    <Container>
      <ProfileContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CoverImage>
          {profile.cover_image_url && <img src={profile.cover_image_url} alt="Cover" />}
          <CoverOverlay
            as="label"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCamera /> Change Cover
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
          </CoverOverlay>
        </CoverImage>
        
        <ProfileHeader>
          <AvatarSection>
            <AvatarWrapper>
              <Avatar>
                {profile.profile_pic_url ? (
                  <img src={profile.profile_pic_url} alt={profile.full_name} />
                ) : (
                  profile.full_name?.[0] || 'E'
                )}
              </Avatar>
              <AvatarOverlay
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                as="label"
              >
                <FiCamera />
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
              </AvatarOverlay>
            </AvatarWrapper>

            <ProfileTitle>
              <h1>
                {profile.full_name || 'Company Name'}
                {profile.verified && (
                  <VerificationBadge>
                    <FiCheckCircle /> Verified Company
                  </VerificationBadge>
                )}
              </h1>
              <h2>{profile.designation || 'Company Representative'}</h2>
              <h2>{company.company_name}</h2>
            </ProfileTitle>

            <EditButton
              onClick={() => handleEdit('personal')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiEdit2 /> Edit Profile
            </EditButton>
          </AvatarSection>

          <ProfileStats>
            <StatItem>
              <span>{profile.jobs_count || 0}</span>
              <small>Jobs Posted</small>
            </StatItem>
            <StatItem>
              <span>{profile.total_applicants || 0}</span>
              <small>Total Applicants</small>
            </StatItem>
            <StatItem>
              <span>{profile.active_jobs || 0}</span>
              <small>Active Jobs</small>
            </StatItem>
            <StatItem>
              <span>{profile.profile_views || 0}</span>
              <small>Profile Views</small>
            </StatItem>
          </ProfileStats>

          <ContactInfo>
            {profile.email && (
              <span><FiMail /> {profile.email}</span>
            )}
            {profile.phone && (
              <span><FiPhone /> {profile.phone}</span>
            )}
            {company.website && (
              <span><FiGlobe /> <a href={company.website} target="_blank">Website</a></span>
            )}
            {company.headquarters && (
              <span><FiMapPin /> {company.headquarters}</span>
            )}
          </ContactInfo>
        </ProfileHeader>

        <Section>
          <SectionHeader>
            <h3><FiBriefcase /> Company Information</h3>
            <EditButton
              onClick={() => handleEdit('company')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiEdit2 /> Edit
            </EditButton>
          </SectionHeader>

          <InfoGrid>
            <InfoItem>
              <label>Company Name</label>
              <p>{company.company_name || 'Not specified'}</p>
            </InfoItem>
            <InfoItem>
              <label>Industry</label>
              <p>{company.industry || 'Not specified'}</p>
            </InfoItem>
            <InfoItem>
              <label>Company Size</label>
              <p>{company.size || 'Not specified'}</p>
            </InfoItem>
            <InfoItem>
              <label>Founded Year</label>
              <p>{company.founded_year || 'Not specified'}</p>
            </InfoItem>
            <InfoItem>
              <label>Headquarters</label>
              <p>{company.headquarters || 'Not specified'}</p>
            </InfoItem>
            <InfoItem>
              <label>Website</label>
              <p>{company.website || 'Not specified'}</p>
            </InfoItem>
          </InfoGrid>

          {company.description && (
            <div style={{ marginTop: theme.spacing.lg }}>
              <label style={{ fontSize: '13px', color: theme.colors.text.light, display: 'block', marginBottom: theme.spacing.sm }}>
                About Company
              </label>
              <p style={{ color: theme.colors.text.secondary, lineHeight: 1.6 }}>
                {company.description}
              </p>
            </div>
          )}
        </Section>

        {!profile.verified && (
          <VerificationSection>
            <VerificationHeader>
              <FiAward />
              <h3>Verify Your Company</h3>
            </VerificationHeader>
            <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>
              Get verified to build trust with job seekers and increase your visibility.
              Upload your business registration document for verification.
            </p>
            <UploadDocument as="label">
              <input type="file" accept=".pdf,.jpg,.png" onChange={handleVerificationUpload} />
              <FiUpload />
              <p>Upload Business Registration Document</p>
              <small>PDF, JPG, PNG (Max 5MB)</small>
            </UploadDocument>
          </VerificationSection>
        )}
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
              <h3>Edit {editing === 'personal' ? 'Personal Information' : 'Company Information'}</h3>
              
              {editing === 'personal' && (
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
                    <label>Designation</label>
                    <input
                      type="text"
                      value={formData.designation || ''}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g., HR Manager, Recruiter"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </FormGroup>
                </>
              )}

              {editing === 'company' && (
                <>
                  <FormGroup>
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name || ''}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Industry</label>
                    <select
                      value={formData.industry || ''}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>Company Size</label>
                    <select
                      value={formData.size || ''}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>Founded Year</label>
                    <input
                      type="number"
                      value={formData.founded_year || ''}
                      onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Headquarters</label>
                    <input
                      type="text"
                      value={formData.headquarters || ''}
                      onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                      placeholder="City, Country"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Website</label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.example.com"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>About Company</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell job seekers about your company..."
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

export default EmployerProfile;