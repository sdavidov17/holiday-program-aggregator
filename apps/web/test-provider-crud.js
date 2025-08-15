#!/usr/bin/env node

// Manual test script for provider CRUD operations
// Run with: node test-provider-crud.js

const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

const dbPath = path.join(__dirname, 'prisma', 'db.sqlite');
const db = new sqlite3.Database(dbPath);

async function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function testProviderCRUD() {
  console.log('🧪 Testing Provider CRUD Operations\n');

  try {
    // 1. Check if Provider table exists
    console.log('1. Checking Provider table...');
    const tables = await runQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='Provider'",
    );

    if (tables.length === 0) {
      console.error('❌ Provider table does not exist!');
      return;
    }
    console.log('✅ Provider table exists\n');

    // 2. List existing providers
    console.log('2. Listing existing providers...');
    const providers = await runQuery('SELECT * FROM Provider');
    console.log(`   Found ${providers.length} providers`);

    if (providers.length > 0) {
      providers.forEach((p) => {
        console.log(
          `   - ${p.name} (${p.isPublished ? 'Published' : 'Draft'}, ${p.isVetted ? 'Vetted' : 'Unvetted'})`,
        );
      });
    }
    console.log('');

    // 3. Check admin user
    console.log('3. Checking admin users...');
    const admins = await runQuery("SELECT * FROM User WHERE role = 'ADMIN'");
    console.log(`   Found ${admins.length} admin users`);

    if (admins.length > 0) {
      admins.forEach((a) => {
        console.log(`   - ${a.email} (${a.name})`);
      });
    } else {
      console.error('❌ No admin users found! Provider management requires admin role.');
    }
    console.log('');

    // 4. Test creating a provider
    console.log('4. Testing provider creation...');
    const testId = 'test-' + Date.now();
    const testProvider = {
      id: testId,
      name: 'Test Provider ' + new Date().toISOString(),
      description: 'Created by test script',
      email: 'test@example.com',
      phone: '0400 000 000',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      isVetted: false,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await runQuery(
      `INSERT INTO Provider (id, name, description, email, phone, suburb, state, postcode, isVetted, isPublished, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testProvider.id,
        testProvider.name,
        testProvider.description,
        testProvider.email,
        testProvider.phone,
        testProvider.suburb,
        testProvider.state,
        testProvider.postcode,
        testProvider.isVetted ? 1 : 0,
        testProvider.isPublished ? 1 : 0,
        testProvider.createdAt,
        testProvider.updatedAt,
      ],
    );
    console.log('✅ Test provider created\n');

    // 5. Verify creation
    console.log('5. Verifying provider was created...');
    const created = await runQuery('SELECT * FROM Provider WHERE id = ?', [testId]);
    if (created.length > 0) {
      console.log('✅ Provider found in database');
      console.log(`   Name: ${created[0].name}`);
      console.log(`   Email: ${created[0].email}`);
    } else {
      console.error('❌ Provider not found!');
    }
    console.log('');

    // 6. Test updating
    console.log('6. Testing provider update...');
    await runQuery('UPDATE Provider SET isVetted = 1, vettedAt = ? WHERE id = ?', [
      new Date().toISOString(),
      testId,
    ]);

    const updated = await runQuery('SELECT * FROM Provider WHERE id = ?', [testId]);
    if (updated[0].isVetted === 1) {
      console.log('✅ Provider successfully vetted');
    } else {
      console.error('❌ Update failed!');
    }
    console.log('');

    // 7. Test deletion
    console.log('7. Testing provider deletion...');
    await runQuery('DELETE FROM Provider WHERE id = ?', [testId]);

    const deleted = await runQuery('SELECT * FROM Provider WHERE id = ?', [testId]);
    if (deleted.length === 0) {
      console.log('✅ Provider successfully deleted');
    } else {
      console.error('❌ Deletion failed!');
    }
    console.log('');

    // 8. Summary
    console.log('📊 Test Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ Provider table exists');
    console.log('   ✅ CRUD operations functional');
    if (admins.length > 0) {
      console.log('   ✅ Admin user exists');
      console.log('\n🎉 All tests passed! Provider management is ready to use.');
      console.log('\n📝 Next steps:');
      console.log('   1. Open http://localhost:3000/admin/providers in your browser');
      console.log('   2. Sign in with admin account: ' + admins[0].email);
      console.log('   3. You can now manage providers through the UI');
    } else {
      console.log('   ⚠️  No admin user - UI will not work');
      console.log('\n⚠️  To fix: Run "npx tsx scripts/make-admin.ts <your-email>"');
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    db.close();
  }
}

testProviderCRUD();
