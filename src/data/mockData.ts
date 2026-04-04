import { DomainOpportunity, BusinessLead, ActivityNote } from '@/types';

// --- Richmond, Virginia - Car Detailing ---
const richmondDomains: DomainOpportunity[] = [
  { id: 'd1', domain: 'richmondcardetailing.com', tld: '.com', status: 'available', qualityScore: 95, seoScore: 92, resaleScore: 88, reasons: ['Exact city + service match', 'High local search volume', 'Easy to remember', '.com TLD'], searchQueryId: 'sq1', saved: false },
  { id: 'd2', domain: 'virginiacardetailing.com', tld: '.com', status: 'available', qualityScore: 88, seoScore: 85, resaleScore: 82, reasons: ['State-level geo match', 'Broader market appeal', 'Clean branding'], searchQueryId: 'sq1', saved: false },
  { id: 'd3', domain: 'autodetailingrichmond.com', tld: '.com', status: 'available', qualityScore: 82, seoScore: 80, resaleScore: 75, reasons: ['Service-first keyword order', 'Good local SEO', 'Professional feel'], searchQueryId: 'sq1', saved: false },
  { id: 'd4', domain: 'richmondautodetailing.com', tld: '.com', status: 'taken', qualityScore: 91, seoScore: 90, resaleScore: 85, reasons: ['Premium geo-service pattern', 'Strong brand recall'], searchQueryId: 'sq1', saved: false },
  { id: 'd5', domain: 'richmonddetailingpros.com', tld: '.com', status: 'available', qualityScore: 78, seoScore: 76, resaleScore: 70, reasons: ['Trust-building suffix', 'Local service appeal'], searchQueryId: 'sq1', saved: false },
  { id: 'd6', domain: 'richmondmobiledetailing.com', tld: '.com', status: 'available', qualityScore: 85, seoScore: 83, resaleScore: 78, reasons: ['Mobile service niche', 'Growing search trend', 'Specific service variant'], searchQueryId: 'sq1', saved: false },
  { id: 'd7', domain: 'richmondcarwash.com', tld: '.com', status: 'taken', qualityScore: 80, seoScore: 82, resaleScore: 76, reasons: ['Related service keyword', 'High search volume'], searchQueryId: 'sq1', saved: false },
  { id: 'd8', domain: 'virginiadetailingservice.com', tld: '.com', status: 'available', qualityScore: 74, seoScore: 72, resaleScore: 65, reasons: ['State-level coverage', 'Service descriptor'], searchQueryId: 'sq1', saved: false },
  { id: 'd9', domain: 'richmonddetailingexperts.com', tld: '.com', status: 'available', qualityScore: 76, seoScore: 74, resaleScore: 68, reasons: ['Authority positioning', 'Local trust signal'], searchQueryId: 'sq1', saved: false },
  { id: 'd10', domain: 'richmonddetailingcompany.com', tld: '.com', status: 'unknown', qualityScore: 72, seoScore: 70, resaleScore: 64, reasons: ['Business descriptor', 'Professional tone'], searchQueryId: 'sq1', saved: false },
];

