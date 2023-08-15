const Joi = require('joi');

module.exports = {

  // GET /v1/scrape
  scrapeSite: {
    query: {
      page: Joi.number().min(1).optional(),
    },
  },
};
