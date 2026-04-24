let carrito = [];

function cargarDatosUsuario() {
    const datosGuardados = localStorage.getItem('teelab_user_data');
    return datosGuardados ? JSON.parse(datosGuardados) : null;
}

function guardarDatosUsuario(cliente, direccion) {
    const datos = { cliente, direccion };
    localStorage.setItem('teelab_user_data', JSON.stringify(datos));
}

function saveCart() {
    localStorage.setItem('teelab_cart_data', JSON.stringify(carrito));
}

function loadCart() {
    const guardado = localStorage.getItem('teelab_cart_data');
    if (guardado) {
        carrito = JSON.parse(guardado);
        renderCart();
    }
}

function toggleCart() {
    const cartOverlay = document.getElementById('cart-overlay');
    const isOpening = cartOverlay.classList.contains('hidden');
    cartOverlay.classList.toggle('hidden');
    updateTitleOnToggle(isOpening);
}

function updateTitleOnToggle(isOpening) {
    if (isOpening) {
        window._prevTitle = document.title;
        document.title = "TeeLab | Bolsa";
    } else if (window._prevTitle) {
        document.title = window._prevTitle;
    }
}

function addToCart(id, nombre, precio, stockDisponible) {
    const talla = document.getElementById(`talla-${id}`).value;
    const color = document.getElementById(`color-${id}`).value;
    const imagen = document.getElementById(`img-${id}`).src;
    const qtyInput = document.getElementById(`qty-${id}`);
    const cantidad = parseInt(qtyInput.value);

    if (validarCantidad(cantidad, qtyInput)) {
        procesarAdicion(id, nombre, precio, talla, color, imagen, cantidad, stockDisponible);
    }
}

function validarCantidad(cantidad, input) {
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarNotificacion("Cantidad no válida.", "error");
        input.value = 1;
        return false;
    }
    return true;
}

function procesarAdicion(id, nombre, precio, talla, color, imagen, cantidad, stock) {
    const existe = carrito.find(i => i.camisetaId === id && i.talla === talla && i.color === color);
    const enCarrito = existe ? existe.cantidad : 0;

    if (enCarrito + cantidad > stock) {
        mostrarNotificacion(`Solo quedan ${stock} unidades.`, "warning");
        return;
    }

    if (existe) existe.cantidad += cantidad;
    else carrito.push({ camisetaId: id, nombre, precioBase: precio, talla, color, imagen, cantidad, stockMax: stock });
    
    renderCart();
    saveCart();
    mostrarNotificacion("Añadido al carrito", "success");
}

function renderCart() {
    const contItems = document.getElementById('cart-items');
    const contTotal = document.getElementById('cart-total');
    const contCount = document.getElementById('cart-count');
    if (!contItems) return;

    contItems.innerHTML = carrito.length === 0 ? emptyCartMsg() : '';
    let total = 0;
    carrito.forEach((item, index) => {
        total += item.precioBase * item.cantidad;
        contItems.innerHTML += createCartItemHTML(item, index);
    });

    if (contTotal) contTotal.innerText = total.toFixed(2);
    if (contCount) contCount.innerText = carrito.reduce((acc, i) => acc + i.cantidad, 0);
}

function emptyCartMsg() {
    return `<div style="text-align:center; color:#999; margin-top:50px;"><p>Tu selección está vacía.</p></div>`;
}

function createCartItemHTML(item, index) {
    const subtotal = (item.precioBase * item.cantidad).toFixed(2);
    return `
        <div class="cart-item">
            <img src="${item.imagen}" alt="${item.nombre}" referrerPolicy="no-referrer">
            <div class="cart-item-info">
                <h4>${item.nombre}</h4>
                <p>${item.talla} / ${item.color}</p>
                ${createQtyControls(item)}
            </div>
            <div class="cart-item-actions">
                <span class="cart-item-subtotal">${subtotal}€</span>
                <button onclick="eliminarDelCarrito(${index})" class="btn-remove">Eliminar</button>
            </div>
        </div>
    `;
}

function createQtyControls(item) {
    return `
        <div class="cart-qty-wrapper">
            <button onclick="cambiarCantidad('${item.camisetaId}', '${item.talla}', '${item.color}', -1)" class="qty-btn">-</button>
            <span class="qty-display">${item.cantidad}</span>
            <button onclick="cambiarCantidad('${item.camisetaId}', '${item.talla}', '${item.color}', 1)" class="qty-btn">+</button>
        </div>
    `;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    renderCart();
    saveCart();
    mostrarNotificacion("Producto eliminado", "info");
}

function vaciarCarrito() {
    carrito = [];
    renderCart();
    saveCart();
    mostrarNotificacion("Carrito vaciado", "info");
}

function abrirCheckout() {
    if (carrito.length === 0) {
        mostrarNotificacion("Tu carrito está vacío.", "warning");
        return;
    }

    window._prevTitle = document.title;
    document.title = "TeeLab | Finalizar Compra";
    document.getElementById('checkout-overlay').classList.remove('hidden');

    const userData = cargarDatosUsuario();
    if (userData) {
        document.getElementById('chk-nombre').value = userData.cliente.nombre || '';
        document.getElementById('chk-email').value = userData.cliente.email || '';
        document.getElementById('chk-calle').value = userData.direccion.calle || '';
        document.getElementById('chk-cp').value = userData.direccion.cp || '';
        document.getElementById('chk-ciudad').value = userData.direccion.ciudad || '';
    }
}

function cerrarCheckout() {
    document.getElementById('checkout-overlay').classList.add('hidden');
    if (window._prevTitle) {
        document.title = window._prevTitle;
    }
}

async function procesarPago(event) {
    event.preventDefault();
    const payload = obtenerPayloadCheckout();
    guardarDatosUsuario(payload.cliente, payload.direccion);

    try {
        const resultado = await apiService.postComanda(payload);
        localStorage.setItem('teelab_last_order_id', resultado.id);
        finalizarCompraExitosa(resultado.id);
    } catch (error) {
        mostrarNotificacion("Error procesando el pago.", "error");
    }
}

function obtenerPayloadCheckout() {
    return {
        cliente: {
            nombre: document.getElementById('chk-nombre').value,
            email: document.getElementById('chk-email').value
        },
        direccion: {
            calle: document.getElementById('chk-calle').value,
            cp: document.getElementById('chk-cp').value,
            ciudad: document.getElementById('chk-ciudad').value
        },
        items: carrito.map(i => ({ camisetaId: i.camisetaId, talla: i.talla, color: i.color, cantidad: i.cantidad }))
    };
}

function finalizarCompraExitosa(id) {
    mostrarNotificacion(`¡Compra confirmada! Ticket: ${id}`, "success");
    cerrarCheckout();
    vaciarCarrito();
    if (typeof refrescarCatalogo === 'function') refrescarCatalogo();
}

function cambiarCantidad(id, talla, color, cambio) {
    const item = carrito.find(i => i.camisetaId === id && i.talla === talla && i.color === color);
    if (item) {
        if (cambio > 0 && item.cantidad >= item.stockMax) {
            mostrarNotificacion(`Sin stock disponible.`, "warning");
            return;
        }
        item.cantidad += cambio;
        if (item.cantidad <= 0) carrito = carrito.filter(i => i !== item);
        renderCart();
        saveCart();
    }
}
