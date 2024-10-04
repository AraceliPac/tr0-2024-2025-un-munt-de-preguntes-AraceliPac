<?php
ob_start();
include "conexio.php";
$data = file_get_contents("php://input");
$preguntaUsuari = json_decode($data, true);

$response = []; // Inicializar la respuesta

if (
    isset($preguntaUsuari['enunciar']) && isset($preguntaUsuari['imagen']) && isset($preguntaUsuari['opcio1']) &&
    isset($preguntaUsuari['opcio2']) && isset($preguntaUsuari['opcio3']) &&
    isset($preguntaUsuari['opcio4']) && isset($preguntaUsuari['valorCorrecta'])
) {
    // Insertar pregunta
    $stmtPregunta = $conn->prepare("INSERT INTO preguntas (enunciado, imagen) VALUES (?,?)");
    $stmtPregunta->bind_param("ss", $enunciado, $imagen);
    $enunciado = $preguntaUsuari['enunciar'];
    $imagen = $preguntaUsuari['imagen'];
    $valorCorrecta = $preguntaUsuari['valorCorrecta'];

    // Ejecutar inserción de pregunta
    if ($stmtPregunta->execute()) {
        $last_id = $conn->insert_id; // Obtener el último ID insertado

        // Preparar la consulta para las respuestas
        $stmtRespuesta = $conn->prepare("INSERT INTO respuestas (idPregunta, enunciado, correcta) VALUES (?, ?, ?);");
        $stmtRespuesta->bind_param("isi", $last_id, $enunciatResposta, $acertat);

        // Variable para controlar si hubo error en las respuestas
        $errorEnRespuestas = false;

        //guardar en cada respuesta el nuevo enunciado y su valor de correcta
        $respuestas = [
            $preguntaUsuari['opcio1'],
            $preguntaUsuari['opcio2'],
            $preguntaUsuari['opcio3'],
            $preguntaUsuari['opcio4']
        ];

        foreach ($respuestas as $clau => $valor) {
            // Asignar la respuesta actual
            $enunciatResposta = $valor;

            // Determinar si la respuesta es correcta
            $acertat = ($valor == $valorCorrecta) ? 1 : 0;

            // Ejecutar la inserción de la respuesta
            if (!$stmtRespuesta->execute()) {
                $errorEnRespuestas = true; // Marcar que hubo un error
                $response['error'] = "Error al insertar respuesta: " . $stmtRespuesta->error . " respuesta: " . $valor;
                break; // Romper el bucle si hay un error
            }
        }

        // Si no hubo error en las respuestas, marcar éxito
        if (!$errorEnRespuestas) {
            $response['success'] = "Inserción correcta.";
        }
    } else {
        $response['error'] = "Error al insertar pregunta: " . $stmtPregunta->error;
    }
}
ob_end_clean(); // Limpiar el búfer de salida

header('Content-Type: application/json');
echo json_encode($response); // Enviar la respuesta JSON al cliente

$conn->close();
