<?php

/**
 * Class containing utility static methods that other SEO tools are relying on.
 */
class Jetpack_SEO_Utils {
	/**
	 * Site option name used to store front page meta description.
	 */
	const FRONT_PAGE_META_OPTION = 'advanced_seo_front_page_description';

	/**
	 * Initially setting the front page meta description was for all sites, then the feature was grouped to a paid plan.
	 * The LEGACY_META_OPTION was added at that time to support legacy usage. Later on, a decision was made to have
	 * the JP seo-tools features for all JP sites (paid plan or not).
	 */
	const LEGACY_META_OPTION = 'seo_meta_description';

	/**
	 * Used to check whether SEO tools are enabled for given site.
	 *
	 * @param int $site_id Optional. Defaults to current blog id if not given.
	 *
	 * @return bool True if SEO tools are enabled, false otherwise.
	 */
	public static function is_enabled_jetpack_seo( $site_id = 0 ) {
		/**
		 * Can be used by SEO plugin authors to disable the conflicting output of SEO Tools.
		 *
		 * @module seo-tools
		 *
		 * @since 5.0.0
		 *
		 * @param bool True if SEO Tools should be disabled, false otherwise.
		 */
		if ( apply_filters( 'jetpack_disable_seo_tools', false ) ) {
			return false;
		}

		if ( function_exists( 'has_any_blog_stickers' ) ) {
			// For WPCOM sites.
			if ( empty( $site_id ) ) {
				$site_id = get_current_blog_id();
			}

			return has_any_blog_stickers( array( 'business-plan', 'ecommerce-plan' ), $site_id );
		}

		// For all Jetpack sites.
		return true;
	}

	/**
	 * Returns front page meta description for current site.
	 *
	 * If a `LEGACY_META_OPTION` is found, update it as `FRONT_PAGE_META_OPTION` instead.
	 *
	 * @return string Front page meta description string or empty string.
	 */
	public static function get_front_page_meta_description() {
		$legacy_meta_option = get_option( self::LEGACY_META_OPTION );
		if ( ! empty( $legacy_meta_option ) ) {
			return self::update_front_page_meta_description( $legacy_meta_option, true );
		}

		return get_option( self::FRONT_PAGE_META_OPTION );
	}

	/**
	 * Updates the site option value for front page meta description.
	 *
	 * @param string $value                     New value for front page meta description.
	 * @param bool   $delete_legacy_meta_option Delete the LEGACY_META_OPTION if true.
	 *
	 * @return string Saved value, or empty string if no update was performed.
	 */
	public static function update_front_page_meta_description( $value, $delete_legacy_meta_option = false ) {
		$front_page_description = sanitize_text_field( $value );

		/**
		 * Can be used to limit the length of front page meta description.
		 *
		 * @module seo-tools
		 *
		 * @since 4.4.0
		 *
		 * @param int Maximum length of front page meta description. Defaults to 300.
		 */
		$description_max_length = apply_filters( 'jetpack_seo_front_page_description_max_length', 300 );

		if ( function_exists( 'mb_substr' ) ) {
			$front_page_description = mb_substr( $front_page_description, 0, $description_max_length );
		} else {
			$front_page_description = substr( $front_page_description, 0, $description_max_length );
		}

		$did_update = update_option( self::FRONT_PAGE_META_OPTION, $front_page_description );

		if ( $delete_legacy_meta_option && $did_update && self::is_enabled_jetpack_seo() ) {
			// Cleanup legacy option.
			delete_option( 'seo_meta_description' );
		}

		if ( $did_update ) {
			return $front_page_description;
		}

		return '';
	}
}
