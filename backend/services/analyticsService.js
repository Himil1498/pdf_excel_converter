const db = require('../config/database');

class AnalyticsService {
  /**
   * Get cost analytics for dashboard
   */
  async getCostAnalytics(filters = {}) {
    try {
      const { startDate, endDate, vendor, circuitId } = filters;

      let query = `
        SELECT
          DATE_FORMAT(bill_date, '%Y-%m') as month,
          vendor_name,
          COUNT(*) as invoice_count,
          SUM(total) as total_amount,
          SUM(recurring_charges) as total_recurring,
          SUM(one_time_charges) as total_onetime,
          AVG(total) as avg_amount,
          MIN(total) as min_amount,
          MAX(total) as max_amount
        FROM invoice_data
        WHERE 1=1
      `;

      const params = [];

      if (startDate) {
        query += ' AND bill_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND bill_date <= ?';
        params.push(endDate);
      }
      if (vendor) {
        query += ' AND vendor_name = ?';
        params.push(vendor);
      }
      if (circuitId) {
        query += ' AND circuit_id = ?';
        params.push(circuitId);
      }

      query += ' GROUP BY month, vendor_name ORDER BY month DESC';

      const [results] = await db.query(query, params);
      return results;
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }

  /**
   * Get circuit-wise cost breakdown
   */
  async getCircuitCostBreakdown(filters = {}) {
    const { startDate, endDate, limit = 20 } = filters;

    let query = `
      SELECT
        circuit_id,
        company_name,
        bandwidth_mbps,
        COUNT(*) as invoice_count,
        SUM(total) as total_cost,
        AVG(total) as avg_monthly_cost,
        MAX(bill_date) as last_invoice_date
      FROM invoice_data
      WHERE circuit_id IS NOT NULL
    `;

    const params = [];

    if (startDate) {
      query += ' AND bill_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND bill_date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY circuit_id, company_name, bandwidth_mbps';
    query += ' ORDER BY total_cost DESC LIMIT ?';
    params.push(limit);

    const [results] = await db.query(query, params);
    return results;
  }

  /**
   * Get vendor comparison stats
   */
  async getVendorComparison() {
    const [results] = await db.query(`
      SELECT
        vendor_name,
        COUNT(DISTINCT circuit_id) as circuit_count,
        COUNT(*) as invoice_count,
        SUM(total) as total_amount,
        AVG(total) as avg_invoice_amount,
        SUM(bandwidth_mbps) as total_bandwidth
      FROM invoice_data
      WHERE vendor_name IS NOT NULL
      GROUP BY vendor_name
      ORDER BY total_amount DESC
    `);

    return results;
  }

  /**
   * Get monthly trend data
   */
  async getMonthlyTrend(months = 12) {
    const [results] = await db.query(`
      SELECT
        DATE_FORMAT(bill_date, '%Y-%m') as month,
        COUNT(*) as invoice_count,
        SUM(total) as total_amount,
        SUM(recurring_charges) as recurring_amount,
        SUM(tax_amount) as tax_amount,
        COUNT(DISTINCT circuit_id) as active_circuits
      FROM invoice_data
      WHERE bill_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY month
      ORDER BY month ASC
    `, [months]);

    return results;
  }

  /**
   * Get cost distribution by bandwidth
   */
  async getCostByBandwidth() {
    const [results] = await db.query(`
      SELECT
        bandwidth_mbps,
        COUNT(*) as circuit_count,
        SUM(total) as total_cost,
        AVG(total) as avg_cost
      FROM invoice_data
      WHERE bandwidth_mbps IS NOT NULL
      GROUP BY bandwidth_mbps
      ORDER BY bandwidth_mbps ASC
    `);

    return results;
  }

  /**
   * Get top spending circuits
   */
  async getTopSpendingCircuits(limit = 10) {
    const [results] = await db.query(`
      SELECT
        circuit_id,
        company_name,
        city,
        state,
        bandwidth_mbps,
        SUM(total) as total_spent,
        COUNT(*) as invoice_count,
        AVG(total) as avg_monthly
      FROM invoice_data
      WHERE circuit_id IS NOT NULL
      GROUP BY circuit_id, company_name, city, state, bandwidth_mbps
      ORDER BY total_spent DESC
      LIMIT ?
    `, [limit]);

    return results;
  }

  /**
   * Get payment due alerts
   */
  async getPaymentDueInvoices(daysAhead = 7) {
    const [results] = await db.query(`
      SELECT
        id.bill_number,
        id.due_date,
        id.total,
        id.company_name,
        id.circuit_id,
        b.batch_name,
        DATEDIFF(id.due_date, CURDATE()) as days_until_due
      FROM invoice_data id
      JOIN upload_batches b ON id.batch_id = b.id
      WHERE id.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY id.due_date ASC
    `, [daysAhead]);

    return results;
  }

  /**
   * Get comprehensive dashboard stats
   */
  async getDashboardStats() {
    const [totalStats] = await db.query(`
      SELECT
        COUNT(DISTINCT batch_id) as total_batches,
        COUNT(*) as total_invoices,
        SUM(total) as total_amount,
        AVG(total) as avg_invoice_amount,
        COUNT(DISTINCT circuit_id) as unique_circuits,
        COUNT(DISTINCT vendor_name) as vendor_count
      FROM invoice_data
    `);

    const [recentActivity] = await db.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as invoice_count
      FROM invoice_data
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    return {
      summary: totalStats[0],
      recentActivity
    };
  }
}

module.exports = new AnalyticsService();
