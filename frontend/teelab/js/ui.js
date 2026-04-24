function mostrarNotificacion(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerText = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500); 
    }, 3500);
}

function crearOpcionesColores(cam) {
    if (!cam.colores) return '<option value="">Único</option>';
    return cam.colores.map(c => {
        const img = cam.imagenes && cam.imagenes[c] ? cam.imagenes[c] : 'https://picsum.photos/seed/placeholder/600/800';
        return `<option value="${c}" data-img="${img}">${c}</option>`;
    }).join('');
}

function crearTarjetaHTML(cam) {
    const disabled = cam.cantidad <= 0 ? 'disabled' : '';
    const colorIni = cam.colores ? cam.colores[0] : '';
    const imgIni = cam.imagenes && cam.imagenes[colorIni] ? cam.imagenes[colorIni] : 'https://picsum.photos/seed/placeholder/600/800';

    return `
        <article class="tarjeta-camiseta ${cam.cantidad <= 0 ? 'sin-stock' : ''}">
            <img src="${imgIni}" id="img-${cam.id}" alt="${cam.nombre}" referrerPolicy="no-referrer">
            <div class="tarjeta-body">
                ${crearTarjetaHeader(cam)}
                <p class="precio">${cam.precioBase}€</p>
                ${crearTarjetaForm(cam, disabled)}
                ${crearTarjetaFooter(cam, disabled)}
            </div>
        </article>
    `;
}

function crearTarjetaHeader(cam) {
    const stockMsg = cam.cantidad > 0 ? `${cam.cantidad} disp.` : 'Agotado';
    const lowStockClass = cam.cantidad < 10 ? 'low-stock' : '';
    return `
        <div class="tarjeta-header">
            <h3 title="${cam.nombre}">${cam.nombre}</h3>
            <span class="stock-badge ${lowStockClass}">${stockMsg}</span>
        </div>
    `;
}

function crearTarjetaForm(cam, disabled) {
    return `
        <div class="form-group">
            <label>Talla</label>
            <select id="talla-${cam.id}" ${disabled}>
                ${cam.tallas ? cam.tallas.map(t => `<option value="${t}">${t}</option>`).join('') : '<option value="M">M</option>'}
            </select>
        </div>
        <div class="form-group">
            <label>Color</label>
            <select id="color-${cam.id}" onchange="cambiarImagenColor('${cam.id}', this)" ${disabled}>
                ${crearOpcionesColores(cam)}
            </select>
        </div>
    `;
}

function crearTarjetaFooter(cam, disabled) {
    return `
        <div class="form-group">
            <label>Cantidad</label>
            <div class="qty-selector-catalog">
                <button onclick="modificarCantidadUI('${cam.id}', -1)" ${disabled}>-</button>
                <input type="number" id="qty-${cam.id}" value="1" min="1" max="${cam.cantidad}" readonly ${disabled}>
                <button onclick="modificarCantidadUI('${cam.id}', 1)" ${disabled}>+</button>
            </div>
        </div>
        <button class="btn-solid" onclick="addToCart('${cam.id}', '${cam.nombre}', ${cam.precioBase}, ${cam.cantidad})" ${disabled}>
            ${cam.cantidad > 0 ? 'Añadir a la selección' : 'Agotado'}
        </button>
    `;
}

function modificarCantidadUI(id, cambio) {
    const input = document.getElementById(`qty-${id}`);
    if (!input) return;
    let val = parseInt(input.value) + cambio;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 99;
    if (val >= min && val <= max) {
        input.value = val;
    }
}

function mostrarCamisetasEnHTML(camisetas) {
    const contenedor = document.getElementById('contenedor-camisetas');
    if (!contenedor) return;
    contenedor.innerHTML = ''; 

    if (camisetas.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 50px; opacity: 0.5;">No hay productos disponibles.</p>';
        return;
    }

    camisetas.forEach(cam => {
        contenedor.innerHTML += crearTarjetaHTML(cam);
    });
}

function cambiarImagenColor(id, select) {
    const img = document.getElementById(`img-${id}`);
    const selectedOption = select.options[select.selectedIndex];
    const newSrc = selectedOption.getAttribute('data-img');
    if (img && newSrc) {
        img.src = newSrc;
    }
}

function construirFiltrosDinamicos(camisetas) {
    const selectTalla = document.getElementById('filter-talla');
    const selectColor = document.getElementById('filter-color');
    const selectTags = document.getElementById('filter-tags');

    if (!selectTalla || !selectColor || !selectTags) return;

    // Guardamos los valores seleccionados actualmente
    const valTalla = selectTalla.value;
    const valColor = selectColor.value;
    const valTags = selectTags.value;

    const tallasUnicas = new Set();
    const coloresUnicos = new Set();
    const tagsUnicos = new Set();

    camisetas.forEach(cam => {
        if (cam.tallas) cam.tallas.forEach(t => tallasUnicas.add(t));
        if (cam.colores) cam.colores.forEach(c => coloresUnicos.add(c));
        if (cam.tags) cam.tags.forEach(t => tagsUnicos.add(t));
    });

    // Reconstruimos los selects manteniendo la selección si aún existe
    selectTalla.innerHTML = '<option value="">Talla</option>';
    Array.from(tallasUnicas).sort().forEach(t => {
        const selected = t === valTalla ? 'selected' : '';
        selectTalla.innerHTML += `<option value="${t}" ${selected}>${t}</option>`;
    });

    selectColor.innerHTML = '<option value="">Color</option>';
    Array.from(coloresUnicos).sort().forEach(c => {
        const selected = c === valColor ? 'selected' : '';
        selectColor.innerHTML += `<option value="${c}" ${selected}>${c}</option>`;
    });

    selectTags.innerHTML = '<option value="">Colección</option>';
    Array.from(tagsUnicos).sort().forEach(t => {
        const selected = t === valTags ? 'selected' : '';
        selectTags.innerHTML += `<option value="${t}" ${selected}>${t}</option>`;
    });
}

