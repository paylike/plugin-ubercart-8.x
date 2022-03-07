/// <reference types="cypress" />

'use strict';

import { PaylikeTestHelper } from './test_helper.js';

export var TestMethods = {

    /** Admin & frontend user credentials. */
    StoreUrl: (Cypress.env('ENV_ADMIN_URL').match(/^(?:http(?:s?):\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im))[0],
    AdminUrl: Cypress.env('ENV_ADMIN_URL'),
    RemoteVersionLogUrl: Cypress.env('REMOTE_LOG_URL'),

    /** Construct some variables to be used bellow. */
    ShopName: 'ubercart8',
    PaylikeName: 'paylike',
    ShopAdminUrl: '/store/config/store', // used for change currency
    PaymentMethodsAdminUrl: '/store/config/payment/method/paylike',
    OrdersPageAdminUrl: '/store/orders/view',
    ModulesAdminUrl: '/modules',

    /**
     * Login to admin backend account
     */
    loginIntoAdminBackend() {
        cy.loginIntoAccount('input[name=name]', 'input[name=pass]', 'admin');
    },

    /**
     * Modify Paylike settings
     * @param {String} captureMode
     */
    changePaylikeCaptureMode(captureMode) {
        /** Go to payments page, and select Paylike. */
        cy.goToPage(this.PaymentMethodsAdminUrl);

        /** Change capture mode & save. */
        if ('Instant' === captureMode) {
            cy.get('#edit-settings-txn-type-auth-capture').click();
        } else if ('Delayed' === captureMode) {
            cy.get('#edit-settings-txn-type-authorize').click();
        }

        cy.get('#edit-submit').click();
    },

    /**
     * Make an instant payment
     * @param {String} currency
     */
    makePaymentFromFrontend(currency) {
        /** Go to store frontend. */
        cy.goToPage(this.StoreUrl);

        /** Add to cart random product. */
        var randomInt = PaylikeTestHelper.getRandomInt(/*max*/ 1);
        cy.get('.button.js-form-submit.form-submit').eq(randomInt).click();
        cy.wait(1000);

        /** Proceed to checkout. */
        cy.get('#edit-checkout--2').click();

        /** Select saved address. */
        /** Right now, selection of a saved address has no effect to autofill fields. */
        // cy.get('#edit-panes-delivery-select-address').select('0');

        /** Fill in shipping address fields. */
        cy.get('#edit-panes-delivery-first-name').clear().type('firstName');
        cy.get('#edit-panes-delivery-last-name').clear().type('lastName');
        cy.get('#edit-panes-delivery-street1').clear().type('street');
        cy.get('#edit-panes-delivery-city').clear().type('city');
        cy.get('#edit-panes-delivery-zone').select(0);
        cy.get('#edit-panes-delivery-postal-code').clear().type('000000');

        /** Select that billing address to be the sam as shipping. */
        /** This can be enable by default from ubercart settings. */
        cy.get('#edit-panes-billing-copy-address').click();
        cy.wait(1000);

        /** Get & Verify amount. */
        cy.get('.line-item-total .price').then(($totalAmount) => {
            cy.window().then(win => {
                var expectedAmount = PaylikeTestHelper.filterAndGetAmountInMinor($totalAmount, currency);
                var orderTotalAmount = Number(win.drupalSettings.uc_paylike.config.amount.value);
                expect(expectedAmount).to.eq(orderTotalAmount);
            });
        });

        /** Choose Paylike (if we have more than one payment methods). */
        // cy.get(`input[id*="edit-panes-payment-payment-method-${this.PaylikeName}"]`).click();

        /** Show paylike popup. */
        cy.get(`input[id*="edit-panes-payment-details-${this.PaylikeName}"]`).click();

        /**
         * Fill in Paylike popup.
         */
         PaylikeTestHelper.fillAndSubmitPaylikePopup();

        /** Go to order confirmation. */
        cy.get('#edit-continue', {timeout: 8000}).click();

        /** Check if order was paid (edit-submit button be visible) and submit it. */
        cy.get('.button.button--primary.js-form-submit.form-submit', {timeout: 8000}).should('be.visible').click();

        cy.get('h1.page-title', {timeout: 8000}).should('be.visible').contains('Order complete');
    },

    /**
     * Make payment with specified currency and process order
     *
     * @param {String} currency
     * @param {String} paylikeAction
     * @param {Boolean} partialAmount
     */
     payWithSelectedCurrency(currency, paylikeAction, partialAmount = false) {
        /** Make an instant payment. */
        it(`makes a Paylike payment with "${currency}"`, () => {
            this.makePaymentFromFrontend(currency);
        });

        /** Process last order from admin panel. */
        it(`process (${paylikeAction}) an order from admin panel`, () => {
            this.processOrderFromAdmin(paylikeAction, partialAmount);
        });
    },

    /**
     * Process last order from admin panel
     * @param {String} paylikeAction
     * @param {Boolean} partialAmount
     */
    processOrderFromAdmin(paylikeAction, partialAmount = false) {
        /** Go to admin orders page. */
        cy.goToPage(this.OrdersPageAdminUrl);

        // /** Click on first (latest in time) order from orders table. */
        cy.get('.dropbutton > .view > a').first().click();

        /**
         * Take specific action on order
         */
        this.paylikeActionOnOrderAmount(paylikeAction, partialAmount);
    },

    /**
     * Capture an order amount
     * @param {String} paylikeAction
     * @param {Boolean} partialAmount
     */
     paylikeActionOnOrderAmount(paylikeAction, partialAmount = false) {
        /** Go to paylike transaction page. */
        cy.get(`a[href*="/credit/${this.PaylikeName}"]`).click();

        switch (paylikeAction) {
            case 'capture':
                if (partialAmount) {
                    cy.get('#edit-amount').then($editAmountInput => {
                        var totalAmount = $editAmountInput.val();
                        /** Subtract 10 major units from amount. */
                        $editAmountInput.val(Math.round(totalAmount - 10));
                    });
                }
                /** Select authorized/captured transaction. */
                cy.get('input[name=select_auth]').click();
                cy.get('#edit-auth-capture').click();
                break;
            case 'refund':
                if (partialAmount) {
                    /** Partial refund */
                    cy.get('#edit-amount').clear().type(15);
                } else {
                    /** Total refund */
                    cy.get('strong').contains('Order total').then($totalCapturedAmount => {
                        var totalAmount = ($totalCapturedAmount.text()).replace(/[^0-9,.][a-z.]*/g, '');
                        /** Subtract 10 major units from amount. */
                        cy.get('#edit-amount').clear().type(Math.round(totalAmount - 10));
                    });
                }
                /** Select authorized/captured transaction. */
                cy.get('input[name=refund_transaction]').click();
                cy.get('#edit-refund').click();
                break;
            case 'void':
                if (partialAmount) {
                    cy.get('#edit-amount').then($editAmountInput => {
                        /**
                         * Put 15 major units to be voided.
                         * Premise: any product must have price >= 15.
                         */
                        $editAmountInput.val(15);
                    });
                }
                /** Select authorized/captured transaction. */
                cy.get('input[name=select_auth]').click();
                cy.get('#edit-auth-void').click();
                break;
        }

        /** Check if success message. */
        cy.get('div.messages.messages--status').should('contain', 'successfully');
    },

    /**
     * Change shop currency from admin
     */
    changeShopCurrencyFromAdmin(currency) {
        it(`Change shop currency from admin to "${currency}"`, () => {
            /** Go to edit shop page. */
            cy.goToPage(this.ShopAdminUrl);

            /** Select currency & save. */
            cy.get('.vertical-tabs__menu li:nth-child(3)').click();

            cy.get('#edit-uc-currency-code').clear().type(currency);
            cy.get('#edit-uc-currency-sign').clear().type(currency);
            cy.get('#edit-submit').click();
        });
    },

    /**
     * Get Shop & Paylike versions and send log data.
     */
    logVersions() {
        /** Go to Virtuemart config page. */
        cy.goToPage(this.ModulesAdminUrl);

        /** Get framework, shop and payment plugin version. */
        cy.document().then($doc => {
            var frameworkVersion = $doc.querySelectorAll('tr[data-drupal-selector*="edit-module"] .admin-requirements')[1].innerText
            var shopVersion = $doc.querySelectorAll('tr[data-drupal-selector*="uc-store"] .admin-requirements')[1].innerText
            var pluginVersion = $doc.querySelectorAll(`tr[data-drupal-selector*="uc-${this.PaylikeName}"] .admin-requirements`)[1].innerText

            cy.wrap(frameworkVersion.replace('Version: ', '')).as('frameworkVersion');
            cy.wrap(shopVersion.replace('Version: ', '')).as('shopVersion');
            cy.wrap(pluginVersion.replace('Version: ', '')).as('pluginVersion');
        });

        /** Get global variables and make log data request to remote url. */
        cy.get('@frameworkVersion').then(frameworkVersion => {
            cy.get('@shopVersion').then(shopVersion => {
                cy.get('@pluginVersion').then(pluginVersion => {

                    cy.request('GET', this.RemoteVersionLogUrl, {
                        key: shopVersion,
                        tag: this.ShopName,
                        view: 'html',
                        framework: frameworkVersion,
                        ecommerce: shopVersion,
                        plugin: pluginVersion
                    }).then((resp) => {
                        expect(resp.status).to.eq(200);
                    });
                });
            });
        });
    },
}