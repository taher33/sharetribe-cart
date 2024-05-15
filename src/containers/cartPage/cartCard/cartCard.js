import React from 'react';
import { NamedLink, ResponsiveImage } from '../../../components';
import { createSlug } from '../../../util/urlHelpers';

import css from './cartCard.module.css';

const CartCard = props => {
  const { listing, count, onToggleCart } = props;
  const { title, price } = listing;
  const listingId = listing.id;
  const authorId = listing.authorId;

  const variantPrefix = 'cart-card';

  const handleToggleCart = increment => {
    onToggleCart(listingId, authorId, increment);
  };

  const linkParams = { id: listingId, slug: createSlug(title) };
  const firstImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  const total = `${(price * (count ?? 1)) / 100} USD`;

  return (
    <div className={css.cardLayout}>
      <NamedLink name="ListingPage" params={linkParams}>
        {title}
      </NamedLink>
      <div className={css.itemLayout}>
        <ResponsiveImage
          rootClassName={css.rootForImage}
          alt={title}
          image={[listing.image]}
          variants={variantPrefix}
        />
        {/* <AddToCartButton listing={listing} count={count} incrementCart={handleToggleCart} /> */}
        <span>{total}</span>
      </div>
    </div>
  );
};

export default CartCard;
