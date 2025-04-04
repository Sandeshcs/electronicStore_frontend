import "bootstrap/dist/css/bootstrap.min.css"
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import useFetch from "./useFetch";
import { FaHeart, FaShoppingCart, FaUserCircle } from "react-icons/fa";

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [showProduct, setShowProduct] = useState(false);
  const [showMainPart, setShowMainPart] = useState(true);
  const [searchProduct, setSearchProduct] = useState([]);
  const {data: allProductData} = useFetch(`http://localhost:3000/products/all`);
  const {data} = useFetch(`http://localhost:3000/product/wishlist/get`);
  const {data: cartData} = useFetch(`http://localhost:3000/product/cart/get`);
  const cartDataLength = cartData? cartData.data && cartData.data.length : 0;
  const allProducts = allProductData? allProductData.data : [];

  const handleSearchField = (e) => {
      //console.log(e.target.value);
      setSearchInput(e.target.value);
      const productFound = allProducts? allProducts.filter(product => e.target.value !== "" && product.title.includes(e.target.value)) : [];
      if(productFound.length > 0){
        setSearchProduct(productFound);
        setShowProduct(true);
        setShowMainPart(false);
      }else{
        setShowProduct(false);
        setShowMainPart(true);
      }
  }
  return (
    <div>
      <header>
            <nav className="navbar navbar-expand-lg navbar-light bg-white">
                <div className="container">
                    {/* Brand */}
                    <NavLink className="navbar-brand fw-bold" to="/">
                    Electronic Store
                    </NavLink>

                    {/* Search Bar */}
                    <div className="d-flex ms-auto w-25">
                    <input
                        id='searchField'
                        className="form-control"
                        type="text"
                        placeholder="Search By Product name"
                        value={searchInput}
                        onChange={handleSearchField}
                    />
                    </div>

                    {/* Icons */}
                    <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <NavLink className="nav-link position-relative" to={'/store/wishlist'}>
                        <FaHeart color="grey" size={24}/>
                        <span className="position-absolute top-30 start-100 translate-middle badge rounded-pill bg-danger">
                        {data? data.data && data.data.length>0 && data.data.length : 0}
                        </span>
                        </NavLink>
                    </li>
                    <li className="nav-item ms-4">
                        <NavLink className="nav-link position-relative" to={`/cart`}>
                        <FaShoppingCart color="grey" size={24} />
                        <span className="position-absolute top-30 start-100 translate-middle badge rounded-pill bg-danger">
                        {cartDataLength}
                        </span>
                        </NavLink>
                    </li>
                    <li className="nav-item ms-4">
                        <NavLink className="nav-link position-relative" to={`/userProfile`}>
                        <FaUserCircle color="grey" size={24} />
                        </NavLink>
                    </li>
                    </ul>
                </div>
            </nav>
        </header>
      <div className="container mt-3">
        {showMainPart && (<div>
          <div className="row">
            <div className="col-md-1">
              <Link className="me-2" to={'/productListing/Mobile'}>
                <img src="https://rukminim2.flixcart.com/flap/80/80/image/22fddf3c7da4c4f4.png?q=100" alt=""/>
                <p>Mobile</p>
              </Link>
            </div>
            <div className="col-md-1">
              <Link to={'/productListing/Tablet'}>
                <img src="https://cdn.mos.cms.futurecdn.net/N5v7A65ccEqTjkBSChxBUW-320-80.jpg" height={'80px'} width={'80px'} alt=""/>
                <p>Tablet</p>
              </Link>
            </div>
          </div>
          <img src="https://placehold.co/1300x500?text=Electronic+Store" alt="store thumbnail" className="img-fluid mb-5"/>
        </div>)
        }
        {showProduct && searchProduct.length >0 && (
          <div className="row">
          {searchProduct.map((product, index) => (
              <div className="col-md-3" key={index}>
                  <div className="card mb-3">
                      <div className="position-relative"> 
                          <Link to={`/productDetails/${product._id}`}>
                              <img src={product.productImage} className="card-img-top bg-light object-fit-fill border img-fluid" style={{width: "350px", height: "300px"}} alt="product poster"/>
                          </Link>
                      </div>
                      <div className="card-body">
                          <p>{product.title}</p>
                          <p>₹{product.price}</p>
                          <Link className="btn btn-danger" to={`/checkOut/${'buynow'}/${product._id}`}>Buy Now</Link>
                      </div>
                  </div>
              </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
