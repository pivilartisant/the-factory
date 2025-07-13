/**
 * Format salary information from job function data
 */

function formatSalary(jobFunction) {
  if (!jobFunction || (!jobFunction.min_amount && !jobFunction.max_amount)) {
    return null;
  }

  const currency = jobFunction.currency || 'USD';
  const interval = jobFunction.interval || 'yearly';
  
  // Format currency amounts
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Build salary string
  let salaryStr = '';
  
  if (jobFunction.min_amount && jobFunction.max_amount) {
    salaryStr = `${formatAmount(jobFunction.min_amount)} - ${formatAmount(jobFunction.max_amount)}`;
  } else if (jobFunction.min_amount) {
    salaryStr = `${formatAmount(jobFunction.min_amount)}+`;
  } else if (jobFunction.max_amount) {
    salaryStr = `Up to ${formatAmount(jobFunction.max_amount)}`;
  }

  // Add interval
  const intervalMap = {
    'yearly': 'per year',
    'monthly': 'per month',
    'weekly': 'per week',
    'daily': 'per day',
    'hourly': 'per hour'
  };

  const intervalText = intervalMap[interval] || 'per year';
  
  return `${salaryStr} ${intervalText}`;
}

module.exports = { formatSalary };
