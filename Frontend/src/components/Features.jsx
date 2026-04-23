import React from 'react'
import './Features.css'

export default function Features() {
  const features = [
    {
      id: 1,
      icon: '🚚',
      title: 'Fast Shipping',
      description: 'Get your orders delivered quickly to your doorstep'
    },
    {
      id: 2,
      icon: '🔒',
      title: 'Secure Payment',
      description: 'Safe and encrypted transactions with multiple payment options'
    },
    {
      id: 3,
      icon: '↩️',
      title: 'Easy Returns',
      description: '30-day return guarantee for your peace of mind'
    },
    {
      id: 4,
      icon: '💬',
      title: '24/7 Support',
      description: 'Our customer service team is always here to help'
    }
  ]

  return (
    <section className="features" id="features">
      <div className="container">
        <h2 className="section-title">Why Choose SplitGo?</h2>

        <div className="features-grid">
          {features.map(feature => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

