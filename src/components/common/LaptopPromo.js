// components/LaptopPromo.js
import React from "react";
import Link from "next/link";

const LaptopPromo = () => {
  return (
    <div className="laptop">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="titlepage">
              <p>Компьютер, Лаптоп бүр</p>
              <h2>40% хүртэл хямдралтай!</h2>
              <Link href="#" className="read_more">
                Худалдан авах
              </Link>
            </div>
          </div>
          <div className="col-md-6">
            <div className="laptop_box">
              <figure>
                <img src="/images/pc.png" alt="#" />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopPromo;