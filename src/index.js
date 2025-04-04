import React from 'react';
import ReactDOM from 'react-dom/client';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import WishlistProductDetails from './pages/WishlistProductDetails';
import ProductCart from './pages/ProductCart';
import UserAccount from './pages/UserAccount';
import CheckOut from './pages/CheckOut';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='productListing/:productCategory' element={<ProductListing/>}/>
        <Route path='productDetails/:productId' element={<ProductDetails/>}/>
        <Route path='store/wishlist' element={<WishlistProductDetails/>}/>
        <Route path='cart' element={<ProductCart/>}/>
        <Route path='userProfile' element={<UserAccount/>}/>
        <Route path='checkOut/:orderFrom/:productId' element={<CheckOut/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
