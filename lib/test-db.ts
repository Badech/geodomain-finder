// Test script to verify database connection
import { testDatabaseConnection, prisma } from './db';

async function main() {
  console.log('🔍 Testing database connection...\n');
  
  const connected = await testDatabaseConnection();
  
  if (connected) {
    console.log('\n📊 Checking database tables...');
    
    try {
      // Try to count records in each table
      const [
        searchQueryCount,
        domainCount,
        businessLeadCount,
        opportunityCount,
        noteCount,
        filterCount
      ] = await Promise.all([
        prisma.searchQuery.count(),
        prisma.domainOpportunity.count(),
        prisma.businessLead.count(),
        prisma.opportunityMatch.count(),
        prisma.activityNote.count(),
        prisma.savedFilter.count(),
      ]);
      
      console.log('✅ All tables accessible:');
      console.log(`  - SearchQuery: ${searchQueryCount} records`);
      console.log(`  - DomainOpportunity: ${domainCount} records`);
      console.log(`  - BusinessLead: ${businessLeadCount} records`);
      console.log(`  - OpportunityMatch: ${opportunityCount} records`);
      console.log(`  - ActivityNote: ${noteCount} records`);
      console.log(`  - SavedFilter: ${filterCount} records`);
      
      console.log('\n✅ Database setup complete and working!');
    } catch (error) {
      console.error('❌ Error accessing tables:', error);
      process.exit(1);
    }
  } else {
    console.error('\n❌ Database connection failed');
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
