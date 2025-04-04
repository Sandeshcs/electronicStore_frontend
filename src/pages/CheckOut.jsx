import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import useFetch from "../useFetch";
import { useEffect, useState } from "react";

const CheckOut = () => {
    const {orderFrom, productId} = useParams();
    //console.log(orderFrom, productId);
    const cartProductsIdOnly = productId.split(",");
    //console.log(cartProductsIdOnly);
    const [alertMessage, setAlertMessage] = useState({status: null, bgColor: ''});
    const [addOrDeleteWishlistProduct, setAddProductToWishlist] = useState({productsInWishlist: ""});
    const [quantityUpdation, setQuantityUpdation] = useState(1);
    const [refetchCartDetails, setRefetchCart] = useState(false);
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);
    const [orderHistoryFormat, setOrderHistoryFormat] = useState({
        ordersFrom: '',
        loginDetails: "SANDESH CS 9852147631",
        addressDetails: '',
        prodQuantity: 0,
        orderedProductsFromCart: [],
        orderedProductsFromBuyNow: [],
        paymentMode: '',
        totalAmountPayable: 0,
        dateTimeOfOrder: ''
    });
    //console.log(orderHistoryFormat);
    
    const {data: wishlistData} = useFetch(`https://electronic-store-backend-sepia.vercel.app/product/wishlist/get`);
    const wishlistDataFound = wishlistData? wishlistData.data? wishlistData.data : []:[];

    const {data: productData, loading: productLoading, error: productError} = useFetch(`https://electronic-store-backend-sepia.vercel.app/products/all`);
    const {data: cartData, loading: cartLoading, error: cartError} = useFetch(`https://electronic-store-backend-sepia.vercel.app/product/cart/get?updated=${refetchCartDetails}`);
    const {data, loading, error} = useFetch(`https://electronic-store-backend-sepia.vercel.app/address/get`);
    const allAddress = data? data.data || data.error : [];
    const cartsData = cartData? cartData.data || cartData.error : [];
    
    const productDetails = productData? productData.data? productData.data.filter(product => product._id === productId) : productData.error : [];
    //console.log(allAddress, productDetails);
    const orderSummaryData = orderFrom === "cartproduct"? cartsData : productDetails;

    const totalPriceOfProducts = (orderSummaryData !== "no cart products found." || orderSummaryData !== "no products found.") ?orderSummaryData.reduce((acc, curr) => {
        if(orderFrom === "cartproduct"){
            acc = acc + (curr.productInCart.price * curr.quantity);
        }else{
            acc = acc + (curr.price * quantityUpdation);
        }
        return acc;
    }, 0) :0;
    //console.log(totalPriceOfCartProducts);

    useEffect(() => {
        setOrderHistoryFormat(prev => ({
            ...prev, totalAmountPayable: totalPriceOfProducts
        }));
    }, [totalPriceOfProducts]);
    
    useEffect(() => {
        if(orderFrom === "cartproduct"){
            console.log('from cart');
            setOrderHistoryFormat((prev) => ({
                ...prev, orderedProductsFromCart: cartProductsIdOnly
            }));
            console.log(orderHistoryFormat);
        }else if(orderFrom === "buynow" && productId.length === 24){
            console.log("buy now");
            setOrderHistoryFormat((prev) => ({
                ...prev, orderedProductsFromBuyNow: productId
            }))
            console.log(orderHistoryFormat);
        }
    }, [orderFrom]);

    useEffect(() => {
        setOrderHistoryFormat((prev) => ({
            ...prev, ordersFrom: orderFrom
        }))
    }, [orderFrom])
    
    useEffect(() => {
        setOrderHistoryFormat(prev => ({
            ...prev, prodQuantity: quantityUpdation
        }))
    }, [quantityUpdation]);

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
    };

    const showAlertMessage = (messages, colorName) => {
        setAlertMessage({status: messages, bgColor: colorName});
        setTimeout(() => {
            setAlertMessage({status: null, bgColor: ''});
        }, 2000); 
    };

    //function to update product quantity.
    const updateProductQuantity = async (prodid, prodIdToUpdate, updateType) => {
        const updateQuantity = cartsData.reduce((acc, curr) => {
            if(prodid === curr.productInCart._id && updateType === 'increase'){
                acc.quantity = curr.quantity + 1;
            }
            else if(prodid === curr.productInCart._id && updateType === 'decrease'){
                acc.quantity = curr.quantity - 1;
            }
            return acc;
        }, {quantity: 0});
        setOrderHistoryFormat(prev => ({
            ...prev, prodQuantity: updateQuantity.quantity
        }));
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
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    const handleUpdateOrderDetails = (e) => {
        const {name, value} = e.target;
        setOrderHistoryFormat((prev) => ({
            ...prev, [name]: value
        }));
    };

    const createOrderHistory = async () => {
        const dataToAdd = {...orderHistoryFormat, dateTimeOfOrder: new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata"
          })
        };
        try{
            const response = await fetch(`https://electronic-store-backend-sepia.vercel.app/orderhistory/add`, {
                method: "POST",
                body: JSON.stringify(dataToAdd),
                headers: {
                    'content-type': 'application/json'
                }
            })

            if(!response.ok){
                throw 'failed to add order history.'
            }

            const data = await response.json();
            if(data.data){
                console.log(data.message);
                setShowOrderSuccess(true);
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    return(
        <div>
            <Header/>
            <div className="container">
            {loading && 
            <div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            }
            {showOrderSuccess?(
                    <>
                    <div className="alert alert-success mb-2" role="alert">Order Placed Successfully</div>
                    <Link className="btn btn-primary" to={`/userProfile`}>Check Order History</Link>
                    </>
                ): (<div className="row">
                    <div className="col-md-8">
                        <div className="card mb-2">
                            <div className="card-header">
                                LOGIN
                            </div>
                            <div className="card-body fs-4">
                                SANDESH CS 9852147631
                            </div>
                        </div>
                        <div className="card mb-2">
                            <div className="card-header">
                                ADDRESS
                            </div>
                            <div className="card-body">
                                {error? (
                                    <p>{error}</p>
                                ): allAddress === "No addresses found."? (
                                    <>
                                    <p>{allAddress}</p>
                                    <Link to={`/userProfile`} className="btn btn-primary">Add New Address</Link>
                                    </>
                                ) :(allAddress.map((address, index) => (
                                        <label key={`address-${index}`} className="fs-4 mb-3" htmlFor="selectAddress">
                                            <input id="selectAddress" type="radio" name="addressDetails" value={` ${address.fullName}, ${address.address}, ${address.cityDistrictTown}, ${address.state}, ${address.locality}, ${address.pincode}`} onChange={handleUpdateOrderDetails}/>
                                            {` ${address.fullName}, ${address.address}, ${address.cityDistrictTown}, ${address.state}, ${address.locality}, ${address.pincode}`}
                                        </label>
                                )))}<br/>
                            </div>   
                        </div>
                        <div className="card mb-2">
                            <div className="card-header">
                                ORDER SUMMARY
                            </div>
                            <div className="card-body">
                                {productError || cartError? (
                                        <p>{productError || cartError}</p>
                                    ): orderSummaryData === "no cart products found." || orderSummaryData === "no products found."? (
                                        <p>{orderSummaryData}</p>
                                    ) : orderFrom === "cartproduct"?
                                    (
                                        orderSummaryData.map((cartProduct, index) => (
                                        <div className="card mb-2" key={`cart-${index}`}>
                                            <div className="row">
                                            <div className="col-md-3">
                                                <Link to={`/productDetails/${cartProduct.productInCart._id}`}>
                                                <img src={cartProduct.productInCart.productImage} alt="product thumbnail" height={'200px'} width={'200px'}/>
                                                </Link>
                                            </div>
                                            <div className="col-md-5 mb-3">
                                                <p className="fw-bolder fs-4">{cartProduct.productInCart.title}</p>
                                                <p className="fw-medium fs-5">{cartProduct.productInCart.price}</p>
                                                <div className="mb-2">
                                                <button className="me-2 bg-white rounded" disabled={cartProduct.quantity===1? true: false} onClick={() => updateProductQuantity(cartProduct.productInCart._id, cartProduct._id, "decrease")}>-</button><input className="text-center rounded" value={cartProduct.quantity} readOnly style={{width: '30px'}}/><button className="ms-2 bg-white rounded" onClick={() => updateProductQuantity(cartProduct.productInCart._id, cartProduct._id, "increase")}>+</button><br/>
                                                </div>
                                                <button className="mt-2 btn btn-success" onClick={() => setAddProductToWishlist({productsInWishlist: cartProduct.productInCart._id})}>Add To Wishlist</button>
                                            </div>
                                            </div>
                                        </div>
                                    ))): (
                                        orderSummaryData.map((product, index) => (
                                            <div className="card mb-2" key={`product-${index}`}>
                                                <div className="row">
                                                <div className="col-md-3">
                                                    <Link to={`/productDetails/${product._id}`}>
                                                    <img src={product.productImage} alt="product thumbnail" height={'200px'} width={'200px'}/>
                                                    </Link>
                                                </div>
                                                <div className="col-md-5 mb-3">
                                                    <p className="fw-bolder fs-4">{product.title}</p>
                                                    <p className="fw-medium fs-5">{product.price}</p>
                                                    <div className="mb-2">
                                                        <button className="me-2 bg-white rounded" disabled={quantityUpdation===1? true: false} onClick={() => setQuantityUpdation(prev => prev-1)}>-</button><input className="text-center rounded" value={quantityUpdation} readOnly style={{width: '30px'}}/><button className="ms-2 bg-white rounded" onClick={() => setQuantityUpdation(prev => prev+1)}>+</button><br/>
                                                    </div>
                                                    <button className="mt-2 btn btn-success" onClick={() => setAddProductToWishlist({productsInWishlist: product._id})}>Add To Wishlist</button>
                                                </div>
                                                </div>
                                            </div>
                                    )))
                                }
                            </div>
                        </div>
                        <div className="card mb-2">
                            <div className="card-header">
                                PAYMENT OPTIONS
                            </div>
                            <div className="card-body">
                                <label htmlFor={"upiPaymentOption"}>
                                    <input id="upiPaymentOption" type="radio" name="paymentMode" value={'UPI'} onChange={handleUpdateOrderDetails}/>UPI
                                </label><br/>
                                <label htmlFor={"codPaymentOption"}>
                                    <input id="codPaymentOption" type="radio" name="paymentMode" value={'Cash On Delivery'} onChange={handleUpdateOrderDetails}/>Cash On Delivery
                                </label>
                            </div>
                        </div>
                        <button className="btn btn-primary mb-5" onClick={() => createOrderHistory()}>Confirm Order</button>
                    </div>
                    <div className="col-md-4">
                        <div className="card container pb-3">
                            <h3>Price Details</h3>
                            <hr/>
                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between">
                                    <strong>Price ({orderSummaryData.length>0? orderSummaryData.length : 0} item)</strong> 
                                    <span>₹{totalPriceOfProducts}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <strong>Discount</strong> 
                                    <span>-₹1000</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <strong>Delivery Charges</strong> 
                                    <span>₹40</span>
                                </div>
                                <hr/>
                                <div className="d-flex justify-content-between">
                                    <strong>Total Price</strong> 
                                    <span>₹{totalPriceOfProducts-1000+40}</span>
                                </div>
                                <hr/>
                                <p>You will save ₹1000 on this order.</p>
                            </div>
                        </div>
                    </div>
                </div>)
            }
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
export default CheckOut;