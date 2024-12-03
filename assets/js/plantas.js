// Escuchar cuando la página esté completamente cargada
document.addEventListener('DOMContentLoaded', function() {

    // Variables de la pagina
    var tablaPlantas;

    // Función para cargar el archivo CSV y analizarlo con PapaParse
    function cargarCSVYCrearTabla() {

        // Obtener el archivo CSV de la carpeta "assets"
        fetch('assets/data/plantas.csv')
            .then(respuesta => respuesta.text()) // Leer el archivo como texto
            .then(textoCSV => {
                console.log(`plantas encontradas`,textoCSV);
                // Usar PapaParse para analizar el texto del CSV
                Papa.parse(textoCSV, {
                    complete: function(resultados) {
                        // Crear la tabla de Tabulator con los datos analizados
                        console.log("archivo parsed", resultados);
                        crearTablaTabulator(resultados.data);
                    },
                    header: true,  // Usar la primera fila como los encabezados de las columnas
                });
            })
            .catch(error => {
                console.error('Error al cargar el archivo CSV:', error);
            });
    }

    // Función para crear la tabla de Tabulator
    function crearTablaTabulator(datos) {
        tablaPlantas = new Tabulator("#plantasTabla", {
            data: datos,          // Datos para la tabla (del CSV)
            layout: "fitColumns", // Ajustar automáticamente las columnas al ancho de la pantalla
            responsiveLayout: "hide",  // Ocultar columnas en pantallas más pequeñas
            pagination: "local",  // Habilitar paginación local
            paginationSize: 10,   // Número de filas por página
            movableColumns: true, // Permitir mover columnas
            resizableRows: true,  // Permitir redimensionar filas
            columns: [  // Definir las columnas explícitamente
                { title: "Familia", field: "Familia" },
                { title: "Género", field: "Genero" },
                { title: "Nombre Científico", field: "Nombre Cientifico" },
                { title: "Nombre Común", field: "Nombre comun" },
                { title: "Categoría", field: "Categoria" },
                { title: "Variedades", field: "Variedades" },
                { title: "Tamaño", field: "Tamano" },
                { title: "Exposición al Sol", field: "Exposicion al sol" },
                { title: "Precio por Unidad (S/.)", field: "Precio por Unidad (S/)" , visible: false},
                { title: "Precio por Docena (S/.)", field: "Precio por Docena  (S/)", visible: false },
                { title: "Precio por Ciento (S/.)", field: "Precio por Ciento  (S/)", visible: false },
                { title: "Precio por Millar (S/.)", field: "Precio por Millar  (S/)", visible: false },
                { title: "Estado de Stock", field: "Estado de Stock" },
                { title: "Observación", field: "Observacion" }
            ]
        });
    }

    // Llamar a la función para cargar el CSV y crear la tabla
    cargarCSVYCrearTabla();

    // Agregar un EventListener al input para realizar la búsqueda
    var inputBuscar = document.getElementById('buscarPlantaInput'); // Assuming the input has the id 'buscarPlantaInput'
    inputBuscar.addEventListener('input', function() {
        var searchTerm = inputBuscar.value.toLowerCase(); // Get the value from the input and convert to lowercase
        tablaPlantas.getColumns().forEach(function(column) { // Iterate over all columns
            tablaPlantas.setFilter(column.getField(), 'like', searchTerm); // Apply the filter on each column
        });
    });


});
