/**
 * dianXmlGenerator.js
 * 
 * Generador de XML en formato UBL 2.1 para facturación electrónica DIAN
 * Cumple con: Resolución 000042 de 2020 - Anexo Técnico
 */

import { getDianConfig } from './dianService';

/**
 * Generar XML UBL 2.1 completo para factura electrónica
 * @param {Object} facturaData - Datos de la factura
 * @returns {Promise<string>} XML en formato UBL 2.1
 */
export const generarFacturaXML = async (facturaData) => {
  const config = await getDianConfig();
  const { credentials } = config;
  
  const fecha = new Date(facturaData.fechaEmision);
  const fechaEmision = fecha.toISOString().split('T')[0];
  const horaEmision = fecha.toISOString().split('T')[1].split('.')[0];
  
  // Generar CUFE (Código Único de Factura Electrónica)
  const cufe = await generarCUFE(facturaData, credentials);
  
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" 
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#" 
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2" 
         xmlns:sts="dian:gov:co:facturaelectronica:Structures-2-1" 
         xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" 
         xmlns:xades141="http://uri.etsi.org/01903/v1.4.1#" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
         xsi:schemaLocation="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2 http://docs.oasis-open.org/ubl/os-UBL-2.1/xsd/maindoc/UBL-Invoice-2.1.xsd">
  
  <!-- EXTENSIONES UBL -->
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <sts:DianExtensions>
          <sts:InvoiceControl>
            <sts:InvoiceAuthorization>${credentials.resolucionFacturacion?.numero || '18760000001'}</sts:InvoiceAuthorization>
            <sts:AuthorizationPeriod>
              <cbc:StartDate>${credentials.resolucionFacturacion?.fechaInicio || '2019-01-19'}</cbc:StartDate>
              <cbc:EndDate>${credentials.resolucionFacturacion?.fechaFin || '2030-01-19'}</cbc:EndDate>
            </sts:AuthorizationPeriod>
            <sts:AuthorizedInvoices>
              <sts:Prefix>${credentials.resolucionFacturacion?.prefijo || 'SETP'}</sts:Prefix>
              <sts:From>${credentials.resolucionFacturacion?.rangoDesde || '990000000'}</sts:From>
              <sts:To>${credentials.resolucionFacturacion?.rangoHasta || '995000000'}</sts:To>
            </sts:AuthorizedInvoices>
          </sts:InvoiceControl>
          <sts:InvoiceSource>
            <cbc:IdentificationCode listAgencyID="6" listAgencyName="United Nations Economic Commission for Europe" listSchemeURI="urn:oasis:names:specification:ubl:codelist:gc:CountryIdentificationCode-2.1">CO</cbc:IdentificationCode>
          </sts:InvoiceSource>
          <sts:SoftwareProvider>
            <sts:ProviderID schemeAgencyID="195" schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)" schemeID="${credentials.nitDV || '1'}" schemeName="31">${credentials.nit}</sts:ProviderID>
            <sts:SoftwareID schemeAgencyID="195" schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)">${credentials.softwareID}</sts:SoftwareID>
          </sts:SoftwareProvider>
          <sts:SoftwareSecurityCode schemeAgencyID="195" schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)">${credentials.softwareSecurityCode}</sts:SoftwareSecurityCode>
        </sts:DianExtensions>
      </ext:ExtensionContent>
    </ext:UBLExtension>
    
    <!-- Espacio para firma digital -->
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- La firma se agrega después con xmlsec o similar -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  
  <!-- CUFE - Código Único de Factura Electrónica -->
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1</cbc:ProfileID>
  <cbc:ProfileExecutionID>1</cbc:ProfileExecutionID>
  <cbc:ID>${facturaData.numeroFactura}</cbc:ID>
  <cbc:UUID schemeID="1" schemeName="CUFE-SHA384">${cufe}</cbc:UUID>
  <cbc:IssueDate>${fechaEmision}</cbc:IssueDate>
  <cbc:IssueTime>${horaEmision}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:Note>${facturaData.observaciones || 'Factura de Venta'}</cbc:Note>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${facturaData.items.length}</cbc:LineCountNumeric>
  
  <!-- PROVEEDOR (IPS) -->
  <cac:AccountingSupplierParty>
    <cbc:AdditionalAccountID>1</cbc:AdditionalAccountID>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${credentials.razonSocial}</cbc:Name>
      </cac:PartyName>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:ID>${facturaData.emisor?.codigoMunicipio || '11001'}</cbc:ID>
          <cbc:CityName>${facturaData.emisor?.ciudad || 'Bogotá'}</cbc:CityName>
          <cbc:PostalZone>${facturaData.emisor?.codigoPostal || '110111'}</cbc:PostalZone>
          <cbc:CountrySubentity>${facturaData.emisor?.departamento || 'Bogotá'}</cbc:CountrySubentity>
          <cbc:CountrySubentityCode>${facturaData.emisor?.codigoDepartamento || '11'}</cbc:CountrySubentityCode>
          <cac:AddressLine>
            <cbc:Line>${facturaData.emisor?.direccion || 'Calle 1 # 1-1'}</cbc:Line>
          </cac:AddressLine>
          <cac:Country>
            <cbc:IdentificationCode>CO</cbc:IdentificationCode>
            <cbc:Name languageID="es">Colombia</cbc:Name>
          </cac:Country>
        </cac:Address>
      </cac:PhysicalLocation>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${credentials.razonSocial}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)" schemeID="${credentials.nitDV || '1'}" schemeName="31">${credentials.nit}</cbc:CompanyID>
        <cbc:TaxLevelCode listName="48">O-47</cbc:TaxLevelCode>
        <cac:RegistrationAddress>
          <cbc:ID>${facturaData.emisor?.codigoMunicipio || '11001'}</cbc:ID>
          <cbc:CityName>${facturaData.emisor?.ciudad || 'Bogotá'}</cbc:CityName>
          <cbc:CountrySubentity>${facturaData.emisor?.departamento || 'Bogotá'}</cbc:CountrySubentity>
          <cbc:CountrySubentityCode>${facturaData.emisor?.codigoDepartamento || '11'}</cbc:CountrySubentityCode>
          <cac:AddressLine>
            <cbc:Line>${facturaData.emisor?.direccion || 'Calle 1 # 1-1'}</cbc:Line>
          </cac:AddressLine>
          <cac:Country>
            <cbc:IdentificationCode>CO</cbc:IdentificationCode>
            <cbc:Name languageID="es">Colombia</cbc:Name>
          </cac:Country>
        </cac:RegistrationAddress>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${credentials.razonSocial}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)" schemeID="${credentials.nitDV || '1'}" schemeName="31">${credentials.nit}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:Telephone>${facturaData.emisor?.telefono || '3001234567'}</cbc:Telephone>
        <cbc:ElectronicMail>${facturaData.emisor?.email || 'contacto@ips.com'}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <!-- CLIENTE -->
  <cac:AccountingCustomerParty>
    <cbc:AdditionalAccountID>${facturaData.cliente.tipoPersona === 'JURIDICA' ? '1' : '2'}</cbc:AdditionalAccountID>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${facturaData.cliente.razonSocial || (facturaData.cliente.nombres + ' ' + facturaData.cliente.apellidos)}</cbc:Name>
      </cac:PartyName>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:ID>${facturaData.cliente.codigoMunicipio || '11001'}</cbc:ID>
          <cbc:CityName>${facturaData.cliente.ciudad || 'Bogotá'}</cbc:CityName>
          <cbc:CountrySubentity>${facturaData.cliente.departamento || 'Bogotá'}</cbc:CountrySubentity>
          <cbc:CountrySubentityCode>${facturaData.cliente.codigoDepartamento || '11'}</cbc:CountrySubentityCode>
          <cac:AddressLine>
            <cbc:Line>${facturaData.cliente.direccion || 'Calle 1 # 1-1'}</cbc:Line>
          </cac:AddressLine>
          <cac:Country>
            <cbc:IdentificationCode>CO</cbc:IdentificationCode>
            <cbc:Name languageID="es">Colombia</cbc:Name>
          </cac:Country>
        </cac:Address>
      </cac:PhysicalLocation>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${facturaData.cliente.razonSocial || (facturaData.cliente.nombres + ' ' + facturaData.cliente.apellidos)}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)" schemeID="${facturaData.cliente.digitoVerificacion || '0'}" schemeName="${getTipoDocumentoCodigo(facturaData.cliente.tipoDocumento)}">${facturaData.cliente.numeroDocumento}</cbc:CompanyID>
        <cbc:TaxLevelCode listName="48">O-47</cbc:TaxLevelCode>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${facturaData.cliente.razonSocial || (facturaData.cliente.nombres + ' ' + facturaData.cliente.apellidos)}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeAgencyName="CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)" schemeID="${facturaData.cliente.digitoVerificacion || '0'}" schemeName="${getTipoDocumentoCodigo(facturaData.cliente.tipoDocumento)}">${facturaData.cliente.numeroDocumento}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:Telephone>${facturaData.cliente.telefono || ''}</cbc:Telephone>
        <cbc:ElectronicMail>${facturaData.cliente.email || ''}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <!-- MEDIO DE PAGO -->
  <cac:PaymentMeans>
    <cbc:ID>1</cbc:ID>
    <cbc:PaymentMeansCode>${facturaData.medioPago || '10'}</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>${facturaData.fechaVencimiento || fechaEmision}</cbc:PaymentDueDate>
  </cac:PaymentMeans>
  
  <!-- TOTALES IMPUESTOS -->
  ${generarTotalImpuestosXML(facturaData)}
  
  <!-- TOTALES LEGALES -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">${facturaData.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="COP">${facturaData.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="COP">${(facturaData.subtotal + facturaData.iva).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="COP">${facturaData.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
  <!-- LÍNEAS DE FACTURA (ÍTEMS) -->
