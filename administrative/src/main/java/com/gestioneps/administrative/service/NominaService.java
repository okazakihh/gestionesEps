package com.gestioneps.administrative.service;

import com.gestioneps.administrative.dto.NominaDTO;
import com.gestioneps.administrative.entity.Empleado;
import com.gestioneps.administrative.entity.Nomina;
import com.gestioneps.administrative.repository.EmpleadoRepository;
import com.gestioneps.administrative.repository.NominaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NominaService {

    private final NominaRepository nominaRepository;
    private final EmpleadoRepository empleadoRepository;

    public NominaService(NominaRepository nominaRepository, EmpleadoRepository empleadoRepository) {
        this.nominaRepository = nominaRepository;
        this.empleadoRepository = empleadoRepository;
    }

    // Constantes para mensajes de error
    private static final String NOMINA_NO_ENCONTRADA = "Nómina no encontrada con ID: ";
    private static final String EMPLEADO_NO_ENCONTRADO = "Empleado no encontrado con ID: ";

    /**
     * Crear nueva nómina para un empleado desde JSON crudo
     */
    public NominaDTO crearNominaDesdeJson(Long empleadoId, String jsonData) {
        Empleado empleado = empleadoRepository.findById(empleadoId)
            .orElseThrow(() -> new IllegalArgumentException(EMPLEADO_NO_ENCONTRADO + empleadoId));

        Nomina nomina = new Nomina();
        nomina.setEmpleado(empleado);
        nomina.setJsonData(jsonData);
        nomina.setActivo(true);

        Nomina nominaGuardada = nominaRepository.save(nomina);
        return convertirEntidadADTO(nominaGuardada);
    }

    /**
     * Obtener nómina por ID
     */
    @Transactional(readOnly = true)
    public NominaDTO obtenerNominaPorId(Long id) {
        Nomina nomina = nominaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(NOMINA_NO_ENCONTRADA + id));
        return convertirEntidadADTO(nomina);
    }

    /**
     * Obtener nóminas activas
     */
    @Transactional(readOnly = true)
    public Page<NominaDTO> obtenerNominasActivas(Pageable pageable) {
        Page<Nomina> nominas = nominaRepository.findByActivoTrue(pageable);
        return nominas.map(this::convertirEntidadADTO);
    }

    /**
     * Obtener nóminas por empleado
     */
    @Transactional(readOnly = true)
    public Page<NominaDTO> obtenerNominasPorEmpleado(Long empleadoId, Pageable pageable) {
        List<Nomina> nominas = nominaRepository.findByEmpleadoIdAndActivoTrue(empleadoId);

        // Aplicar paginación manualmente
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), nominas.size());

        if (start > nominas.size()) {
            return Page.empty();
        }

        List<Nomina> pageContent = nominas.subList(start, end);
        return new PageImpl<>(
            pageContent.stream().map(this::convertirEntidadADTO).toList(),
            pageable,
            nominas.size()
        );
    }

    /**
     * Actualizar nómina
     */
    public NominaDTO actualizarNomina(Long id, String jsonData) {
        Nomina nomina = nominaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(NOMINA_NO_ENCONTRADA + id));

        nomina.setJsonData(jsonData);
        Nomina nominaActualizada = nominaRepository.save(nomina);
        return convertirEntidadADTO(nominaActualizada);
    }

    /**
     * Desactivar nómina
     */
    public void desactivarNomina(Long id) {
        Nomina nomina = nominaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(NOMINA_NO_ENCONTRADA + id));

        nomina.setActivo(false);
        nominaRepository.save(nomina);
    }

    /**
     * Eliminar nómina
     */
    public void eliminarNomina(Long id) {
        Nomina nomina = nominaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(NOMINA_NO_ENCONTRADA + id));

        nominaRepository.delete(nomina);
    }

    /**
     * Convertir entidad a DTO
     */
    private NominaDTO convertirEntidadADTO(Nomina nomina) {
        NominaDTO dto = new NominaDTO();

        dto.setId(nomina.getId());
        dto.setEmpleadoId(nomina.getEmpleado().getId());
        dto.setJsonData(nomina.getJsonData());
        dto.setActivo(nomina.getActivo());
        dto.setFechaCreacion(nomina.getFechaCreacion().toLocalDate().toString());
        dto.setFechaActualizacion(nomina.getFechaActualizacion().toLocalDate().toString());

        return dto;
    }
}