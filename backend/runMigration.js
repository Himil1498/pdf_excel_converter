const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to database...');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'pdf_excel_converter',
      multipleStatements: true
    });

    console.log('✓ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migration_add_new_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');

    // Split by semicolons and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log('✓ Statement executed');
      } catch (err) {
        // Ignore duplicate column errors
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('  (column already exists, skipping)');
        } else if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('  (table already exists, skipping)');
        } else {
          console.error('✗ Error:', err.message);
        }
      }
    }

    await connection.end();
    console.log('\n✅ Migration completed successfully!');
    console.log('You can now restart the backend server.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
