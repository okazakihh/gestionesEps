import React, { useState } from 'react';
import { useAuth } from '../../data/context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../negocio/contexts/ThemeContext.jsx';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Stack,
  Image,
  Box,
  Alert
} from '@mantine/core';
import { IconUser, IconLock, IconAlertCircle } from '@tabler/icons-react';
import { ThemedSwal } from '../../negocio/utils/themedSwal.js';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const { tema } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);

      const backendMsg = err?.message || err?.response?.data?.error || err?.response?.data?.message;
      const errorMessage = backendMsg || 'Error en el login. Verifica tus credenciales.';

      await ThemedSwal.error(
        'Error de Inicio de Sesión',
        errorMessage,
        'Verifica tu usuario y contraseña.'
      );

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: tema.gradient,
        padding: '20px'
      }}
    >
      <Container size={460}>
        <Paper
          shadow="xl"
          p={40}
          radius="lg"
          withBorder
          style={{
            background: 'white',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Stack gap="lg">
            {/* Logo */}
            <Box style={{ textAlign: 'center' }}>
              <Image
                src="/logo-source.png"
                alt="Logo IPS"
                h={80}
                w="auto"
                fit="contain"
                mx="auto"
                mb="md"
              />
              <Title
                order={2}
                ta="center"
                style={{
                  color: tema.primaryColor,
                  fontWeight: 700,
                  marginBottom: 8
                }}
              >
                Sistema de Gestión IPS
              </Title>
              <Text c="dimmed" size="sm" ta="center">
                Ingresa tus credenciales para continuar
              </Text>
            </Box>

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Usuario"
                  placeholder="Ingresa tu usuario"
                  leftSection={<IconUser size={18} />}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  size="md"
                  styles={{
                    input: {
                      borderColor: '#e0e0e0',
                      '&:focus': {
                        borderColor: tema.primaryColor
                      }
                    }
                  }}
                />

                <PasswordInput
                  label="Contraseña"
                  placeholder="Ingresa tu contraseña"
                  leftSection={<IconLock size={18} />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="md"
                  styles={{
                    input: {
                      borderColor: '#e0e0e0',
                      '&:focus': {
                        borderColor: tema.primaryColor
                      }
                    }
                  }}
                />

                {error && (
                  <Alert
                    icon={<IconAlertCircle size={18} />}
                    title="Error"
                    color="red"
                    variant="filled"
                  >
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  loading={isLoading}
                  style={{
                    background: tema.gradient,
                    marginTop: 16
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 16px ${tema.primaryColor}4D`
                      },
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </Stack>
            </form>

            {/* Footer */}
            <Text c="dimmed" size="xs" ta="center" mt="md">
              © 2024 Sistema de Gestión IPS. Todos los derechos reservados.
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
