import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/libs/redis';

// Cache redis duration (4 hours)
const CACHE_REDIS_DURATION = 4 * 60 * 60;

/**
 * Search for symbols using Financial Modeling Prep API
 * Supports: stocks, bonds, cryptocurrencies, etfs, funds, options, and futures
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
    
    // Generate cache key based on query and type
    const cacheKey = `symbol_search:${type}:${query.toLowerCase()}`;
    
    // Try to get from cache first (wrapped in try/catch to handle Redis errors)
    let cachedResults = null;
    try {
      cachedResults = await getCache(cacheKey);
    } catch (cacheError) {
      console.error('Redis cache error:', cacheError);
      // Continue without cache if there's an error
    }
    
    if (cachedResults) {
      return NextResponse.json(cachedResults);
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
    
    // Try to cache the results (wrapped in try/catch to handle Redis errors)
    try {
      await setCache(cacheKey, resultsWithImages, CACHE_REDIS_DURATION);
    } catch (cacheError) {
      console.error('Redis cache set error:', cacheError);
      // Continue without caching if there's an error
    }
    
    return NextResponse.json(resultsWithImages);
  } catch (error) {
    console.error('Symbol search error:', error);
    return NextResponse.json(
      { error: 'Failed to search symbols' },
      { status: 500 }
    );
  }
} 