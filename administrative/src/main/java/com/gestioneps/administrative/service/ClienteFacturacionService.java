package com.gestioneps.administrative.service;

import com.gestioneps.administrative.dto.ClienteFacturacionDTO;
import com.gestioneps.administrative.entity.ClienteFacturacion;
import com.gestioneps.administrative.repository.ClienteFacturacionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service para gestión de clientes de facturación
 */
@Service
@Transactional
public class ClienteFacturacionService {

    private final ClienteFacturacionRepository clienteRepository;

    public ClienteFacturacionService(ClienteFacturacionRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    private static final String CLIENTE_NO_ENCONTRADO = "Cliente no encontrado con ID: ";

    /**
     * Crear nuevo cliente desde JSON crudo
     * 
     * @param jsonData JSON con todos los datos del cliente
     * @return DTO del cliente creado
     */
    public ClienteFacturacionDTO crearClienteDesdeJson(String jsonData) {
        ClienteFacturacion cliente = new ClienteFacturacion();
        cliente.setJsonData(jsonData);
        cliente.setActivo(true);

        ClienteFacturacion clienteGuardado = clienteRepository.save(cliente);
        return convertirEntidadADTO(clienteGuardado);
    }

    /**
     * Obtener cliente por ID
     * 
     * @param id ID del cliente
     * @return DTO del cliente
     */
    @Transactional(readOnly = true)
    public ClienteFacturacionDTO obtenerClientePorId(Long id) {
        ClienteFacturacion cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(CLIENTE_NO_ENCONTRADO + id));
        return convertirEntidadADTO(cliente);
    }

    /**
     * Obtener todos los clientes activos (sin paginación)
     * 
     * @return Lista de DTOs de clientes
     */
    @Transactional(readOnly = true)
    public List<ClienteFacturacionDTO> obtenerTodosLosClientes() {
        List<ClienteFacturacion> clientes = clienteRepository.findByActivoTrueOrderByFechaCreacionDesc();
        return clientes.stream()
            .map(this::convertirEntidadADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener clientes activos con paginación
     * 
     * @param pageable Configuración de paginación
     * @return Página de DTOs de clientes
     */
    @Transactional(readOnly = true)
    public Page<ClienteFacturacionDTO> obtenerClientesActivos(Pageable pageable) {
        Page<ClienteFacturacion> clientes = clienteRepository.findByActivoTrue(pageable);
        return clientes.map(this::convertirEntidadADTO);
    }

    /**
     * Buscar cliente por número de documento
     * 
     * @param numeroDocumento Número de documento del cliente
     * @return Optional con el DTO del cliente si se encuentra
     */
    @Transactional(readOnly = true)
    public Optional<ClienteFacturacionDTO> buscarPorNumeroDocumento(String numeroDocumento) {
        Optional<ClienteFacturacion> cliente = clienteRepository.findByNumeroDocumento(numeroDocumento);
        return cliente.map(this::convertirEntidadADTO);
    }

    /**
     * Buscar clientes por tipo de persona
     * 
     * @param tipoPersona NATURAL o JURIDICA
     * @return Lista de DTOs de clientes
     */
    @Transactional(readOnly = true)
    public List<ClienteFacturacionDTO> buscarPorTipoPersona(String tipoPersona) {
        List<ClienteFacturacion> clientes = clienteRepository.findByTipoPersona(tipoPersona);
        return clientes.stream()
            .map(this::convertirEntidadADTO)
            .collect(Collectors.toList());
    }

    /**
     * Buscar cliente por código Siigo
     * 
     * @param codigoSiigo Código del cliente en Siigo
     * @return Optional con el DTO del cliente si se encuentra
     */
    @Transactional(readOnly = true)
    public Optional<ClienteFacturacionDTO> buscarPorCodigoSiigo(String codigoSiigo) {
        Optional<ClienteFacturacion> cliente = clienteRepository.findByCodigoSiigo(codigoSiigo);
        return cliente.map(this::convertirEntidadADTO);
    }

    /**
     * Buscar clientes por nombre o razón social
     * 
     * @param busqueda Término de búsqueda
     * @return Lista de DTOs de clientes que coincidan
     */
    @Transactional(readOnly = true)
    public List<ClienteFacturacionDTO> buscarPorNombre(String busqueda) {
        List<ClienteFacturacion> clientes = clienteRepository.buscarPorNombre(busqueda);
        return clientes.stream()
            .map(this::convertirEntidadADTO)
            .collect(Collectors.toList());
    }

    /**
     * Actualizar cliente
     * 
     * @param id ID del cliente a actualizar
     * @param jsonData Nuevos datos en formato JSON
     * @return DTO del cliente actualizado
     */
    public ClienteFacturacionDTO actualizarCliente(Long id, String jsonData) {
        ClienteFacturacion cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(CLIENTE_NO_ENCONTRADO + id));

        cliente.setJsonData(jsonData);
        ClienteFacturacion clienteActualizado = clienteRepository.save(cliente);

        return convertirEntidadADTO(clienteActualizado);
    }

    /**
     * Desactivar cliente (soft delete)
     * 
     * @param id ID del cliente a desactivar
     */
    public void desactivarCliente(Long id) {
        ClienteFacturacion cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(CLIENTE_NO_ENCONTRADO + id));

        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    /**
     * Reactivar cliente
     * 
     * @param id ID del cliente a reactivar
     */
    public void reactivarCliente(Long id) {
        ClienteFacturacion cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(CLIENTE_NO_ENCONTRADO + id));

        cliente.setActivo(true);
        clienteRepository.save(cliente);
    }

    /**
     * Contar clientes activos
     * 
     * @return Número de clientes activos
     */
    @Transactional(readOnly = true)
    public long contarClientesActivos() {
        return clienteRepository.countByActivoTrue();
    }

    /**
     * Obtener estadísticas de clientes
     * 
     * @return Mapa con estadísticas
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> obtenerEstadisticas() {
        long totalActivos = clienteRepository.countByActivoTrue();
        long totalGeneral = clienteRepository.count();

        return java.util.Map.of(
            "totalClientesActivos", totalActivos,
            "totalClientesGeneral", totalGeneral,
            "totalClientesInactivos", totalGeneral - totalActivos
        );
    }

    // Método auxiliar para convertir entidad a DTO
    private ClienteFacturacionDTO convertirEntidadADTO(ClienteFacturacion cliente) {
        return new ClienteFacturacionDTO(
            cliente.getId(),
            cliente.getJsonData(),
            cliente.getActivo(),
            cliente.getFechaCreacion(),
            cliente.getFechaActualizacion()
        );
    }
}
