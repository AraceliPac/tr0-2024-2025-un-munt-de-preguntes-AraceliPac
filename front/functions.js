import "./crud.js";
console.log("Funciones cargadas");
document.getElementById("administrarBtn").addEventListener('click', () => {
    document.getElementById("adminButtons").classList.toggle("oculto")
})




async function migrarDades() {
    fetch('../back/migrate.php')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            //console.log(data);
        });
}

function cargarDades() {
    fetch('../back/cargarDades.php')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log("Ordenadas")
            // console.log(data);
        });
}

async function jugar() {
    try {
        let dadesJugador = await demanarDadesJugador();
        if (dadesJugador) {
            fetch('../back/getPreguntes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadesJugador)
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);
                    mostrarPreguntes(data, dadesJugador);
                })
                .catch(function (error) {
                    console.error("Error en el fetch: ", error);
                });
        }
    } catch (error) {
        console.log(error);
    }
}

function demanarDadesJugador() {
    return new Promise(function (resolve) {
        const divPartida = document.getElementById('partida');
        const formHtml = `
        <form id="form-inicio">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" required><br><br>

            <label for="numPreguntas">Número de preguntas:</label>
            <input type="number" id="numPreguntas" name="numPreguntas" min="1" max="10" required><br><br>

            <button id="start-btn" type="submit">Iniciar Juego</button>
        </form>
    `;
        divPartida.innerHTML = formHtml;

        document.getElementById('form-inicio').addEventListener('submit', function (e) {
            e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
            // Obtener los valores ingresados por el usuario
            let nombre = document.getElementById('nombre').value;
            let numPreguntes = document.getElementById('numPreguntas').value;
            // Crear el objeto con los datos del jugador
            let dadesJugador = {
                nombreJugador: nombre,
                numPreguntesPartida: numPreguntes
            };
            // Resolver la promesa con los datos del jugador
            resolve(dadesJugador);
        });
    });
}

function mostrarPreguntes(info, dadesJugador) {
    let indicePreguntaActual = 0; // Inicializar la primera pregunta
    let respostesUsuari = []; // Almacena las respuestas del usuario
    mostrarPreguntaActual(info, dadesJugador, indicePreguntaActual, respostesUsuari);
}