const richmondBusinesses: BusinessLead[] = [
  { id: 'b1', name: 'Richmond Shine Auto Spa', niche: 'car detailing', city: 'Richmond', state: 'Virginia', phone: '(804) 555-0123', email: 'info@richmondshineautospa.com', website: 'richmondshineautospa.com', address: '1234 Broad St, Richmond, VA 23220', rating: 4.8, reviewCount: 234, currentDomain: 'richmondshineautospa.com', buyerScore: 72, notes: '', status: 'new', tags: ['high-reviews', 'has-website'], recommendedDomainId: 'd1', recommendedDomain: 'richmondcardetailing.com', matchReason: 'Exact geo-service match would strengthen brand recall and local SEO vs current longer domain' },
  { id: 'b2', name: 'Diamond Detail RVA', niche: 'car detailing', city: 'Richmond', state: 'Virginia', phone: '(804) 555-0456', website: 'diamonddetailrva.wixsite.com/home', address: '567 Main St, Richmond, VA 23219', rating: 4.6, reviewCount: 89, currentDomain: 'diamonddetailrva.wixsite.com', buyerScore: 92, notes: '', status: 'new', tags: ['weak-domain', 'wix-site'], recommendedDomainId: 'd3', recommendedDomain: 'autodetailingrichmond.com', matchReason: 'Currently on a free Wix subdomain - a proper .com would dramatically improve credibility and SEO' },
  { id: 'b3', name: 'Elite Mobile Detailing', niche: 'car detailing', city: 'Richmond', state: 'Virginia', phone: '(804) 555-0789', address: '890 Grace St, Richmond, VA 23220', rating: 4.9, reviewCount: 156, buyerScore: 88, notes: '', status: 'new', tags: ['no-website', 'high-reviews', 'mobile-service'], recommendedDomainId: 'd6', recommendedDomain: 'richmondmobiledetailing.com', matchReason: 'No website at all - a geo-service .com would establish online presence instantly' },
  { id: 'b4', name: 'Precision Auto Care', niche: 'car detailing', city: 'Richmond', state: 'Virginia', phone: '(804) 555-0321', email: 'precisionautocare@gmail.com', website: 'precisionautocare-rva.squarespace.com', address: '321 Cary St, Richmond, VA 23219', rating: 4.3, reviewCount: 45, currentDomain: 'precisionautocare-rva.squarespace.com', buyerScore: 85, notes: '', status: 'new', tags: ['weak-domain', 'squarespace'], recommendedDomainId: 'd5', recommendedDomain: 'richmonddetailingpros.com', matchReason: 'Squarespace subdomain limits SEO potential - a geo-service .com would boost local rankings' },
  { id: 'b5', name: 'RVA Supreme Detail', niche: 'car detailing', city: 'Richmond', state: 'Virginia', phone: '(804) 555-0654', website: 'rvasupremedetail.com', address: '654 Monument Ave, Richmond, VA 23220', rating: 4.7, reviewCount: 312, currentDomain: 'rvasupremedetail.com', buyerScore: 55, notes: '', status: 'new', tags: ['has-website', 'high-reviews', 'established'], recommendedDomainId: 'd2', recommendedDomain: 'virginiacardetailing.com', matchReason: 'Current domain uses abbreviation RVA - a state-level geo domain could expand market reach' },
  { id: 'b6', name: 'Clean Machine Richmond', niche: 'car detailing', city: 'Richmond', state: 'Virginia', phone: '(804) 555-0987', address: '987 Broad St, Richmond, VA 23220', rating: 4.1, reviewCount: 23, buyerScore: 78, notes: '', status: 'new', tags: ['no-website', 'low-reviews'], recommendedDomainId: 'd9', recommendedDomain: 'richmonddetailingexperts.com', matchReason: 'No web presence and growing business - perfect time to establish with a strong domain' },
];

// --- Tampa, Florida - Roofing ---
const tampaDomains: DomainOpportunity[] = [
  { id: 'd11', domain: 'tamparoofing.com', tld: '.com', status: 'taken', qualityScore: 97, seoScore: 95, resaleScore: 92, reasons: ['Ultra-premium exact match', 'Highest search volume'], searchQueryId: 'sq2', saved: false },
  { id: 'd12', domain: 'tamparoofingpros.com', tld: '.com', status: 'available', qualityScore: 88, seoScore: 86, resaleScore: 80, reasons: ['Professional suffix', 'Strong local signal'], searchQueryId: 'sq2', saved: false },
  { id: 'd13', domain: 'floridaroofingcompany.com', tld: '.com', status: 'available', qualityScore: 82, seoScore: 80, resaleScore: 76, reasons: ['State coverage', 'Business descriptor'], searchQueryId: 'sq2', saved: false },
  { id: 'd14', domain: 'tamparoofrepair.com', tld: '.com', status: 'available', qualityScore: 86, seoScore: 88, resaleScore: 78, reasons: ['Service-specific variant', 'High intent keyword'], searchQueryId: 'sq2', saved: false },
  { id: 'd15', domain: 'tamparoofingexperts.com', tld: '.com', status: 'available', qualityScore: 80, seoScore: 78, resaleScore: 72, reasons: ['Authority positioning', 'Geo-service pattern'], searchQueryId: 'sq2', saved: false },
  { id: 'd16', domain: 'roofingservicetampa.com', tld: '.com', status: 'available', qualityScore: 76, seoScore: 75, resaleScore: 68, reasons: ['Service-first pattern', 'Local match'], searchQueryId: 'sq2', saved: false },
];

