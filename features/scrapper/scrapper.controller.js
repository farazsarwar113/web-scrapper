/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

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

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      // const title = await item.$eval('.card-title', (idElement) => idElement.textContent.trim());
      const productId = await item.evaluate((el) => el.getAttribute('data-product-id'));
      const priceUSD = await item.$eval('.item-price-usd', (priceElement) => priceElement.textContent.trim());
      const priceGEL = await item.$eval('.item-price-gel', (priceElement) => priceElement.textContent.trim());
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
      const folderPath = path.join(__dirname, productId);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      const newPage = await browser.newPage();
      await newPage.goto(productLink);

      const floor = await newPage
        .$eval('.door + div', (roomsElement) => roomsElement.innerText.split('\nFloor'))
        .catch(() => '');

      const imageElements = await newPage.$$('.swiper-slide img');
      const imageUrls = [];

      console.log(imageElements);
      for (const imageElement of imageElements) {
        const imageUrl = await imageElement.evaluate((img) => img.getAttribute('data-src'));
        if (imageUrl) {
          imageUrls.push(imageUrl);
        }
      }

      for (let i = 0; i < imageUrls.length; i += 1) {
        const imageUrl = imageUrls[i];
        const imageExtension = path.extname(imageUrl).split('?')[0];
        const imageName = `${i}${imageExtension}`;
        const imagePath = path.join(folderPath, imageName);
        const imagePage = await browser.newPage();
        await imagePage.goto(imageUrl);
        await imagePage.screenshot({ path: imagePath });
        await imagePage.close();
        console.log(`Image ${i + 1}/${imageUrls.length} saved as ${imageName}`);
      }
      await newPage.close();
      const infoFilePath = path.join(folderPath, 'info.txt');
      const infoContent = `${JSON.stringify({
        // title,
        productId,
        priceUSD,
        priceGEL,
        floor,
        bedrooms,
        rooms,
        area,
        // productLink,
      })}`;
      fs.writeFileSync(infoFilePath, infoContent);
    }
    await browser.close();
    return res.json({
      message: 'Data Scraped successfully',
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  scrapeSite,
};
