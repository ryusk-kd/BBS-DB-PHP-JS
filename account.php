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
$user_name = isset($_POST["user_name"]) ? $_POST["user_name"] : '';
$password = isset($_POST["password"]) ? $_POST["password"] : '';


// Perform the requested operation
if ($operation == "login") {
    // Perform login operation
    echo json_encode(login($pdo, $user_name, $password));
} else if ($operation == "logout") {
    // Logout the user and unset the user_name session variable
    unset($_SESSION['user_name']);
    // Unset cookie for user_name
    setcookie('user_name', '', time() - 60);
    echo json_encode(true);
} else if ($operation == "register") {
    // Perform register operation
    echo json_encode(register($pdo, $user_name, $password));
} else if ($operation == "delete_account") {
    // Perform delete account operation
    echo json_encode(delete_account($pdo, $user_name, $password));
}

/**
 * Verifies the user's credentials against the database.
 *
 * @param PDO $pdo The PDO connection object.
 * @param string $user_name The username to verify.
 * @param string $password The password to verify.
 * @throws PDOException If there is an error executing the SQL statement.
 * @return bool|string Returns true if the password is verified, false otherwise. If there is a database error, returns a string with the error message.
 */
function verify($pdo, $user_name, $password) {
    try {
        // Query the database for the account with the provided username
        $sql = "SELECT * FROM users WHERE username = :user_name";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':user_name', $user_name, PDO::PARAM_STR);
        $stmt->execute();
        
        // Fetch the account row from the database
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verify the password using password_verify function
        if ($row && password_verify($password, $row['pwd_hash'])) {
            // If the password is verified, return true
            return true;
        } else {
            // If the password is not verified, return false
            return false;
        }
    } catch (PDOException $e) {
        // If there is an error executing the SQL statement
        // Log the error or handle it in an appropriate way
        // Return a specific value or throw a custom exception if desired
        return "Database Error: " . (defined('DEBUG') && (bool)DEBUG ? $e->getMessage() : "Unknown Error");
    }
}

/**
 * Checks if a user exists in the database.
 *
 * @param PDO $pdo The PDO object for the database connection.
 * @param string $user_name The username to check.
 * @throws PDOException if there is an error executing the SQL statement.
 * @return bool|string Returns true if the user exists, false otherwise. If there is a database error, it returns a string with the error message.
 */
function check($pdo, $user_name) {
    try {
        // Query the database for the account with the provided username
        $sql = "SELECT * FROM users WHERE username = :user_name";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':user_name', $user_name, PDO::PARAM_STR);
        $stmt->execute();
        
        // Fetch the account row from the database
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // If the account exists, return true
        if ($row) {
            return true;
        } else {
            // If the account does not exist, return false
            return false;
        }
    } catch (PDOException $e) {
        // If there is an error executing the SQL statement
        // Log the error or handle it in an appropriate way
        // Return a specific value or throw a custom exception if desired
        return "Database Error: " . (defined('DEBUG') && (bool)DEBUG ? $e->getMessage() : "Unknown Error");
    }
}

/**
 * Inserts a new user into the database.
 *
 * @param PDO $pdo The PDO object representing the database connection.
 * @param string $user_name The username of the user to be inserted.
 * @param string $password The password of the user to be inserted.
 * @throws PDOException If there is an error executing the SQL statement.
 * @return bool|string Returns true if the user was inserted successfully, or a string specifying the database error.
 */
function insert($pdo, $user_name, $password) {
    try {
        // Prepare the SQL statement to insert a new user into the 'users' table
        $sql = "INSERT INTO users (username, pwd_hash) VALUES (:user_name, :password)";
        $stmt = $pdo->prepare($sql);

        // Bind the values to the prepared statement
        $stmt->bindValue(':user_name', $user_name, PDO::PARAM_STR);
        $stmt->bindValue(':password', password_hash($password, PASSWORD_DEFAULT), PDO::PARAM_STR);

        // Execute the prepared statement
        $stmt->execute();

        // If the account was inserted, return true
        return true;
    } catch (PDOException $e) {
        // If there is an error executing the SQL statement
        // Log the error or handle it in an appropriate way
        // Return a specific value or throw a custom exception if desired
        return "Database Error: " . (defined('DEBUG') && (bool)DEBUG ? $e->getMessage() : "Unknown Error");
    }
}

/**
 * Deletes a user from the 'users' table based on the provided username.
 *
 * @param PDO $pdo The PDO object used to connect to the database.
 * @param string $user_name The username of the user to be deleted.
 * @throws PDOException If there is an error executing the SQL statement.
 * @return bool|string If the user was deleted, returns true. Otherwise, returns a string indicating the database error.
 */
