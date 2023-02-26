//           *******     Function Based  ********

// Variables
const cartBtn = document.querySelector('.cart-btn');
const cartItems = document.querySelector('.cart-items');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartDOM = document.querySelector('.cart');
const cartContent = document.querySelector('.cart-content');
const cartTotal = document.querySelector('.cart-total');
const productDOM = document.querySelector('.products-center');

//  Cart
let cart = [];
//  Buttons
let buttonsDOM = [];

//  Getting Products
const getProducts = async () => {
  try {
    let result = await fetch('../data/products.json');
    let data = await result.json();
    let products = data.items;
    products = products.map((item) => {
      const { title, price } = item.fields;
      const { id } = item.sys;
      const image = item.fields.image.fields.file.url;
      return { title, price, id, image };
    });
    return products;
  } catch (error) {
    console.log(error);
  }
};

//  Display Product

function displayProduct(products) {
  let result = '';
  products.forEach((product) => {
    result += `
            <article class="product">
                <div class="img-container">
                    <img class="product-img" src="${product.image}" alt="">
                    <button class="bag-btn" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>Add To Cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>

        `;
  });
  productDOM.innerHTML = result;
}

function getBagButtons() {
  const buttons = [...document.querySelectorAll('.bag-btn')];
  buttonsDOM = buttons;
  buttons.forEach((button) => {
    let id = button.dataset.id;
    let inCart = cart.find((item) => item.id === id);
    if (inCart) {
      button.innerText = 'In Cart';
      button.disabled = true;
    } else {
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart';
        event.target.disabled = true;

        // Get Product From Products
        let cartItem = { ...getProduct(id), amount: 1 };

        // Add Product To The Cart
        cart = [...cart, cartItem];

        // Save Cart In Local Storage
        saveCart(cart);

        // Set Cart Values
        setCartValue(cart);

        // Display Cart Item
        addCartItem(cartItem);

        // Show The Cart
        showCart();
      });
    }
  });
}
function setCartValue(cart) {
  let tempTotal = 0;
  let itemsTotal = 0;
  cart.map((item) => {
    tempTotal += item.price * item.amount;
    itemsTotal += item.amount;
  });
  cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
  cartItems.innerText = itemsTotal;
  // console.log(cartTotal, cartItems);
}

function addCartItem(item) {
  const div = document.createElement('div');
  div.classList.add('cart-item');
  div.innerHTML = `
                    <img src="${item.image}" alt="">
                      <div>
                          <h4>${item.title}</h4>
                          <h5>$${item.price}</h5>
                          <span data-id=${item.id} class="remove-item">remove</span>
                      </div>
                      <div>
                          <i data-id=${item.id}  class="fas fa-chevron-up"></i>
                          <p class="item-amount">${item.amount}</p>
                          <i data-id=${item.id}  class="fas fa-chevron-down"></i>
                      </div>`;
  cartContent.appendChild(div);
  // console.log(cartContent);
}

function showCart() {
  cartOverlay.classList.add('transparentBcg');
  cartDOM.classList.add('showCart');
}
function hideCart() {
  cartOverlay.classList.remove('transparentBcg');
  cartDOM.classList.remove('showCart');
}

//     xxxxx           MAIN          xxxxx
function setupApp() {
  cart = getCart();
  setCartValue(cart);
  populateCart(cart);
  cartBtn.addEventListener('click', showCart);
  closeCartBtn.addEventListener('click', hideCart);
}

function populateCart(cart) {
  cart.forEach((item) => addCartItem(item));
}

function cartLogic() {
  // clear cart button
  clearCartBtn.addEventListener('click', () => {
    clearCart();
  });

  // cart functionality
  cartContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
      let removingItem = e.target;
      let id = removingItem.dataset.id;
      removeItem(id);
      cartContent.removeChild(removingItem.parentElement.parentElement);
    } else if (e.target.classList.contains('fa-chevron-up')) {
      let addAmount = e.target;
      let id = addAmount.dataset.id;
      let tempItem = cart.find((item) => item.id === id);
      tempItem.amount += 1;
      saveCart(cart);
      setCartValue(cart);
      addAmount.nextElementSibling.innerText = tempItem.amount;
    } else if (e.target.classList.contains('fa-chevron-down')) {
      let lowerAmount = e.target;
      let id = lowerAmount.dataset.id;
      let tempItem = cart.find((item) => item.id === id);
      tempItem.amount -= 1;
      if (tempItem.amount <= 0) {
        cartContent.removeChild(lowerAmount.parentElement.parentElement);
        removeItem(id);
      }
      saveCart(cart);
      setCartValue(cart);
      lowerAmount.previousElementSibling.innerText = tempItem.amount;
    }
  });
}
function clearCart() {
  let cartItems = cart.map((item) => item.id);
  // console.log(cartItems);
  cartItems.forEach((id) => removeItem(id));
  while (cartContent.children.length > 0) {
    cartContent.removeChild(cartContent.children[0]);
    // console.log(cartContent);
  }
  hideCart();
}

