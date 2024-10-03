<?php
session_start();
if (isset($_SESSION['resultados']) && isset($_SESSION['nombreJugador']) && isset($_SESSION['numPreguntes']) && isset($_SESSION['correctes'])) {
    // Inicializar un array para almacenar las respuestas
    $respuestasArray = [];

    // Recorrer los resultados y almacenar las respuestas
    foreach ($_SESSION['resultados'] as $pregunta) {
        // Verificar si la clave 'id' y 'respostes' existen en cada pregunta
        if (isset($pregunta['id'])) {
            if (isset($pregunta['respostes']) && is_array($pregunta['respostes'])) {
                foreach ($pregunta['respostes'] as $resposta) {
                    $respuestasArray[] = $resposta; // Agregar la respuesta al array
                }
            } else {
                // En caso de que la clave 'respostes' no exista o no sea un array
                $respuestasArray[] = "Respostes no disponible para la pregunta con ID: " . $pregunta['id'];
            }
        } else {
            // Agregar un mensaje de error si 'id' no está definido
            $respuestasArray[] = "Pregunta sin ID definida.";
        }
    }

    // PASAR A JSON
    echo json_encode([
        'nombreJugador' => $_SESSION['nombreJugador'],
        'numPreguntes' => $_SESSION['numPreguntes'],
        'correctes' => $_SESSION['correctes'],
    ]);
} else {
    echo json_encode([
        'error' => 'Las variables de sesión no están definidas.'
    ]);
}
