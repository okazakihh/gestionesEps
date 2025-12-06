package com.gestioneps.administrative.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller para integración con Siigo (Proveedor Autorizado de Facturación Electrónica)
 * Soporta modo MOCK para desarrollo sin credenciales
 * Maneja el envío de facturas a la DIAN a través de Siigo API
 */
@RestController
@RequestMapping("/dian")
public class DianController {

    private static final Logger log = LoggerFactory.getLogger(DianController.class);
    private final RestTemplate restTemplate;

    @Value("${siigo.api.url:https://api.siigo.com/v1}")
    private String siigoApiUrl;

    @Value("${siigo.access.key:}")
    private String siigoAccessKey;
    
    @Value("${siigo.username:}")
    private String siigoUsername;
    
    @Value("${siigo.environment:mock}")
    private String environment; // mock, sandbox o production
    
    private String cachedAccessToken = null;
    private long tokenExpirationTime = 0;

    public DianController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Enviar factura a la DIAN
     * Soporta modo MOCK para desarrollo y modo real para Siigo
     */
    @PostMapping("/enviar-factura")
    public ResponseEntity<Map<String, Object>> enviarFactura(@RequestBody Map<String, Object> facturaData) {
        
        try {
            log.info("Enviando factura - Ambiente: {}", environment);
            
            // MODO MOCK: Retornar datos simulados sin llamar API real
            if ("mock".equalsIgnoreCase(environment)) {
                log.info("Modo MOCK activado - Generando factura simulada");
                return ResponseEntity.ok(generarFacturaMock(facturaData));
            }
            
            // MODO REAL: Llamar a Siigo API
            // Obtener access token de Siigo
            String accessToken = obtenerAccessToken();
            
            // Construir request para Siigo
            Map<String, Object> request = construirRequestSiigo(facturaData);
            
            // Configurar headers con Bearer Token de Siigo
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Partner-Id", "GestionEPS");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            // Enviar a Siigo
            String url = siigoApiUrl + "/invoices";
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            Map<String, Object> responseBody = response.getBody();
            log.info("Respuesta exitosa de Siigo - Invoice ID: {}", responseBody.get("id"));
            
            // Transformar respuesta al formato esperado por el frontend
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("cufe", responseBody.get("cufe"));
            result.put("numeroFactura", responseBody.get("number"));
            result.put("qrCode", responseBody.get("qr_code"));
            result.put("pdfUrl", responseBody.get("pdf"));
            result.put("xmlUrl", responseBody.get("xml"));
            result.put("statusCode", responseBody.get("status"));
            result.put("statusDescription", "Factura aprobada por DIAN");
            result.put("environment", environment);
            result.put("provider", "Siigo");
            result.put("siigoId", responseBody.get("id"));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error enviando factura a FacturaTech: {}", e.getMessage(), e);
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", e.getMessage());
            errorResult.put("details", e instanceof org.springframework.web.client.HttpStatusCodeException 
                ? ((org.springframework.web.client.HttpStatusCodeException) e).getResponseBodyAsString() 
                : null);
            
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResult);
        }
    }

    /**
     * Consultar estado de factura en Siigo/DIAN
     */
    @GetMapping("/consultar-estado/{invoiceId}")
    public ResponseEntity<Map<String, Object>> consultarEstado(@PathVariable String invoiceId) {
        
        try {
            log.info("Consultando estado de factura: {}", invoiceId);
            
            // MODO MOCK
            if ("mock".equalsIgnoreCase(environment)) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("estado", "approved");
                result.put("cufe", "MOCK-CUFE-" + invoiceId);
                Map<String, Object> detalles = new HashMap<>();
                detalles.put("id", invoiceId);
                detalles.put("status", "approved");
                detalles.put("message", "Factura aprobada (MOCK)");
                result.put("detalles", detalles);
                return ResponseEntity.ok(result);
            }
            
            // MODO REAL: Siigo
            String accessToken = obtenerAccessToken();
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Partner-Id", "GestionEPS");
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            String url = siigoApiUrl + "/invoices/" + invoiceId;
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Map.class
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("estado", response.getBody().get("status"));
            result.put("cufe", response.getBody().get("cufe"));
            result.put("detalles", response.getBody());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error consultando estado: {}", e.getMessage(), e);
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("error", e.getMessage());
            
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResult);
        }
    }
    
    /**
     * Obtener access token de Siigo (OAuth 2.0)
     * Cachea el token mientras sea válido
     */
    private String obtenerAccessToken() {
        // Si hay token cacheado y no ha expirado
        if (cachedAccessToken != null && System.currentTimeMillis() < tokenExpirationTime) {
            return cachedAccessToken;
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> authRequest = new HashMap<>();
            authRequest.put("username", siigoUsername);
            authRequest.put("access_key", siigoAccessKey);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(authRequest, headers);
            
            String authUrl = siigoApiUrl.replace("/v1", "") + "/auth";
            ResponseEntity<Map> response = restTemplate.exchange(
                authUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            Map<String, Object> responseBody = response.getBody();
            cachedAccessToken = (String) responseBody.get("access_token");
            Integer expiresIn = (Integer) responseBody.get("expires_in");
            tokenExpirationTime = System.currentTimeMillis() + (expiresIn * 1000L) - 60000; // 1 minuto de margen
            
            log.info("Access token obtenido exitosamente");
            return cachedAccessToken;
            
        } catch (Exception e) {
            log.error("Error obteniendo access token de Siigo: {}", e.getMessage());
            throw new RuntimeException("No se pudo autenticar con Siigo", e);
        }
    }
    
    /**
     * Generar factura MOCK para desarrollo sin API real
     */
    private Map<String, Object> generarFacturaMock(Map<String, Object> facturaData) {
        String mockId = "MOCK-" + System.currentTimeMillis();
        String mockCufe = "CUFE" + UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("cufe", mockCufe);
        result.put("numeroFactura", "FE-MOCK-" + mockId);
        result.put("qrCode", "https://catalogo-vpfe.dian.gov.co/Document/FindDocument?documentKey=" + mockCufe);
        result.put("pdfUrl", "https://mock-siigo.com/pdf/" + mockId + ".pdf");
        result.put("xmlUrl", "https://mock-siigo.com/xml/" + mockId + ".xml");
        result.put("statusCode", "approved");
        result.put("statusDescription", "Factura MOCK generada exitosamente - Modo desarrollo");
        result.put("environment", "mock");
        result.put("provider", "Siigo (Mock)");
        result.put("siigoId", mockId);
        
        // Log para debugging
        Map<String, Object> clienteData = (Map<String, Object>) facturaData.get("cliente");
        if (clienteData != null) {
            log.info("Factura MOCK generada para cliente: {} - Documento: {}", 
                clienteData.get("nombreCompleto"), 
                clienteData.get("numeroDocumento"));
        }
        
        List<Map<String, Object>> items = (List<Map<String, Object>>) facturaData.get("items");
        if (items != null) {
            double total = items.stream()
                .mapToDouble(item -> {
                    Number cantidad = (Number) item.get("cantidad");
                    Number valorUnitario = (Number) item.get("valorUnitario");
                    return cantidad.doubleValue() * valorUnitario.doubleValue();
                })
                .sum();
            result.put("total", total);
            log.info("Total factura MOCK: ${}", total);
        }
        
        return result;
    }
    
    /**
     * Construir request para Siigo desde los datos de la factura
     */
    private Map<String, Object> construirRequestSiigo(Map<String, Object> facturaData) {
        Map<String, Object> request = new HashMap<>();
        
        // Tipo de documento (FV = Factura de Venta)
        Map<String, Object> documentType = new HashMap<>();
        documentType.put("id", "FV");
        request.put("document", documentType);
        
        // Fecha
        request.put("date", new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date()));
        
        // Cliente
        Map<String, Object> clienteData = (Map<String, Object>) facturaData.get("cliente");
        if (clienteData != null) {
            Map<String, Object> customer = new HashMap<>();
            
            // Identificación
            Map<String, Object> identification = new HashMap<>();
            identification.put("type", mapearTipoDocumento((String) clienteData.get("tipoDocumento")));
            identification.put("number", clienteData.get("numeroDocumento"));
            customer.put("identification", identification);
            
            // Información básica
            List<String> nombreParts = splitNombreCompleto((String) clienteData.get("nombreCompleto"));
            customer.put("first_name", nombreParts.get(0));
            customer.put("last_name", nombreParts.get(1));
            
            // Contacto
            List<Map<String, Object>> contacts = new ArrayList<>();
            Map<String, Object> contact = new HashMap<>();
            contact.put("first_name", nombreParts.get(0));
            contact.put("last_name", nombreParts.get(1));
            contact.put("email", clienteData.getOrDefault("email", ""));
            
            Map<String, Object> phone = new HashMap<>();
            phone.put("number", clienteData.getOrDefault("telefono", ""));
            contact.put("phone", phone);
            contacts.add(contact);
            customer.put("contacts", contacts);
            
            // Dirección
            Map<String, Object> address = new HashMap<>();
            address.put("address", clienteData.getOrDefault("direccion", ""));
            Map<String, Object> city = new HashMap<>();
            city.put("name", clienteData.getOrDefault("ciudad", "Bogotá"));
            address.put("city", city);
            customer.put("address", address);
            
            request.put("customer", customer);
        }
        
        // Items/Servicios
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) facturaData.get("items");
        if (itemsData != null) {
            List<Map<String, Object>> items = itemsData.stream().map(item -> {
                Map<String, Object> siigoItem = new HashMap<>();
                
                // Producto
                Map<String, Object> product = new HashMap<>();
                product.put("code", "SERV-SALUD"); // Código genérico
                siigoItem.put("code", product);
                
                siigoItem.put("description", item.get("descripcion"));
                siigoItem.put("quantity", item.get("cantidad"));
                siigoItem.put("price", item.get("valorUnitario"));
                
                // IVA 19%
                List<Map<String, Object>> taxes = new ArrayList<>();
                Map<String, Object> tax = new HashMap<>();
                tax.put("id", 13156); // ID del IVA 19% en Siigo
                taxes.add(tax);
                siigoItem.put("taxes", taxes);
                
                return siigoItem;
            }).collect(Collectors.toList());
            request.put("items", items);
        }
        
        // Método de pago
        List<Map<String, Object>> payments = new ArrayList<>();
        Map<String, Object> payment = new HashMap<>();
        Map<String, Object> paymentType = new HashMap<>();
        paymentType.put("id", obtenerIdFormaPagoSiigo((String) facturaData.get("formaPago")));
        payment.put("id", paymentType);
        payment.put("value", calcularTotalFactura(itemsData));
        payments.add(payment);
        request.put("payments", payments);
        
        // Observaciones
        if (facturaData.containsKey("observaciones")) {
            request.put("observations", facturaData.get("observaciones"));
        }
        
        return request;
    }
    
    /**
     * Dividir nombre completo en nombre y apellido
     */
    private List<String> splitNombreCompleto(String nombreCompleto) {
        if (nombreCompleto == null || nombreCompleto.trim().isEmpty()) {
            return Arrays.asList("Cliente", "General");
        }
        String[] parts = nombreCompleto.trim().split("\\s+", 2);
        if (parts.length == 1) {
            return Arrays.asList(parts[0], ".");
        }
        return Arrays.asList(parts[0], parts[1]);
    }
    
    /**
     * Calcular total de factura
     */
    private double calcularTotalFactura(List<Map<String, Object>> items) {
        if (items == null) return 0.0;
        return items.stream()
            .mapToDouble(item -> {
                Number cantidad = (Number) item.get("cantidad");
                Number valor = (Number) item.get("valorUnitario");
                return cantidad.doubleValue() * valor.doubleValue() * 1.19; // Con IVA
            })
            .sum();
    }
    
    /**
     * Obtener ID de forma de pago en Siigo
     */
    private int obtenerIdFormaPagoSiigo(String formaPago) {
        if (formaPago == null) return 10001; // Efectivo
        return switch(formaPago.toUpperCase()) {
            case "EFECTIVO" -> 10001;
            case "TARJETA_CREDITO", "TARJETA CREDITO" -> 10003;
            case "TARJETA_DEBITO", "TARJETA DEBITO" -> 10004;
            case "TRANSFERENCIA", "TRANSFERENCIA BANCARIA" -> 10002;
            case "CHEQUE" -> 10005;
            default -> 10001;
        };
    }
    
    /**
     * Mapear tipo de documento Colombia a códigos Siigo
     */
    private String mapearTipoDocumento(String tipoDocumento) {
        if (tipoDocumento == null) return "13";
        return switch(tipoDocumento.toUpperCase()) {
            case "CC", "CEDULA", "CEDULA DE CIUDADANIA" -> "13"; // Cédula de ciudadanía
            case "CE", "CEDULA EXTRANJERIA" -> "22"; // Cédula de extranjería
            case "TI", "TARJETA IDENTIDAD" -> "12"; // Tarjeta de identidad
            case "NIT" -> "31"; // NIT
            case "PA", "PASAPORTE" -> "41"; // Pasaporte
            case "RC", "REGISTRO CIVIL" -> "11"; // Registro civil
            default -> "13"; // Por defecto CC
        };
    }
}
