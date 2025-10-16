/**
 * Entidad de dominio para Paciente
 * Representa un paciente en el sistema de salud
 */
export class Paciente {
  constructor({
    id,
    numeroDocumento,
    tipoDocumento,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    fechaNacimiento,
    genero,
    estadoCivil,
    informacionPersonal,
    informacionContacto,
    informacionMedica,
    fechaCreacion,
    fechaActualizacion
  }) {
    this.id = id;
    this.numeroDocumento = numeroDocumento;
    this.tipoDocumento = tipoDocumento;
    this.primerNombre = primerNombre;
    this.segundoNombre = segundoNombre;
    this.primerApellido = primerApellido;
    this.segundoApellido = segundoApellido;
    this.fechaNacimiento = fechaNacimiento;
    this.genero = genero;
    this.estadoCivil = estadoCivil;
    this.informacionPersonal = informacionPersonal;
    this.informacionContacto = informacionContacto;
    this.informacionMedica = informacionMedica;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Obtiene el nombre completo del paciente
   */
  getNombreCompleto() {
    return `${this.primerNombre || ''} ${this.segundoNombre || ''} ${this.primerApellido || ''} ${this.segundoApellido || ''}`.trim();
  }

  /**
   * Obtiene la edad del paciente
   */
  getEdad() {
    if (!this.fechaNacimiento) return null;

    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  /**
   * Valida si el paciente tiene información completa
   */
  esInformacionCompleta() {
    return !!(
      this.numeroDocumento &&
      this.primerNombre &&
      this.primerApellido &&
      this.fechaNacimiento &&
      this.genero
    );
  }
}

/**
 * Value Object para Información Personal
 */
export class InformacionPersonal {
  constructor({
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    fechaNacimiento,
    genero,
    estadoCivil,
    ocupacion,
    nivelEducativo
  }) {
    this.primerNombre = primerNombre;
    this.segundoNombre = segundoNombre;
    this.primerApellido = primerApellido;
    this.segundoApellido = segundoApellido;
    this.fechaNacimiento = fechaNacimiento;
    this.genero = genero;
    this.estadoCivil = estadoCivil;
    this.ocupacion = ocupacion;
    this.nivelEducativo = nivelEducativo;
  }
}

/**
 * Value Object para Información de Contacto
 */
export class InformacionContacto {
  constructor({
    telefono,
    celular,
    email,
    direccion,
    ciudad,
    departamento,
    pais,
    codigoPostal
  }) {
    this.telefono = telefono;
    this.celular = celular;
    this.email = email;
    this.direccion = direccion;
    this.ciudad = ciudad;
    this.departamento = departamento;
    this.pais = pais;
    this.codigoPostal = codigoPostal;
  }
}

/**
 * Value Object para Información Médica
 */
export class InformacionMedica {
  constructor({
    tipoSangre,
    alergias,
    medicamentosActuales,
    enfermedadesCronicas,
    antecedentesFamiliares,
    seguroMedico,
    eps
  }) {
    this.tipoSangre = tipoSangre;
    this.alergias = alergias;
    this.medicamentosActuales = medicamentosActuales;
    this.enfermedadesCronicas = enfermedadesCronicas;
    this.antecedentesFamiliares = antecedentesFamiliares;
    this.seguroMedico = seguroMedico;
    this.eps = eps;
  }
}