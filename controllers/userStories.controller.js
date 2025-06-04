const sqlPool = require("../database");

const storiesController = {
  getStories: async (req, res) => {
    try {
      const { page, perPage } = req.query;
      const [stories] = await sqlPool.query(
        "select * from news ORDER BY id DESC LIMIT ? OFFSET ?",
        [parseInt(perPage), (parseInt(page)-1)*parseInt(perPage)]
      );
      
      const [total] = await sqlPool.query("select count(*) as total from news");

      res.json({
        stories: stories,
        total: total[0].total,
      });
      
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getStory: async (req, res) => {
    try {
      const [story] = await sqlPool.query(`Select * From news WHERE id=?`, [
        req.params.id,
      ]);
      res.json(story[0]);
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = storiesController;