function mostrarPreguntaActual(info, dadesJugador, indicePreguntaActual, respostesUsuari) {
    if (indicePreguntaActual === info.length) {
        // Mostrar los botones de Enviar Respuestas y Reiniciar Cuestionario al final
        const finalHtml = `
        <div id="botonesFinales">
            <button type="button" id="enviarR" ${respostesUsuari.length === info.length ? '' : 'disabled'}>Enviar Respostes</button><br>
            <button type="button" id="reset">Reiniciar questionari</button><br>
            ${respostesUsuari.length < info.length ? '<p style="color: red;">Por favor, responde todas las preguntas antes de enviar.</p>' : ''}
        </div>
    `;

        document.getElementById("partida").innerHTML = finalHtml;

        document.getElementById("reset").addEventListener('click', () => {
            document.getElementById("finalitzar").innerHTML = "";
            jugar(); // Función para reiniciar el juego
        });
        document.getElementById("enviarR").addEventListener('click', () => {
            document.getElementById("enviarR").classList.toggle("oculto")
        })

        document.getElementById("enviarR").addEventListener('click', () => {
            if (respostesUsuari.length < info.length) {
                alert("Por favor, responde todas las preguntas antes de enviar.");
                return; // Salir de la función si no todas las preguntas han sido respondidas
            }
            console.log(respostesUsuari); // Debug: Imprimir respuestas en consola
            enviarRespostes(respostesUsuari); // Función para enviar respuestas
        });

        return;
    }

    let htmlString = '';
    const pregunta = info[indicePreguntaActual];

    // Crear el div para la pregunta actual
    htmlString += `<div id="dadesPreguntaActual">`;

    // Mostrar enunciado de la pregunta
    htmlString += `<h3>${indicePreguntaActual + 1}) ${pregunta.enunciado}</h3>`;

    // Mostrar opciones de respuesta
    for (let indexResposta = 0; indexResposta < pregunta.respostes.length; indexResposta++) {
        htmlString += `
            <button type="button" class="botoOp" id="opcio${indicePreguntaActual}-${indexResposta}" dataResposta="${pregunta.respostes[indexResposta]['id']}">
                ${pregunta.respostes[indexResposta]['enunciado']}
            </button><br>`;
    }

    // Cerrar el div para la pregunta actual
    htmlString += `</div>`;

    // Botones "Anterior" y "Siguiente"
    htmlString += `
        <div class="navigation-buttons">
            ${indicePreguntaActual > 0 ? '<button type="button" id="atras">Atrás</button>' : ''}
            <button type="button" id="siguiente">Siguiente</button>
        </div>`;

    const divPartida = document.getElementById("partida");
    divPartida.innerHTML = htmlString;

    // Evento para seleccionar las opciones y cambiar color del botón
    for (let indexResposta = 0; indexResposta < pregunta.respostes.length; indexResposta++) {
        const btnOpcion = document.getElementById(`opcio${indicePreguntaActual}-${indexResposta}`);

        btnOpcion.addEventListener('click', function () {
            // Desactivar cualquier otro botón seleccionado
            const botonesOpciones = document.querySelectorAll(`#partida button.botoOp`);
            botonesOpciones.forEach((btn) => {
                btn.classList.remove('selected'); // Quitar la clase 'selected' de todos
            });

            // Marcar el botón actual como seleccionado
            btnOpcion.classList.add('selected');

            // Almacenar la respuesta seleccionada
            respostesUsuari[indicePreguntaActual] = {
                preguntaId: pregunta.id,
                respostaId: pregunta.respostes[indexResposta]['id']
            };
        });
    }

    // Evento para el botón "Siguiente"
    document.getElementById("siguiente").addEventListener('click', function () {
        // Comprobar si la pregunta actual ha sido respondida
        if (!respostesUsuari[indicePreguntaActual]) {
            alert("Por favor, responde a la pregunta antes de continuar.");
            return; // Salir de la función si la pregunta no ha sido respondida
        }
        mostrarPreguntaActual(info, dadesJugador, indicePreguntaActual + 1, respostesUsuari); // Mostrar la siguiente pregunta
    });
}




function enviarRespostes(respostesUsuari) {
    fetch("../back/finalitzar.php", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(respostesUsuari) // pasar a JSON
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data.error) {
            console.log(data.error);
        } else {
            console.log(data);
            document.getElementById("finalitzar").classList.remove("ocult");
            let resumHtml = '<h2>RESULTATS</h2>'; // Inicializar aquí para acumular el resumen
            data.resum.forEach(detalle => {
                resumHtml += `<div id="resultatPregunta">Pregunta: ${detalle.pregunta + 1} --> ${detalle.acertat ? 'Correcta' : 'Incorrecta'}</div>`;
            });
            resumHtml += `<div id="resumCorrectes">Respostes correctes Totals: ${data.totalCorrectes}/${data.resum.length}</div>`;
            document.getElementById("finalitzar").innerHTML = resumHtml;
            obtenerSesion();
        }
    });
}

async function obtenerSesion() {
    try {
        // Realizar una solicitud al servidor para obtener las variables de sesión
        const response = await fetch('../back/getSession.php');
        const data = await response.json();


        if (data.error) {
            console.log('Error:', data.error);
        } else {
            // Aquí tienes las variables de sesión
            console.log('Nombre del jugador:', data.nombreJugador);
            console.log('Número de preguntas:', data.numPreguntes);
            console.log('Número de preguntas correctas:', data.correctes);
        }
    } catch (error) {
        console.error('Error al obtener la sesión:', error);
    }
}


//cridar Funcions de Jugada
migrarDades();
jugar();

