import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkout, checkoutCOD, createRazorpayOrder, verifyPayment, clearCurrentOrder } from '../store/slices/orderSlice';
import { resetCart } from '../store/slices/cartSlice';
import API from '../api/axios';

export default function Checkout() {
  const [address, setAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [razorpayError, setRazorpayError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const { currentOrder, loading, razorpayLoading, error } = useSelector((s) => s.orders);

  useEffect(() => {
    if (items.length === 0 && !currentOrder) navigate('/cart');
  }, [items, currentOrder, navigate]);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);
    if (!couponCode.trim()) return;
    try {
      const res = await API.post('/coupons/validate', { code: couponCode });
      setAppliedCoupon(res.data);
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRazorpayError('');

    const result = await dispatch(createRazorpayOrder());
    if (result.meta.requestStatus === 'rejected') {
      setRazorpayError('Payment gateway unavailable. You can place a direct order instead.');
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setRazorpayError('Failed to load payment SDK. Try direct order.');
      return;
    }

    const { razorpayOrderId, amount, currency, keyId } = result.payload;

    const options = {
      key: keyId,
      amount,
      currency,
      name: 'ShopZone',
      order_id: razorpayOrderId,
      handler: async (response) => {
        const verifyRes = await dispatch(verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          shippingAddress: address,
          couponCode: appliedCoupon?.code,
        }));
        if (verifyRes.meta.requestStatus === 'fulfilled') {
          dispatch(resetCart());
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: { color: '#4f46e5' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleDirectCheckout = () => {
    dispatch(checkoutCOD({ shippingAddress: address, couponCode: appliedCoupon?.code }));
  };

  const handleContinue = () => {
    dispatch(clearCurrentOrder());
    dispatch(resetCart());
    navigate('/orders');
  };

  if (currentOrder) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">Order Number: <span className="font-mono font-bold">{currentOrder.orderNumber}</span></p>
        {currentOrder.discountAmount > 0 && (
          <p className="text-green-600 text-sm mb-1">Coupon applied: {currentOrder.couponCode} (saved ${currentOrder.discountAmount})</p>
        )}
        <p className="text-gray-600 dark:text-gray-400 mb-6">Total: ${currentOrder.totalAmount}</p>
        <button onClick={handleContinue}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
        <h2 className="font-semibold mb-4">Order Summary</h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 border-b dark:border-gray-700 last:border-0">
            <span>{item.productName} x{item.quantity}</span>
            <span>${item.subtotal}</span>
          </div>
        ))}

        <div className="flex items-center gap-2 mt-4 pt-4 border-t dark:border-gray-700">
          <input type="text" placeholder="Coupon code" value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600" />
          <button type="button" onClick={handleApplyCoupon}
            className="bg-gray-200 dark:bg-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
            Apply
          </button>
        </div>
        {appliedCoupon && (
          <p className="text-green-600 text-sm mt-1">{appliedCoupon.code} — {appliedCoupon.discountPercent}% off</p>
        )}
        {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}

        {discount > 0 && (
          <div className="flex justify-between pt-2 text-sm">
            <span className="text-green-600">Discount</span>
            <span className="text-green-600">-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between pt-4 font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="font-semibold mb-4">Shipping Address</h2>
        <textarea required value={address} onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your full shipping address"
          rows={4} className="w-full border rounded-lg px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600" />

        {razorpayError && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-2">{razorpayError}</p>
            <button type="button" onClick={handleDirectCheckout} disabled={loading}
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Processing...' : `Place COD Order — $${total.toFixed(2)}`}
            </button>
          </div>
        )}

        <button type="submit" disabled={razorpayLoading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 mb-3">
          {razorpayLoading ? 'Connecting to Payment...' : `Pay with Razorpay — $${total.toFixed(2)}`}
        </button>
        <button type="button" onClick={handleDirectCheckout} disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Processing...' : `Cash on Delivery — $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