const tampaBusinesses: BusinessLead[] = [
  { id: 'b7', name: 'Bay Area Roofing Solutions', niche: 'roofing', city: 'Tampa', state: 'Florida', phone: '(813) 555-0111', email: 'info@bayarearoofingsolutions.com', website: 'bayarearoofingsolutions.com', address: '123 Kennedy Blvd, Tampa, FL 33602', rating: 4.5, reviewCount: 178, currentDomain: 'bayarearoofingsolutions.com', buyerScore: 65, notes: '', status: 'new', tags: ['has-website', 'established'], recommendedDomainId: 'd12', recommendedDomain: 'tamparoofingpros.com', matchReason: 'Current domain is very long - a shorter geo-service domain improves memorability' },
  { id: 'b8', name: 'Sunshine State Roofing', niche: 'roofing', city: 'Tampa', state: 'Florida', phone: '(813) 555-0222', website: 'sunshineroofing.wix.com', address: '456 Dale Mabry Hwy, Tampa, FL 33609', rating: 4.2, reviewCount: 56, currentDomain: 'sunshineroofing.wix.com', buyerScore: 91, notes: '', status: 'new', tags: ['weak-domain', 'wix-site'], recommendedDomainId: 'd14', recommendedDomain: 'tamparoofrepair.com', matchReason: 'Free Wix subdomain severely limits credibility - a .com geo domain is a major upgrade' },
  { id: 'b9', name: 'Tampa Pro Roofers', niche: 'roofing', city: 'Tampa', state: 'Florida', phone: '(813) 555-0333', address: '789 Hillsborough Ave, Tampa, FL 33603', rating: 4.8, reviewCount: 267, buyerScore: 86, notes: '', status: 'new', tags: ['no-website', 'high-reviews'], recommendedDomainId: 'd15', recommendedDomain: 'tamparoofingexperts.com', matchReason: 'Highly rated with no website - a strong domain would capture significant search traffic' },
  { id: 'b10', name: 'Gulf Coast Roof Repair', niche: 'roofing', city: 'Tampa', state: 'Florida', phone: '(813) 555-0444', email: 'gulfcoastroof@gmail.com', address: '321 Bayshore Blvd, Tampa, FL 33606', rating: 4.0, reviewCount: 34, currentDomain: 'gulfcoastroofrepair.godaddysites.com', buyerScore: 89, notes: '', status: 'new', tags: ['weak-domain', 'godaddy-site'], recommendedDomainId: 'd13', recommendedDomain: 'floridaroofingcompany.com', matchReason: 'GoDaddy builder subdomain lacks professionalism - a state-level .com elevates brand' },
];

// --- Phoenix, Arizona - HVAC ---
const phoenixDomains: DomainOpportunity[] = [
  { id: 'd17', domain: 'phoenixhvac.com', tld: '.com', status: 'taken', qualityScore: 96, seoScore: 94, resaleScore: 90, reasons: ['Exact city + service', 'Premium keyword'], searchQueryId: 'sq3', saved: false },
  { id: 'd18', domain: 'phoenixairconditioning.com', tld: '.com', status: 'available', qualityScore: 90, seoScore: 91, resaleScore: 84, reasons: ['High search volume variant', 'Consumer-friendly term'], searchQueryId: 'sq3', saved: false },
  { id: 'd19', domain: 'arizonahvacservice.com', tld: '.com', status: 'available', qualityScore: 84, seoScore: 82, resaleScore: 76, reasons: ['State-level geo match', 'Service descriptor'], searchQueryId: 'sq3', saved: false },
  { id: 'd20', domain: 'phoenixhvacpros.com', tld: '.com', status: 'available', qualityScore: 82, seoScore: 80, resaleScore: 74, reasons: ['Professional suffix', 'Strong local match'], searchQueryId: 'sq3', saved: false },
  { id: 'd21', domain: 'phoenixheatingandcooling.com', tld: '.com', status: 'available', qualityScore: 79, seoScore: 83, resaleScore: 72, reasons: ['Consumer search term', 'Descriptive clarity'], searchQueryId: 'sq3', saved: false },
  { id: 'd22', domain: 'phoenixacrepair.com', tld: '.com', status: 'available', qualityScore: 85, seoScore: 87, resaleScore: 78, reasons: ['High-intent service keyword', 'Short and memorable'], searchQueryId: 'sq3', saved: false },
  { id: 'd23', domain: 'hvacservicephoenix.com', tld: '.com', status: 'available', qualityScore: 76, seoScore: 74, resaleScore: 68, reasons: ['Service-first pattern', 'Clean structure'], searchQueryId: 'sq3', saved: false },
];

