<?php
session_start();
$data = file_get_contents("php://input");
$respostesUsuari = json_decode($data, true); // true convierte JSON a array asociativo

// Inicializar variables
$correctes = 0;
$p = 0;
$resumPartida = [];

if (!isset($_SESSION['correctes'])) {
    $_SESSION['correctes'] = 0;
}

if ($respostesUsuari) {
    foreach ($respostesUsuari as $item) {
        $preguntaIdUsuario = $item['preguntaId']; // ID de la pregunta que responde el usuario
        $respostaIdUsuario = $item['respostaId']; // ID de la respuesta seleccionada por el usuario
        $be = false; // Variable que indica si el usuario acertó la respuesta

        // Recorrer las preguntas de la sesión para encontrar la pregunta correspondiente
        foreach ($_SESSION['resultados']['preguntes'] as $pregunta) {

            // Verificar si el ID de la pregunta coincide con el del usuario
            if ($pregunta['id'] == $preguntaIdUsuario) {
                // Recorrer las respuestas de la pregunta
                foreach ($pregunta['respostes'] as $resposta) {
                    // Verificar si la respuesta del usuario es correcta
                    if ($resposta['id'] == $respostaIdUsuario && $resposta['correcta'] == "1") {
                        $correctes++; // Incrementar el contador de respuestas correctas
                        $be = true; // Marcar como correcta
                        break; // Salir del bucle de respuestas porque ya se encontró la correcta
                    }
                }
            }
        }

        // Agregar el resultado al resumen de la partida
        $resumPartida[] = [
            'pregunta' => $p,
            'acertat' => $be
        ];
        $p++;
    }

    // Actualizar el número total de respuestas correctas en la sesión
    $_SESSION['correctes'] = $correctes;

    // Devolver el resultado en formato JSON
    echo json_encode([
        'totalCorrectes' => $correctes,
        'resum' => $resumPartida,
    ]);
} else {
    // Error si no se han recibido respuestas del usuario
    echo json_encode([
        'error' => 'Error en la partida. No se recibieron respuestas.',
    ]);
}
