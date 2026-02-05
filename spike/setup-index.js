import 'dotenv/config';
import { algoliasearch } from 'algoliasearch';
import { testRecords } from './test-records.js';

const APP_ID = process.env.ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_API_KEY;
const INDEX_NAME = 'apex_gear_policies';

if (!APP_ID || !API_KEY) {
  console.error('Missing ALGOLIA_APP_ID or ALGOLIA_API_KEY in .env');
  process.exit(1);
}

const client = algoliasearch(APP_ID, API_KEY);

async function main() {
  console.log('=== F01: Algolia Index Setup ===\n');

  // 1. Configure index settings
  console.log('1. Configuring index settings...');
  await client.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: [
        'text',
        'clause_title',
        'policy_name',
        'applies_to',
        'conditions'
      ],
      attributesForFaceting: [
        'filterOnly(policy_type)',
        'filterOnly(policy_layer)',
        'filterOnly(applies_to)',
        'filterOnly(product_tags)',
        'filterOnly(effect)'
      ],
      customRanking: [
        'desc(policy_layer)',
        'desc(priority)',
        'desc(specificity_score)'
      ],
      attributeForDistinct: 'policy_id'
    }
  });
  console.log('   ✓ Index settings configured\n');

  // 2. Push test records
  console.log(`2. Pushing ${testRecords.length} test records...`);
  const saveResult = await client.saveObjects({
    indexName: INDEX_NAME,
    objects: testRecords
  });
  // Wait for indexing to complete
  await client.waitForTask({ indexName: INDEX_NAME, taskID: saveResult[0].taskID });
  console.log(`   ✓ ${testRecords.length} records pushed and indexed\n`);

  // 3. Verify: search for treadmill warranty
  console.log('3. Verification search: treadmill + warranty filter...');
  const treadmillResult = await client.search({
    requests: [{
      indexName: INDEX_NAME,
      query: 'treadmill',
      filters: 'policy_type:warranty'
    }]
  });
  const treadmillHits = treadmillResult.results[0].hits;
  console.log(`   Found ${treadmillHits.length} hit(s):`);
  for (const hit of treadmillHits) {
    console.log(`   - ${hit.clause_id}: ${hit.policy_name} (layer ${hit.policy_layer})`);
  }
  const hasTreadmill = treadmillHits.some(h => h.clause_id === 'WAR-3.1');
  console.log(`   ✓ WAR-3.1 found: ${hasTreadmill}\n`);

  // 4. Verify: search for general return policy
  console.log('4. Verification search: return + layer 1 filter...');
  const returnResult = await client.search({
    requests: [{
      indexName: INDEX_NAME,
      query: 'return',
      filters: 'policy_layer:1'
    }]
  });
  const returnHits = returnResult.results[0].hits;
  console.log(`   Found ${returnHits.length} hit(s):`);
  for (const hit of returnHits) {
    console.log(`   - ${hit.clause_id}: ${hit.policy_name} (layer ${hit.policy_layer})`);
  }
  const hasReturn = returnHits.some(h => h.clause_id === 'RET-1.1');
  console.log(`   ✓ RET-1.1 found: ${hasReturn}\n`);

  // Summary
  console.log('=== Results ===');
  if (hasTreadmill && hasReturn) {
    console.log('✅ F01 PASSED — Index configured, records pushed, searches verified.');
  } else {
    console.log('❌ F01 FAILED — Verification searches did not return expected records.');
    if (!hasTreadmill) console.log('   Missing: WAR-3.1 (treadmill warranty)');
    if (!hasReturn) console.log('   Missing: RET-1.1 (general return policy)');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
