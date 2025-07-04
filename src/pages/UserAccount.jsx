import { useState } from "react";
import Header from "../components/Header";
import useFetch from "../useFetch";
import { Link } from "react-router-dom";

const UserAccount = () => {
    const [alertMessage, setAlertMessage] = useState({status: null, bgColor: ''});
    const [addNewAddress, setAddNewAddress] = useState(false);
    const [updateAddressStatus, setUpdateAddressStatus] = useState(false);
    const [newAddressFormat, setNewAddressFormat] = useState({
        fullName: '',
        phNo: '',
        pincode: '',
        locality: '',
        address: '',
        cityDistrictTown: '',
        state: ''
    });

    const [updateAddressFormat, setUpdateAddressFormat] = useState(null);

    const [refetchAddress, setRefetchAddress] = useState(false);
    const [checkAllFields, setCheckAllFields] = useState(false);
    const {data, loading, error} = useFetch(`https://electronic-store-backend-sepia.vercel.app/address/get?updated=${refetchAddress}`);
    
    const addressData = data? data.data || data.error : [];

    const {data: orderData, loading: orderLoading, error: orderError} = useFetch(`https://electronic-store-backend-sepia.vercel.app/orderhistory/get`);
    
    const orderHistoryData = orderData? orderData.data || orderData.error : [];
    //console.log(orderError, addressData, orderHistoryData);

    //function of add new address for updating state each time user enter.
    const handleOnClick = (e) => {
        const {name, value} = e.target;
        //console.log(name, value)
        setNewAddressFormat((prev) => ({
            ...prev, [name] : name === "phNo" || name === "pincode"? Number(value): value
        }));
    };

    //function for add new address btn.
    const handleAddNewAddressOnClick = () => {
        setAddNewAddress((prev) => !prev);
        setUpdateAddressStatus(null);
    }

    //save btn function.
    const handleSubmit = (e, typeOfAction) => {
        e.preventDefault();
        //console.log(finalAddressFormat);
        if(typeOfAction === 'add'){
            if(newAddressFormat.fullName && newAddressFormat.phNo && newAddressFormat.pincode && newAddressFormat.locality && newAddressFormat.address && newAddressFormat.cityDistrictTown && newAddressFormat.state){
                addNewAddressToDb(newAddressFormat);
            }else{
                setCheckAllFields((prev) => !prev);
            }
        }else if(typeOfAction === 'update'){
            if(updateAddressFormat.fullName && updateAddressFormat.phNo && updateAddressFormat.pincode && updateAddressFormat.locality && updateAddressFormat.address && updateAddressFormat.cityDistrictTown && updateAddressFormat.state){
                updateAddressToDb(updateAddressFormat._id);
            }else{
                setCheckAllFields((prev) => !prev);
            }
        }
    }

    //function that adds new address to db.
    const addNewAddressToDb = async (newData) => {
        try{
            const response = await fetch('https://electronic-store-backend-sepia.vercel.app/address/add', {
                method: "POST",
                body: JSON.stringify(newData),
                headers: {
                    'content-type': 'application/json',
                },
            });

            if(!response.ok){
                throw "failed to add address";
            }
            const productdata = await response.json();
            if(productdata){
                console.log("success ", productdata);
                setRefetchAddress((prev) => !prev);
                setAddNewAddress((prev) => !prev);
                showAlertMessage("New Address Added", "green");
                setNewAddressFormat({
                    fullName: '',
                    phNo: '',
                    pincode: '',
                    locality: '',
                    address: '',
                    cityDistrictTown: '',
                    state: ''
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    //function to delete address from db.
    const deleteThisAddress = async (addressId) => {
        try{
            const response = await fetch(`https://electronic-store-backend-sepia.vercel.app/address/delete/${addressId}`, {
                method: "DELETE",
            });

            if(!response.ok){
                throw "failed to delete address";
            }
            const productdata = await response.json();
            if(productdata){
                console.log("success ", productdata);
                setRefetchAddress((prev) => !prev);
                showAlertMessage("Address Deleted", "red");
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    //function to update state each time user enters.
    const handleUpdateOnChange = (e) => {
        const {name, value} = e.target;
        //console.log(name, value)
        setUpdateAddressFormat((prev) => ({
            ...prev, [name]: name === "phNo" || name === "pincode"? Number(value): value
        }));
    };

    //function updates state with address id and entire data of that address. 
    const handleOnClickUpdateAddress = (address) => {
        setUpdateAddressStatus(address._id);
        setAddNewAddress(false);
        setUpdateAddressFormat({...address});
    }

    //function works for cancel btn.
    const handleCancelUpdateAddress = () => {
        setUpdateAddressStatus(null);
        setUpdateAddressFormat(null)
    }

    //function updates address to db.
    const updateAddressToDb = async (addressId) => {
        try{
            const response = await fetch(`https://electronic-store-backend-sepia.vercel.app/address/update/${addressId}`, {
                method: "POST",
                body: JSON.stringify(updateAddressFormat),
                headers: {
                    'content-type': 'application/json',
                },
            });

            if(!response.ok){
                throw "failed to update address";
            }
            const productdata = await response.json();
            if(productdata){
                console.log("success ", productdata);
                setRefetchAddress((prev) => !prev);
                setUpdateAddressStatus(null);
                setUpdateAddressFormat(null)
                showAlertMessage("Address Updated", "green");
            }
        }
        catch (error) {
            console.log(error);
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
            <div className="container">
            {(loading || orderLoading) && 
            <div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            }
            <div className="card mt-4">
                <div className="card-body">
                    <p className="fw-bolder fs-3">Profile Information</p>
                    <ul className="list-group">
                        <li className="list-group-item">
                            <strong>Name:</strong> Sandesh C S 
                        </li>
                        <li className="list-group-item">
                            <strong>Gender:</strong> Male
                        </li>
                        <li className="list-group-item">
                            <strong>Email Id:</strong> sandesh@gmail.com
                        </li>
                        <li className="list-group-item">
                            <strong>Phone Number:</strong> 1234567899
                        </li>
                    </ul>
                </div>
            </div>
            <div className="card mt-3">
                <div className="card-body">
                    <p className="fw-bolder fs-3">Manage Address:</p>
                    {addNewAddress? (
                            <div className="card mb-3">
                                <div className="card-header">New Address</div>
                                <div className="card-body">
                                    <form onSubmit={(e) => handleSubmit(e, "add")}>
                                        <label htmlFor="userName">Name:</label><br/>
                                        <input id="userName" type="text" name="fullName" value={newAddressFormat.fullName} onChange={handleOnClick} className="form-control w-25"/>

                                        <label htmlFor="userPhNo">Phone Number:</label><br/>
                                        <input id="userPhNo" name="phNo" value={newAddressFormat.phNo} maxLength={10} type="tel" onChange={handleOnClick} className="form-control w-25"/>

                                        <label htmlFor="userPincode">Pincode:</label><br/>
                                        <input id="userPincode" name="pincode" value={newAddressFormat.pincode} maxLength={6} type="text" onChange={handleOnClick} className="form-control w-25"/>

                                        <label htmlFor="userLocality">Locality:</label><br/>
                                        <input name="locality" id="userLocality" value={newAddressFormat.locality} type="text" onChange={handleOnClick} className="form-control w-25"/>

                                        <label htmlFor="userAddress">Address:</label><br/>
                                        <textarea id="userAddress" name="address" value={newAddressFormat.address} onChange={handleOnClick} className="form-control w-50" rows={5} cols={50}></textarea>

                                        <label htmlFor="userCityDistrictTown">City/District/Town:</label><br/>
                                        <input id="userCityDistrictTown" value={newAddressFormat.cityDistrictTown} name="cityDistrictTown" onChange={handleOnClick} type="text" className="form-control w-25"/>

                                        <label htmlFor="userState">State:</label><br/>
                                        <input id="userState" name="state" value={newAddressFormat.state} type="text" onChange={handleOnClick} className="form-control w-25"/>

                                        <button className="btn btn-primary me-3 my-3" type="submit">Save</button>
                                        <button className="btn btn-secondary" onClick={() => setAddNewAddress((prev) => !prev)}>Cancel</button>
                                        {checkAllFields && <p>Please fill all fields</p>}
                                    </form>
                                </div>
                            </div>
                        ) : <button className="btn btn-success mb-3" onClick={handleAddNewAddressOnClick}>Add New Address</button>
                    }
                    {error? (
                            <p>{error}</p>
                        ): addressData === "No addresses found."? (
                                <p>{addressData}</p>
                            ) : (
                        addressData.map((address, index) => (
                            <div key={index}>
                            {updateAddressStatus === address._id? (
                                <div className="card mb-3">
                                <div className="card-header">Edit Address</div>
                                <div className="card-body">
                                    <form onSubmit={(e) => handleSubmit(e, "update")}>
                                        <label htmlFor="userName">Name:</label><br/>
                                        <input id="userName" type="text" name="fullName" value={updateAddressFormat?.fullName || ''} onChange={handleUpdateOnChange} className="form-control w-25"/>

                                        <label htmlFor="userPhNo">Phone Number:</label><br/>
                                        <input id="userPhNo" name="phNo" value={updateAddressFormat?.phNo || ''} maxLength={10} type="tel" onChange={handleUpdateOnChange} className="form-control w-25"/>

                                        <label htmlFor="userPincode">Pincode:</label><br/>
                                        <input id="userPincode" name="pincode" value={updateAddressFormat?.pincode || ''} maxLength={6} type="text" onChange={handleUpdateOnChange} className="form-control w-25"/>

                                        <label htmlFor="userLocality">Locality:</label><br/>
                                        <input name="locality" id="userLocality" value={updateAddressFormat?.locality || ''} type="text" onChange={handleUpdateOnChange} className="form-control w-25"/>

                                        <label htmlFor="userAddress">Address:</label><br/>
                                        <textarea id="userAddress" name="address" value={updateAddressFormat?.address || ''} onChange={handleUpdateOnChange} className="form-control w-50" rows={5} cols={50}></textarea>

                                        <label htmlFor="userCityDistrictTown">City/District/Town:</label><br/>
                                        <input id="userCityDistrictTown" value={updateAddressFormat?.cityDistrictTown || ''} name="cityDistrictTown" onChange={handleUpdateOnChange} type="text" className="form-control w-25"/>

                                        <label htmlFor="userState">State:</label><br/>
                                        <input id="userState" name="state" value={updateAddressFormat?.state || ''} type="text" onChange={handleUpdateOnChange} className="form-control w-25"/>

                                        <button className="btn btn-primary me-3 my-3" type="submit">Save</button>
                                        <button className="btn btn-secondary" onClick={handleCancelUpdateAddress}>Cancel</button>
                                        {checkAllFields && <p>Please fill all fields</p>}
                                    </form>
                                </div>
                            </div>
                            ): (
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <p>
                                            {` ${address.address}, ${address.cityDistrictTown}, ${address.state}, ${address.locality}, ${address.pincode}`}
                                            <button className="btn btn-primary me-3 ms-2" onClick={() => handleOnClickUpdateAddress(address)}>Update</button>
                                            <button className="btn btn-danger" onClick={() => deleteThisAddress(address._id)}>Delete</button>
                                        </p>
                                    </div>
                                </div>
                            )}
                            </div>))
                        )
                    }
                </div>
            </div>
                <div className="card mt-3 mb-5">
                    <div className="card-body">
                    <p className="fs-3 fw-bolder">Order History</p>
                        {orderError? (
                                <p>{orderError}</p>
                            ): orderHistoryData === "no orders found."? (
                                <p>{orderHistoryData}</p>
                            ) :(orderHistoryData.map((orderHistory, index) => (
                                <div className="card mb-3" key={index}>
                                    <div className="card-body">
                                        <p className="fs-4">Login Details</p>
                                        <p className="fs-5 text-danger">{orderHistory.loginDetails}</p>
                                        <p className="fs-4">Address Details</p>
                                        <p className="fs-5 text-danger">{orderHistory.addressDetails}</p>
                                        <div>
                                            <p className="fs-4">Ordered Products</p>
                                            {orderHistory.ordersFrom === "cartproduct"? (
                                                orderHistory.orderedProductsFromCart.map((product, index) => (
                                                    <div className="card mb-2" key={`product-${index}`}>
                                                        <div className="row">
                                                            <div className="col-md-3">
                                                                <Link to={`/productDetails/${product.productInCart._id}`}>
                                                                <img src={product.productInCart.productImage} alt="product thumbnail" height={'200px'} width={'200px'}/>
                                                                </Link>
                                                            </div>
                                                            <div className="col-md-5 mb-3">
                                                                <p className="fw-bolder fs-4">{product.productInCart.title}</p>
                                                                <p className="fw-medium fs-5">₹{product.productInCart.price}</p>
                                                                <p className="fw-medium fs-5">Quantity: {product.quantity}</p>                                                    
                                                            </div>
                                                        </div>
                                                    </div>
                                                    )) 
                                                ): (
                                                    orderHistory.orderedProductsFromBuyNow.map((product, index) => (
                                                        <div className="card mb-2" key={`product-${index}`}>
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <Link to={`/productDetails/${product._id}`}>
                                                                    <img src={product.productImage} alt="product thumbnail" height={'200px'} width={'200px'}/>
                                                                    </Link>
                                                                </div>
                                                                <div className="col-md-5 mb-3">
                                                                    <p className="fw-bolder fs-4">{product.title}</p>
                                                                    <p className="fw-medium fs-5">₹{product.price}</p>
                                                                    <p className="fw-medium fs-5">Quantity: {orderHistory.prodQuantity}</p>                                                    
                                                                </div>
                                                            </div>
                                                        </div>
                                                        )) 
                                                    )
                                            }
                                        </div>                                        
                                        <p className="fs-4">Payment Details</p>
                                        <p className="fs-5 text-danger"><strong>Payment Mode:</strong> {orderHistory.paymentMode}</p>
                                        <p className="fs-5 text-danger"><strong>Total Amount:</strong> {orderHistory.totalAmountPayable}</p>
                                        <p className="fs-5 text-danger"><strong>Discount:</strong> 1000</p>
                                        <p className="fs-5 text-danger"><strong>Delivery Charges:</strong> 40</p>
                                        <p className="fs-5 text-danger"><strong>Final Amount:</strong> {orderHistory.totalAmountPayable - 1000 + 40}</p>
                                        <p className="fs-4">Date And Time Of Order</p>
                                        <p className="fs-5 text-danger">{orderHistory.dateTimeOfOrder}</p>
                                    </div>
                                </div>
                            )))
                        }
                    </div>
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
export default UserAccount;