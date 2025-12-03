package com.gestioneps.administrative.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/dian")
@CrossOrigin(origins = "*")
public class DianController {

    private static final Logger log = LoggerFactory.getLogger(DianController.class);
    private final RestTemplate restTemplate;

    @Value("${dian.habilitacion.url:https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc}")
    private String urlHabilitacion;

    @Value("${dian.produccion.url:https://vpfe.dian.gov.co/WcfDianCustomerServices.svc}")
    private String urlProduccion;

    public DianController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Proxy para enviar factura a la DIAN evitando problemas CORS
     */
    @PostMapping("/enviar-factura")
    public ResponseEntity<String> enviarFactura(
            @RequestParam(defaultValue = "habilitacion") String ambiente,
            @RequestBody String soapRequest) {
        
        try {
            // Seleccionar URL según ambiente
            String url = "habilitacion".equals(ambiente) ? urlHabilitacion : urlProduccion;
            log.info("Enviando factura a DIAN - Ambiente: {}, URL: {}", ambiente, url);
            
            // Configurar headers SOAP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_XML);
            headers.set("SOAPAction", "http://wcf.dian.colombia/IWcfDianCustomerServices/SendBillSync");
            
            HttpEntity<String> entity = new HttpEntity<>(soapRequest, headers);
            
            // Realizar la petición a la DIAN
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            log.info("Respuesta exitosa de DIAN");
            return ResponseEntity.ok(response.getBody());
            
        } catch (Exception e) {
            log.error("Error enviando factura a DIAN: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error comunicando con DIAN: " + e.getMessage());
        }
    }

    /**
     * Proxy para consultar estado de factura en la DIAN
     */
    @PostMapping("/consultar-estado")
    public ResponseEntity<String> consultarEstado(
            @RequestParam(defaultValue = "habilitacion") String ambiente,
            @RequestBody String soapRequest) {
        
        try {
            String url = "habilitacion".equals(ambiente) ? urlHabilitacion : urlProduccion;
            log.info("Consultando estado en DIAN - Ambiente: {}, URL: {}", ambiente, url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_XML);
            headers.set("SOAPAction", "http://wcf.dian.colombia/IWcfDianCustomerServices/GetStatus");
            
            HttpEntity<String> entity = new HttpEntity<>(soapRequest, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            log.info("Respuesta exitosa de DIAN");
            return ResponseEntity.ok(response.getBody());
            
        } catch (Exception e) {
            log.error("Error consultando estado en DIAN: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error comunicando con DIAN: " + e.getMessage());
        }
    }
}
