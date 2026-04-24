let catalogoCompleto = [];

async function aplicarFiltros() {
    const query = document.getElementById('filter-q')?.value || '';
    const talla = document.getElementById('filter-talla')?.value || '';
    const color = document.getElementById('filter-color')?.value || '';
    const tags = document.getElementById('filter-tags')?.value || '';
    const ordenar = document.getElementById('filter-sort')?.value || '';

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (talla) params.append('talla', talla);
    if (color) params.append('colores', color);
    if (tags) params.append('tags', tags);
    if (ordenar) params.append('sort', ordenar);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const camisetasFiltradas = await apiService.getCamisetas(queryString);
    
    // Mostramos los resultados filtrados
    mostrarCamisetasEnHTML(camisetasFiltradas);
    
    // Actualizamos los filtros basándonos en los resultados actuales 
    // para que solo aparezca lo que realmente hay disponible
    if (camisetasFiltradas.length > 0) {
        construirFiltrosDinamicos(camisetasFiltradas);
    }
}

let timeoutFiltros;
function aplicarFiltrosDebounced() {
    clearTimeout(timeoutFiltros);
    timeoutFiltros = setTimeout(aplicarFiltros, 300);
}

async function limpiarFiltros() {
    if (document.getElementById('filter-q')) document.getElementById('filter-q').value = '';
    if (document.getElementById('filter-talla')) document.getElementById('filter-talla').value = '';
    if (document.getElementById('filter-color')) document.getElementById('filter-color').value = '';
    if (document.getElementById('filter-tags')) document.getElementById('filter-tags').value = '';
    if (document.getElementById('filter-sort')) document.getElementById('filter-sort').value = '';

    // Al limpiar, volvemos a mostrar todo y restauramos los filtros globales
    mostrarCamisetasEnHTML(catalogoCompleto);
    construirFiltrosDinamicos(catalogoCompleto);
    mostrarNotificacion("Filtros limpiados", "info");
}

async function buscarTicketDinamico() {
    const idInput = document.getElementById('search-ticket-input');
    if (!idInput) return;

    const id = idInput.value.trim();
    if (!id) {
        mostrarNotificacion("Introduce un ID de ticket.", "warning");
        return;
    }

    verDetallePedido(id);
}

async function refrescarCatalogo() {
    // Volvemos a pedir todo el catálogo para actualizar el stock global
    catalogoCompleto = await apiService.getCamisetas();
    
    // Aplicamos los filtros actuales para que la vista no cambie bruscamente
    // pero se actualicen los datos de stock mostrados
    await aplicarFiltros();
    
    // Si no hay filtros aplicados, aplicarFiltros ya habrá llamado a mostrarCamisetasEnHTML
    // con los datos filtrados, pero necesitamos asegurar que los filtros dinámicos
    // se basen en el catálogo completo si estamos en la vista inicial.
    if (!document.getElementById('filter-q').value && 
        !document.getElementById('filter-talla').value && 
        !document.getElementById('filter-color').value && 
        !document.getElementById('filter-tags').value) {
        construirFiltrosDinamicos(catalogoCompleto);
    }
}

async function init() {
    const inputTicket = document.getElementById('search-ticket-input');
    if (inputTicket) {
        inputTicket.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                buscarTicketDinamico();
            }
        });
    }

    // Cargamos el catálogo completo una sola vez para inicializar los filtros globales
    document.title = "TeeLab | Colección";
    catalogoCompleto = await apiService.getCamisetas();
    if (catalogoCompleto.length > 0) {
        construirFiltrosDinamicos(catalogoCompleto);
        mostrarCamisetasEnHTML(catalogoCompleto);
    }

    // Cargamos el carrito guardado
    if (typeof loadCart === 'function') {
        loadCart();
    }
}

document.addEventListener('DOMContentLoaded', init);
