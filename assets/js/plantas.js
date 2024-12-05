









// Escuchar cuando la página esté completamente cargada
document.addEventListener('DOMContentLoaded', async function() {

    // Variables de la pagina
    var tablaPlantas;
    var inputBuscar = document.getElementById('buscarPlantaInput'); 


    // #region Crear tabla
    
    async function cargarCSVYCrearTabla() {
        try {
            const respuesta = await fetch('assets/data/plantas.csv');
            const textoCSV = await respuesta.text();
            console.log(`plantas encontradas`, textoCSV);

            // Parse data
            const resultados = await new Promise((resolve, reject) => {
                Papa.parse(textoCSV, {
                    complete: (resultados) => resolve(resultados),
                    error: (error) => reject(error),
                    header: true,
                });
            });

            console.log("data encontrada", resultados.data);

            // Filter out empty or invalid rows
            const dataFiltrada = resultados.data.filter(row => {
                // Check if the row has at least one non-empty value (you can adjust the logic as needed)
                return Object.values(row).some(value => value.trim() !== '');
            });

            // Create the table
            tablaPlantas = new Tabulator("#plantasTabla", {
                data: dataFiltrada,  // Use the filtered data
                layout: "fitColumns",
                responsiveLayout: "hide",
                pagination: "local",
                paginationSize: 10,
                movableColumns: true,
                resizableRows: true,
                columns: [
                    { title: "Familia", field: "Familia" },
                    { title: "Género", field: "Genero" },
                    { title: "Nombre Científico", field: "Nombre Cientifico" },
                    { title: "Nombre Común", field: "Nombre comun" },
                    { title: "Categoría", field: "Categoria" },
                    { title: "Variedades", field: "Variedades", visible: false },
                    { title: "Tamaño", field: "Tamano" },
                    { title: "Exposición al Sol", field: "Exposicion al sol" },
                    { title: "Precio por Unidad (S/.)", field: "Precio por Unidad (S/)", visible: false },
                    { title: "Precio por Docena (S/.)", field: "Precio por Docena  (S/)", visible: false },
                    { title: "Precio por Ciento (S/.)", field: "Precio por Ciento  (S/)", visible: false },
                    { title: "Precio por Millar (S/.)", field: "Precio por Millar  (S/)", visible: false },
                    { title: "Estado de Stock", field: "Estado de Stock" },
                    { title: "Observación", field: "Observacion", visible: false }
                ]
            });

             // Wait for table initialization (table built event)
            tablaPlantas.on("tableBuilt", function() {
                // This event fires after the table has finished rendering
                console.log("Tabla completamente cargada", tablaPlantas.getData());

                // Continue with your next steps, e.g. calling createFilterElements()
                createFilterElements();
            });

        } catch (error) {
            console.error('Error al cargar el archivo CSV:', error);
        }
    
    };
    
    
    // #endregion
    
    // #region Crear filtros
    inputBuscar.addEventListener('input', function() {
        var query = inputBuscar.value.trim(); // Obtener el texto del input y eliminar espacios al inicio y al final
    
        // Limpiar todos los filtros anteriores
        tablaPlantas.clearFilter();
    
        console.log("tablaPlantas", tablaPlantas.getData());

        tablaPlantas.addFilter(function(data) {
            // Realizar la búsqueda global comparando el texto con los valores de todas las columnas
            return Object.values(data).some(value => 
                String(value).toLowerCase().includes(query.toLowerCase())
            );
        });

    });

    // Funcion que crea filtros basados en las columnas vacias
    function createFilterElements() {
        const filterContainer = document.getElementById('filtrosChecks');
        filterContainer.innerHTML = ''; // Clear any existing filters

        // Get the list of visible columns
        console.log("tabla de plantas", tablaPlantas.getData());
        const todasColumnas =tablaPlantas.getColumns();
        const visibleColumns = todasColumnas.filter(col => col.isVisible());
        console.log("columnas visibles",visibleColumns)

        // Iterate through each visible column
        visibleColumns.forEach((column, index) => {
            const columnTitle = column.getDefinition().title;
            const columnField = column.getField();

            // Create a container for the filter
            const filterDiv = document.createElement('div');

            // Create the heading for the filter
            const heading = document.createElement('h1');
            heading.classList.add('site-heading-upper');
            heading.textContent = columnTitle;

            // Append the heading to the filter container
            filterDiv.appendChild(heading);

            // Create a list of distinct values for the checkboxes
            const uniqueValues = [...new Set(tablaPlantas.getData().map(row => row[columnField]))];

            // Create a checkbox for each unique value in the column
            uniqueValues.forEach((value, index) => {
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.classList.add('form-check');

                // Create checkbox input
                const checkbox = document.createElement('input');
                checkbox.id = `formCheck-${columnField}-${index}`;
                checkbox.classList.add('form-check-input');
                checkbox.type = 'checkbox';
                checkbox.checked = true;  // Initially checked

                // Create checkbox label
                const label = document.createElement('label');
                label.classList.add('form-check-label');
                label.setAttribute('for', checkbox.id);
                label.textContent = value;

                // Append checkbox and label to wrapper
                checkboxWrapper.appendChild(checkbox);
                checkboxWrapper.appendChild(label);

                // Append the wrapper to the filter div
                filterDiv.appendChild(checkboxWrapper);

                // Add event listener to update filter when checkbox is toggled
                checkbox.addEventListener('change', function() {
                    updateColumnFilter(columnField, uniqueValues);
                });
            });

            // Append the filter div to the filter container
            filterContainer.appendChild(filterDiv);
        });
    }

    // Function to update the filter for a specific column based on checked checkboxes
    function updateColumnFilter(columnField, uniqueValues) {
        const checkboxes = document.querySelectorAll(`#filtrosChecks input[type="checkbox"]`);
        
        // Get the selected values from the checkboxes
        const selectedValues = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const label = checkbox.nextElementSibling;
                selectedValues.push(label.textContent);
            }
        });

        // Apply the filter to the Tabulator table based on selected values
        tablaPlantas.setFilter(columnField, "in", selectedValues);
    }

    // #endregion


    // Llamar a la función para cargar el CSV y crear la tabla
    await cargarCSVYCrearTabla();



});
