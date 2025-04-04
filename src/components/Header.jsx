import {Link, NavLink} from "react-router-dom";
import { FaHeart, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import useFetch from "../useFetch";
import { useState } from "react";
const Header = () => {
    const [searchInput, setSearchInput] = useState('');
    //const [showProduct, setShowProduct] = useState(false);
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [searchProduct, setSearchProduct] = useState([]);
    const {data: allProductData} = useFetch(`https://electronic-store-backend-sepia.vercel.app/products/all`);

    const {data} = useFetch(`https://electronic-store-backend-sepia.vercel.app/product/wishlist/get`);
    const {data: cartData} = useFetch(`https://electronic-store-backend-sepia.vercel.app/product/cart/get`);
    const cartDataLength = cartData? cartData.data && cartData.data.length : 0;
    
    const allProducts = allProductData? allProductData.data : [];

    const handleSearchField = (e) => {
        //console.log(e.target.value);
        setSearchInput(e.target.value);
        const productFound = allProducts? allProducts.filter(product => e.target.value !== "" && product.title.toLowerCase().includes(e.target.value.toLowerCase())) : [];
        if(productFound.length > 0 && searchInput !== ''){
            setSearchProduct(productFound);
            setShowSearchPanel(searchProduct.length > 0);
        }else{
            setShowSearchPanel(productFound.length > 0);
            setSearchProduct([]);
        }
    }
    return(
        <>
        <header>
            <nav className="navbar navbar-expand-lg navbar-light bg-white">
                <div className="container">
                    {/* Brand */}
                    <NavLink className="navbar-brand fw-bold" to="/">
                    Electronic Store
                    </NavLink>

                    {/* Search Bar*/} 
                    <div className="d-flex ms-auto w-25 position-relative">
                        <input
                            id="searchField"
                            className="form-control"
                            type="search"
                            placeholder="Search By Product name"
                            value={searchInput}
                            onChange={handleSearchField}
                            onFocus={() => setShowSearchPanel(searchProduct.length > 0)}
                        />
                    </div>
                    {/* Search Panel */}
                    {showSearchPanel && (
                        <div className="container position-absolute w-100 bg-white border shadow p-3 mt-1" 
                            style={{ top: "100%", width: "1000px", minHeight: "200px", maxHeight: "1200px", overflowY: "auto", zIndex: 1000 }}>
                            <div className="container">
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
                            </div>
                        </div>
                    )}


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
        </>
    )
}
export default Header;