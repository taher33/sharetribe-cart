import { currentUserShowSuccess } from '../../ducks/user.duck';
import { denormalisedResponseEntities } from '../../util/data';
import { parse } from '../../util/urlHelpers';

export const FETCH_LINE_ITEMS_REQUEST = 'app/CartPage/FETCH_LINE_ITEMS_REQUEST';
export const FETCH_LINE_ITEMS_SUCCESS = 'app/CartPage/FETCH_LINE_ITEMS_SUCCESS';
export const FETCH_LINE_ITEMS_ERROR = 'app/CartPage/FETCH_LINE_ITEMS_ERROR';
export const SET_AUTHOR_ID = 'app/CartPage/SET_AUTHOR_ID';

export const fetchCartItemsReq = () => ({ type: FETCH_LINE_ITEMS_REQUEST });
export const fetchCartItemsErr = e => ({ type: FETCH_LINE_ITEMS_ERROR, payload: e });
export const fetchCartItemsSuccess = res => ({ type: FETCH_LINE_ITEMS_SUCCESS, payload: res });
export const setAuthorIdx = id => ({ type: SET_AUTHOR_ID, payload: id });

const updateCurrentUserCart = newCart => (dispatch, getState, sdk) => {
  return sdk.currentUser
    .updateProfile(
      {
        privateData: {
          cart: newCart,
        },
      },
      { expand: true }
    )
    .then(resp => {
      const entities = denormalisedResponseEntities(resp);
      if (entities.length !== 1) {
        throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
      }
      const currentUser = entities[0];

      // Update current user in state.user.currentUser through user.duck.js
      dispatch(currentUserShowSuccess(currentUser));

      // Return the updated cart
      return resp.data.data.attributes.profile.privateData.cart;
    });
};

export const toggleCart = (listingId, authorId, increment = 1) => (dispatch, getState, sdk) => {
  const currentUser = getState().user.currentUser;
  const cart = currentUser.attributes.profile.privateData?.cart || [];

  // Cart as object with author ids as keys
  let newCart = getNewCart(cart, authorId, listingId, increment);

  dispatch(updateCurrentUserCart(newCart))
    .then(updatedCart => {
      console.log({ updatedCart });
    })
    .catch(e => {
      //   dispatch(toggleCartError(storableError(e)));
      console.log(e);
    });
};

export const loadData = (params, search, authorId = null, currentUser = null) => (
  dispatch,
  getState,
  sdk
) => {
  dispatch(fetchCartItemsReq);
  const user = currentUser ?? getState().user.currentUser;
  const cart = user?.attributes.profile.privateData?.cart || {};

  // const { currentAuthor } = getState().CartPage;
  // const cartAuthorId = currentAuthor?.id.uuid ?? Object.keys(cart)[0];

  const queryParams = parse(search);
  const page = queryParams.page || 1;

  const params = {
    perPage: 5,
    page,
    include: ['images', 'author', 'currentStock'],
    'limit.images': 1,
    ids: Object.keys(cart).map(cartId => Object.keys(cart[cartId])),
  };

  return sdk.listings
    .query(params)
    .then(response => {
      console.log(response.data);
      const cart = [];
      response.data.data.forEach(el => {
        const cartItem = {
          authorId: el.relationships.author.data.id.uuid,
          id: el.id.uuid,
          description: el.attributes.description,
          price: el.attributes.price.amount,
          title: el.attributes.title,
          image: response.data.included.find(
            details => details.id.uuid === el.relationships.images.data[0].id.uuid
          ).attributes?.variants.default.url,
          // count: cart[el.relationships.author.data.id.uuid][el.id.uuid]?.count,
        };
        cart.push(cartItem);
      });

      dispatch(fetchCartItemsSuccess(cart));

      console.log({ cart });

      return response;
    })
    .catch(e => {
      dispatch(fetchCartItemsErr(e));
      console.log({ e });
    });
};

const initialState = {
  authorId: 0,
  isFetchInProgress: false,
  fetchErr: null,
  cartListings: [],
};

const CartPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;

  switch (type) {
    case FETCH_LINE_ITEMS_REQUEST:
      return { ...state, isFetchInProgress: true, lineItemsError: null };
    case FETCH_LINE_ITEMS_SUCCESS:
      return { ...state, isFetchInProgress: false, cartListings: payload };
    case FETCH_LINE_ITEMS_ERROR:
      return { ...state, isFetchInProgress: false, fetchErr: payload };
    // case SET_AUTHOR_ID:
    //   return { ...state, authorId: payload };

    default:
      return state;
  }
};

export default CartPageReducer;

export const listingIsInCart = (cart, authorId, listingId) => {
  if (!cart || !cart[authorId]) {
    return false;
  }

  return Object.keys(cart[authorId]).includes(listingId);
};

const getNewCart = (cart, authorId, listingId, increment) => {
  const authorInCart = Object.keys(cart).includes(authorId);
  let isListingInCart = listingIsInCart(cart, authorId, listingId);

  const newCount = ((cart[authorId] && cart[authorId][listingId]?.count) || 0) + increment;

  // Increment an existing listing
  if (authorInCart && isListingInCart && newCount > 0) {
    return {
      ...cart,
      [authorId]: {
        ...cart[authorId],
        [listingId]: {
          count: newCount,
        },
      },
    };
    // Remove an existing listing from cart
  } else if (authorInCart && isListingInCart && newCount <= 0) {
    const newCart = { ...cart };
    delete newCart[authorId][listingId];

    const remainingCart = Object.keys(newCart[authorId]);

    // If the listing was the author's last one, remove the author as well
    if (
      remainingCart.length == 0 ||
      (remainingCart.length === 1 && remainingCart[0] === 'deliveryMethod')
    ) {
      delete newCart[authorId];
    }

    return newCart;
    // Add new listing to an existing author
  } else if (authorInCart && !isListingInCart) {
    return {
      ...cart,
      [authorId]: {
        ...cart[authorId],
        [listingId]: {
          count: increment,
        },
      },
    };
    // Add new listing and a new author
  } else {
    return {
      ...cart,
      [authorId]: {
        [listingId]: {
          count: increment,
        },
      },
    };
  }
};
