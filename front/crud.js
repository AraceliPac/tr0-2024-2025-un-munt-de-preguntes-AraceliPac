//CRUD
document.getElementById("listarBtn").addEventListener("click", function () {
    llistar()
});;
document.getElementById("insertarBtn").addEventListener("click", function () {
    insertar();
});
document.getElementById("listarBtn").addEventListener('click', () => {
    document.getElementById("preguntas-container").classList.toggle("oculto")
})

async function insertar() {
    try {
        let dadesPregunta = await demanarDadesPregunta();
        console.log(dadesPregunta)
        if (dadesPregunta) {
            const response = await fetch('../back/insertar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadesPregunta)
            });
            const data = await response.json();
            if (data.success) {
                alert(data.success); // Muestra mensaje de inserción correcta
            } else if (data.error) {
                alert(data.error); // Muestra mensaje de error
            }
        }
    } catch (error) {
        console.log(error);
        alert('Se produjo un error al procesar la solicitud.'); // Mensaje de error genérico
    }
}
function demanarDadesPregunta() {
    return new Promise(function (resolve) {
        const divInsertar = document.getElementById('insertar');
        const formI = `
        <form id="form-pregunta">
            <label for="pregunta">Pregunta:</label>
            <input type="text" id="pregunta" name="pregunta" required><br><br>

            <label for="imagen">Link imagen:</label>
            <input type="text" id="imagen" name="imagen" required><br><br>

            <label for="r1">Opción 1:</label>
            <input type="text" id="r1" name="r1" required><br><br>

             <label for="r2">Opción 2:</label>
            <input type="text" id="r2" name="r2" required><br><br>

             <label for="r3">Opción 3:</label>
            <input type="text" id="r3" name="r3" required><br><br>

            <label for="r4">Opción 4:</label>
            <input type="text" id="r4" name="r4" required><br><br>

            <label for="valorCorrecta">Escribe la opción correcta:</label>
            <input type="text" id="valorCorrecta" name="valorCorrecta" required><br><br>

            <button id="insertarBtn" type="submit">Insertar</button>
        </form>
    `;
        divInsertar.innerHTML = formI;

        document.getElementById('form-pregunta').addEventListener('submit', function (e) {
            e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
            // Obtener los valores ingresados por el usuario
            let pregunta = document.getElementById('pregunta').value;
            let img = document.getElementById('imagen').value;
            let r1 = document.getElementById('r1').value;
            let r2 = document.getElementById('r2').value;
            let r3 = document.getElementById('r3').value;
            let r4 = document.getElementById('r4').value;
            let correcta = document.getElementById('valorCorrecta').value;
            // Crear el objeto con los datos del jugador
            let dadesPregunta = {
                enunciar: pregunta,
                imagen, img,
                opcio1: r1,
                opcio2: r2,
                opcio3: r3,
                opcio4: r4,
                valorCorrecta: correcta
            };
            // Resolver la promesa con los datos del jugador
            resolve(dadesPregunta);
        });

        document.getElementById("form-pregunta").addEventListener('submit', () => {
            document.getElementById("form-pregunta").classList.toggle("oculto")
        })
        document.getElementById("insertarBtn").addEventListener('click', () => {
            document.getElementById("form-pregunta").classList.toggle("oculto")
        })

    });
}


