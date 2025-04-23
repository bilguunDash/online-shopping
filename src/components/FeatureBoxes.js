// components/FeatureBoxes.js
import React from "react";

const FeatureBoxes = () => {
  return (
    <div className="three_box">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage">
              <h2>Дэлгүүрийн онцлог</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="box_text">
              <i>
                <img src="/images/thr.png" alt="#" />
              </i>
              <h3>Суурин Компьютер</h3>
              <p>
                Манай дэлгүүрт оффис болон тоглоомын зориулалттай сүүлийн
                үеийн брэнд компьютерууд худалдаалагдаж байна. Та хэрэгцээндээ
                тохирсон өндөр хүчин чадалтай, найдвартай компьютерийг хамгийн
                өрсөлдөхүйц үнээр худалдан авах боломжтой.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="box_text">
              <i>
                <img src="/images/thr1.png" alt="#" />
              </i>
              <h3>Зөөврийн Компьютер</h3>
              <p>
                Шинэ үеийн зөөврийн компьютерууд танд ажлын бүтээмж, хурд,
                загварын төгс хослолыг санал болгож байна. Apple, Dell, HP,
                ASUS зэрэг дэлхийд танигдсан брэндүүдийн албан ёсны
                бүтээгдэхүүнүүд манайд бэлэн.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="box_text">
              <i>
                <img src="/images/thr2.png" alt="#" />
              </i>
              <h3>Таблет</h3>
              <p>
                Боловсрол, бизнес, энтертайнментэд зориулсан таблетуудын өргөн
                сонголт. iPad, Samsung Galaxy Tab, Lenovo зэрэг хэрэглээнд
                нийцсэн ухаалаг төхөөрөмжүүдийг бид танд шуурхай хүргэнэ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureBoxes;