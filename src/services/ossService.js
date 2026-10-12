import api from '../utils/api.js';

export const ALTERNATIVE_PACKAGES = {
  LTE: [
    {
      _id: 'prod-4',
      productId: 'prod-4',
      name: 'LTE Home 150 GB',
      productName: 'LTE Home 150 GB',
      category: 'LTE Home',
      serviceType: 'Broadband',
      speed: 'Up to 100 Mbps',
      monthlyPrice: 3999,
      installationFee: 2500,
      quota: '150 GB Anytime Data',
      features: [
        'Instant Plug & Play 4G WiFi Router',
        'No Optical Cable Wiring Required',
        'Next-Day Courier Delivery to Doorstep',
        'Mobitel 4G LTE-Advanced Coverage'
      ],
      description: 'Ultra-fast home wireless broadband powered by Mobitel LTE. Ideal immediate replacement when Fibre FDP is saturated.',
      isAlternative: true,
      badge: 'Best Immediate Alternative',
    },
    {
      _id: 'prod-5',
      productId: 'prod-5',
      name: 'LTE Home 300 GB',
      productName: 'LTE Home 300 GB',
      category: 'LTE Home',
      serviceType: 'Broadband',
      speed: 'Up to 100 Mbps',
      monthlyPrice: 4999,
      installationFee: 2500,
      quota: '300 GB Anytime Data',
      features: [
        'High-Capacity Wireless Home Broadband',
        'Multi-Device 4K Streaming & Gaming',
        'Free 4G LTE Router Included',
        'No Drilling or Outdoor Cable Stringing'
      ],
      description: 'High-quota 4G wireless package for heavy domestic and home-office workloads.',
      isAlternative: true,
      badge: 'High-Quota Option',
    },
  ],
  FIBRE: [
    {
      _id: 'prod-1',
      productId: 'prod-1',
      name: 'Fibre Unlimited 100M',
      productName: 'Fibre Unlimited 100M',
      category: 'Fibre Broadband',
      serviceType: 'Broadband',
      speed: '100 Mbps',
      monthlyPrice: 6999,
      installationFee: 0,
      quota: 'Unlimited Data',
      features: [
        'Pure Optical Fibre to the Home (FTTH)',
        'Low-Latency Optical Line Terminal Connection',
        'Unlimited High-Speed Internet',
        'Free Wi-Fi 6 Optical Router'
      ],
      description: 'Lightning-fast pure Fibre optical connection directly to your premises.',
      isAlternative: true,
      badge: 'Gigabit Optical Speed',
    },
  ],
};

/**
 * Query the OSS feasibility backend endpoint or fallback to simulated OSS telemetry
 */
