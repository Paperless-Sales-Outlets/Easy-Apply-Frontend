import {
  FiRefreshCw,
  FiMapPin,
  FiRepeat,
  FiTrendingUp,
  FiSun,
  FiDollarSign,
  FiFileText,
} from 'react-icons/fi';

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
    bgColor: '#e6f4ea',
    iconColor: '#137333',
  },
  {
    id: 'relocation',
    title: 'Relocation',
    desc: 'Move your connection to a new address',
    route: '/location-change',
    icon: FiMapPin,
    bgColor: '#e8f0fe',
    iconColor: '#1a73e8',
  },
  {
    id: 'transfer',
    title: 'Transfer',
    desc: 'Transfer ownership of an existing connection',
    route: '/ownership-change',
    icon: FiRepeat,
    bgColor: '#f3e8ff',
    iconColor: '#9333ea',
  },
  {
    id: 'package-migration',
    title: 'Package Migration',
    desc: 'Migrate or upgrade to a new package',
    route: '/package-migration',
    icon: FiTrendingUp,
    bgColor: '#ffedd5',
    iconColor: '#ea580c',
  },
  {
    id: 'service-vacation',
    title: 'Service Vacation',
    desc: 'Apply for temporary service vacation',
    route: '/service-vacation',
    icon: FiSun,
    bgColor: '#fae8ff',
    iconColor: '#c026d3',
  },
  {
    id: 'refund-request',
    title: 'Refund Request',
    desc: 'Request a refund for deposits or overpayments',
    route: '/refund-request',
    icon: FiDollarSign,
    bgColor: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    id: 'customer-request',
    title: 'General Customer Request',
    desc: 'Submit general requests or service inquiries',
    route: '/customer-request-acceptance',
    icon: FiFileText,
    bgColor: '#dcfce7',
    iconColor: '#16a34a',
  },
];
