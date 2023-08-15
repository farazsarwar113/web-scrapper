const express = require('express');
const validate = require('express-validation');
const controller = require('./scrapper.controller');
const {
  scrapeSite,
} = require('./scrapper.validator');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} v1/scrape Scrape URL
   * @apiDescription Scrape URL and return the data of the page and save the images
   * @apiVersion 1.0.0
   * @apiName ScrapeSite
   * @apiGroup Scrape
   *
   * @apiSuccess (Created 201) {String}  message         Data scraped successfully
   */
  .get(validate(scrapeSite), controller.scrapeSite);

module.exports = router;
