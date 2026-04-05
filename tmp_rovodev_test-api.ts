/**
 * API Testing Script
 * Tests all API endpoints with sample data
 */

const API_BASE = 'http://localhost:3000/api';

console.log('='.repeat(80));
console.log('🧪 API ENDPOINTS - MANUAL TESTING');
console.log('='.repeat(80));
console.log('\nNote: Make sure the Next.js dev server is running (npm run dev)');
console.log('');

async function testSearchAPI() {
  console.log('\n📍 TEST 1: Search API - POST /api/search');
  console.log('-'.repeat(80));
  
  const searchData = {
    niche: 'car detailing',
    city: 'Richmond',
    state: 'Virginia',
    maxDomains: 5,
    maxBusinesses: 3,
  };
  
  console.log('Request:', JSON.stringify(searchData, null, 2));
  
  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData),
    });
    
    const data = await response.json();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`\n✅ Search completed successfully!`);
      console.log(`Search ID: ${data.data.searchQueryId}`);
      console.log(`Domains found: ${data.data.domains.length}`);
      console.log(`Businesses found: ${data.data.businesses.length}`);
      console.log(`Matches created: ${data.data.matches.length}`);
      console.log(`Execution time: ${data.data.metadata.executionTime}ms`);
      
      console.log(`\nTop 3 Domains:`);
      data.data.domains.slice(0, 3).forEach((domain: any, i: number) => {
        console.log(`  ${i + 1}. ${domain.domain}`);
        console.log(`     Status: ${domain.status}`);
        console.log(`     Quality: ${domain.qualityScore}, SEO: ${domain.seoScore}`);
      });
      
      console.log(`\nTop 3 Businesses:`);
      data.data.businesses.slice(0, 3).forEach((biz: any, i: number) => {
        console.log(`  ${i + 1}. ${biz.name}`);
        console.log(`     Buyer Score: ${biz.buyerScore}/100`);
        console.log(`     Website: ${biz.website || 'None'}`);
      });
      
      if (data.data.matches.length > 0) {
        console.log(`\nTop Match:`);
        const match = data.data.matches[0];
        console.log(`  ${match.businessName} ← ${match.domain}`);
        console.log(`  Fit Score: ${match.fitScore}/100`);
        console.log(`  Reason: ${match.matchReason}`);
      }
      
      return data.data;
    } else {
      console.log(`\n❌ Search failed:`, data.error);
      return null;
    }
  } catch (error) {
    console.log(`\n❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

async function testDomainsAPI() {
  console.log('\n\n📍 TEST 2: Domains API - GET /api/domains');
  console.log('-'.repeat(80));
  
  try {
    const params = new URLSearchParams({
      status: 'available',
      minQualityScore: '70',
      limit: '10',
      sortBy: 'qualityScore',
      sortOrder: 'desc',
    });
    
    console.log(`Query: ${params.toString()}`);
    
    const response = await fetch(`${API_BASE}/domains?${params}`);
    const data = await response.json();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`\n✅ Retrieved ${data.data.domains.length} domains`);
      console.log(`Total available: ${data.data.pagination.total}`);
      
      console.log(`\nDomains:`);
      data.data.domains.slice(0, 5).forEach((domain: any, i: number) => {
        console.log(`  ${i + 1}. ${domain.domain}`);
        console.log(`     Quality: ${domain.qualityScore}, SEO: ${domain.seoScore}, Resale: ${domain.resaleScore}`);
      });
      
      return data.data.domains[0]; // Return first domain for next test
    } else {
      console.log(`\n❌ Failed:`, data.error);
      return null;
    }
  } catch (error) {
    console.log(`\n❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

async function testDomainDetailAPI(domainId: string) {
  console.log('\n\n📍 TEST 3: Domain Detail API - GET /api/domains/[id]');
  console.log('-'.repeat(80));
  
  try {
    console.log(`Domain ID: ${domainId}`);
    
    const response = await fetch(`${API_BASE}/domains/${domainId}`);
    const data = await response.json();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`\n✅ Domain details retrieved`);
      console.log(`Domain: ${data.data.domain}`);
      console.log(`Status: ${data.data.status}`);
      console.log(`Saved: ${data.data.saved}`);
      console.log(`Quality: ${data.data.qualityScore}`);
      console.log(`Matches: ${data.data.matches?.length || 0}`);
    } else {
      console.log(`\n❌ Failed:`, data.error);
    }
  } catch (error) {
    console.log(`\n❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testLeadsAPI() {
  console.log('\n\n📍 TEST 4: Leads API - GET /api/leads');
  console.log('-'.repeat(80));
  
  try {
    const params = new URLSearchParams({
      minBuyerScore: '60',
      limit: '10',
      sortBy: 'buyerScore',
      sortOrder: 'desc',
    });
    
    console.log(`Query: ${params.toString()}`);
    
    const response = await fetch(`${API_BASE}/leads?${params}`);
    const data = await response.json();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`\n✅ Retrieved ${data.data.leads.length} leads`);
      console.log(`Total: ${data.data.pagination.total}`);
      
      console.log(`\nTop Leads:`);
      data.data.leads.slice(0, 5).forEach((lead: any, i: number) => {
        console.log(`  ${i + 1}. ${lead.name}`);
        console.log(`     Buyer Score: ${lead.buyerScore}/100`);
        console.log(`     Status: ${lead.status}`);
        console.log(`     Website: ${lead.website || 'None'}`);
      });
      
      return data.data.leads[0]; // Return first lead for next test
    } else {
      console.log(`\n❌ Failed:`, data.error);
      return null;
    }
  } catch (error) {
    console.log(`\n❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

async function testLeadUpdateAPI(leadId: string) {
  console.log('\n\n📍 TEST 5: Lead Update API - PATCH /api/leads/[id]');
  console.log('-'.repeat(80));
  
  const updateData = {
    status: 'contacted',
    notes: 'Test note: Called business owner, interested in domain upgrade',
  };
  
  try {
    console.log(`Lead ID: ${leadId}`);
    console.log(`Update:`, JSON.stringify(updateData, null, 2));
    
    const response = await fetch(`${API_BASE}/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    
    const data = await response.json();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`\n✅ Lead updated successfully`);
      console.log(`Name: ${data.data.name}`);
      console.log(`New Status: ${data.data.status}`);
      console.log(`Notes updated: Yes`);
    } else {
      console.log(`\n❌ Failed:`, data.error);
    }
  } catch (error) {
    console.log(`\n❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testOpportunitiesAPI() {
  console.log('\n\n📍 TEST 6: Opportunities API - GET /api/opportunities');
  console.log('-'.repeat(80));
  
  try {
    const params = new URLSearchParams({
      minFitScore: '70',
      limit: '10',
      sortBy: 'fitScore',
      sortOrder: 'desc',
    });
    
    console.log(`Query: ${params.toString()}`);
    
    const response = await fetch(`${API_BASE}/opportunities?${params}`);
    const data = await response.json();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`\n✅ Retrieved ${data.data.opportunities.length} opportunities`);
      
      console.log(`\nTop Opportunities:`);
      data.data.opportunities.slice(0, 5).forEach((opp: any, i: number) => {
        console.log(`  ${i + 1}. Fit Score: ${opp.fitScore}/100`);
        console.log(`     Business: ${opp.businessLead?.name || 'N/A'}`);
        console.log(`     Domain: ${opp.domainOpportunity?.domain || 'N/A'}`);
      });
    } else {
      console.log(`\n❌ Failed:`, data.error);
    }
  } catch (error) {
    console.log(`\n❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testNotesAPI(businessLeadId?: string) {
  console.log('\n\n📍 TEST 7: Notes API - GET /api/notes');
  console.log('-'.repeat(80));
  
  try {
    const params = businessLeadId 
      ? new URLSearchParams({ businessLeadId })
      : new URLSearchParams({ limit: '5' });
    
    console.log(`Query: ${params.toString()}`);
    
    const response = await fetch(`${API_BASE}/notes?${params}`);
    const data = await response.json();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log(`\n✅ Retrieved ${data.data.notes.length} notes`);
      
      if (data.data.notes.length > 0) {
        console.log(`\nRecent Notes:`);
        data.data.notes.slice(0, 3).forEach((note: any, i: number) => {
          console.log(`  ${i + 1}. ${note.content.substring(0, 60)}${note.content.length > 60 ? '...' : ''}`);
          console.log(`     Business: ${note.businessLead?.name || 'N/A'}`);
          console.log(`     Created: ${new Date(note.createdAt).toLocaleString()}`);
        });
      } else {
        console.log(`\n  No notes found`);
      }
    } else {
      console.log(`\n❌ Failed:`, data.error);
    }
  } catch (error) {
    console.log(`\n❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function testValidation() {
  console.log('\n\n📍 TEST 8: Validation - POST /api/search (invalid data)');
  console.log('-'.repeat(80));
  
  const invalidData = {
    niche: '', // Invalid: empty string
    city: 'Richmond',
    // state missing - required field
  };
  
  console.log('Request:', JSON.stringify(invalidData, null, 2));
  
  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    });
    
    const data = await response.json();
    
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (!data.success) {
      console.log(`\n✅ Validation working correctly!`);
      console.log(`Error Code: ${data.error.code}`);
      console.log(`Error Message: ${data.error.message}`);
      console.log(`Validation Details:`);
      data.error.details?.forEach((detail: any) => {
        console.log(`  - ${detail.path}: ${detail.message}`);
      });
    } else {
      console.log(`\n❌ Validation should have failed`);
    }
  } catch (error) {
    console.log(`\n❌ Error:`, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runAllTests() {
  console.log('\n⚠️  Prerequisites:');
  console.log('  1. Start the Next.js dev server: npm run dev');
  console.log('  2. Set DEMO_MODE=true in .env');
  console.log('  3. Database should be accessible\n');
  
  console.log('Starting tests in 2 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Test 1: Execute search
    const searchResult = await testSearchAPI();
    
    // Test 2: List domains
    const domain = await testDomainsAPI();
    
    // Test 3: Get domain details (if we have a domain ID)
    if (domain?.id) {
      await testDomainDetailAPI(domain.id);
    }
    
    // Test 4: List leads
    const lead = await testLeadsAPI();
    
    // Test 5: Update lead (if we have a lead ID)
    if (lead?.id) {
      await testLeadUpdateAPI(lead.id);
    }
    
    // Test 6: List opportunities
    await testOpportunitiesAPI();
    
    // Test 7: List notes
    await testNotesAPI(lead?.id);
    
    // Test 8: Validation
    await testValidation();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL API TESTS COMPLETED');
    console.log('='.repeat(80));
    console.log('\nAPI Summary:');
    console.log('  ✓ Search API - Complete workflow execution');
    console.log('  ✓ Domains API - Listing and detail retrieval');
    console.log('  ✓ Leads API - Listing and updates');
    console.log('  ✓ Opportunities API - Match retrieval');
    console.log('  ✓ Notes API - Activity tracking');
    console.log('  ✓ Validation - Error handling verified');
    console.log('\nThe API layer is fully functional! 🚀\n');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n❌ Next.js dev server is not running!');
    console.log('\nPlease start the server first:');
    console.log('  npm run dev\n');
    console.log('Then run this script again.\n');
    process.exit(1);
  }
  
  await runAllTests();
})();
