import React, { useState, useEffect } from "react";
import { PageTransition } from "../../helpers/animations";
import classes from "./detailProduct.module.css";
import { SencondaryButton } from "../../components/secondaryButton/SencondaryButton";
import { useParams } from "react-router";
import axios from "axios";
import Spinner from "../../components/spinner/Spinner";

export const DetailProduct = (props) => {
  const [product, setProduct] = useState([{}]);
  const { id } = useParams();
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(async () => {
    try {
      const getProduct = await axios.get(
        `https://geekybay.herokuapp.com/products/product/${id}`
      );
      setProduct(getProduct.data);
      setShowSpinner(false);
    } catch (error) {
      alert(error);
    }
  }, []);


return (
  <PageTransition>
    {showSpinner && <Spinner />}
    <div className="container">
      <div className={classes.productContainer}>
        <div className={classes.imageContainer}>
          <img
            className={classes.img}
            src={require("../../assets/iphone.png")}
          />
        </div>
        <div className={classes.infoContainer}>
          {console.log(product)}
          <h1 className={classes.title}>{product[0].productName}</h1>
          <p className={classes.description}>{product[0].productDescription}</p>
          <div className={classes.pContainer}>
            <span className={classes.price}>
              € {product[0].price}
            </span>
            <span className={classes.satus}>Stock: {product[0].inStock}</span>
          </div>
          <div className={classes.buyContainer}>
            <div className={classes.quantityContainer}>
              <button className={classes.removeBtn}>-</button>
              <span className={classes.buyAmount}>1</span>
              <button className={classes.addBtn}>+</button>
            </div>
            <SencondaryButton>Add to Cart</SencondaryButton>
          </div>
        </div>
      </div>
    </div>
  </PageTransition>
);
};
