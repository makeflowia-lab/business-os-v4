/**
 * SaaS Legal Shield v2.0 - Motor de Blindaje Contractual
 * Repositorio de Documentos Base y Lógica Condicional (México 2026)
 * 
 * Fundamento legal: LFPDPPP, Código de Comercio, Ley Federal de Derecho de Autor,
 * Código Civil Federal, NOM-151-SCFI-2002
 */

export interface LegalTemplate {
  id: string;
  name: string;
  content: string;
  condition?: (data: any) => boolean;
}

export const SAAS_CONTRACT_TEMPLATES: LegalTemplate[] = [
  {
    id: 'DOC_01_MSSA',
    name: 'Contrato Maestro de Servicios SaaS (MSSA)',
    content: `CONTRATO MAESTRO DE PRESTACIÓN DE SERVICIOS SaaS
====================================================

Que celebran, por una parte, {{PROVEEDOR_RAZON_SOCIAL}}, sociedad mercantil constituida conforme a las leyes de {{JURISDICCION}}, con Registro Federal de Contribuyentes {{PROVEEDOR_RFC}}, con domicilio fiscal en {{PROVEEDOR_DOMICILIO}}, representada en este acto por {{PROVEEDOR_REP}} (en lo sucesivo, el "PROVEEDOR"); y por la otra, {{CLIENTE_RAZON_SOCIAL}}, con RFC {{CLIENTE_RFC}}, con domicilio en {{CLIENTE_DOMICILIO}}, representada por {{CLIENTE_REP}} (en lo sucesivo, el "CLIENTE").

### DECLARACIONES

I. El PROVEEDOR declara que:
a) Es una sociedad legalmente constituida conforme a las leyes de {{JURISDICCION}}.
b) Cuenta con la capacidad técnica, humana y financiera para prestar los servicios objeto de este contrato.
c) Su representante legal tiene facultades suficientes para obligar a su representada.
d) Es titular de los derechos de propiedad intelectual sobre la plataforma "{{PRODUCTO_NOMBRE}}".

II. El CLIENTE declara que:
a) Está legalmente constituido y tiene capacidad jurídica para celebrar el presente contrato.
b) Requiere los servicios de software bajo la modalidad SaaS para sus operaciones de {{INDUSTRIA}}.
c) Su representante legal cuenta con las facultades necesarias para obligarle.

### CLÁUSULA PRIMERA — OBJETO DEL CONTRATO

El PROVEEDOR se obliga a otorgar al CLIENTE acceso y uso de la plataforma tecnológica "{{PRODUCTO_NOMBRE}}" bajo la modalidad de Software as a Service (SaaS), que incluye: (a) acceso vía navegador web y/o aplicación móvil; (b) almacenamiento en la nube de los datos generados; (c) actualizaciones y mejoras del sistema; (d) soporte técnico conforme al Anexo de SLA, si aplica.

### CLÁUSULA SEGUNDA — VIGENCIA

El presente contrato tendrá una vigencia inicial de doce (12) meses contados a partir de la fecha de firma, renovable automáticamente por periodos iguales, salvo que cualquiera de las partes notifique por escrito su voluntad de no renovar con al menos treinta (30) días naturales de anticipación al vencimiento del periodo vigente.

### CLÁUSULA TERCERA — CONTRAPRESTACIÓN Y FORMA DE PAGO

3.1. El CLIENTE pagará al PROVEEDOR la cantidad acordada en la Carátula Comercial, más el Impuesto al Valor Agregado correspondiente.
3.2. Los pagos se realizarán de forma {{MODELO_NEGOCIO}} mediante transferencia bancaria o el medio acordado.
3.3. El PROVEEDOR emitirá los CFDI correspondientes conforme a las disposiciones fiscales vigentes.
3.4. Los pagos no realizados dentro de los quince (15) días posteriores a su vencimiento generarán intereses moratorios a la tasa TIIE más 6 puntos porcentuales anuales.
3.5. El PROVEEDOR se reserva el derecho de suspender el servicio tras treinta (30) días naturales de mora en el pago.

### CLÁUSULA CUARTA — OBLIGACIONES DEL PROVEEDOR

El PROVEEDOR se obliga a:
a) Mantener la plataforma disponible conforme a los niveles de servicio acordados.
b) Implementar y mantener medidas de seguridad adecuadas para la protección de los datos del CLIENTE.
c) Notificar al CLIENTE de cualquier vulneración de seguridad que afecte sus datos en un plazo no mayor a setenta y dos (72) horas.
d) Realizar respaldos automatizados de la información del CLIENTE con frecuencia mínima diaria.
e) Proporcionar soporte técnico en horario hábil (Lunes a Viernes, 9:00 - 18:00 hrs, hora centro de México).
f) No acceder a los datos del CLIENTE salvo para la prestación del servicio o por requerimiento legal.

### CLÁUSULA QUINTA — OBLIGACIONES DEL CLIENTE

El CLIENTE se obliga a:
a) Pagar puntualmente la contraprestación acordada.
b) Utilizar la plataforma conforme a los términos de uso y la legislación aplicable.
c) No intentar realizar ingeniería inversa, descompilar o desensamblar el software.
d) Mantener la confidencialidad de sus credenciales de acceso.
e) Notificar inmediatamente al PROVEEDOR cualquier uso no autorizado de su cuenta.
f) No sublicenciar, ceder o transferir los derechos de uso sin consentimiento previo y por escrito del PROVEEDOR.

### CLÁUSULA SEXTA — PROPIEDAD DE LOS DATOS

6.1. Los datos que el CLIENTE ingrese, genere o almacene en la plataforma son y seguirán siendo propiedad exclusiva del CLIENTE.
6.2. El PROVEEDOR únicamente actuará como encargado del tratamiento de dichos datos conforme a la LFPDPPP.
6.3. El PROVEEDOR no utilizará los datos del CLIENTE para fines distintos a la prestación del servicio contratado, salvo datos anonimizados y agregados para mejora del servicio.

### CLÁUSULA SÉPTIMA — MODIFICACIONES AL SERVICIO

7.1. El PROVEEDOR podrá realizar actualizaciones y mejoras a la plataforma sin previo aviso, siempre que no afecten materialmente la funcionalidad contratada.
7.2. Cualquier modificación sustancial será notificada al CLIENTE con al menos quince (15) días de anticipación.
7.3. Si la modificación afecta negativamente al CLIENTE, este tendrá derecho a terminar el contrato sin penalización dentro de los treinta (30) días siguientes a la notificación.

### CLÁUSULA OCTAVA — FUERZA MAYOR Y CASO FORTUITO

Ninguna de las partes será responsable por el incumplimiento de sus obligaciones cuando dicho incumplimiento sea resultado de eventos de fuerza mayor o caso fortuito, incluyendo sin limitación: desastres naturales, pandemias, actos de guerra, huelgas generales, fallas masivas de infraestructura de internet, o actos de autoridad gubernamental. La parte afectada deberá notificar a la otra en un plazo máximo de cinco (5) días hábiles.

### CLÁUSULA NOVENA — INDEMNIZACIÓN

9.1. El PROVEEDOR indemnizará al CLIENTE por cualquier reclamación de terceros derivada de infracciones a propiedad intelectual del software proporcionado.
9.2. El CLIENTE indemnizará al PROVEEDOR por cualquier reclamación derivada del uso indebido de la plataforma o del contenido que el CLIENTE introduzca en ella.

### CLÁUSULA DÉCIMA — ANTICORRUPCIÓN

Las partes declaran que actuarán en todo momento conforme a la Ley General de Responsabilidades Administrativas y las leyes anticorrupción aplicables. Ninguna de las partes ofrecerá, pagará o autorizará pagos indebidos a funcionarios públicos o terceros en relación con este contrato.

### CLÁUSULA DÉCIMA PRIMERA — SUBCONTRATACIÓN

El PROVEEDOR podrá subcontratar servicios auxiliares (hosting, CDN, procesamiento de pagos) siempre que: (a) garantice que los sub-procesadores cumplan con estándares de seguridad equivalentes; (b) mantenga una lista actualizada de sub-procesadores disponible para el CLIENTE; (c) asuma la responsabilidad por las acciones de sus sub-procesadores.

### CLÁUSULA DÉCIMA SEGUNDA — NOTIFICACIONES

Toda notificación entre las partes deberá realizarse por escrito a los domicilios y correos electrónicos señalados en el encabezado del presente contrato. Las notificaciones por correo electrónico tendrán validez legal conforme al Art. 89 del Código de Comercio.`,
  },
  {
    id: 'DOC_02_PRIVACY',
    name: 'Aviso de Privacidad Integral (LFPDPPP)',
    content: `AVISO DE PRIVACIDAD INTEGRAL
============================
(Conforme a los Artículos 15, 16 y 17 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares — LFPDPPP)

### I. IDENTIDAD Y DOMICILIO DEL RESPONSABLE

{{PROVEEDOR_RAZON_SOCIAL}}, con RFC {{PROVEEDOR_RFC}} y domicilio en {{PROVEEDOR_DOMICILIO}} (en adelante, el "Responsable"), es responsable del tratamiento de los datos personales que usted nos proporcione, los cuales serán protegidos conforme a lo dispuesto por la LFPDPPP, su Reglamento y los Lineamientos del Aviso de Privacidad.

### II. DATOS PERSONALES QUE SE RECABAN

Para las finalidades señaladas en el presente aviso, podemos recabar las siguientes categorías de datos personales:

a) **Datos de identificación:** nombre completo, RFC, CURP, razón social, domicilio fiscal.
b) **Datos de contacto:** correo electrónico, número telefónico, domicilio de contacto.
c) **Datos financieros:** datos bancarios para facturación y cobranza del servicio.
d) **Datos de uso:** registros de acceso, actividad en la plataforma "{{PRODUCTO_NOMBRE}}", dirección IP, tipo de navegador.
e) **Datos que el usuario ingrese en la plataforma:** {{DATOS_DESC}}.

### III. FINALIDADES DEL TRATAMIENTO

**Finalidades primarias (necesarias para la relación jurídica):**
1. Prestación del servicio SaaS "{{PRODUCTO_NOMBRE}}".
2. Creación y administración de su cuenta de usuario.
3. Facturación, cobranza y gestión de pagos.
4. Soporte técnico y atención a solicitudes.
5. Cumplimiento de obligaciones legales y fiscales.
6. Seguridad y prevención de fraude.

**Finalidades secundarias (no necesarias pero legítimas):**
7. Envío de comunicaciones sobre actualizaciones del servicio.
8. Elaboración de estadísticas y análisis de uso (datos anonimizados).
9. Mejora de la experiencia del usuario y funcionalidad de la plataforma.

Si usted no desea que sus datos personales sean tratados para las finalidades secundarias, puede manifestarlo enviando un correo a {{PROVEEDOR_EMAIL}} con el asunto "Limitación de Finalidades Secundarias".

### IV. MECANISMOS PARA LIMITAR EL USO O DIVULGACIÓN

Usted puede limitar el uso o divulgación de sus datos personales mediante:
a) Solicitud escrita dirigida a {{PROVEEDOR_EMAIL}}.
b) Inscripción en el Registro Público para Evitar Publicidad (REPEP) de PROFECO.
c) Configuración de preferencias de privacidad dentro de la plataforma.

### V. TRANSFERENCIAS DE DATOS

Sus datos personales podrán ser transferidos a:
- **Proveedores de infraestructura cloud** para el almacenamiento y procesamiento del servicio.
- **Proveedores de servicios de pago** para la gestión de cobros y facturación.
- **Autoridades competentes** cuando sea requerido por ley, regulación o proceso judicial.

Estas transferencias no requieren su consentimiento conforme al Art. 37 de la LFPDPPP por ser necesarias para el cumplimiento del contrato.

### VI. DERECHOS ARCO

Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (ARCO) al tratamiento de sus datos personales, así como a revocar su consentimiento. Para ejercer estos derechos, envíe su solicitud a:

**Correo:** {{PROVEEDOR_EMAIL}}
**Asunto:** "Ejercicio de Derechos ARCO"

Su solicitud deberá contener: (i) nombre completo y domicilio; (ii) documento que acredite identidad (INE/IFE o pasaporte); (iii) descripción clara del derecho que desea ejercer; (iv) cualquier documento que facilite la localización de los datos.

**Plazo de respuesta:** Máximo 20 días hábiles.
**Plazo de ejecución:** 15 días hábiles posteriores a la comunicación de la respuesta.

### VII. REVOCACIÓN DEL CONSENTIMIENTO

Usted puede revocar su consentimiento para el tratamiento de datos en cualquier momento, enviando solicitud a {{PROVEEDOR_EMAIL}}. La revocación no tendrá efectos retroactivos.

### VIII. USO DE COOKIES Y TECNOLOGÍAS DE RASTREO

La plataforma utiliza cookies y tecnologías similares para: (a) mantener la sesión activa; (b) recordar preferencias; (c) análisis de uso. Usted puede desactivar las cookies no esenciales desde la configuración de su navegador.

### IX. CAMBIOS AL AVISO DE PRIVACIDAD

El Responsable se reserva el derecho de modificar el presente aviso. Cualquier cambio será notificado a través de: (a) correo electrónico registrado; (b) aviso visible dentro de la plataforma.

### X. AUTORIDAD COMPETENTE

Si usted considera que su derecho de protección de datos ha sido vulnerado, puede acudir al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI): www.inai.org.mx

**Fecha de última actualización:** {{FECHA_ACTUAL}}`,
    condition: (data) => data.personalData === true
  },
  {
    id: 'DOC_03_SENSIBLE_DATA',
    name: 'Cláusula de Datos Sensibles',
    content: `CLÁUSULA ESPECIAL: TRATAMIENTO DE DATOS PERSONALES SENSIBLES
=============================================================
(Conforme al Artículo 9 de la LFPDPPP)

### I. RECONOCIMIENTO DE DATOS SENSIBLES

Las partes reconocen que el Servicio implica el tratamiento de DATOS PERSONALES SENSIBLES, entendidos como aquellos que se refieren a: estado de salud, origen racial o étnico, creencias religiosas, opiniones políticas, preferencia sexual, datos biométricos, información genética, y datos financieros detallados.

### II. CONSENTIMIENTO EXPRESO Y POR ESCRITO

Conforme al Art. 9 de la LFPDPPP, el PROVEEDOR recabará el consentimiento EXPRESO Y POR ESCRITO del titular de los datos sensibles antes de iniciar cualquier tratamiento. Dicho consentimiento deberá:
a) Ser informado, especificando los datos sensibles a tratar y sus finalidades.
b) Ser libre, sin que medie error, dolo, violencia o mala fe.
c) Ser específico respecto a los datos sensibles en cuestión.
d) Ser documentado y conservado durante toda la vigencia del tratamiento más cinco (5) años.

### III. MEDIDAS DE SEGURIDAD REFORZADAS

El PROVEEDOR se obliga a implementar las siguientes medidas de seguridad para datos sensibles:
a) **Cifrado:** AES-256 para datos en reposo; TLS 1.3 para datos en tránsito.
b) **Control de acceso:** Autenticación multifactor (MFA) obligatoria para acceso a datos sensibles.
c) **Segregación:** Los datos sensibles se almacenarán en tablas/bases de datos segregadas con controles de acceso adicionales.
d) **Auditoría:** Logs de acceso inmutables con retención mínima de dos (2) años.
e) **Minimización:** Solo se recopilarán los datos sensibles estrictamente necesarios para la finalidad declarada.

### IV. EVALUACIÓN DE IMPACTO

El PROVEEDOR realizará una Evaluación de Impacto en Protección de Datos (EIPD) antes de iniciar el tratamiento de datos sensibles, y la actualizará anualmente o ante cambios significativos en el procesamiento.

### V. NOTIFICACIÓN DE VULNERACIONES

En caso de vulneración de seguridad que afecte datos sensibles, el PROVEEDOR deberá:
a) Notificar al CLIENTE dentro de las 24 horas siguientes al descubrimiento.
b) Notificar a los titulares afectados de forma inmediata.
c) Notificar al INAI conforme a las disposiciones aplicables.
d) Documentar el incidente, su impacto y las medidas correctivas adoptadas.`,
    condition: (data) => data.sensibleData === true
  },
  {
    id: 'DOC_04_IP_LICENSE',
    name: 'Licencia de Propiedad Intelectual',
    content: `LICENCIA DE PROPIEDAD INTELECTUAL Y USO DE SOFTWARE
=====================================================
(Conforme a la Ley Federal del Derecho de Autor — LFDA)

### I. OTORGAMIENTO DE LICENCIA

El PROVEEDOR otorga al CLIENTE una licencia de uso NO EXCLUSIVA, NO TRANSFERIBLE, REVOCABLE y LIMITADA para acceder y utilizar la plataforma "{{PRODUCTO_NOMBRE}}" bajo la modalidad Software as a Service (SaaS), sujeta a las siguientes condiciones:

a) **Territorio:** {{JURISDICCION}}.
b) **Duración:** Por la vigencia del contrato principal.
c) **Alcance:** Acceso y uso para las operaciones propias del CLIENTE en el sector de {{INDUSTRIA}}.
d) **Usuarios:** Limitado al número de licencias contratadas.

### II. PROPIEDAD INTELECTUAL DEL PROVEEDOR

2.1. La propiedad intelectual del código fuente, código objeto, algoritmos, bases de datos, interfaces gráficas, documentación técnica, nombre comercial y logotipos de "{{PRODUCTO_NOMBRE}}" son y permanecerán como propiedad EXCLUSIVA del PROVEEDOR.
2.2. El PROVEEDOR declara que la plataforma está registrada (o en proceso de registro) ante el Instituto Nacional del Derecho de Autor (Indautor) y/o ante las autoridades competentes de propiedad intelectual.
2.3. Nada en este contrato constituye cesión, transmisión o venta de derechos de propiedad intelectual.

### III. RESTRICCIONES DE USO

El CLIENTE se obliga a NO:
a) Copiar, modificar, adaptar o crear obras derivadas del software.
b) Realizar ingeniería inversa, descompilar o desensamblar el código.
c) Sublicenciar, alquilar, arrendar o prestar el acceso a terceros.
d) Remover o alterar avisos de propiedad intelectual, copyright o marcas.
e) Utilizar el software para desarrollar un producto competidor.
f) Acceder al software por medios automatizados no autorizados (scraping, bots).

### IV. PROPIEDAD INTELECTUAL DEL CLIENTE

4.1. El CLIENTE retiene todos los derechos de propiedad intelectual sobre los datos, contenido y materiales que ingrese en la plataforma.
4.2. El CLIENTE otorga al PROVEEDOR una licencia limitada y no exclusiva para alojar, procesar y mostrar dicho contenido exclusivamente en relación con la prestación del servicio.

### V. MARCAS Y NOMBRE COMERCIAL

Ninguna de las partes adquiere derechos sobre las marcas, nombres comerciales o logotipos de la otra parte por virtud de este contrato.

### VI. INFRACCIÓN DE TERCEROS

El PROVEEDOR defenderá al CLIENTE ante cualquier reclamación de terceros por infracción de propiedad intelectual del software, siempre que el CLIENTE notifique de inmediato y coopere en la defensa.`,
  },
  {
    id: 'DOC_05_SLA',
    name: 'Acuerdo de Niveles de Servicio (SLA)',
    content: `ANEXO TÉCNICO: ACUERDO DE NIVELES DE SERVICIO (SLA)
=====================================================

### I. MÉTRICAS DE DISPONIBILIDAD

1.1. **Uptime garantizado:** El PROVEEDOR garantiza una disponibilidad mensual del 99.9% del servicio "{{PRODUCTO_NOMBRE}}", excluyendo ventanas de mantenimiento programado.
1.2. **Cálculo:** Uptime = ((Total minutos del mes - Minutos de inactividad no programada) / Total minutos del mes) × 100.
1.3. **Ventanas de mantenimiento:** Máximo 4 horas mensuales, programadas en horario de menor impacto (domingos 2:00 - 6:00 AM hora centro de México), con notificación previa de 48 horas.

### II. TIEMPOS DE RESPUESTA A INCIDENTES

| Severidad | Descripción | Tiempo de Respuesta | Tiempo de Resolución |
|-----------|-------------|--------------------|--------------------|
| S1 - Crítica | Servicio completamente inoperante | 1 hora | 4 horas |
| S2 - Alta | Funcionalidad crítica degradada | 4 horas | 8 horas hábiles |
| S3 - Media | Funcionalidad no crítica afectada | 8 horas hábiles | 3 días hábiles |
| S4 - Baja | Consultas, mejoras menores | 24 horas hábiles | 10 días hábiles |

### III. CRÉDITOS POR INCUMPLIMIENTO

En caso de que el PROVEEDOR no cumpla con el uptime garantizado:
- **99.0% - 99.9%:** Crédito del 10% de la mensualidad.
- **95.0% - 99.0%:** Crédito del 25% de la mensualidad.
- **< 95.0%:** Crédito del 50% de la mensualidad, más derecho del CLIENTE a terminar el contrato sin penalización.

Los créditos se aplicarán en la facturación del mes siguiente y representan el único y exclusivo remedio del CLIENTE por incumplimiento de uptime.

### IV. SOPORTE TÉCNICO

4.1. **Canales:** Email (soporte@{{DOMINIO}}), chat dentro de la plataforma, y sistema de tickets.
4.2. **Horario:** Lunes a Viernes de 9:00 a 18:00 hrs (hora centro de México).
4.3. **Soporte crítico (S1):** Disponible 24/7 vía canal de emergencia.

### V. RESPALDOS Y RECUPERACIÓN

5.1. **Frecuencia de respaldos:** Diarios (incrementales), semanales (completos).
5.2. **Retención:** Mínimo 30 días de respaldos disponibles.
5.3. **RPO (Recovery Point Objective):** Máximo 24 horas de pérdida de datos.
5.4. **RTO (Recovery Time Objective):** Máximo 4 horas para restauración del servicio.

### VI. REPORTES

El PROVEEDOR entregará al CLIENTE un reporte mensual que incluya: (a) porcentaje de uptime real; (b) incidentes ocurridos y su resolución; (c) métricas de rendimiento.`,
    condition: (data) => data.hasSLA === true
  },
  {
    id: 'DOC_06_ELECTRONIC_BILLING',
    name: 'Anexo de Facturación Electrónica (CFDI 4.0)',
    content: `ANEXO: FACTURACIÓN ELECTRÓNICA Y OBLIGACIONES FISCALES
=======================================================
(Conforme al Código Fiscal de la Federación y Resolución Miscelánea Fiscal vigente)

### I. EMISIÓN DE COMPROBANTES FISCALES

1.1. El PROVEEDOR emitirá los Comprobantes Fiscales Digitales por Internet (CFDI versión 4.0) correspondientes a nombre de {{CLIENTE_RAZON_SOCIAL}} con RFC {{CLIENTE_RFC}}.
1.2. Los CFDI incluirán la clave de producto/servicio del SAT correspondiente a servicios de tecnología de la información (categoría 81112).
1.3. La emisión se realizará dentro de las 24 horas siguientes a la recepción del pago o conforme a las disposiciones fiscales vigentes.

### II. DATOS FISCALES REQUERIDOS

El CLIENTE proporcionará al PROVEEDOR los siguientes datos para la correcta emisión del CFDI:
a) Razón social exacta conforme a la Constancia de Situación Fiscal.
b) RFC a 12 o 13 posiciones.
c) Código postal del domicilio fiscal.
d) Régimen fiscal aplicable.
e) Uso del CFDI (generalmente G03 - Gastos en general).

### III. PLAZOS Y CONDICIONES DE PAGO

3.1. La facturación se realizará de forma {{MODELO_NEGOCIO}} (mensual, anual, por uso).
3.2. Los pagos deberán realizarse dentro de los primeros quince (15) días naturales de cada ciclo de facturación.
3.3. Forma de pago aceptada: transferencia electrónica de fondos (clave SAT 03).

### IV. CONSERVACIÓN DE COMPROBANTES

4.1. Ambas partes se obligan a conservar los XMLs de los CFDI emitidos por un plazo mínimo de cinco (5) años conforme al Art. 30 del CFF.
4.2. El PROVEEDOR mantendrá respaldos digitales de todos los comprobantes emitidos.

### V. CANCELACIÓN DE CFDI

La cancelación de CFDI se realizará conforme a las reglas vigentes del SAT, requiriendo en todos los casos la aceptación del receptor cuando el monto exceda $1,000.00 MXN.`,
    condition: (data) => data.hasElectronicBilling === true
  },
  {
    id: 'DOC_07_LIABILITY_LIMIT',
    name: 'Limitación de Responsabilidad',
    content: `CLÁUSULA DE LIMITACIÓN DE RESPONSABILIDAD
==========================================

### I. LÍMITE CUANTITATIVO

1.1. La responsabilidad total acumulada del PROVEEDOR derivada de o relacionada con este contrato, ya sea por incumplimiento contractual, responsabilidad extracontractual, negligencia o cualquier otra teoría legal, no excederá en ningún caso el monto total efectivamente pagado por el CLIENTE al PROVEEDOR durante los doce (12) meses inmediatamente anteriores al evento que origina la reclamación.

1.2. Si el contrato tiene vigencia menor a doce meses, el límite será el monto total pagado durante la vigencia del contrato.

### II. EXCLUSIONES DE RESPONSABILIDAD

EN NINGÚN CASO el PROVEEDOR será responsable por:
a) Daños indirectos, incidentales, especiales, consecuentes o punitivos.
b) Pérdida de beneficios, ingresos, ahorros anticipados o goodwill.
c) Pérdida o corrupción de datos del CLIENTE cuando esta derive de acciones u omisiones del propio CLIENTE.
d) Interrupción del negocio del CLIENTE.
e) Costos de obtención de bienes o servicios sustitutos.
f) Daños derivados de fuerza mayor, caso fortuito o actos de terceros fuera del control del PROVEEDOR.

### III. EXCEPCIONES A LA LIMITACIÓN

Las limitaciones anteriores NO aplicarán en caso de:
a) Dolo o negligencia grave del PROVEEDOR.
b) Violación de derechos de propiedad intelectual por parte del PROVEEDOR.
c) Incumplimiento de obligaciones de confidencialidad.
d) Daños derivados de una vulneración de datos personales atribuible al PROVEEDOR por falta de medidas de seguridad.

### IV. OBLIGACIÓN DE MITIGACIÓN

Ambas partes se comprometen a tomar las medidas razonables para mitigar cualquier daño o pérdida que pudiera derivar del incumplimiento de la otra parte.

### V. PLAZO PARA RECLAMACIONES

Cualquier reclamación derivada de este contrato deberá presentarse dentro de los doce (12) meses siguientes a la fecha en que el reclamante tuvo o debió tener conocimiento del evento que la origina. Transcurrido dicho plazo, la reclamación prescribirá.`,
  },
  {
    id: 'DOC_08_HIGH_CRITICALITY',
    name: 'Garantía de Continuidad de Negocio',
    content: `ANEXO: GARANTÍA DE CONTINUIDAD PARA SERVICIOS DE ALTA CRITICIDAD
================================================================

### I. RECONOCIMIENTO DE CRITICIDAD

Las partes reconocen que el servicio "{{PRODUCTO_NOMBRE}}" tiene un nivel de criticidad ALTO para las operaciones del CLIENTE, lo que implica que una interrupción prolongada podría causar daños significativos a sus operaciones de {{INDUSTRIA}}.

### II. PLAN DE RECUPERACIÓN ANTE DESASTRES (DRP)

El PROVEEDOR se obliga a mantener un Plan de Recuperación ante Desastres que incluya:
a) **RTO (Recovery Time Objective):** Máximo 4 horas para restauración del servicio.
b) **RPO (Recovery Point Objective):** Máximo 1 hora de pérdida de datos.
c) **Redundancia geográfica:** Los datos y servicios estarán replicados en al menos dos (2) zonas geográficas distintas.
d) **Pruebas de DRP:** Se realizarán pruebas de recuperación al menos dos (2) veces al año, con reportes disponibles para el CLIENTE.

### III. ESCROW DE CÓDIGO FUENTE

3.1. El PROVEEDOR depositará el código fuente de la plataforma ante un agente de escrow independiente.
3.2. El CLIENTE tendrá derecho a acceder al código fuente únicamente en caso de: (a) quiebra o liquidación del PROVEEDOR; (b) incumplimiento grave y reiterado del contrato; (c) cesación total de operaciones del PROVEEDOR.
3.3. El acceso al código fuente se limitará exclusivamente a la operación y mantenimiento del servicio, sin que implique cesión de propiedad intelectual.

### IV. PLAN DE TRANSICIÓN

En caso de terminación del contrato, el PROVEEDOR proporcionará un periodo de transición de noventa (90) días durante el cual:
a) El servicio continuará operando con normalidad.
b) El PROVEEDOR asistirá en la migración de datos al nuevo proveedor o sistema del CLIENTE.
c) Se entregarán todos los datos en formatos estándar y abiertos (CSV, JSON, SQL).

### V. AUDITORÍAS DE SEGURIDAD

El PROVEEDOR permitirá al CLIENTE (o a un tercero designado) realizar auditorías de seguridad de la infraestructura del servicio al menos una vez al año, con previo aviso de treinta (30) días.`,
    condition: (data) => data.criticality === 'Alto'
  },
  {
    id: 'DOC_09_NDA_CLAUSE',
    name: 'Acuerdo de Confidencialidad (NDA)',
    content: `ACUERDO DE CONFIDENCIALIDAD BIDIRECCIONAL
==========================================

### I. DEFINICIÓN DE INFORMACIÓN CONFIDENCIAL

Se considera "Información Confidencial" toda información técnica, comercial, financiera, estratégica o de cualquier naturaleza, que una parte (la "Parte Reveladora") divulgue a la otra (la "Parte Receptora"), ya sea de forma oral, escrita, electrónica o por cualquier otro medio, incluyendo sin limitación:

a) Código fuente, algoritmos, arquitectura y documentación técnica de "{{PRODUCTO_NOMBRE}}".
b) Datos de clientes, proveedores, precios, estrategias comerciales y planes de negocio.
c) Información financiera, proyecciones y estados financieros.
d) Know-how, procesos, métodos y procedimientos operativos.
e) Secretos industriales conforme a la Ley Federal de Protección de la Propiedad Industrial.
f) Cualquier información expresamente marcada como "Confidencial" o que por su naturaleza deba entenderse como tal.

### II. OBLIGACIONES DE CONFIDENCIALIDAD

La Parte Receptora se obliga a:
a) Mantener la Información Confidencial bajo estricta reserva.
b) Utilizar la Información Confidencial únicamente para los fines del contrato principal.
c) No divulgar la Información Confidencial a terceros sin consentimiento previo y por escrito de la Parte Reveladora.
d) Limitar el acceso a la Información Confidencial exclusivamente a empleados o colaboradores que necesiten conocerla, quienes estarán sujetos a obligaciones de confidencialidad equivalentes.
e) Implementar medidas de seguridad razonables para proteger la Información Confidencial.

### III. EXCLUSIONES

No se considerará Información Confidencial aquella que:
a) Sea o se convierta en dominio público sin culpa de la Parte Receptora.
b) Estuviera legítimamente en posesión de la Parte Receptora antes de su divulgación.
c) Sea desarrollada independientemente por la Parte Receptora.
d) Sea divulgada con autorización escrita de la Parte Reveladora.
e) Deba ser revelada por requerimiento legal o judicial, previa notificación a la Parte Reveladora.

### IV. VIGENCIA DE LA CONFIDENCIALIDAD

Las obligaciones de confidencialidad sobrevivirán a la terminación del contrato principal por un periodo de cinco (5) años. Los secretos industriales mantendrán su protección mientras conserven tal carácter.

### V. DEVOLUCIÓN O DESTRUCCIÓN

A la terminación de la relación contractual, la Parte Receptora deberá, a elección de la Parte Reveladora: (a) devolver toda la Información Confidencial; o (b) destruirla de forma segura y certificar por escrito dicha destrucción. Se exceptúan las copias de respaldo requeridas por obligación legal.`,
  },
  {
    id: 'DOC_10_SECURITY_POLICY',
    name: 'Política de Seguridad de la Información',
    content: `ESTÁNDARES DE SEGURIDAD DE LA INFORMACIÓN
==========================================

### I. MARCO DE SEGURIDAD

El PROVEEDOR declara cumplir con estándares de seguridad equivalentes a los marcos internacionales reconocidos (ISO 27001, SOC 2 Type II) y se compromete a mantener las siguientes medidas de seguridad:

### II. SEGURIDAD EN LA INFRAESTRUCTURA

a) **Cifrado en tránsito:** TLS 1.3 para todas las comunicaciones entre el usuario y la plataforma.
b) **Cifrado en reposo:** AES-256 para datos almacenados en bases de datos y respaldos.
c) **Firewall y WAF:** Protección contra ataques DDoS, inyección SQL, XSS y CSRF.
d) **Segregación de ambientes:** Entornos de producción, staging y desarrollo completamente aislados.
e) **Actualizaciones:** Parches de seguridad críticos aplicados dentro de las 72 horas de su publicación.

### III. CONTROL DE ACCESO

a) **Autenticación:** Contraseñas con complejidad mínima (12 caracteres, mayúsculas, minúsculas, números y símbolos).
b) **MFA:** Autenticación multifactor disponible y recomendada para todos los usuarios.
c) **Principio de mínimo privilegio:** Los empleados del PROVEEDOR solo tienen acceso a los datos estrictamente necesarios para sus funciones.
d) **Revisión de accesos:** Auditoría trimestral de permisos y roles de acceso.
e) **Revocación inmediata:** Desactivación de accesos dentro de las 24 horas posteriores a la baja de un empleado.

### IV. MONITOREO Y AUDITORÍA

a) **Logs de acceso:** Registro inmutable de todos los accesos a datos, conservados mínimo dos (2) años.
b) **Monitoreo continuo:** Sistemas de detección de intrusiones (IDS/IPS) activos 24/7.
c) **Alertas:** Notificación automática ante patrones de acceso anómalos.
d) **Pruebas de penetración:** Al menos una (1) prueba de penetración anual realizada por tercero independiente.

### V. GESTIÓN DE VULNERABILIDADES

a) Escaneo automatizado de vulnerabilidades con frecuencia semanal.
b) Clasificación y priorización según severidad (CVSS).
c) Remediación de vulnerabilidades críticas en máximo 48 horas.
d) Reporte de vulnerabilidades disponible para el CLIENTE bajo solicitud.

### VI. RESPUESTA A INCIDENTES DE SEGURIDAD

a) **Detección:** Monitoreo continuo con herramientas SIEM.
b) **Notificación:** Al CLIENTE dentro de 72 horas del descubrimiento.
c) **Contención:** Medidas inmediatas para aislar el incidente.
d) **Investigación:** Análisis forense y determinación de alcance.
e) **Remediación:** Corrección de la vulnerabilidad explotada.
f) **Reporte:** Documento detallado del incidente, impacto y medidas adoptadas.

### VII. CERTIFICACIONES Y CUMPLIMIENTO

El PROVEEDOR mantendrá actualizadas las siguientes certificaciones o equivalentes:
- Evaluación de seguridad conforme a estándares ISO 27001 o SOC 2.
- Cumplimiento PCI-DSS si procesa datos de tarjetas de pago.
- Cumplimiento LFPDPPP y regulaciones sectoriales aplicables.`,
  },
  {
    id: 'DOC_11_DATA_PORTABILITY',
    name: 'Portabilidad y Borrado de Datos',
    content: `CLÁUSULA DE PORTABILIDAD, EXPORTACIÓN Y BORRADO DE DATOS
=========================================================
(Conforme al Art. 28 LFPDPPP y principio de portabilidad de datos)

### I. DERECHO A LA PORTABILIDAD

1.1. El CLIENTE tiene derecho a solicitar la exportación total de sus datos almacenados en la plataforma "{{PRODUCTO_NOMBRE}}" en cualquier momento durante la vigencia del contrato.
1.2. Los datos serán entregados en formatos estándar, legibles por máquina: CSV, JSON y/o SQL dump.
1.3. El PROVEEDOR atenderá solicitudes de exportación en un plazo máximo de diez (10) días hábiles.
1.4. No se cobrará cargo adicional por la primera exportación de datos. Exportaciones adicionales podrán generar un cargo razonable por recursos computacionales utilizados.

### II. PERIODO DE TRANSICIÓN POST-TERMINACIÓN

2.1. A la terminación del contrato por cualquier causa, el CLIENTE dispondrá de un periodo de treinta (30) días naturales para exportar toda su información de la plataforma.
2.2. Durante este periodo, el CLIENTE mantendrá acceso de solo lectura a la plataforma.
2.3. El PROVEEDOR proporcionará asistencia técnica razonable para facilitar la migración de datos.

### III. BORRADO SEGURO

3.1. Transcurrido el periodo de treinta (30) días posterior a la terminación, el PROVEEDOR procederá al borrado completo e irreversible de los datos del CLIENTE de todos sus sistemas, incluyendo bases de datos, respaldos y logs.
3.2. El borrado se realizará conforme a estándares reconocidos (NIST 800-88).
3.3. El PROVEEDOR emitirá un certificado de destrucción de datos dentro de los diez (10) días hábiles siguientes al borrado.
3.4. Se exceptúan del borrado los datos que el PROVEEDOR esté obligado a conservar por disposición legal o regulatoria, los cuales serán conservados en condiciones de seguridad y con acceso restringido.

### IV. FORMATO Y ESTRUCTURA

Los datos exportados incluirán:
a) Todos los registros creados por el CLIENTE y sus usuarios.
b) Metadatos asociados (fechas de creación, modificación, autor).
c) Archivos adjuntos y documentos almacenados.
d) Estructura de datos documentada (esquema de base de datos).`,
  },
  {
    id: 'DOC_12_IMPLEMENTATION',
    name: 'Servicios de Implementación y Capacitación',
    content: `ANEXO: SERVICIOS DE IMPLEMENTACIÓN Y CAPACITACIÓN
===================================================

### I. ALCANCE DE LA IMPLEMENTACIÓN

El PROVEEDOR realizará la implementación del servicio "{{PRODUCTO_NOMBRE}}" conforme al siguiente alcance:
a) Configuración inicial de la plataforma según los requerimientos del CLIENTE.
b) Migración de datos existentes del CLIENTE (si aplica), previo análisis de factibilidad.
c) Integración con sistemas del CLIENTE mediante APIs documentadas (si aplica).
d) Pruebas de aceptación de usuario (UAT) previas a la puesta en producción.

### II. CRONOGRAMA

2.1. El PROVEEDOR presentará un cronograma de implementación dentro de los cinco (5) días hábiles siguientes a la firma del contrato.
2.2. La implementación estándar no excederá de treinta (30) días hábiles, salvo complejidades excepcionales acordadas entre las partes.
2.3. La puesta en producción requiere la aprobación escrita del CLIENTE.

### III. CAPACITACIÓN

3.1. El PROVEEDOR proporcionará capacitación al equipo del CLIENTE que incluirá:
a) Sesión de capacitación inicial (mínimo 2 horas) para usuarios administradores.
b) Sesión de capacitación para usuarios finales (mínimo 1 hora).
c) Material de soporte: manuales de usuario, guías rápidas y videos tutoriales.
d) Acceso a base de conocimiento en línea actualizada.

### IV. ACEPTACIÓN

4.1. Al finalizar la implementación, ambas partes firmarán un Acta de Entrega-Recepción.
4.2. El CLIENTE dispondrá de quince (15) días hábiles para reportar incidencias de implementación.
4.3. Transcurrido dicho plazo sin observaciones, se entenderá la aceptación tácita.`,
  },
  {
    id: 'DOC_13_DISPUTE_RESOLUTION',
    name: 'Jurisdicción, Ley Aplicable y Resolución de Controversias',
    content: `CLÁUSULA DE JURISDICCIÓN, LEY APLICABLE Y RESOLUCIÓN DE CONTROVERSIAS
======================================================================

### I. LEY APLICABLE

El presente contrato y todos los actos que deriven del mismo se regirán e interpretarán conforme a las leyes federales de {{JURISDICCION}}, particularmente:
a) Código de Comercio (para la relación mercantil).
b) Código Civil Federal (de forma supletoria).
c) Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
d) Ley Federal del Derecho de Autor.
e) Legislación sectorial aplicable según la industria del CLIENTE.

### II. RESOLUCIÓN AMIGABLE

2.1. Las partes se comprometen a intentar resolver cualquier controversia derivada del presente contrato de manera amigable mediante negociación directa entre representantes autorizados.
2.2. El plazo para la negociación directa será de treinta (30) días naturales contados a partir de la notificación escrita de la controversia.

### III. MEDIACIÓN

3.1. Si la negociación directa no resolviera la controversia, las partes podrán someter el asunto a mediación ante el Centro de Mediación del Poder Judicial de {{JURISDICCION}} o ante un mediador privado mutuamente aceptado.
3.2. Los costos de la mediación serán compartidos por partes iguales.

### IV. JURISDICCIÓN

4.1. Para todo lo relacionado con la interpretación y cumplimiento del presente contrato, las partes se someten expresamente a la jurisdicción de los tribunales competentes de {{JURISDICCION}}, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.

### V. SUPERVIVENCIA

Las cláusulas de confidencialidad, propiedad intelectual, limitación de responsabilidad, portabilidad de datos y obligaciones de pago pendientes sobrevivirán a la terminación del presente contrato.`,
  },
  {
    id: 'DOC_14_MARKETING_RIGHTS',
    name: 'Uso de Referencia Comercial',
    content: `CLÁUSULA DE REFERENCIA COMERCIAL Y USO DE MARCA
=================================================

### I. AUTORIZACIÓN

1.1. El CLIENTE autoriza al PROVEEDOR a utilizar su nombre comercial, logotipo y razón social exclusivamente como referencia de cliente en:
a) Sitio web del PROVEEDOR (sección de clientes/casos de éxito).
b) Presentaciones comerciales y materiales de marketing.
c) Propuestas comerciales a prospectos.

1.2. Esta autorización puede ser revocada por el CLIENTE en cualquier momento mediante notificación escrita, con un plazo de quince (15) días hábiles para que el PROVEEDOR retire las referencias.

### II. RESTRICCIONES

2.1. El PROVEEDOR NO podrá:
a) Modificar, alterar o distorsionar el logotipo o nombre comercial del CLIENTE.
b) Utilizar la referencia de manera que sugiera endorsement o patrocinio.
c) Divulgar datos confidenciales del CLIENTE en materiales de marketing.
d) Crear testimoniales ficticios o atribuir declaraciones no autorizadas al CLIENTE.

### III. CASO DE ÉXITO

Si las partes acuerdan la elaboración de un caso de éxito (case study), este requerirá:
a) Aprobación previa y por escrito del CLIENTE sobre el contenido final.
b) Derecho del CLIENTE a solicitar modificaciones o retiro en cualquier momento.`,
  },
  {
    id: 'DOC_15_TERMINATION',
    name: 'Terminación Anticipada',
    content: `CLÁUSULA DE TERMINACIÓN ANTICIPADA
===================================

### I. TERMINACIÓN POR CONVENIENCIA

Cualquiera de las partes podrá terminar el presente contrato sin expresión de causa, mediante notificación escrita a la otra parte con un mínimo de treinta (30) días naturales de anticipación. En caso de terminación por conveniencia del CLIENTE, no procederá reembolso de periodos pagados por adelantado.

### II. TERMINACIÓN POR INCUMPLIMIENTO

2.1. Cualquiera de las partes podrá terminar el contrato de forma inmediata si la otra parte incurre en incumplimiento grave que no sea subsanado dentro de los quince (15) días hábiles siguientes a la notificación escrita del incumplimiento.
2.2. Se consideran causales de terminación inmediata (sin periodo de subsanación):
a) Violación de las obligaciones de confidencialidad.
b) Uso no autorizado de la propiedad intelectual.
c) Vulneración de seguridad de datos por negligencia grave.
d) Mora en el pago superior a sesenta (60) días naturales.
e) Declaración de quiebra, concurso mercantil o insolvencia.

### III. EFECTOS DE LA TERMINACIÓN

A la terminación del contrato, independientemente de su causa:
a) El PROVEEDOR suspenderá el acceso a la plataforma al vencimiento del periodo de transición.
b) Se activará el protocolo de Portabilidad y Borrado de Datos (DOC_11).
c) El CLIENTE deberá liquidar cualquier monto adeudado al PROVEEDOR.
d) Ambas partes devolverán o destruirán la Información Confidencial de la otra parte.
e) Las cláusulas que por su naturaleza deban sobrevivir (confidencialidad, PI, limitación de responsabilidad, jurisdicción) permanecerán en vigor.

### IV. AUSENCIA DE LOCK-IN

El PROVEEDOR se compromete a no implementar prácticas de "vendor lock-in" que dificulten artificialmente la migración del CLIENTE a otra plataforma. Esto incluye mantener los datos en formatos estándar y proporcionar APIs documentadas para la extracción de datos.`,
  }
];
