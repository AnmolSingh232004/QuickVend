import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../api/axios';

export default function ReviewSection({ productId }) {
  const { user, token } = useSelector((s) => s.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReviews = async () => {
    try {
      const res = await API.get(`/products/${productId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      // silently fail
    }
    setLoading(false);
  };

  useEffect(() => {
    if (productId) loadReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await API.post(`/products/${productId}/reviews`, { rating, comment });
      setSuccess('Review submitted!');
      setComment('');
      setRating(5);
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const renderStars = (r) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < r ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ));
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>

      {token && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 mb-6">
          <h3 className="font-medium mb-3 dark:text-gray-100">Write a Review</h3>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}
                className={`text-2xl ${n <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}>
                ★
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={3} className="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          <button type="submit" disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">
          {token ? 'No reviews yet. Be the first!' : 'No reviews yet.'}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm dark:text-gray-100">{review.userName}</span>
                  <span className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-lg">{renderStars(review.rating)}</div>
              </div>
              {review.comment && <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
