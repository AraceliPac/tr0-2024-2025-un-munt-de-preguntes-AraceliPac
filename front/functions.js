import "./crud.js";
console.log("Funciones cargadas");

document.getElementById("administrarBtn").addEventListener('click', () => {
    document.getElementById("adminButtons").classList.toggle("oculto");
});

let respostesUsuari = [];
let contador = 30;
let interval;
let globalInfo; // Definimos esta variable global

// Llamar a las funciones de jugada
migrarDades();
jugar();

async function migrarDades() {
    fetch('../back/migrate.php')
        .then(response => response.json())
        .then(info => {
            //console.log(info);
        });
}

function cargarDades() {
    fetch('../back/cargarDades.php')
        .then(response => response.json())
        .then(info => {
            // console.log("Ordenadas");
            // console.log(info);
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
                .then(response => response.json())
                .then(info => {
                    console.log(info);
                    globalInfo = info; // Guardamos la info en la variable global
                    mostrarPreguntes(info, dadesJugador);
                    iniciarTemporizador(); // Iniciar el temporizador cuando empiezan las preguntas
                })
                .catch(error => {
                    console.error("Error en el fetch: ", error);
                });
        }
    } catch (error) {
        console.log(error);
    }
}

function iniciarTemporizador() {
    const temporizadorElement = document.getElementById("contador");
    contador = 30; // Reiniciar el contador a 30 segundos

    // Crear y agregar el h3 que muestra el tiempo restante
    const tiempoRestanteElement = document.createElement("h3");
    tiempoRestanteElement.id = "tiempoRestante";
    tiempoRestanteElement.innerHTML = `El tiempo restante es: ${contador} segundos`;
    temporizadorElement.parentElement.insertBefore(tiempoRestanteElement, temporizadorElement);

    interval = setInterval(() => {
        if (contador > 0) {
            // Actualizamos el h3 con el tiempo restante
            tiempoRestanteElement.innerHTML = `El tiempo restante es: ${contador} segundos`;
            contador--;
        } else {
            clearInterval(interval);

            // Mostrar alert al acabarse el tiempo
            alert("Se acabó el tiempo");

            // Eliminar el h3
            tiempoRestanteElement.remove(); // Elimina el h3 del DOM


            finalPartida();  // Llamar a la función final cuando se acabe el tiempo
        }
    }, 1000);
}

function detenerTemporizador() {
    clearInterval(interval);
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
            let nombre = document.getElementById('nombre').value;
            let numPreguntes = document.getElementById('numPreguntas').value;

            localStorage.setItem("nombreJugador", nombre);
            localStorage.setItem("numPreguntas", numPreguntes);

            let dadesJugador = {
                nombreJugador: nombre,
                numPreguntesPartida: numPreguntes
            };
            resolve(dadesJugador);
        });
    });
}

function finalPartida() {
    detenerTemporizador(); // Detener el temporizador si se termina la partida antes del tiempo
    const finalHtml = `
        <div id="botonesFinales">
            <button type="button" id="enviarR">Enviar Respuesats</button>
            <button type="button" id="reset">Reiniciar test</button><br>
            ${respostesUsuari.length < globalInfo.length ? '<p style="color: red;">No has respondido a todas las preguntas, pero puedes enviar tus respuestas.</p>' : ''}
        </div>
    `;
    document.getElementById("partida").innerHTML = finalHtml;

    // Obtener el h3 del tiempo restante
    const tiempoRestanteElement = document.getElementById("tiempoRestante");

    // Reiniciar el cuestionario
    document.getElementById("reset").addEventListener('click', () => {
        document.getElementById("finalitzar").innerHTML = "";
        localStorage.removeItem("nombreJugador");
        localStorage.removeItem("numPreguntas");

        // Limpiar el array de respuestas
        respostesUsuari = []; // Limpiar el array de respuestas

        // Eliminar el h3 si existe
        if (tiempoRestanteElement) {
            tiempoRestanteElement.remove(); // Eliminar el h3 del DOM
        }

        jugar(); // Reiniciar el juego
    });

    // Enviar respuestas sin validación
    document.getElementById("enviarR").addEventListener('click', () => {
        // Eliminar el h3 si existe
        if (tiempoRestanteElement) {
            tiempoRestanteElement.remove(); // Eliminar el h3 del DOM
        }
        enviarRespostes(); // Función para enviar respuestas
        respostesUsuari = [];
    });
}