const removeItem = (id) => {
  cart = cart.filter((item) => item.id !== id);
  setCartValue(cart);
  saveCart(cart);
  let button = getSingleButton(id);
  button.disabled = false;
  button.innerHTML = `<i class="fas fa-shopping-cart"> </i>add to cart`;
  hideCart();
};
function getSingleButton(id) {
  return buttonsDOM.find((button) => button.dataset.id === id);
}

//  Local Storage
function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

function getProduct(id) {
  let products = JSON.parse(localStorage.getItem('products'));
  return products.find((product) => product.id === id);
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function getCart() {
  return localStorage.getItem('cart')
    ? JSON.parse(localStorage.getItem('cart'))
    : [];
}

//   DOM
document.addEventListener('DOMContentLoaded', () => {
  // Setup App
  setupApp();

  // Get All Products
  getProducts()
    .then((products) => {
      displayProduct(products);
      saveProducts(products);
    })
    .then(() => {
      getBagButtons();
      cartLogic();
    });
});
window.addEventListener('click', clickOutside);
function clickOutside(e) {
  if (e.target == cartOverlay) {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
}

//           *******     Object Oriented Based  ********

// // Variables
// const cartBtn = document.querySelector('.cart-btn');
// const cartItems = document.querySelector('.cart-items');
// const closeCartBtn = document.querySelector('.close-cart');
// const clearCartBtn = document.querySelector('.clear-cart');
// const cartOverlay = document.querySelector('.cart-overlay');
// const cartDOM = document.querySelector('.cart');
// const cartContent = document.querySelector('.cart-content');
// const cartTotal = document.querySelector('.cart-total');
// const productDOM = document.querySelector('.products-center');

// //  Cart
// let cart = [];
// //  Buttons
// let buttonsDOM = [];

// //  Getting Products
// class Products {
//   async getProducts() {
//     try {
//       let result = await fetch('../data/products.json');
//       let data = await result.json();
//       let products = data.items;
//       products = products.map((item) => {
//         const { title, price } = item.fields;
//         const { id } = item.sys;
//         const image = item.fields.image.fields.file.url;
//         return { title, price, id, image };
//       });
//       return products;
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }

// //  Display Product
// class UI {
//   displayProduct(products) {
//     let result = '';
//     products.forEach((product) => {
//       result += `
//             <article class="product">
//                 <div class="img-container">
//                     <img class="product-img" src="${product.image}" alt="">
//                     <button class="bag-btn" data-id="${product.id}">
//                         <i class="fas fa-shopping-cart"></i>Add To Cart
//                     </button>
//                 </div>
//                 <h3>${product.title}</h3>
//                 <h4>$${product.price}</h4>
//             </article>

//         `;
//     });
//     productDOM.innerHTML = result;
//   }

//   getBagButtons() {
//     const buttons = [...document.querySelectorAll('.bag-btn')];
//     buttonsDOM = buttons;
//     buttons.forEach((button) => {
//       let id = button.dataset.id;
//       let inCart = cart.find((item) => item.id === id);
//       if (inCart) {
//         button.innerText = 'In Cart';
//         button.disabled = true;
//       } else {
//         button.addEventListener('click', (event) => {
//           event.target.innerText = 'In Cart';
//           event.target.disabled = true;

//           // Get Product From Products
//           let cartItem = { ...Storage.getProduct(id), amount: 1 };

//           // Add Product To The Cart
//           cart = [...cart, cartItem];

//           // Save Cart In Local Storage
//           Storage.saveCart(cart);

//           // Set Cart Values
//           this.setCartValue(cart);

//           // Display Cart Item
//           this.addCartItem(cartItem);

//           // Show The Cart
//           this.showCart();
//         });
//       }
//     });
//   }
//   setCartValue(cart) {
//     let tempTotal = 0;
//     let itemsTotal = 0;
//     cart.map((item) => {
//       tempTotal += item.price * item.amount;
//       itemsTotal += item.amount;
//     });
//     cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
//     cartItems.innerText = itemsTotal;
//     // console.log(cartTotal, cartItems);
//   }

//   addCartItem(item) {
//     const div = document.createElement('div');
//     div.classList.add('cart-item');
//     div.innerHTML = `
//                     <img src="${item.image}" alt="">
//                       <div>
//                           <h4>${item.title}</h4>
//                           <h5>$${item.price}</h5>
//                           <span data-id=${item.id} class="remove-item">remove</span>
//                       </div>
//                       <div>
//                           <i data-id=${item.id}  class="fas fa-chevron-up"></i>
//                           <p class="item-amount">${item.amount}</p>
//                           <i data-id=${item.id}  class="fas fa-chevron-down"></i>
//                       </div>`;
//     cartContent.appendChild(div);
//     // console.log(cartContent);
//   }

//   showCart() {
//     cartOverlay.classList.add('transparentBcg');
//     cartDOM.classList.add('showCart');
//   }
//   hideCart() {
//     cartOverlay.classList.remove('transparentBcg');
//     cartDOM.classList.remove('showCart');
//   }

//   //     xxxxx           MAIN          xxxxx
//   setupApp() {
//     cart = Storage.getCart();
//     this.setCartValue(cart);
//     this.populateCart(cart);
//     cartBtn.addEventListener('click', this.showCart);
//     closeCartBtn.addEventListener('click', this.hideCart);
//   }

//   populateCart(cart) {
//     cart.forEach((item) => this.addCartItem(item));
//   }

//   cartLogic() {
//     // clear cart button
//     clearCartBtn.addEventListener('click', () => {
//       this.clearCart();
//     });

//     // cart functionality
//     cartContent.addEventListener('click', (e) => {
//       if (e.target.classList.contains('remove-item')) {
//         let removeItem = e.target;
//         let id = removeItem.dataset.id;
//         cartContent.removeChild(removeItem.parentElement.parentElement);
//         this.removeItem(id);
//       } else if (e.target.classList.contains('fa-chevron-up')) {
//         let addAmount = e.target;
//         let id = addAmount.dataset.id;
//         let tempItem = cart.find((item) => item.id === id);
//         tempItem.amount += 1;
//         Storage.saveCart(cart);
//         this.setCartValue(cart);
//         addAmount.nextElementSibling.innerText = tempItem.amount;
//       } else if (e.target.classList.contains('fa-chevron-down')) {
//         let lowerAmount = e.target;
//         let id = lowerAmount.dataset.id;
//         let tempItem = cart.find((item) => item.id === id);
//         tempItem.amount -= 1;
//         if (tempItem.amount <= 0) {
//           cartContent.removeChild(lowerAmount.parentElement.parentElement);
//           this.removeItem(id);
//         }
//         Storage.saveCart(cart);
//         this.setCartValue(cart);
//         lowerAmount.previousElementSibling.innerText = tempItem.amount;
//       }
//     });
//   }
//   clearCart() {
//     let cartItems = cart.map((item) => item.id);
//     // console.log(cartItems);
//     cartItems.forEach((id) => this.removeItem(id));
//     while (cartContent.children.length > 0) {
//       cartContent.removeChild(cartContent.children[0]);
//       // console.log(cartContent);
//     }
//     this.hideCart();
//   }
//   removeItem(id) {
//     cart = cart.filter((item) => item.id !== id);
//     this.setCartValue(cart);
//     Storage.saveCart(cart);
//     let button = this.getSingleButton(id);
//     button.disabled = false;
//     button.innerHTML = `add to cart`;
//     this.hideCart();
//   }
//   getSingleButton(id) {
//     return buttonsDOM.find((button) => button.dataset.id === id);
//   }
// }

// //  Local Storage
// class Storage {
//   static saveProducts(products) {
//     localStorage.setItem('products', JSON.stringify(products));
//   }

//   static getProduct(id) {
//     let products = JSON.parse(localStorage.getItem('products'));
//     return products.find((product) => product.id === id);
//   }

//   static saveCart(cart) {
//     localStorage.setItem('cart', JSON.stringify(cart));
//   }
//   static getCart() {
//     return localStorage.getItem('cart')
//       ? JSON.parse(localStorage.getItem('cart'))
//       : [];
//   }
// }

// //   DOM
// document.addEventListener('DOMContentLoaded', () => {
//   const ui = new UI();
//   const products = new Products();

//   // Setup App
//   ui.setupApp();

//   // Get All Products
//   products
//     .getProducts()
//     .then((products) => {
//       ui.displayProduct(products);
//       Storage.saveProducts(products);
//     })
//     .then(() => {
//       ui.getBagButtons();
//       ui.cartLogic();
//     });
// });
// window.addEventListener('click', clickOutside);
// function clickOutside(e) {
//   if (e.target == cartOverlay) {
//     cartOverlay.classList.remove('transparentBcg');
//     cartDOM.classList.remove('showCart');
//   }
// }
