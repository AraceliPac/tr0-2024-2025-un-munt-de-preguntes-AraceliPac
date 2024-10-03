<?php
ob_start();
include "conexio.php"; // Incluye la conexión a la base de datos
$data = file_get_contents("php://input"); // Recibe los datos enviados desde JavaScript
$preguntaEliminar = json_decode($data, true); // Decodifica el JSON a un array PHP

$response = []; // Inicializar el array de respuesta

// Verificar si se ha enviado correctamente el ID de la pregunta a eliminar
if (isset($preguntaEliminar['id'])) {
    $preg = (int)$preguntaEliminar['id']; // Convertir el ID de la pregunta a entero por seguridad

    // Preparar la consulta SQL para eliminar la pregunta
    $stmtPregunta = $conn->prepare("DELETE FROM preguntas WHERE id = ?");
    $stmtPregunta->bind_param("i", $preg);

    // Ejecutar la eliminación de la pregunta
    if ($stmtPregunta->execute()) {
        // Si la eliminación es correcta, enviamos una respuesta de éxito
        $response['success'] = "Pregunta eliminada correctamente.";
    } else {
        // Si ocurre un error en la eliminación
        $response['error'] = "Error al eliminar la pregunta: " . $stmtPregunta->error;
    }

    // Cerrar el statement
    $stmtPregunta->close();
} else {
    // Si no se ha recibido el ID de la pregunta
    $response['error'] = "ID de la pregunta no proporcionado.";
}
ob_end_clean(); // Limpiar el búfer de salida

// Enviar la respuesta JSON al cliente
header('Content-Type: application/json');
echo json_encode($response);

// Cerrar la conexión
$conn->close();
