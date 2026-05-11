<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=backand', 'root', '');
    echo "✓ Database connected\n";
    
    $tables = ['sekolah', 'sppg', 'laporan_sekolah', 'laporan_sppg', 'users'];
    foreach ($tables as $table) {
        $res = $pdo->query("SELECT COUNT(*) FROM `$table`");
        $count = $res->fetchColumn();
        echo "✓ $table: $count rows\n";
    }
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
