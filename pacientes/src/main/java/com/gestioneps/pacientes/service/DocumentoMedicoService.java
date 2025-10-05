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

        // Actualizar campos
        documento.setNombreArchivo(documentoDTO.getNombreArchivo());
        documento.setTipoArchivo(documentoDTO.getTipoArchivo());
        documento.setArchivoBase64(documentoDTO.getArchivoBase64());
        documento.setDocumento(documentoDTO.getDocumento());

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
        dto.setNombreArchivo(documento.getNombreArchivo());
        dto.setTipoArchivo(documento.getTipoArchivo());
        dto.setArchivoBase64(documento.getArchivoBase64());
        dto.setDocumento(documento.getDocumento());
        dto.setFechaCreacion(documento.getFechaCreacion());
        dto.setFechaActualizacion(documento.getFechaActualizacion());

        return dto;
    }

    /**
     * Convertir DTO a entidad
     */
    private DocumentoMedico convertirDtoAEntidad(DocumentoMedicoDTO dto) {
        DocumentoMedico documento = new DocumentoMedico();

        documento.setNombreArchivo(dto.getNombreArchivo());
        documento.setTipoArchivo(dto.getTipoArchivo());
        documento.setArchivoBase64(dto.getArchivoBase64());
        documento.setDocumento(dto.getDocumento());

        return documento;
    }
}