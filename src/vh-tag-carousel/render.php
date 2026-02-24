<?php
$tag_ids     = isset( $attributes['tagIds'] ) ? array_map( 'absint', $attributes['tagIds'] ) : array();
$posts_count = isset( $attributes['postsCount'] ) ? absint( $attributes['postsCount'] ) : 6;

$query_args = array(
  'posts_per_page' => $posts_count,
  'post_status'    => 'publish',
  'orderby'        => 'date',
  'order'          => 'DESC',
);

if ( ! empty( $tag_ids ) ) {
  $query_args['tag__in'] = $tag_ids;
}

$posts = get_posts( $query_args );

if ( empty( $posts ) ) {
  return;
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'vh-tag-carousel' ) );
?>
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
        $date_iso  = get_the_date( 'c', $post );
        $date_fmt  = get_the_date( 'M j, Y', $post );
        $permalink = get_permalink( $post->ID );
      ?>
      <article class="vh-tag-carousel__card">
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