${facturaData.items.map((item, index) => generarLineaItemXML(item, index + 1, facturaData)).join('\n')}
  
</Invoice>`;
  
  return xml;
};

/**
 * Generar CUFE (Código Único de Factura Electrónica)
 * SHA-384 de: NumFac + FecFac + HorFac + ValFac + CodImp1 + ValImp1 + ... + NitOFE + NumAdq + Software-PIN + TipoAmbiente
 */
const generarCUFE = async (facturaData, credentials) => {
  const fecha = new Date(facturaData.fechaEmision);
  const fechaStr = fecha.toISOString().split('T')[0];
  const horaStr = fecha.toISOString().split('T')[1].split('.')[0];
  
  const dataCUFE = [
    facturaData.numeroFactura,
    fechaStr,
    horaStr,
    facturaData.total.toFixed(2),
    '01', // Código impuesto IVA
    facturaData.iva.toFixed(2),
    '02', // Código impuesto consumo
    '0.00',
    '03', // Código impuesto ICA
    '0.00',
    credentials.nit,
    facturaData.cliente.numeroDocumento,
    credentials.softwareSecurityCode,
    credentials.testMode ? '2' : '1' // 1=producción, 2=habilitación
  ].join('');
  
  // Usar Web Crypto API (compatible con navegadores en contexto seguro)
  // Verificar si crypto.subtle está disponible
  if (window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(dataCUFE);
      const hashBuffer = await window.crypto.subtle.digest('SHA-384', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.error('Error generando CUFE con Web Crypto API:', error);
    }
  }
  
  // Fallback: generar CUFE simple para desarrollo (NO USAR EN PRODUCCIÓN)
  // IMPORTANTE: Este CUFE NO ES VÁLIDO para enviar a DIAN real
  // Solo para desarrollo en entornos sin HTTPS
  const simpleHash = btoa(unescape(encodeURIComponent(dataCUFE)))
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 96)
    .padEnd(96, '0');
  
  console.warn('⚠️ USANDO CUFE DE DESARROLLO (no válido para DIAN real)');
  console.warn('📌 Para producción, debe ejecutarse en HTTPS o localhost');
  
  return simpleHash;
};

/**
 * Generar XML de totales de impuestos
 */
const generarTotalImpuestosXML = (facturaData) => {
  if (facturaData.iva === 0) return '';
  
  return `  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="COP">${facturaData.iva.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="COP">${facturaData.subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="COP">${facturaData.iva.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>${facturaData.ivaPercent || 19}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>`;
};

/**
 * Generar XML de una línea de ítem
 */
const generarLineaItemXML = (item, lineNumber, facturaData) => {
  const valorLinea = (item.cantidad * item.valorUnitario).toFixed(2);
  const ivaItem = item.iva || 0;
  
  return `  <cac:InvoiceLine>
    <cbc:ID>${lineNumber}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${item.unidadMedida || 'EA'}">${item.cantidad}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${valorLinea}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${item.descripcion}</cbc:Description>
      ${item.codigoCUPS ? `<cac:StandardItemIdentification>
        <cbc:ID schemeID="999" schemeName="CUPS">${item.codigoCUPS}</cbc:ID>
      </cac:StandardItemIdentification>` : ''}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${item.valorUnitario.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
    ${ivaItem > 0 ? `<cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">${ivaItem.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${valorLinea}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">${ivaItem.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${item.ivaPercent || facturaData.ivaPercent || 19}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>01</cbc:ID>
            <cbc:Name>IVA</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>` : ''}
  </cac:InvoiceLine>`;
};

/**
 * Obtener código de tipo de documento según DIAN
 */
const getTipoDocumentoCodigo = (tipoDocumento) => {
  const codigos = {
    'NIT': '31',
    'CC': '13',
    'CE': '22',
    'TI': '11',
    'PASAPORTE': '41',
    'DIE': '91',
    'NUIP': '12'
  };
  return codigos[tipoDocumento] || '13';
};

export default {
  generarFacturaXML
};
