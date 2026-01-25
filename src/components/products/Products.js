import React, { useState, useEffect } from 'react';
import './Products.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const FilterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

function Products() {
  const [products, setProducts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    price: 0,
    quantity: 1,
    discount: 0,
    owner: '',
    category: '',
    description: '',
    leadId: '',
    active: true
  });

  useEffect(() => {
    fetchData();
    fetchLeads();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = () => {
      setShowLeadDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Products fetched:', data.products?.length || 0, 'products');
        console.log('Products data:', data.products);
        setProducts(data.products || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch products' }));
        console.error('Error fetching products:', response.status, errorData);
        alert(`Error: ${errorData.error || 'Failed to fetch products'}`);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error fetching products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getOwnerName = (ownerId) => {
    const owner = users.find(u => u.id === ownerId);
    return owner ? owner.name : 'Unassigned';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateTotal = (product) => {
    const price = product.price || 0;
    const quantity = product.quantity || 1;
    const discount = product.discount || 0;
    const subtotal = price * quantity;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    // Filter by lead
    if (selectedLead && selectedLead !== '') {
      const leadId = parseInt(selectedLead);
      if (product.lead_id !== leadId) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name?.toLowerCase().includes(query);
      const matchesCode = product.code?.toLowerCase().includes(query);
      const matchesLead = product.lead_name?.toLowerCase().includes(query) || 
                         product.lead_company?.toLowerCase().includes(query);
      if (!matchesName && !matchesCode && !matchesLead) {
        return false;
      }
    }

    return true;
  });

  // Debug logging
  useEffect(() => {
    console.log('Products state:', products.length, 'products');
    console.log('Filtered products:', filteredProducts.length, 'products');
    console.log('Selected lead filter:', selectedLead);
    console.log('Search query:', searchQuery);
    if (products.length > 0) {
      console.log('Sample product:', products[0]);
    }
  }, [products, filteredProducts, selectedLead, searchQuery]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.leadId) {
      alert('Please fill in Product Name and select a Lead');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${productForm.leadId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: productForm.name,
          code: productForm.code,
          price: productForm.price || 0,
          quantity: productForm.quantity || 1,
          discount: productForm.discount || 0,
          owner: productForm.owner,
          category: productForm.category,
          description: productForm.description
        })
      });

      if (response.ok) {
        await fetchData();
        setShowAddModal(false);
        setProductForm({
          name: '',
          code: '',
          price: 0,
          quantity: 1,
          discount: 0,
          owner: '',
          category: '',
          description: '',
          leadId: '',
          active: true
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add product' }));
        alert(`Error: ${errorData.error || 'Failed to add product'}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(currentPageProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageProducts = filteredProducts.slice(startIndex, endIndex);
  const allSelectedOnPage = currentPageProducts.length > 0 && currentPageProducts.every(p => selectedProducts.includes(p.id));

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="products-header-left">
          <div className="lead-filter-wrapper">
            <button
              className="lead-filter-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLeadDropdown(!showLeadDropdown);
              }}
            >
              {selectedLead ? (leads.find(l => l.id === parseInt(selectedLead))?.name || leads.find(l => l.id === parseInt(selectedLead))?.company || `Lead ${selectedLead}`) : 'All Leads'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showLeadDropdown && (
              <div className="lead-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => {
                  setSelectedLead('');
                  setShowLeadDropdown(false);
                  setCurrentPage(1);
                }}>
                  All Leads
                </button>
                {leads.map(lead => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      setSelectedLead(lead.id.toString());
                      setShowLeadDropdown(false);
                      setCurrentPage(1);
                    }}
                  >
                    {lead.name || lead.company || `Lead ${lead.id}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="products-header-right">
          <div className="products-search">
            <div className="search-input-wrapper">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
          </div>
          <button className="filter-icon-btn" title="Filter">
            <FilterIcon />
          </button>
          <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
            + Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Product Name</th>
              <th>Product Code</th>
              <th>Product Active</th>
              <th>Product Owner</th>
              <th>Quantity</th>
              <th>List Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="loading-cell">Loading products...</td>
              </tr>
            ) : currentPageProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-cell">No products found</td>
              </tr>
            ) : (
              currentPageProducts.map(product => {
                const ownerName = product.owner || product.owner_name || 'Unassigned';
                const isActive = product.active !== undefined ? product.active : true;
                
                return (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </td>
                    <td className="product-name-cell">
                      <div className="product-name">{product.name}</div>
                      {product.lead_name && (
                        <div className="product-lead">{product.lead_name}</div>
                      )}
                    </td>
                    <td>{product.code || '-'}</td>
                    <td>
                      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="owner-cell">
                        <div
                          className="owner-avatar"
                          style={{ backgroundColor: getAvatarColor(ownerName) }}
                        >
                          {getInitials(ownerName)}
                        </div>
                        {ownerName}
                      </div>
                    </td>
                    <td>{product.quantity || 1}</td>
                    <td>{formatCurrency(product.price || 0)}</td>
                    <td className="total-cell">{formatCurrency(calculateTotal(product))}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="products-footer">
        <div className="products-info">
          Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} entries
        </div>
        <div className="products-pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            &lt;&lt; Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next &gt;&gt;
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-group">
                <label>Lead *</label>
                <select
                  value={productForm.leadId}
                  onChange={(e) => setProductForm({ ...productForm, leadId: e.target.value })}
                  required
                >
                  <option value="">Select Lead</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name || lead.company || `Lead ${lead.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Product Code</label>
                <input
                  type="text"
                  value={productForm.code}
                  onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>List Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    step="1"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Discount (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.discount}
                  onChange={(e) => setProductForm({ ...productForm, discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Owner</label>
                <select
                  value={productForm.owner}
                  onChange={(e) => setProductForm({ ...productForm, owner: e.target.value })}
                >
                  <option value="">Select Owner</option>
                  {users.map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;

