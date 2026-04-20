export const getCurrencyInfo = (preferredRegion = null) => {
  try {
    const regionToCurrency = {
      'US': { code: 'USD', symbol: '$' },
      'USA': { code: 'USD', symbol: '$' },
      'United States': { code: 'USD', symbol: '$' },
      'UK': { code: 'GBP', symbol: '£' },
      'United Kingdom': { code: 'GBP', symbol: '£' },
      'EUR': { code: 'EUR', symbol: '€' },
      'JP': { code: 'JPY', symbol: '¥' },
      'IN': { code: 'INR', symbol: '₹' },
      'India': { code: 'INR', symbol: '₹' },
      'PK': { code: 'PKR', symbol: 'Rs' },
      'Pakistan': { code: 'PKR', symbol: 'Rs' },
      'CN': { code: 'CNY', symbol: '¥' },
      'AE': { code: 'AED', symbol: 'د.إ' },
      'UAE': { code: 'AED', symbol: 'د.إ' },
      'United Arab Emirates': { code: 'AED', symbol: 'د.إ' },
    };

    // 1. Prioritize explicitly passed region from Company Profile
    if (preferredRegion && regionToCurrency[preferredRegion]) {
       return regionToCurrency[preferredRegion];
    }

    const locale = navigator.language || 'en-US';
    const regionFromLocale = locale.split('-')[1] || locale.split('_')[1];
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // 2. Secondary: Prioritize timezone detection
    if (tz && tz.includes('Karachi')) return regionToCurrency['PK'];
    if (tz && tz.includes('Dubai')) return regionToCurrency['AE'];
    if (tz && tz.includes('London')) return regionToCurrency['GB'];
    if (tz && tz.includes('Tokyo')) return regionToCurrency['JP'];
    if (tz && tz.includes('Calcutta') || tz && tz.includes('Kolkata')) return regionToCurrency['IN'];

    // 3. Fallback to locale region
    if (regionFromLocale && regionToCurrency[regionFromLocale]) {
      return regionToCurrency[regionFromLocale];
    }

    // Locale string shortcuts
    if (locale.startsWith('en-GB')) return regionToCurrency['GB'];
    if (locale.startsWith('en-IN')) return regionToCurrency['IN'];
    if (locale.startsWith('ur-PK') || locale.startsWith('en-PK')) return regionToCurrency['PK'];
    
    return { code: 'USD', symbol: '$' };
  } catch (e) {
    return { code: 'USD', symbol: '$' };
  }
};

export const formatCurrency = (amount, preferredRegion = null) => {
  const { code } = getCurrencyInfo(preferredRegion);
  return new Intl.NumberFormat(navigator.language || 'en-US', {
    style: 'currency',
    currency: code
  }).format(amount);
};
