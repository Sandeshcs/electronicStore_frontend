import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../useFetch";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { MdFavorite } from "react-icons/md";

//function to display the products
const DisplayProducts = ({productData}) => {
    const navigate = useNavigate();
    const [wishlistAlert, setWishlistAlert] = useState({status: null, bgColor: ''});
    const [addOrDeleteWishlistProduct, setAddProductToWishlist] = useState({productsInWishlist: ""});
    const [wishlistUpdated, setWishlistUpdated] = useState(false);
    const [liked, setLiked] = useState(false);
    
    const [addAndCheckProductInCart, setAddAndCheckProductInCart] = useState('');

    const {data: wishlistData} = useFetch(`http://localhost:3000/product/wishlist/get?updated=${wishlistUpdated}`);
    const wishlistDataFound = wishlistData? wishlistData.data || wishlistData.error :[];
    //console.log(wishlishDataFound);

    const {data, loading, error} = useFetch(`http://localhost:3000/product/cart/get`);
    const cartProducts = data? data.data || data.error : [];
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
            const response = await fetch('http://localhost:3000/product/wishlist/addproduct', {
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
                showWishlistMessage('Product Added To Wishlist', 'green');
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
                showWishlistMessage('Product Removed From Wishlist', 'red');
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

    const showWishlistMessage = (message, colorName) => {
        setWishlistAlert({status: message, bgColor: colorName});
        setTimeout(() => {
            setWishlistAlert({status: null, bgColor: ''});
        }, 3000); 
    };

    /*const handleAddToCart = async (productId) => {
        
    }*/

    return(
        <div>
            <div className="row my-2 mx-2">
            <p className="my-3"><strong>Showing All Products </strong>(showing {productData.length || 0} product)</p>
            {productData.map((product, index) => (
                <div className="col-md-4" key={index}>
                    <div className="card mb-3">
                        <div className="position-relative"> 
                            <Link to={`/productDetails/${product._id}`}>
                                <img src={product.productImage} className="card-img-top bg-light object-fit-fill border img-fluid" style={{width: "350px", height: "300px"}} alt="product poster"/>
                            </Link>
                            <span className="badge position-absolute top-0 end-0 mt-2 me-2 rounded-circle">
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
                            <p>₹{product.price}</p>
                            <button className="btn btn-primary me-3" onClick={() => setAddAndCheckProductInCart(product._id)}>Add To Cart</button>
                            <Link className="btn btn-danger" to={`/checkOut/${'buynow'}/${product._id}`}>Buy Now</Link>
                        </div>
                    </div>
                </div>
            ))}
            </div>
            {wishlistAlert.status && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x">
                <div className="py-3 px-3 text-white fs-5" style={{backgroundColor: wishlistAlert.bgColor}} role="alert">
                    {wishlistAlert.status}
                </div>
                </div>
            )}
        </div>
    )
};

const ProductListing = () => {
    const [filteredData, setFilteredData] = useState([]);  // Final filtered products
    const [selectedFilters, setSelectedFilters] = useState({
        categories: [],
        rating: '',
        sortBy: '',
        priceRange: 10000
    });
    const [showFilterData, setFilterData] = useState(false);
    const [showAllData, setAllData] = useState(true);
    const {productCategory} = useParams();
    const {data, loading, error} = useFetch(`http://localhost:3000/products/category/${productCategory}`);
    const productsData = data? data.data || data.error : [];

    //  Function to update the filters and apply them
    const applyFilters = () => {
        let updatedData = data?.data || [];

        // Apply Category Filter
        if (selectedFilters.categories.length > 0) {
            updatedData = updatedData.filter(product =>
                selectedFilters.categories.some(category => product.details.includes(category))
            );
        }

        // Apply Rating Filter
        if (selectedFilters.rating) {
            updatedData = updatedData.filter(product => product.rating >= Number(selectedFilters.rating));
        }

        // Apply Price Range Filter
        if (selectedFilters.priceRange) {
            updatedData = updatedData.filter(product => Number(product.price) >= Number(selectedFilters.priceRange));
        }

        // Apply Sorting
        if (selectedFilters.sortBy === "low") {
            updatedData = [...updatedData].sort((a, b) => Number(a.price) - Number(b.price));
        } else if (selectedFilters.sortBy === "high") {
            updatedData = [...updatedData].sort((a, b) => Number(b.price) - Number(a.price));
        }

        setFilteredData(updatedData);
    };

    // Re-run filters when `selectedFilters` change
    useEffect(() => {
        applyFilters();
    }, [selectedFilters]);
    
    useEffect(() => {
        if (filteredData.length > 0) {
            setAllData(false);
            setFilterData(true);
        }
    }, [filteredData]);

   //Category Filter
    const handleCategoryFilter = (e) => {
        const { checked, value } = e.target;
        setSelectedFilters(prevFilters => ({
            ...prevFilters,
            categories: checked
                ? [...prevFilters.categories, value]
                : prevFilters.categories.filter(category => category !== value)
        }));
    };

    //Rating Filter
    const handleRatingFilter = (e) => {
        setSelectedFilters(prevFilters => ({
            ...prevFilters,
            rating: e.target.value
        }));
    };

    //Sorting Filter
    const handleSortByFilter = (e) => {
        setSelectedFilters(prevFilters => ({
            ...prevFilters,
            sortBy: e.target.value
        }));
    };

    //Price Range Filter
    const handlePriceRangeFilter = (e) => {
        setSelectedFilters(prevFilters => ({
            ...prevFilters,
            priceRange: e.target.value
        }));
    };
    const handleClearAllFilter = () => {
        setSelectedFilters({
            categories: [],
            rating: '',
            sortBy: '',
            priceRange: 10000
        });
        //setFilterData(false);
        //setAllData(true);
    }
    return(
        <div>
            <Header/>
            <div>
                <div className="row ms-2">
                    <div className="col-md-3">
                        <div className="position-relative">
                            <p className="position-absolute top-0 start-0 mt-2 fw-bolder fs-4">Filters</p>
                            <button className="position-absolute top-0 end-0 mt-2 me-2 btn btn-primary" onClick={handleClearAllFilter}>Clear Filter</button>
                        </div>

                        <div className="mt-5">
                            <label htmlFor="price-range" className="fw-bolder fs-5 form-label">Price Range:</label><br/>
                            <input type="range" className="form-range" min="10000" max="100000" step="10000" id="price-range" value={selectedFilters.priceRange} onChange={handlePriceRangeFilter}/> 
                            <div class="d-flex justify-content-between">
                                <span id="min-price">₹10000</span>
                                <span id="min-price">₹10000</span>
                            </div>
                        </div><hr/>

                        <div>
                            <label htmlFor="categoryOfProd" className="fw-bolder fs-5">Category (Processor)</label><br/>
                            <label htmlFor="snapdragonProcessor"><input type="checkbox" id="snapdragonProcessor" name="categoryOfProd" value={'Snapdragon'} onChange={handleCategoryFilter} checked={selectedFilters.categories.includes('Snapdragon')}/>Snapdragon</label><br/>
                            <label htmlFor="dimensityProcessor"><input type="checkbox" id="dimensityProcessor" name="categoryOfProd" value={'Dimensity'} onChange={handleCategoryFilter} checked={selectedFilters.categories.includes('Dimensity')}/>Mediatek Dimensity</label>
                        </div><hr/>

                        <div>
                            <label htmlFor="ratingsOfProd" className="fw-bolder fs-5">Ratings</label><br/>
                            <label htmlFor="fourStarRating"><input type="radio" id="fourStarRating" name="ratingsOfProd" value={'4'} onChange={handleRatingFilter} checked={selectedFilters.rating.includes('4')}/>4 Star & above</label><br/>
                            <label htmlFor="threeStarRating"><input type="radio" id="threeStarRating" name="ratingsOfProd" value={'3'} onChange={handleRatingFilter} checked={selectedFilters.rating.includes('3')}/>3 Star & above</label><br/>
                            <label htmlFor="twoStarRating"><input type="radio" id="twoStarRating" name="ratingsOfProd" value={'2'} onChange={handleRatingFilter} checked={selectedFilters.rating.includes('2')}/>2 Star & above</label><br/>
                            <label htmlFor="oneStarRating"><input type="radio" id="oneStarRating" name="ratingsOfProd" value={'1'} onChange={handleRatingFilter} checked={selectedFilters.rating.includes('1')}/>1 Star & above</label>
                        </div><hr/>

                        <div>
                            <label htmlFor="sortByPrice" className="fw-bolder fs-5">Sort By</label><br/>
                            <label htmlFor="lowToHigh"><input type="radio" id="lowToHigh" name="sortByPrice" value={'low'} onChange={handleSortByFilter} checked={selectedFilters.sortBy.includes('low')}/>Price-Low to High</label><br/>
                            <label htmlFor="highToLow"><input type="radio" id="highToLow" name="sortByPrice" value={'high'} onChange={handleSortByFilter} checked={selectedFilters.sortBy.includes('high')}/>Price-High to Low</label>
                        </div>
                    </div>
                    <div className="col-md-9 bg-secondary-subtle">
                    
                    {loading ? (
                        <div className="d-flex justify-content-center">
                            <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        ) : error ? (
                        <p className="fs-3 fw-bolder">{error}</p>
                        ) : productsData === "no product found." ? (
                        <p className="fs-3 fw-bolder">No products available.</p>
                        ) : showFilterData && filteredData.length > 0 ? (
                        <DisplayProducts productData={filteredData} />
                        ) : showFilterData ? (
                        <p className="fs-3 fw-bolder">No products match the selected filters.</p>
                        ) : (
                        <DisplayProducts productData={productsData} />
                        )
                    }
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ProductListing;