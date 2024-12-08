// Crear la tabla de Tabulator
export function crearTabla(datos) {
    return new Tabulator("#plantasTabla", {
        data: datos,
        layout: "fitColumns",  // Ajuste de las columnas
        responsiveLayout: "hide",  // Ocultar columnas en pantallas pequeñas
        pagination: "local",  // Paginación local
        paginationSize: 10,
        movableColumns: true,
        resizableRows: true,
        columns: obtenerColumnasTabla(),
        groupBy: ["Familia", "Genero"],  // Agrupar por Familia y Género
        groupHeader: function(value, count, data, group) { 
            return value;  // Deja el nombre del grupo visible, pero sin columnas adicionales
        },
        initialSort: [
            { column: "Familia", dir: "asc" },
            { column: "Genero", dir: "asc" }
        ],
        scrollHorizontal: true,
    });
}

// Definir columnas para la tabla
function obtenerColumnasTabla() {
    return [
        { title: "Familia", field: "Familia", visible:false },
        { title: "Género", field: "Genero", visible:false  },
        { title: "Nombre Científico", field: "Nombre Cientifico" },
        { title: "Nombre Común", field: "Nombre comun" },
        { title: "Categoría", field: "Categoria" },
        { title: "Variedades", field: "Variedades", visible: false },
        { title: "Tamaño", field: "Tamano", formatter: convertirALista },
        { title: "Hábitat", field: "Habitat", formatter: convertirALista},
        { title: "Precio por Unidad (S/.)", field: "Precio por Unidad (S/)", visible: false },
        { title: "Precio por Docena (S/.)", field: "Precio por Docena  (S/)", visible: false },
        { title: "Precio por Ciento (S/.)", field: "Precio por Ciento  (S/)", visible: false },
        { title: "Precio por Millar (S/.)", field: "Precio por Millar  (S/)", visible: false },
        { title: "Estado de Stock", field: "Estado de Stock" },
        { title: "Observación", field: "Observacion", visible: false },
    ];
}

function convertirALista(cell) {
    const values = cell.getValue(); // Obtener el valor de la celda (que es ahora un array)
    const ul = document.createElement('ul'); // Crear una lista desordenada (ul)

    values.forEach(value => {
        const li = document.createElement('li'); // Crear un item de lista (li)
        li.textContent = value; // Asignar el valor del item
        ul.appendChild(li); // Añadir el item a la lista
    });

    return ul; // Devolver la lista para renderizarla
}
