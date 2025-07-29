/**
 * PDF Export Service for FileMaker integration
 * Handles generating static HTML and communicating with FileMaker's print script
 */

/**
 * Exports timecard data as PDF through FileMaker
 * @param {Array} timecardData - The timecard data to export
 * @param {Object} dateRange - The date range information
 * @param {string} timeFormat - The time format (decimal or hhmm)
 * @returns {Promise<boolean>} - Success status
 */
export const exportToPDF = async (timecardData, dateRange, timeFormat) => {
  try {
    // Generate static HTML from timecard data
    const htmlContent = generateTimecardHTML(timecardData, dateRange, timeFormat);
    
    // Check if FileMaker is available
    if (typeof FileMaker === 'undefined') {
      console.warn('FileMaker not available - PDF export not possible in browser mode');
      throw new Error('PDF export is only available when running in FileMaker');
    }
    
    // Call FileMaker script synchronously (no await needed)
    const result = FileMaker.PerformScript('js * print', htmlContent);
    
    // Handle the result
    if (result && result.error) {
      throw new Error(result.error);
    }
    
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
};

/**
 * Generates static HTML content from timecard data
 * @param {Array} timecardData - The timecard data
 * @param {Object} dateRange - The date range information
 * @param {string} timeFormat - The time format
 * @returns {string} - Complete HTML document
 */
const generateTimecardHTML = (timecardData, dateRange, timeFormat) => {
  // Process data using the same logic as TimecardWidget
  const processedData = processTimecardData(timecardData);
  const overallTotals = calculateOverallTotals(processedData);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Timecard Report - ${dateRange ? `${dateRange.startDate} to ${dateRange.endDate}` : 'All Data'}</title>
    <style>
        ${getInlineCSS()}
    </style>
</head>
<body>
    <div class="timecard-report">
        ${generateHeaderHTML(overallTotals, dateRange, timeFormat)}
        ${generateEmployeeCardsHTML(processedData, timeFormat)}
    </div>
    <script>
        ${getInlineJavaScript()}
    </script>
</body>
</html>`;
};

/**
 * Process timecard data using the same logic as TimecardWidget
 */
const processTimecardData = (data) => {
  if (!data || !Array.isArray(data)) return {};

  const employeeData = {};

  // Helper functions
  const roundToQuarter = (hours) => Math.round(hours * 4) / 4;
  
  const getWeekStart = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const calculateHours = (dateTimeIn, dateTimeOut) => {
    if (!dateTimeIn || !dateTimeOut) return 0;
    const timeIn = new Date(dateTimeIn);
    const timeOut = new Date(dateTimeOut);
    const diffMs = timeOut - timeIn;
    return diffMs / (1000 * 60 * 60);
  };

  const getDateFromDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr).toISOString().split('T')[0];
  };

  const getTimeFromDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  data.forEach(record => {
    const fieldData = record.fieldData;
    const employeeName = fieldData.Name;
    const dateTimeIn = fieldData.DateTimeIn;
    const dateTimeOut = fieldData.DateTimeOut;
    const date = getDateFromDateTime(dateTimeIn);
    const totalHours = calculateHours(dateTimeIn, dateTimeOut);
    const weekStart = getWeekStart(date);

    if (!employeeData[employeeName]) {
      employeeData[employeeName] = {
        name: employeeName,
        weeks: {},
        totalRegular: 0,
        totalOvertime: 0,
        totalHours: 0
      };
    }

    if (!employeeData[employeeName].weeks[weekStart]) {
      employeeData[employeeName].weeks[weekStart] = {
        weekStart,
        records: [],
        totalHours: 0,
        regularHours: 0,
        overtimeHours: 0
      };
    }

    employeeData[employeeName].weeks[weekStart].records.push({
      ...fieldData,
      date,
      totalHours,
      timeIn: getTimeFromDateTime(dateTimeIn),
      timeOut: getTimeFromDateTime(dateTimeOut)
    });
    employeeData[employeeName].weeks[weekStart].totalHours += totalHours;
  });

  // Calculate regular/overtime for each week and employee totals
  Object.values(employeeData).forEach(employee => {
    Object.values(employee.weeks).forEach(week => {
      const weekTotal = week.totalHours;
      week.regularHours = Math.min(weekTotal, 40);
      week.overtimeHours = Math.max(weekTotal - 40, 0);
      
      week.regularHours = roundToQuarter(week.regularHours);
      week.overtimeHours = roundToQuarter(week.overtimeHours);
      
      employee.totalRegular += week.regularHours;
      employee.totalOvertime += week.overtimeHours;
      employee.totalHours += week.regularHours + week.overtimeHours;
    });
  });

  return employeeData;
};

/**
 * Calculate overall totals
 */
const calculateOverallTotals = (processedData) => {
  return Object.values(processedData).reduce((acc, employee) => ({
    totalLabor: acc.totalLabor + employee.totalHours,
    totalOvertime: acc.totalOvertime + employee.totalOvertime
  }), { totalLabor: 0, totalOvertime: 0 });
};

/**
 * Format time based on format preference
 */
const formatTime = (hours, timeFormat) => {
  if (timeFormat === 'hhmm') {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  }
  return hours.toFixed(2);
};

/**
 * Round to nearest quarter hour
 */
const roundToQuarter = (hours) => Math.round(hours * 4) / 4;

/**
 * Generate header HTML
 */
const generateHeaderHTML = (overallTotals, dateRange, timeFormat) => {
  return `
    <div class="header-section">
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-label">Total Labor:</span>
          <span class="stat-value">${formatTime(roundToQuarter(overallTotals.totalLabor), timeFormat)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Overtime:</span>
          <span class="stat-value">${formatTime(roundToQuarter(overallTotals.totalOvertime), timeFormat)}</span>
        </div>
        ${dateRange ? `
        <div class="stat-item">
          <span class="stat-label">Pay Period:</span>
          <span class="stat-value">${dateRange.startDate} - ${dateRange.endDate}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
};

/**
 * Generate employee cards HTML
 */
const generateEmployeeCardsHTML = (processedData, timeFormat) => {
  const employees = Object.values(processedData);
  
  return `
    <div class="employee-cards">
      ${employees.map(employee => `
        <div class="employee-card">
          <div class="employee-header">
            <h3 class="employee-name">${employee.name}</h3>
            <div class="employee-totals">
              <span class="total-hours">
                Total: ${formatTime(roundToQuarter(employee.totalHours), timeFormat)}
              </span>
              <span class="regular-hours">
                Regular: ${formatTime(roundToQuarter(employee.totalRegular), timeFormat)}
              </span>
              <span class="overtime-hours">
                Overtime: ${formatTime(roundToQuarter(employee.totalOvertime), timeFormat)}
              </span>
            </div>
          </div>
          <div class="weekly-summaries">
            ${Object.values(employee.weeks)
              .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart))
              .map(week => {
                const weekKey = `${employee.name}-${week.weekStart}`;
                const weekEndDate = new Date(week.weekStart);
                weekEndDate.setDate(weekEndDate.getDate() + 6);
                
                return `
                  <div class="week-summary">
                    <div class="week-header" onclick="toggleWeek('${weekKey}')">
                      <span class="week-dates">
                        Week of ${new Date(week.weekStart).toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}
                      </span>
                      <div class="week-totals">
                        <span class="week-regular">
                          Reg: ${formatTime(week.regularHours, timeFormat)}
                        </span>
                        <span class="week-overtime">
                          OT: ${formatTime(week.overtimeHours, timeFormat)}
                        </span>
                      </div>
                      <span class="expand-icon" id="icon-${weekKey}">▼</span>
                    </div>
                    <div class="week-details" id="details-${weekKey}" style="display: none;">
                      ${week.records
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(record => `
                          <div class="day-record">
                            <span class="day-date">
                              ${new Date(record.date).toLocaleDateString()}
                            </span>
                            <span class="day-times">
                              ${record.timeIn} - ${record.timeOut}
                            </span>
                            <span class="day-info">
                              ${record.DayOfWeek}
                            </span>
                            <span class="day-hours">
                              ${formatTime(record.totalHours, timeFormat)} hrs
                            </span>
                          </div>
                        `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

/**
 * Get inline CSS for the PDF report
 */
const getInlineCSS = () => {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #f8fafc;
      color: #334155;
      line-height: 1.6;
      padding: 20px;
    }
    
    .timecard-report {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      padding: 32px;
    }
    
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .stats-section {
      display: flex;
      gap: 32px;
      align-items: center;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }
    
    .employee-cards {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .employee-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .employee-header {
      background: #f8fafc;
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .employee-name {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    
    .employee-totals {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    
    .total-hours, .regular-hours, .overtime-hours {
      font-size: 14px;
      font-weight: 500;
    }
    
    .total-hours {
      color: #1e293b;
    }
    
    .regular-hours {
      color: #059669;
    }
    
    .overtime-hours {
      color: #d97706;
    }
    
    .weekly-summaries {
      padding: 0;
    }
    
    .week-summary {
      border-bottom: 1px solid #f1f5f9;
    }
    
    .week-summary:last-child {
      border-bottom: none;
    }
    
    .week-header {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .week-header:hover {
      background: #f8fafc;
    }
    
    .week-dates {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }
    
    .week-totals {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    
    .week-regular {
      color: #059669;
      font-size: 14px;
      font-weight: 500;
    }
    
    .week-overtime {
      color: #d97706;
      font-size: 14px;
      font-weight: 500;
    }
    
    .expand-icon {
      font-size: 12px;
      color: #64748b;
      transition: transform 0.2s ease;
    }
    
    .expand-icon.expanded {
      transform: rotate(180deg);
    }
    
    .week-details {
      background: #fafbfc;
      border-top: 1px solid #f1f5f9;
      padding: 16px 20px;
    }
    
    .day-record {
      display: grid;
      grid-template-columns: 120px 1fr 100px 80px;
      gap: 16px;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }
    
    .day-record:last-child {
      border-bottom: none;
    }
    
    .day-date {
      font-weight: 500;
      color: #374151;
    }
    
    .day-times {
      color: #64748b;
    }
    
    .day-hours {
      font-weight: 500;
      color: #1e293b;
      text-align: right;
    }
    
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      
      .timecard-report {
        box-shadow: none;
        border-radius: 0;
      }
    }
  `;
};

/**
 * Get inline JavaScript for expand/collapse functionality
 */
const getInlineJavaScript = () => {
  return `
    function toggleWeek(weekKey) {
      const details = document.getElementById('details-' + weekKey);
      const icon = document.getElementById('icon-' + weekKey);
      
      if (details.style.display === 'none' || details.style.display === '') {
        details.style.display = 'block';
        icon.classList.add('expanded');
      } else {
        details.style.display = 'none';
        icon.classList.remove('expanded');
      }
    }
  `;
};