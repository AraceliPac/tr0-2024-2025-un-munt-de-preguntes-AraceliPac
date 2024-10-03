<?php
ob_start();
include "conexio.php"; // Incluir la conexión a la base de datos
$data = file_get_contents("php://input"); // Recibir los datos enviados desde JavaScript
$preguntaModificar = json_decode($data, true); // Decodificar el JSON a un array PHP

$response = []; // Inicializar el array de respuesta

if (isset($preguntaModificar['id']) && isset($preguntaModificar['enunciado']) && isset($preguntaModificar['respuestas'])) {
    $idPregunta = $preguntaModificar['id'];
    $enunciadoNuevo = $preguntaModificar['enunciado'];

    // Actualizar el enunciado de la pregunta
    $stmtPregunta = $conn->prepare("UPDATE preguntas SET enunciado = ? WHERE id = ?");
    $stmtPregunta->bind_param("si", $enunciadoNuevo, $idPregunta);

    // Ejecutar la actualización de la pregunta
    if ($stmtPregunta->execute()) {
        // Eliminar respuestas existentes para la pregunta
        $stmtEliminar = $conn->prepare("DELETE FROM respuestas WHERE idPregunta = ?");
        $stmtEliminar->bind_param("i", $idPregunta);
        $stmtEliminar->execute();

        // Variable para controlar si hubo error en las respuestas
        $errorEnRespuestas = false;

        // Insertar nuevas respuestas
        $stmtRespuesta = $conn->prepare("INSERT INTO respuestas (idPregunta, enunciado, correcta) VALUES (?, ?, ?)");
        foreach ($preguntaModificar['respuestas'] as $respuesta) {
            $enunciatResposta = $respuesta['enunciado'];
            $correcta = $respuesta['correcta']; // Ya es 1 o 0

            // Insertar respuesta
            $stmtRespuesta->bind_param("isi", $idPregunta, $enunciatResposta, $correcta);
            if (!$stmtRespuesta->execute()) {
                $errorEnRespuestas = true;
                $response['error'] = "Error al insertar respuesta: " . $stmtRespuesta->error;
                break;
            }
        }

        // Si no hubo errores en las respuestas, marcar éxito
        if (!$errorEnRespuestas) {
            $response['success'] = "Modificación correcta.";
        }
    } else {
        $response['error'] = "Error al modificar la pregunta: " . $stmtPregunta->error;
    }
} else {
    $response['error'] = "Datos incompletos.";
}

ob_end_clean(); // Limpiar el búfer de salida

// Enviar la respuesta JSON al cliente
header('Content-Type: application/json');
echo json_encode($response);

// Cerrar la conexión
$conn->close();
