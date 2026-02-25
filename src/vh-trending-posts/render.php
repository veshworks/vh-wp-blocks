<?php
/**
 * VH Trending Posts — Frontend Render Template.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block inner content (unused — dynamic block).
 * @var WP_Block $block      Block instance.
 */

global $wpdb;

$posts_count = absint( $attributes['postsCount'] ?? 5 );
$time_range  = sanitize_key( $attributes['timeRange'] ?? '7d' );
$block_id    = sanitize_key( $attributes['blockId'] ?? '' );
$custom_css  = $attributes['customCSS'] ?? '';

// Validate timeRange against whitelist and build safe SQL interval.
switch ( $time_range ) {
  case '24h':
    $interval_sql = 'INTERVAL 24 HOUR';
    break;
  case '30d':
    $interval_sql = 'INTERVAL 30 DAY';
    break;
  case 'all':
    $interval_sql = '';
    break;
  case '7d':
  default:
    $interval_sql = 'INTERVAL 7 DAY';
    break;
}

$collected_ids = array();
$posts         = array();

// ── Tier 1: WP Popular Posts ──────────────────────────────────────────────────
$wpp_table = $wpdb->prefix . 'popularpostssummary';
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
$table_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpp_table ) );

if ( $table_exists ) {
  if ( $interval_sql ) {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $wpp_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT postid, SUM(pageviews) as views
         FROM `{$wpp_table}`
         WHERE view_date >= DATE_SUB(NOW(), {$interval_sql})
         GROUP BY postid ORDER BY views DESC LIMIT %d",
        $posts_count
      )
    );
  } else {
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $wpp_rows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT postid, SUM(pageviews) as views
         FROM `{$wpp_table}`
         GROUP BY postid ORDER BY views DESC LIMIT %d",
        $posts_count
      )
    );
  }

  if ( ! empty( $wpp_rows ) ) {
    $wpp_ids = array_map( 'absint', wp_list_pluck( $wpp_rows, 'postid' ) );
    $wpp_posts = get_posts( array(
      'post__in'   => $wpp_ids,
      'orderby'    => 'post__in',
      'numberposts' => count( $wpp_ids ),
      'post_status' => 'publish',
    ) );

    foreach ( $wpp_posts as $p ) {
      $collected_ids[] = $p->ID;
      $posts[]         = $p;
    }
  }
}

// ── Tier 2: Comments fallback ─────────────────────────────────────────────────
$needed = $posts_count - count( $posts );
if ( $needed > 0 ) {
  $not_in_clause = '';
  if ( ! empty( $collected_ids ) ) {
    $placeholders  = implode( ', ', array_fill( 0, count( $collected_ids ), '%d' ) );
    $not_in_clause = $wpdb->prepare( "AND p.ID NOT IN ($placeholders)", $collected_ids );
  }

  $date_clause = '';
  if ( $interval_sql ) {
    $date_clause = "AND c.comment_date > DATE_SUB(NOW(), {$interval_sql})";
  }

  // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
  $comment_rows = $wpdb->get_results(
    $wpdb->prepare(
      "SELECT p.ID, COUNT(c.comment_ID) as comment_count
       FROM {$wpdb->posts} p
       JOIN {$wpdb->comments} c ON c.comment_post_ID = p.ID
       WHERE c.comment_approved = '1'
         {$date_clause}
         AND p.post_status = 'publish'
         AND p.post_type = 'post'
         {$not_in_clause}
       GROUP BY p.ID ORDER BY comment_count DESC LIMIT %d",
      $needed
    )
  );

  if ( ! empty( $comment_rows ) ) {
    $comment_ids   = array_map( 'absint', wp_list_pluck( $comment_rows, 'ID' ) );
    $comment_posts = get_posts( array(
      'post__in'    => $comment_ids,
      'orderby'     => 'post__in',
      'numberposts' => count( $comment_ids ),
      'post_status' => 'publish',
    ) );

    foreach ( $comment_posts as $p ) {
      $collected_ids[] = $p->ID;
      $posts[]         = $p;
    }
  }
}

// ── Tier 3: Recent posts fill ─────────────────────────────────────────────────
$needed = $posts_count - count( $posts );
if ( $needed > 0 ) {
  $fill_args = array(
    'numberposts' => $needed,
    'post_status' => 'publish',
    'orderby'     => 'date',
    'order'       => 'DESC',
  );
  if ( ! empty( $collected_ids ) ) {
    $fill_args['post__not_in'] = $collected_ids;
  }
  $fill_posts = get_posts( $fill_args );
  $posts      = array_merge( $posts, $fill_posts );
}

