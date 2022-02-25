const { Router } = require("express");

module.exports = app => {
  const express = require("express");
  const router = express.Router();
  // const cors = require("cors");
  // router.use(
  //   cors({
  //     origin: true,
  //   })
  // );
  const axios = require("axios");
  const firebase = require("firebase/app");
  const storage = firebase.storage();
  // 빅커머스 헤더
  const headers = {
    "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
    accept: "application/json",
    "content-type": "application/json",
  };

  // 모든상품 정보 가져오기(total_sold 보려고)
  router.get("/getallproducts", async (req, res) => {
    let allProducts = [];
    for (let i = 1; i <= 15; i++) {
      await axios
        .get(
          "https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products",
          {
            params: {
              limit: 250,
              page: i,
            },
            headers: {
              "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
              accept: "application/json",
              "content-type": "application/json",
            },
          }
        )
        .then(order => {
          const data = order.data;
          data.data.map(doc => allProducts.push(doc));
          console.log(i);
        })
        .catch(error => (console.log(error), res.send("e")));
    }
    res.send(allProducts);
  });

  // 빅커머스 상품아이디로 정보 가져오기
  router.get("/getproductinfo/:id", (req, res) => {
    axios
      .get(
        `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products/${req.params.id}`,
        {
          headers: {
            "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      )
      .then(product => {
        const pro = product.data;
        res.send(pro);
      })
      .catch(error => (console.log(error), res.send("e")));
  });

  // 빅커머스 상품 재고량 수정
  router.get("/fixproductinventory/:pro_id/:qty", (req, res) => {
    const callFix = async () => {
      await axios
        .put(
          `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products/${req.params.pro_id}`,

          { inventory_level: req.params.qty },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            },
          }
        )
        .then(() => res.send("done"))
        .catch(e => res.send(e));
    };
    callFix();
  });
  //빅커머스 상품 재고량 + 가격수정
  router.get("/fixproductinventoryprice/:pro_id/:qty/:price", (req, res) => {
    const callFixPrice = async () => {
      await axios
        .put(
          `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products/${req.params.pro_id}`,
          req.params.price
            ? { inventory_level: req.params.qty, price: req.params.price }
            : { inventory_level: req.params.qty },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            },
          }
        )
        .then(() => res.send("done"))
        .catch(e => res.send(e));
    };
    callFixPrice();
  });
  //빅커머스 상품 옵션별 재고량 + 가격수정
  router.get(
    "/fixproductinventoryprice/:pro_id/:var_id/:qty/:price",
    (req, res) => {
      axios
        .put(
          `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products/${req.params.pro_id}/variants/${req.params.var_id}`,
          { inventory_level: req.params.qty, price: req.params.price },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            },
          }
        )
        .then(re => res.send(re.data))
        .catch(e => res.send(e));
    }
  );

  // 1.모든 상태 카운트 가져오기
  // 2. 각 상태별 카운트/250 해서 반복문 횟수 정하고
  // 3. 찾은 횟수로 각 상태별 주문번호 가져오기
  // 4. 각 주문번호로 주문안의 상품 다 가져오기
  // 5. 가져온 상품들 아이디 가져와서 중복제거
  // 6. 맵(가져온상품 id들) -> 필터(각 id 랑 같은 상품들에 리듀스(qty 총합))
  // 빅커머스 스톡테이블 로우 정보 by status_id
  // router.get("/callOrdersByStatusId/:status_id", async (req, res) => {
  //   // cors(req, res, () => {
  //   let OrdersByStatusIds = [];
  //   let productsByOrderIds = [];
  //   // 상태 아이디로 해당상태 모든 주문 가져오기(파라미터)
  //   await axios
  //     .get("https://api.bigcommerce.com/stores/7uw7zc08qw/v2/orders/", {
  //       //TODO: 페이지 수 반복문으로 넣어야함
  //       params: { status_id: req.params.status_id, limit: 30 },
  //       headers: {
  //         "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
  //         accept: "application/json",
  //         "content-type": "application/json",
  //       },
  //     })
  //     .then(res => {
  //       OrdersByStatusIds.push(...res.data.map(doc => doc.id));

  //       return OrdersByStatusIds;
  //     })
  //     .catch(e => console.log(e));
  //   console.log("OrdersByStatusIds", OrdersByStatusIds);
  //   // 주문 아이디들만 수집
  //   // await OrdersByStatusIds.push(...response.data.map(doc => doc.id));

  //   for (let i = 0; i < 30; i++) {
  //     console.log(i, "번째 주문");
  //     console.log(OrdersByStatusIds[i], " 주문");

  //     await axios
  //       .get(
  //         `https://api.bigcommerce.com/stores/7uw7zc08qw/v2/orders/${OrdersByStatusIds[i]}/products`,
  //         {
  //           params: { limit: 50 },

  //           headers: {
  //             "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
  //             accept: "application/json",
  //             "content-type": "application/json",
  //           },
  //         }
  //       )
  //       .then(products => productsByOrderIds.push(...products.data))
  //       .catch(e => console.log(e));
  //   }
  //   // 수집한 주문 아이디 돌면서 주문안의 프로덕트들 수집
  //   console.log(productsByOrderIds);
  //   //   프로덕트 아이디만 뽑기
  //   const productIds = productsByOrderIds.map(product => product.product_id);
  //   console.log("productIds", productIds);
  //   // 프로덕트 아이디중에 중복제거
  //   const settedProductIds = [...new Set(productIds)];
  //   console.log("settedProductIds", settedProductIds);
  //   // 중복 제거된 프로덕트 아이디 돌면서 해당아이디의 퀀티티 sum
  //   // [{프로덕트아이디 : 퀀티티총합} ...] 형태로 최종데이터 리스펀스
  //   const last = settedProductIds.map(doc => {
  //     return {
  //       [doc]: productsByOrderIds
  //         .filter(doc2 => doc2.product_id === doc)
  //         .reduce((i, c) => {
  //           return i + c.quantity;
  //         }, 0),
  //     };
  //   });
  //   console.log("last", last);
  //   res.send(last);

  //   // });
  // });
  // 로고 가져와서 base64 보내주기
  router.get("/getlogobase64", async (req, res) => {
    try {
      const image = await axios.get(req.query.url, {
        responseType: "arraybuffer",
      });
      let raw = Buffer.from(image.data).toString("base64");
      res.send(raw);
    } catch (e) {
      console.log(e);
    }
  });

  // 섬네일, 디스크립션 신나라에서 가져오기
  router.get("/getThumbnail", (req, res) => {
    axios
      .get(req.query.url, {
        //이미지 주소 result.img를 요청
        responseType: "arraybuffer", //buffer가 연속적으로 들어있는 자료 구조를 받아온다
      })
      .then(resp => {
        storage
          .ref(
            `images/thumbNail/${
              req.query.title ? req.query.title : "thumbnail"
            }.jpg`
          )
          .put(new Uint8Array(resp.data), { contentType: "image/jpeg" })
          .then(() =>
            storage
              .ref(
                `images/thumbNail/${
                  req.query.title ? req.query.title : "thumbnail"
                }.jpg`
              )
              .getDownloadURL()
              .then(url => res.send(url))
              .catch(e => res.send(e))
          )
          .catch(e => res.send(e));
      })
      .catch(e => res.send(e));
  });
  router.get("/getdesc", (req, res) => {
    axios
      .get(req.query.url, {
        //이미지 주소 result.img를 요청
        responseType: "arraybuffer", //buffer가 연속적으로 들어있는 자료 구조를 받아온다
      })
      .then(resp => {
        storage
          .ref(
            `images/descrip/${
              req.query.title ? req.query.title : "descrip"
            }.jpg`
          )
          .put(new Uint8Array(resp.data), { contentType: "image/jpeg" })
          .then(() =>
            storage
              .ref(
                `images/descrip/${
                  req.query.title ? req.query.title : "descrip"
                }.jpg`
              )
              .getDownloadURL()
              .then(url => res.send(url))
              .catch(e => res.send(e))
          )
          .catch(e => res.send(e));
      })
      .catch(e => res.send(e));
  });

  // 빅커머스 카테고리 가져오기
  router.get("/getcategory", (req, res) => {
    axios
      .get(
        `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/categories`,
        {
          headers: {
            "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      )
      .then(cats => {
        res.send(cats.data);
      })
      .catch(error => console.log(error));
  });
  // 빅커머스 상품등록 위한 등록되있는 마지막 상품번호 가져오기
  router.get("/getlastproductid", (req, res) => {
    axios
      .get(
        `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products`,
        {
          params: { sort: "id", direction: "desc", limit: 1 },
          headers: {
            "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      )
      .then(id => {
        res.send(id.data);
      })
      .catch(error => console.log(error));
  });

  // 상품 보이게/안보이게
  router.get("/visible/:id/:bool", (req, res) => {
    axios
      .put(
        `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products/${req.params.id}`,
        { is_visible: req.params.bool === "true" ? true : false },
        {
          headers: {
            "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      )
      .then(id => {
        res.send(id.data);
      })
      .catch(error => console.log(error));
  });

  // 상품 옵션 불러오기
  router.get("/productoptions/:id", (req, res) => {
    axios
      .get(
        `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products/${req.params.id}/variants`,
        {
          headers: {
            "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      )
      .then(data => res.send(data.data.data))
      .catch(e => console.log(e));
  });

  // ㅅㅏㅇ푸ㅁ등록
  router.post("/addproduct", (req, res) => {
    console.log("요청 실행");
    // console.log(req.query.custom_fields_name);
    // console.log(req.query.custom_fields_Value);

    if (req.body) {
      console.log("req.body", req.body);
    }

    if (req.body)
      axios
        .post(
          `https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products`,
          {
            name: req.body.name,
            price: req.body.price,
            weight: req.body.weight,
            type: req.body.type,
            custom_fields: [
              {
                name: req.body.custom_fields_name,
                value: req.body.custom_fields_Value,
              },
            ],

            images: [
              {
                is_thumbnail: req.body.is_thumbnail,
                image_url: req.body.image_url,
              },
            ],
            sku: req.body.sku,
            upc: req.body.upc,
            inventory_tracking: req.body.inventory_tracking,
            inventory_level: req.body.inventory_level,
            brand_name: req.body.brand_name,
            categories: req.body.categories,
            description: req.body.description,
            variants: req.body.variants,
          },
          {
            headers: {
              "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
              accept: "application/json",
              "content-type": "application/json",
            },
          }
        )
        .then(response => {
          console.log("then");
          // console.log("response", response);
          console.log("response.data", response.data);
          res.send(response.data.data);
        })
        .catch(error => {
          console.log("catch");
          if (error.response) {
            // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
            console.log("error.response");
            console.log("error.response.data", error.response.data);
            console.log("error.response.status", error.response.status);
            console.log("error.response.headers", error.response.headers);
            return res.send(error.response.data);
          } else if (error.request) {
            // 요청이 이루어 졌으나 응답을 받지 못했습니다.
            // `error.request`는 브라우저의 XMLHttpRequest 인스턴스 또는
            // Node.js의 http.ClientRequest 인스턴스입니다.
            console.log("error.request", error.request);
            return res.send(error.request);
          } else {
            // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
            console.log("error.message", error.message);
            res.send();
          }
          console.log("error.config", error.config);
        });
  });

  return router;
};
