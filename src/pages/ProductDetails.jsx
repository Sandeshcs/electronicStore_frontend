import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../useFetch";
import Header from "../components/Header";
import { MdFavorite } from "react-icons/md";
import { useEffect, useState } from "react";

const ProductDetails = () => {
    const {productId} = useParams();
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState({status: null, bgColor: ''});
    const [refetchCartDetails, setRefetchCart] = useState(false);
    const {data, loading, error} = useFetch(`https://electronic-store-backend-sepia.vercel.app/products/id/${productId}`);
    const categoryOfProduct = data? data.data.category:'';
    const {data:newData} = useFetch(`https://electronic-store-backend-sepia.vercel.app/products/category/${categoryOfProduct}`);
    const moreProductsULike = newData? newData.length !== 1? newData.data.filter((product) => product._id !== productId) : "No similar category products.":[];
    //console.log(newData, categoryOfProduct, moreProductsULike);

    const [addOrDeleteWishlistProduct, setAddProductToWishlist] = useState({productsInWishlist: ""});
    const [wishlistUpdated, setWishlistUpdated] = useState(false);
    const [liked, setLiked] = useState(false);

    const {data: wishlistData} = useFetch(`https://electronic-store-backend-sepia.vercel.app/product/wishlist/get?updated=${wishlistUpdated}`);
    const wishlistDataFound = wishlistData? wishlistData.data || wishlistData.error:[];
    //console.log(wishlishDataFound);

    const [addAndCheckProductInCart, setAddAndCheckProductInCart] = useState('');

    const {data: cartData} = useFetch(`https://electronic-store-backend-sepia.vercel.app/product/cart/get?updated=${refetchCartDetails}`);
    const cartProducts = cartData? cartData.data || cartData.error : [];
    //console.log(data, cartProducts);

    //function to check if this product is already in wishlisht or not.
    const checkProductInWishlist = (productId) => {
        const statusOfProductInWishlist = wishlistDataFound !== "no wishlist products found." ? wishlistDataFound.reduce((acc, curr) => {
            if(productId === curr.productsInWishlist._id){
                acc = true;
            }
            return acc;
        }, false) : false;
        //console.log(statusOfProductInWishlist);
        return statusOfProductInWishlist;
    }

    useEffect(() => {
        if(addOrDeleteWishlistProduct.productsInWishlist.length === 24){
            if(!checkProductInWishlist(addOrDeleteWishlistProduct.productsInWishlist)){
                //console.log("product not in wishlist")
                addProductToWishlist();
            }
            else{
                //console.log("product in wishlist")
                removeProductFromWishlist();
            }
        }
    }, [addOrDeleteWishlistProduct]);

    //function to add product to wishlist when clicked
    const addProductToWishlist = async () => {
        try{
            const response = await fetch('https://electronic-store-backend-sepia.vercel.app/product/wishlist/addproduct', {
                method: "POST",
                body: JSON.stringify(addOrDeleteWishlistProduct),
                headers: {
                    'content-type': 'application/json',
                },
            });

            if(!response.ok){
                throw "failed to add product to wishlist";
            }
            const productdata = await response.json();
            if(productdata){
                console.log("success ", productdata);
                setWishlistUpdated((prev) => !prev);
                setLiked(true);
                showAlertMessage("Product Added To Wishlist", "green");
                window.location.reload();
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    //function to delete product from wishlist
    const removeProductFromWishlist = async () => {
        const deleteProductId = wishlistDataFound !== "no wishlist products found." && wishlistDataFound.reduce((acc, curr) => {
            if(addOrDeleteWishlistProduct.productsInWishlist === curr.productsInWishlist._id){
                acc = curr._id;
            }
            return acc;
        }, "");
        try{
            const response = await fetch(`https://electronic-store-backend-sepia.vercel.app/product/wishlist/delete/${deleteProductId}`, {
                method: "DELETE"
            });
            if(!response.ok){
                throw "failed to delete product";
            }
            const data = await response.json();
            if(data){
                console.log(data.message);
                setWishlistUpdated((prev) => !prev);
                setLiked(false);
                showAlertMessage("Product Removed From Wishlist", "red");
                window.location.reload();
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    //function to update color of product in wishlist
    const updateWishlistColor = (productId) => {
        const status = wishlistDataFound !== "no wishlist products found." ? wishlistDataFound.reduce((acc, curr) => {
            if(productId === curr.productsInWishlist._id){
                acc = true;
            }
            return acc;
        }, false) : false;
        return status;
    }

    //function to check product present in cart or not.
    const checkProductPresentInCart = cartProducts !== "no cart products found."? cartProducts.reduce((acc, curr) => {
        //console.log('checkhere', productId === curr.productInCart._id)
        if(addAndCheckProductInCart === curr.productInCart._id){
            acc.status = true;
            acc.productIdToUpdate = curr._id;
        }
        //console.log(acc);
        return acc;
    }, {status: false, productIdToUpdate: ''}) : {status: false};

    useEffect(() => {
        if(addAndCheckProductInCart.length === 24 && checkProductPresentInCart){
            if(checkProductPresentInCart.status){
                console.log('quantity', checkProductPresentInCart);
                updateProductQuantity(addAndCheckProductInCart, checkProductPresentInCart.productIdToUpdate, "increase");
            }
            else{
                console.log('new cart', checkProductPresentInCart);
                addProductToCart(addAndCheckProductInCart);
            }
        }

    }, [addAndCheckProductInCart]);

    //function to add product to cart.
    const addProductToCart = async (prodid) => {
        const newProductDetails = {productInCart: prodid, quantity: 1}
        try{
            const response = await fetch("https://electronic-store-backend-sepia.vercel.app/product/cart/add", {
                method: "POST",
                body: JSON.stringify(newProductDetails),
                headers: {
                    'content-type': 'application/json'
                }
            })

            if(!response.ok){
                throw 'failed to add product to cart.'
            }

            const data = await response.json();
            if(data.data){
                console.log(data.message);
                navigate("/cart", {state: {message: "add"}});
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    //function to update product quantity.
    const updateProductQuantity = async (prodid, prodIdToUpdate, updateType) => {
        const updateQuantity = cartProducts !== "no cart products found." && cartProducts.reduce((acc, curr) => {
            if(prodid === curr.productInCart._id && updateType === 'increase'){
                acc.quantity = curr.quantity + 1;
            }
            else if(prodid === curr.productInCart._id && updateType === 'decrease'){
                acc.quantity = curr.quantity - 1;
            }
            return acc;
        }, {quantity: 0});
        try{
            const response = await fetch(`https://electronic-store-backend-sepia.vercel.app/product/cart/update/${prodIdToUpdate}`, {
                method: "POST",
                body: JSON.stringify(updateQuantity),
                headers: {
                    'content-type': 'application/json'
                }
            })

            if(!response.ok){
                throw 'failed to update product quantity to cart.'
            }

            const data = await response.json();
            if(data.data){
                console.log(data.message);
                setRefetchCart((prev) => !prev);
                navigate("/cart", {state: {message: "updateQuantity"}});
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    //function to return cartid to update quantity to display value. 
    const getCartDetails = (productId, type) => {
        if(type === 'updation'){
            const idFound = cartProducts !== "no cart products found." && cartProducts.reduce((acc, curr) => {
                if(productId === curr.productInCart._id){
                    acc = curr._id;
                }
                return acc;
            }, '');
            return idFound;
        }
        else if(type === 'quantity'){
            const idFound = cartProducts !== "no cart products found." ? cartProducts.reduce((acc, curr) => {
                if(productId === curr.productInCart._id){
                    acc = curr.quantity;
                }
                return acc;
            }, 0) : 0;
            return idFound;   
        }
        
    };

    const showAlertMessage = (message, colorName) => {
        setAlertMessage({status: message, bgColor: colorName});
        setTimeout(() => {
            setAlertMessage({status: null, bgColor: ''});
        }, 2000); 
    };

    return(
        <div>
            <Header/>
            {loading && 
                <div class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            }
            {data? data.data && (
                <div className="container">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="card">
                                <div className="position-relative">
                                    <img src={data.data.productImage} alt="product poster" style={{width: "400px", height: "400px"}} className="mb-2 card-img-top object-fit-fill img-fluid"/>
                                    <span className="position-absolute top-0 end-0 mt-2 me-2 rounded-circle">
                                        <MdFavorite 
                                        size={24} 
                                        onClick={() => setAddProductToWishlist({productsInWishlist: data.data._id})} 
                                        style={{
                                            color: updateWishlistColor(data.data._id)? "#E91E63": "grey",
                                            cursor: "pointer",
                                            transition: "color 0.0999s ease-in-out, transform 0.0999s ease",
                                            transform: liked ? "scale(1)" : "scale(1)"
                                        }}/>
                                    </span>    
                                </div>
                                <div className="card-body text-center">
                                    <button className="btn btn-primary me-2" onClick={() => setAddAndCheckProductInCart(data.data._id)}>Add To Cart</button>
                                    <Link className="btn btn-danger" to={`/checkOut/${'buynow'}/${data.data._id}`}>Buy Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <p className="fw-normal fs-3">{data.data.title}</p>
                            <p className="fw-bold fs-4">₹{data.data.price}</p>
                            <div className="mb-2">
                            <label className="me-2">Quantity:</label><button className="me-2" disabled={getCartDetails(data.data._id, 'quantity')===1 || getCartDetails(data.data._id, 'quantity')===0 ? true: false} onClick={() => updateProductQuantity(data.data._id, getCartDetails(data.data._id, 'updation'), "decrease")}>-</button><input className="text-center" value={getCartDetails(data.data._id, "quantity")} readOnly style={{width: '30px'}}/><button className="ms-2" disabled={getCartDetails(data.data._id, 'quantity')===0? true: false} onClick={() => updateProductQuantity(data.data._id, getCartDetails(data.data._id, 'updation'), "increase")}>+</button><br/>
                            </div>
                            <hr/>
                            <div class="container text-center">                          
                                <div class="row">
                                    <div class="col-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="64px" fill="#5f6368">
                                        <path d="m480-320 56-56-63-64h167v-80H473l63-64-56-56-160 160 160 160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/>
                                    </svg>
                                    <p>10 Days Refundable</p>
                                    </div>

                                    <div class="col-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="64px" fill="#5f6368">
                                        <path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm440 240H120q-33 0-56.5-23.5T40-240v-440h80v440h680v80ZM280-400v-320 320Z"/>
                                    </svg>
                                    <p>Pay On Delivery</p>
                                    </div>

                                    <div class="col-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="64px" fill="#5f6368">
                                        <path d="M240-160q-50 0-85-35t-35-85H40v-440q0-33 23.5-56.5T120-800h560v160h120l120 160v200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H360q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T280-280q0-17-11.5-28.5T240-320q-17 0-28.5 11.5T200-280q0 17 11.5 28.5T240-240ZM120-360h32q17-18 39-29t49-11q27 0 49 11t39 29h272v-360H120v360Zm600 120q17 0 28.5-11.5T760-280q0-17-11.5-28.5T720-320q-17 0-28.5 11.5T680-280q0 17 11.5 28.5T720-240Zm-40-200h170l-90-120h-80v120ZM360-540Z"/>
                                    </svg>
                                    <p>Free Delivery</p>
                                    </div>

                                    <div class="col-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="64px" fill="#5f6368">
                                        <path d="M420-360h120l-23-129q20-10 31.5-29t11.5-42q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 23 11.5 42t31.5 29l-23 129Zm60 280q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z"/>
                                    </svg>
                                    <p>Secure Payment</p>
                                    </div>
                                </div>
                            </div>
                            <hr/>
                            <p className="fw-medium">Description:</p>
                            <ul>
                                {data.data.details.split(", ").map((productDetails, index) => <li key={index}>{productDetails}.</li>)}
                            </ul>
                        </div>
                    </div>
                    <hr/>
                    <p className="fw-semibold fs-4">More items you may like</p>
                    <div className="row my-2 mx-2">
                    {moreProductsULike !== "No similar category products." ?(
                                <>
                                {moreProductsULike.map((product, index) => (
                                <div className="col-md-3" key={index}>
                                <div className="card mb-3">
                                    <div className="position-relative"> 
                                        <Link to={`/productDetails/${product._id}`}>
                                            <img src={product.productImage} className="card-img-top bg-light object-fit-fill border img-fluid" style={{width: "350px", height: "300px"}} alt="product poster"/>
                                        </Link>
                                        <span className="badge bg-white position-absolute top-0 end-0 mt-2 me-2 rounded-circle">
                                            <MdFavorite
                                            size={25}
                                            onClick={() => setAddProductToWishlist({productsInWishlist: product._id})} 
                                            style={{
                                                color: updateWishlistColor(product._id)? "#E91E63": "grey",
                                                cursor: "pointer",
                                                transition: "color 0.0999s ease-in-out, transform 0.0999s ease",
                                                transform: liked ? "scale(1)" : "scale(1)"
                                            }}
                                            />
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <p>{product.title}</p>
                                        <p>{product.price}</p>
                                        <button className="btn btn-primary me-3" onClick={() => setAddAndCheckProductInCart(product._id)}>Add To Cart</button>
                                        <Link className="btn btn-danger" to={`/checkOut/${'buynow'}/${product._id}`}>Buy Now</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                                </>
                            ):(
                                <p className="pb-5">{moreProductsULike}</p>
                            )  
                        }
                        </div>
                </div>
            ): error && <p>{error}</p>}
            {alertMessage.status && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x">
                <div className="py-3 px-3 text-white fs-5" style={{backgroundColor: alertMessage.bgColor}} role="alert">
                    {alertMessage.status}
                </div>
                </div>
            )}
        </div>
    )
}
export default ProductDetails;