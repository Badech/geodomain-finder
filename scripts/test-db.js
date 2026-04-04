const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful!\n');
    
    // Check tables
    console.log('📊 Checking database tables...\n');
    
    const counts = await Promise.all([
      prisma.searchQuery.count(),
      prisma.domainOpportunity.count(),
      prisma.businessLead.count(),
      prisma.opportunityMatch.count(),
      prisma.activityNote.count(),
      prisma.savedFilter.count(),
    ]);
    
    console.log('✅ All tables accessible:');
    console.log(`  - SearchQuery: ${counts[0]} records`);
    console.log(`  - DomainOpportunity: ${counts[1]} records`);
    console.log(`  - BusinessLead: ${counts[2]} records`);
    console.log(`  - OpportunityMatch: ${counts[3]} records`);
    console.log(`  - ActivityNote: ${counts[4]} records`);
    console.log(`  - SavedFilter: ${counts[5]} records`);
    
    console.log('\n✅ Phase 1 complete! Database setup verified.');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
