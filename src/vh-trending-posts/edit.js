import './editor.scss';

import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  RangeControl,
  SelectControl,
  Spinner,
  TextareaControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

export default function Edit( { attributes, setAttributes, clientId } ) {
  const { postsCount, timeRange, blockId, customCSS } = attributes;

  useEffect( () => {
    if ( blockId !== clientId ) {
      setAttributes( { blockId: clientId } );
    }
  }, [] );

  const { posts, isLoadingPosts } = useSelect(
    ( select ) => {
      const store = select( 'core' );
      const query = {
        per_page: postsCount,
        _embed: true,
        orderby: 'date',
        order: 'desc',
      };
      return {
        posts: store.getEntityRecords( 'postType', 'post', query ),
        isLoadingPosts: store.isResolving( 'getEntityRecords', [
          'postType',
          'post',
          query,
        ] ),
      };
    },
    [ postsCount ]
  );

  const blockProps = useBlockProps( {
    className: 'vh-trending-posts',
    'data-block-id': clientId,
  } );

  const featuredPost = posts?.[ 0 ] ?? null;
  const listPosts = posts?.slice( 1 ) ?? [];

  const getImageUrl = ( post, size = 'large' ) => {
    const media = post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ];
    if ( ! media ) return null;
    return (
      media?.media_details?.sizes?.[ size ]?.source_url ??
      media?.source_url ??
      null
    );
  };

  const formatDate = ( dateString ) =>
    new Date( dateString ).toLocaleDateString( 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    } );

  return (
    <>
      { customCSS && (
        <style>{ `[data-block-id="${ clientId }"] { ${ customCSS } }` }</style>
      ) }
      <InspectorControls>
        <PanelBody
          title={ __( 'Trending Posts Settings', 'vh-wp-blocks' ) }
          initialOpen={ true }
        >
          <RangeControl
            label={ __( 'Number of posts', 'vh-wp-blocks' ) }
            value={ postsCount }
            onChange={ ( value ) => setAttributes( { postsCount: value } ) }
            min={ 1 }
            max={ 20 }
          />
          <SelectControl
            label={ __( 'Time range', 'vh-wp-blocks' ) }
            value={ timeRange }
            options={ [
              { label: __( 'Last 24 hours', 'vh-wp-blocks' ), value: '24h' },
              { label: __( 'Last 7 days', 'vh-wp-blocks' ), value: '7d' },
              { label: __( 'Last 30 days', 'vh-wp-blocks' ), value: '30d' },
              { label: __( 'All time', 'vh-wp-blocks' ), value: 'all' },
            ] }
            onChange={ ( value ) => setAttributes( { timeRange: value } ) }
            help={ __(
              'Time range only affects the frontend. Editor preview shows recent posts.',
              'vh-wp-blocks'
            ) }
          />
        </PanelBody>
        <PanelBody
          title={ __( 'Custom CSS', 'vh-wp-blocks' ) }
          initialOpen={ false }
        >
          <TextareaControl
            value={ customCSS }
            onChange={ ( value ) => setAttributes( { customCSS: value } ) }
            placeholder={ `.vh-trending-posts__featured {\n  border-radius: 8px;\n}` }
            rows={ 8 }
            help={ __(
              'CSS is scoped to this block instance. Use .vh-trending-posts as the root selector.',
              'vh-wp-blocks'
            ) }
          />
        </PanelBody>
      </InspectorControls>

      <section { ...blockProps }>
        { isLoadingPosts || posts === null ? (
          <div className="vh-trending-posts__loading">
            <Spinner />
          </div>
        ) : posts.length === 0 ? (
          <p className="vh-trending-posts__empty">
            { __( 'No posts found.', 'vh-wp-blocks' ) }
          </p>
        ) : (
          <>
            { featuredPost && (
              <article className="vh-trending-posts__featured">
                <div className="vh-trending-posts__featured-link">
                  { getImageUrl( featuredPost ) && (
                    <div className="vh-trending-posts__featured-media">
                      <img
                        src={ getImageUrl( featuredPost ) }
                        alt={ featuredPost._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]?.alt_text || '' }
                        className="vh-trending-posts__featured-img"
                      />
                    </div>
                  ) }
                  <div className="vh-trending-posts__featured-content">
                    <h2
                      className="vh-trending-posts__featured-title"
                      dangerouslySetInnerHTML={ {
                        __html: featuredPost.title?.rendered ?? '',
                      } }
                    />
                    <time className="vh-trending-posts__featured-date">
                      { formatDate( featuredPost.date ) }
                    </time>
                    { featuredPost.excerpt?.rendered && (
                      <p
                        className="vh-trending-posts__featured-excerpt"
                        dangerouslySetInnerHTML={ {
                          __html: featuredPost.excerpt.rendered,
                        } }
                      />
                    ) }
                  </div>
                </div>
              </article>
            ) }

            { listPosts.length > 0 && (
              <div className="vh-trending-posts__list">
                { listPosts.map( ( post ) => (
                  <div key={ post.id } className="vh-trending-posts__item">
                    { getImageUrl( post, 'thumbnail' ) && (
                      <div className="vh-trending-posts__item-thumb-link">
                        <img
                          src={ getImageUrl( post, 'thumbnail' ) }
                          alt={ post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]?.alt_text || '' }
                          className="vh-trending-posts__item-img"
                        />
                      </div>
                    ) }
                    <div className="vh-trending-posts__item-content">
                      <h3
                        className="vh-trending-posts__item-title"
                        dangerouslySetInnerHTML={ {
                          __html: post.title?.rendered ?? '',
                        } }
                      />
                      <time className="vh-trending-posts__item-date">
                        { formatDate( post.date ) }
                      </time>
                    </div>
                  </div>
                ) ) }
              </div>
            ) }
          </>
        ) }
      </section>
    </>
  );
}
