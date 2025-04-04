import "bootstrap/dist/css/bootstrap.min.css"
import { Link} from "react-router-dom";
import Header from "./components/Header";

function App() {
  return (
    <div>
      <Header/>
      <div className="container mt-3">
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
      </div>
    </div>
  );
}

export default App;
