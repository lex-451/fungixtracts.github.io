// Carrusel de imágenes con zoom para productos FungiXtract
// Requiere: <div class="carrusel-producto"> con varias <img>

function iniciarCarruselProducto(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    const imagenes = contenedor.querySelectorAll('img');
    let actual = 0;

    // Crear controles
    const btnPrev = document.createElement('button');
    btnPrev.textContent = '‹';
    btnPrev.className = 'carrusel-prev';
    const btnNext = document.createElement('button');
    btnNext.textContent = '›';
    btnNext.className = 'carrusel-next';
    contenedor.appendChild(btnPrev);
    contenedor.appendChild(btnNext);

    // Zoom automático al pasar el mouse y mover el zoom con el mouse
    imagenes.forEach(img => {
        img.addEventListener('mousemove', function(e) {
            img.classList.add('zoom');
            const rect = img.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            img.style.transformOrigin = `${x}% ${y}%`;
        });
        img.addEventListener('mouseleave', function() {
            img.classList.remove('zoom');
            img.style.transformOrigin = '';
        });
    });

    function mostrarImagen(idx) {
        imagenes.forEach((img, i) => {
            img.style.display = (i === idx) ? 'block' : 'none';
            img.classList.remove('zoom');
        });
    }
    mostrarImagen(actual);

    btnPrev.onclick = function() {
        actual = (actual - 1 + imagenes.length) % imagenes.length;
        mostrarImagen(actual);
    };
    btnNext.onclick = function() {
        actual = (actual + 1) % imagenes.length;
        mostrarImagen(actual);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('carrusel-coladepavo')) {
        iniciarCarruselProducto('carrusel-coladepavo');
    }
    if (document.getElementById('carrusel-cordyceps')) {
        iniciarCarruselProducto('carrusel-cordyceps');
    }
    if (document.getElementById('carrusel-reishi')) {
        iniciarCarruselProducto('carrusel-reishi');
    }
    if (document.getElementById('carrusel-melena')) {
        iniciarCarruselProducto('carrusel-melena');
    }
});
