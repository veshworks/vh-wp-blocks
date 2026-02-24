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

$category_link  = get_category_link( $category_id );
$category_color = isset( $attributes['categoryColor'] ) ? sanitize_hex_color( $attributes['categoryColor'] ) : '';
$extra_attrs    = $category_color
  ? array(
    'class' => 'vh-category-section--has-color',
    'style' => "--category-color: {$category_color}",
  )
  : array();
$wrapper_attributes = get_block_wrapper_attributes( $extra_attrs );
$chevron_svg        = file_get_contents( __DIR__ . '/assets/chevron-right.svg' );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>

  <header>
    <div class="vh-category-section__title-row">
      <h2 class="vh-category-section__title"><?php echo esc_html( $category->name ); ?></h2>
      <a
        href="<?php echo esc_url( $category_link ); ?>"
        class="vh-category-section__view-all"
      >
        <span>
          <?php echo esc_html( $button_text ); ?>
        </span>
        <?php echo $chevron_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </a>
    </div>
    <hr class="vh-category-section__line">
  </header>

  <div class="vh-category-section__post-list">
    <?php foreach ( $posts as $post ) :
      setup_postdata( $post );
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
    <article class="vh-category-section__article">
      <?php if ( $thumb_url ) : ?>
        <a href="<?php echo esc_url( $permalink ); ?>">
          <img
            src="<?php echo esc_url( $thumb_url ); ?>"
            alt="<?php echo esc_attr( $title ); ?>"
            loading="lazy"
            class="vh-category-section__thumb"
          />
        </a>
      <?php endif; ?>

      <div class="vh-category-section__content">
        <h3 class="vh-category-section__article-title">
          <a href="<?php echo esc_url( $permalink ); ?>"><?php echo esc_html( $title ); ?></a>
        </h3>
        <time
          datetime="<?php echo esc_attr( $date_iso ); ?>"
          class="vh-category-section__article-time"
        >
          <?php echo esc_html( $date ); ?>
        </time>
        <?php if ( $excerpt ) : ?>
          <p><?php echo esc_html( $excerpt ); ?></p>
        <?php endif; ?>
      </div>
    </article>
    <?php endforeach;
    wp_reset_postdata(); ?>
  </div>

</section>
