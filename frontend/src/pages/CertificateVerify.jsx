import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiDownload, FiShare2, FiAward } from 'react-icons/fi';
import API from '../services/api';
import { theme } from '../styles/theme';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: 100px ${theme.spacing.xl} ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VerifyCard = styled(motion.div)`
  max-width: 600px;
  width: 100%;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.medium};
  text-align: center;
`;

const StatusIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.round};
  background: ${props => props.isValid ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${props => props.isValid ? theme.colors.success : theme.colors.danger};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto ${theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
`;

const StatusText = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: ${theme.spacing.lg};
  color: ${props => props.isValid ? theme.colors.success : theme.colors.danger};
`;

const CertificateInfo = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
  text-align: left;
`;

const InfoRow = styled.div`
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  strong {
    color: ${theme.colors.text.primary};
    display: inline-block;
    width: 120px;
  }
  
  span {
    color: ${theme.colors.text.secondary};
    word-break: break-all;
  }
`;

const HashValue = styled.div`
  font-family: monospace;
  font-size: 12px;
  background: ${theme.colors.surface};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  margin-top: ${theme.spacing.xs};
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  margin-top: ${theme.spacing.xl};
`;

const Button = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${props => props.primary ? theme.gradients.primary : 'transparent'};
  color: ${props => props.primary ? 'white' : theme.colors.primary};
  border: ${props => props.primary ? 'none' : `1px solid ${theme.colors.primary}`};
  border-radius: ${theme.borderRadius.medium};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.small};
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const CertificateVerify = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    verifyCertificate();
  }, [hash]);

  const verifyCertificate = async () => {
    try {
      setVerifying(true);
      const response = await API.get(`/certificates/verify/${hash}`);
      
      if (response.data.success) {
        setCertificate(response.data.certificate);
        setIsValid(response.data.isValid || true);
      } else {
        setIsValid(false);
        setCertificate(response.data.certificate);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setIsValid(false);
      if (error.response?.status === 404) {
        toast.error('Certificate not found');
      } else {
        toast.error('Error verifying certificate');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = () => {
    if (certificate?.certificate_url) {
      window.open(certificate.certificate_url, '_blank');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied to clipboard!');
  };

  if (verifying) {
    return (
      <Container>
        <LoadingSpinner>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ fontSize: 40 }}
          >
            🔄
          </motion.div>
          <p>Verifying certificate...</p>
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <VerifyCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StatusIcon isValid={isValid}>
          {isValid ? <FiCheckCircle /> : <FiXCircle />}
        </StatusIcon>
        
        <Title>Certificate Verification</Title>
        
        <StatusText isValid={isValid}>
          {isValid ? '✓ VALID CERTIFICATE' : '✗ INVALID CERTIFICATE'}
        </StatusText>
        
        {isValid && (
          <p style={{ color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }}>
            This certificate has been verified and is authentic.
          </p>
        )}
        
        {certificate && (
          <CertificateInfo>
            <InfoRow>
              <strong>Certificate Name:</strong>
              <span>{certificate.certificate_name}</span>
            </InfoRow>
            <InfoRow>
              <strong>Issuing Organization:</strong>
              <span>{certificate.issuing_organization || 'Not specified'}</span>
            </InfoRow>
            <InfoRow>
              <strong>Issue Date:</strong>
              <span>{new Date(certificate.issue_date).toLocaleDateString()}</span>
            </InfoRow>
            <InfoRow>
              <strong>SHA-256 Hash:</strong>
              <HashValue>{certificate.certificate_hash}</HashValue>
            </InfoRow>
            {certificate.verified_at && (
              <InfoRow>
                <strong>Verified On:</strong>
                <span>{new Date(certificate.verified_at).toLocaleString()}</span>
              </InfoRow>
            )}
          </CertificateInfo>
        )}
        
        <ButtonGroup>
          {certificate?.certificate_url && (
            <Button onClick={handleDownload} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FiDownload /> Download Certificate
            </Button>
          )}
          <Button primary onClick={handleShare} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <FiShare2 /> Share Verification
          </Button>
          <Button onClick={() => navigate(-1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Back
          </Button>
        </ButtonGroup>
      </VerifyCard>
    </Container>
  );
};

export default CertificateVerify;