// components/ContactForm.js
import React from "react";

const ContactForm = () => {
  return (
    <div className="contact">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage">
              <h2>Холбоо барих</h2>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-10 offset-md-1">
            <form id="request" className="main_form">
              <div className="row">
                <div className="col-md-12">
                  <input
                    className="contactus"
                    placeholder="Нэр"
                    type="text"
                    name="Нэр"
                  />
                </div>
                <div className="col-md-12">
                  <input
                    className="contactus"
                    placeholder="И-мэйл"
                    type="text"
                    name="И-мэйл"
                  />
                </div>
                <div className="col-md-12">
                  <input
                    className="contactus"
                    placeholder="Утасны дугаар"
                    type="text"
                    name="Утасны дугаар"
                  />
                </div>
                <div className="col-md-12">
                  <textarea
                    className="textarea"
                    placeholder="Мессеж"
                    name="Мессеж"
                  ></textarea>
                </div>
                <div className="col-md-12">
                  <button className="send_btn">Илгээх</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;