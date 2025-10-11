package com.gestioneps.administrative.service;

import com.gestioneps.administrative.dto.FacturacionDTO;
import com.gestioneps.administrative.entity.Facturacion;
import com.gestioneps.administrative.repository.FacturacionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FacturacionService {

    private final FacturacionRepository facturacionRepository;

    public FacturacionService(FacturacionRepository facturacionRepository) {
        this.facturacionRepository = facturacionRepository;
    }

    // Constantes para mensajes de error
    private static final String FACTURACION_NO_ENCONTRADA = "Facturación no encontrada con ID: ";

    /**
     * Crear nueva facturación desde JSON crudo
     */
    public FacturacionDTO crearFacturacionDesdeJson(String jsonData) {
        Facturacion facturacion = new Facturacion();
        facturacion.setJsonData(jsonData);
        facturacion.setActivo(true);

        Facturacion facturacionGuardada = facturacionRepository.save(facturacion);
        return convertirEntidadADTO(facturacionGuardada);
    }

    /**
     * Obtener facturación por ID
     */
    @Transactional(readOnly = true)
    public FacturacionDTO obtenerFacturacionPorId(Long id) {
        Facturacion facturacion = facturacionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(FACTURACION_NO_ENCONTRADA + id));
        return convertirEntidadADTO(facturacion);
    }

    /**
     * Obtener facturaciones activas
     */
    @Transactional(readOnly = true)
    public Page<FacturacionDTO> obtenerFacturacionesActivas(Pageable pageable) {
        Page<Facturacion> facturaciones = facturacionRepository.findByActivoTrue(pageable);
        return facturaciones.map(this::convertirEntidadADTO);
    }

    /**
     * Actualizar facturación
     */
    public FacturacionDTO actualizarFacturacion(Long id, String jsonData) {
        Facturacion facturacion = facturacionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(FACTURACION_NO_ENCONTRADA + id));

        facturacion.setJsonData(jsonData);
        Facturacion facturacionActualizada = facturacionRepository.save(facturacion);
        return convertirEntidadADTO(facturacionActualizada);
    }

    /**
     * Desactivar facturación
     */
    public void desactivarFacturacion(Long id) {
        Facturacion facturacion = facturacionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(FACTURACION_NO_ENCONTRADA + id));

        facturacion.setActivo(false);
        facturacionRepository.save(facturacion);
    }

    /**
     * Eliminar facturación
     */
    public void eliminarFacturacion(Long id) {
        Facturacion facturacion = facturacionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(FACTURACION_NO_ENCONTRADA + id));

        facturacionRepository.delete(facturacion);
    }

    /**
     * Convertir entidad a DTO
     */
    private FacturacionDTO convertirEntidadADTO(Facturacion facturacion) {
        FacturacionDTO dto = new FacturacionDTO();

        dto.setId(facturacion.getId());
        dto.setJsonData(facturacion.getJsonData());
        dto.setActivo(facturacion.getActivo());
        dto.setFechaCreacion(facturacion.getFechaCreacion().toLocalDate().toString());
        dto.setFechaActualizacion(facturacion.getFechaActualizacion().toLocalDate().toString());

        return dto;
    }
}