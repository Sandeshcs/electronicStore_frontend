import useFetch from "../useFetch";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { Link, useLocation} from "react-router-dom";

const ProductCart = () => {
    const [alertMessage, setAlertMessage] = useState({status: null, bgColor: ''});
    const [refetchCartDetails, setRefetchCart] = useState(false);
    const [addOrDeleteWishlistProduct, setAddProductToWishlist] = useState({productsInWishlist: ""});
    const location = useLocation();
    let message = location.state?.message;

    const {data, loading, error} = useFetch(`https://electronic-store-backend-sepia.vercel.app/product/cart/get?updated=${refetchCartDetails}`);
    const cartProducts = data? data.data || data.error : [];
    //console.log(cartProducts);
    
    const {data: wishlistData} = useFetch(`https://electronic-store-backend-sepia.vercel.app/product/wishlist/get`);
    const wishlistDataFound = wishlistData? wishlistData.data? wishlistData.data : []:[];

    useEffect(() => {
        if(message){
            message === "add" 
            ? showAlertMessage("Product Added To Cart", "green") 
            : showAlertMessage("Product Already In Cart Updated Quantity", "green");
            window.history.replaceState({}, document.title);
        }
    }, [message]);
    
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
                updateType === "increase"? showAlertMessage("Product Quantity Increased", "green") : showAlertMessage("Product Quantity Decreased", "green");
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    //function to delete product from cart.
    const deleteProductFromCart = async (prodid) => {
        try{
            const response = await fetch(`https://electronic-store-backend-sepia.vercel.app/product/cart/delete/${prodid}`, {
                method: "DELETE",
                headers: {
                    'content-type': 'application/json'
                }
            })

            if(!response.ok){
                throw 'failed to delete product from cart.'
            }

            const data = await response.json();
            if(data.data){
                console.log(data.message);
                setRefetchCart((prev) => !prev);
                showAlertMessage("Product Removed From Cart", "red");
                window.location.reload();
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    //function to check if this product is already in wishlisht or not.
    const checkProductInWishlist = (productId) => {
        const statusOfProductInWishlist = wishlistDataFound.length > 0 ? wishlistDataFound.reduce((acc, curr) => {
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
            }else{
                showAlertMessage("Product Already In Wishlist", "green");
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
                showAlertMessage("Product Added To Wishlist", "green");
                window.location.reload();
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const cartProductsIdOnly = cartProducts !== "no cart products found."?  cartProducts.reduce((acc, curr) => {
        acc.push(curr._id);
        return acc;
    }, []) : [''];
    //console.log(cartProductsIdOnly);

    const showAlertMessage = (messages, colorName) => {
        setAlertMessage({status: messages, bgColor: colorName});
        setTimeout(() => {
            setAlertMessage({status: null, bgColor: ''});
        }, 2000); 
    };

    const priceOfAllProducts = cartProducts !== "no cart products found."? cartProducts.reduce((acc, curr) => acc+ Number(curr.productInCart.price * curr.quantity), 0) : 0;
    return(
        <div className="bg-body-secondary min-vh-100">
            <Header/>
            <div className="container">
            {loading && 
            <div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            }
            <div>
            {error ? (
                <p>{error}</p>
                ): cartProducts === "no cart products found."? (
                    <p className="fs-3 fw-bolder">{cartProducts}</p>
                ): (
                    <div className="row mt-3">
                        <div className="col-md-8">
                            {cartProducts.map((product, index) => (
                            <div className="card mb-2" key={`cart-${index}`}>
                                <div className="row">
                                <div className="col-md-3">
                                    <Link to={`/productDetails/${product.productInCart._id}`}>
                                    <img src={product.productInCart.productImage} alt="product thumbnail" height={'200px'} width={'200px'}/>
                                    </Link>
                                </div>
                                <div className="col-md-5 mb-3">
                                    <p className="fw-bolder fs-4">{product.productInCart.title}</p>
                                    <p className="fw-medium fs-5">₹{product.productInCart.price}</p>
                                    <div className="mb-2">
                                    <button className="me-2 bg-white rounded" disabled={product.quantity===1? true: false} onClick={() => updateProductQuantity(product.productInCart._id, product._id, "decrease")}>-</button><input className="text-center rounded" value={product.quantity} readOnly style={{width: '30px'}}/><button className="ms-2 bg-white rounded" onClick={() => updateProductQuantity(product.productInCart._id, product._id, "increase")}>+</button><br/>
                                    </div>
                                    <button className="mb-2 btn btn-danger" onClick={() => deleteProductFromCart(product._id)}>Remove From Cart</button><br/>
                                    <button className="btn btn-success" onClick={() => setAddProductToWishlist({productsInWishlist: product.productInCart._id})}>Add To Wishlist</button>
                                </div>
                                </div>
                                
                            </div>
                            ))}
                        </div>
                        <div className="col-md-4">
                        <div className="card container pb-3">
                            <h3>Price Details</h3>
                            <hr/>
                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between">
                                    <strong>Price ({cartProducts !== "no cart products found."?cartProducts.length : 0} item)</strong> 
                                    <span>₹{priceOfAllProducts}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <strong>Discount</strong> 
                                    <span>-₹1000</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <strong>Delivery Charges</strong> 
                                    <span>₹0</span>
                                </div>
                                <hr/>
                                <div className="d-flex justify-content-between">
                                    <strong>Total Price</strong> 
                                    <span>₹{priceOfAllProducts-1000-0}</span>
                                </div>
                                <hr/>
                                <p>You will save ₹1000 on this order.</p>
                                <Link to={`/checkOut/${"cartproduct"}/${cartProductsIdOnly.join(",")}`} className="btn btn-primary">Place Order</Link>
                            </div>
                        </div>
                    </div>
                </div>
                )
            }
            </div>
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
export default ProductCart;