/// <reference types="cypress" />

'use strict';

import { TestMethods } from '../support/test_methods.js';

describe('paylike plugin quick test', () => {
    /**
     * Login into admin and frontend to store cookies.
     */
    before(() => {
        cy.goToPage(TestMethods.StoreUrl + '/user/login');
        TestMethods.loginIntoAdminBackend();
    });

    /**
     * Run this on every test case bellow
     * - preserve cookies between tests
     */
    beforeEach(() => {
        Cypress.Cookies.defaults({
            preserve: (cookie) => {
              return true;
            }
        });
    });

    let currency = Cypress.env('ENV_CURRENCY_TO_CHANGE_WITH');
    let captureMode = 'Delayed';

    /**
     * Modify Paylike capture mode
     */
    it('modify Paylike settings for capture mode', () => {
        TestMethods.changePaylikeCaptureMode(captureMode);
    });

    /**
     * Change shop currency
     */
    TestMethods.changeShopCurrencyFromAdmin(currency);

    /** Pay and process order. */
    /** Capture */
    TestMethods.payWithSelectedCurrency(currency, 'capture');

    /** Refund last created order (previously captured). */
    it('Process last order captured from admin panel to be refunded', () => {
        TestMethods.processOrderFromAdmin('refund');
    });

    /** Partial Capture */
    TestMethods.payWithSelectedCurrency(currency, 'capture', /*partialAmount*/ true);

    /** Refund last created order (previously captured). */
    it('Process last order captured from admin panel to be refunded', () => {
        TestMethods.processOrderFromAdmin('refund', /*partialAmount*/ true);
    });

    /** Void */
    TestMethods.payWithSelectedCurrency(currency, 'void');

    /** Partial Void */
    TestMethods.payWithSelectedCurrency(currency, 'void', /*partialAmount*/ true);

}); // describe