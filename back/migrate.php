<?php
ob_start();
include('conexio.php');

$response = array(); // Inicializa el array de respuesta

// Crear las tablas si no existen
try {
    // Crear tabla preguntas
    $sqlCreatePreguntas = "CREATE TABLE IF NOT EXISTS preguntas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        enunciado VARCHAR(250) NOT NULL,
        imagen VARCHAR(250) NOT NULL
    );";
    if ($conn->query($sqlCreatePreguntas) !== TRUE) {
        throw new Exception('Error al crear la tabla preguntas: ' . $conn->error);
    }

    // Crear tabla respuestas
    $sqlCreateRespuestas = "CREATE TABLE IF NOT EXISTS respuestas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idPregunta INT NOT NULL,
        enunciado VARCHAR(255) NOT NULL,
        correcta BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (idPregunta) REFERENCES preguntas(id) ON DELETE CASCADE
    );";
    if ($conn->query($sqlCreateRespuestas) !== TRUE) {
        throw new Exception('Error al crear la tabla respuestas: ' . $conn->error);
    }

    // Obtener el JSON
    $data = file_get_contents('preguntes.json');
    if ($data === false) {
        throw new Exception('No se puede cargar el archivo.');
    }

    $preguntes = json_decode($data, true);
    if ($preguntes === null) {
        throw new Exception('Error al decodificar JSON.');
    }

    // Verificar si la tabla Preguntas está vacía para hacer la migración
    $sql = "SELECT COUNT(enunciado) as total FROM preguntas;";
    $result = $conn->query($sql);

    if ($result) {
        $row = $result->fetch_assoc();
        $totalPreguntas = $row['total'];

        // Migración de datos
        if ($totalPreguntas == 0) {
            // Preparar statement para insertar preguntas
            $stmtPregunta = $conn->prepare("INSERT INTO preguntas (enunciado, imagen) VALUES (?,?);");
            $stmtPregunta->bind_param("ss", $pregText, $img); ///revisa!!!!!!

            // Preparar statement para insertar respuestas
            $stmtRespuesta = $conn->prepare("INSERT INTO respuestas (idPregunta, enunciado, correcta) VALUES (?, ?, ?);");
            $stmtRespuesta->bind_param("isi", $last_id, $resposta, $acertat);  // "i" para int, "s" para string, "i" para int

            foreach ($preguntes["preguntes"] as $valor) {
                $pregText = $valor["pregunta"];
                $img = $valor["imatge"];

                // Ejecutar la inserción de la pregunta
                if ($stmtPregunta->execute()) {
                    $last_id = $conn->insert_id; // Obtener el último id insertado

                    $correctOpcio = $valor["resposta_correcta"];
                    $respostas = $valor["respostes"];

                    foreach ($respostas as $clau => $resposta) {
                        $acertat = ($correctOpcio == $clau) ? 1 : 0;

                        // Ejecutar la inserción de la respuesta
                        if (!$stmtRespuesta->execute()) {
                            $response['error'] = "Error al insertar respuesta: " . $stmtRespuesta->error;
                        }
                    }
                } else {
                    $response['error'] = "Error al insertar pregunta: " . $stmtPregunta->error;
                }
            }

            $response['success'] = "Migración completada con éxito.";
        } else {
            $response['info'] = "La tabla de preguntas ya contiene datos.";
        }
    } else {
        $response['error'] = "Error en la consulta: " . $conn->error;
    }
} catch (Exception $e) {
    $response['error'] = "Se ha producido un error: " . $e->getMessage();
}

ob_end_clean(); // Limpiar el búfer de salida

// Devolver la respuesta como JSON
header('Content-Type: application/json');
echo json_encode($response);
$conn->close();
