import { useTranslation } from "react-i18next";
import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import api from '../api/api';
import {
  Autocomplete,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Fade,
  Grow,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, ArrowBack, Badge, Person } from '@mui/icons-material';

interface MemberOption {
  id: string;
  no_anggota: string;
  nama_lengkap: string;
  nama_lapangan?: string | null;
  domisili?: string | null;
  angkatan?: {
    nama_angkatan?: string;
    year?: string;
  } | null;
  user_id?: string | null;
}

export const LoginPage = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [memberName, setMemberName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [memberLookupSource, setMemberLookupSource] = useState<'number' | 'name' | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [memberLookupWarning, setMemberLookupWarning] = useState<string | null>(null);
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);
  
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const from = location.state?.from?.pathname || '/dashboard';

  const primaryOrange = '#e67817';
  const secondaryOrange = '#ff9800';
  const mobileMutedText = 'rgba(255,255,255,0.82)';
  const mobileStrongText = '#ffffff';
  const desktopMutedText = '#344054';
  const desktopStrongText = '#101828';

  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  useEffect(() => {
    const fetchWebsiteSettings = async () => {
      try {
        const response = await api.get('/system/settings/contact');
        setIsRegistrationEnabled(response.data?.data?.allow_member_registration !== false);
      } catch (err) {
        console.error('Failed to fetch website settings:', err);
        setIsRegistrationEnabled(true);
      }
    };

    fetchWebsiteSettings();
  }, []);

  useEffect(() => {
    if (!isRegistrationEnabled && mode === 'register') {
      setMode('login');
      navigate('/login', { replace: true });
    }
  }, [isRegistrationEnabled, mode, navigate]);

  useEffect(() => {
    if (mode !== 'register' || members.length > 0 || isMembersLoading) {
      return;
    }

    const fetchMembers = async () => {
      setIsMembersLoading(true);
      try {
        const response = await api.get('/content/member');
        setMembers((response.data?.data ?? []) as MemberOption[]);
      } catch (err) {
        console.error('Failed to fetch member list:', err);
      } finally {
        setIsMembersLoading(false);
      }
    };

    fetchMembers();
  }, [mode, members.length, isMembersLoading]);

  const normalizeValue = (value: string) => value.trim().toLowerCase();

  const syncMemberFields = (member: MemberOption | null) => {
    if (!member) {
      return;
    }

    setSelectedMember(member);
    setMemberNumber(member.no_anggota);
    setMemberName(member.nama_lengkap);
    setMemberLookupWarning(null);
    setRegisterError(null);
  };

  const findMemberByNumber = (value: string) =>
    members.find((member) => normalizeValue(member.no_anggota) === normalizeValue(value));

  const findMemberByName = (value: string) =>
    members.find((member) => normalizeValue(member.nama_lengkap) === normalizeValue(value));

  const setRegisteredMemberWarning = () => {
    setSelectedMember(null);
    setMemberLookupWarning('Anggota ini sudah terdaftar dan sudah memiliki akun.');
  };

  const handleMemberNumberChange = (value: string) => {
    setMemberNumber(value);
    setMemberLookupSource(value ? 'number' : null);
    setMemberLookupWarning(null);

    const matchedMember = findMemberByNumber(value);
    if (matchedMember) {
      if (matchedMember.user_id) {
        setRegisteredMemberWarning();
        setMemberName(matchedMember.nama_lengkap);
        setMemberLookupSource('number');
        return;
      }

      syncMemberFields(matchedMember);
      setMemberLookupSource('number');
      return;
    }

    setSelectedMember(null);
    setMemberName('');
  };

  const handleMemberNameChange = (value: string) => {
    setMemberName(value);
    setMemberLookupSource(value ? 'name' : null);
    setMemberLookupWarning(null);

    const matchedMember = findMemberByName(value);
    if (matchedMember) {
      if (matchedMember.user_id) {
        setRegisteredMemberWarning();
        setMemberNumber(matchedMember.no_anggota);
        setMemberLookupSource('name');
        return;
      }

      syncMemberFields(matchedMember);
      setMemberLookupSource('name');
      return;
    }

    setSelectedMember(null);
    setMemberNumber('');
  };

  const handleResetMemberLookup = () => {
    setSelectedMember(null);
    setMemberNumber('');
    setMemberName('');
    setMemberLookupSource(null);
    setMemberLookupWarning(null);
    setRegisterError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);

    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!memberNumber || !memberName || !registerEmail || !registerPassword || !confirmPassword) {
      setRegisterError('Please fill in all fields.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError('Password confirmation does not match.');
      return;
    }

    setRegisterError(null);
    setIsRegistering(true);

    try {
      await api.post('/auth/register', {
        no_anggota: memberNumber,
        nama_anggota: memberName,
        email: registerEmail,
        password: registerPassword,
        password_confirmation: confirmPassword,
      });

      toast.success('Registration successful. Please sign in.');
      setMode('login');
      setEmail(registerEmail);
      setPassword('');
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setSelectedMember(null);
      setMemberNumber('');
      setMemberName('');
      setMemberLookupSource(null);
      setMemberLookupWarning(null);
      setRegisterError(null);
    } catch (err: unknown) {
      const apiError = err as {
        response?: {
          data?: {
            errors?: Record<string, string[]>;
            message?: string;
          };
        };
      };
      const apiMessage =
        apiError.response?.data?.errors
          ? Object.values(apiError.response.data.errors).flat().join(' ')
          : apiError.response?.data?.message;

      setRegisterError(apiMessage || 'Registration failed. Please check your data.');
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBackToHome = () => {
    const hostname = window.location.hostname;
    if (hostname.startsWith('dashboard.')) {
      const mainDomain = hostname.replace('dashboard.', '');
      // If port exists (development), include it
      const port = window.location.port ? `:${window.location.port}` : '';
      window.location.href = `${window.location.protocol}//${mainDomain}${port}`;
    } else {
      navigate('/');
    }
  };

  // Common styles for autofill override
  const autofillStyles = {
    '& input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0 1000px ${isMobile ? 'rgba(30, 30, 30, 0.9)' : '#f9f9f9'} inset !important`,
      WebkitTextFillColor: isMobile ? 'white !important' : '#1a1a1a !important',
      transition: 'background-color 5000s ease-in-out 0s',
      borderRadius: 'inherit',
    },
  };

  const sharedInputSx = {
    borderRadius: 3,
    bgcolor: isMobile ? 'rgba(15,15,15,0.55)' : 'grey.50',
    color: isMobile ? mobileStrongText : desktopStrongText,
    '& input': {
      color: `${isMobile ? mobileStrongText : desktopStrongText} !important`,
      WebkitTextFillColor: `${isMobile ? mobileStrongText : desktopStrongText} !important`,
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: `${isMobile ? mobileStrongText : desktopStrongText} !important`,
      color: `${isMobile ? mobileStrongText : desktopStrongText} !important`,
      opacity: 1,
    },
    '& fieldset': { borderColor: isMobile ? 'rgba(255,255,255,0.45)' : 'grey.200' },
    '&:hover fieldset': { borderColor: primaryOrange },
    '&.Mui-focused fieldset': { borderColor: primaryOrange },
    '&.Mui-disabled': {
      bgcolor: isMobile ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)',
    },
  };

  const helperTextSx = {
    color: `${isMobile ? mobileMutedText : desktopMutedText} !important`,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        bgcolor: 'white',
        overflowX: 'hidden',
      }}
    >
      {/* LEFT SIDE: Branding & Image (Hidden on Mobile) */}
      {!isMobile && (
        <Box
          sx={{
            flex: '1 1 auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            p: 6,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url("/images/bg-login.webp")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(225deg, ${primaryOrange}cc 0%, rgba(0, 0, 0, 0.7) 100%)`,
              zIndex: 2,
            }
          }}
        >
          <Grow in timeout={1000}>
            <Box sx={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: "900", letterSpacing: 0, textShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>
                PERIMATRIK
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.95, fontWeight: 500, maxWidth: 600, lineHeight: 1.6, mb: 2 }}>{t('login.heroTagline')}</Typography>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 300, fontStyle: 'italic' }}>{t("login.salam")}</Typography>
            </Box>
          </Grow>
        </Box>
      )}

      {/* RIGHT SIDE: Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: 'clamp(480px, 42vw, 600px)' },
          minHeight: '100dvh',
          maxHeight: { md: '100dvh' },
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2.25, sm: 4, md: 8 },
          pt: { xs: 7.5, sm: 8, md: 11 },
          pb: { xs: 3, sm: 4, md: 8 },
          justifyContent: 'flex-start',
          position: 'relative',
          bgcolor: 'white',
          zIndex: 5,
          ...(isMobile && {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url("/images/bg-login.webp")',
              backgroundSize: 'cover',
              filter: 'brightness(0.4)',
              zIndex: -1,
            },
            bgcolor: 'transparent',
          })
        }}
      >
        <IconButton
          aria-label="Back to home"
          onClick={handleBackToHome}
          sx={{ 
            position: 'absolute',
            top: { xs: 14, md: 28 },
            left: { xs: 14, md: 32 },
            width: 42,
            height: 42,
            color: isMobile ? 'white' : 'grey.700',
            bgcolor: isMobile ? 'rgba(255,255,255,0.12)' : 'rgba(16,24,40,0.04)',
            border: '1px solid',
            borderColor: isMobile ? 'rgba(255,255,255,0.16)' : 'rgba(16,24,40,0.08)',
            zIndex: 10,
            '&:hover': {
              color: primaryOrange,
              bgcolor: isMobile ? 'rgba(255,255,255,0.18)' : 'rgba(230,120,23,0.08)',
            },
          }}
        >
          <ArrowBack />
        </IconButton>

        <Fade in timeout={800}>
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: 460, md: 'none' },
              mx: 'auto',
              position: 'relative',
              zIndex: 6,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ mb: { xs: 3, md: 3.5 }, textAlign: isMobile ? 'center' : 'left' }}>
              <Box sx={{ display: 'inline-block', p: 1, bgcolor: 'white', borderRadius: 2, mb: { xs: 2.5, md: 4 } }}>
                <img src="/logos/logo-text-black.png" alt="logo" style={{ height: isMobile ? '40px' : '48px', maxWidth: '100%', display: 'block' }} />
              </Box>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                sx={{ fontWeight: "900", mb: 1.5, letterSpacing: 0, color: isMobile ? 'white' : 'grey.900' }}
              >
                {mode === 'login' ? t('login.signIn') : t('login.register')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isMobile ? 'rgba(255,255,255,0.9)' : 'grey.700',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  display: 'block',
                  maxWidth: { xs: 340, md: 420 },
                  mx: { xs: 'auto', md: 0 },
                  mb: 0,
                }}
              >
                {mode === 'login' ? t('login.signInDesc') : t('login.registerDesc')}
              </Typography>
            </Box>

            {isRegistrationEnabled && (
              <Tabs
                value={mode}
                onChange={(_, value) => {
                  setMode(value);
                  navigate(value === 'register' ? '/register' : '/login');
                  setError(null);
                  setRegisterError(null);
                }}
                sx={{
                  mt: 0,
                  mb: { xs: 3.5, md: 4 },
                  minHeight: 'unset',
                  flexShrink: 0,
                  '& .MuiTabs-indicator': {
                    height: 4,
                    borderRadius: 999,
                    backgroundColor: primaryOrange,
                  },
                }}
              >
                <Tab
                  value="login"
                  label="Sign In"
                  sx={{
                    minHeight: 'unset',
                    px: 0,
                    mr: 4,
                    fontWeight: 800,
                    color: isMobile ? 'rgba(255,255,255,0.8)' : 'grey.700',
                    '&.Mui-selected': { color: isMobile ? 'white' : 'grey.900' },
                  }}
                />
                <Tab
                  value="register"
                  label="Register"
                  sx={{
                    minHeight: 'unset',
                    px: 0,
                    fontWeight: 800,
                    color: isMobile ? 'rgba(255,255,255,0.8)' : 'grey.700',
                    '&.Mui-selected': { color: isMobile ? 'white' : 'grey.900' },
                  }}
                />
              </Tabs>
            )}

            {mode === 'login' && error && (
              <Box sx={{ mb: 4, p: 2, bgcolor: 'error.50', color: 'error.main', borderRadius: 3, border: '1px solid', borderColor: 'error.100', fontSize: '0.875rem', fontWeight: '700' }}>
                {error}
              </Box>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleSubmit}>
                <Stack spacing={{ xs: 2.5, md: 3.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1, ml: 0.5, color: isMobile ? 'white' : 'grey.800' }}>{t('login.email')}</Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      sx={{ ...autofillStyles }}
                      slotProps={{ input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: primaryOrange, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: 3,
                          bgcolor: isMobile ? 'rgba(255,255,255,0.15)' : 'grey.50',
                          color: isMobile ? 'white' : '#1a1a1a',
                          '& fieldset': { borderColor: isMobile ? 'rgba(255,255,255,0.4)' : 'grey.200' },
                          '&:hover fieldset': { borderColor: primaryOrange },
                          '&.Mui-focused fieldset': { borderColor: primaryOrange },
                        }
                      } }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1, ml: 0.5, color: isMobile ? 'white' : 'grey.800' }}>{t('login.password')}</Typography>
                    <TextField
                      fullWidth
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      sx={{ ...autofillStyles }}
                      slotProps={{ input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: primaryOrange, fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="medium"
                              sx={{ 
                                color: isMobile ? 'white' : 'grey.500',
                                mr: 0.5
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: 3,
                          bgcolor: isMobile ? 'rgba(255,255,255,0.15)' : 'grey.50',
                          color: isMobile ? 'white' : '#1a1a1a',
                          '& fieldset': { borderColor: isMobile ? 'rgba(255,255,255,0.4)' : 'grey.200' },
                          '&:hover fieldset': { borderColor: primaryOrange },
                          '&.Mui-focused fieldset': { borderColor: primaryOrange },
                        }
                      } }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      py: { xs: 1.6, md: 2 },
                      mt: { xs: 1, md: 2 },
                      borderRadius: 3,
                      fontWeight: '900',
                      textTransform: 'none',
                      fontSize: '1rem',
                      background: `linear-gradient(135deg, ${primaryOrange} 0%, ${secondaryOrange} 100%)`,
                      boxShadow: isMobile ? '0 10px 30px rgba(230, 120, 23, 0.4)' : '0 10px 20px rgba(230, 120, 23, 0.25)',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: isMobile ? '0 15px 40px rgba(230, 120, 23, 0.5)' : '0 15px 30px rgba(230, 120, 23, 0.35)',
                        background: `linear-gradient(135deg, ${secondaryOrange} 0%, ${primaryOrange} 100%)`,
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Into Dashboard'}
                  </Button>
                </Stack>
              </form>
            ) : (
              <>
                {registerError && (
                  <Box sx={{ mb: 4, p: 2, bgcolor: 'error.50', color: 'error.main', borderRadius: 3, border: '1px solid', borderColor: 'error.100', fontSize: '0.875rem', fontWeight: '700' }}>
                    {registerError}
                  </Box>
                )}

                <form onSubmit={handleRegister}>
                  <Stack spacing={{ xs: 2.5, md: 3.5 }}>
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                          mb: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: "800", ml: 0.5, color: isMobile ? 'white' : 'grey.800' }}>{t('login.memberNo')}</Typography>
                        {memberLookupSource && (
                          <Button
                            size="small"
                            onClick={handleResetMemberLookup}
                            disabled={isRegistering}
                            sx={{
                              minWidth: 'unset',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 999,
                              fontWeight: 800,
                              textTransform: 'none',
                              color: isMobile ? 'white' : primaryOrange,
                              border: '1px solid',
                              borderColor: isMobile ? 'rgba(255,255,255,0.35)' : 'rgba(230,120,23,0.35)',
                            }}
                          >
                            Reset
                          </Button>
                        )}
                      </Box>
                      <Autocomplete
                        freeSolo
                        options={members}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.no_anggota}
                        filterOptions={(options, state) => {
                          const query = normalizeValue(state.inputValue);
                          return options.filter((member) =>
                            !member.user_id && (
                            normalizeValue(member.no_anggota).includes(query) ||
                            normalizeValue(member.nama_lengkap).includes(query)
                          ));
                        }}
                        inputValue={memberNumber}
                        onInputChange={(_, value) => handleMemberNumberChange(value)}
                        onChange={(_, value) => {
                          if (typeof value === 'string') {
                            handleMemberNumberChange(value);
                            return;
                          }
                          if (value?.user_id) {
                            setMemberName(value.nama_lengkap);
                            setRegisteredMemberWarning();
                            setMemberLookupSource('number');
                            return;
                          }
                          syncMemberFields(value);
                          setMemberLookupSource(value ? 'number' : null);
                        }}
                        loading={isMembersLoading}
                        disabled={isRegistering || memberLookupSource === 'name' || selectedMember !== null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            placeholder="Masukkan nomor anggota"
                            sx={{ ...autofillStyles }}
                            helperText={
                              memberLookupSource === 'name'
                                ? 'Nomor anggota dikunci karena terisi otomatis dari nama anggota.'
                                : 'Pilih atau ketik nomor anggota, nama akan terisi otomatis.'
                            }
                            slotProps={{ ...params.slotProps, formHelperText: { sx: helperTextSx }, input: {
                              ...params.slotProps.input,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <Badge sx={{ color: primaryOrange, fontSize: 20 }} />
                                  </InputAdornment>
                                  {params.slotProps.input.startAdornment}
                                </>
                              ),
                              sx: sharedInputSx
                            } }}
                          />
                        )}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1, ml: 0.5, color: isMobile ? 'white' : 'grey.800' }}>{t('login.memberName')}</Typography>
                      <Autocomplete
                        freeSolo
                        options={members}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.nama_lengkap}
                        filterOptions={(options, state) => {
                          const query = normalizeValue(state.inputValue);
                          return options.filter((member) =>
                            !member.user_id && (
                            normalizeValue(member.nama_lengkap).includes(query) ||
                            normalizeValue(member.no_anggota).includes(query)
                          ));
                        }}
                        inputValue={memberName}
                        onInputChange={(_, value) => handleMemberNameChange(value)}
                        onChange={(_, value) => {
                          if (typeof value === 'string') {
                            handleMemberNameChange(value);
                            return;
                          }
                          if (value?.user_id) {
                            setMemberNumber(value.no_anggota);
                            setRegisteredMemberWarning();
                            setMemberLookupSource('name');
                            return;
                          }
                          syncMemberFields(value);
                          setMemberLookupSource(value ? 'name' : null);
                        }}
                        loading={isMembersLoading}
                        disabled={isRegistering || memberLookupSource === 'number' || selectedMember !== null}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            placeholder="Masukkan nama lengkap anggota"
                            sx={{ ...autofillStyles }}
                            helperText={
                              memberLookupSource === 'number'
                                ? 'Nama anggota dikunci karena terisi otomatis dari nomor anggota.'
                                : 'Pilih atau ketik nama anggota, nomor anggota akan terisi otomatis.'
                            }
                            slotProps={{ ...params.slotProps, formHelperText: { sx: helperTextSx }, input: {
                              ...params.slotProps.input,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <Person sx={{ color: primaryOrange, fontSize: 20 }} />
                                  </InputAdornment>
                                  {params.slotProps.input.startAdornment}
                                </>
                              ),
                              sx: sharedInputSx
                            } }}
                          />
                        )}
                      />
                    </Box>

                    {memberLookupWarning && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: isMobile ? 'rgba(255,255,255,0.12)' : 'warning.50',
                          color: isMobile ? 'white' : 'warning.dark',
                          border: '1px solid',
                          borderColor: isMobile ? 'rgba(255,255,255,0.18)' : 'warning.200',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                        }}
                      >
                        {memberLookupWarning}
                      </Box>
                    )}

                    {selectedMember && (
                      <Box
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: isMobile ? 'rgba(255,255,255,0.25)' : 'rgba(230,120,23,0.18)',
                          bgcolor: isMobile ? 'rgba(255,255,255,0.08)' : 'rgba(230,120,23,0.06)',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "900", mb: 1.5, color: isMobile ? mobileStrongText : desktopStrongText }}
                        >{t('login.memberFound')}</Typography>
                        <Stack spacing={0.75}>
                          <Typography variant="body2" sx={{ color: isMobile ? mobileStrongText : desktopStrongText, overflowWrap: 'anywhere' }}>
                            <b>{t('login.memberFields.no')}</b> {selectedMember.no_anggota}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isMobile ? mobileStrongText : desktopStrongText, overflowWrap: 'anywhere' }}>
                            <b>{t('login.memberFields.nama')}</b> {selectedMember.nama_lengkap}
                          </Typography>
                          {selectedMember.nama_lapangan && (
                            <Typography variant="body2" sx={{ color: isMobile ? mobileStrongText : desktopStrongText, overflowWrap: 'anywhere' }}>
                              <b>{t('login.memberFields.lapangan')}</b> {selectedMember.nama_lapangan}
                            </Typography>
                          )}
                          {selectedMember.domisili && (
                            <Typography variant="body2" sx={{ color: isMobile ? mobileStrongText : desktopStrongText, overflowWrap: 'anywhere' }}>
                              <b>{t('login.memberFields.domisili')}</b> {selectedMember.domisili}
                            </Typography>
                          )}
                          {(selectedMember.angkatan?.nama_angkatan || selectedMember.angkatan?.year) && (
                            <Typography variant="body2" sx={{ color: isMobile ? mobileStrongText : desktopStrongText, overflowWrap: 'anywhere' }}>
                              <b>{t('login.memberFields.angkatan')}</b> {[selectedMember.angkatan?.nama_angkatan, selectedMember.angkatan?.year].filter(Boolean).join(' • ')}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    )}

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1, ml: 0.5, color: isMobile ? 'white' : 'grey.800' }}>{t('login.email')}</Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="name@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        disabled={isRegistering}
                        sx={{ ...autofillStyles }}
                        slotProps={{ input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: primaryOrange, fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          sx: sharedInputSx
                        } }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1, ml: 0.5, color: isMobile ? 'white' : 'grey.800' }}>{t('login.password')}</Typography>
                      <TextField
                        fullWidth
                        placeholder="Minimal 8 karakter"
                        type={showRegisterPassword ? 'text' : 'password'}
                        variant="outlined"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        disabled={isRegistering}
                        sx={{ ...autofillStyles }}
                        slotProps={{ input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: primaryOrange, fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                edge="end"
                                size="medium"
                                sx={{ color: isMobile ? 'white' : 'grey.500', mr: 0.5 }}
                              >
                                {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: sharedInputSx
                        } }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1, ml: 0.5, color: isMobile ? 'white' : 'grey.800' }}>{t('login.confirmPassword')}</Typography>
                      <TextField
                        fullWidth
                        placeholder="Ulangi password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isRegistering}
                        sx={{ ...autofillStyles }}
                        slotProps={{ input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: primaryOrange, fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                size="medium"
                                sx={{ color: isMobile ? 'white' : 'grey.500', mr: 0.5 }}
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: sharedInputSx
                        } }}
                      />
                    </Box>

                    <Button
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      disabled={isRegistering}
                      sx={{
                        py: { xs: 1.6, md: 2 },
                        mt: { xs: 1, md: 2 },
                        borderRadius: 3,
                        fontWeight: '900',
                        textTransform: 'none',
                        fontSize: '1rem',
                        background: `linear-gradient(135deg, ${primaryOrange} 0%, ${secondaryOrange} 100%)`,
                        boxShadow: isMobile ? '0 10px 30px rgba(230, 120, 23, 0.4)' : '0 10px 20px rgba(230, 120, 23, 0.25)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: isMobile ? '0 15px 40px rgba(230, 120, 23, 0.5)' : '0 15px 30px rgba(230, 120, 23, 0.35)',
                          background: `linear-gradient(135deg, ${secondaryOrange} 0%, ${primaryOrange} 100%)`,
                        },
                      }}
                    >
                      {isRegistering ? <CircularProgress size={24} color="inherit" /> : 'Create Member Account'}
                    </Button>
                  </Stack>
                </form>
              </>
            )}

            <Box sx={{ mt: { xs: 4, md: 8 }, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: isMobile ? 'rgba(255,255,255,0.7)' : 'grey.600', fontWeight: 600 }}>{t('login.copyright')}</Typography>
            </Box>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};
