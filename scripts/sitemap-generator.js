// // scripts/generate-product-sitemap.js
// const fs = require('fs');
// const fetch = require('node-fetch'); // Make sure node-fetch@2 is installed

// const BASE_URL = 'https://iteq.shop';
// const PER_PAGE = 50; // Number of products per API request

// // Escape XML special characters
// function escapeXml(unsafe) {
//   return unsafe.replace(/[<>&'"]/g, (c) => {
//     switch (c) {
//       case '<': return '&lt;';
//       case '>': return '&gt;';
//       case '&': return '&amp;';
//       case "'": return '&apos;';
//       case '"': return '&quot;';
//     }
//   });
// }

// // Fetch products from API
// async function fetchProducts(page = 1) {
//   const url = `https://data.iteq.shop/api/v1/user/products/?page=${page}&perPage=${PER_PAGE}&catId=0&brands=0&minPrice=-1&maxPrice=-1`;
//   const res = await fetch(url);
//   const data = await res.json();
//   const products = data.products || [];
//   console.log(`Fetched ${products.length} products from page ${page}`);
//   return products;
// }

// // Generate URLs for a single product
// function productUrls(prod) {
//   const urls = [];

//   // Category listing URL
//   if (prod.categoryId) {
//     urls.push(`${BASE_URL}/category/${prod.categoryId}/0/-1/-1/1`);
//   }

//   // Single product URL
//   urls.push(`${BASE_URL}/product/${prod.id}`);

//   return urls;
// }

// // Generate sitemap XML
// function generateXml(urls) {
//   const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

//   urls.forEach(u => {
//     lines.push('  <url>');
//     lines.push(`    <loc>${escapeXml(u)}</loc>`);
//     lines.push('  </url>');
//   });

//   lines.push('</urlset>');
//   return lines.join('\n');
// }

// // Main function
// (async () => {
//   let allUrls = [];
//   let page = 1;

//   while (true) {
//     const products = await fetchProducts(page);
//     if (!products.length) break;

//     products.forEach(prod => {
//       console.log(`Adding URLs for product ID ${prod.id}, categoryId: ${prod.categoryId}`);
//       allUrls.push(...productUrls(prod));
//     });

//     if (products.length < PER_PAGE) break; // last page
//     page++;
//   }

//   if (allUrls.length === 0) {
//     console.log('❌ No URLs generated. Check API response and field names.');
//     return;
//   }

//   const xml = generateXml(allUrls);
//   fs.writeFileSync('public/sitemap-products.xml', xml, 'utf-8');
//   console.log(`✅ Generated sitemap-products.xml with ${allUrls.length} URLs`);
// })();

// scripts/sitemap-generator.js
import fs from "fs";
import fetch from "node-fetch";
import { create } from "xmlbuilder2";

const BASE_URL = "https://iteq.shop";
const OUTPUT_DIR = "public"; // sitemap files will be placed here
const MAX_URLS_PER_SITEMAP = 10000; // Google limit per sitemap

// Simple slugify function
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

// Write XML helper
function writeXml(filename, urls) {
  const root = create({ version: "1.0", encoding: "UTF-8" }).ele("urlset", {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
  });

  urls.forEach((url) => {
    root.ele("url").ele("loc").txt(url);
  });

  const xml = root.end({ prettyPrint: true });
  fs.writeFileSync(`${OUTPUT_DIR}/${filename}`, xml);
  console.log(`✅ ${filename} generated with ${urls.length} URLs`);
  return `${BASE_URL}/${filename}`;
}

// Main function
async function generateSitemaps() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const sitemapFiles = [];

  // ----------------- Categories -----------------
  const catRes = await fetch("https://data.iteq.shop/api/v1/user/categories");
  const { categories } = await catRes.json();

  const catUrls = [];
  // categories.forEach((cat) => {
  //   [
  //     ["en", cat.nameEn],
  //     ["ge", cat.nameGe],
  //     ["ru", cat.nameRu],
  //   ].forEach(([lang, name]) => {
  //     if (name)
  //       catUrls.push(`${BASE_URL}/${lang}/category/${slugify(name)}-${cat.id}`);
  //   });
  // });

  //sitemapFiles.push(writeXml("sitemap-categories.xml", catUrls));

  // ----------------- Brands -----------------
  const brandUrls = [];
  for (let cat of categories) {
    const brandRes = await fetch(
      `https://data.iteq.shop/api/v1/user/brands/byCategory/?catId=${cat.id}`
    );
    const { brands } = await brandRes.json();
    // brands.forEach((brand) => {
    //   [
    //     ["en", brand.brandName],
    //     ["ge", brand.brandName],
    //     ["ru", brand.brandName],
    //   ].forEach(([lang, name]) => {
    //     if (name)
    //       brandUrls.push(
    //         `${BASE_URL}/${lang}/brand/${slugify(name)}-${brand.id}`
    //       );
    //   });
    // });
  }

  //sitemapFiles.push(writeXml("sitemap-brands.xml", brandUrls));

  // ----------------- Products -----------------
  let allProductUrls = [];
  for (let cat of categories) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const prodRes = await fetch(
        `https://data.iteq.shop/api/v1/user/products/?page=${page}&perPage=100&catId=${cat.id}&brands=0&minPrice=-1&maxPrice=-1`
      );
      const prodData = await prodRes.json();
      const products = prodData.products || prodData; // handles both shapes

      if (!products || !products.length) {
        hasMore = false;
        break;
      }

      products.forEach((prod) => {
        [
          ["en", prod.productNameEn],
          ["ge", prod.productNameGe],
          ["ru", prod.productNameRu],
        ].forEach(([lang, name]) => {
          if (name)
            allProductUrls.push(`${BASE_URL}/category/${cat.id}/0/-1/-1/1`);
            // allProductUrls.push(
            //   `${BASE_URL}/${lang}/product/${slugify(name)}-${prod.id}`
            // );
        });
      });

      page++;
    }
  }

  // Split into multiple product sitemaps
  let productIndex = 1;
  for (let i = 0; i < allProductUrls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = allProductUrls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const filename = `sitemap-products-${productIndex}.xml`;
    sitemapFiles.push(writeXml(filename, chunk));
    productIndex++;
  }

  // ----------------- Sitemap Index -----------------
  const indexRoot = create({ version: "1.0", encoding: "UTF-8" }).ele(
    "sitemapindex",
    { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" }
  );

  sitemapFiles.forEach((fileUrl) => {
    indexRoot.ele("sitemap").ele("loc").txt(fileUrl);
  });

  const indexXml = indexRoot.end({ prettyPrint: true });
  fs.writeFileSync(`${OUTPUT_DIR}/sitemap.xml`, indexXml);

  console.log("✅ sitemap.xml index generated");
}

generateSitemaps();
