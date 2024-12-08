import { crearTabla } from "./plantasData.js";

document.addEventListener('DOMContentLoaded', async () => {

    // Variables de la página
    const inputBuscar = document.getElementById('buscarPlantaInput');
    let tablaPlantas;

    // Cargar datos CSV y crear la tabla
    async function cargarCSVYCrearTabla() {
        try {
            const datosCSV = await obtenerDatosCSV('assets/data/plantas.csv');
            const datosFiltrados = filtrarDatos(datosCSV);
            const datosDivididos = transformarColumnasEnListas(datosFiltrados);
            console.log(datosDivididos);
            tablaPlantas = crearTabla(datosDivididos);
            await inicializarTabla();
        } catch (error) {
            console.error('Error al cargar el archivo CSV:', error);
        }
    }

    // Obtener datos CSV
    async function obtenerDatosCSV(url) {
        const respuesta = await fetch(url);
        const textoCSV = await respuesta.text();
        return parseCSV(textoCSV);
    }

    // Parsear CSV con PapaParse
    function parseCSV(textoCSV) {
        return new Promise((resolve, reject) => {
            Papa.parse(textoCSV, {
                complete: (resultados) => resolve(resultados.data),
                error: reject,
                header: true,
            });
        });
    }

    // Filtrar filas vacías o inválidas
    function filtrarDatos(datos) {
        return datos.filter(row => Object.values(row).some(value => value.trim() !== ''));
    }

    
    // Transformar la columna "Hábitat" en una lista
    function transformarColumnasEnListas(datos) {

        // Columnas a transformar en listas
        const columnasConListas = ["Tamano", "Habitat"];
    
        return datos.map(row => {
            // Iterar sobre las columnas que deben ser listas
            columnasConListas.forEach(columna => {
                if (row[columna]) {
                    // Dividir el contenido de la columna por un delimitador y crear un array
                    row[columna] = row[columna].split('/').map(item => item.trim());
                }
            });
            return row;
        });
    }
    

    // Inicializar la tabla y configurar eventos
    async function inicializarTabla() {
        tablaPlantas.on("tableBuilt", () => {
            crearFiltros();
        });
    }

    // Filtrar por texto de búsqueda
    inputBuscar.addEventListener('input', () => {
        const query = inputBuscar.value.trim().toLowerCase();
        aplicarFiltroBusqueda(query);
    });

    // Aplicar filtro de búsqueda a todas las columnas
    function aplicarFiltroBusqueda(query) {
        tablaPlantas.clearFilter();
        tablaPlantas.addFilter(data => {
            return Object.values(data).some(value =>
                String(value).toLowerCase().includes(query)
            );
        });
    }

    // Crear filtros basados en columnas específicas
    function crearFiltros() {
        const columnasFiltro = ["Familia", "Genero", "Habitat"];
        const columnasFiltradas = obtenerColumnasFiltradas(columnasFiltro);

        const filterContainer = document.getElementById('filtrosChecks');
        filterContainer.innerHTML = ''; // Limpiar filtros existentes

        columnasFiltradas.forEach((columna, index) => {
            const filtroDiv = crearFiltroPorColumna(columna, index);
            filterContainer.appendChild(filtroDiv);
        });
    }

    // Obtener columnas filtradas basadas en una lista
    function obtenerColumnasFiltradas(columnasFiltro) {
        const todasColumnas = tablaPlantas.getColumns();
        return todasColumnas.filter(col => columnasFiltro.includes(col.getField()));
    }

    // Crear un filtro para una columna
    function crearFiltroPorColumna(columna, index) {

        // Crear titulo de filtro
        const filterDiv = document.createElement('div');
        const heading = document.createElement('h1');
        heading.classList.add('site-heading-upper');
        heading.textContent = columna.getDefinition().title;
        filterDiv.appendChild(heading);

        // Obtener valores unicos de la columna
        const columnaNombre = columna.getField();
        const uniqueValues = obtenerValoresUnicos(columnaNombre);

        // Crear checkbox para cada valor unico
        uniqueValues.forEach((value, idx) => {
            const checkboxWrapper = crearCheckbox(value, columnaNombre, idx);
            filterDiv.appendChild(checkboxWrapper);
        });

        return filterDiv;
    }

   // Obtener valores únicos en las columnas. Cada elemento ya es un array.
    function obtenerValoresUnicos(columnaNombre) {
        return [...new Set(
            tablaPlantas.getData()
                .map(row => row[columnaNombre])         // Obtener la columna que ya es un array
                .flat()                                  // Aplanar los arrays (hacer una lista de todos los elementos de las listas)
                .map(value => value.trim())              // Eliminar los espacios en blanco
        )];
    }
        

    // Crear un checkbox para un valor único
    function crearCheckbox(value, columnaNombre, index) {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.id = `listaChecks-${columnaNombre}`;
        checkboxWrapper.classList.add('form-check');

        // Crear checkbox
        const checkbox = document.createElement('input');
        checkbox.id = `formCheck-${columnaNombre}-${index}`;
        checkbox.classList.add('form-check-input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;

        // Crear descripcion de checkbox
        const label = document.createElement('label');
        label.classList.add('form-check-label');
        label.setAttribute('for', checkbox.id);
        label.textContent = value;

        // Añadir a html
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);

        // Añadir evento al check
        checkbox.addEventListener('change', () => actualizarFiltroColumna(columnaNombre));

        return checkboxWrapper;
    }

    // Función para actualizar el filtro de una columna específica
    function actualizarFiltroColumna(columnaNombre) {
        const filterFunction = function(data) {
            return customFilter(data, columnaNombre); // Llamar al filtro personalizado para la columna
        };
        
        // Aplicar el filtro a la columna específica
        tablaPlantas.setFilter(filtroPersonalizado,{columnaNombre:columnaNombre});
    }

    // Filtro personalizado para comparar si alguno de los valores seleccionados está presente en la columna (array)
    function filtroPersonalizado (data, parametros){
        //data - the data for the row being filtered
        //parametros - params object passed to the filter

        const valueArray = data[parametros.columnaNombre]; // El valor de la columna es un array (por ejemplo, ["forest", "river"])
        const selectedValues = obtenerValoresSeleccionados(parametros.columnaNombre); // Obtener los valores seleccionados de los checkboxes

        // Comprobar si al menos uno de los valores seleccionados está presente en el array de la columna
        return selectedValues.some(val => valueArray.includes(val));


    }


    // Obtener los valores seleccionados de los checkboxes
    function obtenerValoresSeleccionados(columnaNombre) {
        const checkboxes = document.querySelectorAll(`#listaChecks-${columnaNombre} input[type="checkbox"]`);
        return Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.nextElementSibling.textContent);
    }

    // Llamar a la función para cargar los datos y crear la tabla
    await cargarCSVYCrearTabla();

});
