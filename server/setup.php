<?php
// Quick database setup

echo "Step 1: Creating database connection...\n";

try {
    // Try to connect to MySQL server (without specifying database first)
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;charset=utf8mb4', 'root', '');
    echo "✓ MySQL connected\n";
    
    // Create database if not exists
    echo "\nStep 2: Creating database 'backand'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `backand`");
    echo "✓ Database created/exists\n";
    
    // Now run Laravel migrations
    echo "\nStep 3: Running migrations...\n";
    $output = [];
    $return = 0;
    exec('php artisan migrate:fresh --seed --force 2>&1', $output, $return);
    
    if ($return === 0) {
        echo "✓ Migrations completed successfully\n";
    } else {
        echo "✗ Migration error (exit code: $return)\n";
    }
    
    echo "\nOutput:\n";
    foreach (array_slice($output, -30) as $line) {
        echo "  $line\n";
    }
    
    echo "\n✓ Setup complete. Laravel server should now work!\n";
    
} catch (PDOException $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    echo "\nMake sure MySQL/MariaDB is running on 127.0.0.1:3306\n";
    exit(1);
}
?>
