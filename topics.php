<?php
// Session start
session_start();

// Check method is not POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    exit;
}

// Include global.php, db_connect.php
include 'global.php';
require 'db_connect.php';

$pdo = db_connect();

// Perform the requested operation
$operation = $_POST["operation"];

if ($operation == "get_topics") {
    echo json_encode(get_topics($pdo));
} else if ($operation == "post_topic") {
    echo json_encode(post_topic($pdo, $_POST["title"], $_POST["content"]));
} else if ($operation == "get_topic_by_id") {
    echo json_encode(get_topic_by_id($pdo, $_POST["id"]));
} else if ($operation == "get_posts") {
    echo json_encode(get_posts_by_topic_id($pdo, $_POST["id"]));
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    exit;
}


/**
 * Retrieves all topics from the database.
 *
 * @param PDO $pdo The PDO object for the database connection.
 * @throws PDOException If there is an error executing the query.
 * @return array An array containing all the topics as associative arrays.
 */
function get_topics(PDO $pdo) {
    try {
        // Prepare the SQL statement
        $sql = "SELECT * FROM topics";
        $stmt = $pdo->prepare($sql);
        
        // Execute the query
        $stmt->execute();
        
        // Fetch all the topics as associative arrays
        $topics = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Return the topics
        return $topics;
    } catch (PDOException $e) {
        // Handle the exception and return an error message
        return "Database Error: " . (defined('DEBUG') && (bool)DEBUG ? $e->getMessage() : "Unknown Error");
    }
}


/**
 * Inserts a new topic into the database.
 *
 * @param PDO $pdo The PDO instance for connecting to the database.
 * @param string $title The title of the topic.
 * @param string $content The content of the topic.
 * @throws PDOException If there is a database error.
 * @return int|string Returns the ID of the inserted topic if the insertion was successful,
 *                    or a database error message if it failed.
 */
function post_topic(PDO $pdo, string $title, string $content)
{
    // Check if the title and content is valid
    $pattern = '/\A[\p{Cc}\p{Cf}\p{Z}]++|[\p{Cc}\p{Cf}\p{Z}]++\z/u';
    $titleLength = mb_strlen(preg_replace($pattern, '', $title));
    $contentLength = mb_strlen(preg_replace($pattern, '', $content));

    // Validate the title length
    if ($titleLength == 0 || $titleLength > 30) {
        return "Title must be between 1 and 30 characters.";
    }

    // Validate the content length
    if ($contentLength == 0 || $contentLength > 2000) {
        return "Content must be between 1 and 2000 characters.";
    }

    // Sanitize Title and Content
    $title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');

    try {
        // Prepare the SQL statement
        $sql = "INSERT INTO topics (title, content) VALUES (:title, :content)";
        $stmt = $pdo->prepare($sql);

        // Bind the parameter values
        $stmt->bindValue(':title', $title, PDO::PARAM_STR);
        $stmt->bindValue(':content', $content, PDO::PARAM_STR);

        // Execute the statement
        $stmt->execute();

        // Get the ID of the inserted topic
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        // Return a database error message
        return "Database Error: " . (defined('DEBUG') && (bool) DEBUG ? $e->getMessage() : "Unknown Error");
    }
}


/**
 * Retrieves a topic from the database by its ID.
 *
 * @param PDO $pdo The PDO instance for the database connection.
 * @param int $id The ID of the topic to retrieve.
 * @return mixed The topic data as an associative array, or a database error message.
 */
function get_topic_by_id(PDO $pdo, int $id) {
    try {
        // Prepare the SQL statement
        $sql = "SELECT * FROM topics WHERE topic_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        // Fetch the topic data
        $topic = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $topic;
    } catch (PDOException $e) {
        // Return a database error message
        return "Database Error: " . (defined('DEBUG') && (bool) DEBUG ? $e->getMessage() : "Unknown Error");
    }
}


/**
 * Retrieve posts by topic ID from the database.
 *
 * @param PDO $pdo The PDO instance.
 * @param int $id The topic ID.
 * @return array The array of posts.
 */
function get_posts_by_topic_id(PDO $pdo, int $id) {
    try {
        // Prepare the SQL statement
        $sql = "SELECT * FROM posts WHERE topic_id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $posts;
    } catch (PDOException $e) {
        // Return a database error message
        return "Database Error: " . (defined('DEBUG') && (bool) DEBUG ? $e->getMessage() : "Unknown Error");
    }
}
