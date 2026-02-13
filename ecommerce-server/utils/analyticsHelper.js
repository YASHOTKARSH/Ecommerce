/**
 * Calculate total revenue from orders
 * @param {Array} orders - Array of order objects
 * @returns {Number} - Total revenue
 */
const calculateRevenue = (orders) => {
  return orders.reduce((total, order) => {
    if (order.paymentStatus === 'completed') {
      return total + order.totalAmount;
    }
    return total;
  }, 0);
};

/**
 * Group orders by date with specified granularity
 * @param {Array} orders - Array of order objects
 * @param {String} granularity - 'day', 'week', 'month'
 * @returns {Object} - Grouped data by date
 */
const groupByDate = (orders, granularity = 'day') => {
  const grouped = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    let key;

    switch (granularity) {
      case 'day':
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        count: 0,
        revenue: 0,
        orders: [],
      };
    }

    grouped[key].count += 1;
    grouped[key].orders.push(order);
    if (order.paymentStatus === 'completed') {
      grouped[key].revenue += order.totalAmount;
    }
  });

  return grouped;
};

/**
 * Get start and end dates for a given period
 * @param {String} period - 'today', 'week', 'month', 'year'
 * @returns {Object} - { startDate, endDate }
 */
const getDateRange = (period) => {
  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
};

/**
 * Calculate growth rate between current and previous values
 * @param {Number} current - Current value
 * @param {Number} previous - Previous value
 * @returns {Number} - Growth rate as percentage
 */
const calculateGrowthRate = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

module.exports = {
  calculateRevenue,
  groupByDate,
  getDateRange,
  calculateGrowthRate,
};
