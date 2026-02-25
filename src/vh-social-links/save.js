import { useBlockProps } from '@wordpress/block-editor';
import { getPlatform } from './icons';

function SocialIcon( { platform } ) {
  const { path } = getPlatform( platform );
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="1em"
      height="1em"
      aria-hidden="true"
    >
      <path d={ path } />
    </svg>
  );
}

export default function save( { attributes } ) {
  const { links, blockId, customCSS } = attributes;
  const blockProps = useBlockProps.save( { 'data-block-id': blockId } );

  return (
    <>
      { blockId && customCSS && (
        <style>{ `[data-block-id="${ blockId }"] { ${ customCSS } }` }</style>
      ) }
      <ul { ...blockProps }>
      { links
        .filter( ( link ) => link.url )
        .map( ( link ) => (
          <li key={ link.id } className="vh-social-links__item">
            <a
              href={ link.url }
              target="_blank"
              rel="noopener noreferrer"
              className="vh-social-links__link"
              aria-label={ getPlatform( link.platform ).label }
            >
              <span className="vh-social-links__icon">
                <SocialIcon platform={ link.platform } />
              </span>
              <span className="vh-social-links__name">
                { getPlatform( link.platform ).label }
              </span>
            </a>
          </li>
        ) ) }
      </ul>
    </>
  );
}
