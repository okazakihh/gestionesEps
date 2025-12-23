package com.gestioneps.administrative.controller;

import com.gestioneps.administrative.dto.ClienteFacturacionDTO;
import com.gestioneps.administrative.service.ClienteFacturacionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller REST para gestión de clientes de facturación
 */
@RestController
@RequestMapping("/clientes-facturacion")
public class ClienteFacturacionController {

    private final ClienteFacturacionService clienteService;

    public ClienteFacturacionController(ClienteFacturacionService clienteService) {
        this.clienteService = clienteService;
    }

    /**
     * Crear nuevo cliente
     * POST /api/clientes-facturacion
     * Body: JSON crudo directamente
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCliente(@RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (jsonData == null || jsonData.trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Datos vacíos");
                return ResponseEntity.badRequest().body(response);
            }

            ClienteFacturacionDTO nuevoCliente = clienteService.crearClienteDesdeJson(jsonData);
            response.put("success", true);
            response.put("data", nuevoCliente);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("error", "Datos inválidos: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Obtener cliente por ID
     * GET /api/clientes-facturacion/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerClientePorId(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            ClienteFacturacionDTO cliente = clienteService.obtenerClientePorId(id);
            response.put("success", true);
            response.put("data", cliente);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("error", "Cliente no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Obtener todos los clientes activos (sin paginación)
     * GET /api/clientes-facturacion
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerTodosLosClientes() {
        Map<String, Object> response = new HashMap<>();
        List<ClienteFacturacionDTO> clientes = clienteService.obtenerTodosLosClientes();
        response.put("success", true);
        response.put("data", clientes);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener clientes activos con paginación
     * GET /api/clientes-facturacion/paginated?page=0&size=10&sort=fechaCreacion,desc
     */
    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> obtenerClientesPaginados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Map<String, Object> response = new HashMap<>();
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ClienteFacturacionDTO> clientes = clienteService.obtenerClientesActivos(pageable);
        response.put("success", true);
        response.put("data", clientes);
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar cliente por número de documento
     * GET /api/clientes-facturacion/buscar/documento/{numeroDocumento}
     */
    @GetMapping("/buscar/documento/{numeroDocumento}")
    public ResponseEntity<Map<String, Object>> buscarPorDocumento(@PathVariable String numeroDocumento) {
        Map<String, Object> response = new HashMap<>();
        Optional<ClienteFacturacionDTO> cliente = clienteService.buscarPorNumeroDocumento(numeroDocumento);
        if (cliente.isPresent()) {
            response.put("success", true);
            response.put("data", cliente.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", "Cliente no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Buscar clientes por tipo de persona
     * GET /api/clientes-facturacion/buscar/tipo/{tipoPersona}
     */
    @GetMapping("/buscar/tipo/{tipoPersona}")
    public ResponseEntity<Map<String, Object>> buscarPorTipoPersona(@PathVariable String tipoPersona) {
        Map<String, Object> response = new HashMap<>();
        List<ClienteFacturacionDTO> clientes = clienteService.buscarPorTipoPersona(tipoPersona);
        response.put("success", true);
        response.put("data", clientes);
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar cliente por código Siigo
     * GET /api/clientes-facturacion/buscar/siigo/{codigoSiigo}
     */
    @GetMapping("/buscar/siigo/{codigoSiigo}")
    public ResponseEntity<Map<String, Object>> buscarPorCodigoSiigo(@PathVariable String codigoSiigo) {
        Map<String, Object> response = new HashMap<>();
        Optional<ClienteFacturacionDTO> cliente = clienteService.buscarPorCodigoSiigo(codigoSiigo);
        if (cliente.isPresent()) {
            response.put("success", true);
            response.put("data", cliente.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", "Cliente no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Buscar clientes por nombre o razón social
     * GET /api/clientes-facturacion/buscar/nombre?q=Juan
     */
    @GetMapping("/buscar/nombre")
    public ResponseEntity<Map<String, Object>> buscarPorNombre(@RequestParam String q) {
        Map<String, Object> response = new HashMap<>();
        List<ClienteFacturacionDTO> clientes = clienteService.buscarPorNombre(q);
        response.put("success", true);
        response.put("data", clientes);
        return ResponseEntity.ok(response);
    }

    /**
     * Actualizar cliente
     * PUT /api/clientes-facturacion/{id}
     * Body: JSON crudo directamente
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarCliente(
            @PathVariable Long id,
            @RequestBody String jsonData
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (jsonData == null || jsonData.trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Datos vacíos");
                return ResponseEntity.badRequest().body(response);
            }

            ClienteFacturacionDTO clienteActualizado = clienteService.actualizarCliente(id, jsonData);
            response.put("success", true);
            response.put("data", clienteActualizado);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("error", "Cliente no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Desactivar cliente (soft delete)
     * DELETE /api/clientes-facturacion/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> desactivarCliente(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            clienteService.desactivarCliente(id);
            response.put("success", true);
            response.put("message", "Cliente desactivado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("error", "Cliente no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Reactivar cliente
     * POST /api/clientes-facturacion/{id}/reactivar
     */
    @PostMapping("/{id}/reactivar")
    public ResponseEntity<Map<String, Object>> reactivarCliente(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            clienteService.reactivarCliente(id);
            response.put("success", true);
            response.put("message", "Cliente reactivado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("error", "Cliente no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Obtener estadísticas de clientes
     * GET /api/clientes-facturacion/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> stats = clienteService.obtenerEstadisticas();
        response.put("success", true);
        response.put("data", stats);
        return ResponseEntity.ok(response);
    }
}
