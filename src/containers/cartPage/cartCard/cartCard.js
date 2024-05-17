import React from 'react';
import { Button, IconAdd, MinusIcon, NamedLink, ResponsiveImage } from '../../../components';
import { createSlug } from '../../../util/urlHelpers';

import css from './cartCard.module.css';

const CartCard = props => {
  const { listing, count, onToggleCart } = props;
  const { title, price } = listing;
  const listingId = listing.id;
  const authorId = listing.authorId;

  const variantPrefix = ['default'];

  const handleToggleCart = increment => {
    onToggleCart(listingId, authorId, increment);
  };

  const linkParams = { id: listingId, slug: createSlug(title) };

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
          image={listing.image}
          variants={variantPrefix}
        />
        <div className={css.countContainer}>
          <Button onClick={() => handleToggleCart(1)} className={css.actionButton}>
            <IconAdd rootClassName={css.btnIcons} />
          </Button>
          {/* <input
            type="number"
            value={count}
            onChange={evt => {
              console.log(evt.target.value);
            }}
          /> */}
          {count}
          <Button onClick={() => handleToggleCart(-1)} className={css.actionButton}>
            <MinusIcon rootClassName={css.btnIcons} />
          </Button>
        </div>
        <span>total {total}</span>
      </div>
    </div>
  );
};

export default CartCard;
