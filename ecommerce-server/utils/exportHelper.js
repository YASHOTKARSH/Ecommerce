/**
 * Export orders to CSV format
 * @param {Array} orders - Array of order objects
 * @returns {String} - CSV formatted string
 */
const exportOrdersToCSV = (orders) => {
  if (!orders || orders.length === 0) {
    return 'No orders to export';
  }

  // CSV headers
  const headers = [
    'Order ID',
    'User Email',
    'User Name',
    'Total Amount',
    'Order Status',
    'Payment Status',
    'Payment Method',
    'Created At',
    'Items Count',
  ];

  // Convert orders to CSV rows
  const rows = orders.map((order) => {
    const userEmail = order.user?.email || 'N/A';
    const userName = order.user?.name || 'N/A';
    const itemsCount = order.items?.length || 0;
    const createdAt = new Date(order.createdAt).toLocaleString();

    return [
      order._id,
      userEmail,
      userName,
      order.totalAmount,
      order.orderStatus,
      order.paymentStatus,
      order.paymentMethod,
      createdAt,
      itemsCount,
    ].join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Export users to CSV format
 * @param {Array} users - Array of user objects
 * @returns {String} - CSV formatted string
 */
const exportUsersToCSV = (users) => {
  if (!users || users.length === 0) {
    return 'No users to export';
  }

  // CSV headers
  const headers = [
    'User ID',
    'Name',
    'Email',
    'Role',
    'Is Banned',
    'Last Login',
    'Created At',
  ];

  // Convert users to CSV rows
  const rows = users.map((user) => {
    const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';
    const createdAt = new Date(user.createdAt).toLocaleString();

    return [
      user._id,
      user.name,
      user.email,
      user.role,
      user.isBanned ? 'Yes' : 'No',
      lastLogin,
      createdAt,
    ].join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
};

module.exports = {
  exportOrdersToCSV,
  exportUsersToCSV,
};
