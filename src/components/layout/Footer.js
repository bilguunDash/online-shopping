// components/Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer>
      <div className="footer">
        <div className="container">
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <img className="logo1" src="/images/logo1.png" alt="#" />
              <ul className="social_icon">
                <li>
                  <a href="#">
                    <i className="fa fa-facebook" aria-hidden="true"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fa fa-twitter" aria-hidden="true"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fa fa-linkedin-square" aria-hidden="true"></i>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fa fa-instagram" aria-hidden="true"></i>
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <h3>Бидний тухай</h3>
              <ul className="about_us">
                <li>
                  Бид технологийн бүтээгдэхүүний
                  <br /> хамгийн сүүлийн үеийн <br />
                  загварыг хэрэглэгчдэд <br /> хүргэхийг эрхэм зорилго болгоно
                </li>
              </ul>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <h3>Холбоо барих</h3>
              <ul className="conta">
                <li>
                  Монгол улс, Улаанбаатар хот
                  <br /> Сүхбаатар дүүрэг <br />
                  8-р хороо, Их Монгол гудамж
                  <br /> Тел: 99887766 <br />
                  И-мэйл: info@tech-e-commerce.mn
                </li>
              </ul>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <form className="bottom_form">
                <h3>Мэдээлэл</h3>
                <input
                  className="enter"
                  placeholder="И-мэйл хаягаа оруулна уу"
                  type="text"
                  name="И-мэйл хаяг"
                />
                <button className="sub_btn">Бүртгүүлэх</button>
              </form>
            </div>
          </div>
        </div>
        <div className="copyright">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <p>
                  © 2024 Бүх эрх хуулиар хамгаалагдсан. {" "}
                  <a href="https://html.design/">Tech E-Commerce</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;