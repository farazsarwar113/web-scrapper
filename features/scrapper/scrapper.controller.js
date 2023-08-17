/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const scrapeMsg = require('./scrapper.messages');

const downloadImage = (url, index, folderPath, browser) => new Promise(async (resolve, reject) => {
  try {
    const imageUrl = url;
    const imageExtension = path.extname(imageUrl).split('?')[0];
    const imageName = `${index}${imageExtension}`;
    const imagePath = path.join(folderPath, imageName);
    const imagePage = await browser.newPage();
    await imagePage.goto(imageUrl);
    await imagePage.screenshot({ path: imagePath });
    await imagePage.close();
    return resolve();
  } catch (err) {
    return reject(err);
  }
});

const scrapeListItem = (item, browser) => new Promise(async (resolve, reject) => {
  try {
    const title = await item.$eval('.card-title', (idElement) => idElement.textContent.trim());
    const productId = await item.evaluate((el) => el.getAttribute('data-product-id'));
    const priceUSD = await item.$eval('.item-price-usd', (priceElement) => priceElement.textContent.trim());
    const priceGEL = await item.$eval('.item-price-gel', (priceElement) => priceElement.textContent.trim());
    const address = await item.$eval('.address', (addressElement) => addressElement.textContent.trim());
    const description = await item.$eval('.description', (descriptionElement) => descriptionElement.textContent.trim());
    const area = await item
      .$eval('.item-size', (areaElement) => areaElement.textContent.trim())
      .catch(() => '');
    const rooms = await item
      .$eval('.door + span', (roomsElement) => parseInt(roomsElement.textContent.trim().replace('Room ', ''), 10))
      .catch(() => '');
    const bedrooms = await item
      .$eval('.bed + span', (bedRoomsElement) => parseInt(bedRoomsElement.textContent.trim().replace('Br ', ''), 10))
      .catch(() => '');
    const productLink = await item.$eval('.card-container', (linkElement) => linkElement.getAttribute('href'));

    const newPage = await browser.newPage();
    await newPage.goto(productLink);

    const floor = await newPage
      .$eval('.floor + div', (floorElement) => {
        const floorText = floorElement.innerText;
        let totalFloors = '1';
        let flatFloor = '1';
        if (floorText.includes('Floor')) {
          [flatFloor, totalFloors] = floorText.replace('\nFloor', '').split('/');
        } else if (floorText.includes('Number of storeys')) {
          flatFloor = floorText.replace('\nNumber of storeys ', '');
          totalFloors = flatFloor;
        }
        return {
          flatFloor: parseInt(flatFloor, 10),
          totalFloors: parseInt(totalFloors, 10),
        };
      })
      .catch(() => '');

    const location = await newPage
      .$eval('[data-lat]', (locationElement) => ({
        lat: parseFloat(locationElement.getAttribute('data-lat')),
        lng: parseFloat(locationElement.getAttribute('data-lng')),
      }))
      .catch(() => '');

    const imageElements = await newPage.$$('.swiper-slide img');
    const imageUrls = [];
    for (const imageElement of imageElements) {
      const imageUrl = await imageElement.evaluate((img) => img.getAttribute('data-src'));
      if (imageUrl) {
        imageUrls.push(imageUrl);
      }
    }

    const folderPath = path.join(__dirname, productId);
    await fs.mkdir(folderPath, { recursive: true });

    await Promise.all(
      imageUrls.map((url, index) => downloadImage(url, index, folderPath, browser)),
    );
    await newPage.close();
    const infoFilePath = path.join(folderPath, 'info.txt');
    const infoContent = `${JSON.stringify({
      title,
      address,
      productId,
      priceUSD,
      priceGEL,
      bedrooms,
      rooms,
      area,
      description,
      location,
      ...floor,
    })}`;
    // FS promises used for async write
    await fs.writeFile(infoFilePath, infoContent);
    return resolve();
  } catch (err) {
    return reject(err);
  }
});

const scrapeSite = async (req, res, next) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const url = `https://www.myhome.ge/en/s/Apartment-for-rent-Tbilisi?Keyword=%E1%83%97%E1
    %83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98&AdTypeID=
    3&PrTypeID=1&mapC=41.73188365%2C44.8368762993663&regions=687602533&di
    stricts=5469869&cities=1996871&GID=1996871&OwnerTypeID=1`;
    await page.goto(url);

    await page.waitForSelector('.statement-row-search .statement-card');

    const items = await page.$$('[data-product-id]');
    for (const item of items) {
      await scrapeListItem(item, browser);
    }
    await browser.close();
    return res.json({
      message: scrapeMsg.SUCCESS_SCRAPE,
    });
  } catch (err) {
    err.message = scrapeMsg.ERROR_SCRAPE;
    return next(err);
  }
};

module.exports = {
  scrapeSite,
};
