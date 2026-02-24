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

$category_link      = get_category_link( $category_id );
$wrapper_attributes = get_block_wrapper_attributes();
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>

	<header>
		<h2><?php echo esc_html( $category->name ); ?></h2>
		<?php if ( ! empty( $category->description ) ) : ?>
			<p><?php echo esc_html( $category->description ); ?></p>
		<?php endif; ?>
	</header>

	<div>
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
		<article>
			<?php if ( $thumb_url ) : ?>
				<img
					src="<?php echo esc_url( $thumb_url ); ?>"
					alt="<?php echo esc_attr( $title ); ?>"
					loading="lazy"
				/>
			<?php endif; ?>

			<time datetime="<?php echo esc_attr( $date_iso ); ?>">
				<?php echo esc_html( $date ); ?>
			</time>
			<h3>
				<a href="<?php echo esc_url( $permalink ); ?>"><?php echo esc_html( $title ); ?></a>
			</h3>
			<?php if ( $excerpt ) : ?>
				<p><?php echo esc_html( $excerpt ); ?></p>
			<?php endif; ?>
		</article>
		<?php endforeach; ?>
	</div>

	<footer>
		<a href="<?php echo esc_url( $category_link ); ?>">
			<?php echo esc_html( $button_text ); ?>
		</a>
	</footer>

</section>
