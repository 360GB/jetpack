/* global jQuery, jp_banner */

( function ( $ ) {
	var recommendationsBanner = $( '#jp-recommendations-banner-main' );
	var recommendationsBannerForm = $( '#jp-recommendations-banner__form' );
	var recommendationsBannerContinue = $( '#jp-recommendations-banner__continue-button' );
	var recommendationsBannerDismiss = $( '#jp-recommendations-banner__notice-dismiss' );

	recommendationsBannerForm.on( 'change', function ( event ) {
		if (
			'checkbox' === event.target.type &&
			event.target.parentElement &&
			'label' === event.target.parentElement.tagName.toLowerCase()
		) {
			var isChecked = $( 'label.checked input[name="' + event.target.name + '"]' ).length > 0;
			if ( isChecked ) {
				event.target.parentElement.classList.remove( 'checked' );
			} else {
				event.target.parentElement.classList.add( 'checked' );
			}
		}
	} );

	recommendationsBannerContinue.on( 'click', function () {
		var fieldNames = [ 'personal', 'business', 'store', 'other' ];
		var formData = {};
		fieldNames.forEach( function ( name ) {
			formData[ name ] = $( "input[name='" + name + "']" ).prop( 'checked' );
		} );

		$.post( jp_banner.ajax_url, {
			action: 'jetpack_recommendations_banner',
			nonce: jp_banner.nonce,
			...formData,
		} );
	} );

	recommendationsBannerDismiss.on( 'click', function () {
		$( recommendationsBanner ).hide();

		var data = {
			action: 'jetpack_recommendations_banner',
			nonce: jp_banner.nonce,
			dismissBanner: true,
		};

		$.post( jp_banner.ajax_url, data, function ( response ) {
			if ( true !== response.success ) {
				$( recommendationsBanner ).show();
			}
		} );
	} );

	// Dismiss the wizard banner via AJAX
	// wizardBannerDismiss.on( 'click', function () {
	//     $( wizardBanner ).hide();
	//
	//     var data = {
	//         dismissBanner: true,
	//         action: 'jetpack_wizard_banner',
	//         nonce: jp_banner.wizardBannerNonce,
	//     };
	//
	//     $.post( jp_banner.ajax_url, data, function ( response ) {
	//         if ( true !== response.success ) {
	//             $( wizardBanner ).show();
	//         }
	//     } );
	// } );
} )( jQuery );
