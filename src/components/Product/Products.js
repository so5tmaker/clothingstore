import React, { Component } from "react";
import Grid from '../Grid/Grid.tsx';
import Product from './Product';
import MiniCart from '../MiniCart/MiniCart';
import Cart from "../Cart/Cart";
import products from './Products.ts';

class Products extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: products,
      category: 'all',
      currencyIsVisible: false,
      miniCartIsVisible: false,
      cartIsVisible: false,
      currency: 'USD',
      symbol: '$',
      divOrientation: { top: 0, left: 0 },
      cart: [],
      innerContainer: ''
    };
    this.linkClick = this.linkClick.bind(this);
    this.currencyClick = this.currencyClick.bind(this);
    this.commonClick = this.commonClick.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.onChangeAttribute = this.onChangeAttribute.bind(this);
    this.cartVeiwClick = this.cartVeiwClick.bind(this);
  }

  linkClick(category, e) {
    e.preventDefault();
    let filter = products;
    if (category !== 'all') {
      filter = products.filter(product => category === product.category);
    }
    this.setState({
      products: filter,
      category: category,
    });
  }

  isSelected(category) {
    if (category === this.state.category) {
      return 'selected';
    }
    return '';
  }

  currencyClick(e) {
    this.setState({
      currency: e.target.innerText.slice(2),
      symbol: e.target.innerText.substring(0, 1)
    });
  }

  commonClick(e) {
    const className = e.target.className;
    let doNotCloseMiniCart = false;
    let parent = document.querySelector('.mini-cart-container');
    const cartIsVisible = className === 'open-cart';
    if (parent !== null) {
      doNotCloseMiniCart = parent.contains(e.target);
    }
    if (!doNotCloseMiniCart) {
      const miniCartIsVisible = (className === "cart" ||
        className === "round") && this.state.cart.length !== 0;
      const innerContainer = miniCartIsVisible ? 'inner-container' : '';
      this.setState({
        currencyIsVisible: className === "vector",
        miniCartIsVisible: miniCartIsVisible,
        cartIsVisible: cartIsVisible,
        innerContainer: innerContainer,
        divOrientation: { top: e.clientY, left: e.clientX }
      });
    }
  }

  cartVeiwClick() {
    this.setState({
      miniCartIsVisible: false,
      cartIsVisible: true,
    });
  }

  addToCart(id, sign = 1) {
    const miniCartArray = this.state.cart;
    let indexProduct = miniCartArray.findIndex(aId => aId.product.id === id)
    if (indexProduct === -1) {
      let product = this.state.products.find(product => product.id === id)
      const { prices } = product;
      const { amount, currency: { symbol } } = prices.filter(record => record.currency.label === this.state.currency)[0];
      const attributes = product.attributes.map(item => {
        let firstIteration = true;
        const items = item.items.map(item => {
          const items = { displayValue: item.displayValue, value: item.value, selected: firstIteration };
          firstIteration = false;
          return (items);
        });
        return (
          {
            id: item.id,
            items: items
          });
      });
      this.state.cart.push({ product: product, quantity: sign, amount, symbol, attributes: attributes });
    } else {
      const quantity = miniCartArray[indexProduct].quantity + sign;
      miniCartArray[indexProduct].quantity = quantity;
      if (quantity === 0) {
        miniCartArray.splice(indexProduct, 1);
      }
      this.setState({
        cart: miniCartArray
      });
    }
  }

  onChangeAttribute(productId, attributeId, displayValue, value) {
    const miniCartArray = this.state.cart;
    const indexProduct = miniCartArray.findIndex(aId => aId.product.id === productId);
    if (indexProduct !== -1) {
      miniCartArray[indexProduct].attributes = miniCartArray[indexProduct].attributes.map(attribute => {
        const items = attribute.items.map(item => {
          let selected = item.selected;
          if (attributeId === attribute.id) {
            selected = item.displayValue === displayValue;
          }
          return ({ displayValue: item.displayValue, value: item.value, selected: selected });
        });
        return (
          {
            id: attribute.id,
            items: items
          });
      });
      this.setState({
        cart: miniCartArray
      });
    }
  }

  render() {
    const {
      category,
      innerContainer,
      currencyIsVisible,
      cartIsVisible,
      products,
      currency,
      symbol,
      cart,
      divOrientation: { top, left }
    } = this.state;
    const ProductList = products.map((product) => (
      <Grid key={product.id} column={true} lg={4}>
        <Product product={product} currency={currency} onChangeQuantity={this.addToCart} />
      </Grid>
    ));
    const currencyArray = ['$ USD', '€ EUR', '¥ JPY'].map(currency => (
      <div className="currency-item" key={currency} onClick={(e) => this.currencyClick(e)}>{currency}</div>
    ));
    let currencyList = '';
    if (currencyIsVisible) {
      currencyList =
        <div className="currency-list"
          style={{ top: top + 15, left: left - 20 }}>
          {currencyArray}
        </div>
    }
    let quantityRound = '';
    if (cart.length !== 0) {
      quantityRound = <li className="round">{cart.length}</li>
    }

    return (
      <div className='container' onClick={(e) => this.commonClick(e)}>
        <div className='navbar'>
          <li onClick={e => this.linkClick('all', e)} className={this.isSelected('all')}>All</li>
          <li onClick={e => this.linkClick('tech', e)} className={this.isSelected('tech')}>Tech</li>
          <li onClick={e => this.linkClick('clothes', e)} className={this.isSelected('clothes')}>Clothes</li>
          <li></li>
          <li className="image"></li>
          <li className="symbol">{symbol}</li>
          <li className="vector"></li>
          <li className="cart"></li>
          {quantityRound}
        </div>
        {!cartIsVisible &&
          (<div className={'product-content ' + innerContainer}>
            <h2>{category.substring(0, 1).toUpperCase()}{category.slice(1)}</h2>
            <div className='product-items'>
              {ProductList}
            </div>
            {currencyList}
          </div>)}
        <Cart
          state={this.state}
          onChangeQuantity={this.addToCart}
          onChangeAttribute={this.onChangeAttribute}
        />
        <MiniCart
          state={this.state}
          cartVeiwClick={this.cartVeiwClick}
          onChangeQuantity={this.addToCart}
          onChangeAttribute={this.onChangeAttribute}
        />
      </div>
    );
  }
};

export default Products;

// GraphQL query for Products
// {
//     product(id:'apple-imac-2021') {
//          name
//       prices{
//         currency {
//           label
//           symbol
//         }
//         amount
//       }
//       description
//       attributes{
//         id
//         items{
//           displayValue
//         }
//       }
//       gallery
//     }
//   }