function irAVistaCatalogo() {
    document.getElementById('vista-tickets').classList.add('hidden');
    document.getElementById('vista-catalogo').classList.remove('hidden');
    document.getElementById('hero-principal').classList.remove('hidden');
    document.title = "TeeLab | Colección";
}

function irAVistaTickets() {
    document.getElementById('vista-catalogo').classList.add('hidden');
    document.getElementById('hero-principal').classList.add('hidden');
    document.getElementById('vista-tickets').classList.remove('hidden');
    document.title = "TeeLab | Seguimiento";
    
    // Al entrar a la vista de tickets, cargamos todos los pedidos
    cargarTodosLosPedidos();
}

async function cargarTodosLosPedidos() {
    document.title = "TeeLab | Seguimiento";
    const cont = document.getElementById('resultado-ticket');
    if (!cont) return;

    cont.innerHTML = '<p style="text-align:center; opacity:0.5; padding: 50px;">Cargando historial de pedidos...</p>';

    try {
        const comandas = await apiService.getComandas();
        if (!comandas || comandas.length === 0) {
            cont.innerHTML = '<p style="text-align:center; opacity:0.5; padding: 50px;">Aún no hay pedidos registrados.</p>';
            return;
        }

        cont.innerHTML = `
            <div class="ticket-grid">
                ${comandas.map(ticket => `
                    <div class="ticket-result-card" onclick="verDetallePedido('${ticket.id}')">
                        <div class="ticket-card-header">
                            <h3>Pedido ${ticket.id}</h3>
                            <span class="status-badge">${ticket.estado}</span>
                        </div>
                        <div class="ticket-card-body">
                            <p><strong>Fecha:</strong> ${new Date(ticket.fecha).toLocaleDateString()}</p>
                            ${ticket.cliente ? `<p><strong>Cliente:</strong> ${ticket.cliente.nombre}</p>` : ''}
                            <p class="ticket-card-total">${ticket.total}€</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        cont.innerHTML = '<p style="text-align:center; color:red; padding: 50px;">Error al cargar los pedidos.</p>';
    }
}

function renderizarFilaTicket(item) {
    const sub = item.subtotal || (item.precioUnitario * item.cantidad).toFixed(2);
    return `
        <li class="ticket-item-row">
            <span>${item.cantidad}x ${item.nombre} <small style="opacity:0.6; margin-left:10px;">${item.talla} / ${item.color}</small></span>
            <span style="font-weight:500; color: var(--primary);">${sub}€</span>
        </li>
    `;
}

function renderizarDetalleTicketHTML(ticket) {
    return `
        <div style="margin-bottom: 40px;">
            <button class="btn-outline" onclick="cargarTodosLosPedidos()" style="padding: 10px 20px; font-size: 0.65rem; letter-spacing: 1px;">← Volver al historial</button>
        </div>
        <div class="ticket-detail-view">
            ${renderizarDetalleHeader(ticket)}
            ${renderizarDetalleBody(ticket)}
        </div>
    `;
}

function renderizarDetalleHeader(ticket) {
    return `
        <div class="ticket-detail-header">
            <h3>Pedido ${ticket.id}</h3>
            <span class="status-badge">${ticket.estado}</span>
        </div>
    `;
}

function renderizarDetalleBody(ticket) {
    const fecha = new Date(ticket.fecha).toLocaleString();
    const cliente = ticket.cliente ? `<p><strong>Cliente:</strong> ${ticket.cliente.nombre}</p>` : '';
    const direccion = ticket.direccion ? `<p style="margin-bottom: 30px;"><strong>Dirección:</strong> ${ticket.direccion.calle}, ${ticket.direccion.ciudad}</p>` : '';
    return `
        <div class="ticket-detail-body">
            <p><strong>Fecha:</strong> ${fecha}</p>
            ${cliente}
            ${direccion}
            <h4 style="color:var(--primary); margin-bottom: 15px; text-transform:uppercase; font-size:0.7rem; letter-spacing:2px; font-weight: 600;">Artículos Seleccionados</h4>
            <ul class="ticket-items-list">${ticket.items.map(renderizarFilaTicket).join('')}</ul>
            ${renderizarDetalleFooter(ticket)}
        </div>
    `;
}

function renderizarDetalleFooter(ticket) {
    return `
        <div class="ticket-detail-footer">
            <span style="text-transform:uppercase; letter-spacing:2px; font-size: 0.75rem; color: var(--primary);">Total Final</span>
            <span class="ticket-total-final">${ticket.total}€</span>
        </div>
    `;
}

async function verDetallePedido(id) {
    document.title = `TeeLab | Ticket ${id}`;
    const cont = document.getElementById('resultado-ticket');
    if (!cont) return;
    cont.innerHTML = '<p style="text-align:center; opacity:0.5; padding: 50px;">Cargando detalle...</p>';

    try {
        const ticket = await apiService.getComandaById(id);
        if (!ticket) throw new Error('Ticket no encontrado');
        cont.innerHTML = renderizarDetalleTicketHTML(ticket);
    } catch (error) {
        mostrarNotificacion("Error al cargar el detalle", "error");
        cargarTodosLosPedidos();
    }
}
