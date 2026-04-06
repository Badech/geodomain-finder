/**
 * Development Self-Test for Dynadot Single Domain Availability
 * 
 * Run this script to verify the Dynadot provider works correctly
 * before testing full search functionality.
 * 
 * Usage:
 *   npx tsx scripts/test-dynadot-single-domain.ts
 * 
 * Requirements:
 *   - DYNADOT_ACCOUNT_API_KEY set in .env
 *   - DEBUG_DOMAINS=true for verbose output (optional)
 */

import { DynadotDomainProvider } from '../lib/providers/domain/dynadot';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSingleDomain() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Dynadot Single-Flight Self-Test');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check for API key
  const apiKey = process.env.DYNADOT_ACCOUNT_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: DYNADOT_ACCOUNT_API_KEY not found in environment');
    console.error('   Please add it to your .env file\n');
    process.exit(1);
  }

  console.log('✓ API key found');
  console.log(`✓ Debug mode: ${process.env.DEBUG_DOMAINS === 'true' ? 'ENABLED (shows full JSON)' : 'DISABLED'}`);
  
  if (process.env.DEBUG_DOMAINS !== 'true') {
    console.log('');
    console.log('💡 TIP: To see full JSON responses and parsing details:');
    console.log('   Set DEBUG_DOMAINS=true in your .env file or run:');
    console.log('   DEBUG_DOMAINS=true npx tsx scripts/test-dynadot-single-domain.ts');
  }
  console.log('✓ Single-flight mode: ENABLED (sequential requests)\n');

  // Create provider
  const provider = new DynadotDomainProvider(apiKey);

  // Test domains
  const testDomains = [
    'example.com', // Known taken
    'thisisaveryunlikelydomainname12345.com', // Likely available
    'google.com', // Known taken
  ];

  console.log(`Testing ${testDomains.length} domains...\n`);

  for (const domain of testDomains) {
    console.log(`\n📍 Testing: ${domain}`);
    console.log('─────────────────────────────────────────────────────');

    try {
      const startTime = Date.now();
      const results = await provider.checkAvailability([domain]);
      const elapsed = Date.now() - startTime;
      const result = results[0];

      console.log(`⏱️  Time: ${elapsed}ms`);
      console.log(`📊 Status: ${result.status}`);
      console.log(`🔍 Available: ${result.available}`);
      console.log(`📡 Provider: ${result.provider}`);
      console.log(`🔗 Source: ${result.availabilitySource}`);
      
      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
      }

      // Validate result
      if (result.status === 'error') {
        console.log('❌ ERROR STATUS RETURNED');
        console.log(`   Error message: ${result.error || 'No error message'}`);
        console.log(`   Response code: ${result.providerResponseCode || 'unknown'}`);
        
        if (result.error?.includes('no domains entered')) {
          console.log('   🔴 CRITICAL: Parameter bug - domain0 not being sent');
        } else if (result.error?.includes('currently processing another request')) {
          console.log('   🔴 CRITICAL: Concurrency bug - requests overlapping');
        } else if (result.error?.includes('parse failed') || result.error?.includes('Invalid JSON')) {
          console.log('   🔴 CRITICAL: JSON parsing failed');
          console.log('   ➡️  Enable DEBUG_DOMAINS=true to see raw response');
        } else if (result.error?.includes('No recognizable structure')) {
          console.log('   🔴 CRITICAL: Response structure doesn\'t match any known pattern');
          console.log('   ➡️  Enable DEBUG_DOMAINS=true to see what Dynadot returned');
        } else {
          console.log(`   ⚠️  Unexpected error: ${result.error}`);
        }
      } else if (result.status === 'available' || result.status === 'taken') {
        console.log('✅ SUCCESS: Valid status returned');
        console.log(`   Domain is ${result.status.toUpperCase()}`);
      } else if (result.status === 'unknown') {
        console.log('⚠️  UNKNOWN STATUS');
        console.log('   API returned success but availability is unclear');
      } else {
        console.log(`⚠️  Unusual status: ${result.status}`);
      }

    } catch (error) {
      console.log(`❌ EXCEPTION: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error && error.message.includes('no domains entered')) {
        console.log('❌ CRITICAL: Request construction bug - domain parameter not sent correctly');
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Self-Test Complete');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Expected Results:');
  console.log('  • example.com: status=taken, available=false');
  console.log('  • unlikely domain: status=available, available=true');
  console.log('  • google.com: status=taken, available=false');
  console.log('  • All requests complete without concurrency errors');
  console.log('\nIf you see errors:');
  console.log('  • \"no domains entered\" → Parameter bug (should use domain0)');
  console.log('  • \"currently processing another request\" → Concurrency bug (not sequential)');
  console.log('  • \"parse failed\" → Set DEBUG_DOMAINS=true to see raw response\n');
  console.log('To debug: Set DEBUG_DOMAINS=true in .env and run again\n');
}

// Run test
testSingleDomain().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