const phoenixBusinesses: BusinessLead[] = [
  { id: 'b11', name: 'Desert Comfort HVAC', niche: 'hvac', city: 'Phoenix', state: 'Arizona', phone: '(602) 555-0111', email: 'service@desertcomforthvac.com', website: 'desertcomforthvac.com', address: '123 Camelback Rd, Phoenix, AZ 85014', rating: 4.6, reviewCount: 198, currentDomain: 'desertcomforthvac.com', buyerScore: 60, notes: '', status: 'new', tags: ['has-website', 'established'], recommendedDomainId: 'd18', recommendedDomain: 'phoenixairconditioning.com', matchReason: 'Current domain is brand-specific - a geo-service domain would capture more generic local searches' },
  { id: 'b12', name: 'Phoenix Cool Air', niche: 'hvac', city: 'Phoenix', state: 'Arizona', phone: '(602) 555-0222', website: 'phoenixcoolair.weebly.com', address: '456 Central Ave, Phoenix, AZ 85004', rating: 4.3, reviewCount: 72, currentDomain: 'phoenixcoolair.weebly.com', buyerScore: 90, notes: '', status: 'new', tags: ['weak-domain', 'weebly-site'], recommendedDomainId: 'd22', recommendedDomain: 'phoenixacrepair.com', matchReason: 'Weebly subdomain severely limits search visibility - a proper .com is essential for growth' },
  { id: 'b13', name: 'Valley AC Pros', niche: 'hvac', city: 'Phoenix', state: 'Arizona', phone: '(602) 555-0333', address: '789 Indian School Rd, Phoenix, AZ 85014', rating: 4.9, reviewCount: 345, buyerScore: 84, notes: '', status: 'new', tags: ['no-website', 'high-reviews', 'top-rated'], recommendedDomainId: 'd20', recommendedDomain: 'phoenixhvacpros.com', matchReason: 'Top-rated with no website - massive opportunity to dominate local HVAC search with a geo domain' },
  { id: 'b14', name: 'Arizona Climate Control', niche: 'hvac', city: 'Phoenix', state: 'Arizona', phone: '(602) 555-0444', email: 'azclimatecontrol@gmail.com', website: 'azcc-hvac.com', address: '321 McDowell Rd, Phoenix, AZ 85008', rating: 4.4, reviewCount: 89, currentDomain: 'azcc-hvac.com', buyerScore: 75, notes: '', status: 'new', tags: ['has-website', 'acronym-domain'], recommendedDomainId: 'd19', recommendedDomain: 'arizonahvacservice.com', matchReason: 'Acronym domain is not intuitive - a descriptive state-level domain would drive more organic traffic' },
];

export const MOCK_DOMAINS: Record<string, DomainOpportunity[]> = {
  'car detailing|virginia|richmond': richmondDomains,
  'roofing|florida|tampa': tampaDomains,
  'hvac|arizona|phoenix': phoenixDomains,
};

export const MOCK_BUSINESSES: Record<string, BusinessLead[]> = {
  'car detailing|virginia|richmond': richmondBusinesses,
  'roofing|florida|tampa': tampaBusinesses,
  'hvac|arizona|phoenix': phoenixBusinesses,
};

export const MOCK_ACTIVITY_NOTES: ActivityNote[] = [];

export const NICHE_VARIANTS: Record<string, string[]> = {
  'car detailing': ['car detailing', 'auto detailing', 'mobile detailing', 'car wash', 'detailing service'],
  'roofing': ['roofing', 'roof repair', 'roofing company', 'roof replacement', 'roofing service'],
  'hvac': ['hvac', 'air conditioning', 'heating and cooling', 'ac repair', 'hvac service'],
};

export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
  'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
  'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
  'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
];
