/**
 * One-time migration script — run with:
 *   node fixLanguageCase.js
 *
 * Lowercases all language values in starterCode and referenceSolution
 * for every problem in the DB.
 *
 * Before: { language: 'C++' }  { language: 'Java' }  { language: 'JavaScript' }
 * After:  { language: 'c++' }  { language: 'java' }  { language: 'javascript' }
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');

async function migrate() {
    await mongoose.connect(process.env.DB_CONNECT_STRING);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const problems = db.collection('problems');

    // Fetch all problems that have starterCode or referenceSolution
    const allProblems = await problems.find({}).toArray();
    console.log(`Found ${allProblems.length} problems to migrate`);

    let updated = 0;

    for (const problem of allProblems) {
        const updates = {};

        // Normalise starterCode languages
        if (Array.isArray(problem.starterCode)) {
            const fixedStarterCode = problem.starterCode.map((sc) => ({
                ...sc,
                language: (sc.language || '').toLowerCase().trim()
            }));
            updates.starterCode = fixedStarterCode;
        }

        // Normalise referenceSolution languages
        if (Array.isArray(problem.referenceSolution)) {
            const fixedReferenceSolution = problem.referenceSolution.map((rs) => ({
                ...rs,
                language: (rs.language || '').toLowerCase().trim()
            }));
            updates.referenceSolution = fixedReferenceSolution;
        }

        if (Object.keys(updates).length > 0) {
            await problems.updateOne(
                { _id: problem._id },
                { $set: updates }
            );
            updated++;
            console.log(`  ✓ Fixed: "${problem.title}"`);
        }
    }

    console.log(`\nMigration complete — ${updated}/${allProblems.length} problems updated`);
    await mongoose.disconnect();
    process.exit(0);
}

migrate().catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});