function llistar() {
    fetch('../back/cargarDades.php')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Limpiar cualquier contenido previo en el contenedor donde se mostrarán los enunciados
            const container = document.getElementById('preguntas-container'); // Asegúrate de tener un contenedor con este ID
            if (!container) {
                console.error("Contenedor no trobat"); // Manejo de error si no se encuentra el contenedor
                return;
            }
            container.innerHTML = ''; // Limpiar el contenedor

            // Verificar si hay un error en la respuesta
            if (data.error) {
                console.error(data.error);
                container.innerHTML = `<p>${data.error}</p>`;
                return;
            }

            // Verificar si hay preguntas
            if (data.preguntes && data.preguntes.length > 0) {
                // Iterar sobre las preguntas y crear una lista
                data.preguntes.forEach(function (pregunta) {
                    const enunciado = pregunta.enunciado; // Obtener el enunciado de la pregunta

                    // Crear un contenedor para la pregunta
                    const listItem = document.createElement('li');

                    // Crear un div para el enunciado
                    const enunciadoDiv = document.createElement('div');
                    enunciadoDiv.classList.add('pregunta'); // Añadir clase para el estilo
                    enunciadoDiv.textContent = enunciado; // Asignar el texto del enunciado
                    listItem.appendChild(enunciadoDiv); // Añadir el div del enunciado al li

                    // Crear un contenedor para los botones
                    const buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('botones'); // Añadir clase para el estilo

                    // Crear el botón de modificar
                    const btnModificar = document.createElement('button');
                    btnModificar.textContent = 'Modificar';
                    btnModificar.onclick = function () {
                        editar(pregunta.id); // Llama a la función para modificar la pregunta
                    };
                    buttonContainer.appendChild(btnModificar); // Añadir el botón de modificar al contenedor

                    // Crear el botón de eliminar
                    const btnEliminar = document.createElement('button');
                    btnEliminar.textContent = 'Eliminar';
                    btnEliminar.onclick = function () {
                        eliminar(pregunta.id); // Llama a la función para eliminar la pregunta
                    };
                    buttonContainer.appendChild(btnEliminar); // Añadir el botón de eliminar al contenedor

                    // Añadir el contenedor de botones al list item
                    listItem.appendChild(buttonContainer);

                    // Añadir el elemento al contenedor principal
                    container.appendChild(listItem);
                });
            } else {
                container.innerHTML = '<p>No hi ha preguntes a la base de dades.</p>';
            }
        })
        .catch(function (error) {
            console.error('Error al cargar las preguntas:', error);
        });
}




async function editar(idPregunta) {
    try {
        const response = await fetch('../back/cargarDades.php'); //demanar dades preg
        const data = await response.json();

        let preguntaSeleccionada = null;
        for (let i = 0; i < data.preguntes.length; i++) {
            if (data.preguntes[i].id === idPregunta) {
                preguntaSeleccionada = data.preguntes[i];
                break;
            }
        }

        if (preguntaSeleccionada) {
            crearFormEditar(preguntaSeleccionada);
        } else {
            console.error('Pregunta no encontrada');
        }
    } catch (error) {
        console.error('Error al editar la pregunta:', error);
    }

}

