import React from 'react'
import './Products.css'

export default function Products() {
  const products = [
    {
      id: 1,
      name: 'Electronics',
      icon: '📱',
      description: 'Latest gadgets and devices'
    },
    {
      id: 2,
      name: 'Fashion',
      icon: '👗',
      description: 'Trendy clothing and accessories'
    },
    {
      id: 3,
      name: 'Home & Garden',
      icon: '🏠',
      description: 'Everything for your home'
    },
    {
      id: 4,
      name: 'Sports',
      icon: '⚽',
      description: 'Sports and outdoor equipment'
    },
    {
      id: 5,
      name: 'Books',
      icon: '📚',
      description: 'Wide selection of books'
    },
    {
      id: 6,
      name: 'Beauty',
      icon: '💄',
      description: 'Beauty and personal care'
    }
  ]

  return (
    <section className="products" id="products">
      <div className="container">
        <h2 className="section-title">Featured Categories</h2>
        <p className="section-subtitle">Explore our wide range of products</p>

        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card shadow">
              <div className="product-icon">{product.icon}</div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <button className="btn-explore">Explore →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

