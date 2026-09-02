import {
  FiRefreshCw,
  FiMapPin,
  FiRepeat,
  FiTrendingUp,
  FiSun,
  FiDollarSign,
  FiFileText,
} from 'react-icons/fi';

// Icons use the single brand blue on a neutral tile — colour is reserved for
// conveying state, not for decorating each service differently.
//
// Shared between the landing-page quick-service tiles (HeroBannerCarousel)
// and the navbar's mobile "Services" dropdown, so both stay in sync.
// Track Application is deliberately excluded — it's already the
// "Application Status" link in the main nav, so listing it here too
// would just be a duplicate destination.
export const QUICK_SERVICES = [
  {
    id: 'reconnection',
    title: 'Reconnection',
    desc: 'Reconnect your disconnected service',
    route: '/reconnection',
    icon: FiRefreshCw,
    bgColor: '#eff6ff',
    iconColor: '#0b4a91',
  },
  {
    id: 'relocation',
    title: 'Relocation',
    desc: 'Move your connection to a new address',
    route: '/location-change',
    icon: FiMapPin,
    bgColor: '#eff6ff',
    iconColor: '#0b4a91',
  },
  {
    id: 'transfer',
    title: 'Transfer',
    desc: 'Transfer ownership of an existing connection',
    route: '/ownership-change',
    icon: FiRepeat,
    bgColor: '#eff6ff',
    iconColor: '#0b4a91',
  },
  {
    id: 'package-migration',
    title: 'Package Migration',
    desc: 'Migrate or upgrade to a new package',
    route: '/package-migration',
    icon: FiTrendingUp,
    bgColor: '#eff6ff',
    iconColor: '#0b4a91',
  },
  {
    id: 'service-vacation',
    title: 'Service Vacation',
    desc: 'Apply for temporary service vacation',
    route: '/service-vacation',
    icon: FiSun,
    bgColor: '#eff6ff',
    iconColor: '#0b4a91',
  },
  {
    id: 'refund-request',
    title: 'Refund Request',
    desc: 'Request a refund for deposits or overpayments',
    route: '/refund-request',
    icon: FiDollarSign,
    bgColor: '#eff6ff',
    iconColor: '#0b4a91',
  },
  {
    id: 'customer-request',
    title: 'General Customer Request',
    desc: 'Submit general requests or service inquiries',
    route: '/customer-request-acceptance',
    icon: FiFileText,
    bgColor: '#eff6ff',
    iconColor: '#0b4a91',
  },
];