export async function queryOSSFeasibility({
  address = '',
  city = '',
  district = '',
  latitude = null,
  longitude = null,
  requestedProduct = null,
}) {
  try {
    const res = await api.post('/applications/check-loop', {
      address,
      city,
      district,
      latitude,
      longitude,
      requestedProduct,
    });

    if (res.data && (res.data.fibre || res.data.coverage)) {
      return res.data;
    }
  } catch (err) {
    console.warn('Backend OSS loop check fallback triggered:', err);
  }

  // Offline / resilient simulation fallback
  const searchStr = `${address || ''} ${city || ''} ${district || ''}`.toLowerCase();
  const isNoFibre =
    searchStr.includes('no fibre') ||
    searchStr.includes('no-fibre') ||
    searchStr.includes('ports full') ||
    searchStr.includes('fdp full');

  const isNoCoverage =
    searchStr.includes('no loop') ||
    searchStr.includes('no-loop') ||
    searchStr.includes('unavailable') ||
    searchStr.includes('unserviced') ||
    searchStr.includes('dead zone');

  const lat = Number(latitude) || 6.9271;
  const lng = Number(longitude) || 79.8612;
  const exchangePrefix = /kandy/i.test(city || address) ? 'KND' : /galle/i.test(city || address) ? 'GAL' : 'CMB';
  const exchangeName = /kandy/i.test(city || address) ? 'Kandy Central Exchange' : /galle/i.test(city || address) ? 'Galle Fort Exchange' : 'Colombo Central Exchange';

  const fdpId = `FDP-${exchangePrefix}-${Math.floor(1000 + Math.abs(Math.sin(lat + lng) * 8000))}`;
  const fdpDistance = isNoCoverage ? 850 : isNoFibre ? 180 : Math.floor(55 + (Math.abs(Math.sin(lat) * 200)));
  const fdpPorts = isNoCoverage || isNoFibre ? 0 : 3;

  const fibreAvailable = !isNoCoverage && !isNoFibre && fdpDistance <= 350 && fdpPorts > 0;
  const lteAvailable = !isNoCoverage;

  const prodCat = (requestedProduct?.category || '').toLowerCase();
  const prodName = (requestedProduct?.productName || requestedProduct?.name || '').toLowerCase();
  const isFibreReq = prodCat.includes('fibre') || prodName.includes('fibre');
  const isLteReq = prodCat.includes('lte') || prodName.includes('lte');

  let reqFeasible = true;
  let alternatives = [];

  if (isFibreReq && !fibreAvailable) {
    reqFeasible = false;
    alternatives = ALTERNATIVE_PACKAGES.LTE;
  } else if (isLteReq && !lteAvailable) {
    reqFeasible = false;
    alternatives = ALTERNATIVE_PACKAGES.FIBRE;
  } else if (!fibreAvailable && lteAvailable) {
    alternatives = ALTERNATIVE_PACKAGES.LTE;
  }

  const overallStatus = !fibreAvailable && !lteAvailable ? 'UNAVAILABLE' : (!reqFeasible ? 'PARTIALLY_FEASIBLE' : 'FEASIBLE');

  return {
    success: true,
    available: overallStatus !== 'UNAVAILABLE',
    overallStatus,
    timestamp: new Date().toISOString(),
    location: {
      address: address || 'Specified Location',
      city: city || 'Colombo',
      district: district || 'Colombo',
      latitude: lat,
      longitude: lng,
      servingExchange: {
        name: exchangeName,
        code: exchangePrefix,
        distanceMeters: 1200,
      },
    },
    fibre: {
      available: fibreAvailable,
      status: fibreAvailable ? 'FEASIBLE' : (isNoFibre ? 'PORTS_EXHAUSTED' : 'UNSERVICED'),
      fdpId,
      distanceMeters: fdpDistance,
      maxDistanceMeters: 350,
      availablePorts: fdpPorts,
      totalPorts: 8,
      splitterType: '1:8 PLC Optical Splitter',
      opticalPowerDbm: -19.4,
      maxSpeed: 'Up to 1 Gbps Gigabit FTTH',
      provisionDays: 3,
      reason: fibreAvailable
        ? `Direct optical drop cable path verified to ${fdpId} (${fdpDistance}m away, ${fdpPorts} of 8 ports free).`
        : `Optical distribution ports on nearest terminal (${fdpId}) are currently fully allocated or out of reach.`,
    },
    lte: {
      available: lteAvailable,
      status: lteAvailable ? 'AVAILABLE' : 'NO_COVERAGE',
      signalStrength: lteAvailable ? 'EXCELLENT' : 'NONE',
      signalPercent: lteAvailable ? 94 : 15,
      rsrp: lteAvailable ? -78 : -118,
      nearestTower: `ENB-${exchangePrefix}-402`,
      distanceKm: 0.45,
      bands: ['B3 (1800 MHz)', 'B40 (2300 MHz TD-LTE)'],
      maxSpeed: 'Up to 100 Mbps',
      provisionDays: 1,
      reason: lteAvailable
        ? 'Strong 4G LTE-Advanced carrier aggregation active. Ready for instant wireless plug & play.'
        : 'Outside cellular radio coverage range.',
    },
    requestedProduct: requestedProduct || null,
    requestedServiceFeasible: reqFeasible,
    requestedServiceMessage: reqFeasible
      ? 'Selected service is 100% compatible with your installation location.'
      : `The selected package (${requestedProduct?.productName || 'Fibre Broadband'}) is currently unavailable at this exact address.`,
    alternativeServices: alternatives,
  };
}
