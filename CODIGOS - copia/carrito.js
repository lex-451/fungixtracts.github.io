// ========== CARRITO DE COMPRAS ==========
const carrito = {
    items: [],
    precioLiquido: 450,
    precioCapsulas: 550,
    
    agregar: function(nombre, tipo, cantidad) {
        const precio = tipo === 'Líquido' ? this.precioLiquido : this.precioCapsulas;
        this.items.push({
            nombre: nombre,
            tipo: tipo,
            cantidad: cantidad,
            precio: precio,
            id: Date.now() + Math.random()
        });
        this.guardar();
        this.actualizarContador();
        this.mostrarPopupContinuar(nombre);
    },
    
    eliminar: function(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardar();
        this.actualizarContador();
        mostrarListaCarrito();
        renderResumenCompra();
    },
    
    cambiarCantidad: function(id, cambio) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.cantidad = Math.max(0, item.cantidad + cambio);
            if (item.cantidad === 0) {
                this.eliminar(id);
            } else {
                this.guardar();
                this.actualizarContador();
                mostrarListaCarrito();
                renderResumenCompra();
            }
        }
    },

    cambiarCantidadAgrupada: function(nombre, tipo, cambio) {
        const itemsRelacionados = this.items.filter(item => item.nombre === nombre && item.tipo === tipo);
        if (itemsRelacionados.length === 0) return;

        if (cambio > 0) {
            itemsRelacionados[0].cantidad += cambio;
        } else {
            let restante = Math.abs(cambio);
            this.items = this.items.flatMap(item => {
                if (item.nombre === nombre && item.tipo === tipo && restante > 0) {
                    const nuevaCantidad = item.cantidad - restante;
                    if (nuevaCantidad > 0) {
                        item.cantidad = nuevaCantidad;
                        restante = 0;
                        return [item];
                    }

                    restante -= item.cantidad;
                    return [];
                }

                return [item];
            });
        }

        this.guardar();
        this.actualizarContador();
        mostrarListaCarrito();
        renderResumenCompra();
    },
    
    obtenerTotal: function() {
        return this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    },

    obtenerItemsAgrupados: function() {
        const agrupados = {};

        this.items.forEach(item => {
            const clave = `${item.nombre}-${item.tipo}`;
            if (!agrupados[clave]) {
                agrupados[clave] = {
                    nombre: item.nombre,
                    tipo: item.tipo,
                    cantidad: 0,
                    precio: item.precio
                };
            }
            agrupados[clave].cantidad += item.cantidad;
        });

        return Object.values(agrupados);
    },

    generarMensajePedido: function() {
        const itemsAgrupados = this.obtenerItemsAgrupados();
        if (itemsAgrupados.length === 0) return '';

        const lineas = itemsAgrupados.map(item => {
            return `- ${item.nombre} (${item.tipo}) x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString('es-MX')} MXN`;
        });

        return [
            'Hola FungiXtracts, quiero realizar este pedido:',
            '',
            ...lineas,
            '',
            `Total: $${this.obtenerTotal().toLocaleString('es-MX')} MXN`,
            '',
            'Les escribo por aqui para continuar con mi compra. Gracias.'
        ].join('\n');
    },

    obtenerWhatsAppUrl: function() {
        const mensaje = this.generarMensajePedido();
        return `https://wa.me/15551234567?text=${encodeURIComponent(mensaje)}`;
    },
    
    actualizarContador: function() {
        const contador = document.getElementById('carrito-contador');
        if (contador) {
            const total = this.items.reduce((sum, item) => sum + item.cantidad, 0);
            contador.textContent = total;
            contador.style.display = total > 0 ? 'block' : 'none';
        }
    },
    
    guardar: function() {
        sessionStorage.setItem('carrito', JSON.stringify(this.items));
    },
    
    cargar: function() {
        const guardado = sessionStorage.getItem('carrito');
        if (guardado) {
            try {
                this.items = JSON.parse(guardado);
                this.actualizarContador();
            } catch(e) {
                this.items = [];
            }
        } else {
            this.items = [];
            this.actualizarContador();
        }
    },
    
    mostrarPopupContinuar: function(ultimoProducto) {
        const productos = [
            { nombre: 'Cordyceps', id: 'cordyceps' },
            { nombre: 'Reishi', id: 'reishi' },
            { nombre: 'Melena de León', id: 'melena-leon' },
            { nombre: 'Cola de Pavo', id: 'coladepavo' }
        ];
        
        const otros = productos.filter(p => p.nombre !== ultimoProducto);
        const contenedor = document.getElementById('popup-productos');
        
        if (contenedor) {
            contenedor.innerHTML = otros.map(p => `
                <div class="popup-producto-item">
                    <h4>${p.nombre}</h4>
                    <a href="${p.id}.html" class="popup-btn-comprar">Ver producto</a>
                </div>
            `).join('');
        }
        
        const popup = document.getElementById('popup-continuarCompra');
        if (popup) {
            popup.style.display = 'flex';
        }
    }
};

// ========== CONTROLES DEL MODAL DE COMPRA ==========
let productoActualCompra = '';

function abrirModalCompra(nombreProducto) {
    productoActualCompra = nombreProducto;
    
    const modal = document.getElementById('modal-compra');
    const titulo = document.getElementById('compra-titulo');
    
    if (modal) modal.style.display = 'flex';
    if (titulo) titulo.textContent = nombreProducto;
    
    document.getElementById('cantidad-liquido').value = 0;
    document.getElementById('cantidad-capsulas').value = 0;
    actualizarTotalModal();
}

function cerrarModalCompra() {
    const modal = document.getElementById('modal-compra');
    if (modal) modal.style.display = 'none';
}

function cambiarCantidad(tipo, incremento) {
    const input = document.getElementById(`cantidad-${tipo}`);
    if (!input) return;
    
    let valor = parseInt(input.value) || 0;
    valor = Math.max(0, valor + incremento);
    input.value = valor;
    
    actualizarTotalModal();
}

function actualizarTotalModal() {
    const cantLiquido = parseInt(document.getElementById('cantidad-liquido').value) || 0;
    const cantCapsulas = parseInt(document.getElementById('cantidad-capsulas').value) || 0;
    
    const subtotalLiquido = cantLiquido * 450;
    const subtotalCapsulas = cantCapsulas * 550;
    const total = subtotalLiquido + subtotalCapsulas;
    
    const subLiq = document.getElementById('subtotal-liquido');
    const subCap = document.getElementById('subtotal-capsulas');
    const totalMod = document.getElementById('total-modal');
    
    if (subLiq) subLiq.textContent = subtotalLiquido.toLocaleString('es-MX');
    if (subCap) subCap.textContent = subtotalCapsulas.toLocaleString('es-MX');
    if (totalMod) totalMod.textContent = total.toLocaleString('es-MX');
}

function agregarAlCarrito() {
    const cantLiquido = parseInt(document.getElementById('cantidad-liquido').value) || 0;
    const cantCapsulas = parseInt(document.getElementById('cantidad-capsulas').value) || 0;
    
    if (cantLiquido > 0) {
        carrito.agregar(productoActualCompra, 'Líquido', cantLiquido);
    }
    
    if (cantCapsulas > 0) {
        carrito.agregar(productoActualCompra, 'Cápsulas', cantCapsulas);
    }
    
    cerrarModalCompra();
}

// ========== CONTROLES DEL CARRITO ==========
function abrirCarrito() {
    const modal = document.getElementById('modal-carrito');
    const popup = document.getElementById('popup-continuarCompra');
    
    if (modal) {
        mostrarListaCarrito();
        modal.style.display = 'flex';
    }
    
    if (popup) {
        popup.style.display = 'none';
    }
}

function cerrarCarrito() {
    const modal = document.getElementById('modal-carrito');
    if (modal) modal.style.display = 'none';
}

function cerrarPopupCompra() {
    const popup = document.getElementById('popup-continuarCompra');
    if (popup) popup.style.display = 'none';
}

function mostrarListaCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalDiv = document.getElementById('total-carrito');
    
    if (!lista) return;
    
    if (carrito.items.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Tu carrito está vacío</p>';
        if (totalDiv) totalDiv.style.display = 'none';
        return;
    }
    
    if (totalDiv) totalDiv.style.display = 'block';
    
    lista.innerHTML = carrito.items.map(item => `
        <div class="carrito-item">
            <div class="carrito-info">
                <strong>${item.nombre}</strong>
                <small>${item.tipo}</small>
            </div>
            <div class="carrito-controles">
                <button onclick="carrito.cambiarCantidad(${item.id}, -1)" class="cantidad-btn">−</button>
                <input type="number" value="${item.cantidad}" readonly style="width: 50px; text-align: center; border: 2px solid #3b7c6c; border-radius: 6px; padding: 4px;">
                <button onclick="carrito.cambiarCantidad(${item.id}, 1)" class="cantidad-btn">+</button>
            </div>
            <div class="carrito-precio">
                <p style="margin: 0; font-weight: bold; color: #24594a;">$${(item.precio * item.cantidad).toLocaleString('es-MX')}</p>
                <small style="color: #999;">$${item.precio.toLocaleString('es-MX')} c/u</small>
            </div>
            <button onclick="carrito.eliminar(${item.id})" class="carrito-eliminar">✕</button>
        </div>
    `).join('');
    
    const total = carrito.obtenerTotal();
    if (totalDiv) {
        totalDiv.innerHTML = `
            <div style="border-top: 2px solid #ddd; padding-top: 15px; margin-top: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.2em;">
                    <strong>Total:</strong>
                    <span style="color: #24594a; font-weight: bold;">$${total.toLocaleString('es-MX')} MXN</span>
                </div>
            </div>
        `;
    }
}

function procederCompra() {
    if (carrito.items.length === 0) return;
    window.location.href = 'tienda-capsulas.html';
}

function renderResumenCompra() {
    const lista = document.getElementById('checkout-resumen');
    const total = document.getElementById('checkout-total');
    const mensaje = document.getElementById('checkout-mensaje');
    const botonWhatsApp = document.getElementById('checkout-whatsapp-btn');
    const estadoVacio = document.getElementById('checkout-empty');

    if (!lista || !total || !mensaje || !botonWhatsApp) return;

    carrito.cargar();
    const itemsAgrupados = carrito.obtenerItemsAgrupados();

    if (itemsAgrupados.length === 0) {
        lista.innerHTML = '';
        total.textContent = '$0 MXN';
        mensaje.textContent = 'Tu carrito esta vacio por ahora.';
        botonWhatsApp.style.display = 'none';
        if (estadoVacio) estadoVacio.style.display = 'block';
        return;
    }

    if (estadoVacio) estadoVacio.style.display = 'none';

    lista.innerHTML = itemsAgrupados.map(item => `
        <div class="checkout-item">
            <div>
                <strong>${item.nombre}</strong>
                <div class="checkout-meta">${item.tipo}</div>
                <div class="checkout-inline-controls">
                    <button class="cantidad-btn" onclick='carrito.cambiarCantidadAgrupada(${JSON.stringify(item.nombre)}, ${JSON.stringify(item.tipo)}, -1)'>−</button>
                    <input type="number" value="${item.cantidad}" readonly>
                    <button class="cantidad-btn" onclick='carrito.cambiarCantidadAgrupada(${JSON.stringify(item.nombre)}, ${JSON.stringify(item.tipo)}, 1)'>+</button>
                </div>
            </div>
            <div class="checkout-meta">$${(item.precio * item.cantidad).toLocaleString('es-MX')} MXN</div>
        </div>
    `).join('');

    total.textContent = `$${carrito.obtenerTotal().toLocaleString('es-MX')} MXN`;
    mensaje.textContent = carrito.generarMensajePedido();
    botonWhatsApp.href = carrito.obtenerWhatsAppUrl();
    botonWhatsApp.style.display = 'inline-flex';
}

// ========== INICIALIZACIÓN Y EVENTOS ==========
window.addEventListener('load', function() {
    carrito.cargar();
    renderResumenCompra();
});

// Cerrar modales al hacer click en el fondo
window.addEventListener('click', function(e) {
    const modalCarrito = document.getElementById('modal-carrito');
    const popup = document.getElementById('popup-continuarCompra');
    const modalCompra = document.getElementById('modal-compra');
    
    if (e.target === modalCarrito) cerrarCarrito();
    if (e.target === popup) cerrarPopupCompra();
    if (e.target === modalCompra) cerrarModalCompra();
});
