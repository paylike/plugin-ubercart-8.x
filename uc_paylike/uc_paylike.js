(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.paylikeForm = {
    attach: function (context) {
      // Attach the code only once
      $('.paylike-button', context).once('paylike').each(function() {
        if (!drupalSettings.uc_paylike || !drupalSettings.uc_paylike.publicKey || drupalSettings.uc_paylike.publicKey === '') {
          $('#edit-payment-information').prepend('<div class="messages messages--error">' + Drupal.t('Configure Paylike payment gateway settings please') + '</div>');
          return;
        }

        function handleResponse(error, response) {
          if (error) {
            return console.log(error);
          }
          console.log(response);
          $('.paylike-button').val(Drupal.t('Change credit card details'));
          $('#paylike_transaction_id').val(response.transaction.id);
        }

        $(this).click(function (event) {
          event.preventDefault();
          var paylike = Paylike(drupalSettings.uc_paylike.publicKey),
            config = drupalSettings.uc_paylike.config;

          // Get customer information from delivery or billing pane
          var customer = [
            $('.uc-cart-checkout-form [name*="first_name"]').val(),
            $('.uc-cart-checkout-form [name*="last_name"]').val(),
          ];
          var address = [
            $('.uc-cart-checkout-form [name*="postal_code"]').val(),
            $('.uc-cart-checkout-form [name*="city"]').val(),
            $('.uc-cart-checkout-form [name*="street1"]').val(),
            $('.uc-cart-checkout-form [name*="street2"]').val(),
          ];

          config.custom.customer.name = customer.filter(String).join(' ');
          config.custom.customer.address = address.filter(String).join(', ');
          console.log(config.custom.customer);
          paylike.popup(config, handleResponse);
        });
      });
    }
  }

})(jQuery, Drupal, drupalSettings);
