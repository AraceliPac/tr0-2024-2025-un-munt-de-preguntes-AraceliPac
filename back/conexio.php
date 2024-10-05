<?php

// $servername = "localhost";
// $username = "root";
// $password = "";
// $db = "peliculas";


$servername = "localhost:3306";
$username = "a23arapacmun_araceli";
$password = "E!zp-RR3|PKCohv";
$db = "a23arapacmun_peliculas";

$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully<br>";
