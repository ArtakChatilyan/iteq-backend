const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const productController = {
  getProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        `Select id, productNameEn, productNameGe, productNameRu, (select imgUrl from productimages where products.id=productimages.productId LIMIT 0,1) as imgUrl From products LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      for(let i=0; i<rows.length; i++){
        const [modelInfo]=await sqlPool.query("select id, nameEn from models where productId=?", [rows[i].id]);
        rows[i].modelInfo=modelInfo;
      }
      const [rowsCount] = await sqlPool.query(
        `Select count(*) as total From products`
      );
      res.json({ data: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getProduct: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From products WHERE id=?`, [
        req.params.id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addProduct: async (req, res) => {
    try {
      let {
        productNameEn,
        productNameGe,
        productNameRu,
        //productModel,
        productBrand,
        productCountryEn,
        productCountryGe,
        productCountryRu,
        //productMultyColor,
        //productMultyDimension,
        //productDimension,
        //productWeight,
        //productInfoEn,
        //productInfoGe,
        //productInfoRu,
        //productPrice,
        //productCount,
        productInStock,
        //productDiscount,
        //productNewPrice,
        //productPopular,
        productOnTop,
        //optionsEn,
        //optionsGe,
        //optionsRu,
      } = req.body;

      // if (
      //   !productCount ||
      //   productCount == null ||
      //   productCount == "" ||
      //   productCount == ""
      // )
      //   productCount = 0;
      // if (
      //   !productNewPrice ||
      //   productNewPrice == null ||
      //   productNewPrice == "" ||
      //   productNewPrice == ""
      // )
      //   productNewPrice = 0;
      // if (
      //   !productPrice ||
      //   productPrice == null ||
      //   productPrice == "" ||
      //   productPrice == ""
      // )
      //   productPrice = 0;

      // if(!productDiscount) productDiscount=0;
      // if(!productInStock) productInStock=0;
      // if(!productMultyDimension) productMultyDimension=0;
      // if(!productOnTop) productOnTop=0;

      const [result] = await sqlPool.query(
        `INSERT INTO products(productNameEn, productNameGe, productNameRu, productBrand,
           productCountryEn, productCountryGe, productCountryRu,  
           productInStock,productOnTop) 
           VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          productNameEn,
          productNameGe,
          productNameRu,
          //productModel,
          productBrand,
          productCountryEn,
          productCountryGe,
          productCountryRu,
          //productMultyColor,
          //productMultyDimension,
          //productMultyDimension ? "" : productDimension,
          //productMultyDimension ? "" : productWeight,
          // productInfoEn,
          // productInfoGe,
          // productInfoRu,
          //productMultyDimension ? 0 : productPrice,
          productInStock,
          //productCount,
          //productMultyDimension ? 0 : productDiscount,
          //productMultyDimension ? 0 : productNewPrice,
          //productPopular,
          productOnTop,
          //optionsEn,
          //optionsGe,
          //optionsRu,
        ]
      );

      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateProduct: async (req, res) => {
    try {
      let {
        productNameEn,
        productNameGe,
        productNameRu,
        //productModel,
        productBrand,
        productCountryEn,
        productCountryGe,
        productCountryRu,
        //productMultyColor,
        //productMultyDimension,
        //productDimension,
        //productWeight,
        //productInfoEn,
        //productInfoGe,
        //productInfoRu,
        //productPrice,
        productInStock,
        //productDiscount,
        //productNewPrice,
        //productCount,
        //productPopular,
        productOnTop,
        //optionsEn,
        //optionsGe,
        //optionsRu,
      } = req.body;

      // if (
      //   !productCount ||
      //   productCount == null ||
      //   productCount == "" ||
      //   productCount == ""
      // )
      //   productCount = 0;
      // if (
      //   !productNewPrice ||
      //   productNewPrice == null ||
      //   productNewPrice == "" ||
      //   productNewPrice == ""
      // )
      //   productNewPrice = 0;
      // if (
      //   !productPrice ||
      //   productPrice == null ||
      //   productPrice == "" ||
      //   productPrice == ""
      // )
      //   productPrice = 0;

      const { id } = req.params;
      
      const [result] = await sqlPool.query(
        `UPDATE products SET productNameEn=?, productNameGe=?, productNameRu=?, 
            productBrand=?, productCountryEn=?,productCountryGe=?, productCountryRu=?, 
            productInStock=?, productOnTop=? WHERE id=?`,
        [
          productNameEn,
          productNameGe,
          productNameRu,
          //productModel,
          productBrand,
          productCountryEn,
          productCountryGe,
          productCountryRu,
          //productMultyColor,
          //productMultyDimension,
          //productMultyDimension ? "" : productDimension,
          //productMultyDimension ? "" : productWeight,
          //productInfoEn,
          //productInfoGe,
          //productInfoRu,
          //productMultyDimension ? "" : productPrice,
          productInStock,
          //productMultyDimension ? "" : productDiscount,
          //productMultyDimension ? "" : productNewPrice,
          //productCount,
          //productPopular,
          productOnTop,
          //optionsEn,
          //optionsGe,
          //optionsRu,
          id,
        ]
      );
      const rows = await sqlPool.query(`Select * From products WHERE id=?`, [
        id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const [images] = await sqlPool.query(
        `Select id, imgUrl FROM productimages WHERE productId= ?`,
        [id]
      );
      const [models]=await sqlPool.query("Select * from models where productId=?", [id]);
      for (let i = 0; i < images.length; i++) {
        if (fs.existsSync("./products/" + path.basename(images[i].imgUrl))) {
          fs.unlink("./products/" + path.basename(images[i].imgUrl), (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          });
        }

        await sqlPool.query(`DELETE FROM imagecolorsize WHERE imageId =?`, [
          images[i].id,
        ]);
      }

      for(let i=0; i<models.length; i++){
        await sqlPool.query("Delete from descriptioncolorsize where modelId=?", [models[i].id]);
        await sqlPool.query("Delete from imagecolorsize where modelId=?", [models[i].id]);
        await sqlPool.query("Delete from modelcolors where modelId=?", [models[i].id]);
        await sqlPool.query("Delete from modelsizes where modelId=?", [models[i].id]);
        await sqlPool.query("Delete from models where id=?", [models[i].id]);
      }
      await sqlPool.query(`DELETE FROM productimages WHERE productId =?`, [id]);
      await sqlPool.query(`DELETE FROM productcategories WHERE productId =?`, [
        id,
      ]);
      await sqlPool.query(`DELETE FROM productsizes WHERE productId =?`, [id]);
      const [result] = await sqlPool.query(`DELETE FROM products WHERE id =?`, [
        id,
      ]);

      await sqlPool.query(`DELETE FROM productcolors WHERE productId =?`, [id]);
      await sqlPool.query(`DELETE FROM descriptions WHERE productId =?`, [id]);


      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  // getProductSizes: async (req, res) => {
  //   try {
  //     const [rows] = await sqlPool.query(
  //       `Select * From productsizes WHERE productId=?`,
  //       [req.params.id]
  //     );
  //     res.json({ data: rows });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  // addProductSize: async (req, res) => {
  //   try {
  //     const {
  //       productId,
  //       dimension,
  //       weight,
  //       price,
  //       discount,
  //       newPrice,
  //       count,
  //       inStock,
  //     } = req.body;
  //     const [result] = await sqlPool.query(
  //       `INSERT INTO productsizes(productId, dimension, weight, price,
  //                                 discount, newPrice, count, inStock)
  //          VALUES (?,?,?,?,?,?,?,?)`,
  //       [
  //         productId,
  //         dimension,
  //         weight,
  //         price,
  //         discount,
  //         newPrice,
  //         count,
  //         inStock,
  //       ]
  //     );

  //     res.json({ id: result.insertId });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  // updateProductSize: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { dimension, weight, price, discount, newPrice, count, inStock } =
  //       req.body;
  //     const [result] = await sqlPool.query(
  //       `UPDATE productsizes SET dimension=?, weight=?, price=?,
  //                                 discount=?, newPrice=?, count=?, inStock=? WHERE id=?`,
  //       [dimension, weight, price, discount, newPrice, count, inStock, id]
  //     );
  //     const rows = await sqlPool.query(
  //       `Select * From productsizes WHERE id=?`,
  //       [id]
  //     );
  //     res.json({ data: rows[0] });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  // getProductSize: async (req, res) => {
  //   try {
  //     const [rows] = await sqlPool.query(
  //       `Select * From productsizes WHERE id=?`,
  //       [req.params.id]
  //     );
  //     res.json({ data: rows[0] });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  // deleteProductSize: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const [result] = await sqlPool.query(
  //       `DELETE FROM productsizes WHERE id =?`,
  //       [id]
  //     );
  //     await sqlPool.query(`DELETE FROM imagecolorsize WHERE sizeId =?`, [id]);
  //     res.json({ data: result });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  getProductCategories: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From productcategories WHERE productId=?`,
        [req.params.id]
      );
      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  setProductCategories: async (req, res) => {
    try {
      const { id, result } = req.body;
      console.log(result);
      await sqlPool.query(`delete from productcategories where productId=?`, [
        id,
      ]);
      const finalResult = [];
      for (let i = 0; i < result.length; i++) {
        finalResult.push(result[i]);

        let [parentiData] = await sqlPool.query(
          "select parentId from categories where id=?",
          [result[i]]
        );
        let parentId = parentiData[0].parentId;
        while (parentId > 0) {
          finalResult.push(parentId);
          [parentiData] = await sqlPool.query(
            "select parentId from categories where id=?",
            [parentId]
          );
          parentId = parentiData[0].parentId;
        }
      }
      const uniqueResult = [...new Set(finalResult)];

      for (let i = 0; i < uniqueResult.length; i++) {
        let [duplicate] = await sqlPool.query(
          "select count(*) as total from productcategories where productId=? and categoryId=?",
          [id, uniqueResult[i]]
        );
        if (duplicate[0].total == 0) {
          await sqlPool.query(
            `insert into productcategories(productId, categoryId) values(?,?)`,
            [id, uniqueResult[i]]
          );
        }
      }
      //await sqlPool.query(`call insertProdCat(?,?)`, [id, result[i]]);
      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  // getProductColors: async (req, res) => {
  //   try {
  //     const [rows] = await sqlPool.query(
  //       `Select * From productcolors WHERE productId=?`,
  //       [req.params.id]
  //     );
  //     res.json({ pColors: rows });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  // setProductColors: async (req, res) => {
  //   try {
  //     const { id, result } = req.body;
  //     await sqlPool.query(`delete from productcolors where productId=?`, [id]);
  //     for (let i = 0; i < result.length; i++) {
  //       await sqlPool.query(
  //         `insert into productcolors(productId, colorId) values(?,?)`,
  //         [id, result[i]]
  //       );
  //     }
  //     res.json({ message: "done!" });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },
  // getImageColorSize: async (req, res) => {
  //   try {
  //     const [rows] = await sqlPool.query(
  //       `Select * From imagecolorsize WHERE imageId=?`,
  //       [req.params.id]
  //     );
  //     res.json({ colorSize: rows });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  // setImageColorSize: async (req, res) => {
  //   try {
  //     const { imageId, color, size } = req.body;

  //     await sqlPool.query(
  //       `insert into imagecolorsize(imageId, colorId, sizeId) values(?,?,?)`,
  //       [
  //         imageId,
  //         color ? color.substring(3) : null,
  //         size ? size.substring(3) : null,
  //       ]
  //     );

  //     res.json({ message: "done!" });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  // deleteImageColorSize: async (req, res) => {
  //   try {
  //     const { id } = req.params;

  //     await sqlPool.query(`delete from imagecolorsize where id=?`, [id]);

  //     res.json({ message: "done!" });
  //   } catch (error) {
  //     console.log(error);
  //     res.json({ state: error });
  //   }
  // },

  getProductImages: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From productimages WHERE productId=?`,
        [req.params.id]
      );
      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addProductImage: async (req, res) => {
    try {
      const imgUrl =
        req.protocol +
        "://" +
        req.get("host") +
        "/products/" +
        req.file.filename;

      const { prodId } = req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO productimages(imgUrl, productId) VALUES (?,?)`,
        [imgUrl, prodId]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteProductImage: async (req, res) => {
    try {
      const { id } = req.params;
      const [images] = await sqlPool.query(
        `Select imgUrl FROM productimages WHERE id= ?`,
        [id]
      );

      for (let i = 0; i < images.length; i++) {
        if (fs.existsSync("./products/" + path.basename(images[i].imgUrl))) {
          fs.unlink("./products/" + path.basename(images[i].imgUrl), (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          });
        }
      }

      const [result] = await sqlPool.query(
        `DELETE FROM productimages WHERE id= ?`,
        [id]
      );

      await sqlPool.query(`DELETE FROM imagecolorsize WHERE imageId= ?`, [id]);

      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getDescriptions: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * from descriptions where productId= ?`,
        req.params.productId
      );
      res.json({ descriptions: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getDescription: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From descriptions WHERE id=?`,
        [req.params.descriptionId]
      );
      res.json({ description: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addDescription: async (req, res) => {
    try {
      let {
        productId,
        descriptionName,
        descriptionEn,
        descriptionGe,
        descriptionRu,
      } = req.body;

      const [result] = await sqlPool.query(
        `INSERT INTO descriptions(productId, name, descriptionEn, descriptionGe, descriptionRu) 
           VALUES (?,?,?,?,?)`,
        [
          productId,
          descriptionName,
          descriptionEn,
          descriptionGe,
          descriptionRu,
        ]
      );

      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateDescription: async (req, res) => {
    try {
      let { name, descriptionEn, descriptionGe, descriptionRu } =
        req.body;

      const { descriptionId } = req.params;
      const [result] = await sqlPool.query(
        `UPDATE descriptions SET name=?, descriptionEn=?, descriptionGe=?, descriptionRu=? WHERE id=?`,
        [
          name,
          descriptionEn,
          descriptionGe,
          descriptionRu,
          descriptionId,
        ]
      );
      const rows = await sqlPool.query(
        `Select * From descriptions WHERE id=?`,
        [descriptionId]
      );
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteDescription: async (req, res) => {
    try {
      const { descriptionId } = req.params;

      const [result] =await sqlPool.query(`DELETE FROM descriptions WHERE id =?`, [
        descriptionId,
      ]);

      await sqlPool.query("DELETE FROM descriptioncolorsize where descriptionId=?", [descriptionId]);

      res.json({ result: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = productController;
