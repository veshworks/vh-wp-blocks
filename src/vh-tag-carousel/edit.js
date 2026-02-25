import './editor.scss';

import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  CheckboxControl,
  RadioControl,
  RangeControl,
  SelectControl,
  Spinner,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

export default function Edit( { attributes, setAttributes } ) {
  const { filterMode, captionPosition, aspectRatio, tagIds, postsCount } = attributes;
  const tagIdsKey = tagIds.join( ',' );

  const { tags, isLoadingTags } = useSelect( ( select ) => {
    const store = select( 'core' );
    const query = { per_page: 100, hide_empty: true };
    return {
      tags: store.getEntityRecords( 'taxonomy', 'post_tag', query ),
      isLoadingTags: store.isResolving( 'getEntityRecords', [
        'taxonomy',
        'post_tag',
        query,
      ] ),
    };
  }, [] );

  const { posts, isLoadingPosts } = useSelect(
    ( select ) => {
      const store = select( 'core' );
      const query = {
        per_page: postsCount,
        _embed: true,
        ...( filterMode === 'tag' && tagIds.length > 0 ? { tags: tagIds } : {} ),
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
    [ filterMode, tagIdsKey, postsCount ]
  );

  const blockProps = useBlockProps( {
    className: 'vh-tag-carousel',
    style: { '--card-aspect-ratio': aspectRatio },
  } );

  const toggleTag = ( tagId, checked ) => {
    setAttributes( {
      tagIds: checked
        ? [ ...tagIds, tagId ]
        : tagIds.filter( ( id ) => id !== tagId ),
    } );
  };

  return (
    <>
      <InspectorControls>
        <PanelBody title={ __( 'Settings', 'vh-wp-blocks' ) }>
          <RadioControl
            label={ __( 'Post source', 'vh-wp-blocks' ) }
            selected={ filterMode }
            options={ [
              { label: __( 'Most recent', 'vh-wp-blocks' ), value: 'recent' },
              { label: __( 'Filter by tag', 'vh-wp-blocks' ), value: 'tag' },
            ] }
            onChange={ ( value ) => setAttributes( { filterMode: value } ) }
          />
          <SelectControl
            label={ __( 'Caption position', 'vh-wp-blocks' ) }
            value={ captionPosition }
            options={ [
              { label: __( 'Below image', 'vh-wp-blocks' ), value: 'below' },
              { label: __( 'Over image', 'vh-wp-blocks' ), value: 'overlay' },
            ] }
            onChange={ ( value ) => setAttributes( { captionPosition: value } ) }
          />
          <SelectControl
            label={ __( 'Aspect ratio', 'vh-wp-blocks' ) }
            value={ aspectRatio }
            options={ [
              { label: __( 'Landscape (4:3)', 'vh-wp-blocks' ), value: '4/3' },
              { label: __( 'Portrait (3:5)', 'vh-wp-blocks' ), value: '3/5' },
            ] }
            onChange={ ( value ) => setAttributes( { aspectRatio: value } ) }
          />
          <RangeControl
            label={ __( 'Number of posts', 'vh-wp-blocks' ) }
            value={ postsCount }
            onChange={ ( value ) => setAttributes( { postsCount: value } ) }
            min={ 2 }
            max={ 12 }
          />
        </PanelBody>
        { filterMode === 'tag' && (
          <PanelBody title={ __( 'Filter by Tags', 'vh-wp-blocks' ) }>
            { isLoadingTags ? (
              <Spinner />
            ) : tags && tags.length > 0 ? (
              tags.map( ( tag ) => (
                <CheckboxControl
                  key={ tag.id }
                  label={ `${ tag.name } (${ tag.count })` }
                  checked={ tagIds.includes( tag.id ) }
                  onChange={ ( checked ) => toggleTag( tag.id, checked ) }
                />
              ) )
            ) : (
              <p>{ __( 'No tags found.', 'vh-wp-blocks' ) }</p>
            ) }
          </PanelBody>
        ) }
      </InspectorControls>

      <div { ...blockProps }>
        <div className="vh-tag-carousel__viewport">
          <div className="vh-tag-carousel__track">
            { isLoadingPosts ? (
              <div className="vh-tag-carousel__loading">
                <Spinner />
              </div>
            ) : posts && posts.length > 0 ? (
              posts.map( ( post ) => {
                const media =
                  post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ];
                const imageUrl =
                  media?.media_details?.sizes?.medium?.source_url ||
                  media?.source_url;
                const imageAlt = media?.alt_text || '';
                const date = new Date( post.date );
                const formattedDate = date.toLocaleDateString( 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                } );

                return (
                  <article
                    key={ post.id }
                    className={ `vh-tag-carousel__card${ captionPosition === 'overlay' ? ' vh-tag-carousel__card--overlay' : '' }` }
                  >
                    <div className="vh-tag-carousel__card-thumb">
                      { imageUrl ? (
                        <img
                          src={ imageUrl }
                          alt={ imageAlt }
                          className="vh-tag-carousel__card-img"
                        />
                      ) : (
                        <div className="vh-tag-carousel__card-placeholder" />
                      ) }
                    </div>
                    <div className="vh-tag-carousel__card-body">
                      <h3
                        className="vh-tag-carousel__card-title"
                        dangerouslySetInnerHTML={ {
                          __html: post.title.rendered,
                        } }
                      />
                      <time className="vh-tag-carousel__card-date">
                        { formattedDate }
                      </time>
                    </div>
                  </article>
                );
              } )
            ) : (
              <p className="vh-tag-carousel__empty">
                { filterMode === 'tag' && tagIds.length === 0
                  ? __(
                      'Select tags in the sidebar to filter posts.',
                      'vh-wp-blocks'
                    )
                  : __(
                      'No posts found.',
                      'vh-wp-blocks'
                    ) }
              </p>
            ) }
          </div>
        </div>
      </div>
    </>
  );
}
