import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { useConfiguration } from '../../context/configurationContext';
import { initializeCardPaymentData } from '../../ducks/stripe.duck.js';
import { createResourceLocatorString, findRouteByRouteName } from '../../util/routes';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { createSlug } from '../../util/urlHelpers';
import { PURCHASE_PROCESS_NAME } from '../../transactions/transaction.js';
import { FormattedMessage } from '../../util/reactIntl';

import { Button, LayoutSingleColumn, OrderBreakdown, Page, UserNav } from '../../components';

import EstimatedCustomerBreakdownMaybe from '../../components/OrderPanel/EstimatedCustomerBreakdownMaybe';

import CartCard from './cartCard/cartCard';

import css from './cartPage.module.css';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import {
  //   getCartListingsById,
  loadData,
  //   deliveryOptions,
  //   setCartDelivery,
  setAuthorIdx,
  toggleCart,
} from './cartPage.duck';

const CartPage = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const {
    currentUser,
    cartListings,
    fetchErr,
    isFetchInProgress,
    setAuthorIdx,
    onReloadData,
    onToggleCart,
  } = props;

  const authorName = currentUser?.attributes?.profile.displayName;

  const pageTitle = currentUser ? (
    <FormattedMessage id="CartPage.pageTitleAuthor" values={{ name: authorName }} />
  ) : (
    <FormattedMessage id="CartPage.pageTitleNoItems" />
  );

  return (
    <Page title="Shopping cart">
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer currentPage="CartPage" />
            <UserNav currentPage="CartPage" />
          </>
        }
        footer={<FooterContainer />}
      >
        <h1 className={css.title}>Cart</h1>

        <div className={css.splitView}>
          <div className={css.listingPanel}>
            <div className={css.listingCards}>
              {cartListings.map(l => (
                <CartCard
                  key={l.id}
                  listing={l}
                  count={l.count}
                  config={config}
                  onToggleCart={onToggleCart}
                />
              ))}
            </div>
          </div>
          {/* <div className={css.breakdownPanel}>
            <EstimatedCustomerBreakdownMaybe
              lineItems={cartLineItems}
              processName={PURCHASE_PROCESS_NAME}
              marketplaceName={config.marketplaceName}
            />
            {deliveryInfo()}
          </div> */}
        </div>
        {cartListings?.length > 0 && (
          <Button className={css.buyNowButton}>
            <FormattedMessage id="buy Now" />
          </Button>
        )}
      </LayoutSingleColumn>
      <LayoutSingleColumn>
        <OrderBreakdown />
      </LayoutSingleColumn>
    </Page>
  );
};

CartPage.defaultProps = {
  listings: null,
};

const mapStateToProps = state => {
  const { authorId, cartListings, fetchErr, isFetchInProgress } = state.CartPage;

  const { currentUser } = state.user;
  return {
    authorId,
    currentUser,
    cartListings,
    fetchErr,
    isFetchInProgress,
  };
};

const mapDispatchToProps = dispatch => ({
  onReloadData: (params, search, config, authorId) =>
    dispatch(loadData(params, search, config, authorId)),
  onToggleCart: (listingId, authorId, increment) =>
    dispatch(toggleCart(listingId, authorId, increment)),
  setAuthorIdx: idx => dispatch(setAuthorIdx(idx)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CartPage);
