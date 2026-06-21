import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import API from '../api/axios';
import { TableSkeleton } from '../components/Spinner';

const emptyForm = { name: '', description: '', price: '', imageUrl: '', sku: '', stockQuantity: 10, categoryId: '' };

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((s) => s.products);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const reset = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity), categoryId: form.categoryId ? parseInt(form.categoryId) : null };
    if (editing) {
      await API.put(`/admin/products/${editing}`, payload);
    } else {
      await API.post('/admin/products', payload);
    }
    reset();
    dispatch(fetchProducts());
  };

  const handleImageUpload = async (productId) => {
    const fileInput = document.querySelector(`#file-${productId}`);
    const file = fileInput?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    await API.post(`/admin/products/${productId}/image`, fd);
    fileInput.value = '';
    dispatch(fetchProducts());
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', price: p.price, imageUrl: p.imageUrl || '', sku: p.sku, stockQuantity: p.stockQuantity, categoryId: p.categoryId || '' });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await API.delete(`/admin/products/${id}`);
    dispatch(fetchProducts());
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">Products</h1>
        <button onClick={() => { reset(); setShowForm(!showForm); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">SKU</label>
            <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price</label>
            <input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock</label>
            <input type="number" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://picsum.photos/seed/example/400/400" className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              {editing ? 'Update' : 'Create'} Product
            </button>
          </div>
        </form>
      )}

      {loading ? <TableSkeleton rows={6} cols={5} /> : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 dark:text-gray-200">Image</th>
                <th className="text-left px-4 py-3 dark:text-gray-200">Name</th>
                <th className="text-left px-4 py-3 dark:text-gray-200">SKU</th>
                <th className="text-left px-4 py-3 dark:text-gray-200">Price</th>
                <th className="text-left px-4 py-3 dark:text-gray-200">Stock</th>
                <th className="text-left px-4 py-3 dark:text-gray-200">Category</th>
                <th className="text-right px-4 py-3 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-400">N/A</div>
                    )}
                    <input id={`file-${p.id}`} type="file" accept="image/*" className="text-xs mt-1 w-20 dark:text-gray-400" onChange={() => handleImageUpload(p.id)} />
                  </td>
                  <td className="px-4 py-3 font-medium dark:text-gray-200">{p.name}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{p.sku}</td>
                  <td className="px-4 py-3 dark:text-gray-300">${p.price}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{p.stockQuantity}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{p.categoryName || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:text-indigo-800 mr-3">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
