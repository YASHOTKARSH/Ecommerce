import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart as addToCartAction,
  updateCartQuantity,
  removeFromCart,
  clearCart as clearCartAction,
} from '../redux/slices/cartSlice';

const useCart = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.cart);

  const total = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const addToCart = (product, quantity = 1) => {
    return dispatch(addToCartAction({ product, quantity }));
  };

  const updateQuantity = (productId, quantity) => {
    return dispatch(updateCartQuantity({ productId, quantity }));
  };

  const removeItem = (productId) => {
    return dispatch(removeFromCart(productId));
  };

  const clearCart = () => {
    return dispatch(clearCartAction());
  };

  return {
    items,
    total,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
};

export default useCart;
