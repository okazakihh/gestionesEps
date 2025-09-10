package com.ipsSystem.gestions.auth.service;

import com.ipsSystem.gestions.auth.dto.ApiResponse;
import com.ipsSystem.gestions.auth.dto.RegisterRequest;
import com.ipsSystem.gestions.auth.dto.LoginRequest;
import com.ipsSystem.gestions.auth.dto.LoginResponse;
import com.ipsSystem.gestions.auth.dto.UserResponse;
import com.ipsSystem.gestions.auth.dto.UserUpdateRequest;
import com.ipsSystem.gestions.auth.entity.User;
import com.ipsSystem.gestions.auth.entity.Role;
import com.ipsSystem.gestions.auth.enums.UserRole;
import com.ipsSystem.gestions.auth.repository.RoleRepository;
import com.ipsSystem.gestions.auth.repository.UserRepository;
import com.ipsSystem.gestions.auth.security.TokenService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private TokenService tokenService;
    
    public ApiResponse<String> register(RegisterRequest request) {
        try {
            // Verificar si el usuario ya existe
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                return ApiResponse.error("El username ya existe");
            }
            
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ApiResponse.error("El email ya existe");
            }
            
            // Crear nuevo usuario
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPersonalInfo(request.getPersonalInfo());
            user.setContactInfo(request.getContactInfo());
            
            // Asignar roles
            Set<Role> userRoles = new HashSet<>();
            if (request.getRoles() != null && !request.getRoles().isEmpty()) {
                for (String roleName : request.getRoles()) {
                    UserRole.validateRole(roleName); // Validar que el rol existe
                    Role role = roleRepository.findByName(roleName)
                            .orElseGet(() -> {
                                Role newRole = new Role();
                                newRole.setName(roleName);
                                return roleRepository.save(newRole);
                            });
                    userRoles.add(role);
                }
            } else {
                // Si no se especifican roles, asignar USER por defecto
                Role userRole = roleRepository.findByName("USER")
                        .orElseGet(() -> {
                            Role newRole = new Role();
                            newRole.setName("USER");
                            return roleRepository.save(newRole);
                        });
                userRoles.add(userRole);
            }
            
            user.setRoles(userRoles);
            userRepository.save(user);
            
            return ApiResponse.success("Usuario registrado exitosamente");
            
        } catch (Exception e) {
            return ApiResponse.error("Error al registrar usuario: " + e.getMessage());
        }
    }
    
    public ApiResponse<LoginResponse> login(LoginRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Credenciales inválidas");
            }
            
            User user = userOpt.get();
            
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ApiResponse.error("Credenciales inválidas");
            }
            
            // Generar token JWT
            String token = tokenService.generateToken(user);
            
            // Crear respuesta con token y información del usuario
            LoginResponse loginResponse = new LoginResponse(token, user);
            
            return ApiResponse.success("Login exitoso", loginResponse);
            
        } catch (Exception e) {
            return ApiResponse.error("Error en login: " + e.getMessage());
        }
    }
    
    public ApiResponse<List<UserResponse>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserResponse> userResponses = users.stream()
                    .map(UserResponse::new)
                    .toList();
            
            return ApiResponse.success("Usuarios obtenidos exitosamente", userResponses);
            
        } catch (Exception e) {
            return ApiResponse.error("Error al obtener usuarios: " + e.getMessage());
        }
    }
    
    public ApiResponse<UserResponse> getUserByUsername(String username) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Usuario no encontrado");
            }
            
            UserResponse userResponse = new UserResponse(userOpt.get());
            
            return ApiResponse.success("Usuario encontrado", userResponse);
            
        } catch (Exception e) {
            return ApiResponse.error("Error al buscar usuario: " + e.getMessage());
        }
    }
    
    public ApiResponse<String> updateUser(String username, UserUpdateRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Usuario no encontrado");
            }
            
            User user = userOpt.get();
            
            // Actualizar campos si están presentes
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                // Verificar que el email no esté en uso por otro usuario
                Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
                if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                    return ApiResponse.error("El email ya está en uso");
                }
                user.setEmail(request.getEmail());
            }
            
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            
            if (request.getPersonalInfo() != null) {
                user.setPersonalInfo(request.getPersonalInfo());
            }
            
            if (request.getContactInfo() != null) {
                user.setContactInfo(request.getContactInfo());
            }
            
            userRepository.save(user);
            
            return ApiResponse.success("Usuario actualizado exitosamente");
            
        } catch (Exception e) {
            return ApiResponse.error("Error al actualizar usuario: " + e.getMessage());
        }
    }
    
    public ApiResponse<String> deleteUser(String username) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (userOpt.isEmpty()) {
                return ApiResponse.error("Usuario no encontrado");
            }
            
            userRepository.delete(userOpt.get());
            
            return ApiResponse.success("Usuario eliminado exitosamente");
            
        } catch (Exception e) {
            return ApiResponse.error("Error al eliminar usuario: " + e.getMessage());
        }
    }
}
