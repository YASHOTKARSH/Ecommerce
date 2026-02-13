/**
 * Escape CSV field to prevent CSV injection
 * @param {String} field - Field value to escape
 * @returns {String} - Escaped field value
 */
const escapeCSVField = (field) => {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringField = String(field);
  
  // Check if field contains special characters that need escaping
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
    // Wrap in quotes and escape internal quotes by doubling them
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  // Prevent formula injection by prefixing with single quote if it starts with =, +, -, or @
  if (stringField.match(/^[=+\-@]/)) {
    return `'${stringField}`;
  }
  
  return stringField;
};

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
      escapeCSVField(order._id),
      escapeCSVField(userEmail),
      escapeCSVField(userName),
      escapeCSVField(order.totalAmount),
      escapeCSVField(order.orderStatus),
      escapeCSVField(order.paymentStatus),
      escapeCSVField(order.paymentMethod),
      escapeCSVField(createdAt),
      escapeCSVField(itemsCount),
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
      escapeCSVField(user._id),
      escapeCSVField(user.name),
      escapeCSVField(user.email),
      escapeCSVField(user.role),
      escapeCSVField(user.isBanned ? 'Yes' : 'No'),
      escapeCSVField(lastLogin),
      escapeCSVField(createdAt),
    ].join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
};

module.exports = {
  exportOrdersToCSV,
  exportUsersToCSV,
};
