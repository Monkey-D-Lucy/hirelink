import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiBriefcase, FiHome } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const Nav = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.small};
  z-index: 1000;
  padding: ${theme.spacing.md} ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  
  img {
    height: 60px;
    width: auto;
    max-width: 220px;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    img {
      height: 45px;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${theme.colors.text.primary};
  font-weight: 500;
  position: relative;
  padding: ${theme.spacing.xs} 0;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${theme.gradients.primary};
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const IconButton = styled(motion.button)`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.round};
  background: ${theme.colors.background};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &:hover {
    background: ${theme.colors.primary}10;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${theme.colors.secondary};
  color: white;
  font-size: 12px;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: ${theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled(motion.div)`
  position: relative;
`;

const UserButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.background};
  color: ${theme.colors.text.primary};
  font-weight: 500;

  img {
    width: 32px;
    height: 32px;
    border-radius: ${theme.borderRadius.round};
    object-fit: cover;
  }

  &:hover {
    background: ${theme.colors.primary}10;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${theme.spacing.sm};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.large};
  min-width: 200px;
  overflow: hidden;
  z-index: 1001;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.colors.background};
  }

  svg {
    font-size: 18px;
    color: ${theme.colors.text.secondary};
  }
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.round};
  background: ${theme.colors.background};
  color: ${theme.colors.text.primary};
  font-size: 24px;

  @media (max-width: ${theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: ${theme.colors.surface};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.medium};
  z-index: 999;

  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }
`;

const MobileNavLink = styled(Link)`
  display: block;
  padding: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  font-weight: 500;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications] = useState(3); // This would come from API

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <NavContainer>
        <Logo to="/">
          <img src="/logo.svg" alt="HIRELINK" />
        </Logo>

        <NavLinks>
          <NavLink to="/jobs">Find Jobs</NavLink>
          {user?.user_type === 'employer' && (
            <NavLink to="/employer/dashboard">Dashboard</NavLink>
          )}
          {user?.user_type === 'job_seeker' && (
            <NavLink to="/seeker/dashboard">Dashboard</NavLink>
          )}
        </NavLinks>

        <NavActions>
          {user ? (
            <>
              <IconButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notifications')}
              >
                <FiBell />
                {notifications > 0 && (
                  <NotificationBadge>{notifications}</NotificationBadge>
                )}
              </IconButton>

              <UserMenu>
                <UserButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <FiUser />
                  <span>{user?.profile?.full_name?.split(' ')[0]}</span>
                </UserButton>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <DropdownMenu
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <DropdownItem to={`/${user.user_type}/profile`}>
                        <FiUser /> Profile
                      </DropdownItem>
                      <DropdownItem to={`/${user.user_type}/dashboard`}>
                        <FiHome /> Dashboard
                      </DropdownItem>
                      {user.user_type === 'employer' && (
                        <DropdownItem to="/employer/post-job">
                          <FiBriefcase /> Post Job
                        </DropdownItem>
                      )}
                      <DropdownItem as="button" onClick={handleLogout}>
                        <FiLogOut /> Logout
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </AnimatePresence>
              </UserMenu>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}

          <MobileMenuButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </NavActions>
      </NavContainer>

      <AnimatePresence>
        {isMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MobileNavLink to="/jobs" onClick={() => setIsMenuOpen(false)}>
              Find Jobs
            </MobileNavLink>
            {user?.user_type === 'employer' && (
              <MobileNavLink to="/employer/dashboard" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </MobileNavLink>
            )}
            {user?.user_type === 'job_seeker' && (
              <MobileNavLink to="/seeker/dashboard" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </MobileNavLink>
            )}
            {!user && (
              <>
                <MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </MobileNavLink>
                <MobileNavLink to="/register" onClick={() => setIsMenuOpen(false)}>
                  Register
                </MobileNavLink>
              </>
            )}
          </MobileMenu>
        )}
      </AnimatePresence>
    </Nav>
  );
};

export default Navbar;