import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  SelectControl,
  RangeControl,
  TextControl,
  Spinner,
  ColorPalette,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

export default function Edit( { attributes, setAttributes } ) {
  const { categoryId, postsCount, buttonText, categoryColor } = attributes;

  const categories = useSelect( ( select ) => {
    return select( coreDataStore ).getEntityRecords( 'taxonomy', 'category', {
      per_page: -1,
      hide_empty: true,
    } );
  }, [] );

  const posts = useSelect(
    ( select ) => {
      if ( ! categoryId ) return null;
      return select( coreDataStore ).getEntityRecords( 'postType', 'post', {
        categories: categoryId,
        per_page: postsCount,
        status: 'publish',
      } );
    },
    [ categoryId, postsCount ]
  );

  const featuredImages = useSelect(
    ( select ) => {
      if ( ! posts?.length ) return {};
      return Object.fromEntries(
        posts
          .filter( ( post ) => post.featured_media )
          .flatMap( ( post ) => {
            const media = select( coreDataStore ).getEntityRecord(
              'root',
              'media',
              post.featured_media
            );
            const src =
              media?.media_details?.sizes?.medium_large
                ?.source_url ?? media?.source_url ?? null;
            return src ? [ [ post.id, src ] ] : [];
          } )
      );
    },
    [ posts ]
  );

  const selectedCategory = categories?.find( ( c ) => c.id === categoryId );

  const categoryOptions = [
    { value: 0, label: __( '— Select a category —', 'vh-wp-blocks' ) },
    ...( categories?.map( ( c ) => ( { value: c.id, label: c.name } ) ) ?? [] ),
  ];

  const isReady = !! categoryId && Array.isArray( posts ) && posts.length > 0;
  const isEmpty = !! categoryId && Array.isArray( posts ) && posts.length === 0;

  const blockProps = useBlockProps( {
    style: categoryColor ? { '--category-color': categoryColor } : undefined,
    className: categoryColor ? 'vh-category-section--has-color' : undefined,
  } );

  return (
    <>
      <InspectorControls>
        <PanelBody
          title={ __( 'Category Settings', 'vh-wp-blocks' ) }
          initialOpen={ true }
        >
          { ! categories ? (
            <Spinner />
          ) : (
            <SelectControl
              label={ __( 'Category', 'vh-wp-blocks' ) }
              value={ categoryId }
              options={ categoryOptions }
              onChange={ ( val ) =>
                setAttributes( { categoryId: parseInt( val, 10 ) } )
              }
              help={ __(
                'Posts from this category will be displayed.',
                'vh-wp-blocks'
              ) }
            />
          ) }
          <RangeControl
            label={ __( 'Number of posts', 'vh-wp-blocks' ) }
            value={ postsCount }
            onChange={ ( val ) => setAttributes( { postsCount: val } ) }
            min={ 1 }
            max={ 12 }
          />
          <TextControl
            label={ __( 'Button text', 'vh-wp-blocks' ) }
            value={ buttonText }
            onChange={ ( val ) => setAttributes( { buttonText: val } ) }
          />
        </PanelBody>
        <PanelBody
          title={ __( 'Appearance', 'vh-wp-blocks' ) }
          initialOpen={ false }
        >
          <ColorPalette
            label={ __( 'Category color', 'vh-wp-blocks' ) }
            colors={ categoryColor ? [ { name: __( 'Category color', 'vh-wp-blocks' ), color: categoryColor } ] : [] }
            value={ categoryColor }
            onChange={ ( val ) =>
              setAttributes( { categoryColor: val ?? '' } )
            }
          />
        </PanelBody>
      </InspectorControls>

      <section { ...blockProps }>
        <header>
          <div className="vh-category-section__title-row">
            <h2 className="vh-category-section__title">
              { selectedCategory?.name }
            </h2>
            <span className="vh-category-section__view-all">
              <span>Ver Todos</span>
            </span>
          </div>
          <hr className="vh-category-section__line" />
        </header>

        { isEmpty && (
          <p>{ __( 'No posts found in this category.', 'vh-wp-blocks' ) }</p>
        ) }

        { ! isEmpty && (
          <div className="vh-category-section__post-list">
            { isReady ? (
              posts.map( ( post ) => (
                <article key={ post.id } className="vh-category-section__article">
                  { featuredImages[ post.id ] && (
                    <img
                      src={ featuredImages[ post.id ] }
                      alt={ post.title?.rendered ?? '' }
                      className="vh-category-section__thumb"
                    />
                  ) }
                  <div className="vh-category-section__content">
                    <h3
                      className="vh-category-section__article-title"
                      dangerouslySetInnerHTML={ {
                        __html: post.title?.rendered ?? '',
                      } }
                    />
                    <time className="vh-category-section__article-time">
                      { new Date( post.date ).toLocaleDateString( 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      } ) }
                    </time>
                    { post.excerpt?.rendered && (
                      <p dangerouslySetInnerHTML={ {
                        __html: post.excerpt.rendered,
                      } } />
                    ) }
                  </div>
                </article>
              ) )
            ) : (
              <Spinner />
            ) }
          </div>
        ) }
      </section>
    </>
  );
}
