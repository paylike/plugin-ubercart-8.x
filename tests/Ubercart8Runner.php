<?php


namespace Ubercart8;

use Facebook\WebDriver\Exception\NoSuchElementException;
use Facebook\WebDriver\Exception\TimeOutException;
use Facebook\WebDriver\Exception\UnexpectedTagNameException;
use Facebook\WebDriver\WebDriverDimension;

class Ubercart8Runner extends Ubercart8TestHelper
{

    /**
     * @param $args
     *
     * @throws NoSuchElementException
     * @throws TimeOutException
     * @throws UnexpectedTagNameException
     */
    public function ready($args) {
        $this->set($args);
        $this->go();
    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */
    public function loginAdmin() {
        $this->goToPage('user/login', '#edit-name');

        while ( ! $this->hasValue('#edit-name', $this->user)) {
            $this->typeLogin();
        }
        $this->click('.form-submit');
    }

    /**
     *  Insert user and password on the login screen
     */
    private function typeLogin() {
        $this->type('#edit-name', $this->user);
        $this->type('#edit-pass', $this->pass);
    }

    /**
     * @param $args
     */
    private function set($args) {
        foreach ($args as $key => $val) {
            $name = $key;
            if (isset($this->{$name})) {
                $this->{$name} = $val;
            }
        }
    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */
    public function changeCurrency() {
        $this->goToPage("store/config/store", ".vertical-tabs__menu", true);
        $this->click(".vertical-tabs__menu li:nth-child(3)");
        $this->waitForElement(".details-wrapper #edit-uc-currency-code");
        $this->type(".details-wrapper #edit-uc-currency-code", $this->currency);
        $this->type(".details-wrapper #edit-uc-currency-sign", $this->currency);
        $this->click("#edit-submit");
    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */
    public function changeMode() {
        $this->goToPage('store/config/payment', '', true);
        $this->click("//ul[contains(@data-drupal-selector, 'edit-entities-paylike-operations-data')]");
        $this->waitForElement(".fieldset-wrapper #edit-settings-txn-type-auth-capture");
        $this->captureMode();
        $this->click("#edit-submit");
        $this->waitforElement(".messages--status");
    }


    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */

    private function logVersionsRemotely() {
        $versions = $this->getVersions();
        $this->wd->get(getenv('REMOTE_LOG_URL') . '&key=' . $this->get_slug($versions['ecommerce']) . '&tag=ubercart8&view=html&' . http_build_query($versions));
        $this->waitForElement('#message');
        $message = $this->getText('#message');
        $this->main_test->assertEquals('Success!', $message, "Remote log failed");
    }

    /**
     * @return array
     */
    private function getVersions() {
        $this->goToPage("modules", null, "true");
        $ubercart = $this->wd->executeScript("
            return document.querySelectorAll('tr[data-drupal-selector=\"edit-modules-uc-store\"]')[0].querySelectorAll('.admin-requirements')[1].innerText;
            "
        ); $paylike = $this->wd->executeScript("
           return document.querySelectorAll('tr[data-drupal-selector=\"edit-modules-uc-paylike\"]')[0].querySelectorAll('.admin-requirements')[1].innerText;
            "
        );

        return ['ecommerce' => $ubercart, 'plugin' => $paylike];
    }


    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     * @throws UnexpectedTagNameException
     */
    private function directPayment() {

        $this->changeCurrency();
        $this->goToPage('', '.uc-product-add-to-cart-form');
        $this->addToCart();
        $this->proceedToCheckout();
        $this->amountVerification();
        $this->finalPaylike();
        $this->selectOrder();
        if ($this->capture_mode == 'Delayed') {
            $this->capture();
        } else {
            $this->refund();
        }

    }


    /**
     * @param $status
     *
     * @throws NoSuchElementException
     * @throws UnexpectedTagNameException
     */


    public function moveOrderToStatus($status) {

        switch ($status) {
            case "Confirmed":
                $selector = ".fieldset-wrapper .form-radios .option";
                $button   = ".region #edit-auth-capture";
                break;
            case "Refunded":
                $selector = ".fieldset-wrapper #edit-refund-transaction .form-type-radio input";
                $button   = ".region #edit-refund";
                break;
        }

        $this->waitForElement(".block .uc-credit-terminal-form div:first-child strong");
        $orderTotalValueRaw     = $this->getText(".block .uc-credit-terminal-form div:first-child strong");
        $orderTotalValueNumeric = preg_replace("/[^0-9.,]/", "", $orderTotalValueRaw);
        $this->type("#edit-amount", $orderTotalValueNumeric);
        $this->click($selector);
        $this->click($button);


    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     * @throws UnexpectedTagNameException
     */
    public function capture() {
        $this->moveOrderToStatus('Confirmed');
        $this->waitForElement(".messages--status");
        $messageRaw = $this->getText(".messages--status");
        $message    = str_replace("Status message\n", "", $messageRaw);
        $this->main_test->assertEquals('The credit card was processed successfully. See the admin comments for more details.',
            $message, "Confirmed");
        $this->click("//a[contains(text(), 'Process card')]");

    }

    /**
     *
     */

    /**
     */
    public function captureMode() {
        if ($this->capture_mode == "Delayed") {
            $this->click("#edit-settings-txn-type-authorize");
        } else {
            $this->click("#edit-settings-txn-type-auth-capture");
        }
    }


    /**
     *
     */
    public function addToCart() {
        $this->click('.uc-product-add-to-cart-form #edit-submit-1');
        $this->waitForElement('.uc-cart-view-form  #edit-checkout--2 ');
        $this->click('.uc-cart-view-form  #edit-checkout--2');

    }

    /**
     *
     */
    public function proceedToCheckout() {
        $this->type("#edit-panes-delivery-first-name", "admin");
        $this->type("#edit-panes-delivery-last-name", "admin");
        $this->type("#edit-panes-delivery-street1", "admin");
        $this->type("#edit-panes-delivery-city", "admin");
        $this->type("#edit-panes-delivery-postal-code", "000000");
        $this->click('#edit-panes-billing-copy-address');
        $this->waitForElement('.paylike-button');
        $this->click(".paylike-button");


    }

    /**
     *
     */
    public function amountVerification() {

        $amount         = $this->getText('.paylike .payment .amount');
        $amount         = preg_replace("/[^0-9.]/", "", $amount);
        $amount         = trim($amount, '.');
        $amount         = ceil(round($amount, 4) * get_paylike_currency_multiplier($this->currency));
        $expectedAmount = $this->getText('.line-item-total .price');
        $expectedAmount = preg_replace("/[^0-9.]/", "", $expectedAmount);
        $expectedAmount = trim($expectedAmount, '.');
        $expectedAmount = ceil(round($expectedAmount, 4) * get_paylike_currency_multiplier($this->currency));
        $this->main_test->assertEquals($expectedAmount, $amount, "Checking minor amount for " . $this->currency);

    }


    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */
    public function finalPaylike() {
        $this->popupPaylike();
        $this->waitElementDisappear(".paylike.overlay ");
        $this->click("#edit-continue");
        $this->waitForElement("#edit-submit");
        $this->click("#edit-submit");
        $completedValue = $this->getText(".region-content .page-title");
        // because the title of the page matches the checkout title, we need to use the order received class on body
        $this->main_test->assertEquals('Order complete', $completedValue);
    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */
    public function popupPaylike() {
        try {
            $this->type('.paylike.overlay .payment form #card-number', 41000000000000);
            $this->type('.paylike.overlay .payment form #card-expiry', '11/22');
            $this->type('.paylike.overlay .payment form #card-code', '122');
            $this->click('.paylike.overlay .payment form button');
        } catch (NoSuchElementException $exception) {
            $this->confirmOrder();
            $this->popupPaylike();
        }

    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */
    public function selectOrder() {

        $this->goToPage("store/orders/view", ".views-field-actions .dropbutton-action", true);
        $this->click(".views-field-actions .dropbutton-action");
        $this->waitForElement(".block #order-pane-payment");
        $this->click("//a[contains(text(), 'Process card')]");
    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     * @throws UnexpectedTagNameException
     */
    public function refund() {
        $this->moveOrderToStatus('Refunded');
        $this->waitForElement(".messages--status");
        $orderTotalValueRaw = $this->getText(".block .uc-credit-terminal-form div:first-child strong");
        $orderTotalValue    = str_replace("Order total: ", "", $orderTotalValueRaw);
        $messageRaw         = $this->getText(".messages--status");
        $message            = str_replace("Status message\n", "", $messageRaw);
        $this->main_test->assertEquals('Refund successfully made for ' . $orderTotalValue . '.', $message, "Refunded");


    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */
    public function confirmOrder() {
        $this->waitForElement('#paylike-payment-button');
        $this->click('#paylike-payment-button');
    }

    /**
     * @throws NoSuchElementException
     * @throws TimeOutException
     */
    private function settings() {
        $this->changeMode();
    }

    /**
     * @return Ubercart8Runner
     * @throws NoSuchElementException
     * @throws TimeOutException
     * @throws UnexpectedTagNameException
     */
    private function go() {
        $this->changeWindow();
        $this->loginAdmin();
         if ($this->log_version) {
             $this->logVersionsRemotely();

             return $this;
         }
        $this->settings();
        $this->directPayment();

    }

    /**
     *
     */
    private function changeWindow() {
        $this->wd->manage()->window()->setSize(new WebDriverDimension(1600, 1024));
    }


}

