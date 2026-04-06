import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@/lib/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Globe, Users, TrendingUp, Bookmark, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DomainCard } from '@/components/DomainCard';
import { BusinessCard, BusinessTable } from '@/components/BusinessCard';
import { useAppState } from '@/hooks/useAppState';
import { executeSearch } from '@/services/searchService';
import { US_STATES } from '@/data/mockData';
import { getCitiesForState } from '@/data/usCities';
import { CityCombobox } from '@/components/CityCombobox';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { domains, businesses, setDomains, setBusinesses, toggleSaveDomain, isSearching, setIsSearching, addSearchHistory, savedDomains } = useAppState();

  const [niche, setNiche] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [modifiers, setModifiers] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [comOnly, setComOnly] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    const params = searchParams[0];
    if (params && params.get('demo') === 'true') {
      setNiche('car detailing');
      setState('Virginia');
      setCity('Richmond');
      handleSearch('car detailing', 'Virginia', 'Richmond');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update available cities when state changes
  useEffect(() => {
    async function loadCities() {
      if (state) {
        // For now, use synchronous method - will make async with API later if needed
        const cities = getCitiesForState(state);
        setAvailableCities(cities);
        // Reset city if it's not in the new state's city list
        if (city && !cities.includes(city)) {
          setCity('');
        }
      } else {
        setAvailableCities([]);
        setCity('');
      }
    }
    loadCities();
  }, [state, city]);

  const handleSearch = async (n?: string, s?: string, c?: string) => {
    const searchNiche = n || niche;
    const searchState = s || state;
    const searchCity = c || city;
    if (!searchNiche || !searchState || !searchCity) return;

    setIsSearching(true);
    setHasSearched(true);
    addSearchHistory({
      id: `sq-${Date.now()}`,
      niche: searchNiche,
      state: searchState,
      city: searchCity,
      modifiers: modifiers ? modifiers.split(',').map(m => m.trim()) : [],
      createdAt: new Date(),
    });

    try {
      const result = await executeSearch(searchNiche, searchState, searchCity);
      setDomains(result.domains);
      setBusinesses(result.businesses);
      console.log('Search completed:', {
        domains: result.domains.length,
        businesses: result.businesses.length,
        matches: result.matches.length,
        executionTime: result.metadata.executionTime + 'ms'
      });
    } catch (error) {
      console.error('Search failed:', error);
      // Show error to user but keep UI functional
      setDomains([]);
      setBusinesses([]);
    } finally {
      setIsSearching(false);
    }
  };

  const availableDomains = domains.filter(d => d.status === 'available');
  const topBuyers = businesses.filter(b => b.buyerScore >= 80);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-display text-base font-bold">GeoDomain Scout</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/crm')} className="text-xs">
              <Bookmark className="mr-1 h-3.5 w-3.5" /> CRM
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="rounded-2xl border border-border bg-card p-4 md:p-6 shadow-elegant">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <Input placeholder="Niche (e.g. car detailing)" value={niche} onChange={e => setNiche(e.target.value)} className="h-11" />
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-11"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <CityCombobox
              value={city}
              onChange={setCity}
              cities={availableCities}
              disabled={!state}
              placeholder={state ? "Select city" : "Select state first"}
            />
            <Input placeholder="Modifiers (optional)" value={modifiers} onChange={e => setModifiers(e.target.value)} className="h-11" />
            <div className="flex gap-2">
              <Button onClick={() => handleSearch()} disabled={isSearching || !niche || !state || !city} className="h-11 flex-1 font-semibold shadow-glow">
                {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="h-11 w-11 shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 border-t border-border pt-4">
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={comOnly} onCheckedChange={setComOnly} /> .com only
                </label>
                <p className="text-xs text-muted-foreground">More filters coming soon</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Loading - PHASE 4: Enhanced loading states */}
        {isSearching && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Searching...</p>
              <p className="mt-1 text-xs text-muted-foreground">Generating domains, finding businesses, and enriching data</p>
            </div>
            <div className="mt-4 max-w-md space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                <span>Checking domain availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <span>Searching local businesses via Google Places</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <span>Extracting contact information</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <span>Matching domains to prospects</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!isSearching && hasSearched && (
          <>
            {/* Summary Cards */}
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <SummaryCard icon={<Globe className="h-5 w-5 text-primary" />} label="Domains Generated" value={domains.length} />
              <SummaryCard icon={<TrendingUp className="h-5 w-5 text-success" />} label="Available" value={availableDomains.length} />
              <SummaryCard icon={<Users className="h-5 w-5 text-info" />} label="Businesses Found" value={businesses.length} />
              <SummaryCard icon={<Bookmark className="h-5 w-5 text-accent" />} label="Top Buyers" value={topBuyers.length} />
            </div>

            {/* Split Layout */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Domains */}
              <div>
                <h2 className="font-display text-lg font-bold mb-4">Domain Opportunities</h2>
                {domains.length === 0 ? (
                  <EmptyState title="No domains found" desc="Try a different niche or location." />
                ) : (
                  <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                    {domains.map(d => (
                      <DomainCard key={d.id} domain={d} onSave={toggleSaveDomain} />
                    ))}
                  </div>
                )}
              </div>

              {/* Businesses */}
              <div>
                <h2 className="font-display text-lg font-bold mb-4">Business Prospects</h2>
                {businesses.length === 0 ? (
                  <EmptyState title="No businesses found" desc="Try broadening your search criteria." />
                ) : isMobile ? (
                  <div className="space-y-3">
                    {businesses.map(b => <BusinessCard key={b.id} lead={b} />)}
                  </div>
                ) : (
                  <BusinessTable leads={businesses} onViewDetail={(id) => navigate(`/prospect/${id}`)} />
                )}
              </div>
            </div>

            {/* Legal note */}
            <p className="mt-8 text-center text-xs text-muted-foreground">
              Only generic geo-service domains are shown. Contact data sourced from publicly available directories. Availability results are estimates — verify before registering.
            </p>
          </>
        )}

        {/* Empty state before search */}
        {!isSearching && !hasSearched && (
          <div className="mt-20 text-center">
            <Globe className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h2 className="mt-4 font-display text-2xl font-bold">Start your domain search</h2>
            <p className="mt-2 text-muted-foreground">Enter a niche, state, and city to discover geo-service domain opportunities.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { label: 'Car Detailing in Richmond, VA', n: 'car detailing', s: 'Virginia', c: 'Richmond' },
                { label: 'Roofing in Tampa, FL', n: 'roofing', s: 'Florida', c: 'Tampa' },
                { label: 'HVAC in Phoenix, AZ', n: 'hvac', s: 'Arizona', c: 'Phoenix' },
              ].map(q => (
                <Button key={q.label} variant="outline" size="sm" className="text-xs"
                  onClick={() => { setNiche(q.n); setState(q.s); setCity(q.c); handleSearch(q.n, q.s, q.c); }}>
                  {q.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-elegant">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
      <p className="mt-1 text-2xl font-bold font-display">{value}</p>
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-8 text-center">
      <p className="font-display font-semibold text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
