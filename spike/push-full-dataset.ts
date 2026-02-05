import 'dotenv/config';
import { algoliasearch } from 'algoliasearch';
import { policies } from '../src/data/policies.js';

const APP_ID = process.env.ALGOLIA_APP_ID!;
const API_KEY = process.env.ALGOLIA_API_KEY!;
const INDEX_NAME = 'apex_gear_policies';

if (!APP_ID || !API_KEY) {
  console.error('Missing ALGOLIA_APP_ID or ALGOLIA_API_KEY');
  process.exit(1);
}

const client = algoliasearch(APP_ID, API_KEY);

async function main() {
  console.log(`=== F04: Push Full Dataset ===\n`);
  console.log(`Total records: ${policies.length}`);

  // Validate uniqueness
  const objectIDs = policies.map(p => p.objectID);
  const clauseIDs = policies.map(p => p.clause_id);
  const uniqueObjectIDs = new Set(objectIDs);
  const uniqueClauseIDs = new Set(clauseIDs);

  console.log(`Unique objectIDs: ${uniqueObjectIDs.size}/${objectIDs.length}`);
  console.log(`Unique clause_ids: ${uniqueClauseIDs.size}/${clauseIDs.length}`);

  if (uniqueObjectIDs.size !== objectIDs.length) {
    console.error('❌ Duplicate objectIDs found!');
    process.exit(1);
  }
  if (uniqueClauseIDs.size !== clauseIDs.length) {
    console.error('❌ Duplicate clause_ids found!');
    process.exit(1);
  }

  // Count by layer
  const layers: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const p of policies) layers[p.policy_layer]++;
  console.log(`\nBy layer: L1=${layers[1]}, L2=${layers[2]}, L3=${layers[3]}, L4=${layers[4]}`);

  // Clear and push
  console.log('\nClearing existing records...');
  await client.clearObjects({ indexName: INDEX_NAME });

  console.log('Pushing records...');
  const result = await client.saveObjects({
    indexName: INDEX_NAME,
    objects: policies,
  });
  if (result.length > 0) {
    await client.waitForTask({ indexName: INDEX_NAME, taskID: result[0].taskID });
  }
  console.log(`✓ ${policies.length} records pushed\n`);

  // Verify scenario searches
  console.log('=== Verification Searches ===\n');

  const search = async (query: string, filters?: string) => {
    const r = await client.search({ requests: [{ indexName: INDEX_NAME, query, filters }] });
    return (r.results[0] as { hits: Array<{ clause_id: string; policy_layer: number }> }).hits;
  };

  // Scenario 1: Treadmill warranty
  const s1a = await search('Pro-Treadmill X500 motor warranty');
  const s1b = await search('return policy', 'policy_layer:1');
  console.log('Scenario 1 (Treadmill):');
  console.log('  "Pro-Treadmill X500 motor warranty":', s1a.slice(0, 3).map(h => `${h.clause_id} (L${h.policy_layer})`).join(', '));
  console.log('  "return policy" L1:', s1b.slice(0, 3).map(h => `${h.clause_id} (L${h.policy_layer})`).join(', '));

  // Scenario 2: Earbuds hygiene
  const s2a = await search('earbuds return');
  const s2b = await search('hygiene in-ear audio');
  console.log('\nScenario 2 (Earbuds):');
  console.log('  "earbuds return":', s2a.slice(0, 3).map(h => `${h.clause_id} (L${h.policy_layer})`).join(', '));
  console.log('  "hygiene in-ear audio":', s2b.slice(0, 3).map(h => `${h.clause_id} (L${h.policy_layer})`).join(', '));

  // Scenario 3: Hiking boots damage
  const s3a = await search('hiking boots return damaged');
  const s3b = await search('shipping damage override');
  console.log('\nScenario 3 (Hiking Boots):');
  console.log('  "hiking boots return damaged":', s3a.slice(0, 3).map(h => `${h.clause_id} (L${h.policy_layer})`).join(', '));
  console.log('  "shipping damage override":', s3b.slice(0, 3).map(h => `${h.clause_id} (L${h.policy_layer})`).join(', '));

  // Scenario 4: Backpack simple return
  const s4a = await search('backpack return unused tags');
  const s4b = await search('TrailBlazer Daypack');
  console.log('\nScenario 4 (Backpack):');
  console.log('  "backpack return unused tags":', s4a.slice(0, 3).map(h => `${h.clause_id} (L${h.policy_layer})`).join(', '));
  console.log('  "TrailBlazer Daypack":', s4b.slice(0, 3).map(h => `${h.clause_id} (L${h.policy_layer})`).join(', '));

  // Check key records are findable
  console.log('\n=== Key Record Check ===');
  const critical = ['WAR-3.1', 'HYG-4.1', 'DMG-4.1', 'RET-1.1'];
  for (const cid of critical) {
    const hits = await search(cid);
    const found = hits.some(h => h.clause_id === cid);
    console.log(`  ${cid}: ${found ? '✅' : '❌'}`);
  }

  console.log('\n✅ F04 dataset push complete.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
