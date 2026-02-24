<?php
/**
 * VH Category Section — Frontend Render Template.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block inner content (unused — dynamic block).
 * @var WP_Block $block      Block instance.
 */

$category_id = isset( $attributes['categoryId'] ) ? absint( $attributes['categoryId'] ) : 0;
$posts_count = isset( $attributes['postsCount'] ) ? absint( $attributes['postsCount'] ) : 3;
$button_text = isset( $attributes['buttonText'] )
	? sanitize_text_field( $attributes['buttonText'] )
	: __( 'View all posts', 'vh-wp-blocks' );

if ( ! $category_id ) {
	return;
}

$category = get_category( $category_id );
if ( ! $category || is_wp_error( $category ) ) {
	return;
}

$posts = get_posts(
	array(
		'category'    => $category_id,
		'numberposts' => $posts_count,
		'post_status' => 'publish',
	)
);

if ( empty( $posts ) ) {
	return;
}

$category_link       = get_category_link( $category_id );
$wrapper_attributes  = get_block_wrapper_attributes();
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="vh-cs__inner">

		<header class="vh-cs__header">
			<div class="vh-cs__eyebrow">
				<span><?php esc_html_e( 'Featured', 'vh-wp-blocks' ); ?></span>
			</div>
			<p class="vh-cs__category-label"><?php esc_html_e( 'Category', 'vh-wp-blocks' ); ?></p>
			<h2 class="vh-cs__title"><?php echo esc_html( $category->name ); ?></h2>
			<?php if ( ! empty( $category->description ) ) : ?>
				<p class="vh-cs__description"><?php echo esc_html( $category->description ); ?></p>
			<?php endif; ?>
		</header>

		<div class="vh-cs__grid">
			<?php foreach ( $posts as $post ) :
				$post_id   = $post->ID;
				$title     = get_the_title( $post_id );
				$permalink = get_permalink( $post_id );
				$excerpt   = get_the_excerpt( $post );
				$date      = get_the_date( 'M j, Y', $post_id );
				$date_iso  = get_the_date( 'c', $post_id );
				$thumb_id  = get_post_thumbnail_id( $post_id );
				$thumb_url = $thumb_id
					? wp_get_attachment_image_url( $thumb_id, 'large' )
					: '';
			?>
			<article class="vh-cs__card">
				<div class="vh-cs__card-thumb">
					<?php if ( $thumb_url ) : ?>
						<img
							class="vh-cs__card-img"
							src="<?php echo esc_url( $thumb_url ); ?>"
							alt="<?php echo esc_attr( $title ); ?>"
							loading="lazy"
						/>
					<?php else : ?>
						<svg class="vh-cs__card-thumb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
							<rect x="3" y="3" width="18" height="18" rx="2"/>
							<circle cx="8.5" cy="8.5" r="1.5"/>
							<path d="M21 15l-5-5L5 21"/>
						</svg>
					<?php endif; ?>
				</div>

				<div class="vh-cs__card-body">
					<time class="vh-cs__card-date" datetime="<?php echo esc_attr( $date_iso ); ?>">
						<?php echo esc_html( $date ); ?>
					</time>
					<h3 class="vh-cs__card-title">
						<a href="<?php echo esc_url( $permalink ); ?>"><?php echo esc_html( $title ); ?></a>
					</h3>
					<?php if ( $excerpt ) : ?>
						<p class="vh-cs__card-excerpt"><?php echo esc_html( $excerpt ); ?></p>
					<?php endif; ?>
					<a class="vh-cs__card-read" href="<?php echo esc_url( $permalink ); ?>">
						<span><?php esc_html_e( 'Read more', 'vh-wp-blocks' ); ?></span>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<line x1="5" y1="12" x2="19" y2="12"/>
							<polyline points="12 5 19 12 12 19"/>
						</svg>
					</a>
				</div>
			</article>
			<?php endforeach; ?>
		</div>

		<footer class="vh-cs__footer">
			<a class="vh-cs__cta" href="<?php echo esc_url( $category_link ); ?>">
				<span><?php echo esc_html( $button_text ); ?></span>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="5" y1="12" x2="19" y2="12"/>
					<polyline points="12 5 19 12 12 19"/>
				</svg>
			</a>
		</footer>

	</div>
</section>
