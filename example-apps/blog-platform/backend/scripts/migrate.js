const path = require('path');
const fs = require('fs').promises;
const { sequelize } = require('../../database');

const runMigrations = async () => {
  try {
    console.log('Running database migrations...');

    // Ensure database connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Get migration files
    const migrationsDir = path.join(__dirname, '../../database/migrations');
    const migrationFiles = await fs.readdir(migrationsDir);
    
    // Sort migration files by name (should be numbered)
    const sortedMigrations = migrationFiles
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`Found ${sortedMigrations.length} migration files`);

    // Run migrations in order
    for (const migrationFile of sortedMigrations) {
      console.log(`Running migration: ${migrationFile}`);
      
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migration = require(migrationPath);
      
      try {
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log(`✓ Migration ${migrationFile} completed successfully`);
      } catch (error) {
        console.error(`✗ Migration ${migrationFile} failed:`, error.message);
        throw error;
      }
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;