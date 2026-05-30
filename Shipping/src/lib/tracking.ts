export function generateTrackingNumber(): string {
  const prefix = '7894';
  const random = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `${prefix}${random}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'delivered': return 'text-green-600';
    case 'out_for_delivery': return 'text-blue-600';
    case 'in_transit': return 'text-orange-500';
    case 'pending': return 'text-gray-500';
    case 'exception': return 'text-red-600';
    default: return 'text-gray-500';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
    case 'in_transit': return 'bg-orange-100 text-orange-800';
    case 'pending': return 'bg-gray-100 text-gray-800';
    case 'exception': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'delivered': return 'Delivered';
    case 'out_for_delivery': return 'Out for Delivery';
    case 'in_transit': return 'In Transit';
    case 'pending': return 'Label Created';
    case 'exception': return 'Exception';
    case 'picked_up': return 'Picked Up';
    case 'label_created': return 'Label Created';
    default: return status.replace(/_/g, ' ');
  }
}

export function getProgressStep(status: string): number {
  switch (status) {
    case 'pending':
    case 'label_created': return 1;
    case 'picked_up': return 2;
    case 'in_transit': return 3;
    case 'out_for_delivery': return 4;
    case 'delivered': return 5;
    case 'exception': return 3;
    default: return 1;
  }
}

export function calculateShippingRate(
  serviceType: string,
  weight: number,
  _originZip: string,
  _destZip: string
): number {
  const base: Record<string, number> = {
    overnight: 89.99,
    '2day': 45.50,
    ground: 12.75,
    international: 189.99,
  };
  const baseRate = base[serviceType] ?? 12.75;
  const weightRate = weight * (serviceType === 'ground' ? 0.85 : 1.45);
  return Math.round((baseRate + weightRate) * 100) / 100;
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
