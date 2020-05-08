# Ubercart plugin for Paylike

This plugin is *not* developed or maintained by Paylike but kindly made
available by a user.

Released under the GPL V3 license: https://opensource.org/licenses/GPL-3.0

## Supported Ubercart versions

*The plugin has been tested with most versions of Ubercart at every iteration. We recommend using the latest version of Ubercart, but if that is not possible for some reason, test the plugin with your Ubercart version and it would probably function properly.*

* Ubercart
 version last tested on: *8.x-4.0-alpha5* on Drupal 8.8.1


## Installation

Once you have installed Ubercart on your Drupal setup, follow these simple steps:
1. Signup at [paylike.io](https://paylike.io) (it’s free)
1. Create a live account
1. Create an app key for your Drupal website
1. Upload the ```uc_paylike.zip``` trough the Drupal Admin (You can also find the latest release at https://www.drupal.org/project/uc_paylike)
1. Download and install the Paylike PHP Library version 1.0.5 or newer
       from https://github.com/paylike/php-api/releases. Use `composer require paylike/php-api` in the vendors folder
1. Activate the plugin through the 'Extend' screen in Drupal.
1.  Visit your Ubercart Store Administration page, Configuration
       section, and enable the gateway under the Payment methods.
       (admin/store/config/payment)
1. Select the default credit transaction type. This ˘module supports immediate
       or delayed capture modes. Immediate capture will be done when users confirm
       their orders. In delayed mode administrator should capture the money manually from
       orders administration page (admin/store/orders/view). Select an order and click
       "Process card" button in Payment block on the top. Check "PRIOR AUTHORIZATIONS"
       block to manually capture a needed amount of money.
1. Insert Paylike API keys, from https://app.paylike.io
       (admin/store/config/payment/method/credit_card)

## Updating settings

Under the Paylike payment method settings, you can:
 * Update the payment method text in the payment gateways list
 * Update the payment method description in the payment gateways list
 * Update the title that shows up in the payment popup 
 * Add test/live keys
 * Set payment mode (test/live)
 * Change the capture type (Instant/Delayed)
 
 ## How to
 
 1. Capture
 * In Instant mode, the orders are captured automatically
 * In delayed mode you can capture an order by using the Payment box in the View Tab
 2. Refund
   * To refund an order move you can use the Payment box in the View Tab. Click process card and then refund.
 3. Void
   * To void an order move you can use the Payment box in the View Tab. Click process card and then void.
