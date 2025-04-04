import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useFetch from "../useFetch";
import { useEffect, useState } from "react";
import { MdFavorite } from "react-icons/md";

const WishlistProductDetails = () => {
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState({status: null, bgColor: ''});
    const [addOrDeleteWishlistProduct, setAddProductToWishlist] = useState({productsInWishlist: ""});
    const [wishlistUpdated, setWishlistUpdated] = useState(true);
    const [liked, setLiked] = useState(true);

    const [addAndCheckProductInCart, setAddAndCheckProductInCart] = useState('');

    const {data: wishlistData} = useFetch(`http://localhost:3000/product/wishlist/get?updated=${wishlistUpdated}`);
    const wishlistDataFound = wishlistData? wishlistData.data || wishlistData.error :[];
    //console.log(wishlishDataFound);

    const {data, loading, error} = useFetch(`http://localhost:3000/product/cart/get`);
    const cartProducts = data? data.data || data.error : [];
    //console.log(data, cartProducts);
    
    useEffect(() => {
        if(addOrDeleteWishlistProduct.productsInWishlist.length === 24){
            removeProductFromWishlist();
        }
    }, [addOrDeleteWishlistProduct]);

    //function to delete product from wishlist
    const removeProductFromWishlist = async () => {
        const deleteProductId = wishlistDataFound.length>0 && wishlistDataFound.reduce((acc, curr) => {
            if(addOrDeleteWishlistProduct.productsInWishlist === curr.productsInWishlist._id){
                acc = curr._id;
            }
            return acc;
        }, "");
        try{
            const response = await fetch(`http://localhost:3000/product/wishlist/delete/${deleteProductId}`, {
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
                navigate("/cart", {state: {message: "updateQuantity"}});
                updateProductQuantity(addAndCheckProductInCart, checkProductPresentInCart.productIdToUpdate, "increase");
            }
            else{
                console.log('new cart', checkProductPresentInCart);
                navigate("/cart", {state: {message: "add"}});
                addProductToCart(addAndCheckProductInCart);
            }
        }

    }, [addAndCheckProductInCart]);

    //function to add product to cart.
    const addProductToCart = async (prodid) => {
        const newProductDetails = {productInCart: prodid, quantity: 1}
        try{
            const response = await fetch("http://localhost:3000/product/cart/add", {
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
                showAlertMessage("Product Added To Cart", "green");
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    //function to update product quantity.
    const updateProductQuantity = async (prodid, prodIdToUpdate, updateType) => {
        const updateQuantity = cartProducts.reduce((acc, curr) => {
            if(prodid === curr.productInCart._id && updateType === 'increase'){
                acc.quantity = curr.quantity + 1;
            }
            else if(prodid === curr.productInCart._id && updateType === 'decrease'){
                acc.quantity = curr.quantity - 1;
            }
            return acc;
        }, {quantity: 0});
        try{
            const response = await fetch(`http://localhost:3000/product/cart/update/${prodIdToUpdate}`, {
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
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    //function to update color of product in wishlist
    const updateWishlistColor = (productId) => {
        const status = wishlistDataFound.length>0 ? wishlistDataFound.reduce((acc, curr) => {
            if(productId === curr.productsInWishlist._id){
                acc = true;
            }
            return acc;
        }, false) : '';
        return status;
    }

    const showAlertMessage = (message, colorName) => {
        setAlertMessage({status: message, bgColor: colorName});
        setTimeout(() => {
            setAlertMessage({status: null, bgColor: ''});
        }, 2000); 
    };

    return(
        <div>
            <Header wishlistUpdated = {wishlistUpdated}/>
            <div className="container">
                {loading && 
                    <div class="d-flex justify-content-center">
                        <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                }
                {error ? (<p>{error}</p>):
                    wishlistDataFound === "no wishlist products found."? (
                        <p className="fs-3 fw-bolder">{wishlistDataFound}</p>
                    ): (
                        <div className="row my-2 mx-2">
                        {wishlistDataFound.map((product, index) => (
                            <div className="col-md-3" key={index}>
                                <div className="card mb-3">
                                    <div className="position-relative"> 
                                        <Link to={`/productDetails/${product.productsInWishlist._id}`}>
                                            <img src={product.productsInWishlist.productImage} className="card-img-top bg-light object-fit-fill border img-fluid" style={{width: "350px", height: "300px"}} alt="product poster"/>
                                        </Link>
                                        <span className="badge position-absolute top-0 end-0 mt-2 me-2 rounded-circle">
                                        <MdFavorite
                                        size={25}
                                        onClick={() => setAddProductToWishlist({productsInWishlist: product.productsInWishlist._id})} 
                                        style={{
                                            color: updateWishlistColor(product.productsInWishlist._id)? "#E91E63": "grey",
                                            cursor: "pointer",
                                            transition: "color 0.0999s ease-in-out, transform 0.0999s ease",
                                            transform: liked ? "scale(1)" : "scale(1)"
                                        }}
                                        />
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <p>{product.productsInWishlist.title}</p>
                                        <p>₹{product.productsInWishlist.price}</p>
                                        <button className="btn btn-primary me-3" onClick={() => setAddAndCheckProductInCart(product.productsInWishlist._id)}>Add To Cart</button>
                                        <Link className="btn btn-danger" to={`/checkOut/${'buynow'}/${product.productsInWishlist._id}`}>Buy Now</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                )}
            </div>
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
export default WishlistProductDetails;