if ( empty( $posts ) ) {
  return;
}

$wrapper_attributes = get_block_wrapper_attributes( array(
  'class'         => 'vh-trending-posts',
  'data-block-id' => esc_attr( $block_id ),
) );

$featured_post = $posts[0];
$list_posts    = array_slice( $posts, 1 );
?>
<?php if ( $block_id && $custom_css ) : ?>
  <style>[data-block-id="<?php echo esc_attr( $block_id ); ?>"] { <?php echo wp_strip_all_tags( $custom_css ); ?> }</style>
<?php endif; ?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>

  <?php
  // ── Featured post ───────────────────────────────────────────────────────────
  $feat_id      = $featured_post->ID;
  $feat_title   = get_the_title( $feat_id );
  $feat_link    = get_permalink( $feat_id );
  $feat_date    = get_the_date( '', $feat_id );
  $feat_iso     = get_the_date( 'c', $feat_id );
  $feat_excerpt = $featured_post->post_excerpt
    ? $featured_post->post_excerpt
    : wp_trim_words( wp_strip_all_tags( $featured_post->post_content ), 30 );
  $feat_thumb   = get_post_thumbnail_id( $feat_id );
  $feat_img_url = $feat_thumb ? wp_get_attachment_image_url( $feat_thumb, 'large' ) : '';
  $feat_img_alt = $feat_thumb ? get_post_meta( $feat_thumb, '_wp_attachment_image_alt', true ) : '';
  ?>
  <article class="vh-trending-posts__featured">
    <a href="<?php echo esc_url( $feat_link ); ?>" class="vh-trending-posts__featured-link">
      <?php if ( $feat_img_url ) : ?>
        <div class="vh-trending-posts__featured-media">
          <img
            src="<?php echo esc_url( $feat_img_url ); ?>"
            alt="<?php echo esc_attr( $feat_img_alt ); ?>"
            class="vh-trending-posts__featured-img"
            loading="eager"
            decoding="async"
          />
        </div>
      <?php endif; ?>
      <div class="vh-trending-posts__featured-content">
        <h2 class="vh-trending-posts__featured-title">
          <?php echo esc_html( $feat_title ); ?>
        </h2>
        <time
          class="vh-trending-posts__featured-date"
          datetime="<?php echo esc_attr( $feat_iso ); ?>"
        >
          <?php echo esc_html( $feat_date ); ?>
        </time>
        <?php if ( $feat_excerpt ) : ?>
          <p class="vh-trending-posts__featured-excerpt">
            <?php echo esc_html( $feat_excerpt ); ?>
          </p>
        <?php endif; ?>
      </div>
    </a>
  </article>

  <?php if ( ! empty( $list_posts ) ) : ?>
    <div class="vh-trending-posts__list">
      <?php foreach ( $list_posts as $post ) :
        $post_id    = $post->ID;
        $post_title = get_the_title( $post_id );
        $post_link  = get_permalink( $post_id );
        $post_date  = get_the_date( '', $post_id );
        $post_iso   = get_the_date( 'c', $post_id );
        $thumb_id   = get_post_thumbnail_id( $post_id );
        $thumb_url  = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'thumbnail' ) : '';
        $thumb_alt  = $thumb_id ? get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';
      ?>
        <div class="vh-trending-posts__item">
          <?php if ( $thumb_url ) : ?>
            <a href="<?php echo esc_url( $post_link ); ?>" class="vh-trending-posts__item-thumb-link" tabindex="-1" aria-hidden="true">
              <img
                src="<?php echo esc_url( $thumb_url ); ?>"
                alt="<?php echo esc_attr( $thumb_alt ); ?>"
                class="vh-trending-posts__item-img"
                loading="lazy"
                decoding="async"
              />
            </a>
          <?php endif; ?>
          <div class="vh-trending-posts__item-content">
            <h3 class="vh-trending-posts__item-title">
              <a href="<?php echo esc_url( $post_link ); ?>">
                <?php echo esc_html( $post_title ); ?>
              </a>
            </h3>
            <time
              class="vh-trending-posts__item-date"
              datetime="<?php echo esc_attr( $post_iso ); ?>"
            >
              <?php echo esc_html( $post_date ); ?>
            </time>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

</section>
