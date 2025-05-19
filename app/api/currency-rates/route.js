import { NextResponse } from "next/server"
import { getConversionRates } from "@/services/conversionRatesService";

export async function GET(req) {

  try {
    const searchParams = req.nextUrl.searchParams
    const baseCurrency = searchParams.get('baseCurrency') || 'USD';
    const conversionRates = await getConversionRates(baseCurrency)

    return NextResponse.json(conversionRates || {}); 

  } catch (error) {
    console.error('Error getting conversion rates:', error);
    return NextResponse.json({ error }, { status: 500 })
  }

}