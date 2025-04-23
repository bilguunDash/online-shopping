import React, { useState, useEffect } from "react";
import Link from "next/link";

const Banner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = 6;
  
  // Auto-rotate carousel items every 4 seconds (changed from 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slideCount);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle manual navigation
  const goToSlide = (index) => {
    setActiveIndex(index);
  };
  
  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % slideCount);
  };
  
  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + slideCount) % slideCount);
  };

  // Carousel data
  const carouselItems = [

    {
      id: "computers",
      tagline: "Хамгийн Шинэ Технологи",
      title: "Компьютер",
      description: "Тоглоом, загвар дизайн, оффисын ажлын хэрэгцээнд тохирсон, хамгийн сүүлийн үеийн үзүүлэлт бүхий компьютеруудыг сонгоорой.",
      image: "/images/pc.png",
      primaryCta: "Худалдан Авах",
      secondaryCta: "Дэлгэрэнгүй"
    },
    {
      id: "laptops",
      tagline: "Хүчирхэг Үзүүлэлт",
      title: "Лаптоп",
      description: "Удаан цэнэг барих чадвартай, авсаархан загвартай, өндөр хүчин чадалтай лаптопуудыг санал болгож байна.",
      image: "/images/notebook.png",
      primaryCta: "Худалдан Авах",
      secondaryCta: "Дэлгэрэнгүй"
    },
    {
      id: "phones",
      tagline: "Ухаалаг Төхөөрөмжүүд",
      title: "Утас",
      description: "Шинэлэг загвар, ухаалаг шийдлүүдтэй, өндөр хүчин чадалтай ухаалаг гар утаснуудыг сонгон аваарай.",
      image: "/images/nice.png",
      primaryCta: "Худалдан Авах",
      secondaryCta: "Дэлгэрэнгүй"
    },
    {
      id: "tablets",
      tagline: "Хөнгөн Хөдөлгөөнт Байдал",
      title: "Таблет",
      description: "Ажил, амралтыг хослуулсан өндөр үзүүлэлттэй таблетууд таны өдөр тутмын туслах байх болно.",
      image: "/images/tablets.png",
      primaryCta: "Худалдан Авах",
      secondaryCta: "Дэлгэрэнгүй"
    },
    {
      id: "headphones",
      tagline: "Дээд Зэргийн Дуугаралт",
      title: "Чихэвч",
      description: "Утасгүй, дуу тусгаарлагчтай, дээд зэрэглэлийн чихэвчнүүдээр хөгжим сонсох шинэ түвшинд хүрээрэй.",
      image: "/images/headphones.png",
      primaryCta: "Худалдан Авах",
      secondaryCta: "Дэлгэрэнгүй"
    },
    {
      id: "smarttvs",
      tagline: "Төгс Зугаа Цэнгэл",
      title: "Смарт ТВ",
      description: "HD болон 4K нягтралтай, интернэт холболттой, ухаалаг функцүүд бүхий телевизүүд таны гэрийн энтертайнмент төв байх болно.",
      image: "/images/smartv.png",
      primaryCta: "Худалдан Авах",
      secondaryCta: "Дэлгэрэнгүй"
    }
  ];
  

  return (
<section style={{
  background: 'url(/images/banner.jpg) no-repeat center center',
  backgroundSize: 'cover',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
}}>
      <div id="banner1" className="carousel slide" data-ride="carousel">
        <ol className="carousel-indicators">
          {carouselItems.map((_, index) => (
            <li 
              key={index}
              onClick={() => goToSlide(index)}
              className={index === activeIndex ? "active" : ""}
            ></li>
          ))}
        </ol>
        
        <div className="carousel-inner">
          {carouselItems.map((item, index) => (
            <div 
              key={item.id}
              className={`carousel-item ${index === activeIndex ? "active" : ""} ${item.id}-slide`}
            >
              <div className="overlay"></div>
              <div className="container">
                <div className="carousel-caption">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="text-bg">
                        <span>{item.tagline}</span>
                        <h1>{item.title}</h1>
                        <p>{item.description}</p>
                        <Link href="#">{item.primaryCta}</Link>
                        <Link href="/contact">{item.secondaryCta}</Link>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text_img">
                        <div className="image-container">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="product-image"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Improved Carousel controls with arrow styles */}
        <a
          className="carousel-control-prev"
          onClick={prevSlide}
          role="button"
        >
          <div className="arrow-container-prev">
            <i className="fa fa-chevron-left" aria-hidden="true"></i>
          </div>
          <span className="sr-only">Previous</span>
        </a>
        <a
          className="carousel-control-next"
          onClick={nextSlide}
          role="button"
        >
          <div className="arrow-container-next">
            <i className="fa fa-chevron-right" aria-hidden="true"></i>
          </div>
          <span className="sr-only">Next</span>
        </a>
      </div>
      
      {/* CSS for standardized image sizes and modern transitions */}
      <style jsx>{`
        .image-container {
          height: 400px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .product-image {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
          transition: transform 0.5s ease;
        }
        
        .carousel-item.active .product-image {
          animation: fadeInScale 0.8s forwards;
        }
        
        /* Modern transition effects */
        .carousel-item {
          transition: opacity 0.6s ease-in-out;
        }
        
        .carousel-item.active .text-bg {
          animation: slideInRight 0.8s forwards;
        }
        
        .carousel-item.active .text_img {
          animation: fadeIn 0.8s forwards;
        }
        
        /* Styled arrow controls */
        .arrow-container-prev,
        .arrow-container-next {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .arrow-container-prev:hover,
        .arrow-container-next:hover {
          background-color: rgba(255, 255, 255, 0.9);
          transform: scale(1.1);
        }
        
        .carousel-control-prev,
        .carousel-control-next {
          opacity: 1;
          cursor: pointer;
        }
        
        .carousel-control-prev i,
        .carousel-control-next i {
          color: #333;
          font-size: 20px;
        }
        
        /* Indicator styles */
        .carousel-indicators li {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 0 5px;
          background-color: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
          border: none;
        }
        
        .carousel-indicators li.active {
          background-color: #fff;
          transform: scale(1.2);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        
        /* Animation keyframes */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @media (max-width: 768px) {
          .image-container {
            height: 250px;
          }
          
          .arrow-container-prev,
          .arrow-container-next {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
      
      {/* Initialize Bootstrap carousel with 4-second interval */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            if (typeof window !== 'undefined' && window.jQuery && window.jQuery.fn.carousel) {
              jQuery('#banner1').carousel({
                interval: 4000, /* Changed from 5000ms to 4000ms */
                pause: "hover",
                wrap: true
              });
            }
          });
        `
      }} />
    </section>
  );
};

export default Banner;