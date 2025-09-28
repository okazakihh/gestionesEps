package com.gestioneps.pacientes.service;

import com.gestioneps.pacientes.dto.DocumentoMedicoDTO;
import com.gestioneps.pacientes.entity.DocumentoMedico;
import com.gestioneps.pacientes.entity.HistoriaClinica;
import com.gestioneps.pacientes.repository.DocumentoMedicoRepository;
import com.gestioneps.pacientes.repository.HistoriaClinicaRepository;
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
    private final HistoriaClinicaRepository historiaClinicaRepository;

    public DocumentoMedicoService(DocumentoMedicoRepository documentoMedicoRepository,
                                 HistoriaClinicaRepository historiaClinicaRepository) {
        this.documentoMedicoRepository = documentoMedicoRepository;
        this.historiaClinicaRepository = historiaClinicaRepository;
    }

    /**
     * Crear nuevo documento médico
     */
    public DocumentoMedicoDTO crearDocumento(Long historiaId, DocumentoMedicoDTO documentoDTO) {
        HistoriaClinica historia = historiaClinicaRepository.findById(historiaId)
            .orElseThrow(() -> new IllegalArgumentException("Historia clínica no encontrada con ID: " + historiaId));

        DocumentoMedico documento = convertirDtoAEntidad(documentoDTO);
        documento.setHistoriaClinica(historia);

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
     * Obtener documentos por historia clínica
     */
    @Transactional(readOnly = true)
    public Page<DocumentoMedicoDTO> obtenerDocumentosPorHistoria(Long historiaId, Pageable pageable) {
        HistoriaClinica historia = historiaClinicaRepository.findById(historiaId)
            .orElseThrow(() -> new IllegalArgumentException("Historia clínica no encontrada con ID: " + historiaId));

        List<DocumentoMedico> documentos = documentoMedicoRepository.findByHistoriaClinicaAndActivoTrueOrderByFechaCreacionDesc(historia);

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
        documento.setTipoDocumento(documentoDTO.getTipoDocumento());
        documento.setDescripcion(documentoDTO.getDescripcion());
        documento.setRutaArchivo(documentoDTO.getRutaArchivo());
        documento.setTamañoArchivo(documentoDTO.getTamañoArchivo());
        documento.setTipoMime(documentoDTO.getTipoMime());
        documento.setMedicoResponsable(documentoDTO.getMedicoResponsable());
        documento.setFechaDocumento(documentoDTO.getFechaDocumento());

        DocumentoMedico documentoActualizado = documentoMedicoRepository.save(documento);
        return convertirEntidadADto(documentoActualizado);
    }

    /**
     * Eliminar documento médico (desactivar)
     */
    public void eliminarDocumento(Long id) {
        DocumentoMedico documento = documentoMedicoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Documento médico no encontrado con ID: " + id));

        documento.setActivo(false);
        documentoMedicoRepository.save(documento);
    }

    /**
     * Convertir entidad a DTO
     */
    private DocumentoMedicoDTO convertirEntidadADto(DocumentoMedico documento) {
        DocumentoMedicoDTO dto = new DocumentoMedicoDTO();

        dto.setId(documento.getId());
        dto.setHistoriaClinicaId(documento.getHistoriaClinica().getId());
        dto.setNumeroHistoria(documento.getHistoriaClinica().getNumeroHistoria());
        dto.setPacienteNombre(documento.getHistoriaClinica().getPaciente().getNombreCompleto());
        dto.setNombreArchivo(documento.getNombreArchivo());
        dto.setTipoDocumento(documento.getTipoDocumento());
        dto.setDescripcion(documento.getDescripcion());
        dto.setRutaArchivo(documento.getRutaArchivo());
        dto.setTamañoArchivo(documento.getTamañoArchivo());
        dto.setTipoMime(documento.getTipoMime());
        dto.setMedicoResponsable(documento.getMedicoResponsable());
        dto.setFechaDocumento(documento.getFechaDocumento());
        dto.setActivo(documento.getActivo());
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
        documento.setTipoDocumento(dto.getTipoDocumento());
        documento.setDescripcion(dto.getDescripcion());
        documento.setRutaArchivo(dto.getRutaArchivo());
        documento.setTamañoArchivo(dto.getTamañoArchivo());
        documento.setTipoMime(dto.getTipoMime());
        documento.setMedicoResponsable(dto.getMedicoResponsable());
        documento.setFechaDocumento(dto.getFechaDocumento());
        documento.setActivo(dto.getActivo() != null ? dto.getActivo() : true);

        return documento;
    }
}