export const getCart = () => {
  try {
    const raw = localStorage.getItem('openlib_cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addToCart = (book) => {
  const cart = getCart();
  const existing = cart.find(item => item.book_id === book.book_id);
  const currentTotal = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  if (currentTotal >= 5) {
    return { error: 'Tổng số lượng sách mượn không được vượt quá 5 cuốn!' };
  }
  
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...book, quantity: 1 });
  }
  
  localStorage.setItem('openlib_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
  return { success: true };
};

export const updateCartQuantity = (bookId, newQty) => {
  const cart = getCart();
  const index = cart.findIndex(item => item.book_id === bookId);
  if (index !== -1) {
    if (newQty <= 0) {
      cart.splice(index, 1);
    } else {
      const otherSum = cart.reduce((sum, item) => item.book_id === bookId ? sum : sum + (item.quantity || 1), 0);
      if (otherSum + newQty > 5) {
        return { error: 'Tổng số lượng sách mượn không được vượt quá 5 cuốn!' };
      }
      cart[index].quantity = newQty;
    }
    localStorage.setItem('openlib_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    return { success: true };
  }
  return { error: 'Không tìm thấy sách trong giỏ!' };
};

export const removeFromCart = (bookId) => {
  const cart = getCart();
  const updated = cart.filter(item => item.book_id !== bookId);
  localStorage.setItem('openlib_cart', JSON.stringify(updated));
  window.dispatchEvent(new Event('cart-updated'));
};

export const clearCart = () => {
  localStorage.removeItem('openlib_cart');
  window.dispatchEvent(new Event('cart-updated'));
};
