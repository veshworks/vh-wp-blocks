import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	TextControl,
	Spinner,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

import './editor.scss';

function SkeletonCard() {
	return (
		<div className="vh-cs__card vh-cs__card--skeleton">
			<div className="vh-cs__card-thumb vh-cs__skel-block" />
			<div className="vh-cs__card-body">
				<div className="vh-cs__skel-line vh-cs__skel-line--xs" />
				<div className="vh-cs__skel-line vh-cs__skel-line--lg" />
				<div className="vh-cs__skel-line vh-cs__skel-line--md" />
				<div className="vh-cs__skel-line vh-cs__skel-line--sm" />
			</div>
		</div>
	);
}

function ThumbPlaceholder() {
	return (
		<svg
			className="vh-cs__card-thumb-icon"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1"
			aria-hidden="true"
		>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<circle cx="8.5" cy="8.5" r="1.5" />
			<path d="M21 15l-5-5L5 21" />
		</svg>
	);
}

function ArrowIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<line x1="5" y1="12" x2="19" y2="12" />
			<polyline points="12 5 19 12 12 19" />
		</svg>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { categoryId, postsCount, buttonText } = attributes;

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

	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Category Settings', 'vh-wp-blocks' ) }
					initialOpen={ true }
				>
					{ ! categories ? (
						<div className="vh-cs__inspector-loading">
							<Spinner />
							<span>{ __( 'Loading categories…', 'vh-wp-blocks' ) }</span>
						</div>
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
			</InspectorControls>

			<section { ...blockProps }>
				<div className="vh-cs__inner">
					{ /* ── Header ── */ }
					<header className="vh-cs__header">
						<div className="vh-cs__eyebrow">
							<span>{ __( 'Featured', 'vh-wp-blocks' ) }</span>
						</div>
						{ selectedCategory ? (
							<>
								<p className="vh-cs__category-label">
									{ __( 'Category', 'vh-wp-blocks' ) }
								</p>
								<h2 className="vh-cs__title">
									{ selectedCategory.name }
								</h2>
								{ selectedCategory.description && (
									<p className="vh-cs__description">
										{ selectedCategory.description }
									</p>
								) }
							</>
						) : (
							<>
								<div className="vh-cs__skel-line vh-cs__skel-line--label" />
								<div className="vh-cs__skel-line vh-cs__skel-line--title" />
							</>
						) }
					</header>

					{ /* ── Grid ── */ }
					{ isEmpty ? (
						<p className="vh-cs__empty">
							{ __( 'No posts found in this category.', 'vh-wp-blocks' ) }
						</p>
					) : (
						<div className="vh-cs__grid">
							{ isReady
								? posts.map( ( post ) => (
										<article key={ post.id } className="vh-cs__card">
											<div className="vh-cs__card-thumb">
												{ featuredImages[ post.id ] ? (
													<img
														className="vh-cs__card-img"
														src={ featuredImages[ post.id ] }
														alt={ post.title?.rendered ?? '' }
													/>
												) : (
													<ThumbPlaceholder />
												) }
											</div>
											<div className="vh-cs__card-body">
												<time className="vh-cs__card-date">
													{ new Date(
														post.date
													).toLocaleDateString( 'en-US', {
														month: 'short',
														day: 'numeric',
														year: 'numeric',
													} ) }
												</time>
												<h3
													className="vh-cs__card-title"
													dangerouslySetInnerHTML={ {
														__html: post.title?.rendered ?? '',
													} }
												/>
												<div
													className="vh-cs__card-excerpt"
													dangerouslySetInnerHTML={ {
														__html: post.excerpt?.rendered ?? '',
													} }
												/>
											</div>
										</article>
								  ) )
								: Array.from( { length: postsCount }, ( _, i ) => (
										<SkeletonCard key={ i } />
								  ) ) }
						</div>
					) }

					{ /* ── CTA preview ── */ }
					<footer className="vh-cs__footer">
						<div className="vh-cs__cta vh-cs__cta--preview">
							<span>{ buttonText || __( 'View all posts', 'vh-wp-blocks' ) }</span>
							<ArrowIcon />
						</div>
					</footer>
				</div>
			</section>
		</>
	);
}