function crearFormEditar(pregunta) {
    const container = document.getElementById('preguntas-container');
    container.innerHTML = '';

    const form = document.createElement('form'); // Crear formulario
    form.id = 'form-editar';

    // Crear el campo enunciado
    const labelEnunciado = document.createElement('label');
    labelEnunciado.setAttribute('for', 'enunciado');
    labelEnunciado.textContent = 'Enunciado:';

    const inputEnunciado = document.createElement('input');
    inputEnunciado.type = 'text';
    inputEnunciado.id = 'enunciado';
    inputEnunciado.name = 'enunciado';
    inputEnunciado.value = pregunta.enunciado; // Colocar el valor actual del enunciado

    // Crear el campo para la URL de la imagen
    const labelUrlImagen = document.createElement('label');
    labelUrlImagen.setAttribute('for', 'url-imagen');
    labelUrlImagen.textContent = 'URL de la imagen:';

    const inputUrlImagen = document.createElement('input');
    inputUrlImagen.type = 'text';
    inputUrlImagen.id = 'url-imagen';
    inputUrlImagen.name = 'url-imagen';
    inputUrlImagen.value = pregunta.imagen; // Colocar el valor actual de la URL de la imagen

    // Crear respuestas
    const respuestasDiv = document.createElement('div');
    respuestasDiv.id = 'respuestas';

    // Recorrer las respuestas y mostrar inputs con checkbox de correcta/incorrecta
    pregunta.respostes.forEach((respuesta, index) => {
        // Input de texto para la respuesta
        const respuestaInput = document.createElement('input');
        respuestaInput.type = 'text';
        respuestaInput.value = respuesta.enunciado;
        respuestaInput.id = `respuesta${index + 1}`;

        // Checkbox para marcar si es correcta
        const labelCheckbox = document.createElement('label');
        labelCheckbox.textContent = 'Correcta';

        const respuestaCheckbox = document.createElement('input');
        respuestaCheckbox.type = 'checkbox';
        respuestaCheckbox.checked = respuesta.correcta == 1; // Marcar si la respuesta es correcta
        respuestaCheckbox.id = `correcta${index + 1}`;

        // Evento para que solo se permita un checkbox seleccionado
        respuestaCheckbox.onclick = function () {
            // Deseleccionar todos los demás checkboxes cuando se selecciona uno
            const allCheckboxes = respuestasDiv.querySelectorAll('input[type="checkbox"]');
            allCheckboxes.forEach(checkbox => {
                if (checkbox !== respuestaCheckbox) {
                    checkbox.checked = false; // Deseleccionar los demás
                }
            });
        };

        // Agregar al div de respuestas
        respuestasDiv.appendChild(respuestaInput);
        respuestasDiv.appendChild(labelCheckbox);
        respuestasDiv.appendChild(respuestaCheckbox);
        respuestasDiv.appendChild(document.createElement('br'));
    });

    // Crear el botón para guardar
    const botonGuardar = document.createElement('button');
    botonGuardar.type = 'submit';
    botonGuardar.textContent = 'Guardar cambios';

    // Llamar a la función para guardar cambios al enviar el formulario
    form.onsubmit = async function (event) {
        event.preventDefault(); // Evitar envío tradicional del formulario
        guardarCambios(pregunta.id);
        // console.log(pregunta.id);
    };

    // Agregar todos los elementos al formulario
    form.appendChild(labelEnunciado);
    form.appendChild(inputEnunciado);
    form.appendChild(labelUrlImagen); // Agregar el nuevo campo
    form.appendChild(inputUrlImagen); // Agregar el nuevo campo
    form.appendChild(respuestasDiv);
    form.appendChild(botonGuardar);

    // Insertar el formulario en el contenedor
    container.appendChild(form);
}


async function guardarCambios(idPregunta) {
    const enunciado = document.getElementById('enunciado').value;
    const imagen = document.getElementById('url-imagen').value; // Obtener el valor de la URL de la imagen
    const respuestas = [];

    // Asegúrate de que estás obteniendo correctamente el contenedor de respuestas
    const respuestasDiv = document.getElementById('respuestas');

    // Verifica que respuestasDiv se haya encontrado
    if (!respuestasDiv) {
        console.error("El contenedor de respuestas no se ha encontrado.");
        return; // Sal de la función si no se encuentra
    }

    // Recoger las respuestas y el estado de correcta/incorrecta
    for (let i = 0; i < respuestasDiv.children.length; i += 4) { // Saltamos de 4 en 4, ya que hay un <br> después del checkbox
        const inputRespuesta = respuestasDiv.children[i];
        const inputCheckbox = respuestasDiv.children[i + 2]; // El checkbox está dos elementos después del input de respuesta

        if (inputRespuesta && inputCheckbox) {
            respuestas.push({
                enunciado: inputRespuesta.value,
                correcta: inputCheckbox.checked ? 1 : 0 // Marcar como correcta si está seleccionado
            });
        }
    }

    try {
        const response = await fetch('../back/modificar.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: idPregunta,
                enunciado: enunciado,
                imagen: imagen, // Añadir la URL de la imagen a los datos enviados
                respuestas: respuestas
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Cambios guardados correctamente');
            llistar(); // Recargar la lista de preguntas
        } else if (data.error) {
            alert('Error al guardar los cambios: ' + data.error);
        }
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
    }
}


async function eliminar(pregunta) {

    try {
        if (pregunta) {
            // Enviar el objeto pregunta como JSON en la petición
            const response = await fetch('../back/eliminar.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: pregunta }) // ID pregunta
            });

            const data = await response.json(); // respuesta del servidor

            if (data.success) {
                alert(data.success);
            } else if (data.error) {
                alert(data.error);
            }
        }
        llistar()
    } catch (error) {
        console.log(error);
        alert('Se produjo un error al procesar la solicitud.');
    }
}
