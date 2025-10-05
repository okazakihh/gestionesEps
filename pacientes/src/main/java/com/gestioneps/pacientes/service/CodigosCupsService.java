package com.gestioneps.pacientes.service;

import com.gestioneps.pacientes.dto.CodigosCupsDTO;
import com.gestioneps.pacientes.entity.CodigosCups;
import com.gestioneps.pacientes.repository.CodigosCupsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CodigosCupsService {

    @Autowired
    private CodigosCupsRepository codigosCupsRepository;

    /**
     * Crear un nuevo código CUP
     */
    public CodigosCupsDTO crearCodigoCups(CodigosCupsDTO dto) {
        // Validar que no exista el código
        if (codigosCupsRepository.existsByCodigoCup(dto.getCodigoCup())) {
            throw new IllegalArgumentException("Ya existe un código CUP con el código: " + dto.getCodigoCup());
        }

        CodigosCups entity = convertirDTOAEntidad(dto);
        CodigosCups guardado = codigosCupsRepository.save(entity);
        return convertirEntidadADTO(guardado);
    }

    /**
     * Actualizar un código CUP existente
     */
    public CodigosCupsDTO actualizarCodigoCups(Long id, CodigosCupsDTO dto) {
        CodigosCups existente = codigosCupsRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Código CUP no encontrado con ID: " + id));

        // Verificar si el código cambió y si ya existe
        if (!existente.getCodigoCup().equals(dto.getCodigoCup()) &&
            codigosCupsRepository.existsByCodigoCup(dto.getCodigoCup())) {
            throw new IllegalArgumentException("Ya existe otro código CUP con el código: " + dto.getCodigoCup());
        }

        existente.setCodigoCup(dto.getCodigoCup());
        existente.setNombreCup(dto.getNombreCup());
        existente.setDatosJson(dto.getDatosJson());

        CodigosCups actualizado = codigosCupsRepository.save(existente);
        return convertirEntidadADTO(actualizado);
    }

    /**
     * Obtener código CUP por ID
     */
    @Transactional(readOnly = true)
    public CodigosCupsDTO obtenerCodigoCupsPorId(Long id) {
        CodigosCups entity = codigosCupsRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Código CUP no encontrado con ID: " + id));
        return convertirEntidadADTO(entity);
    }

    /**
     * Obtener código CUP por código
     */
    @Transactional(readOnly = true)
    public CodigosCupsDTO obtenerCodigoCupsPorCodigo(String codigoCup) {
        CodigosCups entity = codigosCupsRepository.findByCodigoCup(codigoCup)
            .orElseThrow(() -> new IllegalArgumentException("Código CUP no encontrado con código: " + codigoCup));
        return convertirEntidadADTO(entity);
    }

    /**
     * Buscar códigos CUP por nombre
     */
    @Transactional(readOnly = true)
    public Page<CodigosCupsDTO> buscarCodigosCupsPorNombre(String nombre, Pageable pageable) {
        Page<CodigosCups> entities = codigosCupsRepository.findByNombreCupContainingIgnoreCase(nombre, pageable);
        return entities.map(this::convertirEntidadADTO);
    }

    /**
     * Buscar códigos CUP por código
     */
    @Transactional(readOnly = true)
    public Page<CodigosCupsDTO> buscarCodigosCupsPorCodigo(String codigo, Pageable pageable) {
        Page<CodigosCups> entities = codigosCupsRepository.findByCodigoCupContainingIgnoreCase(codigo, pageable);
        return entities.map(this::convertirEntidadADTO);
    }

    /**
     * Obtener todos los códigos CUP
     */
    @Transactional(readOnly = true)
    public Page<CodigosCupsDTO> obtenerTodosCodigosCups(Pageable pageable) {
        Page<CodigosCups> entities = codigosCupsRepository.findAll(pageable);
        return entities.map(this::convertirEntidadADTO);
    }

    /**
     * Búsqueda general de códigos CUP
     */
    @Transactional(readOnly = true)
    public Page<CodigosCupsDTO> buscarCodigosCups(String termino, Pageable pageable) {
        Page<CodigosCups> entities = codigosCupsRepository.buscarCodigosCups(termino, pageable);
        return entities.map(this::convertirEntidadADTO);
    }

    /**
     * Eliminar código CUP
     */
    public void eliminarCodigoCups(Long id) {
        if (!codigosCupsRepository.existsById(id)) {
            throw new IllegalArgumentException("Código CUP no encontrado con ID: " + id);
        }
        codigosCupsRepository.deleteById(id);
    }

    /**
     * Verificar si existe código CUP por código
     */
    @Transactional(readOnly = true)
    public boolean existeCodigoCupsPorCodigo(String codigoCup) {
        return codigosCupsRepository.existsByCodigoCup(codigoCup);
    }

    // Métodos de conversión
    private CodigosCups convertirDTOAEntidad(CodigosCupsDTO dto) {
        CodigosCups entity = new CodigosCups();
        entity.setCodigoCup(dto.getCodigoCup());
        entity.setNombreCup(dto.getNombreCup());
        entity.setDatosJson(dto.getDatosJson());
        return entity;
    }

    private CodigosCupsDTO convertirEntidadADTO(CodigosCups entity) {
        CodigosCupsDTO dto = new CodigosCupsDTO();
        dto.setId(entity.getId());
        dto.setCodigoCup(entity.getCodigoCup());
        dto.setNombreCup(entity.getNombreCup());
        dto.setDatosJson(entity.getDatosJson());
        dto.setFechaCreacion(entity.getFechaCreacion());
        dto.setFechaActualizacion(entity.getFechaActualizacion());
        return dto;
    }
}