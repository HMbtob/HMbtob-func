module.exports = app => {
  // 라우터
  const express = require("express");
  const router = express.Router();

  //   크롤링
  const axios = require("axios");
  const puppeteer = require("puppeteer");

  // 파이어베이스
  const firebaseConfig = {
    apiKey: "AIzaSyCMGH4DZuNILh0yO9VZe-NTDOkEtxljYvk",
    authDomain: "interasiastock.firebaseapp.com",
    projectId: "interasiastock",
    storageBucket: "interasiastock.appspot.com",
    messagingSenderId: "95854230591",
    appId: "1:95854230591:web:2e8f7e00323bfe6afa8c8a",
    measurementId: "G-K98DZ0SLWY",
  };
  const firebase = require("firebase/app");
  require("firebase/storage");
  require("firebase/firestore");
  firebase.initializeApp(firebaseConfig);

  // 신나라 상품 크롤링
  // 채널명 파라미터로 if 문으로 주소랑 엘리먼트 변경
  router.get("/:channel/:productId", (req, res) => {
    console.log(req.params.channel, req.params.productId);
    async function openBrowser() {
      // 브라우저 실행 및 옵션, 현재 옵션은 headless 모드 사용 여부
      const browser = await puppeteer.launch({ headless: false });

      // 브라우저 열기
      const page = await browser.newPage();

      //  채널이 신나라 라면
      if (req.params.channel === "synnara") {
        // 페이지 이동
        await page.goto(
          `https://www.synnara.co.kr/sp/sp120Main.do?productId=${req.params.productId}`
        );

        let selectors = {
          // 엘범 타이틀
          title:
            "#container > div.contents > div > ul.detail_view_tit > li.de_tit",

          // 앨범 발매일

          relDate:
            "#tab_detail1 > div > table > tbody > tr:nth-child(4) > td:nth-child(4)",

          // 아티스트

          artist:
            "#tab_detail1 > div > table > tbody > tr:nth-child(1) > td > a",

          // 소속사

          ent: "#tab_detail1 > div > table > tbody > tr:nth-child(2) > td:nth-child(4)",

          // 썸네일
          thumbNail:
            "#container > div.contents > div > div.detail_view_top.clearfix > div.img_area.fl > p > img",

          // descrip
          descrip: "#tab_detail2 > div.product_thum > img",
        };

        // 수집한 요소 텍스트 넣을 객체
        let result;
        let elemTexts = {};

        const crFunc = async () => {
          //  셀렉터배열로 돌면서 요소 추가
          for (let selector in selectors) {
            if (selector != "thumbNail" && selector != "descrip") {
              result = await page.$eval(
                selectors[selector],
                elem => elem.textContent
              );
            } else if (selector === "thumbNail" || selector === "descrip") {
              const imgSrc = await page.$eval(
                selectors[selector],
                elem => elem.src
              );

              const imgResult = await axios
                .get(imgSrc, {
                  //이미지 주소 result.img를 요청
                  responseType: "arraybuffer", //buffer가 연속적으로 들어있는 자료 구조를 받아온다
                })
                .then(response => response);

              // 파이어베이스에 썸넬 저장
              var storage = await firebase.storage();

              const saveTheImg = async selector => {
                let fileName = elemTexts["title"];
                fileName = fileName.replace(/(\r\n\t|\n|\r\t)/gm, "");
                fileName = fileName.replace(/\//g, "l");
                fileName = fileName.replace(/\:/g, "대");
                fileName = fileName.replace(/[<>\:\*\"\/\\\?\|]/gi);

                await storage
                  .ref(`images/${selector}/${fileName}.jpg`)
                  .put(new Uint8Array(imgResult.data), {
                    contentType: "image/jpeg",
                  })
                  .catch(e => {
                    browser.close(), res.end(), console.log(e);
                  });

                result = await storage
                  .ref(`images/${selector}/${fileName}.jpg`)
                  .getDownloadURL()
                  .then(url => url);

                elemTexts["title"] = fileName;
              };
              await saveTheImg(selector);
            }
            elemTexts[selector] = result;
          }
          elemTexts["channel"] = req.params.channel;
          elemTexts["imgUrl"] = await page.url();

          const db = firebase.firestore();
          console.log(elemTexts);
          await db
            .collection("products")
            .doc(elemTexts["title"])
            .set({
              ...elemTexts,
            })
            .catch(e => console.log(e));
          await browser.close();
        };
        crFunc()
          .then(() => res.end())
          .catch(e => console.log(e));
      } else {
        await browser.close();
        res.end();
      }
    }

    openBrowser().catch(e => console.log(e));
  });

  return router;
};
