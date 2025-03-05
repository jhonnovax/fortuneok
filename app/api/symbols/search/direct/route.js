import { NextResponse } from 'next/server';

/**
 * Direct search for symbols using Financial Modeling Prep API without Redis caching
 * This is a fallback endpoint in case the main endpoint with Redis caching fails
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'all';
    
    // Validate query
    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: 'Query parameter is required and must be at least 1 character' },
        { status: 400 }
      );
    }
    
    // Map type to FMP API endpoint
    const typeEndpoints = {
      'all': ['search'],
      'stocks': ['search'],
      'bonds': ['search-bond'],
      'cryptocurrencies': ['search-crypto'],
      'etfs': ['search-etf'],
      'funds': ['search-fund'],
      'options': ['search-option'],
      'futures': ['search-future']
    };
    
    // Get endpoints to search based on type
    const endpoints = type === 'all' 
      ? Object.values(typeEndpoints).flat() 
      : typeEndpoints[type] || ['search'];
    
    // Fetch results from all relevant endpoints
    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const url = `https://financialmodelingprep.com/api/v3/${endpoint}?query=${encodeURIComponent(query)}&apikey=${process.env.FMP_API_KEY}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            console.error(`API error for ${endpoint}:`, response.statusText);
            return [];
          }
          
          return await response.json();
        } catch (fetchError) {
          console.error(`Fetch error for ${endpoint}:`, fetchError);
          return [];
        }
      })
    );
    
    // Flatten and deduplicate results
    const flattenedResults = results.flat();
    const uniqueResults = Array.from(
      new Map(flattenedResults.map(item => [item.symbol, item])).values()
    );
    
    // Sort results by relevance (exact match first, then starts with, then contains)
    const sortedResults = uniqueResults.sort((a, b) => {
      const aSymbol = a.symbol?.toLowerCase() || '';
      const bSymbol = b.symbol?.toLowerCase() || '';
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Exact symbol match gets highest priority
      if (aSymbol === queryLower && bSymbol !== queryLower) return -1;
      if (bSymbol === queryLower && aSymbol !== queryLower) return 1;
      
      // Symbol starts with query gets next priority
      if (aSymbol.startsWith(queryLower) && !bSymbol.startsWith(queryLower)) return -1;
      if (bSymbol.startsWith(queryLower) && !aSymbol.startsWith(queryLower)) return 1;
      
      // Name starts with query gets next priority
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
      if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
      
      // Default to alphabetical order by symbol
      return aSymbol.localeCompare(bSymbol);
    });
    
    // Limit to 20 results
    const limitedResults = sortedResults.slice(0, 20);
    
    // Add image URLs for each result
    const resultsWithImages = limitedResults.map(item => ({
      ...item,
      image: `https://financialmodelingprep.com/image-stock/${item.symbol}.png`
    }));
    
    return NextResponse.json(resultsWithImages);
  } catch (error) {
    console.error('Symbol search error:', error);
    return NextResponse.json(
      { error: 'Failed to search symbols' },
      { status: 500 }
    );
  }
} 