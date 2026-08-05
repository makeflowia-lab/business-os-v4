/**
 * Pie de origen — exigido por la licencia BO-AT 1.0 (ver LICENCIA.md y ORIGEN.md).
 *
 * Puedes cambiar los estilos, moverlo de sitio o integrarlo en tu propio pie de
 * pagina. Lo que la licencia no permite es eliminar la mencion: es la unica
 * condicion a cambio de poder usar, modificar, renombrar y vender este sistema.
 *
 * La formula es aditiva — puedes anteponer tu marca:
 *   «Mi Producto, de Mi Empresa — basado en el Business OS de Makeflowia Lab.»
 */
export function OrigenBusinessOS() {
  return (
    <div
      data-bo-origen="1"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        pointerEvents: 'none',
        padding: '6px 16px',
        textAlign: 'center',
        fontSize: '10px',
        lineHeight: 1.4,
        opacity: 0.5,
        color: '#fff',
      }}
    >
      Basado en el Business OS, creado por Makeflowia Lab.
    </div>
  );
}
