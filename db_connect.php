<?php
$jsonString = file_get_contents(dirname(__FILE__) . '/dbsettings.json');
$data = json_decode($jsonString, true);

// DB名
define('DB_DATABASE', $data['database']);
// MySQLのユーザー名
define('DB_USERNAME', $data['username']);
// MySQLのログインパスワード
define('DB_PASSWORD', $data['password']);
// DSN
define('PDO_DSN', 'mysql:host=localhost;charset=utf8mb4;dbname=' . DB_DATABASE);

/**
 * Returns a PDO instance with the configured DB connection settings.
 *
 * @return PDO Returns a PDO instance with the configured DB connection settings.
 */
function db_connect()
{
    try {
        $pdo = new PDO(PDO_DSN, DB_USERNAME, DB_PASSWORD);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        // Print the error message and terminate the script
        echo 'Error: ' . $e->getMessage();
        die();
    }
}
