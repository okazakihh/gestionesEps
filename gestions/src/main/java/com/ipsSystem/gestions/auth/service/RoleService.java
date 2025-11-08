package com.ipsSystem.gestions.auth.service;

import com.ipsSystem.gestions.auth.dto.RoleDTO;
import com.ipsSystem.gestions.auth.entity.Role;
import com.ipsSystem.gestions.auth.repository.RoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de Roles
 * Contiene la lógica de negocio para operaciones CRUD de roles
 */
@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    // Constantes para mensajes
    private static final String ROL_NO_ENCONTRADO = "Rol no encontrado con ID: ";
    private static final String ROL_YA_EXISTE = "Ya existe un rol con el nombre: ";

    /**
     * Obtener todos los roles (paginado)
     */
    @Transactional(readOnly = true)
    public Page<RoleDTO> getAllRoles(Pageable pageable) {
        Page<Role> roles = roleRepository.findAll(pageable);
        return roles.map(this::convertToDTO);
    }

    /**
     * Obtener todos los roles (lista completa sin paginar)
     */
    @Transactional(readOnly = true)
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener rol por ID
     */
    @Transactional(readOnly = true)
    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(ROL_NO_ENCONTRADO + id));
        return convertToDTO(role);
    }

    /**
     * Obtener rol por nombre
     */
    @Transactional(readOnly = true)
    public RoleDTO getRoleByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con nombre: " + name));
        return convertToDTO(role);
    }

    /**
     * Crear nuevo rol
     */
    public RoleDTO createRole(RoleDTO roleDTO) {
        // Validar que no exista un rol con el mismo nombre
        if (roleRepository.existsByName(roleDTO.getName())) {
            throw new IllegalArgumentException(ROL_YA_EXISTE + roleDTO.getName());
        }

        Role role = new Role();
        role.setName(roleDTO.getName());

        Role savedRole = roleRepository.save(role);
        return convertToDTO(savedRole);
    }

    /**
     * Actualizar rol existente
     */
    public RoleDTO updateRole(Long id, RoleDTO roleDTO) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(ROL_NO_ENCONTRADO + id));

        // Validar que no exista otro rol con el mismo nombre
        if (!role.getName().equals(roleDTO.getName()) && 
            roleRepository.existsByName(roleDTO.getName())) {
            throw new IllegalArgumentException(ROL_YA_EXISTE + roleDTO.getName());
        }

        role.setName(roleDTO.getName());

        Role updatedRole = roleRepository.save(role);
        return convertToDTO(updatedRole);
    }

    /**
     * Eliminar rol
     */
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(ROL_NO_ENCONTRADO + id));

        // TODO: Validar que no haya usuarios asociados a este rol antes de eliminarlo
        
        roleRepository.delete(role);
    }

    /**
     * Verificar si existe un rol por nombre
     */
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return roleRepository.existsByName(name);
    }

    /**
     * Convertir entidad Role a RoleDTO
     */
    private RoleDTO convertToDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        return dto;
    }

    /**
     * Convertir RoleDTO a entidad Role
     */
    private Role convertToEntity(RoleDTO dto) {
        Role role = new Role();
        role.setId(dto.getId());
        role.setName(dto.getName());
        return role;
    }
}
