import React from "react";
import "./AboutPage.css";

import about1 from "../../Assets/About/about-1.jpg";
import about2 from "../../Assets/About/about-2.jpg";

import Services from "../../Components/Home/Services/Services";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

import brand1 from "../../Assets/Brands/brand1.png";
import brand2 from "../../Assets/Brands/brand2.png";
import brand3 from "../../Assets/Brands/brand3.png";
import brand4 from "../../Assets/Brands/brand4.png";
import brand5 from "../../Assets/Brands/brand5.png";
import brand6 from "../../Assets/Brands/brand6.png";
import brand7 from "../../Assets/Brands/brand7.png";

const AboutPage = () => {
  return (
    <>
      <div className="aboutSection">
        <h2>About FitFusion</h2>
        <img src={about1} alt="" />
        <div className="aboutContent">
          <h3>Our Story</h3>
          <h4>
          At FitFusion, we believe that fashion should be effortless, personalized, and innovative. Our journey began with a simple idea: to revolutionize the way people shop for clothing online. We saw a challenge—shoppers struggling with uncertainty about how clothes would look on them before making a purchase. That’s when we decided to harness the power of AI and create a Virtual Try-On Platform that brings confidence and convenience to online shopping.

With advanced face-swapping technology and AI-driven image processing, FitFusion allows users to see themselves in their favorite outfits before they buy. No more guesswork—just a seamless, realistic preview of how fashion fits you!

Driven by a passion for technology and style, we built FitFusion using cutting-edge tools like React, Tailwind CSS, Flask, and Hugging Face models to provide an interactive, immersive shopping experience. Our vision extends beyond fashion—soon, we aim to expand into AR/VR, allowing users to try on accessories, shoes, and even furniture in their own spaces.

Join us on this exciting journey as we transform online shopping with AI-powered personalization. At FitFusion, fashion meets innovation, and you become the model.
          </h4>
          
          <div className="content1">
            <div className="contentBox">
              <h5>Our Mission</h5>
              <p>
              At FitFusion, our mission is to revolutionize online shopping by bridging the gap between imagination and reality. We aim to provide a seamless and immersive Virtual Try-On experience that empowers users to confidently explore fashion, visualize their style, and make informed purchase decisions. By combining cutting-edge AI technology with an intuitive user interface, we strive to make online shopping more engaging, personalized, and hassle-free.
              </p>
            </div>
            <div className="contentBox">
              <h5>Our Vision</h5>
              <p>
              We envision a future where AI-driven virtual try-ons redefine the e-commerce industry, making fashion more accessible, inclusive, and interactive for everyone. Our goal is to expand beyond clothing, integrating AR/VR innovations to allow users to try on accessories, shoes, and even furniture—all from the comfort of their homes. FitFusion is more than a platform; it’s the future of digital shopping, where technology and style blend seamlessly.
              </p>
            </div>
          </div>
          <div className="content2">
            <div className="imgContent">
              <img src={about2} alt="" />
            </div>
            <div className="textContent">
              <h5>The Company</h5>
              <p>
              FitFusion was founded with a passion for transforming the online shopping experience through innovation and technology. Our team consists of dedicated developers, AI engineers, and fashion enthusiasts who are committed to delivering a premium, user-friendly platform. By leveraging advanced machine learning models like InSwapper from Hugging Face, React, Tailwind CSS, and Flask, we have built an ecosystem where users can visualize their fashion choices with unparalleled accuracy.

As we continue to grow, we remain focused on pushing the boundaries of AI-powered fashion technology, ensuring that FitFusion remains at the forefront of the next-generation e-commerce experience.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Services />
      <div className="companyPartners">
        <h5>Company Partners</h5>
        <Swiper
          slidesPerView={1}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 5,
            },

            768: {
              slidesPerView: 4,
              spaceBetween: 40,
            },

            1024: {
              slidesPerView: 5,
              spaceBetween: 50,
            },
          }}
          spaceBetween={10}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
        >
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand1} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand2} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand3} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand4} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand5} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand6} alt="" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="aboutBrands">
              <img src={brand7} alt="" />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </>
  );
};

export default AboutPage;
