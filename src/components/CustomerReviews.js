import React from "react";

const CustomerReviews = () => {
  return (
    <div className="customer">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage">
              <h2>Хэрэглэгчийн тойм</h2>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div
              id="myCarousel"
              className="carousel slide customer_Carousel"
              data-ride="carousel"
            >
              <ol className="carousel-indicators">
                <li
                  data-target="#myCarousel"
                  data-slide-to="0"
                  className="active"
                ></li>
                <li data-target="#myCarousel" data-slide-to="1"></li>
                <li data-target="#myCarousel" data-slide-to="2"></li>
              </ol>
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <div className="container">
                    <div className="carousel-caption">
                      <div className="row">
                        <div className="col-md-9 ">
                          <div className="test_box">
                            <img
                              src="/images/profile.png"
                              alt="Profile"
                              style={{
                                width: "25%",
                                height: "20%",
                                borderRadius: "50%",
                                objectFit: "cover",
                                float: "left", // Зүүн тал руу чиглүүлэх
                                marginRight: "100px"
                              }}
                            />
                            <i>
                              <img src="/images/cos.png" alt="#" />
                            </i>
                            <div className="test_box d-flex align-items-start">
                              <div>
                                <h4>Bat-Erdene</h4>
                                <p>
                                Би энэ дэлгүүрээс хоёр удаа захиалсан бөгөөд хоёуланд нь хүргэлт хурдан бөгөөд найдвартай байсан. Бүтээгдэхүүний чанар маш сайн, үйлчилгээ нь маш найрсаг байсан. Би заавал дахин захиалах болно!
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="carousel-item">
                  <div className="container">
                    <div className="carousel-caption">
                      <div className="row">
                        <div className="col-md-9 ">
                          <div className="test_box">
                          <img
                              src="/images/saraas.png"
                              alt="Profile"
                              style={{
                                width: "35%",
                                height: "45%",
                                borderRadius: "50%",
                                objectFit: "cover",
                                float: "left", // Зүүн тал руу чиглүүлэх
                                marginRight: "100px"
                              }}
                            />
                            <i>
                              <img src="/images/cos.png" alt="#" />
                            </i>
                            <div className="test_box d-flex align-items-start">
                              
                              <div>
                                <h4>Saraa</h4>
                                <p>
                                Би зөөврийн компьютер худалдаж авсан бөгөөд 24 цагийн дотор бүрэн савласан. Би үнэхээр сэтгэл хангалуун байна. Та бүхний ажилд сайн сайхан бүхнийг хүсэн ерөөе!
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="carousel-item">
                  <div className="container">
                    <div className="carousel-caption">
                      <div className="row">
                        <div className="col-md-9 ">
                          <div className="test_box">
                          <img
                              src="/images/temuujin.png"
                              alt="Profile"
                              style={{
                                width: "35%",
                                height: "40%",
                                borderRadius: "50%",
                                objectFit: "cover",
                                float: "left", // Зүүн тал руу чиглүүлэх
                                marginRight: "100px"
                              }}
                            />
                            <i>
                              <img src="/images/cos.png" alt="#" />
                            </i>
                            <div className="test_box d-flex align-items-start">
                              <div>
                                <h4>Temujin</h4>
                                <p>
                                Би утас захиалсан, яг л зураг дээрх шиг сайхан байсан. Захиалга болон төлбөрийн үйл явц хялбар байсан. Энэ бол найдвартай дэлгүүр юм.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <a
                className="carousel-control-prev"
                href="#myCarousel"
                role="button"
                data-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="sr-only">Previous</span>
              </a>
              <a
                className="carousel-control-next"
                href="#myCarousel"
                role="button"
                data-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="sr-only">Next</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
