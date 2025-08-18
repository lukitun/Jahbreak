import axios from 'axios';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: ExchangeRates;
}

class CurrencyConverter {
  private cache: Map<string, { rates: ExchangeRates; timestamp: number }> = new Map();
  private cacheExpiry = 60 * 60 * 1000; // 1 hour

  async getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
    const cacheKey = baseCurrency;
    const cached = this.cache.get(cacheKey);

    // Return cached rates if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.rates;
    }

    try {
      // Using a free exchange rate API (you can replace with your preferred service)
      const response = await axios.get<CurrencyResponse>(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );

      if (response.data.success !== false) {
        const rates = response.data.rates;
        this.cache.set(cacheKey, { rates, timestamp: Date.now() });
        return rates;
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }

    // Fallback rates if API fails
    return this.getFallbackRates(baseCurrency);
  }

  async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const rates = await this.getExchangeRates(fromCurrency);
      const rate = rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }

      return amount * rate;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }

  async convertToUserCurrency(amount: number, fromCurrency: string, userCurrency: string): Promise<number> {
    return this.convertAmount(amount, fromCurrency, userCurrency);
  }

  private getFallbackRates(baseCurrency: string): ExchangeRates {
    // Fallback rates (approximate) - in production, you might want to store these in a database
    const fallbackRates: { [key: string]: ExchangeRates } = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        CNY: 6.45,
        INR: 74.5,
        USD: 1.0
      },
      EUR: {
        USD: 1.18,
        GBP: 0.86,
        JPY: 129.5,
        CAD: 1.47,
        AUD: 1.59,
        CHF: 1.08,
        CNY: 7.6,
        INR: 87.8,
        EUR: 1.0
      }
    };

    return fallbackRates[baseCurrency] || fallbackRates.USD;
  }

  getSupportedCurrencies(): string[] {
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
  }

  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      INR: '₹'
    };

    return symbols[currency] || currency;
  }

  formatAmount(amount: number, currency: string): string {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export default new CurrencyConverter();