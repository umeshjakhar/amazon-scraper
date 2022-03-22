import fixText from "./fixtext";
import product from "./product";

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
        var specs= await product(path.replace("@@@/",""));
        specs = JSON.parse(specs);
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
          query_url: product_link.replace("www.amazon.in", host + "/product").split("/ref=")[0],
          ...specs
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
               var specs= await product(path.replace("@@@/",""));
               specs = JSON.parse(specs);
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
            query_url: product_link.replace("www.amazon.in", host + "/product").split("/ref=")[0],
            ...specs
          });
        }
      } catch (err) {}
    }
  }


function CreateTableFromJSON(items) {

        // EXTRACT VALUE FOR HTML HEADER.
        var col = [];
        for (var i = 0; i < items.length; i++) {
            for (var key in items[i]) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");

        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

        var tr = table.insertRow(-1);                   // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < items.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = items[i][col[j]];
            }
        }

        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.

       return table;
    }

//var res1 = JSON.stringify(
//        {
//            "version": "https://jsonfeed.org/version/1",
//            "title": "My Amazon Mobile Feed",
//            "searchURL": searchURL,
//            "searchQuery": searchQuery,
//            "items": result
//        }
//        );
  return `<!DOCTYPE html>
          <html>
          <head>
              <title>Convert JSON Data to HTML Table</title>
              <style>
                  th, td, p, input {
                      font:14px Verdana;
                  }
                  table, th, td
                  {
                      border: solid 1px #DDD;
                      border-collapse: collapse;
                      padding: 2px 3px;
                      text-align: center;
                  }
                  th {
                      font-weight:bold;
                  }
              </style>
          </head>
          <body>
          <p id="showData">` + CreateTableFromJSON(result) +

          `</p>
          </body>`;

}
