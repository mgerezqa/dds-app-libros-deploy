document.addEventListener('DOMContentLoaded', function () {
    const libroForm = document.getElementById('libroForm');
    const librosTableBody = document.getElementById('librosTable').querySelector('tbody');
    const listarLibrosBtn = document.getElementById('listarLibrosBtn');

    libroForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const autor = document.getElementById('autor').value;
        const precio = document.getElementById('precio').value;

        fetch('http://localhost:8070/libros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: nombre,
                autor: autor,
                precio: parseInt(precio)
            }),
        })
            .then(response => response.json())
            .then(libro => {
                // Añadir el nuevo libro a la tabla
                addLibroToTable(libro);
                libroForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

    listarLibrosBtn.addEventListener('click', function () {
        fetch('http://localhost:8070/libros')
            .then(response => response.json())
            .then(libros => {
                // Limpiar la tabla antes de listar los libros
                librosTableBody.innerHTML = '';
                libros.forEach(libro => addLibroToTable(libro));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

    function addLibroToTable(libro) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${libro.nombre}</td>
            <td>${libro.autor}</td>
            <td>${libro.precio}</td>
        `;
        librosTableBody.appendChild(row);
    }
});
