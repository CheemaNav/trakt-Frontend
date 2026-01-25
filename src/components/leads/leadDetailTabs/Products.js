import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Products.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Products({ leadId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    unitPrice: 0,
    owner: '',
    category: '',
    description: ''
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editedProducts, setEditedProducts] = useState({});

  useEffect(() => {
    if (leadId) {
      fetchProducts();
      fetchUsers();
    }
  }, [leadId]);

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
      // Set default owner to current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.name) {
        setProductForm(prev => ({ ...prev, owner: currentUser.name }));
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/leads/${leadId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else if (response.status === 404) {
        // Lead not found or no products - set empty array
        setProducts([]);
      } else {
        console.error('Error fetching products:', response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set empty array on error to prevent UI issues
      setProducts([]);
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
        body: JSON.stringify({
          name: productForm.name,
          code: productForm.code,
          price: productForm.unitPrice,
          quantity: 1,
          discount: 0,
          owner: productForm.owner,
          category: productForm.category,
          description: productForm.description
        })
      });

      if (response.ok) {
        // Refresh products list from server
        await fetchProducts();
        // Reset form and close modal
        setProductForm({ name: '', code: '', unitPrice: 0, owner: '', category: '', description: '' });
        setShowAddModal(false);
      } else {
        let errorMessage = 'Failed to add product';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          if (response.status === 404) {
            errorMessage = 'Backend server not running or route not found. Please restart the backend server.';
          } else {
            errorMessage = response.statusText || errorMessage;
          }
        }
        alert(`Error: ${errorMessage}`);
        setAddingProduct(false);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        alert('Error: Cannot connect to backend server. Please make sure the backend server is running on http://localhost:5001');
      } else {
        alert(`Error adding product: ${error.message || 'Please try again.'}`);
      }
      setAddingProduct(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: name === 'unitPrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.id);
    setEditedProducts({
      ...editedProducts,
      [product.id]: {
        name: product.name,
        price: product.price || product.listPrice || 0,
        quantity: product.quantity || 1,
        discount: product.discount || 0
      }
    });
  };

  const handleEditFieldChange = (productId, field, value) => {
    setEditedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: field === 'price' || field === 'quantity' || field === 'discount' 
          ? parseFloat(value) || 0 
          : value
      }
    }));
  };

  const handleSaveProduct = async (productId) => {
    const editedData = editedProducts[productId];
    if (!editedData) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        // Refresh products list from server
        await fetchProducts();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update product' }));
        alert(`Error: ${errorData.error || 'Failed to update product'}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Error updating product: ${error.message || 'Please try again.'}`);
    }

    setEditingProduct(null);
    const newEdited = { ...editedProducts };
    delete newEdited[productId];
    setEditedProducts(newEdited);
  };

  const handleCancelEdit = (productId) => {
    setEditingProduct(null);
    const newEdited = { ...editedProducts };
    delete newEdited[productId];
    setEditedProducts(newEdited);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok || response.status === 404) {
        // Refresh products list from server
        await fetchProducts();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete product' }));
        alert(`Error: ${errorData.error || 'Failed to delete product'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Error deleting product: ${error.message || 'Please try again.'}`);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const calculateProductTotal = (product) => {
    const price = product.price || product.listPrice || 0;
    const quantity = product.quantity || 1;
    const discount = product.discount || 0;
    const subtotal = price * quantity;
    return subtotal - discount;
  };

  const calculateGrandTotal = () => {
    return products.reduce((sum, product) => {
      return sum + calculateProductTotal(product);
    }, 0);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (loading) {
    return <div className="products-loading">Loading products...</div>;
  }

  return (
    <div className="products-panel">
      <div className="products-header">
        <h2>Products</h2>
      </div>

      {showAddModal && createPortal(
        <div className="product-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="product-modal-header">
              <h2>Quick Create: Product</h2>
              <button className="product-modal-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form className="product-modal-form" onSubmit={handleAddProduct}>
              <div className="product-form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                  autoFocus
                />
              </div>
              <div className="product-form-group">
                <label>Product Code</label>
                <input
                  type="text"
                  name="code"
                  value={productForm.code}
                  onChange={handleInputChange}
                  placeholder="Enter product code"
                />
              </div>
              <div className="product-form-group">
                <label>Unit Price</label>
                <div className="product-price-input-wrapper">
                  <input
                    type="number"
                    name="unitPrice"
                    value={productForm.unitPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <span className="product-price-symbol">₹</span>
                </div>
              </div>
              <div className="product-form-group">
                <label>Owner</label>
                <select
                  name="owner"
                  value={productForm.owner}
                  onChange={handleInputChange}
                >
                  <option value="">Select owner</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.name}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="product-form-group">
                <label>Product Category</label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                >
                  <option value="">-None-</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Software">Software</option>
                  <option value="Services">Services</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="product-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  placeholder="A few words about this product"
                  rows={4}
                />
              </div>
              <div className="product-modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={addingProduct || !productForm.name.trim()}>
                  {addingProduct ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>List Price (₹)</th>
              <th>Quantity</th>
              <th>Discount</th>
              <th>Total (₹)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => {
                const isEditing = editingProduct === product.id;
                const editedData = editedProducts[product.id] || {};
                const displayProduct = isEditing ? { ...product, ...editedData } : product;
                const total = calculateProductTotal(displayProduct);
                
                return (
                  <tr key={product.id} className={isEditing ? 'product-row-editing' : ''}>
                    <td>
                      <div className="product-cell">
                        <div 
                          className="product-avatar" 
                          style={{ backgroundColor: getAvatarColor(displayProduct.name) }}
                        >
                          {getInitials(displayProduct.name)}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            className="product-name-input"
                            value={editedData.name || product.name}
                            onChange={(e) => handleEditFieldChange(product.id, 'name', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="product-name-text">{product.name}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="product-edit-input"
                          value={editedData.price !== undefined ? editedData.price : (product.price || product.listPrice || 0)}
                          onChange={(e) => handleEditFieldChange(product.id, 'price', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        formatCurrency(product.price || product.listPrice || 0)
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="product-edit-input"
                          value={editedData.quantity !== undefined ? editedData.quantity : (product.quantity || 1)}
                          onChange={(e) => handleEditFieldChange(product.id, 'quantity', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          min="1"
                          step="0.01"
                        />
                      ) : (
                        (product.quantity || 1).toFixed(2)
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="product-edit-input"
                          value={editedData.discount !== undefined ? editedData.discount : (product.discount || 0)}
                          onChange={(e) => handleEditFieldChange(product.id, 'discount', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        formatCurrency(product.discount || 0)
                      )}
                    </td>
                    <td className="product-total-cell">{formatCurrency(total)}</td>
                    <td className="product-actions-cell">
                      {isEditing ? (
                        <div className="product-action-buttons">
                          <button
                            className="product-save-btn"
                            onClick={() => handleSaveProduct(product.id)}
                            title="Save"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                          <button
                            className="product-cancel-btn"
                            onClick={() => handleCancelEdit(product.id)}
                            title="Cancel"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="product-action-buttons">
                          <button
                            className="product-edit-btn"
                            onClick={() => handleEditProduct(product)}
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="product-delete-btn"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="products-empty-cell">
                  No products added yet.
                </td>
              </tr>
            )}
          </tbody>
          {products.length > 0 && (
            <tfoot>
              <tr className="grand-total-row">
                <td colSpan="4" className="grand-total-label">Grand Total</td>
                <td className="grand-total-amount">{formatCurrency(calculateGrandTotal())}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="products-footer">
        <button 
          className="add-product-link" 
          onClick={() => setShowAddModal(true)}
        >
          + Product
        </button>
      </div>
    </div>
  );
}

export default Products;
