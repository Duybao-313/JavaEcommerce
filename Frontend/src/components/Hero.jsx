import React from 'react'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-content">
          <h2 className="hero-title">Welcome to SplitGo</h2>
          <p className="hero-subtitle">Your Premier Destination for Quality Products at Unbeatable Prices</p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Shop Now</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="placeholder-image">
            📦 Your Store Image
          </div>
        </div>
      </div>
    </section>
  )
}