function mostrarPreguntes(info, dadesJugador) {
    let indicePreguntaActual = 0;
    mostrarPreguntaActual(info, dadesJugador, indicePreguntaActual, respostesUsuari);
}

function mostrarPreguntaActual(info, dadesJugador, indicePreguntaActual, respostesUsuari) {
    if (indicePreguntaActual >= info.length) {
        finalPartida(); // Ya no necesitamos pasar parámetros, usamos `globalInfo`
        return; // Si ya se han mostrado todas las preguntas, termina aquí
    }

    let htmlString = '';
    const pregunta = info[indicePreguntaActual];

    htmlString += `<div id="dadesPreguntaActual">`;
    htmlString += `<h3>${indicePreguntaActual + 1}) ${pregunta.enunciado}</h3>`;
    htmlString += `<img src="${pregunta.imagen}" alt="Imagen relacionada con la pregunta" class="imagen-pregunta">`;

    htmlString += `<div id="dadesResposta">`;
    for (let indexResposta = 0; indexResposta < pregunta.respostes.length; indexResposta++) {
        htmlString += `
        <button type="button" class="botoOp" id="opcio${indicePreguntaActual}-${indexResposta}" infoResposta="${pregunta.respostes[indexResposta]['id']}">
            ${pregunta.respostes[indexResposta]['enunciado']}
        </button><br>`;
    }
    htmlString += `</div>`;
    htmlString += `</div>`;

    htmlString += `
    <div class="navigation-buttons">
        ${indicePreguntaActual > 0 ? '<button type="button" id="atras">Atrás</button>' : ''}
        <button type="button" id="siguiente">Siguiente</button>
    </div>`;

    const divPartida = document.getElementById("partida");
    divPartida.innerHTML = htmlString;

    for (let indexResposta = 0; indexResposta < pregunta.respostes.length; indexResposta++) {
        const btnOpcion = document.getElementById(`opcio${indicePreguntaActual}-${indexResposta}`);

        btnOpcion.addEventListener('click', function () {
            const botonesOpciones = document.querySelectorAll(`#partida button.botoOp`);
            botonesOpciones.forEach((btn) => {
                btn.classList.remove('selected');
            });
            btnOpcion.classList.add('selected');

            respostesUsuari[indicePreguntaActual] = {
                preguntaId: pregunta.id,
                respostaId: pregunta.respostes[indexResposta]['id']
            };
        });
    }

    document.getElementById("siguiente").addEventListener('click', function () {
        if (!respostesUsuari[indicePreguntaActual]) {
            alert("Por favor, responde a la pregunta antes de continuar.");
            return;
        }
        mostrarPreguntaActual(info, dadesJugador, indicePreguntaActual + 1, respostesUsuari);
    });

    const btnAtras = document.getElementById("atras");
    if (btnAtras) {
        btnAtras.addEventListener('click', function () {
            mostrarPreguntaActual(info, dadesJugador, indicePreguntaActual - 1, respostesUsuari);
        });
    }
}

function enviarRespostes() {
    console.log(respostesUsuari)
    fetch("../back/finalitzar.php", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(respostesUsuari)

    }).then(response => response.json())
        .then(info => {
            if (info.error) {
                console.log(info.error);
            } else {
                console.log(info);
                document.getElementById("finalitzar").classList.remove("ocult");
                let resumHtml = '<h2>RESULTADOS</h2>';
                info.resum.forEach(detalle => {
                    resumHtml += `<div id="resultatPregunta">Pregunta: ${detalle.pregunta + 1} --> ${detalle.acertat ? 'Correcta' : 'Incorrecta'}</div>`;
                });
                resumHtml += `<div id="resumCorrectes">Respuestas correctas Totales: ${info.totalCorrectes}/${info.resum.length}</div>`;
                document.getElementById("finalitzar").innerHTML = resumHtml;
                //obtenerSesion();
            }
        });
}

async function obtenerSesion() {
    try {
        const response = await fetch('../back/getSession.php');
        const info = await response.json();

        if (info.error) {
            console.log('Error:', info.error);
        } else {
            console.log('Nombre del jugador:', info.nombreJugador);
            console.log('Número de preguntas:', info.numPreguntes);
            console.log('Número de preguntas correctas:', info.correctes);
        }
    } catch (error) {
        console.error('Error al obtener la sesión:', error);
    }
}
