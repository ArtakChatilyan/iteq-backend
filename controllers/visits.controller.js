const sqlPool = require("../database");

function parseDateRange(req) {
  const start = req.query.start ? new Date(req.query.start) : null;
  const end = req.query.end ? new Date(req.query.end) : null;
  return { start, end };
}

const visitsController = {
  getSummary: async (req, res) => {
    try {
      const { start, end } = parseDateRange(req);
      let where = "";
      const params = [];
      if (start) {
        where += " WHERE visit_time >= ?";
        params.push(start);
      }
      if (end) {
        where += where ? " AND visit_time <= ?" : " WHERE visit_time <= ?";
        params.push(end);
      }

      const totalQ = `SELECT COUNT(*) AS total FROM visits${where}`;
      const uniqueQ = `SELECT COUNT(DISTINCT ip_address) AS uniqueIps FROM visits${where}`;

      const [totalRows] = await sqlPool.query(totalQ, params);
      const [uniqueRows] = await sqlPool.query(uniqueQ, params);

      // visits today (server timezone). If date range provided, skip
      let todayCount = 0;
      if (!start && !end) {
        const [tRows] = await sqlPool.query(
          "SELECT COUNT(*) AS today FROM visits WHERE DATE(visit_time)=CURDATE()"
        );
        todayCount = tRows[0].today;
      }

      res.json({
        total: totalRows[0].total,
        uniqueIps: uniqueRows[0].uniqueIps,
        today: todayCount,
      });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getPages: async (req, res) => {
    try {
      const { start, end } = parseDateRange(req);
      let where = "";
      const params = [];
      if (start) {
        where += " WHERE visit_time >= ?";
        params.push(start);
      }
      if (end) {
        where += where ? " AND visit_time <= ?" : " WHERE visit_time <= ?";
        params.push(end);
      }

      const q = `SELECT page_url, COUNT(*) AS cnt FROM visits ${where} GROUP BY page_url ORDER BY cnt DESC`;
      const [rows] = await sqlPool.query(q, params);
      res.json(rows);
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getCountries: async (req, res) => {
    try {
      const { start, end } = parseDateRange(req);
      let where = "";
      const params = [];
      if (start) {
        where += " WHERE visit_time >= ?";
        params.push(start);
      }
      if (end) {
        where += where ? " AND visit_time <= ?" : " WHERE visit_time <= ?";
        params.push(end);
      }

      const q = `SELECT country, COUNT(*) AS cnt FROM visits ${where} GROUP BY country ORDER BY cnt DESC`;
      const [rows] = await sqlPool.query(q, params);
      res.json(rows);
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getTimeseries: async (req, res) => {
    try {
      // require start and end for timeseries
      const { start, end } = parseDateRange(req);
      if (!start || !end)
        return res
          .status(400)
          .json({ error: "start and end required (YYYY-MM-DD)" });

      const q = `SELECT DATE(visit_time) AS day, COUNT(*) AS cnt
FROM visits
WHERE visit_time BETWEEN ? AND ?
GROUP BY day
ORDER BY day`;
      const [rows] = await sqlPool.query(q, [start, end]);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.json({ state: error });
    }
  },

  addVisit: async (req, res) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection.remoteAddress;

      const { page_url, referrer } = req.body;
      const user_agent = req.headers["user-agent"];

      // Optional: get country by IP
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geoData = await geoRes.json();
      const country = geoData.country_name || "Unknown";

      await sqlPool.query(
        `INSERT INTO visits (ip_address, country, page_url, user_agent, referrer)
       VALUES (?, ?, ?, ?, ?)`,
        [ip, country, page_url, user_agent, referrer]
      );

      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = visitsController;
