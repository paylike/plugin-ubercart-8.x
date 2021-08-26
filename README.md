# Ubercart plugin for Paylike [![Build Status](https://travis-ci.org/paylike/plugin-ubercart-8.x.svg?branch=master)](https://travis-ci.org/paylike/plugin-ubercart-8.x)

This plugin is *not* developed or maintained by Paylike but kindly made
available by a user.

Released under the GPL V3 license: https://opensource.org/licenses/GPL-3.0

## Supported Ubercart versions

[![Last succesfull test](https://log.derikon.ro/api/v1/log/read?tag=ubercart8&view=svg&label=Ubercart&key=ecommerce&background=e09e03)](https://log.derikon.ro/api/v1/log/read?tag=ubercart8&view=html)


## Installation

Once you have installed Ubercart on your Drupal setup, follow these simple steps:
1. Signup at [paylike.io](https://paylike.io) (it’s free)
1. Create a live account
1. Create an app key for your Drupal website
1. Upload the ```uc_paylike.zip``` trough the Drupal Admin (You can also find the latest release at https://www.drupal.org/project/uc_paylike)
1. Download and install the Paylike PHP Library version 1.0.8 or newer from https://github.com/paylike/php-api/releases. Use `composer require paylike/php-api` in the vendors folder.
If you use `composer require drupal/uc_paylike` you can skip this step.
1. Activate the plugin through the 'Extend' screen in Drupal.
1. Visit your Ubercart Store Administration page, Configuration section, and enable the gateway under the Payment methods. (admin/store/config/payment)
1. Select the default credit transaction type. This ˘module supports immediate or delayed capture modes. Immediate capture will be done when users confirm their orders. In delayed mode administrator should capture the money manually from orders administration page (admin/store/orders/view). Select an order and click "Process card" button in Payment block on the top. Check "PRIOR AUTHORIZATIONS" block to manually capture a needed amount of money.
1. Insert Paylike API keys, from https://app.paylike.io (admin/store/config/payment/method/credit_card)

## Updating settings

Under the Paylike payment method settings, you can:
 * Update the payment method text in the payment gateways list
 * Update the payment method description in the payment gateways list
 * Update the title that shows up in the payment popup
 * Add test/live keys
 * Set payment mode (test/live)
 * Change the capture type (Authorize+Capture / Authorize only)

 ## How to capture/refund/void
- You can do capture/refund/void to an order using the Payment box in the order View Tab by press `Process card` link.
- The amount for partial capture, refund or void can be specified in `Charge Amount` input field.

 1. Capture
    * In Instant mode, the orders are captured automatically.
    * In delayed mode you can capture an order selecting authorized transaction and then click `Capture amount to this authorization` button.
 2. Refund
    * To refund an order selecting authorized transaction and then click `Refund` button.
 3. Void
    * To void an order selecting authorized transaction and then click `Void authorization` button.

## Available features
1. Capture
   * Opencart admin panel: full/partial capture
   * Paylike admin panel: full/partial capture
2. Refund
   * Opencart admin panel: full/partial refund
   * Paylike admin panel: full/partial refund
3. Void
   * Opencart admin panel: full/partial void
   * Paylike admin panel: full/partial void