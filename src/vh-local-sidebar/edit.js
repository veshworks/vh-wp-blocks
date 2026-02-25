import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  __experimentalUnitControl as UnitControl,
  __experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const TEMPLATE = [
  [ 'core/group', { metadata: { name: __( 'Main', 'vh-wp-blocks' ) }, templateLock: false } ],
  [ 'core/group', { metadata: { name: __( 'Sidebar', 'vh-wp-blocks' ) }, templateLock: false } ],
];

export default function Edit( { attributes, setAttributes } ) {
  const { sidebarWidth } = attributes;
  const blockProps = useBlockProps( { className: 'vh-local-sidebar' } );
  const units = useCustomUnits( { availableUnits: [ 'px', '%', 'em', 'rem' ] } );

  return (
    <>
      <InspectorControls>
        <PanelBody title={ __( 'Layout', 'vh-wp-blocks' ) }>
          <UnitControl
            label={ __( 'Sidebar width', 'vh-wp-blocks' ) }
            value={ sidebarWidth }
            onChange={ ( value ) => setAttributes( { sidebarWidth: value } ) }
            units={ units }
            __next40pxDefaultSize
          />
        </PanelBody>
      </InspectorControls>
      <div { ...blockProps }>
        <div className="vh-local-sidebar__layout">
          <InnerBlocks
            template={ TEMPLATE }
            templateLock="all"
          />
        </div>
      </div>
    </>
  );
}
