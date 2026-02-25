import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  TextControl,
  __experimentalUnitControl as UnitControl,
  __experimentalUseCustomUnits as useCustomUnits,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const TEMPLATE = [
  [ 'core/group', { metadata: { name: __( 'Main', 'vh-wp-blocks' ) }, templateLock: false } ],
  [ 'core/group', { metadata: { name: __( 'Sidebar', 'vh-wp-blocks' ) }, templateLock: false } ],
];

export default function Edit( { attributes, setAttributes } ) {
  const { sidebarWidth, columnsTemplate } = attributes;
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
            disabled={ !! columnsTemplate }
            __next40pxDefaultSize
          />
          <TextControl
            label={ __( 'Columns template (CSS)', 'vh-wp-blocks' ) }
            value={ columnsTemplate }
            onChange={ ( value ) => setAttributes( { columnsTemplate: value } ) }
            placeholder="5fr minmax(300px, 2fr)"
            help={ __( 'Optional. A full grid-template-columns value. Overrides sidebar width when set.', 'vh-wp-blocks' ) }
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
