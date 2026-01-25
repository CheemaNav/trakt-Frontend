import React, { useState, useEffect } from 'react';
import './Products.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Products({ leadId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    quantity: 1,
    price: 0
  });
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [leadId]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    setAddingProduct(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        const data = await response.json();
        setProducts([data.product, ...products]);
        setProductForm({ name: '', description: '', quantity: 1, price: 0 });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setAddingProduct(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
  };

  if (loading) {
    return <div className="products-loading">Loading products...</div>;
  }

  return (
    <div className="products-panel">
      <div className="products-header">
        <h2>Products</h2>
        <div className="products-header-actions">
          <span className="products-count">{products.length}</span>
          <button 
            className="add-product-btn" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add Product
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="product-form" onSubmit={handleAddProduct}>
          <div className="product-form-row">
            <div className="product-form-field">
              <label>Product Name *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="product-form-field">
              <label>Price</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="product-form-field">
              <label>Quantity</label>
              <input
                type="number"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 1 })}
                placeholder="1"
                min="1"
              />
            </div>
          </div>
          <div className="product-form-field">
            <label>Description</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Enter product description..."
              rows={3}
            />
          </div>
          <div className="product-form-actions">
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" disabled={addingProduct || !productForm.name.trim()}>
              {addingProduct ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      )}

      {products.length > 0 && (
        <div className="products-total">
          <strong>Total: {formatCurrency(calculateTotal())}</strong>
        </div>
      )}

      <div className="products-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="product-item">
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                {product.description && (
                  <div className="product-description">{product.description}</div>
                )}
                <div className="product-meta">
                  Quantity: {product.quantity} × {formatCurrency(product.price)} = {formatCurrency(product.price * product.quantity)}
                </div>
              </div>
              <div className="product-total">
                {formatCurrency(product.price * product.quantity)}
              </div>
            </div>
          ))
        ) : (
          <div className="products-empty">
            <p>No products added yet. Add your first product above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;







