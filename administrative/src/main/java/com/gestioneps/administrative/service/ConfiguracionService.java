package com.gestioneps.administrative.service;

import com.gestioneps.administrative.dto.ConfiguracionDTO;
import com.gestioneps.administrative.entity.Configuracion;
import com.gestioneps.administrative.repository.ConfiguracionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConfiguracionService {

    private final ConfiguracionRepository configuracionRepository;

    public ConfiguracionService(ConfiguracionRepository configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }

    // Constantes para mensajes de error
    private static final String CONFIGURACION_NO_ENCONTRADA = "Configuración no encontrada con ID: ";
    private static final String CONFIGURACION_CLAVE_NO_ENCONTRADA = "Configuración no encontrada con clave: ";
    private static final String CONFIGURACION_CLAVE_EXISTE = "Ya existe una configuración con la clave: ";

    /**
     * Crear nueva configuración desde JSON crudo
     */
    public ConfiguracionDTO crearConfiguracionDesdeJson(String jsonData, String clave, String tipoConfiguracion) {
        // Validar que no existe una configuración con la misma clave
        if (configuracionRepository.existsByClave(clave)) {
            throw new IllegalArgumentException(CONFIGURACION_CLAVE_EXISTE + clave);
        }

        Configuracion configuracion = new Configuracion();
        configuracion.setJsonData(jsonData);
        configuracion.setClave(clave);
        configuracion.setTipoConfiguracion(tipoConfiguracion);
        configuracion.setActivo(true);

        Configuracion configuracionGuardada = configuracionRepository.save(configuracion);
        return convertirEntidadADTO(configuracionGuardada);
    }

    /**
     * Obtener configuración por ID
     */
    @Transactional(readOnly = true)
    public ConfiguracionDTO obtenerConfiguracionPorId(Long id) {
        Configuracion configuracion = configuracionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(CONFIGURACION_NO_ENCONTRADA + id));
        return convertirEntidadADTO(configuracion);
    }

    /**
     * Obtener configuración por clave
     */
    @Transactional(readOnly = true)
    public ConfiguracionDTO obtenerConfiguracionPorClave(String clave) {
        Configuracion configuracion = configuracionRepository.findActiveByClave(clave)
            .orElseThrow(() -> new IllegalArgumentException(CONFIGURACION_CLAVE_NO_ENCONTRADA + clave));
        return convertirEntidadADTO(configuracion);
    }

    /**
     * Obtener todas las configuraciones activas
     */
    @Transactional(readOnly = true)
    public Page<ConfiguracionDTO> obtenerConfiguracionesActivas(Pageable pageable) {
        Page<Configuracion> configuraciones = configuracionRepository.findByActivoTrue(pageable);
        return configuraciones.map(this::convertirEntidadADTO);
    }

    /**
     * Obtener configuraciones por tipo
     */
    @Transactional(readOnly = true)
    public Page<ConfiguracionDTO> obtenerConfiguracionesPorTipo(String tipoConfiguracion, Pageable pageable) {
        Page<Configuracion> configuraciones = configuracionRepository
            .findByTipoConfiguracionAndActivoTrue(tipoConfiguracion, pageable);
        return configuraciones.map(this::convertirEntidadADTO);
    }

    /**
     * Actualizar configuración
     */
    public ConfiguracionDTO actualizarConfiguracion(Long id, String jsonData) {
        Configuracion configuracion = configuracionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(CONFIGURACION_NO_ENCONTRADA + id));

        configuracion.setJsonData(jsonData);
        Configuracion configuracionActualizada = configuracionRepository.save(configuracion);
        return convertirEntidadADTO(configuracionActualizada);
    }

    /**
     * Actualizar configuración por clave
     */
    public ConfiguracionDTO actualizarConfiguracionPorClave(String clave, String jsonData) {
        Configuracion configuracion = configuracionRepository.findByClave(clave)
            .orElseThrow(() -> new IllegalArgumentException(CONFIGURACION_CLAVE_NO_ENCONTRADA + clave));

        configuracion.setJsonData(jsonData);
        Configuracion configuracionActualizada = configuracionRepository.save(configuracion);
        return convertirEntidadADTO(configuracionActualizada);
    }

    /**
     * Desactivar configuración
     */
    public void desactivarConfiguracion(Long id) {
        Configuracion configuracion = configuracionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(CONFIGURACION_NO_ENCONTRADA + id));

        configuracion.setActivo(false);
        configuracionRepository.save(configuracion);
    }

    /**
     * Eliminar configuración
     */
    public void eliminarConfiguracion(Long id) {
        Configuracion configuracion = configuracionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(CONFIGURACION_NO_ENCONTRADA + id));

        configuracionRepository.delete(configuracion);
    }

    /**
     * Convertir entidad a DTO
     */
    private ConfiguracionDTO convertirEntidadADTO(Configuracion configuracion) {
        ConfiguracionDTO dto = new ConfiguracionDTO();

        dto.setId(configuracion.getId());
        dto.setJsonData(configuracion.getJsonData());
        dto.setTipoConfiguracion(configuracion.getTipoConfiguracion());
        dto.setClave(configuracion.getClave());
        dto.setActivo(configuracion.getActivo());
        dto.setFechaCreacion(configuracion.getFechaCreacion().toLocalDate().toString());
        dto.setFechaActualizacion(configuracion.getFechaActualizacion().toLocalDate().toString());

        return dto;
    }
}
