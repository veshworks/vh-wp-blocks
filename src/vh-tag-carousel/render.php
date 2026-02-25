<?php
$filter_mode      = isset( $attributes['filterMode'] ) ? $attributes['filterMode'] : 'recent';
$caption_position = isset( $attributes['captionPosition'] ) ? $attributes['captionPosition'] : 'below';
$aspect_ratio     = isset( $attributes['aspectRatio'] ) ? $attributes['aspectRatio'] : '4/3';
$show_category = ! empty( $attributes['showCategory'] );
$block_id      = isset( $attributes['blockId'] ) ? $attributes['blockId'] : '';
$custom_css    = isset( $attributes['customCSS'] ) ? $attributes['customCSS'] : '';
$tag_ids       = isset( $attributes['tagIds'] ) ? array_map( 'absint', $attributes['tagIds'] ) : array();
$posts_count = isset( $attributes['postsCount'] ) ? absint( $attributes['postsCount'] ) : 6;

$query_args = array(
  'posts_per_page' => $posts_count,
  'post_status'    => 'publish',
  'orderby'        => 'date',
  'order'          => 'DESC',
);

if ( 'tag' === $filter_mode && ! empty( $tag_ids ) ) {
  $query_args['tag__in'] = $tag_ids;
}

$posts = get_posts( $query_args );

if ( empty( $posts ) ) {
  return;
}

$wrapper_attributes = get_block_wrapper_attributes( array(
  'class'          => 'vh-tag-carousel',
  'style'          => '--card-aspect-ratio: ' . esc_attr( $aspect_ratio ) . ';',
  'data-block-id'  => esc_attr( $block_id ),
) );
?>
<?php if ( $block_id && $custom_css ) : ?>
  <style>[data-block-id="<?php echo esc_attr( $block_id ); ?>"] { <?php echo wp_strip_all_tags( $custom_css ); ?> }</style>
<?php endif; ?>
<div <?php echo $wrapper_attributes; ?>>
  <div
    class="vh-tag-carousel__viewport"
    role="region"
    aria-label="<?php esc_attr_e( 'Posts carousel', 'vh-wp-blocks' ); ?>"
  >
    <div class="vh-tag-carousel__track">
      <?php foreach ( $posts as $post ) :
        $thumb_id  = get_post_thumbnail_id( $post->ID );
        $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'large' ) : '';
        $thumb_alt = $thumb_id ? get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';
        $date_iso   = get_the_date( 'c', $post );
        $date_fmt   = get_the_date( 'M j, Y', $post );
        $permalink  = get_permalink( $post->ID );
        $categories = $show_category ? get_the_category( $post->ID ) : array();
        $category   = ! empty( $categories ) ? $categories[0] : null;
      ?>
      <article class="vh-tag-carousel__card<?php echo 'overlay' === $caption_position ? ' vh-tag-carousel__card--overlay' : ''; ?>">
        <a
          href="<?php echo esc_url( $permalink ); ?>"
          class="vh-tag-carousel__card-link"
          tabindex="-1"
          aria-hidden="true"
        >
          <div class="vh-tag-carousel__card-thumb">
            <?php if ( $thumb_url ) : ?>
              <img
                src="<?php echo esc_url( $thumb_url ); ?>"
                alt="<?php echo esc_attr( $thumb_alt ); ?>"
                class="vh-tag-carousel__card-img"
                loading="lazy"
                decoding="async"
              />
            <?php else : ?>
              <div class="vh-tag-carousel__card-placeholder"></div>
            <?php endif; ?>
          </div>
        </a>
        <div class="vh-tag-carousel__card-body">
          <?php if ( $show_category && $category ) : ?>
            <span class="vh-tag-carousel__card-category">
              <?php echo esc_html( $category->name ); ?>
            </span>
          <?php endif; ?>
          <h3 class="vh-tag-carousel__card-title">
            <a href="<?php echo esc_url( $permalink ); ?>">
              <?php echo esc_html( get_the_title( $post ) ); ?>
            </a>
          </h3>
          <time
            class="vh-tag-carousel__card-date"
            datetime="<?php echo esc_attr( $date_iso ); ?>"
          >
            <?php echo esc_html( $date_fmt ); ?>
          </time>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
  </div>

  <button
    class="vh-tag-carousel__arrow vh-tag-carousel__arrow--prev"
    aria-label="<?php esc_attr_e( 'Previous', 'vh-wp-blocks' ); ?>"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  </button>

  <button
    class="vh-tag-carousel__arrow vh-tag-carousel__arrow--next"
    aria-label="<?php esc_attr_e( 'Next', 'vh-wp-blocks' ); ?>"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  </button>
</div>
