module.exports = app => {
  const express = require("express");
  const router = express.Router();
  const axios = require("axios");

  // 모든상품 정보 가져오기(total_sold 보려고)
  router.get("/getallproducts", (req, res) => {
    let allProducts = [];
    async function getAllProducts() {
      for (let i = 1; i <= 12; i++) {
        await axios
          .get(
            "https://api.bigcommerce.com/stores/7uw7zc08qw/v3/catalog/products",
            {
              params: { limit: 250, page: i },
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
    }

    getAllProducts();
  });

  // 빅커머스 상품아이디로 정보 가져오기
  router.get("/getproductinfo/:id", (req, res) => {
    const callGetProductInfo = async () => {
      await axios
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
    };
    callGetProductInfo();
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

          { inventory_level: req.params.qty, price: req.params.price },
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

  // 1.모든 상태 카운트 가져오기
  // 2. 각 상태별 카운트/250 해서 반복문 횟수 정하고
  // 3. 찾은 횟수로 각 상태별 주문번호 가져오기
  // 4. 각 주문번호로 주문안의 상품 다 가져오기
  // 5. 가져온 상품들 아이디 가져와서 중복제거
  // 6. 맵(가져온상품 id들) -> 필터(각 id 랑 같은 상품들에 리듀스(qty 총합))
  // 빅커머스 스톡테이블 로우 정보 by status_id
  router.get("/callOrdersByStatusId/:status_id", (req, res) => {
    try {
      let OrdersByStatusIds = [];
      let productsByOrderIds = [];
      async function callOrdersByStatusId() {
        // 상태 아이디로 해당상태 모든 주문 가져오기(파라미터)
        const response = await axios.get(
          "https://api.bigcommerce.com/stores/7uw7zc08qw/v2/orders/",
          {
            //TODO: 페이지 수 반복문으로 넣어야함
            params: { status_id: req.params.status_id, limit: 250 },
            headers: {
              "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
              accept: "application/json",
              "content-type": "application/json",
            },
          }
        );

        // 주문 아이디들만 수집
        await OrdersByStatusIds.push(...response.data.map(doc => doc.id));

        // 수집한 주문 아이디 돌면서 주문안의 프로덕트들 수집
        await Promise.all(
          OrdersByStatusIds.map(async id => {
            await axios
              .get(
                `https://api.bigcommerce.com/stores/7uw7zc08qw/v2/orders/${id}/products`,
                {
                  params: { limit: 250 },

                  headers: {
                    "x-auth-token": "23t2vx6zwiq32xa8b0uspfo7mb7181x",
                    accept: "application/json",
                    "content-type": "application/json",
                  },
                }
              )
              .then(doc =>
                productsByOrderIds.push(
                  ...doc.data.map(doc => ({
                    product_id: doc.product_id,
                    qty: doc.quantity,
                  }))
                )
              );
          })
        );
        //   프로덕트 아이디만 뽑기
        const productIds = productsByOrderIds.map(doc => Object.values(doc)[0]);
        // 프로덕트 아이디중에 중복제거
        const settedProductIds = [...new Set(productIds)];

        // 중복 제거된 프로덕트 아이디 돌면서 해당아이디의 퀀티티 sum
        // [{프로덕트아이디 : 퀀티티총합} ...] 형태로 최종데이터 리스펀스
        const last = settedProductIds.map(doc => {
          return {
            [doc]: productsByOrderIds
              .filter(doc2 => doc2.product_id === doc)
              .reduce((i, c) => {
                return i + c.qty;
              }, 0),
          };
        });
        res.send(last);
      }

      callOrdersByStatusId();
    } catch (e) {
      console.log(e);
      res.send("e");
    }
  });

  return router;
};
