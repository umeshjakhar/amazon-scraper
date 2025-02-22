import fixText from "./fixtext";
import product from "./product";
var html_tablify = require('html-tablify');
//
//var admin = require("firebase-admin");
//
//var serviceAccount = require("./mobilespoint-1595924074851-firebase-adminsdk-kp5ef-80d920b340.json");
//
//admin.initializeApp({
//  credential: admin.credential.cert(serviceAccount),
//  databaseURL: "https://mobilespoint-1595924074851-default-rtdb.firebaseio.com"
//});
//
//// The app only has access as defined in the Security Rules
//var db = admin.database();
//var ref = db.ref("/amazon");

export default async function searchProducts(query, host) {

  const searchQuery = query.replace(/%20/gi, "+");
  var specsUrl;
  var searchURL = `https://www.amazon.in/s?k=${searchQuery}`;
  if(Number.isInteger(Number.parseInt(query))){
  searchURL = `https://www.amazon.in/s?k=smartphones&i=electronics&rh=n%3A1805560031&page=${query}&qid=1647778056&ref=sr_pg_${query}`;
  }
  const searchRes = await (
    await fetch(searchURL)
  ).text();

  var all_product = searchRes.split(
    '<div class="a-section aok-relative s-image-fixed-height">'
  );

  var i,
    result = [];
  for (i = 1; i < all_product.length; i++) {
    /* (type 1) */
    try {
      var product_link =
        "https://www.amazon.in" +
        all_product[i]
          .split(
            '<a class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal" target="_blank" href="'
          )[1]
          .split('"')[0];

      if (product_link.includes("?")) {
        product_link = product_link.split("?")[0];

      }

      if (!product_link.includes("/gp/slredirect/")) {
        /* Not including sponsered products */


        var path = new URL(product_link.replace("www.amazon.in","").split("/ref=")[0]).pathname;
        path = "@@@"+path;
        path = path.replace("@@@/","");
//        var specs = await product(path);
//        specs = JSON.parse(specs);
//        const asin = specs.ASIN;
//        ref.update({asin:specs});
//          AMAZON_MOBILES.put("asin","specs");

        result.push({
          name: fixText(
            all_product[i]
              .split(
                '<span class="a-size-medium a-color-base a-text-normal">'
              )[1]
              .split("</span>")[0]
          ),
          image: all_product[i]
            .split('src="')[1]
            .split('"')[0]
            .replace("_AC_UY218_.jpg", "_SL1000_.jpg"),
          price: parseFloat(
            all_product[i]
              .split(
                '<span class="a-price" data-a-size="l" data-a-color="price"><span class="a-offscreen">'
              )[1]
              .split("</span>")[0]
              .replace(/,/g, "")
              .replace("₹", "")
              .trim()
          ),
          original_price: parseFloat(
            all_product[i]
              .split(
                '<span class="a-price a-text-price" data-a-size="b" data-a-strike="true" data-a-color="secondary"><span class="a-offscreen">'
              )[1]
              .split("</span>")[0]
              .replace(/,/g, "")
              .replace("₹", "")
              .trim()
          ),
          product_link,
          query_url: product_link.replace("www.amazon.in", host + "/product").split("/ref=")[0]
        });

      }
    } catch (err) {
      console.log(err);
    }
  }

  if (result.length === 0) {
    /* (type 2) */
    all_product = searchRes.split(
      '<div class="a-section a-spacing-medium a-text-center">'
    );

    for (i = 1; i < all_product.length; i++) {
      try {
        var product_link =
          "https://www.amazon.in" +
          all_product[i]
            .split(
              /<a class="a-link-normal.*a-text-normal" target="_blank" href="/
            )[1]
            .split('"')[0];

        if (product_link.includes("?")) {
          product_link = product_link.split("?")[0];
        }

        if (!product_link.includes("/gp/slredirect/")) {
                 var path = new URL(product_link.replace("www.amazon.in","").split("/ref=")[0]).pathname;
                        path = "@@@"+path;
                        path = path.replace("@@@/","");
//                        var specs= await product(path);
//                        specs = JSON.parse(specs);
//                        const asin = specs.ASIN;
//                        ref.update({asin:specs});
//                        AMAZON_MOBILES.put("asin","specs");
          result.push({
            name: fixText(
              all_product[i]
                .split(
                  '<span class="a-size-base-plus a-color-base a-text-normal">'
                )[1]
                .split("</span>")[0]
            ),
            image: all_product[i]
              .split('src="')[1]
              .split('"')[0]
              .replace("_AC_UL320_.jpg", "_SL1000_.jpg"),
            price: parseFloat(
              all_product[i]
                .split(
                  '<span class="a-price" data-a-size="l" data-a-color="price"><span class="a-offscreen">'
                )[1]
                .split("</span>")[0]
                .replace(/,/g, "")
                .replace("₹", "")
                .trim()
            ),
            original_price: parseFloat(
              all_product[i]
                .split(
                  '<span class="a-price a-text-price" data-a-size="b" data-a-strike="true" data-a-color="secondary"><span class="a-offscreen">'
                )[1]
                .split("</span>")[0]
                .replace(/,/g, "")
                .replace("₹", "")
                .trim()
            ),
            product_link,
            query_url: product_link.replace("www.amazon.in", host + "/product").split("/ref=")[0]
          });
        }
      } catch (err) {}
    }
  }

//var options = {
//    data: result
//};
//var html_data = html_tablify.tablify(options);
//return `<!DOCTYPE html>
//         <html>
//         <head>
//         <title>${query}</title>
//         </head>
//         <body>${html_data}</body>
//         </html>`;

//return JSON.stringify(
//        {
//            "version": "https://jsonfeed.org/version/1",
//            "title": "My Amazon Mobile Feed",
//            "searchURL": searchURL,
//            "searchQuery": searchQuery,
//            "items": result
//        }
        return JSON.stringify({
                total_result: result.length,
                query: query,
                fetch_from: searchURL,
                result
            }, null, 2)


}
