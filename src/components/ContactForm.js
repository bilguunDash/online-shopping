// components/ContactForm.js
import React from "react";

const ContactForm = () => {
  return (
    <div className="contact">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage">
              <h2>Contact Now</h2>
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
                    placeholder="Name"
                    type="text"
                    name="Name"
                  />
                </div>
                <div className="col-md-12">
                  <input
                    className="contactus"
                    placeholder="Email"
                    type="text"
                    name="Email"
                  />
                </div>
                <div className="col-md-12">
                  <input
                    className="contactus"
                    placeholder="Phone Number"
                    type="text"
                    name="Phone Number"
                  />
                </div>
                <div className="col-md-12">
                  <textarea
                    className="textarea"
                    placeholder="Message"
                    name="Message"
                  ></textarea>
                </div>
                <div className="col-md-12">
                  <button className="send_btn">Send</button>
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