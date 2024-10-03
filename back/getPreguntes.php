<?php
session_start();
ob_start();
include "conexio.php";

$data = json_decode(file_get_contents("php://input"), true);
$nombreJugador = $data['nombreJugador'];
$numPreguntes = $data['numPreguntesPartida'];
//iniciar variables de sessio

if (!isset($_SESSION['nombreJugador'])) {
    $_SESSION['nombreJugador'] = $nombreJugador;
}
if (!isset($_SESSION['numPreguntes'])) {
    $_SESSION['numPreguntes'] = $numPreguntes;
}

$response = array(); // Inicialitza array de preguntes i respostes
try {
    $sql = "SELECT * FROM preguntas ORDER BY RAND() LIMIT $numPreguntes";
    $result = $conn->query($sql);  // result es el resultat de la consulta

    if ($result->num_rows > 0) { // Primer verificar si hi han dades 
        $preguntas = array();

        // Cargar las preguntas en el array $preguntas
        while ($row = $result->fetch_assoc()) {
            $preguntas[$row['id']] = $row;  // Usar el id de la pregunta como clave
            $preguntas[$row['id']]['respostes'] = array(); // Inicializar array para respuestas
        }

        // Cargar las respuestas
        $sqlRespostes = "SELECT * FROM respuestas;";
        $resultRespostes = $conn->query($sqlRespostes);

        while ($rowRespostes = $resultRespostes->fetch_assoc()) {
            $idPregunta = $rowRespostes['idPregunta']; // Obtener el id de la pregunta a la que pertenece la respuesta
            // Añadir la respuesta al array de respuestas de la pregunta correspondiente
            if (isset($preguntas[$idPregunta])) {
                $preguntas[$idPregunta]['respostes'][] = $rowRespostes;
            }
        }

        // Guardar todas las preguntas y respuestas en el array de respuesta final
        $response['preguntes'] = array_values($preguntas); // Convertir a array numérico

    } else {
        $response['info'] = "No hi ha preguntes a la base de dades";
    }
} catch (Exception $e) {
    $response['error'] = "Error: " . $e->getMessage();
}

$_SESSION['resultados'] = $response;

// Crear 'preguntesUser' sin la respuesta correcta
$preguntesUser = [];
foreach ($response['preguntes'] as $pregunta) {
    // Hacer una copia de cada pregunta
    $preguntaSinCorrecta = $pregunta;
    // Eliminar las respuestas que contienen 'correcta'
    foreach ($preguntaSinCorrecta['respostes'] as $key => $respuesta) {
        unset($preguntaSinCorrecta['respostes'][$key]['correcta']); // Eliminar la clave 'correcta'
    }
    // Añadir la pregunta sin la respuesta correcta a 'preguntesUser'
    $preguntesUser[] = $preguntaSinCorrecta;
}

ob_end_clean(); // Limpiar el búfer de salida

// Devolver la respuesta como JSON
header('Content-Type: application/json');
echo json_encode($preguntesUser);
$conn->close();