function delete($pdo, $user_name) {
    try {
        // Prepare the SQL statement to delete a user from the 'users' table
        $sql = "DELETE FROM users WHERE username = :user_name";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':user_name', $user_name, PDO::PARAM_STR);
        $stmt->execute();

        // If the user was deleted, return true
        return true;
    } catch (PDOException $e) {
        // If there is an error executing the SQL statement
        // Log the error or handle it in an appropriate way
        // Return a specific value or throw a custom exception if desired
        return "Database Error: " . (defined('DEBUG') && (bool)DEBUG ? $e->getMessage() : "Unknown Error");
    }
}


/**
 * Inserts a user token into the database.
 *
 * @param PDO $pdo The PDO object for the database connection.
 * @param string $user_name The username of the user.
 * @throws PDOException If there is an error executing the SQL statement.
 * @return string The generated token.
 */
function setToken($pdo, $user_name) {
    $token = bin2hex(random_bytes(32));
    try {
        // Prepare the SQL statement to insert a new user into the 'users' table
        $sql = "INSERT INTO login_tokens (username, token) VALUES (:user_name, :token)";
        $stmt = $pdo->prepare($sql);
        
        // Bind the values to the prepared statement
        $stmt->bindValue(':user_name', $user_name, PDO::PARAM_STR);
        $stmt->bindValue(':token', $token, PDO::PARAM_STR);
        
        // Execute the prepared statement
        $stmt->execute();
        
        // If the account was inserted, return true
        return $token;
    } catch (PDOException $e) {
        // If there is an error executing the SQL statement
        // Log the error or handle it in an appropriate way
        // Return a specific value or throw a custom exception if desired
        return "Database Error: " . (defined('DEBUG') && (bool)DEBUG ? $e->getMessage() : "Unknown Error");
    }
    
}

/**
 * Logs in a user by verifying their credentials against a database.
 *
 * @param PDO $pdo the database connection object
 * @param string $user_name the username of the user
 * @param string $password the password of the user
 * @return bool|int returns true if the user is successfully logged in, otherwise returns an error code
 */
function login($pdo, $user_name, $password)
{
    $result = verify($pdo, $user_name, $password);
    if ($result !== true) {
        return $result;
    }
    
    $token = setToken($pdo, $user_name);
    if (preg_match('/Database Error/', $token)) {
        return $token;
    }
    setcookie('token', $token, time() + 60 * 60 * 24 * 30);
    $_SESSION['user_name'] = $user_name;
    $_SESSION['token'] = $token;

    return true;
}

/**
 * Registers a user in the database.
 *
 * @param PDO $pdo The PDO object for the database connection.
 * @param string $user_name The username of the user.
 * @param string $password The password of the user.
 * @throws Some_Exception_Class If there is an error in the database.
 * @return mixed The result of the register operation.
 */
function register($pdo, $user_name, $password) {
    // Check if the username is valid
    $pattern = '/\A[\p{Cc}\p{Cf}\p{Z}]++|[\p{Cc}\p{Cf}\p{Z}]++\z/u';
    $length = mb_strlen(preg_replace($pattern, '', $user_name));

    // If the username is not valid, return an error message
    if ($length == 0 || $length > 24) {
        return "Username must be between 1 and 24 characters.";
    }

    // Check if the user already exists in the database
    $result = check($pdo, $user_name);
    if ($result === true) {
        return "Username already exists.";
    } else if ($result !== false) {
        return $result;
    }

    // If the user does not exist, insert the user into the database
    return insert($pdo, $user_name, $password);
}

/**
 * Deletes the user account.
 *
 * @param PDO $pdo the database connection
 * @param string $user_name the username of the account to be deleted
 * @param string $password the password of the account to be deleted
 * @throws Exception if an error occurs during deletion
 * @return mixed the result of the deletion operation
 */
function delete_account($pdo, $user_name, $password) {
    // Check if the user is logged in with the correct username
    if (!isset($_SESSION['user_name']) || $_SESSION['user_name'] != $user_name) {
        return "You must be logged in to delete your account.";
    }

    // Verify the user's credentials against the database
    $result = verify($pdo, $user_name, $password);

    // If the credentials are valid
    if ($result === true) {
        // Delete the user account from the database
        $result = delete($pdo, $user_name);

        // If the deletion was successful
        if ($result === true) {
            // Unset the user_name session variable and delete the user_name cookie
            unset($_SESSION['user_name']);
            setcookie('user_name', '', time() - 60);
        }
    }

    // Return the result of the deletion operation
    return $result;
}
