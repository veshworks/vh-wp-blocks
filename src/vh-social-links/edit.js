import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  SelectControl,
  TextControl,
  TextareaControl,
  Button,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { PLATFORM_OPTIONS, getPlatform } from './icons';

function uid() {
  return Date.now().toString( 36 ) + Math.random().toString( 36 ).slice( 2 );
}

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

export default function Edit( { attributes, setAttributes, clientId } ) {
  const { links, blockId, customCSS } = attributes;

  useEffect( () => {
    if ( blockId !== clientId ) {
      setAttributes( { blockId: clientId } );
    }
  }, [] );

  const blockProps = useBlockProps( { 'data-block-id': clientId } );

  function addLink() {
    setAttributes( {
      links: [ ...links, { id: uid(), platform: 'website', url: '' } ],
    } );
  }

  function updateLink( id, patch ) {
    setAttributes( {
      links: links.map( ( link ) =>
        link.id === id ? { ...link, ...patch } : link
      ),
    } );
  }

  function removeLink( id ) {
    setAttributes( {
      links: links.filter( ( link ) => link.id !== id ),
    } );
  }

  return (
    <>
      { customCSS && (
        <style>{ `[data-block-id="${ clientId }"] { ${ customCSS } }` }</style>
      ) }
      <InspectorControls>
        <PanelBody
          title={ __( 'Social Links', 'vh-wp-blocks' ) }
          initialOpen={ true }
        >
          { links.map( ( link ) => (
            <div key={ link.id } className="vh-social-links__inspector-row">
              <SelectControl
                label={ __( 'Platform', 'vh-wp-blocks' ) }
                value={ link.platform }
                options={ PLATFORM_OPTIONS }
                onChange={ ( val ) => updateLink( link.id, { platform: val } ) }
              />
              <TextControl
                label={ __( 'URL', 'vh-wp-blocks' ) }
                value={ link.url }
                type="url"
                onChange={ ( val ) => updateLink( link.id, { url: val } ) }
              />
              <Button
                variant="secondary"
                isDestructive
                onClick={ () => removeLink( link.id ) }
              >
                { __( 'Remove', 'vh-wp-blocks' ) }
              </Button>
            </div>
          ) ) }
          <Button variant="primary" onClick={ addLink }>
            { __( 'Add social link', 'vh-wp-blocks' ) }
          </Button>
        </PanelBody>
        <PanelBody title={ __( 'Custom CSS', 'vh-wp-blocks' ) } initialOpen={ false }>
          <TextareaControl
            value={ customCSS }
            onChange={ ( value ) => setAttributes( { customCSS: value } ) }
            placeholder={ `.vh-social-links__item {\n  gap: 1em;\n}` }
            rows={ 8 }
            help={ __( 'CSS is scoped to this block instance. Use .vh-social-links as the root selector.', 'vh-wp-blocks' ) }
          />
        </PanelBody>
      </InspectorControls>

      <ul { ...blockProps }>
        { links.length === 0 && (
          <li className="vh-social-links__placeholder">
            { __(
              'Add social links from the block settings panel.',
              'vh-wp-blocks'
            ) }
          </li>
        ) }
        { links.map( ( link ) => (
          <li key={ link.id } className="vh-social-links__item">
            <span className="vh-social-links__icon">
              <SocialIcon platform={ link.platform } />
            </span>
            <span className="vh-social-links__name">
              { getPlatform( link.platform ).label }
            </span>
          </li>
        ) ) }
      </ul>
    </>
  );
}
