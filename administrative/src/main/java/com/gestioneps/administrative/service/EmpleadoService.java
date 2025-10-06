package com.gestioneps.administrative.service;

import com.gestioneps.administrative.dto.EmpleadoDTO;
import com.gestioneps.administrative.entity.Empleado;
import com.gestioneps.administrative.repository.EmpleadoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    public EmpleadoService(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    // Constantes para mensajes de error
    private static final String EMPLEADO_NO_ENCONTRADO = "Empleado no encontrado con ID: ";

    /**
     * Crear nuevo empleado desde JSON crudo
     */
    public EmpleadoDTO crearEmpleadoDesdeJson(String jsonData) {
        Empleado empleado = new Empleado();
        empleado.setJsonData(jsonData);
        empleado.setActivo(true);

        Empleado empleadoGuardado = empleadoRepository.save(empleado);
        return convertirEntidadADTO(empleadoGuardado);
    }

    /**
     * Obtener empleado por ID
     */
    @Transactional(readOnly = true)
    public EmpleadoDTO obtenerEmpleadoPorId(Long id) {
        Empleado empleado = empleadoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(EMPLEADO_NO_ENCONTRADO + id));
        return convertirEntidadADTO(empleado);
    }

    /**
     * Obtener empleados activos
     */
    @Transactional(readOnly = true)
    public Page<EmpleadoDTO> obtenerEmpleadosActivos(Pageable pageable) {
        Page<Empleado> empleados = empleadoRepository.findByActivoTrue(pageable);
        return empleados.map(this::convertirEntidadADTO);
    }

    /**
     * Actualizar empleado
     */
    public EmpleadoDTO actualizarEmpleado(Long id, String jsonData) {
        Empleado empleado = empleadoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(EMPLEADO_NO_ENCONTRADO + id));

        empleado.setJsonData(jsonData);
        Empleado empleadoActualizado = empleadoRepository.save(empleado);
        return convertirEntidadADTO(empleadoActualizado);
    }

    /**
     * Desactivar empleado
     */
    public void desactivarEmpleado(Long id) {
        Empleado empleado = empleadoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(EMPLEADO_NO_ENCONTRADO + id));

        empleado.setActivo(false);
        empleadoRepository.save(empleado);
    }

    /**
     * Eliminar empleado
     */
    public void eliminarEmpleado(Long id) {
        Empleado empleado = empleadoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(EMPLEADO_NO_ENCONTRADO + id));

        empleadoRepository.delete(empleado);
    }

    /**
     * Convertir entidad a DTO
     */
    private EmpleadoDTO convertirEntidadADTO(Empleado empleado) {
        EmpleadoDTO dto = new EmpleadoDTO();

        dto.setId(empleado.getId());
        dto.setJsonData(empleado.getJsonData());
        dto.setActivo(empleado.getActivo());
        dto.setFechaCreacion(empleado.getFechaCreacion().toLocalDate().toString());
        dto.setFechaActualizacion(empleado.getFechaActualizacion().toLocalDate().toString());

        return dto;
    }
}