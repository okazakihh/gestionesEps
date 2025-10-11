package com.gestioneps.pacientes.service;

import com.gestioneps.pacientes.dto.DocumentoMedicoDTO;
import com.gestioneps.pacientes.entity.CitaMedica;
import com.gestioneps.pacientes.entity.DocumentoMedico;
import com.gestioneps.pacientes.repository.CitaMedicaRepository;
import com.gestioneps.pacientes.repository.DocumentoMedicoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentoMedicoService {

    private final DocumentoMedicoRepository documentoMedicoRepository;
    private final CitaMedicaRepository citaMedicaRepository;

    public DocumentoMedicoService(DocumentoMedicoRepository documentoMedicoRepository,
                                 CitaMedicaRepository citaMedicaRepository) {
        this.documentoMedicoRepository = documentoMedicoRepository;
        this.citaMedicaRepository = citaMedicaRepository;
    }

    /**
     * Crear nuevo documento médico
     */
    public DocumentoMedicoDTO crearDocumento(Long citaId, DocumentoMedicoDTO documentoDTO) {
        CitaMedica cita = citaMedicaRepository.findById(citaId)
            .orElseThrow(() -> new IllegalArgumentException("Cita médica no encontrada con ID: " + citaId));

        DocumentoMedico documento = convertirDtoAEntidad(documentoDTO);
        documento.setCitaMedica(cita);

        DocumentoMedico documentoGuardado = documentoMedicoRepository.save(documento);
        return convertirEntidadADto(documentoGuardado);
    }

    /**
     * Obtener documento por ID
     */
    @Transactional(readOnly = true)
    public DocumentoMedicoDTO obtenerDocumentoPorId(Long id) {
        DocumentoMedico documento = documentoMedicoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Documento médico no encontrado con ID: " + id));
        return convertirEntidadADto(documento);
    }

    /**
     * Obtener documentos por cita médica
     */
    @Transactional(readOnly = true)
    public Page<DocumentoMedicoDTO> obtenerDocumentosPorCita(Long citaId, Pageable pageable) {
        CitaMedica cita = citaMedicaRepository.findById(citaId)
            .orElseThrow(() -> new IllegalArgumentException("Cita médica no encontrada con ID: " + citaId));

        List<DocumentoMedico> documentos = documentoMedicoRepository.findByCitaMedicaOrderByFechaCreacionDesc(cita);

        // Aplicar paginación manualmente
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), documentos.size());

        if (start > documentos.size()) {
            return Page.empty();
        }

        List<DocumentoMedico> pageContent = documentos.subList(start, end);
        List<DocumentoMedicoDTO> dtos = pageContent.stream()
            .map(this::convertirEntidadADto)
            .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, documentos.size());
    }

    /**
     * Actualizar documento médico
     */
    public DocumentoMedicoDTO actualizarDocumento(Long id, DocumentoMedicoDTO documentoDTO) {
        DocumentoMedico documento = documentoMedicoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Documento médico no encontrado con ID: " + id));

        // Actualizar JSON data
        String jsonData = convertirDtoAJson(documentoDTO);
        documento.setJsonData(jsonData);

        DocumentoMedico documentoActualizado = documentoMedicoRepository.save(documento);
        return convertirEntidadADto(documentoActualizado);
    }

    /**
     * Eliminar documento médico
     */
    public void eliminarDocumento(Long id) {
        DocumentoMedico documento = documentoMedicoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Documento médico no encontrado con ID: " + id));

        documentoMedicoRepository.delete(documento);
    }

    /**
     * Convertir entidad a DTO
     */
    private DocumentoMedicoDTO convertirEntidadADto(DocumentoMedico documento) {
        DocumentoMedicoDTO dto = new DocumentoMedicoDTO();

        dto.setId(documento.getId());
        dto.setCitaMedicaId(documento.getCitaMedica().getId());
        dto.setNumeroHistoria(String.valueOf(documento.getCitaMedica().getId())); // Using cita ID as numeroHistoria
        dto.setPacienteNombre(documento.getCitaMedica().getPaciente().getNombreCompleto());
        dto.setJsonData(documento.getJsonData()); // Pasar JSON crudo directamente
        dto.setFechaCreacion(documento.getFechaCreacion());
        dto.setFechaActualizacion(documento.getFechaActualizacion());

        return dto;
    }

    /**
     * Convertir DTO a JSON - Ahora solo retorna el JSON crudo
     */
    private String convertirDtoAJson(DocumentoMedicoDTO dto) {
        return dto.getJsonData(); // Retornar JSON crudo directamente
    }

    /**
     * Convertir DTO a entidad
     */
    private DocumentoMedico convertirDtoAEntidad(DocumentoMedicoDTO dto) {
        DocumentoMedico documento = new DocumentoMedico();
        documento.setJsonData(convertirDtoAJson(dto));
        return documento;
    }
}